/**
 * Generates unique images for different destination categories
 * Each category gets a different image with a unique prompt
 * No caching - always generates new images
 */

import { generateTravelImage } from "@/lib/replicate-generator"

// Unsplash fallback
const UNSPLASH_API = "https://api.unsplash.com/search/photos"

async function fetchUnsplashFallback(
  destination: string,
  category: ImageCategory
): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return null

  const QUERY_MAP: Record<ImageCategory, string> = {
    city:        `${destination} city travel`,
    nature:      `${destination} nature landscape`,
    activities:  `${destination} travel activities`,
    events:      `${destination} festival event`,
    restaurants: `${destination} food restaurant`,
    hotels:      `${destination} hotel accommodation`,
  }

  try {
    const url = new URL(UNSPLASH_API)
    url.searchParams.set("query",    QUERY_MAP[category] ?? `${destination} travel`)
    url.searchParams.set("per_page", "1")
    url.searchParams.set("orientation", "landscape")

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${key}` },
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = await res.json()
    return (data.results?.[0]?.urls?.regular as string) ?? null
  } catch {
    return null
  }
}

export type ImageCategory = "city" | "nature" | "activities" | "events" | "restaurants" | "hotels"

/**
 * Generate category-specific prompts based on destination
 */
function getCategoryPrompt(destination: string, category: ImageCategory): string {
  const basePrompts: Record<ImageCategory, string> = {
    city: `${destination} cityscape, iconic landmarks, urban architecture, street life, sunset lighting, ultra realistic travel photography, 4K`,
    nature: `Beautiful ${destination} nature, landscapes, mountains, forests, water views, scenic beauty, cinematic photography, outdoor adventure`,
    activities: `Tourist enjoying activities in ${destination}, outdoor recreation, adventure sports, lifestyle photography, happy travelers, realistic 4K`,
    events: `Vibrant festival or event in ${destination}, crowds, celebrations, night lights, entertainment, lively atmosphere, professional photography`,
    restaurants: `Authentic ${destination} cuisine, restaurant dining, gourmet food presentation, local dishes, fine dining, delicious food photography`,
    hotels: `Luxury hotel in ${destination}, elegant accommodation, resort amenities, beautiful interior design, hospitality, premium travel experience`,
  }
  
  return basePrompts[category] || basePrompts.city
}

/**
 * Generate a unique image for a specific category
 * Each call generates a new image - no caching
 * NO REUSING IMAGES - always generate fresh
 */
export async function generateCategoryImage(
  destination: string,
  category: ImageCategory
): Promise<string | null> {
  try {
    const prompt = getCategoryPrompt(destination, category)
    
    console.log(`CategoryImageGenerator: Generating ${category} image for ${destination}`)
    console.log(`CategoryImageGenerator: Using prompt: ${prompt}`)

    // Each image gets unique identifier to prevent caching
    const uniqueId = `${destination}-${category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const result = await generateTravelImage(uniqueId, prompt)
    
    if (result?.url) {
      console.log(` CategoryImageGenerator: ✓ Successfully generated ${category} image`)
      return result.url
    }

    console.warn(` CategoryImageGenerator: Replicate returned null — trying Unsplash fallback`)
    const unsplashUrl = await fetchUnsplashFallback(destination, category)
    if (unsplashUrl) {
      console.log(` CategoryImageGenerator: ✓ Unsplash fallback for ${category}`)
      return unsplashUrl
    }

    console.warn(` CategoryImageGenerator: ✗ All sources failed for ${category}`)
    return null
  } catch (error) {
    console.error(` CategoryImageGenerator: Error generating ${category} image:`, error)
    const unsplashUrl = await fetchUnsplashFallback(destination, category).catch(() => null)
    if (unsplashUrl) return unsplashUrl
    return null
  }
}

/**
 * Generate all category images for a destination
 * Returns object with image URL for each category
 * Each image is generated independently - NO SHARING
 */
export async function generateAllCategoryImages(
  destination: string
): Promise<Record<ImageCategory, string | null>> {
  const categories: ImageCategory[] = ["city", "nature", "activities", "events", "restaurants", "hotels"]
  
  console.log(`CategoryImageGenerator: Generating ALL category images for ${destination}`)
  console.log(` CategoryImageGenerator: Categories to generate: ${categories.join(", ")}`)
  
  const results = await Promise.allSettled(
    categories.map(cat => {
      console.log(`CategoryImageGenerator: Queuing ${cat} image generation...`)
      return generateCategoryImage(destination, cat)
    })
  )

  const imageMap: Record<ImageCategory, string | null> = {
    city: null,
    nature: null,
    activities: null,
    events: null,
    restaurants: null,
    hotels: null,
  }

  results.forEach((result, index) => {
    const category = categories[index]
    if (result.status === "fulfilled" && result.value) {
      imageMap[category] = result.value
      console.log(`CategoryImageGenerator: ✓ ${category} = ${result.value}`)
    } else if (result.status === "rejected") {
      console.error(`CategoryImageGenerator: ✗ ${category} generation rejected:`, result.reason)
    } else {
      console.warn(`CategoryImageGenerator: ✗ ${category} generation returned null`)
    }
  })

  console.log(`CategoryImageGenerator: Completed all image generation for ${destination}`)
  return imageMap
}
