/**
 * Enhanced Places — coordinate data and map-marker helpers.
 *
 * Foursquare has been removed.  Hotel and restaurant data now comes from:
 *   hotels      → lib/hotelbeds-client.ts  (HotelBeds Content API)
 *   restaurants → lib/google-places.ts     (Google Places Text Search)
 *
 * This file retains:
 *   • CITY_COORDINATES  — lat/lng for 100+ cities (used by the interactive map)
 *   • countryCityData   — country-level default coordinates
 *   • generateMapMarkers — builds map markers from real place data
 *   • Exported interfaces for backward compatibility
 */

// Interfaces
export interface EnhancedHotel {
  name:      string
  rating:    number
  price:     string
  priceLevel: "budget" | "mid-range" | "luxury"
  address:   string
  amenities: string[]
  image:     string
  location:  { lat: number; lng: number }
  description: string
}

export interface EnhancedRestaurant {
  name:      string
  rating:    number
  cuisine:   string
  priceLevel: "budget" | "mid-range" | "luxury"
  price:     string
  address:   string
  image:     string
  location:  { lat: number; lng: number }
  description: string
}

export interface MapMarker {
  id:       string
  name:     string
  type:     "hotel" | "restaurant" | "attraction"
  location: { lat: number; lng: number }
  info:     { rating?: number; price?: string; cuisine?: string }
}

