import { NextRequest, NextResponse } from 'next/server'
import { fetchEnhancedHotels, fetchEnhancedRestaurants } from '@/lib/enhanced-places-api'
import { fetchGoogleHotels, fetchGoogleRestaurants } from '@/lib/google-places'
import { generateCountrySpecificActivities } from '@/lib/country-activities-generator'
import { getBestCity } from '@/lib/destination-enhancer'
import { getCountryCode } from '@/lib/destination-image-generator'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Helpers
function getDatesBetween(start: string, end: string): string[] {
  const dates: string[] = []
  const cur = new Date(start)
  const last = new Date(end)
  while (cur <= last) {
    dates.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

// Map interest labels → activity categories the generator understands
const INTEREST_TO_CATEGORY: Record<string, string> = {
  Adventure: 'adventure',
  Culture:   'cultural',
  Beaches:   'nature',
  Food:      'food',
  Nature:    'nature',
  Luxury:    'night',
  Nightlife: 'night',
}

// Rough cost per day extracted from estimatedBudget strings like "€25-35" or "$50-100"
function parseCost(budgetStr: string): number {
  const match = budgetStr.match(/\d+/)
  return match ? parseInt(match[0], 10) : 40
}

// Safe Unsplash fallback (static, avoids the deprecated source.unsplash.com)
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80'

// Route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      countryCode: rawCode,
      countryName,
      city:        cityOverride,
      budget = 'medium',
      travelDates,
      interests = [] as string[],
    } = body

    if (!countryName) {
      return NextResponse.json({ error: 'countryName is required' }, { status: 400 })
    }

    // Resolve country code — getBestCity expects uppercase (e.g. "FR")
    const countryCode: string = (rawCode || getCountryCode(countryName) || 'US').toUpperCase()

    // Resolve best city for the budget + profile
    const city = cityOverride || getBestCity(countryCode, {}, budget).cityName

    // Normalize budget to Foursquare-compatible levels
    const budgetLevel =
      budget === 'low' || budget === 'budget'   ? 'budget'    :
      budget === 'luxury' || budget === 'high'  ? 'luxury'    :
                                                  'mid-range'

    // Fetch real hotels, restaurants, and country-specific activities in parallel
    const preferenceCategories = interests
      .map((i: string) => INTEREST_TO_CATEGORY[i] ?? 'cultural')
      .filter(Boolean)

    // Places: Google → Foursquare → country-specific generated data (cascading fallbacks)
    const [hotels, restaurants, rawActivities] = await Promise.all([
      fetchGoogleHotels(city, budgetLevel)
        .then(r => r.length > 0 ? r : fetchEnhancedHotels())
        .catch(() => fetchEnhancedHotels().catch(() => [])),
      fetchGoogleRestaurants(city, budgetLevel)
        .then(r => r.length > 0 ? r : fetchEnhancedRestaurants())
        .catch(() => fetchEnhancedRestaurants().catch(() => [])),
      Promise.resolve(
        generateCountrySpecificActivities(countryName, preferenceCategories.length > 0 ? preferenceCategories : ['cultural', 'nature'])
      ),
    ])

    const activities = rawActivities.slice(0, 21) // up to 21 for long trips (7 days × 3)

    // Build day plans
    const today = new Date().toISOString().split('T')[0]
    const weekLater = new Date(Date.now() + 7 * 86_400_000).toISOString().split('T')[0]
    const startDate = travelDates?.start ?? today
    const endDate   = travelDates?.end   ?? weekLater
    const dates     = getDatesBetween(startDate, endDate)

    // Day themes cycle through preferences then generic fallbacks
    const THEMES = [
      'Arrival & Exploration',
      'Culture & Heritage',
      'Adventure Day',
      'Food & Flavours',
      'Hidden Gems',
      'Relaxation & Wellness',
      'Local Life',
    ]

    const days = dates.map((date, dayIdx) => {
      // Three activities per day (morning, afternoon, + 1 extra rotated)
      const act0 = activities[(dayIdx * 3)     % Math.max(activities.length, 1)]
      const act1 = activities[(dayIdx * 3 + 1) % Math.max(activities.length, 1)]
      const act2 = activities[(dayIdx * 3 + 2) % Math.max(activities.length, 1)]

      const restaurant = restaurants[dayIdx % Math.max(restaurants.length, 1)]
      const hotel      = hotels[dayIdx % Math.max(hotels.length, 1)]

      const dayActivities = [act0, act1, act2].filter(Boolean).map((act, i) => ({
        id:          `day${dayIdx + 1}-act${i}`,
        title:       act.name,
        description: act.description,
        duration:    act.duration,
        cost:        act.estimatedBudget,
        category:    act.category,
        imageUrl:    act.image ?? FALLBACK_IMG,
      }))

      if (restaurant) {
        dayActivities.push({
          id:          `day${dayIdx + 1}-dinner`,
          title:       `Dinner at ${restaurant.name}`,
          description: restaurant.description || `${restaurant.cuisine} cuisine`,
          duration:    '2 hours',
          cost:        restaurant.price,
          category:    'food',
          imageUrl:    restaurant.image ?? FALLBACK_IMG,
        })
      }

      const estimatedCost =
        dayActivities.slice(0, 3).reduce((sum, a) => sum + parseCost(a.cost), 0) +
        (restaurant ? parseCost(restaurant.price) : 30) +
        (hotel      ? parseCost(hotel.price)       : budgetLevel === 'luxury' ? 300 : budgetLevel === 'budget' ? 60 : 130)

      return {
        day:           dayIdx + 1,
        title:         `Day ${dayIdx + 1}: ${THEMES[dayIdx % THEMES.length]}`,
        date,
        activities:    dayActivities,
        imageUrl:      act0?.image ?? FALLBACK_IMG,
        estimatedCost,
      }
    })

    const totalEstimatedCost = days.reduce((s, d) => s + d.estimatedCost, 0)

    return NextResponse.json({
      id:                 `itin-${Date.now()}`,
      destination:        countryName,
      city,
      startDate,
      endDate,
      totalDays:          dates.length,
      budget,
      days,
      totalEstimatedCost,
      createdAt:          new Date().toISOString(),
      // Also expose raw data so the ItineraryGenerator can use them
      hotels:             hotels.slice(0, 8).map(h => ({
        name:        h.name,
        price:       h.price,
        description: h.description,
        image:       h.image,
      })),
      restaurants:        restaurants.slice(0, 8).map(r => ({
        name:    r.name,
        cuisine: r.cuisine,
        price:   r.price,
        description: r.description,
        image:   r.image,
      })),
      activities:         activities.slice(0, 10).map(a => ({
        name:        a.name,
        duration:    a.duration,
        description: a.description,
        image:       a.image,
      })),
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[itinerary] Error:', msg)
    return NextResponse.json({ error: 'Failed to generate itinerary', detail: msg }, { status: 500 })
  }
}