// City-level coordinates (100+ cities)
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Spain
  Barcelona:        { lat: 41.3851,  lng: 2.1734   },
  Madrid:           { lat: 40.4168,  lng: -3.7038  },
  Seville:          { lat: 37.3891,  lng: -5.9845  },
  // France
  Paris:            { lat: 48.8566,  lng: 2.3522   },
  Nice:             { lat: 43.7102,  lng: 7.2620   },
  Lyon:             { lat: 45.7640,  lng: 4.8357   },
  // Italy
  Rome:             { lat: 41.9028,  lng: 12.4964  },
  Venice:           { lat: 45.4408,  lng: 12.3155  },
  Florence:         { lat: 43.7696,  lng: 11.2558  },
  // Japan
  Tokyo:            { lat: 35.6762,  lng: 139.6503 },
  Kyoto:            { lat: 35.0116,  lng: 135.7681 },
  Osaka:            { lat: 34.6937,  lng: 135.5023 },
  // Thailand
  Bangkok:          { lat: 13.7563,  lng: 100.5018 },
  Phuket:           { lat: 7.8804,   lng: 98.3923  },
  "Chiang Mai":     { lat: 18.7883,  lng: 98.9853  },
  // Indonesia
  Bali:             { lat: -8.3405,  lng: 115.0920 },
  Jakarta:          { lat: -6.2088,  lng: 106.8456 },
  Lombok:           { lat: -8.6500,  lng: 116.3249 },
  // Greece
  Athens:           { lat: 37.9838,  lng: 23.7275  },
  Santorini:        { lat: 36.3932,  lng: 25.4615  },
  Mykonos:          { lat: 37.4467,  lng: 25.3289  },
  // Turkey
  Istanbul:         { lat: 41.0082,  lng: 28.9784  },
  Cappadocia:       { lat: 38.6431,  lng: 34.8289  },
  Bodrum:           { lat: 37.0344,  lng: 27.4305  },
  // Morocco
  Marrakech:        { lat: 31.6295,  lng: -7.9811  },
  Casablanca:       { lat: 33.5731,  lng: -7.5898  },
  Fes:              { lat: 34.0181,  lng: -5.0078  },
  // Portugal
  Lisbon:           { lat: 38.7223,  lng: -9.1393  },
  Porto:            { lat: 41.1579,  lng: -8.6291  },
  Algarve:          { lat: 37.0179,  lng: -7.9304  },
  // India
  Goa:              { lat: 15.2993,  lng: 74.1240  },
  Mumbai:           { lat: 19.0760,  lng: 72.8777  },
  Jaipur:           { lat: 26.9124,  lng: 75.7873  },
  // Vietnam
  Hanoi:            { lat: 21.0285,  lng: 105.8542 },
  "Ho Chi Minh City":{ lat: 10.8231, lng: 106.6297 },
  "Da Nang":        { lat: 16.0544,  lng: 108.2022 },
  // Mexico
  "Mexico City":    { lat: 19.4326,  lng: -99.1332 },
  Cancun:           { lat: 21.1619,  lng: -86.8515 },
  Tulum:            { lat: 20.2114,  lng: -87.4654 },
  // Brazil
  "Rio de Janeiro": { lat: -22.9068, lng: -43.1729 },
  "São Paulo":      { lat: -23.5505, lng: -46.6333 },
  Salvador:         { lat: -12.9714, lng: -38.5014 },
  // United States
  "New York":       { lat: 40.7128,  lng: -74.0060 },
  "Los Angeles":    { lat: 34.0522,  lng: -118.2437},
  Miami:            { lat: 25.7617,  lng: -80.1918 },
  // Australia
  Sydney:           { lat: -33.8688, lng: 151.2093 },
  Melbourne:        { lat: -37.8136, lng: 144.9631 },
  Cairns:           { lat: -16.9186, lng: 145.7781 },
  // New Zealand
  Auckland:         { lat: -36.8485, lng: 174.7633 },
  Queenstown:       { lat: -45.0312, lng: 168.6626 },
  Rotorua:          { lat: -38.1368, lng: 176.2497 },
  // Peru
  Cusco:            { lat: -13.5319, lng: -71.9675 },
  Lima:             { lat: -12.0464, lng: -77.0428 },
  Arequipa:         { lat: -16.4090, lng: -71.5375 },
  // Colombia
  Cartagena:        { lat: 10.3910,  lng: -75.4794 },
  Bogota:           { lat: 4.7110,   lng: -74.0721 },
  Medellin:         { lat: 6.2442,   lng: -75.5812 },
  // Argentina
  "Buenos Aires":   { lat: -34.6037, lng: -58.3816 },
  Mendoza:          { lat: -32.8908, lng: -68.8272 },
  // Egypt
  Cairo:            { lat: 30.0444,  lng: 31.2357  },
  Luxor:            { lat: 25.6872,  lng: 32.6396  },
  Aswan:            { lat: 24.0889,  lng: 32.8998  },
  // Kenya
  Nairobi:          { lat: -1.2921,  lng: 36.8219  },
  Mombasa:          { lat: -4.0435,  lng: 39.6682  },
  // Iceland
  Reykjavik:        { lat: 64.1466,  lng: -21.9426 },
  Akureyri:         { lat: 65.6835,  lng: -18.1002 },
  // Norway
  Oslo:             { lat: 59.9139,  lng: 10.7522  },
  Bergen:           { lat: 60.3913,  lng: 5.3221   },
  Tromso:           { lat: 69.6496,  lng: 18.9560  },
  // Switzerland
  Zurich:           { lat: 47.3769,  lng: 8.5417   },
  Geneva:           { lat: 46.2044,  lng: 6.1432   },
  Interlaken:       { lat: 46.6863,  lng: 7.8632   },
  // Croatia
  Dubrovnik:        { lat: 42.6507,  lng: 18.0944  },
  Split:            { lat: 43.5081,  lng: 16.4402  },
  Zagreb:           { lat: 45.8150,  lng: 15.9819  },
  // Malaysia
  "Kuala Lumpur":   { lat: 3.1390,   lng: 101.6869 },
  Penang:           { lat: 5.4141,   lng: 100.3288 },
  Langkawi:         { lat: 6.3500,   lng: 99.8000  },
  // Philippines
  Manila:           { lat: 14.5995,  lng: 120.9842 },
  Palawan:          { lat: 9.5000,   lng: 118.5000 },
  Cebu:             { lat: 10.3157,  lng: 123.8854 },
  // China
  Beijing:          { lat: 39.9042,  lng: 116.4074 },
  Shanghai:         { lat: 31.2304,  lng: 121.4737 },
  // South Korea
  Seoul:            { lat: 37.5665,  lng: 126.9780 },
  Busan:            { lat: 35.1796,  lng: 129.0756 },
  Jeju:             { lat: 33.4996,  lng: 126.5312 },
  // Jordan
  Petra:            { lat: 30.3285,  lng: 35.4444  },
  Amman:            { lat: 31.9454,  lng: 35.9284  },
  // UAE
  Dubai:            { lat: 25.2048,  lng: 55.2708  },
  "Abu Dhabi":      { lat: 24.4539,  lng: 54.3773  },
  // United Kingdom
  London:           { lat: 51.5074,  lng: -0.1278  },
  Edinburgh:        { lat: 55.9533,  lng: -3.1883  },
  Bath:             { lat: 51.3811,  lng: -2.3590  },
  // Germany
  Berlin:           { lat: 52.5200,  lng: 13.4050  },
  Munich:           { lat: 48.1351,  lng: 11.5820  },
  Hamburg:          { lat: 53.5511,  lng: 9.9937   },
  // Netherlands
  Amsterdam:        { lat: 52.3676,  lng: 4.9041   },
  Rotterdam:        { lat: 51.9244,  lng: 4.4777   },
  Utrecht:          { lat: 52.0907,  lng: 5.1214   },
  // Canada
  Vancouver:        { lat: 49.2827,  lng: -123.1207},
  Toronto:          { lat: 43.6532,  lng: -79.3832 },
  Montreal:         { lat: 45.5017,  lng: -73.5673 },
  // Czech Republic
  Prague:           { lat: 50.0755,  lng: 14.4378  },
  // Austria
  Vienna:           { lat: 48.2082,  lng: 16.3738  },
  Salzburg:         { lat: 47.8095,  lng: 13.0550  },
  // Hungary
  Budapest:         { lat: 47.4979,  lng: 19.0402  },
  // Poland
  Warsaw:           { lat: 52.2297,  lng: 21.0122  },
  Krakow:           { lat: 50.0647,  lng: 19.9450  },
  // Ireland
  Dublin:           { lat: 53.3498,  lng: -6.2603  },
  Galway:           { lat: 53.2707,  lng: -9.0568  },
  // Israel
  "Tel Aviv":       { lat: 32.0853,  lng: 34.7818  },
  Jerusalem:        { lat: 31.7683,  lng: 35.2137  },
  // Russia
  Moscow:           { lat: 55.7558,  lng: 37.6173  },
  "St Petersburg":  { lat: 59.9311,  lng: 30.3609  },
  // Taiwan
  Taipei:           { lat: 25.0330,  lng: 121.5654 },
  // Cambodia
  "Siem Reap":      { lat: 13.3671,  lng: 103.8448 },
  "Phnom Penh":     { lat: 11.5564,  lng: 104.9282 },
  // Sri Lanka
  Colombo:          { lat: 6.9271,   lng: 79.8612  },
  Kandy:            { lat: 7.2906,   lng: 80.6337  },
  // Nepal
  Kathmandu:        { lat: 27.7172,  lng: 85.3240  },
  Pokhara:          { lat: 28.2096,  lng: 83.9856  },
  // Cuba
  Havana:           { lat: 23.1136,  lng: -82.3666 },
  // South Africa
  "Cape Town":      { lat: -33.9249, lng: 18.4241  },
  Johannesburg:     { lat: -26.2041, lng: 28.0473  },
  // Singapore
  "Marina Bay":     { lat: 1.2789,   lng: 103.8536 },
  Sentosa:          { lat: 1.2494,   lng: 103.8303 },
  // Maldives
  Male:             { lat: 4.1755,   lng: 73.5093  },
  // Saudi Arabia
  Riyadh:           { lat: 24.7136,  lng: 46.6753  },
  Jeddah:           { lat: 21.4858,  lng: 39.1925  },
  // Sweden
  Stockholm:        { lat: 59.3293,  lng: 18.0686  },
  Gothenburg:       { lat: 57.7089,  lng: 11.9746  },
  // Denmark
  Copenhagen:       { lat: 55.6761,  lng: 12.5683  },
  // Finland
  Helsinki:         { lat: 60.1699,  lng: 24.9384  },
  Rovaniemi:        { lat: 66.5039,  lng: 25.7294  },
  // Romania
  Bucharest:        { lat: 44.4268,  lng: 26.1025  },
  // Bulgaria
  Sofia:            { lat: 42.6977,  lng: 23.3219  },
  Plovdiv:          { lat: 42.1354,  lng: 24.7453  },
  // Fiji
  Nadi:             { lat: -17.7765, lng: 177.4356 },
  Suva:             { lat: -18.1248, lng: 178.4501 },
}

// Country-level default coordinates
export const countryCityData: Record<string, { city: string; lat: number; lng: number }> = {
  France:             { city: "Paris",           lat: 48.8566,  lng: 2.3522   },
  Italy:              { city: "Rome",            lat: 41.9028,  lng: 12.4964  },
  Japan:              { city: "Tokyo",           lat: 35.6762,  lng: 139.6503 },
  "United States":    { city: "New York",        lat: 40.7128,  lng: -74.0060 },
  Spain:              { city: "Madrid",          lat: 40.4168,  lng: -3.7038  },
  "United Kingdom":   { city: "London",          lat: 51.5074,  lng: -0.1278  },
  Germany:            { city: "Berlin",          lat: 52.5200,  lng: 13.4050  },
  Australia:          { city: "Sydney",          lat: -33.8688, lng: 151.2093 },
  Canada:             { city: "Toronto",         lat: 43.6532,  lng: -79.3832 },
  Brazil:             { city: "Rio de Janeiro",  lat: -22.9068, lng: -43.1729 },
  Mexico:             { city: "Mexico City",     lat: 19.4326,  lng: -99.1332 },
  India:              { city: "New Delhi",       lat: 28.6139,  lng: 77.2090  },
  China:              { city: "Beijing",         lat: 39.9042,  lng: 116.4074 },
  Thailand:           { city: "Bangkok",         lat: 13.7563,  lng: 100.5018 },
  Greece:             { city: "Athens",          lat: 37.9838,  lng: 23.7275  },
  Turkey:             { city: "Istanbul",        lat: 41.0082,  lng: 28.9784  },
  Egypt:              { city: "Cairo",           lat: 30.0444,  lng: 31.2357  },
  Morocco:            { city: "Marrakech",       lat: 31.6295,  lng: -7.9811  },
  Netherlands:        { city: "Amsterdam",       lat: 52.3676,  lng: 4.9041   },
  Switzerland:        { city: "Zurich",          lat: 47.3769,  lng: 8.5417   },
  Sweden:             { city: "Stockholm",       lat: 59.3293,  lng: 18.0686  },
  Norway:             { city: "Oslo",            lat: 59.9139,  lng: 10.7522  },
  Denmark:            { city: "Copenhagen",      lat: 55.6761,  lng: 12.5683  },
  Poland:             { city: "Warsaw",          lat: 52.2297,  lng: 21.0122  },
  "Czech Republic":   { city: "Prague",          lat: 50.0755,  lng: 14.4378  },
  Hungary:            { city: "Budapest",        lat: 47.4979,  lng: 19.0402  },
  Romania:            { city: "Bucharest",       lat: 44.4268,  lng: 26.1025  },
  Croatia:            { city: "Zagreb",          lat: 45.8150,  lng: 15.9819  },
  Portugal:           { city: "Lisbon",          lat: 38.7223,  lng: -9.1393  },
  Ireland:            { city: "Dublin",          lat: 53.3498,  lng: -6.2603  },
  Iceland:            { city: "Reykjavik",       lat: 64.1466,  lng: -21.9426 },
  "New Zealand":      { city: "Auckland",        lat: -36.8485, lng: 174.7633 },
  Fiji:               { city: "Suva",            lat: -18.1248, lng: 178.4501 },
  "United Arab Emirates": { city: "Dubai",       lat: 25.2048,  lng: 55.2708  },
  Singapore:          { city: "Singapore",       lat: 1.3521,   lng: 103.8198 },
  "South Korea":      { city: "Seoul",           lat: 37.5665,  lng: 126.9780 },
  Indonesia:          { city: "Jakarta",         lat: -6.2088,  lng: 106.8456 },
  Malaysia:           { city: "Kuala Lumpur",    lat: 3.1390,   lng: 101.6869 },
  Philippines:        { city: "Manila",          lat: 14.5995,  lng: 120.9842 },
  Vietnam:            { city: "Ho Chi Minh City",lat: 10.8231,  lng: 106.6297 },
  Argentina:          { city: "Buenos Aires",    lat: -34.6037, lng: -58.3816 },
  Chile:              { city: "Santiago",        lat: -33.4489, lng: -70.6693 },
  Peru:               { city: "Lima",            lat: -12.0464, lng: -77.0428 },
  Colombia:           { city: "Bogotá",          lat: 4.7110,   lng: -74.0721 },
  "South Africa":     { city: "Cape Town",       lat: -33.9249, lng: 18.4241  },
  Kenya:              { city: "Nairobi",         lat: -1.2921,  lng: 36.8219  },
  Nigeria:            { city: "Lagos",           lat: 6.5244,   lng: 3.3792   },
  Israel:             { city: "Tel Aviv",        lat: 32.0853,  lng: 34.7818  },
  Russia:             { city: "Moscow",          lat: 55.7558,  lng: 37.6173  },
  Ukraine:            { city: "Kyiv",            lat: 50.4501,  lng: 30.5234  },
}

// Deprecated stubs
// Kept so existing import sites compile.  Callers must migrate.

/** @deprecated Use lib/hotelbeds-client.ts → fetchHotelbedsHotels() */
export async function fetchEnhancedHotels(): Promise<EnhancedHotel[]> {
  console.warn("[enhanced-places-api] fetchEnhancedHotels is removed — migrate to lib/hotelbeds-client.ts")
  return []
}

/** @deprecated Use lib/google-places.ts → fetchGoogleRestaurants() */
export async function fetchEnhancedRestaurants(): Promise<EnhancedRestaurant[]> {
  console.warn("[enhanced-places-api] fetchEnhancedRestaurants is removed — migrate to lib/google-places.ts")
  return []
}

// Map-marker builder
// Builds markers from real lat/lng returned by the live hotel and restaurant APIs.

export function generateMapMarkers(
  hotels:      Array<{ name: string; location?: { lat: number; lng: number }; rating?: number; price?: string }>,
  restaurants: Array<{ name: string; location?: { lat: number; lng: number }; rating?: number; price?: string; cuisine?: string }>,
  _countryName?: string
): MapMarker[] {
  const markers: MapMarker[] = []

  hotels.slice(0, 5).forEach((h, i) => {
    if (!h.location?.lat || !h.location?.lng) return
    markers.push({
      id:       `hotel-${i}`,
      name:     h.name,
      type:     "hotel",
      location: h.location,
      info:     { rating: h.rating, price: h.price },
    })
  })

  restaurants.slice(0, 5).forEach((r, i) => {
    if (!r.location?.lat || !r.location?.lng) return
    markers.push({
      id:       `restaurant-${i}`,
      name:     r.name,
      type:     "restaurant",
      location: r.location,
      info:     { rating: r.rating, price: r.price, cuisine: r.cuisine },
    })
  })

  return markers
}
