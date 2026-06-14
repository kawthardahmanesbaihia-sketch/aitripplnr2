/**
 * Explore Destination Profiles & Scoring Engine — v2 (Deep Analysis Redesign)
 *
 * Scoring formula (user-specified weights):
 *   Environment   30%  →  60 pts max
 *   Activities    20%  →  40 pts max
 *   Climate       15%  →  30 pts max
 *   Travel Style  10%  →  20 pts max
 *   Mood          10%  →  20 pts max
 *   Terrain        5%  →  10 pts max
 *   City Style     3%  →   6 pts max
 *   Architecture   3%  →   6 pts max
 *   Food           2%  →   4 pts max
 *   ---
 *   Base total       196 pts
 *
 *   Landmark bonus   up to +35 pts  (if famous landmark detected + matches)
 *   Region affinity  up to  +9 pts
 *   Cultural context up to +10 pts
 *   Emotional vibe   up to  +5 pts
 *   Numeric behavior up to +12 pts  (luxury / romance / adventure match)
 *   Family bonus          +6 pts
 *   Budget multiplier  0.82 – 1.18×
 *   Contradiction penalty  up to −55 pts
 *
 *   Theoretical max ≈ 275 pts
 */

import type { MergedTravelProfile } from "./travel-profile-merger"

// Types
export interface CityHint {
  name: string
  tagline: string
  bestFor: string[]
  budgetFit: "budget" | "mid-range" | "luxury" | "all"
}

export interface ExploreDestination {
  id: string
  name: string
  flag: string
  heroImage: string
  region: string
  scores: {
    luxury: number
    nature: number
    city: number
    relaxation: number
    adventure: number
    social: number
    nightlife: number
    cultural: number
    food: number
    beach: number
    budget: number
    family: number
    romance: number
    wellness: number
  }
  climates: string[]
  travelStyles: string[]
  activities: string[]
  cities: CityHint[]
  environmentTypes: string[]
  atmosphereTags: string[]
  architectureIdentity: string[]
  culturalIdentity: string[]
  emotionalProfile: string[]
  // New dimension fields (v2)
  terrain: string[]       // terrain character: mountainous, coastal, rocky, desert, forested, island, volcanic, polar, flat
  cityStyle: string[]     // urban aesthetic: futuristic, modern, historic, traditional, old-town, skyscraper, mixed
  foodSignals: string[]   // food culture: seafood, street-food, fine-dining, local-cuisine, asian-cuisine, mediterranean, spiced, grilled, tropical-fruits
  landmarkKeys: string[]  // lowercase keywords — matched against detectedLandmark.name
}

export interface ScoreBreakdown {
  environment: number
  activities: number
  climate: number
  travelStyle: number
  mood: number
  terrain: number
  cityStyle: number
  architecture: number
  food: number
  landmark: number
  region: number
  cultural: number
  emotional: number
  numeric: number
  penalty: number
}

export interface RankedDestination {
  id: string
  name: string
  flag: string
  heroImage: string
  score: number
  cities: CityHint[]
  explanation: string[]        // "Why this destination" bullet points
  scoreBreakdown: ScoreBreakdown
}

// Destination data
export const EXPLORE_DESTINATIONS: Record<string, ExploreDestination> = {
  japan: {
    id: "japan",
    name: "Japan",
    flag: "🇯🇵",
    heroImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=80",
    region: "East Asia",
    scores: {
      luxury: 72, nature: 68, city: 88, relaxation: 58, adventure: 63,
      social: 62, nightlife: 65, cultural: 96, food: 93, beach: 22,
      budget: 40, family: 78, romance: 72, wellness: 78,
    },
    climates: ["temperate", "cold"],
    travelStyles: ["urban", "cultural", "spiritual", "wellness", "adventure", "food", "photography"],
    activities: ["food", "history", "museums", "photography", "cycling", "hiking", "shopping", "wellness"],
    cities: [
      { name: "Tokyo",     tagline: "Electric neon megacity",       bestFor: ["city exploration", "food", "nightlife"], budgetFit: "all" },
      { name: "Kyoto",     tagline: "Ancient temples and gardens",   bestFor: ["temples", "culture", "history"],         budgetFit: "mid-range" },
      { name: "Osaka",     tagline: "Street food capital",           bestFor: ["street food", "nightlife", "shopping"],  budgetFit: "budget" },
      { name: "Nara",      tagline: "Deer parks and pagodas",        bestFor: ["nature", "culture", "day trips"],        budgetFit: "budget" },
      { name: "Hiroshima", tagline: "History and resilience",        bestFor: ["history", "culture", "peace"],           budgetFit: "budget" },
    ],
    environmentTypes: ["urban", "city", "mountain", "forest", "countryside", "lake", "valley"],
    atmosphereTags: ["serene", "precise", "neon-lit", "zen", "ancient", "futuristic", "minimalist"],
    architectureIdentity: ["japanese", "zen", "shinto", "pagoda", "east-asian", "modernist", "minimalist", "wooden-temple"],
    culturalIdentity: ["east-asian", "japanese", "shinto", "buddhist", "far-eastern"],
    emotionalProfile: ["awestruck", "serene", "curious", "inspired", "contemplative"],
    terrain: ["mountainous", "coastal", "forested", "island"],
    cityStyle: ["futuristic", "modern", "traditional", "mixed", "skyscraper", "old-town"],
    foodSignals: ["seafood", "street-food", "fine-dining", "local-cuisine", "asian-cuisine"],
    landmarkKeys: ["mount fuji", "fuji", "tokyo tower", "shibuya", "shinjuku", "torii gate", "fushimi inari", "cherry blossom", "sakura", "japanese castle", "pagoda", "bullet train", "bamboo forest", "arashiyama", "neon tokyo", "kyoto temple"],
  },

  france: {
    id: "france",
    name: "France",
    flag: "🇫🇷",
    heroImage: "https://images.unsplash.com/photo-1431274172761-fcdab704f2e0?w=1600&q=80",
    region: "Western Europe",
    scores: {
      luxury: 88, nature: 55, city: 83, relaxation: 72, adventure: 38,
      social: 78, nightlife: 78, cultural: 92, food: 96, beach: 52,
      budget: 32, family: 72, romance: 96, wellness: 65,
    },
    climates: ["temperate", "mediterranean", "warm"],
    travelStyles: ["luxury", "romantic", "cultural", "urban", "food", "relaxed"],
    activities: ["food", "history", "shopping", "museums", "photography", "cycling", "wellness", "cooking"],
    cities: [
      { name: "Paris",     tagline: "City of light and romance",  bestFor: ["romance", "art", "food"],         budgetFit: "mid-range" },
      { name: "Nice",      tagline: "French Riviera glamour",     bestFor: ["beach", "food", "relaxation"],    budgetFit: "mid-range" },
      { name: "Lyon",      tagline: "Culinary capital of France", bestFor: ["food", "culture", "history"],     budgetFit: "mid-range" },
      { name: "Bordeaux",  tagline: "Wine country paradise",      bestFor: ["wine", "gastronomy", "relax"],    budgetFit: "luxury" },
      { name: "Marseille", tagline: "Raw Mediterranean port city",bestFor: ["beach", "food", "culture"],       budgetFit: "budget" },
    ],
    environmentTypes: ["city", "urban", "countryside", "mountain", "coastal", "beach", "river"],
    atmosphereTags: ["romantic", "elegant", "warm", "artistic", "grand", "cosmopolitan", "sun-drenched"],
    architectureIdentity: ["haussmann", "gothic", "baroque", "classical", "european", "renaissance", "french-classical"],
    culturalIdentity: ["western-european", "latin", "french", "mediterranean"],
    emotionalProfile: ["romantic", "inspired", "refined", "enchanted", "sophisticated"],
    terrain: ["coastal", "forested", "mountainous", "flat"],
    cityStyle: ["historic", "modern", "traditional", "old-town"],
    foodSignals: ["fine-dining", "local-cuisine", "mediterranean", "street-food"],
    landmarkKeys: ["eiffel tower", "paris", "louvre", "arc de triomphe", "versailles", "notre dame", "mont saint michel", "french riviera", "provence lavender", "montmartre", "bordeaux wine", "chateau france", "alsace", "giverny monet"],
  },

  thailand: {
    id: "thailand",
    name: "Thailand",
    flag: "🇹🇭",
    heroImage: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=1600&q=80",
    region: "Southeast Asia",
    scores: {
      luxury: 55, nature: 73, city: 65, relaxation: 78, adventure: 75,
      social: 82, nightlife: 88, cultural: 77, food: 90, beach: 88,
      budget: 82, family: 68, romance: 72, wellness: 80,
    },
    climates: ["tropical", "warm"],
    travelStyles: ["adventure", "social", "budget", "coastal", "wellness", "cultural", "backpacker"],
    activities: ["beach", "diving", "food", "nightlife", "wellness", "water-sports", "hiking", "festivals"],
    cities: [
      { name: "Bangkok",    tagline: "Vibrant temple-meets-neon capital", bestFor: ["temples", "street food", "nightlife"], budgetFit: "budget" },
      { name: "Chiang Mai", tagline: "Cultural mountain north",           bestFor: ["temples", "trekking", "wellness"],     budgetFit: "budget" },
      { name: "Phuket",     tagline: "Beach and diving paradise",         bestFor: ["beach", "diving", "nightlife"],        budgetFit: "mid-range" },
      { name: "Koh Samui",  tagline: "Island relaxation and luxury",      bestFor: ["beach", "wellness", "relaxation"],     budgetFit: "mid-range" },
      { name: "Pai",        tagline: "Hippie valley in the hills",        bestFor: ["nature", "relaxation", "culture"],     budgetFit: "budget" },
    ],
    environmentTypes: ["beach", "tropical", "coastal", "ocean", "jungle", "island", "urban", "city"],
    atmosphereTags: ["tropical", "vibrant", "lush", "warm", "spiritual", "colorful", "buzzing"],
    architectureIdentity: ["thai", "buddhist-temple", "south-east-asian", "ornate", "tropical", "traditional"],
    culturalIdentity: ["south-east-asian", "thai", "buddhist", "tropical-asian"],
    emotionalProfile: ["energized", "free", "adventurous", "blissful", "curious"],
    terrain: ["coastal", "island", "forested", "mountainous"],
    cityStyle: ["modern", "traditional", "mixed", "historic"],
    foodSignals: ["street-food", "seafood", "local-cuisine", "asian-cuisine"],
    landmarkKeys: ["grand palace", "wat phra kaew", "temple of dawn", "wat arun", "phi phi island", "floating market", "thai temple golden", "chiang mai temple", "ayutthaya ruins", "elephant sanctuary", "tuk-tuk bangkok"],
  },

  italy: {
    id: "italy",
    name: "Italy",
    flag: "🇮🇹",
    heroImage: "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=1600&q=80",
    region: "Southern Europe",
    scores: {
      luxury: 78, nature: 62, city: 82, relaxation: 68, adventure: 45,
      social: 83, nightlife: 72, cultural: 95, food: 98, beach: 57,
      budget: 43, family: 82, romance: 92, wellness: 63,
    },
    climates: ["mediterranean", "warm", "temperate"],
    travelStyles: ["cultural", "food", "romantic", "luxury", "family", "urban", "relaxed"],
    activities: ["food", "history", "museums", "shopping", "photography", "beach", "cycling", "cooking"],
    cities: [
      { name: "Rome",      tagline: "Eternal city of ancient wonders", bestFor: ["history", "food", "culture"],         budgetFit: "mid-range" },
      { name: "Florence",  tagline: "Renaissance art and architecture", bestFor: ["art", "history", "food"],             budgetFit: "mid-range" },
      { name: "Venice",    tagline: "Floating city of canals",          bestFor: ["romance", "culture", "photography"],  budgetFit: "luxury" },
      { name: "Milan",     tagline: "Fashion and design capital",       bestFor: ["shopping", "food", "nightlife"],      budgetFit: "luxury" },
      { name: "Amalfi",    tagline: "Cliffside coastal paradise",       bestFor: ["beach", "scenery", "relaxation"],     budgetFit: "luxury" },
    ],
    environmentTypes: ["city", "urban", "coastal", "beach", "countryside", "mountain", "lake"],
    atmosphereTags: ["romantic", "grand", "sun-drenched", "ancient", "artistic", "warm", "monumental"],
    architectureIdentity: ["roman", "renaissance", "baroque", "classical", "mediterranean", "gothic", "neoclassical", "italian"],
    culturalIdentity: ["western-european", "latin", "mediterranean", "italian", "southern-european"],
    emotionalProfile: ["inspired", "romantic", "awestruck", "enchanted", "nostalgic"],
    terrain: ["coastal", "mountainous", "flat"],
    cityStyle: ["historic", "traditional", "mixed", "old-town"],
    foodSignals: ["fine-dining", "local-cuisine", "mediterranean", "street-food"],
    landmarkKeys: ["colosseum", "rome ruins", "leaning tower of pisa", "venice canal", "gondola venice", "sistine chapel", "amalfi coast", "florence duomo", "trevi fountain", "vatican", "pompeii", "cinque terre", "tuscany vineyard", "roman forum"],
  },

  morocco: {
    id: "morocco",
    name: "Morocco",
    flag: "🇲🇦",
    heroImage: "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=1600&q=80",
    region: "North Africa",
    scores: {
      luxury: 52, nature: 68, city: 62, relaxation: 53, adventure: 82,
      social: 67, nightlife: 38, cultural: 92, food: 82, beach: 42,
      budget: 73, family: 62, romance: 67, wellness: 68,
    },
    climates: ["desert", "warm", "mediterranean"],
    travelStyles: ["cultural", "adventure", "spiritual", "budget", "backpacker", "road-trip"],
    activities: ["history", "hiking", "shopping", "food", "photography", "festivals", "wellness"],
    cities: [
      { name: "Marrakech",   tagline: "Imperial souk city",           bestFor: ["culture", "food", "souks"],         budgetFit: "budget" },
      { name: "Fez",         tagline: "Ancient medina maze",          bestFor: ["history", "culture", "crafts"],     budgetFit: "budget" },
      { name: "Chefchaouen", tagline: "The blue pearl of the Rif",   bestFor: ["photography", "culture", "hiking"], budgetFit: "budget" },
      { name: "Essaouira",   tagline: "Breezy Atlantic coastal town", bestFor: ["beach", "relaxation", "culture"],   budgetFit: "budget" },
      { name: "Merzouga",    tagline: "Sahara desert gateway",        bestFor: ["adventure", "nature", "camping"],   budgetFit: "mid-range" },
    ],
    environmentTypes: ["desert", "dunes", "sandy", "mountain", "coastal", "medina", "arid"],
    atmosphereTags: ["ancient", "warm", "mystical", "sun-drenched", "earthy", "vibrant", "desert"],
    architectureIdentity: ["islamic", "moorish", "arabic", "arab-inspired", "medina", "islamic-inspired", "north-african", "riad"],
    culturalIdentity: ["north-african", "arab", "berber", "islamic", "maghrebi", "arabic"],
    emotionalProfile: ["inspired", "awestruck", "curious", "adventurous", "transported"],
    terrain: ["desert", "rocky", "mountainous", "coastal"],
    cityStyle: ["historic", "traditional", "old-town"],
    foodSignals: ["local-cuisine", "street-food", "spiced", "mediterranean"],
    landmarkKeys: ["sahara dunes", "erg chebbi", "atlas mountains", "marrakech medina", "blue city chefchaouen", "jemaa el fna", "moroccan souk", "riad morocco", "kasbah", "desert camp morocco", "hassan ii mosque"],
  },

  greece: {
    id: "greece",
    name: "Greece",
    flag: "🇬🇷",
    heroImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600&q=80",
    region: "Mediterranean",
    scores: {
      luxury: 68, nature: 65, city: 72, relaxation: 85, adventure: 52,
      social: 75, nightlife: 72, cultural: 90, food: 85, beach: 93,
      budget: 55, family: 72, romance: 90, wellness: 68,
    },
    climates: ["mediterranean", "warm", "temperate"],
    travelStyles: ["romantic", "cultural", "coastal", "relaxed", "urban", "adventure"],
    activities: ["beach", "history", "museums", "photography", "diving", "water-sports", "food", "sailing"],
    cities: [
      { name: "Santorini",    tagline: "Volcanic caldera romance",       bestFor: ["romance", "views", "relaxation"],    budgetFit: "luxury" },
      { name: "Athens",       tagline: "Cradle of civilisation",         bestFor: ["history", "culture", "food"],        budgetFit: "mid-range" },
      { name: "Mykonos",      tagline: "Cosmopolitan party island",      bestFor: ["nightlife", "beach", "socialising"], budgetFit: "luxury" },
      { name: "Rhodes",       tagline: "Medieval walled city and beach", bestFor: ["history", "beach", "culture"],       budgetFit: "mid-range" },
      { name: "Thessaloniki", tagline: "Northern food and culture gem",  bestFor: ["food", "culture", "nightlife"],      budgetFit: "budget" },
    ],
    environmentTypes: ["beach", "coastal", "ocean", "island", "sunny", "rocky", "mediterranean"],
    atmosphereTags: ["sun-drenched", "whitewashed", "ancient", "coastal", "romantic", "breezy", "blue"],
    architectureIdentity: ["greek", "classical", "neoclassical", "cycladic", "whitewashed", "ancient-greek", "hellenic", "mediterranean"],
    culturalIdentity: ["mediterranean", "greek", "southern-european", "aegean", "hellenic"],
    emotionalProfile: ["romantic", "serene", "awestruck", "blissful", "inspired"],
    terrain: ["coastal", "island", "rocky", "mountainous"],
    cityStyle: ["historic", "traditional", "mixed"],
    foodSignals: ["seafood", "mediterranean", "local-cuisine"],
    landmarkKeys: ["santorini", "oia blue domes", "acropolis athens", "parthenon", "mykonos windmills", "greek island", "cycladic white buildings", "blue domed church", "caldera view", "rhodes medieval", "corfu", "santorini sunset"],
  },

  spain: {
    id: "spain",
    name: "Spain",
    flag: "🇪🇸",
    heroImage: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600&q=80",
    region: "Western Europe",
    scores: {
      luxury: 72, nature: 60, city: 88, relaxation: 70, adventure: 58,
      social: 90, nightlife: 95, cultural: 88, food: 93, beach: 80,
      budget: 55, family: 75, romance: 78, wellness: 60,
    },
    climates: ["mediterranean", "warm", "temperate"],
    travelStyles: ["urban", "cultural", "food", "social", "relaxed", "coastal"],
    activities: ["food", "nightlife", "history", "museums", "beach", "festivals", "shopping", "photography"],
    cities: [
      { name: "Barcelona",     tagline: "Gaudí, beach, and nightlife",    bestFor: ["architecture", "beach", "nightlife"],  budgetFit: "mid-range" },
      { name: "Madrid",        tagline: "Art museums and vibrant plazas", bestFor: ["art", "food", "nightlife"],            budgetFit: "mid-range" },
      { name: "Seville",       tagline: "Flamenco soul of Andalusia",     bestFor: ["culture", "food", "nightlife"],        budgetFit: "mid-range" },
      { name: "Ibiza",         tagline: "World-class party island",       bestFor: ["nightlife", "beach", "music"],         budgetFit: "luxury" },
      { name: "San Sebastián", tagline: "Pintxos and beach perfection",   bestFor: ["food", "beach", "culture"],            budgetFit: "luxury" },
    ],
    environmentTypes: ["city", "urban", "beach", "coastal", "countryside", "mediterranean"],
    atmosphereTags: ["vibrant", "sun-drenched", "warm", "festive", "social", "colorful", "energetic"],
    architectureIdentity: ["art-nouveau", "modernisme", "gaudi", "moorish", "baroque", "mediterranean", "spanish", "mudejar"],
    culturalIdentity: ["western-european", "mediterranean", "latin", "iberian", "southern-european", "spanish"],
    emotionalProfile: ["energized", "free", "joyful", "inspired", "social"],
    terrain: ["coastal", "mountainous", "flat", "rocky"],
    cityStyle: ["modern", "historic", "mixed", "old-town", "futuristic"],
    foodSignals: ["local-cuisine", "seafood", "fine-dining", "street-food", "mediterranean"],
    landmarkKeys: ["sagrada familia", "gaudi", "park guell", "alhambra granada", "flamenco seville", "ibiza", "la rambla barcelona", "plaza mayor madrid", "alcazar seville", "giralda tower"],
  },

  dubai: {
    id: "dubai",
    name: "Dubai",
    flag: "🇦🇪",
    heroImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80",
    region: "Middle East",
    scores: {
      luxury: 97, nature: 35, city: 95, relaxation: 68, adventure: 62,
      social: 72, nightlife: 68, cultural: 58, food: 82, beach: 72,
      budget: 15, family: 78, romance: 72, wellness: 80,
    },
    climates: ["desert", "warm"],
    travelStyles: ["luxury", "urban", "shopping", "adventure", "wellness"],
    activities: ["shopping", "diving", "water-sports", "wellness", "nightlife", "photography", "food"],
    cities: [
      { name: "Downtown Dubai", tagline: "Burj Khalifa and the Dubai Mall",  bestFor: ["luxury", "shopping", "dining"],  budgetFit: "luxury" },
      { name: "Dubai Marina",   tagline: "Waterfront yacht playground",      bestFor: ["beach", "nightlife", "sports"],  budgetFit: "luxury" },
      { name: "Deira",          tagline: "Old Dubai soul and gold souks",    bestFor: ["culture", "shopping", "food"],   budgetFit: "mid-range" },
      { name: "Jumeirah",       tagline: "Beachfront luxury strip",          bestFor: ["beach", "wellness", "dining"],   budgetFit: "luxury" },
      { name: "Abu Dhabi",      tagline: "Capital grandeur and heritage",    bestFor: ["culture", "luxury", "beaches"],  budgetFit: "luxury" },
    ],
    environmentTypes: ["desert", "sandy", "urban", "city", "coastal", "beach", "dunes"],
    atmosphereTags: ["futuristic", "grand", "gleaming", "desert", "opulent", "monumental", "urban"],
    architectureIdentity: ["modernist", "futurist", "islamic-inspired", "arabic", "skyscraper", "middle-eastern", "arab-inspired", "glass-steel"],
    culturalIdentity: ["arab", "arabic", "middle-eastern", "gulf", "emirati", "islamic"],
    emotionalProfile: ["awestruck", "impressed", "energized", "glamorous", "bold"],
    terrain: ["desert", "coastal", "flat"],
    cityStyle: ["futuristic", "modern", "skyscraper"],
    foodSignals: ["fine-dining", "seafood", "local-cuisine", "street-food"],
    landmarkKeys: ["burj khalifa", "dubai mall", "palm jumeirah", "burj al arab", "dubai skyline", "desert safari dubai", "sheikh zayed mosque", "abu dhabi mosque", "dubai fountain", "downtown dubai"],
  },

  vietnam: {
    id: "vietnam",
    name: "Vietnam",
    flag: "🇻🇳",
    heroImage: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&q=80",
    region: "Southeast Asia",
    scores: {
      luxury: 45, nature: 80, city: 65, relaxation: 72, adventure: 78,
      social: 72, nightlife: 70, cultural: 85, food: 93, beach: 82,
      budget: 92, family: 68, romance: 68, wellness: 72,
    },
    climates: ["tropical", "warm"],
    travelStyles: ["budget", "cultural", "adventure", "backpacker", "food", "nature"],
    activities: ["food", "history", "beach", "hiking", "photography", "water-sports", "festivals", "cycling"],
    cities: [
      { name: "Hanoi",           tagline: "Chaotic charm of the north",   bestFor: ["history", "culture", "food"],   budgetFit: "budget" },
      { name: "Ho Chi Minh City",tagline: "Frenetic southern powerhouse", bestFor: ["urban", "food", "nightlife"],   budgetFit: "budget" },
      { name: "Hoi An",          tagline: "Lantern-lit ancient town",     bestFor: ["culture", "food", "tailoring"], budgetFit: "budget" },
      { name: "Da Nang",         tagline: "Modern beach city",            bestFor: ["beach", "food", "surfing"],     budgetFit: "budget" },
      { name: "Ha Long Bay",     tagline: "Emerald limestone karsts",     bestFor: ["nature", "kayaking", "scenery"],budgetFit: "mid-range" },
    ],
    environmentTypes: ["beach", "coastal", "jungle", "city", "mountain", "countryside", "tropical", "river"],
    atmosphereTags: ["lush", "ancient", "tropical", "chaotic", "colorful", "misty", "verdant"],
    architectureIdentity: ["vietnamese", "south-east-asian", "colonial", "traditional", "lantern", "wooden", "french-colonial"],
    culturalIdentity: ["south-east-asian", "vietnamese", "confucian", "tropical-asian", "indochinese"],
    emotionalProfile: ["curious", "adventurous", "inspired", "energized", "free"],
    terrain: ["coastal", "mountainous", "forested", "island"],
    cityStyle: ["historic", "traditional", "mixed", "modern"],
    foodSignals: ["street-food", "local-cuisine", "seafood", "asian-cuisine"],
    landmarkKeys: ["ha long bay", "halong bay", "hoi an lanterns", "mekong delta", "sapa rice terraces", "terraced rice fields vietnam", "hoi an old town", "vietnamese street food"],
  },

  india: {
    id: "india",
    name: "India",
    flag: "🇮🇳",
    heroImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=80",
    region: "South Asia",
    scores: {
      luxury: 60, nature: 78, city: 75, relaxation: 55, adventure: 75,
      social: 78, nightlife: 42, cultural: 98, food: 90, beach: 65,
      budget: 88, family: 62, romance: 55, wellness: 90,
    },
    climates: ["tropical", "desert", "warm", "temperate"],
    travelStyles: ["cultural", "spiritual", "budget", "adventure", "wellness", "backpacker"],
    activities: ["history", "wellness", "hiking", "food", "photography", "festivals", "yoga", "cycling"],
    cities: [
      { name: "Delhi",  tagline: "Mughal heritage meets modern chaos",  bestFor: ["history", "culture", "food"],       budgetFit: "budget" },
      { name: "Mumbai", tagline: "Maximum city, maximum energy",        bestFor: ["urban", "food", "nightlife"],       budgetFit: "budget" },
      { name: "Goa",    tagline: "Beaches, spice, and chill vibes",     bestFor: ["beach", "nightlife", "relaxation"], budgetFit: "budget" },
      { name: "Jaipur", tagline: "Pink city of Rajput grandeur",        bestFor: ["culture", "history", "shopping"],   budgetFit: "budget" },
      { name: "Kerala", tagline: "Backwaters and ayurvedic wellness",   bestFor: ["nature", "wellness", "backwaters"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["city", "desert", "beach", "jungle", "mountain", "tropical", "countryside", "river"],
    atmosphereTags: ["ancient", "mystical", "colorful", "sacred", "chaotic", "vibrant", "spiritual"],
    architectureIdentity: ["mughal", "hindu-temple", "indo-islamic", "rajput", "dravidian", "colonial", "ornate", "south-asian"],
    culturalIdentity: ["south-asian", "indian", "hindu", "mughal", "vedic", "dravidian"],
    emotionalProfile: ["awestruck", "spiritual", "inspired", "overwhelmed", "curious"],
    terrain: ["desert", "mountainous", "coastal", "forested", "flat"],
    cityStyle: ["historic", "traditional", "mixed", "modern"],
    foodSignals: ["local-cuisine", "street-food", "spiced", "asian-cuisine"],
    landmarkKeys: ["taj mahal", "agra", "amber palace jaipur", "pink city jaipur", "varanasi ghats", "golden temple amritsar", "india gate", "hawa mahal", "kerala backwaters", "ajanta caves", "hampi ruins", "lotus temple", "qutub minar", "red fort"],
  },

  bali: {
    id: "bali",
    name: "Bali",
    flag: "🇮🇩",
    heroImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80",
    region: "Southeast Asia",
    scores: {
      luxury: 67, nature: 87, city: 38, relaxation: 92, adventure: 73,
      social: 67, nightlife: 62, cultural: 80, food: 77, beach: 90,
      budget: 67, family: 57, romance: 88, wellness: 94,
    },
    climates: ["tropical", "warm"],
    travelStyles: ["wellness", "nature", "spiritual", "romantic", "coastal", "adventure", "relaxed"],
    activities: ["beach", "wellness", "hiking", "diving", "water-sports", "photography", "festivals", "yoga"],
    cities: [
      { name: "Ubud",     tagline: "Art, rice terraces, and wellness", bestFor: ["wellness", "culture", "nature"],  budgetFit: "mid-range" },
      { name: "Seminyak", tagline: "Beach clubs and sunset dining",    bestFor: ["beach", "nightlife", "dining"],   budgetFit: "mid-range" },
      { name: "Canggu",   tagline: "Surf and digital nomad hub",       bestFor: ["surfing", "beach", "social"],     budgetFit: "budget" },
      { name: "Nusa Dua", tagline: "Luxury peninsula resorts",         bestFor: ["beach", "luxury", "relaxation"],  budgetFit: "luxury" },
      { name: "Uluwatu",  tagline: "Cliff temples and surf breaks",    bestFor: ["surfing", "culture", "views"],    budgetFit: "mid-range" },
    ],
    environmentTypes: ["beach", "tropical", "jungle", "forest", "island", "ocean", "coastal", "rice-terraces", "valley"],
    atmosphereTags: ["lush", "spiritual", "tropical", "serene", "mystical", "verdant", "sacred"],
    architectureIdentity: ["balinese", "hindu-temple", "south-east-asian", "tropical", "traditional", "carved-stone", "ornate"],
    culturalIdentity: ["south-east-asian", "balinese", "hindu", "indonesian", "tropical-asian"],
    emotionalProfile: ["serene", "blissful", "spiritual", "rejuvenated", "inspired"],
    terrain: ["mountainous", "coastal", "island", "forested"],
    cityStyle: ["traditional", "mixed"],
    foodSignals: ["local-cuisine", "seafood", "street-food", "asian-cuisine"],
    landmarkKeys: ["tanah lot", "uluwatu temple", "bali rice terraces", "tegallalang rice", "sacred monkey forest", "mount batur", "ubud rice fields", "balinese ceremony", "kuta beach", "seminyak bali"],
  },

  maldives: {
    id: "maldives",
    name: "Maldives",
    flag: "🇲🇻",
    heroImage: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&q=80",
    region: "South Asia",
    scores: {
      luxury: 88, nature: 72, city: 5, relaxation: 98, adventure: 30,
      social: 35, nightlife: 15, cultural: 18, food: 58, beach: 100,
      budget: 8, family: 42, romance: 98, wellness: 92,
    },
    climates: ["tropical", "warm"],
    travelStyles: ["luxury", "romantic", "wellness", "coastal", "relaxed"],
    activities: ["beach", "diving", "water-sports", "wellness", "photography", "snorkeling", "sailing"],
    cities: [
      { name: "Malé Atoll",  tagline: "Luxury overwater paradise",         bestFor: ["romance", "diving", "relaxation"], budgetFit: "luxury" },
      { name: "Baa Atoll",   tagline: "UNESCO biosphere and whale sharks", bestFor: ["diving", "nature", "romance"],      budgetFit: "luxury" },
      { name: "Addu Atoll",  tagline: "Remote southern paradise",          bestFor: ["relaxation", "diving", "nature"],   budgetFit: "luxury" },
    ],
    environmentTypes: ["beach", "ocean", "island", "turquoise-water", "tropical", "coastal", "lagoon"],
    atmosphereTags: ["serene", "turquoise", "pristine", "sun-drenched", "tranquil", "tropical", "luxurious"],
    architectureIdentity: ["overwater-bungalow", "resort", "tropical", "modern", "island"],
    culturalIdentity: ["island-tropical", "south-asian", "maldivian"],
    emotionalProfile: ["blissful", "romantic", "serene", "rejuvenated", "peaceful"],
    terrain: ["island", "coastal", "flat"],
    cityStyle: ["modern"],
    foodSignals: ["seafood", "fine-dining"],
    landmarkKeys: ["overwater bungalow", "maldives resort", "turquoise atoll", "water villa maldives", "maldives overwater", "lagoon maldives"],
  },

  switzerland: {
    id: "switzerland",
    name: "Switzerland",
    flag: "🇨🇭",
    heroImage: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&q=80",
    region: "Western Europe",
    scores: {
      luxury: 82, nature: 95, city: 52, relaxation: 77, adventure: 87,
      social: 50, nightlife: 38, cultural: 68, food: 73, beach: 10,
      budget: 10, family: 85, romance: 80, wellness: 88,
    },
    climates: ["cold", "temperate"],
    travelStyles: ["nature", "luxury", "adventure", "wellness", "relaxed", "family"],
    activities: ["hiking", "skiing", "wellness", "photography", "cycling", "museums", "trekking"],
    cities: [
      { name: "Interlaken",  tagline: "Adventure hub between two glacier lakes", bestFor: ["adventure", "nature", "hiking"],   budgetFit: "mid-range" },
      { name: "Zermatt",     tagline: "Matterhorn views, car-free alpine village",bestFor: ["skiing", "hiking", "romance"],    budgetFit: "luxury" },
      { name: "Luzern",      tagline: "Lakeside medieval charm",                  bestFor: ["culture", "scenery", "relax"],    budgetFit: "mid-range" },
      { name: "Grindelwald", tagline: "Gateway to the Jungfrau peaks",           bestFor: ["hiking", "skiing", "nature"],     budgetFit: "luxury" },
      { name: "Zurich",      tagline: "Elegant city on a pristine lake",          bestFor: ["food", "culture", "shopping"],   budgetFit: "luxury" },
    ],
    environmentTypes: ["mountain", "alpine", "lake", "forest", "snow", "glacier", "countryside", "valley"],
    atmosphereTags: ["crisp", "majestic", "serene", "pristine", "dramatic", "alpine", "peaceful"],
    architectureIdentity: ["alpine", "chalet", "swiss", "gothic", "modernist", "european"],
    culturalIdentity: ["western-european", "central-european", "alpine", "swiss"],
    emotionalProfile: ["awestruck", "serene", "inspired", "exhilarated", "peaceful"],
    terrain: ["mountainous", "forested", "rocky"],
    cityStyle: ["modern", "historic", "traditional"],
    foodSignals: ["fine-dining", "local-cuisine"],
    landmarkKeys: ["matterhorn", "zermatt", "swiss alps", "jungfrau", "interlaken", "lake lucerne", "chapel bridge luzern", "lake geneva", "rhine falls", "grindelwald", "bernese oberland", "eiger switzerland"],
  },

  newzealand: {
    id: "newzealand",
    name: "New Zealand",
    flag: "🇳🇿",
    heroImage: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1600&q=80",
    region: "Oceania",
    scores: {
      luxury: 60, nature: 98, city: 42, relaxation: 72, adventure: 96,
      social: 55, nightlife: 40, cultural: 65, food: 62, beach: 65,
      budget: 42, family: 80, romance: 75, wellness: 70,
    },
    climates: ["temperate", "cold"],
    travelStyles: ["adventure", "nature", "road-trip", "relaxed", "family"],
    activities: ["hiking", "skiing", "trekking", "kayaking", "photography", "cycling", "sailing", "camping"],
    cities: [
      { name: "Queenstown",    tagline: "Adventure capital of the world",   bestFor: ["adventure", "skiing", "bungee"],   budgetFit: "mid-range" },
      { name: "Milford Sound", tagline: "Spectacular fiordland wilderness", bestFor: ["nature", "hiking", "kayaking"],    budgetFit: "mid-range" },
      { name: "Rotorua",       tagline: "Geothermal and Māori culture",    bestFor: ["culture", "adventure", "nature"],  budgetFit: "budget" },
      { name: "Abel Tasman",   tagline: "Golden beaches and coastal walks", bestFor: ["hiking", "beach", "nature"],      budgetFit: "mid-range" },
      { name: "Franz Josef",   tagline: "Glaciers meeting rainforest",      bestFor: ["nature", "hiking", "adventure"],  budgetFit: "mid-range" },
    ],
    environmentTypes: ["mountain", "forest", "lake", "glacier", "countryside", "fjord", "volcanic", "beach", "valley"],
    atmosphereTags: ["pristine", "wild", "dramatic", "lush", "misty", "majestic", "rugged"],
    architectureIdentity: ["vernacular", "colonial", "modern", "traditional-maori"],
    culturalIdentity: ["oceanian", "new-zealand", "maori", "pacific-island"],
    emotionalProfile: ["exhilarated", "awestruck", "free", "adventurous", "inspired"],
    terrain: ["mountainous", "coastal", "forested", "island"],
    cityStyle: ["modern"],
    foodSignals: ["seafood", "local-cuisine"],
    landmarkKeys: ["milford sound", "queenstown", "mount cook", "hobbiton", "tongariro volcano", "lake tekapo", "new zealand fjord", "southern alps nz", "fiordland", "rotorua geysers", "maori culture nz", "bay of islands"],
  },

  jordan: {
    id: "jordan",
    name: "Jordan",
    flag: "🇯🇴",
    heroImage: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&q=80",
    region: "Middle East",
    scores: {
      luxury: 52, nature: 72, city: 38, relaxation: 60, adventure: 88,
      social: 48, nightlife: 20, cultural: 95, food: 68, beach: 28,
      budget: 58, family: 62, romance: 65, wellness: 52,
    },
    climates: ["desert", "warm"],
    travelStyles: ["cultural", "adventure", "spiritual", "road-trip", "budget"],
    activities: ["history", "hiking", "photography", "camping", "trekking", "wellness", "off-road"],
    cities: [
      { name: "Aqaba",    tagline: "Red Sea diving and beach escape",     bestFor: ["diving", "beach", "relaxation"],    budgetFit: "mid-range" },
      { name: "Amman",    tagline: "Modern Arab city with ancient ruins", bestFor: ["culture", "food", "history"],       budgetFit: "budget" },
      { name: "Petra",    tagline: "Rose-red rock-cut ancient city",      bestFor: ["history", "culture", "adventure"],  budgetFit: "mid-range" },
      { name: "Wadi Rum", tagline: "Mars-like desert wilderness",         bestFor: ["adventure", "camping", "nature"],   budgetFit: "mid-range" },
      { name: "Dead Sea", tagline: "Lowest point on earth, natural spa",  bestFor: ["wellness", "relaxation", "nature"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["desert", "dunes", "sandy", "rocky", "canyon", "arid", "wadi", "valley"],
    atmosphereTags: ["ancient", "dramatic", "mystical", "sun-drenched", "desert", "rugged", "historical"],
    architectureIdentity: ["nabataean", "roman", "islamic", "arabic", "rock-cut", "byzantine", "middle-eastern"],
    culturalIdentity: ["middle-eastern", "arab", "arabic", "levantine", "islamic", "semitic"],
    emotionalProfile: ["awestruck", "transported", "inspired", "adventurous", "humbled"],
    terrain: ["desert", "rocky", "mountainous"],
    cityStyle: ["historic", "traditional", "old-town"],
    foodSignals: ["local-cuisine", "street-food", "spiced"],
    landmarkKeys: ["petra", "treasury petra", "al khazneh", "wadi rum", "wadi rum desert", "dead sea jordan", "jerash ruins", "roman ruins jordan", "nabataean", "siq petra canyon", "rose-red city", "camels wadi rum", "petra monastery"],
  },

  iceland: {
    id: "iceland",
    name: "Iceland",
    flag: "🇮🇸",
    heroImage: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1600&q=80",
    region: "Northern Europe",
    scores: {
      luxury: 52, nature: 97, city: 22, relaxation: 62, adventure: 95,
      social: 40, nightlife: 42, cultural: 65, food: 55, beach: 8,
      budget: 20, family: 68, romance: 75, wellness: 68,
    },
    climates: ["cold", "arctic", "snowy"],
    travelStyles: ["adventure", "nature", "road-trip", "photography", "wellness"],
    activities: ["hiking", "photography", "trekking", "skiing", "camping", "wellness"],
    cities: [
      { name: "Reykjavik",        tagline: "World's northernmost capital",       bestFor: ["culture", "food", "day-trips"],       budgetFit: "mid-range" },
      { name: "Golden Circle",    tagline: "Geysers, rifts and Gullfoss falls",  bestFor: ["nature", "photography", "adventure"], budgetFit: "mid-range" },
      { name: "South Coast",      tagline: "Black beaches, glaciers, waterfalls",bestFor: ["photography", "hiking", "nature"],    budgetFit: "mid-range" },
      { name: "Snæfellsnes",      tagline: "Glacier volcano and mystical lava",  bestFor: ["adventure", "nature", "photography"], budgetFit: "mid-range" },
      { name: "Northern Iceland", tagline: "Prime aurora zone and whale watch",  bestFor: ["aurora", "nature", "adventure"],      budgetFit: "mid-range" },
    ],
    environmentTypes: ["tundra", "glacier", "volcanic", "geothermal", "snow", "aurora", "northern-lights", "waterfall", "highland", "arctic", "lava", "mountain", "fjord", "hot-spring", "ice"],
    atmosphereTags: ["dramatic", "pristine", "otherworldly", "wild", "ethereal", "rugged", "vast", "northern", "arctic", "misty"],
    architectureIdentity: ["nordic", "scandinavian", "modern", "minimalist", "turf-house", "viking"],
    culturalIdentity: ["nordic", "scandinavian", "norse", "viking", "icelandic", "northern-european"],
    emotionalProfile: ["awestruck", "inspired", "free", "adventurous", "humbled", "exhilarated"],
    terrain: ["mountainous", "rocky", "volcanic", "polar"],
    cityStyle: ["modern", "traditional"],
    foodSignals: ["seafood", "local-cuisine"],
    landmarkKeys: ["northern lights iceland", "aurora borealis", "strokkur geyser", "gullfoss waterfall", "black sand beach", "jokulsarlon glacier", "hallgrimskirkja", "seljalandsfoss", "lava field iceland", "ice cave iceland", "blue lagoon", "golden circle iceland", "midnight sun"],
  },

  norway: {
    id: "norway",
    name: "Norway",
    flag: "🇳🇴",
    heroImage: "https://images.unsplash.com/photo-1548243703974-23d45d0add88?w=1600&q=80",
    region: "Northern Europe",
    scores: {
      luxury: 65, nature: 95, city: 45, relaxation: 58, adventure: 88,
      social: 48, nightlife: 45, cultural: 72, food: 65, beach: 12,
      budget: 12, family: 72, romance: 78, wellness: 68,
    },
    climates: ["cold", "temperate", "arctic", "snowy"],
    travelStyles: ["adventure", "nature", "road-trip", "photography", "cultural"],
    activities: ["hiking", "photography", "trekking", "skiing", "cycling", "kayaking", "sailing"],
    cities: [
      { name: "Tromsø",          tagline: "Aurora capital of the world",       bestFor: ["aurora", "nature", "adventure"],     budgetFit: "mid-range" },
      { name: "Bergen",          tagline: "Gateway to the fjords",             bestFor: ["nature", "culture", "scenery"],      budgetFit: "mid-range" },
      { name: "Oslo",            tagline: "Sophisticated Scandinavian capital",bestFor: ["culture", "food", "museums"],        budgetFit: "luxury" },
      { name: "Flåm",            tagline: "Dramatic fjord village by train",   bestFor: ["scenery", "nature", "photography"],  budgetFit: "mid-range" },
      { name: "Lofoten Islands", tagline: "Iconic red cabins above arctic sea",bestFor: ["photography", "hiking", "nature"],   budgetFit: "mid-range" },
    ],
    environmentTypes: ["fjord", "mountain", "snow", "tundra", "arctic", "aurora", "northern-lights", "coastal", "forest", "waterfall", "valley", "glacier", "ice"],
    atmosphereTags: ["dramatic", "majestic", "pristine", "wild", "northern", "crisp", "vast", "rugged", "serene"],
    architectureIdentity: ["nordic", "scandinavian", "viking", "stave-church", "modern", "minimalist", "wooden"],
    culturalIdentity: ["nordic", "scandinavian", "norse", "viking", "norwegian", "northern-european"],
    emotionalProfile: ["awestruck", "serene", "inspired", "adventurous", "exhilarated", "free"],
    terrain: ["mountainous", "coastal", "rocky", "forested"],
    cityStyle: ["modern", "historic", "traditional"],
    foodSignals: ["seafood", "local-cuisine"],
    landmarkKeys: ["geirangerfjord", "sognefjord", "lofoten islands", "lofoten red cabins", "trolltunga", "preikestolen", "pulpit rock", "bryggen bergen", "aurora norway", "norwegian fjord", "alesund", "nærøyfjord", "stavanger"],
  },

  southafrica: {
    id: "southafrica",
    name: "South Africa",
    flag: "🇿🇦",
    heroImage: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600&q=80",
    region: "Sub-Saharan Africa",
    scores: {
      luxury: 65, nature: 92, city: 62, relaxation: 65, adventure: 82,
      social: 68, nightlife: 65, cultural: 78, food: 75, beach: 72,
      budget: 68, family: 75, romance: 72, wellness: 68,
    },
    climates: ["warm", "temperate", "mediterranean"],
    travelStyles: ["adventure", "nature", "cultural", "luxury", "road-trip", "wildlife", "safari"],
    activities: ["safari", "wildlife-viewing", "hiking", "photography", "food", "beach", "diving", "wellness", "trekking"],
    cities: [
      { name: "Cape Town",            tagline: "Mountain, ocean and iconic skyline",   bestFor: ["scenery", "beach", "food"],          budgetFit: "mid-range" },
      { name: "Kruger National Park", tagline: "Big Five safari in the wild",          bestFor: ["wildlife", "nature", "adventure"],   budgetFit: "mid-range" },
      { name: "Garden Route",         tagline: "Coastal road trip paradise",           bestFor: ["nature", "beach", "road-trip"],      budgetFit: "mid-range" },
      { name: "Stellenbosch",         tagline: "Wine heartland and Cape Dutch beauty", bestFor: ["food", "wine", "relaxation"],        budgetFit: "mid-range" },
      { name: "Durban",               tagline: "Indian Ocean beach city",              bestFor: ["beach", "food", "culture"],          budgetFit: "budget" },
    ],
    environmentTypes: ["savanna", "wildlife", "bush", "mountain", "coastal", "beach", "ocean", "forest", "desert", "scrubland", "valley", "rocky"],
    atmosphereTags: ["wild", "vibrant", "dramatic", "warm", "rugged", "diverse", "vast", "earthy"],
    architectureIdentity: ["cape-dutch", "colonial", "african", "modern", "traditional-african", "tribal"],
    culturalIdentity: ["african", "south-african", "zulu", "xhosa", "cape-malay", "sub-saharan", "safari"],
    emotionalProfile: ["awestruck", "adventurous", "inspired", "free", "humbled", "energized"],
    terrain: ["mountainous", "coastal", "rocky", "forested"],
    cityStyle: ["modern", "mixed"],
    foodSignals: ["local-cuisine", "seafood", "fine-dining", "grilled"],
    landmarkKeys: ["table mountain", "cape town", "cape of good hope", "kruger park", "big five safari", "lion safari africa", "safari vehicle africa", "elephant south africa", "cape peninsula", "garden route", "boulders beach penguins", "winelands stellenbosch", "drakensberg mountains"],
  },

  finland: {
    id: "finland",
    name: "Finland",
    flag: "🇫🇮",
    heroImage: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1600&q=80",
    region: "Northern Europe",
    scores: {
      luxury: 58, nature: 90, city: 42, relaxation: 72, adventure: 80,
      social: 40, nightlife: 38, cultural: 60, food: 55, beach: 5,
      budget: 28, family: 70, romance: 72, wellness: 78,
    },
    climates: ["cold", "arctic", "snowy"],
    travelStyles: ["adventure", "nature", "wellness", "photography", "road-trip"],
    activities: ["hiking", "skiing", "photography", "wellness", "trekking", "camping"],
    cities: [
      { name: "Rovaniemi",  tagline: "Santa Claus village and aurora gateway", bestFor: ["aurora", "adventure", "family"],    budgetFit: "mid-range" },
      { name: "Levi",       tagline: "Finland's largest ski resort",           bestFor: ["skiing", "aurora", "nature"],       budgetFit: "mid-range" },
      { name: "Helsinki",   tagline: "Design capital on the Baltic Sea",       bestFor: ["culture", "food", "design"],        budgetFit: "mid-range" },
      { name: "Koli",       tagline: "National park with frozen lake views",   bestFor: ["nature", "hiking", "photography"],  budgetFit: "budget" },
      { name: "Saariselkä", tagline: "Above-the-Arctic-Circle wilderness",     bestFor: ["aurora", "trekking", "nature"],     budgetFit: "mid-range" },
    ],
    environmentTypes: ["aurora", "northern-lights", "tundra", "forest", "lake", "snow", "arctic", "highland", "ice", "waterfall"],
    atmosphereTags: ["pristine", "serene", "wild", "northern", "crisp", "ethereal", "vast", "peaceful"],
    architectureIdentity: ["nordic", "scandinavian", "modernist", "minimalist", "wooden", "log-cabin"],
    culturalIdentity: ["nordic", "scandinavian", "finnish", "northern-european", "sami"],
    emotionalProfile: ["serene", "awestruck", "peaceful", "inspired", "free"],
    terrain: ["forested", "flat", "rocky", "polar"],
    cityStyle: ["modern", "traditional"],
    foodSignals: ["local-cuisine", "seafood"],
    landmarkKeys: ["aurora finland", "northern lights finland", "husky sledding", "igloo hotel finland", "ice fishing finland", "reindeer lapland", "santa claus village rovaniemi", "finnish lake", "midnight sun finland", "polar night finland", "ski lapland", "sami culture"],
  },

  sweden: {
    id: "sweden",
    name: "Sweden",
    flag: "🇸🇪",
    heroImage: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1600&q=80",
    region: "Northern Europe",
    scores: {
      luxury: 62, nature: 85, city: 55, relaxation: 70, adventure: 75,
      social: 52, nightlife: 52, cultural: 72, food: 68, beach: 8,
      budget: 25, family: 75, romance: 70, wellness: 75,
    },
    climates: ["cold", "temperate", "arctic", "snowy"],
    travelStyles: ["nature", "adventure", "cultural", "wellness", "road-trip", "photography"],
    activities: ["hiking", "photography", "skiing", "cycling", "museums", "kayaking", "trekking"],
    cities: [
      { name: "Stockholm",  tagline: "Elegant capital across 14 islands",      bestFor: ["culture", "food", "design"],       budgetFit: "mid-range" },
      { name: "Abisko",     tagline: "Best aurora viewing in the world",        bestFor: ["aurora", "nature", "photography"], budgetFit: "mid-range" },
      { name: "Kiruna",     tagline: "Ice Hotel and arctic wilderness",         bestFor: ["aurora", "adventure", "nature"],   budgetFit: "mid-range" },
      { name: "Gothenburg", tagline: "Seafood city with canal charm",           bestFor: ["food", "culture", "social"],       budgetFit: "mid-range" },
      { name: "Dalarna",    tagline: "Folklore villages and red cottages",      bestFor: ["culture", "nature", "relaxation"], budgetFit: "budget" },
    ],
    environmentTypes: ["aurora", "northern-lights", "forest", "lake", "coastal", "mountain", "snow", "tundra", "arctic", "ice"],
    atmosphereTags: ["elegant", "crisp", "serene", "pristine", "northern", "wild", "clean", "vast"],
    architectureIdentity: ["nordic", "scandinavian", "swedish", "modernist", "minimalist", "wooden", "ice-hotel"],
    culturalIdentity: ["nordic", "scandinavian", "swedish", "northern-european", "viking", "sami"],
    emotionalProfile: ["serene", "inspired", "awestruck", "peaceful", "free"],
    terrain: ["forested", "coastal", "flat", "rocky"],
    cityStyle: ["modern", "historic"],
    foodSignals: ["local-cuisine", "seafood", "fine-dining"],
    landmarkKeys: ["abisko aurora", "ice hotel kiruna", "icehotel sweden", "dalarna red cottages", "stockholm gamla stan", "midnight sun sweden", "archipelago stockholm", "aurora sweden", "swedish lapland", "midsommar festival"],
  },

  canada: {
    id: "canada",
    name: "Canada",
    flag: "🇨🇦",
    heroImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80",
    region: "North America",
    scores: {
      luxury: 62, nature: 97, city: 58, relaxation: 65, adventure: 92,
      social: 60, nightlife: 50, cultural: 68, food: 68, beach: 22,
      budget: 38, family: 88, romance: 72, wellness: 70,
    },
    climates: ["cold", "temperate", "arctic", "snowy"],
    travelStyles: ["adventure", "nature", "road-trip", "family", "wildlife", "photography"],
    activities: ["hiking", "skiing", "trekking", "kayaking", "photography", "camping", "cycling", "wildlife"],
    cities: [
      { name: "Banff",       tagline: "Turquoise lakes and glacier peaks",   bestFor: ["nature", "hiking", "photography"], budgetFit: "mid-range" },
      { name: "Vancouver",   tagline: "Mountains meet ocean metropolis",     bestFor: ["nature", "food", "city"],          budgetFit: "mid-range" },
      { name: "Yukon",       tagline: "Raw wilderness and aurora borealis",  bestFor: ["aurora", "adventure", "nature"],   budgetFit: "mid-range" },
      { name: "Quebec City", tagline: "French heritage in North America",    bestFor: ["culture", "history", "food"],      budgetFit: "mid-range" },
      { name: "Jasper",      tagline: "Dark sky preserve and glacier country",bestFor: ["aurora", "nature", "hiking"],     budgetFit: "mid-range" },
    ],
    environmentTypes: ["mountain", "forest", "lake", "glacier", "aurora", "tundra", "arctic", "canyon", "prairie", "coastal", "snow", "valley", "waterfall"],
    atmosphereTags: ["vast", "pristine", "wild", "dramatic", "majestic", "rugged", "crisp", "northern"],
    architectureIdentity: ["colonial", "french-colonial", "modern", "vernacular", "log-cabin", "nordic"],
    culturalIdentity: ["north-american", "canadian", "french-canadian", "indigenous", "english-speaking"],
    emotionalProfile: ["awestruck", "free", "adventurous", "exhilarated", "inspired"],
    terrain: ["mountainous", "forested", "flat", "rocky"],
    cityStyle: ["modern", "mixed"],
    foodSignals: ["local-cuisine", "seafood"],
    landmarkKeys: ["banff", "lake louise", "moraine lake", "niagara falls", "canadian rockies", "old quebec city", "aurora yukon", "whistler mountains", "jasper national park", "capilano bridge", "icefields parkway", "bay of fundy"],
  },

  kenya: {
    id: "kenya",
    name: "Kenya",
    flag: "🇰🇪",
    heroImage: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80",
    region: "East Africa",
    scores: {
      luxury: 65, nature: 95, city: 45, relaxation: 58, adventure: 90,
      social: 55, nightlife: 38, cultural: 78, food: 58, beach: 65,
      budget: 55, family: 72, romance: 75, wellness: 60,
    },
    climates: ["warm", "tropical", "temperate"],
    travelStyles: ["adventure", "nature", "wildlife", "safari", "luxury", "cultural", "photography"],
    activities: ["safari", "wildlife-viewing", "game-drive", "photography", "hiking", "trekking", "diving", "beach", "wellness"],
    cities: [
      { name: "Nairobi",     tagline: "Safari city with urban energy and vibrant culture", bestFor: ["culture", "food", "city"],           budgetFit: "mid-range" },
      { name: "Maasai Mara", tagline: "Greatest wildlife show on Earth",                   bestFor: ["wildlife", "safari", "photography"], budgetFit: "luxury" },
      { name: "Amboseli",    tagline: "Elephants under Kilimanjaro",                       bestFor: ["wildlife", "photography", "nature"], budgetFit: "luxury" },
      { name: "Diani Beach", tagline: "Indian Ocean white sand paradise",                  bestFor: ["beach", "diving", "relaxation"],     budgetFit: "mid-range" },
      { name: "Lamu Island", tagline: "Swahili culture and dhow sailing",                  bestFor: ["culture", "history", "relaxation"],  budgetFit: "mid-range" },
    ],
    environmentTypes: ["savanna", "wildlife", "grassland", "bush", "plains", "mountain", "coastal", "beach", "lake", "tropical", "valley"],
    atmosphereTags: ["wild", "vast", "earthy", "warm", "dramatic", "vibrant", "ancient", "raw"],
    architectureIdentity: ["swahili", "colonial", "african", "traditional-african", "tribal", "modern"],
    culturalIdentity: ["african", "east-african", "kenyan", "maasai", "swahili", "sub-saharan", "safari"],
    emotionalProfile: ["awestruck", "humbled", "adventurous", "inspired", "free"],
    terrain: ["flat", "mountainous", "coastal"],
    cityStyle: ["mixed", "traditional"],
    foodSignals: ["local-cuisine", "street-food"],
    landmarkKeys: ["maasai mara", "masai mara", "great migration", "wildebeest migration", "elephant herd kenya", "giraffe kenya", "lion savanna", "safari jeep africa", "maasai warrior", "mount kenya", "amboseli elephants", "acacia tree savanna", "big cats kenya", "kenya safari"],
  },

  tanzania: {
    id: "tanzania",
    name: "Tanzania",
    flag: "🇹🇿",
    heroImage: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=80",
    region: "East Africa",
    scores: {
      luxury: 62, nature: 97, city: 35, relaxation: 65, adventure: 92,
      social: 48, nightlife: 30, cultural: 72, food: 55, beach: 88,
      budget: 50, family: 68, romance: 80, wellness: 62,
    },
    climates: ["warm", "tropical"],
    travelStyles: ["adventure", "nature", "wildlife", "safari", "luxury", "photography", "cultural", "coastal"],
    activities: ["safari", "wildlife-viewing", "game-drive", "photography", "trekking", "hiking", "beach", "diving", "snorkeling", "camping"],
    cities: [
      { name: "Arusha",      tagline: "Safari gateway city at the foot of Kilimanjaro",  bestFor: ["culture", "wildlife", "food"],       budgetFit: "mid-range" },
      { name: "Zanzibar",    tagline: "Spice island with turquoise beaches",              bestFor: ["beach", "culture", "relaxation"],    budgetFit: "mid-range" },
      { name: "Serengeti",   tagline: "Endless plains and the Great Migration",           bestFor: ["wildlife", "safari", "photography"], budgetFit: "luxury" },
      { name: "Ngorongoro",  tagline: "World's largest volcanic caldera",                 bestFor: ["wildlife", "nature", "adventure"],   budgetFit: "luxury" },
      { name: "Kilimanjaro", tagline: "Africa's highest peak",                            bestFor: ["trekking", "adventure", "nature"],   budgetFit: "mid-range" },
    ],
    environmentTypes: ["savanna", "wildlife", "grassland", "bush", "plains", "mountain", "volcanic", "beach", "tropical", "coastal", "island", "crater", "forest"],
    atmosphereTags: ["vast", "wild", "dramatic", "earthy", "ancient", "raw", "warm", "pristine"],
    architectureIdentity: ["swahili", "arab-influenced", "colonial", "african", "traditional-african"],
    culturalIdentity: ["african", "east-african", "tanzanian", "swahili", "maasai", "sub-saharan", "safari"],
    emotionalProfile: ["awestruck", "humbled", "adventurous", "inspired", "free"],
    terrain: ["flat", "mountainous", "coastal", "island"],
    cityStyle: ["traditional", "mixed"],
    foodSignals: ["local-cuisine", "seafood"],
    landmarkKeys: ["serengeti", "serengeti plains", "ngorongoro crater", "mount kilimanjaro", "kilimanjaro", "serengeti migration", "zanzibar beach", "zanzibar stone town", "africa wildlife safari", "cheetah hunt", "baobab tree africa", "serengeti sunrise", "tanzania safari"],
  },

  seychelles: {
    id: "seychelles",
    name: "Seychelles",
    flag: "🇸🇨",
    heroImage: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1600&q=80",
    region: "Indian Ocean",
    scores: {
      luxury: 90, nature: 85, city: 8, relaxation: 97, adventure: 35,
      social: 28, nightlife: 18, cultural: 30, food: 60, beach: 100,
      budget: 10, family: 45, romance: 98, wellness: 90,
    },
    climates: ["tropical", "warm"],
    travelStyles: ["luxury", "romantic", "wellness", "coastal", "relaxed", "nature"],
    activities: ["beach", "diving", "snorkeling", "sailing", "photography", "wellness"],
    cities: [
      { name: "Mahé",       tagline: "Granite peaks and pristine beaches",       bestFor: ["beach", "nature", "diving"],      budgetFit: "luxury" },
      { name: "Praslin",    tagline: "Vallée de Mai UNESCO palm forest",          bestFor: ["nature", "beach", "romance"],     budgetFit: "luxury" },
      { name: "La Digue",   tagline: "Iconic granite boulders and turquoise coves",bestFor: ["romance", "beach", "photography"],budgetFit: "luxury" },
      { name: "Silhouette", tagline: "Pristine jungle island — no crowds",        bestFor: ["nature", "diving", "relaxation"], budgetFit: "luxury" },
      { name: "Aldabra",    tagline: "UNESCO giant tortoise atoll",               bestFor: ["nature", "diving", "wildlife"],   budgetFit: "luxury" },
    ],
    environmentTypes: ["beach", "ocean", "island", "tropical", "coral", "turquoise-water", "lagoon", "jungle", "granite", "coastal"],
    atmosphereTags: ["pristine", "turquoise", "serene", "luxurious", "tropical", "romantic", "tranquil", "sun-drenched"],
    architectureIdentity: ["creole", "tropical", "colonial", "resort", "modern", "island"],
    culturalIdentity: ["island-tropical", "creole", "african", "indian-ocean", "seychellois"],
    emotionalProfile: ["blissful", "romantic", "serene", "rejuvenated", "peaceful"],
    terrain: ["island", "coastal", "rocky"],
    cityStyle: ["traditional", "modern"],
    foodSignals: ["seafood", "local-cuisine", "fine-dining", "tropical-fruits"],
    landmarkKeys: ["la digue seychelles", "anse source d'argent", "seychelles granite boulders", "praslin seychelles", "coco de mer", "seychelles resort", "seychelles overwater", "victoria seychelles"],
  },

  australia: {
    id: "australia",
    name: "Australia",
    flag: "🇦🇺",
    heroImage: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&q=80",
    region: "Oceania",
    scores: {
      luxury: 72, nature: 92, city: 78, relaxation: 78, adventure: 85,
      social: 70, nightlife: 68, cultural: 68, food: 80, beach: 90,
      budget: 38, family: 90, romance: 72, wellness: 75,
    },
    climates: ["warm", "temperate", "tropical"],
    travelStyles: ["adventure", "nature", "coastal", "family", "road-trip", "wildlife", "urban"],
    activities: ["beach", "hiking", "wildlife-viewing", "diving", "surfing", "photography", "camping", "food"],
    cities: [
      { name: "Sydney",       tagline: "Opera House, harbour, and Bondi surf",    bestFor: ["culture", "beach", "food"],          budgetFit: "mid-range" },
      { name: "Melbourne",    tagline: "Coffee, art, and laneway culture",        bestFor: ["food", "art", "nightlife"],          budgetFit: "mid-range" },
      { name: "Cairns",       tagline: "Gateway to the Great Barrier Reef",      bestFor: ["diving", "wildlife", "nature"],      budgetFit: "mid-range" },
      { name: "Uluru",        tagline: "Sacred red rock in the red centre",       bestFor: ["nature", "culture", "photography"],  budgetFit: "mid-range" },
      { name: "Whitsundays",  tagline: "73 island paradise in the Coral Sea",    bestFor: ["sailing", "beach", "relaxation"],    budgetFit: "luxury" },
    ],
    environmentTypes: ["beach", "coastal", "ocean", "outback", "desert", "tropical", "reef", "forest", "urban", "mountain", "island"],
    atmosphereTags: ["vast", "sunny", "wild", "laid-back", "diverse", "rugged", "pristine", "dramatic"],
    architectureIdentity: ["modern", "colonial", "vernacular", "contemporary", "indigenous"],
    culturalIdentity: ["oceanian", "australian", "anglo", "indigenous-australian", "multicultural"],
    emotionalProfile: ["free", "adventurous", "awestruck", "exhilarated", "relaxed"],
    terrain: ["coastal", "desert", "mountainous", "island", "flat"],
    cityStyle: ["modern", "mixed"],
    foodSignals: ["seafood", "local-cuisine", "fine-dining", "street-food"],
    landmarkKeys: ["sydney opera house", "uluru", "great barrier reef", "bondi beach", "sydney harbour bridge", "twelve apostles", "blue mountains", "kangaroo", "koala australia", "gold coast", "great ocean road"],
  },

  portugal: {
    id: "portugal",
    name: "Portugal",
    flag: "🇵🇹",
    heroImage: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600&q=80",
    region: "Western Europe",
    scores: {
      luxury: 65, nature: 65, city: 75, relaxation: 82, adventure: 48,
      social: 75, nightlife: 72, cultural: 85, food: 90, beach: 82,
      budget: 68, family: 72, romance: 85, wellness: 70,
    },
    climates: ["mediterranean", "warm", "temperate"],
    travelStyles: ["cultural", "food", "romantic", "coastal", "budget", "relaxed", "urban"],
    activities: ["food", "history", "beach", "photography", "cycling", "museums", "surfing", "wine"],
    cities: [
      { name: "Lisbon",    tagline: "Hills, fado, and Atlantic soul",         bestFor: ["culture", "food", "nightlife"],       budgetFit: "mid-range" },
      { name: "Porto",     tagline: "Port wine and iron bridge city",         bestFor: ["wine", "food", "culture"],            budgetFit: "budget" },
      { name: "Algarve",   tagline: "Golden cliffs and Atlantic beaches",     bestFor: ["beach", "relaxation", "scenery"],     budgetFit: "mid-range" },
      { name: "Sintra",    tagline: "Fairy-tale palaces in misty hills",      bestFor: ["history", "photography", "day-trips"],budgetFit: "mid-range" },
      { name: "Azores",    tagline: "Volcanic islands in the Atlantic",       bestFor: ["nature", "adventure", "diving"],      budgetFit: "mid-range" },
    ],
    environmentTypes: ["coastal", "beach", "city", "countryside", "mountain", "atlantic", "ocean", "river"],
    atmosphereTags: ["warm", "romantic", "laid-back", "sun-drenched", "authentic", "nostalgic", "charming"],
    architectureIdentity: ["manueline", "azulejo", "moorish", "baroque", "medieval", "portuguese", "colonial"],
    culturalIdentity: ["western-european", "iberian", "mediterranean", "portuguese", "atlantic"],
    emotionalProfile: ["romantic", "nostalgic", "inspired", "relaxed", "enchanted"],
    terrain: ["coastal", "mountainous", "flat", "rocky"],
    cityStyle: ["historic", "traditional", "old-town", "modern"],
    foodSignals: ["seafood", "local-cuisine", "fine-dining", "mediterranean"],
    landmarkKeys: ["belem tower", "jeronimos monastery", "lisbon tram", "alfama", "porto iron bridge", "azulejo tile", "algarve cliffs", "sintra palace", "pena palace", "douro valley", "fado music lisbon"],
  },

  turkey: {
    id: "turkey",
    name: "Turkey",
    flag: "🇹🇷",
    heroImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1600&q=80",
    region: "Middle East",
    scores: {
      luxury: 68, nature: 72, city: 80, relaxation: 72, adventure: 75,
      social: 72, nightlife: 68, cultural: 92, food: 88, beach: 72,
      budget: 72, family: 72, romance: 78, wellness: 65,
    },
    climates: ["mediterranean", "warm", "desert", "temperate"],
    travelStyles: ["cultural", "adventure", "food", "historical", "coastal", "budget", "road-trip"],
    activities: ["history", "hiking", "food", "photography", "wellness", "beach", "shopping", "diving"],
    cities: [
      { name: "Cappadocia",  tagline: "Balloon rides over fairy chimneys",       bestFor: ["photography", "adventure", "nature"], budgetFit: "mid-range" },
      { name: "Istanbul",    tagline: "Where East meets West",                   bestFor: ["culture", "food", "history"],         budgetFit: "mid-range" },
      { name: "Pamukkale",   tagline: "Cotton Castle thermal pools",             bestFor: ["nature", "wellness", "history"],      budgetFit: "budget" },
      { name: "Bodrum",      tagline: "Aegean turquoise and Crusader castle",    bestFor: ["beach", "nightlife", "history"],      budgetFit: "luxury" },
      { name: "Antalya",     tagline: "Turkish Riviera beaches and ruins",       bestFor: ["beach", "history", "relaxation"],     budgetFit: "mid-range" },
    ],
    environmentTypes: ["mountain", "desert", "coastal", "beach", "rocky", "valley", "plateau", "cave", "urban", "geothermal"],
    atmosphereTags: ["ancient", "mystical", "warm", "vibrant", "dramatic", "exotic", "colorful", "grand"],
    architectureIdentity: ["ottoman", "byzantine", "islamic", "turkish", "roman", "middle-eastern", "baroque-ottoman"],
    culturalIdentity: ["middle-eastern", "turkish", "ottoman", "mediterranean", "anatolian", "islamic"],
    emotionalProfile: ["awestruck", "inspired", "transported", "curious", "enchanted"],
    terrain: ["mountainous", "coastal", "desert", "rocky", "plateau"],
    cityStyle: ["historic", "traditional", "modern", "old-town"],
    foodSignals: ["local-cuisine", "street-food", "mediterranean", "spiced"],
    landmarkKeys: ["cappadocia", "hot air balloon cappadocia", "hagia sophia", "blue mosque", "topkapi palace", "pamukkale", "ephesus ruins", "bosphorus istanbul", "grand bazaar istanbul", "göreme valley"],
  },

  egypt: {
    id: "egypt",
    name: "Egypt",
    flag: "🇪🇬",
    heroImage: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1600&q=80",
    region: "North Africa",
    scores: {
      luxury: 55, nature: 62, city: 65, relaxation: 60, adventure: 78,
      social: 55, nightlife: 38, cultural: 97, food: 65, beach: 68,
      budget: 68, family: 65, romance: 60, wellness: 52,
    },
    climates: ["desert", "warm"],
    travelStyles: ["cultural", "historical", "adventure", "spiritual", "budget", "road-trip"],
    activities: ["history", "diving", "photography", "desert", "food", "trekking", "wellness"],
    cities: [
      { name: "Cairo",       tagline: "Pyramids, bazaars and ancient Cairo",    bestFor: ["history", "culture", "food"],         budgetFit: "budget" },
      { name: "Luxor",       tagline: "World's greatest open-air museum",       bestFor: ["history", "culture", "photography"],  budgetFit: "budget" },
      { name: "Aswan",       tagline: "Nile Nubian city and Abu Simbel",        bestFor: ["history", "nature", "relaxation"],    budgetFit: "budget" },
      { name: "Hurghada",    tagline: "Red Sea diving and beach resorts",       bestFor: ["diving", "beach", "relaxation"],      budgetFit: "mid-range" },
      { name: "Sharm el-Sheikh", tagline: "Red Sea reef diving paradise",      bestFor: ["diving", "beach", "relaxation"],      budgetFit: "mid-range" },
    ],
    environmentTypes: ["desert", "dunes", "arid", "river", "sandy", "coastal", "ancient", "city"],
    atmosphereTags: ["ancient", "mystical", "dramatic", "sun-drenched", "monumental", "historical", "earthy"],
    architectureIdentity: ["ancient-egyptian", "pharaonic", "islamic", "coptic", "roman", "arab"],
    culturalIdentity: ["north-african", "arab", "egyptian", "ancient-egyptian", "islamic", "pharaonic"],
    emotionalProfile: ["awestruck", "humbled", "transported", "inspired", "curious"],
    terrain: ["desert", "flat", "rocky"],
    cityStyle: ["historic", "traditional", "old-town"],
    foodSignals: ["local-cuisine", "street-food", "spiced"],
    landmarkKeys: ["pyramids giza", "great pyramid", "sphinx egypt", "pyramid", "karnak temple", "luxor temple", "nile cruise", "abu simbel", "valley of the kings", "red sea coral egypt"],
  },

  peru: {
    id: "peru",
    name: "Peru",
    flag: "🇵🇪",
    heroImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600&q=80",
    region: "South America",
    scores: {
      luxury: 52, nature: 90, city: 55, relaxation: 55, adventure: 95,
      social: 55, nightlife: 48, cultural: 92, food: 78, beach: 28,
      budget: 68, family: 65, romance: 68, wellness: 60,
    },
    climates: ["tropical", "cold", "desert", "temperate"],
    travelStyles: ["adventure", "cultural", "nature", "historical", "trekking", "road-trip", "budget"],
    activities: ["trekking", "history", "photography", "wildlife-viewing", "food", "hiking", "camping", "festivals"],
    cities: [
      { name: "Cusco",         tagline: "Inca capital at altitude",              bestFor: ["history", "culture", "trekking"],     budgetFit: "mid-range" },
      { name: "Machu Picchu",  tagline: "Lost city of the Inca clouds",          bestFor: ["history", "photography", "nature"],   budgetFit: "mid-range" },
      { name: "Lima",          tagline: "Pacific cliffs and world-class ceviche",bestFor: ["food", "culture", "city"],            budgetFit: "mid-range" },
      { name: "Amazon Basin",  tagline: "Peru's slice of the jungle",            bestFor: ["wildlife", "nature", "adventure"],    budgetFit: "mid-range" },
      { name: "Lake Titicaca", tagline: "Highest navigable lake, floating islands",bestFor: ["culture", "nature", "history"],     budgetFit: "budget" },
    ],
    environmentTypes: ["mountain", "jungle", "rainforest", "lake", "desert", "valley", "highland", "tropical"],
    atmosphereTags: ["ancient", "mystical", "dramatic", "rugged", "misty", "awestruck", "vast", "sacred"],
    architectureIdentity: ["inca", "pre-columbian", "colonial", "spanish-colonial", "indigenous-american"],
    culturalIdentity: ["south-american", "peruvian", "inca", "andean", "indigenous-american", "latin-american"],
    emotionalProfile: ["awestruck", "humbled", "adventurous", "inspired", "spiritual"],
    terrain: ["mountainous", "forested", "desert", "flat"],
    cityStyle: ["historic", "traditional", "old-town"],
    foodSignals: ["local-cuisine", "street-food", "seafood"],
    landmarkKeys: ["machu picchu", "inca trail", "cusco peru", "sacred valley peru", "rainbow mountain", "lake titicaca floating islands", "colca canyon condor", "nazca lines", "peruvian andes", "lima peru"],
  },

  southkorea: {
    id: "southkorea",
    name: "South Korea",
    flag: "🇰🇷",
    heroImage: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1600&q=80",
    region: "East Asia",
    scores: {
      luxury: 72, nature: 70, city: 92, relaxation: 60, adventure: 65,
      social: 78, nightlife: 80, cultural: 88, food: 90, beach: 35,
      budget: 55, family: 72, romance: 68, wellness: 72,
    },
    climates: ["temperate", "cold"],
    travelStyles: ["urban", "cultural", "food", "wellness", "social", "photography"],
    activities: ["food", "history", "shopping", "nightlife", "wellness", "photography", "hiking", "museums"],
    cities: [
      { name: "Seoul",      tagline: "K-pop, palaces, and neon streets",        bestFor: ["culture", "food", "nightlife"],       budgetFit: "mid-range" },
      { name: "Busan",      tagline: "Beaches, temples, and seafood port",      bestFor: ["beach", "food", "culture"],           budgetFit: "budget" },
      { name: "Jeju Island",tagline: "Volcanic island with lava tubes",         bestFor: ["nature", "beach", "adventure"],       budgetFit: "mid-range" },
      { name: "Gyeongju",   tagline: "Ancient Silla kingdom open-air museum",   bestFor: ["history", "culture", "photography"],  budgetFit: "budget" },
      { name: "Incheon",    tagline: "Vibrant port city with Chinatown",        bestFor: ["food", "culture", "shopping"],        budgetFit: "budget" },
    ],
    environmentTypes: ["city", "urban", "mountain", "forest", "island", "coastal", "temple", "countryside"],
    atmosphereTags: ["vibrant", "modern", "neon-lit", "traditional", "efficient", "colorful", "energetic"],
    architectureIdentity: ["korean", "joseon", "confucian", "east-asian", "modernist", "contemporary"],
    culturalIdentity: ["east-asian", "korean", "confucian", "far-eastern", "buddhist"],
    emotionalProfile: ["energized", "curious", "awestruck", "inspired", "social"],
    terrain: ["mountainous", "coastal", "island"],
    cityStyle: ["futuristic", "modern", "traditional", "mixed"],
    foodSignals: ["street-food", "local-cuisine", "asian-cuisine", "fine-dining"],
    landmarkKeys: ["gyeongbokgung palace", "bukchon hanok village", "n seoul tower", "k-pop street seoul", "dmz korea", "jeju island", "haeinsa temple", "korean palace", "seoul neon night market"],
  },

  singapore: {
    id: "singapore",
    name: "Singapore",
    flag: "🇸🇬",
    heroImage: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600&q=80",
    region: "Southeast Asia",
    scores: {
      luxury: 90, nature: 52, city: 97, relaxation: 62, adventure: 48,
      social: 80, nightlife: 82, cultural: 75, food: 95, beach: 45,
      budget: 25, family: 82, romance: 65, wellness: 70,
    },
    climates: ["tropical", "warm"],
    travelStyles: ["luxury", "urban", "food", "shopping", "family", "social", "wellness"],
    activities: ["food", "shopping", "nightlife", "museums", "wellness", "photography", "gardens"],
    cities: [
      { name: "Marina Bay",    tagline: "Infinity pool skyline and gardens",     bestFor: ["luxury", "views", "photography"],     budgetFit: "luxury" },
      { name: "Chinatown",     tagline: "Heritage temples and street food",      bestFor: ["culture", "food", "history"],         budgetFit: "budget" },
      { name: "Sentosa",       tagline: "Resort island with Universal Studios",  bestFor: ["family", "beach", "entertainment"],   budgetFit: "mid-range" },
      { name: "Orchard Road",  tagline: "World-class shopping boulevard",        bestFor: ["shopping", "food", "luxury"],         budgetFit: "luxury" },
      { name: "Changi Airport",tagline: "World's best airport with Jewel",       bestFor: ["shopping", "food", "architecture"],   budgetFit: "all" },
    ],
    environmentTypes: ["city", "urban", "tropical", "garden", "coastal", "beach", "modern"],
    atmosphereTags: ["futuristic", "clean", "tropical", "modern", "cosmopolitan", "efficient", "gleaming"],
    architectureIdentity: ["modernist", "futurist", "contemporary", "colonial", "chinese", "art-deco", "glass-steel"],
    culturalIdentity: ["south-east-asian", "singaporean", "multicultural", "chinese", "malay", "indian"],
    emotionalProfile: ["awestruck", "impressed", "energized", "comfortable", "curious"],
    terrain: ["flat", "island", "coastal"],
    cityStyle: ["futuristic", "modern", "skyscraper"],
    foodSignals: ["street-food", "fine-dining", "asian-cuisine", "seafood", "local-cuisine"],
    landmarkKeys: ["marina bay sands", "gardens by the bay", "supertree grove", "merlion singapore", "jewel changi", "sentosa singapore", "singapore skyline", "hawker food singapore"],
  },

  netherlands: {
    id: "netherlands",
    name: "Netherlands",
    flag: "🇳🇱",
    heroImage: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1600&q=80",
    region: "Western Europe",
    scores: {
      luxury: 68, nature: 62, city: 80, relaxation: 72, adventure: 40,
      social: 78, nightlife: 75, cultural: 85, food: 75, beach: 32,
      budget: 48, family: 78, romance: 75, wellness: 65,
    },
    climates: ["temperate", "cold"],
    travelStyles: ["cultural", "urban", "romantic", "relaxed", "family", "cycling"],
    activities: ["museums", "cycling", "food", "history", "shopping", "photography", "festivals"],
    cities: [
      { name: "Amsterdam",  tagline: "Canal rings, bicycles, and golden age art", bestFor: ["culture", "food", "cycling"],        budgetFit: "mid-range" },
      { name: "Rotterdam",  tagline: "Architect's playground on the Maas",        bestFor: ["architecture", "food", "design"],   budgetFit: "mid-range" },
      { name: "The Hague",  tagline: "Royal palaces and international courts",     bestFor: ["culture", "history", "museums"],    budgetFit: "mid-range" },
      { name: "Delft",      tagline: "Blue pottery and Vermeer",                   bestFor: ["history", "culture", "day-trips"], budgetFit: "budget" },
      { name: "Keukenhof",  tagline: "World's largest flower garden",             bestFor: ["photography", "nature", "romance"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["city", "canal", "countryside", "flat", "river", "coastal", "polder"],
    atmosphereTags: ["elegant", "charming", "vibrant", "romantic", "artistic", "historic", "colorful"],
    architectureIdentity: ["dutch", "baroque", "golden-age", "modernist", "gothic", "renaissance", "canal-house"],
    culturalIdentity: ["western-european", "dutch", "northern-european", "flemish", "germanic"],
    emotionalProfile: ["inspired", "charmed", "curious", "romantic", "relaxed"],
    terrain: ["flat", "coastal"],
    cityStyle: ["historic", "modern", "traditional", "old-town"],
    foodSignals: ["local-cuisine", "street-food", "fine-dining"],
    landmarkKeys: ["amsterdam canal", "keukenhof tulips", "windmill kinderdijk", "rijksmuseum amsterdam", "anne frank house amsterdam", "delft blue pottery", "dutch tulip field", "rotterdam modern architecture"],
  },

  croatia: {
    id: "croatia",
    name: "Croatia",
    flag: "🇭🇷",
    heroImage: "https://images.unsplash.com/photo-1555990793-da11153b6c87?w=1600&q=80",
    region: "Mediterranean",
    scores: {
      luxury: 68, nature: 82, city: 65, relaxation: 85, adventure: 70,
      social: 72, nightlife: 70, cultural: 80, food: 78, beach: 88,
      budget: 58, family: 72, romance: 85, wellness: 70,
    },
    climates: ["mediterranean", "warm"],
    travelStyles: ["coastal", "cultural", "romantic", "adventure", "relaxed", "sailing"],
    activities: ["beach", "sailing", "history", "diving", "hiking", "photography", "food", "water-sports"],
    cities: [
      { name: "Dubrovnik",    tagline: "Pearl of the Adriatic walled city",       bestFor: ["history", "scenery", "romance"],     budgetFit: "luxury" },
      { name: "Split",        tagline: "Roman palace turned living city",          bestFor: ["history", "culture", "nightlife"],   budgetFit: "mid-range" },
      { name: "Hvar",         tagline: "Lavender island party and sailing hub",    bestFor: ["beach", "nightlife", "sailing"],     budgetFit: "luxury" },
      { name: "Plitvice",     tagline: "Cascading turquoise lake system",          bestFor: ["nature", "photography", "hiking"],   budgetFit: "mid-range" },
      { name: "Rovinj",       tagline: "Venetian fishing town on the Istrian tip", bestFor: ["romance", "food", "scenery"],        budgetFit: "mid-range" },
    ],
    environmentTypes: ["beach", "coastal", "ocean", "island", "rocky", "mediterranean", "forest", "lake", "waterfall"],
    atmosphereTags: ["romantic", "historic", "sun-drenched", "blue", "ancient", "vibrant", "picturesque"],
    architectureIdentity: ["venetian", "roman", "medieval", "mediterranean", "gothic", "renaissance", "croatian"],
    culturalIdentity: ["mediterranean", "croatian", "southern-european", "adriatic", "slavic"],
    emotionalProfile: ["romantic", "inspired", "relaxed", "awestruck", "free"],
    terrain: ["coastal", "rocky", "island", "mountainous"],
    cityStyle: ["historic", "traditional", "old-town"],
    foodSignals: ["seafood", "mediterranean", "local-cuisine", "fine-dining"],
    landmarkKeys: ["dubrovnik old town", "dubrovnik walls", "plitvice lakes", "split diocletian palace", "hvar island", "dalmatian coast sailing", "krka waterfall", "rovinj croatia"],
  },

  nepal: {
    id: "nepal",
    name: "Nepal",
    flag: "🇳🇵",
    heroImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=80",
    region: "South Asia",
    scores: {
      luxury: 35, nature: 98, city: 28, relaxation: 48, adventure: 98,
      social: 52, nightlife: 22, cultural: 88, food: 52, beach: 0,
      budget: 72, family: 45, romance: 62, wellness: 68,
    },
    climates: ["cold", "temperate", "tropical"],
    travelStyles: ["adventure", "nature", "trekking", "spiritual", "budget", "photography", "cultural"],
    activities: ["trekking", "hiking", "photography", "wellness", "climbing", "camping", "yoga", "festivals"],
    cities: [
      { name: "Kathmandu",      tagline: "Ancient temples and gateway to Everest", bestFor: ["culture", "history", "trekking"],    budgetFit: "budget" },
      { name: "Pokhara",        tagline: "Annapurna reflection in Phewa Lake",     bestFor: ["nature", "trekking", "relaxation"],  budgetFit: "budget" },
      { name: "Everest Region", tagline: "World's highest peaks and base camps",   bestFor: ["trekking", "adventure", "photography"],budgetFit: "mid-range" },
      { name: "Chitwan",        tagline: "Jungle safaris and one-horned rhinos",   bestFor: ["wildlife", "nature", "adventure"],   budgetFit: "budget" },
      { name: "Lumbini",        tagline: "Birthplace of the Buddha",               bestFor: ["spiritual", "culture", "history"],   budgetFit: "budget" },
    ],
    environmentTypes: ["mountain", "glacier", "highland", "forest", "valley", "river", "jungle", "snow", "alpine"],
    atmosphereTags: ["majestic", "sacred", "wild", "spiritual", "dramatic", "pristine", "humbling", "vast"],
    architectureIdentity: ["nepali", "buddhist", "hindu", "tibetan", "himalayan", "pagoda", "stupa"],
    culturalIdentity: ["south-asian", "nepali", "buddhist", "hindu", "sherpa", "himalayan"],
    emotionalProfile: ["humbled", "spiritual", "awestruck", "adventurous", "inspired"],
    terrain: ["mountainous", "forested", "rocky", "polar"],
    cityStyle: ["traditional", "historic"],
    foodSignals: ["local-cuisine", "street-food", "asian-cuisine"],
    landmarkKeys: ["mount everest", "everest base camp", "himalaya nepal", "annapurna circuit", "boudhanath stupa", "pashupatinath temple", "pokhara nepal", "prayer flags himalaya", "nepal trekking", "namche bazaar"],
  },

  mexico: {
    id: "mexico",
    name: "Mexico",
    flag: "🇲🇽",
    heroImage: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1600&q=80",
    region: "North America",
    scores: {
      luxury: 62, nature: 80, city: 78, relaxation: 75, adventure: 80,
      social: 85, nightlife: 82, cultural: 88, food: 92, beach: 85,
      budget: 72, family: 80, romance: 75, wellness: 65,
    },
    climates: ["tropical", "warm", "desert", "temperate"],
    travelStyles: ["cultural", "adventure", "beach", "food", "budget", "social", "family"],
    activities: ["beach", "food", "history", "diving", "photography", "festivals", "surfing", "wellness"],
    cities: [
      { name: "Mexico City",    tagline: "Ancient ruins, murals, and markets",     bestFor: ["culture", "food", "history"],         budgetFit: "budget" },
      { name: "Tulum",          tagline: "Jungle cliffs above Caribbean",          bestFor: ["beach", "wellness", "photography"],   budgetFit: "mid-range" },
      { name: "Oaxaca",         tagline: "Mezcal, mole, and indigenous art",       bestFor: ["food", "culture", "art"],             budgetFit: "budget" },
      { name: "Guanajuato",     tagline: "Colorful mining city in a ravine",       bestFor: ["culture", "history", "photography"],  budgetFit: "budget" },
      { name: "Cancún",         tagline: "Caribbean beaches and party strip",      bestFor: ["beach", "nightlife", "diving"],       budgetFit: "mid-range" },
    ],
    environmentTypes: ["beach", "tropical", "jungle", "desert", "city", "coastal", "ruins", "cenote", "ocean"],
    atmosphereTags: ["vibrant", "colorful", "warm", "festive", "ancient", "tropical", "lively", "spirited"],
    architectureIdentity: ["mayan", "aztec", "colonial", "spanish-colonial", "pre-columbian", "baroque", "indigenous-american"],
    culturalIdentity: ["latin-american", "mexican", "aztec", "mayan", "spanish-colonial", "mestizo"],
    emotionalProfile: ["joyful", "awestruck", "energized", "inspired", "festive"],
    terrain: ["coastal", "desert", "mountainous", "jungle", "flat"],
    cityStyle: ["historic", "traditional", "mixed", "modern", "old-town"],
    foodSignals: ["street-food", "local-cuisine", "spiced"],
    landmarkKeys: ["chichen itza", "teotihuacan pyramid", "cenote mexico", "day of dead oaxaca", "tulum cliff ruins", "guanajuato colorful", "copper canyon mexico", "cancun beach caribbean", "mexican street food tacos"],
  },

  cuba: {
    id: "cuba",
    name: "Cuba",
    flag: "🇨🇺",
    heroImage: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=1600&q=80",
    region: "Caribbean",
    scores: {
      luxury: 28, nature: 72, city: 65, relaxation: 80, adventure: 55,
      social: 80, nightlife: 82, cultural: 88, food: 62, beach: 85,
      budget: 55, family: 58, romance: 80, wellness: 55,
    },
    climates: ["tropical", "warm"],
    travelStyles: ["cultural", "social", "budget", "beach", "adventure", "road-trip"],
    activities: ["history", "beach", "nightlife", "photography", "food", "music", "diving", "cycling"],
    cities: [
      { name: "Havana",     tagline: "Classic cars and crumbling grandeur",      bestFor: ["culture", "nightlife", "photography"], budgetFit: "budget" },
      { name: "Trinidad",   tagline: "UNESCO cobblestone colonial gem",          bestFor: ["history", "culture", "music"],         budgetFit: "budget" },
      { name: "Viñales",    tagline: "Tobacco valleys and mogote cliffs",        bestFor: ["nature", "cycling", "photography"],    budgetFit: "budget" },
      { name: "Varadero",   tagline: "Long white sand Caribbean peninsula",      bestFor: ["beach", "relaxation", "diving"],       budgetFit: "mid-range" },
      { name: "Cienfuegos", tagline: "Pearl of the South French-style port",    bestFor: ["culture", "history", "relaxation"],    budgetFit: "budget" },
    ],
    environmentTypes: ["beach", "tropical", "city", "countryside", "coastal", "ocean", "valley"],
    atmosphereTags: ["vibrant", "nostalgic", "tropical", "colorful", "musical", "warm", "spirited", "romantic"],
    architectureIdentity: ["colonial", "spanish-colonial", "art-deco", "neoclassical", "cuban", "caribbean"],
    culturalIdentity: ["caribbean", "cuban", "latin-american", "afro-cuban", "spanish-colonial"],
    emotionalProfile: ["nostalgic", "free", "joyful", "inspired", "romantic"],
    terrain: ["coastal", "flat", "mountainous"],
    cityStyle: ["historic", "traditional", "old-town"],
    foodSignals: ["local-cuisine", "street-food"],
    landmarkKeys: ["old havana classic car", "havana vintage car", "cuban salsa", "viñales valley", "varadero beach cuba", "trinidad cuba cobblestone", "havana malecon", "cuban cigar tobacco", "havana colonial buildings"],
  },

  costarica: {
    id: "costarica",
    name: "Costa Rica",
    flag: "🇨🇷",
    heroImage: "https://images.unsplash.com/photo-1518259102261-b40117eabbc9?w=1600&q=80",
    region: "Central America",
    scores: {
      luxury: 52, nature: 97, city: 25, relaxation: 75, adventure: 95,
      social: 55, nightlife: 42, cultural: 58, food: 62, beach: 82,
      budget: 58, family: 80, romance: 72, wellness: 82,
    },
    climates: ["tropical", "warm"],
    travelStyles: ["adventure", "nature", "wildlife", "eco", "family", "wellness", "road-trip"],
    activities: ["wildlife-viewing", "hiking", "surfing", "zip-line", "kayaking", "photography", "wellness", "diving"],
    cities: [
      { name: "Arenal",         tagline: "Volcano, hot springs, and canopy",       bestFor: ["nature", "adventure", "wellness"],    budgetFit: "mid-range" },
      { name: "Monteverde",     tagline: "Cloud forest and suspended bridges",     bestFor: ["nature", "wildlife", "photography"],  budgetFit: "mid-range" },
      { name: "Manuel Antonio", tagline: "Monkeys, sloths, and Pacific beaches",  bestFor: ["wildlife", "beach", "nature"],        budgetFit: "mid-range" },
      { name: "Tortuguero",     tagline: "Sea turtle canals in the rainforest",    bestFor: ["wildlife", "nature", "kayaking"],     budgetFit: "mid-range" },
      { name: "Osa Peninsula",  tagline: "Most biologically intense place on earth",bestFor: ["wildlife", "nature", "diving"],      budgetFit: "luxury" },
    ],
    environmentTypes: ["rainforest", "jungle", "volcanic", "beach", "coastal", "cloud-forest", "tropical", "ocean", "river", "canyon"],
    atmosphereTags: ["lush", "wild", "tropical", "serene", "pristine", "vibrant", "raw", "verdant"],
    architectureIdentity: ["vernacular", "eco-lodge", "modern", "tropical"],
    culturalIdentity: ["central-american", "latin-american", "costa-rican", "pura-vida"],
    emotionalProfile: ["free", "awestruck", "exhilarated", "serene", "adventurous"],
    terrain: ["mountainous", "coastal", "forested", "volcanic", "island"],
    cityStyle: ["modern", "traditional"],
    foodSignals: ["local-cuisine", "street-food", "tropical-fruits"],
    landmarkKeys: ["arenal volcano costa rica", "sloth costa rica", "toucan costa rica", "cloud forest monteverde", "zip-line costa rica", "sea turtle costa rica", "quetzal bird", "costa rica wildlife rainforest", "manuel antonio beach"],
  },

  botswana: {
    id: "botswana",
    name: "Botswana",
    flag: "🇧🇼",
    heroImage: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80",
    region: "Sub-Saharan Africa",
    scores: {
      luxury: 78, nature: 98, city: 15, relaxation: 72, adventure: 88,
      social: 35, nightlife: 15, cultural: 55, food: 48, beach: 0,
      budget: 25, family: 62, romance: 72, wellness: 58,
    },
    climates: ["warm", "desert"],
    travelStyles: ["luxury", "safari", "nature", "wildlife", "photography", "adventure"],
    activities: ["safari", "wildlife-viewing", "game-drive", "photography", "camping", "kayaking", "mokoro"],
    cities: [
      { name: "Okavango Delta",    tagline: "UNESCO water safari paradise",            bestFor: ["wildlife", "safari", "photography"], budgetFit: "luxury" },
      { name: "Chobe",             tagline: "World's largest elephant population",     bestFor: ["wildlife", "safari", "nature"],      budgetFit: "luxury" },
      { name: "Moremi",            tagline: "Big Cats in the delta's wild heart",      bestFor: ["wildlife", "safari", "photography"], budgetFit: "luxury" },
      { name: "Makgadikgadi Pans", tagline: "Endless salt flats and zebra migration", bestFor: ["nature", "photography", "adventure"], budgetFit: "luxury" },
      { name: "Central Kalahari",  tagline: "Remote desert wilderness for true wild",  bestFor: ["nature", "adventure", "wildlife"],   budgetFit: "luxury" },
    ],
    environmentTypes: ["savanna", "wetland", "delta", "bush", "wildlife", "desert", "grassland", "plains", "channel", "floodplain"],
    atmosphereTags: ["wild", "pristine", "vast", "earthy", "quiet", "dramatic", "raw", "exclusive"],
    architectureIdentity: ["tented-camp", "eco-lodge", "african", "traditional-african"],
    culturalIdentity: ["african", "botswanan", "tswana", "san-bushmen", "sub-saharan"],
    emotionalProfile: ["awestruck", "humbled", "peaceful", "adventurous", "free"],
    terrain: ["flat", "desert", "forested"],
    cityStyle: ["traditional"],
    foodSignals: ["local-cuisine", "grilled"],
    landmarkKeys: ["okavango delta", "chobe elephant", "botswana safari", "makgadikgadi pans zebra", "wild dog africa botswana", "mokoro canoe botswana", "kalahari desert botswana", "luxury safari camp botswana"],
  },

  namibia: {
    id: "namibia",
    name: "Namibia",
    flag: "🇳🇦",
    heroImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1600&q=80",
    region: "Sub-Saharan Africa",
    scores: {
      luxury: 60, nature: 97, city: 20, relaxation: 65, adventure: 92,
      social: 30, nightlife: 18, cultural: 60, food: 45, beach: 28,
      budget: 55, family: 55, romance: 68, wellness: 55,
    },
    climates: ["desert", "warm"],
    travelStyles: ["adventure", "nature", "photography", "road-trip", "wildlife", "camping"],
    activities: ["photography", "hiking", "safari", "wildlife-viewing", "camping", "off-road", "trekking"],
    cities: [
      { name: "Swakopmund",     tagline: "German colonial adventure base on the Atlantic", bestFor: ["adventure", "culture", "road-trip"], budgetFit: "mid-range" },
      { name: "Windhoek",       tagline: "Namibia's vibrant and welcoming capital city",   bestFor: ["culture", "food", "city"],           budgetFit: "mid-range" },
      { name: "Sossusvlei",     tagline: "Red dunes and white Deadvlei clay pan",          bestFor: ["photography", "nature", "hiking"],   budgetFit: "mid-range" },
      { name: "Etosha",         tagline: "Salt pan wildlife around waterholes",             bestFor: ["safari", "wildlife", "photography"], budgetFit: "mid-range" },
      { name: "Fish River Canyon", tagline: "World's second-largest canyon",               bestFor: ["hiking", "nature", "photography"],   budgetFit: "budget" },
    ],
    environmentTypes: ["desert", "dunes", "arid", "savanna", "coastal", "fog", "canyon", "rocky"],
    atmosphereTags: ["dramatic", "vast", "otherworldly", "pristine", "ancient", "silent", "raw", "dramatic"],
    architectureIdentity: ["german-colonial", "vernacular", "eco-lodge", "african"],
    culturalIdentity: ["african", "namibian", "himba", "san-bushmen", "german-colonial", "sub-saharan"],
    emotionalProfile: ["awestruck", "humbled", "free", "adventurous", "peaceful"],
    terrain: ["desert", "rocky", "coastal", "mountainous"],
    cityStyle: ["traditional", "modern"],
    foodSignals: ["local-cuisine", "grilled"],
    landmarkKeys: ["sossusvlei dunes", "deadvlei", "namib desert dunes", "etosha safari namibia", "skeleton coast namibia", "fish river canyon", "quiver tree forest", "himba people namibia", "namibia red sand dunes"],
  },

  cambodia: {
    id: "cambodia",
    name: "Cambodia",
    flag: "🇰🇭",
    heroImage: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1600&q=80",
    region: "Southeast Asia",
    scores: {
      luxury: 42, nature: 60, city: 38, relaxation: 55, adventure: 62,
      social: 52, nightlife: 40, cultural: 95, food: 65, beach: 45,
      budget: 88, family: 68, romance: 60, wellness: 52,
    },
    climates: ["tropical", "warm", "humid"],
    travelStyles: ["cultural", "history", "backpacking", "budget", "temples", "photography"],
    activities: ["temples", "photography", "history", "tuk-tuk-rides", "boat-tours", "cooking-class", "beach"],
    cities: [
      { name: "Siem Reap",   tagline: "Gateway to Angkor Wat world wonder",       bestFor: ["history", "culture", "photography"], budgetFit: "budget" },
      { name: "Phnom Penh",  tagline: "Vibrant capital with royal palace & river", bestFor: ["culture", "history", "food"],        budgetFit: "budget" },
      { name: "Sihanoukville", tagline: "Tropical coast with islands and beaches", bestFor: ["beach", "relaxation", "adventure"],  budgetFit: "budget" },
      { name: "Battambang",  tagline: "Colonial charm and bamboo train rides",     bestFor: ["culture", "photography", "nature"],  budgetFit: "budget" },
    ],
    environmentTypes: ["temple", "jungle", "ruins", "tropical", "river", "coastal", "wetland"],
    atmosphereTags: ["ancient", "spiritual", "mystical", "humble", "lush", "warm", "timeless"],
    architectureIdentity: ["khmer", "buddhist-temple", "colonial", "wooden-stilt"],
    culturalIdentity: ["buddhist", "khmer", "southeast-asian", "cambodian"],
    emotionalProfile: ["humbled", "curious", "adventurous", "peaceful", "moved"],
    terrain: ["flat", "forested", "coastal"],
    cityStyle: ["traditional", "historic"],
    foodSignals: ["local-cuisine", "street-food", "tropical-fruits", "asian-cuisine"],
    landmarkKeys: ["angkor wat", "bayon temple face", "ta prohm", "angkor complex", "khmer ruin", "siem reap temple"],
  },

  czechrepublic: {
    id: "czechrepublic",
    name: "Czech Republic",
    flag: "🇨🇿",
    heroImage: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1600&q=80",
    region: "Central Europe",
    scores: {
      luxury: 65, nature: 50, city: 82, relaxation: 58, adventure: 45,
      social: 70, nightlife: 72, cultural: 88, food: 70, beach: 0,
      budget: 68, family: 72, romance: 80, wellness: 55,
    },
    climates: ["temperate", "cold"],
    travelStyles: ["cultural", "history", "city-break", "romantic", "beer-culture", "architecture"],
    activities: ["sightseeing", "architecture", "history", "museums", "beer-tasting", "hiking", "castles"],
    cities: [
      { name: "Prague",          tagline: "Fairy-tale old town and Gothic spires",        bestFor: ["culture", "history", "romance"],      budgetFit: "mid-range" },
      { name: "Cesky Krumlov",   tagline: "UNESCO riverside castle and cobblestone charm", bestFor: ["romance", "photography", "history"],  budgetFit: "mid-range" },
      { name: "Brno",            tagline: "Czech second city with student energy",         bestFor: ["nightlife", "culture", "food"],        budgetFit: "budget" },
      { name: "Kutna Hora",      tagline: "Medieval silver-mining town with bone church",  bestFor: ["history", "culture", "photography"],   budgetFit: "budget" },
    ],
    environmentTypes: ["old-town", "river", "castle", "medieval", "forested-hills"],
    atmosphereTags: ["fairy-tale", "romantic", "medieval", "vibrant", "charming", "festive"],
    architectureIdentity: ["baroque", "gothic", "art-nouveau", "medieval", "renaissance"],
    culturalIdentity: ["central-european", "czech", "bohemian", "slavic"],
    emotionalProfile: ["enchanted", "romantic", "curious", "nostalgic", "festive"],
    terrain: ["flat", "forested"],
    cityStyle: ["old-town", "historic", "modern"],
    foodSignals: ["local-cuisine", "grilled", "beer"],
    landmarkKeys: ["charles bridge prague", "prague clock tower", "prague castle", "cesky krumlov", "astronomical clock"],
  },

  brazil: {
    id: "brazil",
    name: "Brazil",
    flag: "🇧🇷",
    heroImage: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600&q=80",
    region: "South America",
    scores: {
      luxury: 60, nature: 90, city: 72, relaxation: 65, adventure: 85,
      social: 88, nightlife: 88, cultural: 80, food: 78, beach: 90,
      budget: 60, family: 68, romance: 72, wellness: 60,
    },
    climates: ["tropical", "warm", "humid"],
    travelStyles: ["adventure", "nature", "beach", "carnival", "wildlife", "city", "photography"],
    activities: ["beach", "carnival", "wildlife-viewing", "hiking", "snorkeling", "photography", "samba", "kayaking", "zip-line"],
    cities: [
      { name: "Rio de Janeiro",  tagline: "Carnival, beaches, and Christ the Redeemer",   bestFor: ["beach", "culture", "nightlife"],      budgetFit: "mid-range" },
      { name: "Amazon Manaus",   tagline: "Gateway to the world's greatest rainforest",   bestFor: ["nature", "wildlife", "adventure"],    budgetFit: "mid-range" },
      { name: "Iguazu Falls",    tagline: "World's widest waterfall system — staggering", bestFor: ["nature", "photography", "adventure"], budgetFit: "mid-range" },
      { name: "Fernando de Noronha", tagline: "Remote island paradise for divers",        bestFor: ["diving", "beach", "romance"],         budgetFit: "luxury" },
      { name: "Salvador",        tagline: "Afro-Brazilian culture and colonial colour",   bestFor: ["culture", "nightlife", "history"],    budgetFit: "budget" },
    ],
    environmentTypes: ["rainforest", "beach", "jungle", "wetland", "city", "waterfall", "coastal", "tropical-island"],
    atmosphereTags: ["vibrant", "wild", "festive", "dramatic", "lush", "warm", "sensual", "energetic"],
    architectureIdentity: ["colonial", "modern", "favela-mosaic", "baroque"],
    culturalIdentity: ["brazilian", "afro-brazilian", "latin-american", "portuguese-colonial"],
    emotionalProfile: ["joyful", "adventurous", "free", "awestruck", "energized"],
    terrain: ["mountainous", "coastal", "forested", "flat"],
    cityStyle: ["modern", "historic", "traditional"],
    foodSignals: ["local-cuisine", "street-food", "grilled", "tropical-fruits", "seafood"],
    landmarkKeys: ["christ the redeemer", "rio de janeiro statue", "iguazu falls", "sugarloaf mountain", "amazon river brazil", "carnival rio"],
  },

  colombia: {
    id: "colombia",
    name: "Colombia",
    flag: "🇨🇴",
    heroImage: "https://images.unsplash.com/photo-1563974475-991b8c3c6e08?w=1600&q=80",
    region: "South America",
    scores: {
      luxury: 52, nature: 82, city: 65, relaxation: 58, adventure: 80,
      social: 82, nightlife: 75, cultural: 85, food: 72, beach: 62,
      budget: 75, family: 62, romance: 70, wellness: 55,
    },
    climates: ["tropical", "warm", "temperate-highland"],
    travelStyles: ["cultural", "adventure", "nature", "coffee", "history", "backpacking", "city"],
    activities: ["coffee-tour", "hiking", "history", "sightseeing", "wildlife-viewing", "salsa-dancing", "kayaking", "canyoning"],
    cities: [
      { name: "Cartagena",    tagline: "Walled colonial city on the Caribbean",         bestFor: ["history", "romance", "beach"],        budgetFit: "mid-range" },
      { name: "Medellín",     tagline: "Innovating city reborn with cable cars",         bestFor: ["city", "nightlife", "culture"],       budgetFit: "budget" },
      { name: "Salento",      tagline: "Coffee country and wax palm valley",             bestFor: ["nature", "photography", "hiking"],    budgetFit: "budget" },
      { name: "Bogotá",       tagline: "High-altitude capital rich in art and history",  bestFor: ["culture", "history", "food"],         budgetFit: "budget" },
      { name: "Tayrona",      tagline: "Caribbean jungle meets pristine beaches",        bestFor: ["nature", "beach", "adventure"],       budgetFit: "budget" },
    ],
    environmentTypes: ["colonial", "jungle", "mountain", "cloud-forest", "beach", "valley", "city", "coffee-plantation"],
    atmosphereTags: ["vibrant", "colorful", "warm", "wild", "festive", "lush", "passionate", "resilient"],
    architectureIdentity: ["spanish-colonial", "colorful", "modern"],
    culturalIdentity: ["colombian", "latin-american", "afro-caribbean", "indigenous"],
    emotionalProfile: ["joyful", "adventurous", "curious", "passionate", "free"],
    terrain: ["mountainous", "coastal", "forested", "flat"],
    cityStyle: ["historic", "modern", "traditional"],
    foodSignals: ["local-cuisine", "street-food", "tropical-fruits", "grilled"],
    landmarkKeys: ["cartagena walled city", "cartagena colombia colonial", "cocora valley wax palm", "medellín cable car", "colombian coffee region"],
  },

  srilanka: {
    id: "srilanka",
    name: "Sri Lanka",
    flag: "🇱🇰",
    heroImage: "https://images.unsplash.com/photo-1586183189334-1ceb609e7a87?w=1600&q=80",
    region: "South Asia",
    scores: {
      luxury: 52, nature: 85, city: 42, relaxation: 72, adventure: 75,
      social: 58, nightlife: 35, cultural: 88, food: 78, beach: 82,
      budget: 80, family: 75, romance: 72, wellness: 75,
    },
    climates: ["tropical", "warm", "monsoon"],
    travelStyles: ["cultural", "nature", "beach", "wildlife", "history", "wellness", "backpacking"],
    activities: ["temples", "wildlife-viewing", "beach", "tea-tour", "hiking", "whale-watching", "surfing", "history"],
    cities: [
      { name: "Sigiriya",   tagline: "Ancient rock fortress rising from the jungle",   bestFor: ["history", "photography", "hiking"],  budgetFit: "budget" },
      { name: "Kandy",      tagline: "Sacred Temple of the Tooth and misty hills",      bestFor: ["culture", "history", "wellness"],    budgetFit: "budget" },
      { name: "Ella",       tagline: "Nine Arch Bridge trains through cloud forest",    bestFor: ["photography", "hiking", "relaxation"], budgetFit: "budget" },
      { name: "Mirissa",    tagline: "Blue whale watching from tropical beach",         bestFor: ["beach", "wildlife", "relaxation"],  budgetFit: "budget" },
      { name: "Galle",      tagline: "Dutch colonial fort on the southern tip",         bestFor: ["history", "romance", "culture"],    budgetFit: "mid-range" },
    ],
    environmentTypes: ["jungle", "beach", "temple", "tea-plantation", "highland", "coastal", "wildlife"],
    atmosphereTags: ["lush", "spiritual", "ancient", "warm", "lively", "tranquil", "colourful"],
    architectureIdentity: ["buddhist-stupa", "colonial-dutch", "colonial-british", "vernacular"],
    culturalIdentity: ["sinhalese", "tamil", "buddhist", "south-asian", "srilankan"],
    emotionalProfile: ["peaceful", "curious", "humbled", "adventurous", "refreshed"],
    terrain: ["mountainous", "coastal", "forested", "flat"],
    cityStyle: ["historic", "traditional"],
    foodSignals: ["local-cuisine", "spiced", "seafood", "street-food", "tropical-fruits"],
    landmarkKeys: ["sigiriya rock fortress", "lion rock sri lanka", "nine arch bridge ella", "temple of the tooth kandy", "sri lanka tea plantation", "elephant sri lanka"],
  },

  philippines: {
    id: "philippines",
    name: "Philippines",
    flag: "🇵🇭",
    heroImage: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1600&q=80",
    region: "Southeast Asia",
    scores: {
      luxury: 48, nature: 90, city: 45, relaxation: 80, adventure: 82,
      social: 72, nightlife: 52, cultural: 65, food: 65, beach: 96,
      budget: 82, family: 72, romance: 82, wellness: 72,
    },
    climates: ["tropical", "warm", "humid"],
    travelStyles: ["beach", "island-hopping", "adventure", "diving", "backpacking", "nature", "photography"],
    activities: ["island-hopping", "diving", "snorkeling", "surfing", "hiking", "photography", "trekking", "beach"],
    cities: [
      { name: "El Nido",         tagline: "Limestone karsts and emerald lagoons of Palawan", bestFor: ["beach", "diving", "photography"], budgetFit: "mid-range" },
      { name: "Siargao",         tagline: "Cloud Nine surf and laid-back island life",        bestFor: ["surfing", "relaxation", "adventure"], budgetFit: "budget" },
      { name: "Bohol",           tagline: "Chocolate Hills, tarsiers, and pristine beaches",  bestFor: ["nature", "photography", "beach"], budgetFit: "budget" },
      { name: "Batad",           tagline: "Ifugao rice terraces carved 2000 years ago",       bestFor: ["culture", "trekking", "photography"], budgetFit: "budget" },
      { name: "Boracay",         tagline: "Powdery white sand beach and vibrant nightlife",   bestFor: ["beach", "nightlife", "relaxation"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["tropical-island", "beach", "jungle", "reef", "lagoon", "rice-terrace", "volcanic"],
    atmosphereTags: ["paradise", "lush", "tranquil", "vibrant", "warm", "pristine", "adventurous"],
    architectureIdentity: ["colonial-spanish", "vernacular-stilt", "modern"],
    culturalIdentity: ["filipino", "southeast-asian", "hispanic-catholic", "indigenous"],
    emotionalProfile: ["joyful", "free", "adventurous", "peaceful", "amazed"],
    terrain: ["island", "coastal", "mountainous", "volcanic"],
    cityStyle: ["traditional", "historic", "modern"],
    foodSignals: ["local-cuisine", "seafood", "street-food", "tropical-fruits"],
    landmarkKeys: ["el nido palawan", "palawan lagoon", "banaue rice terraces", "chocolate hills bohol", "siargao surf", "tarsier bohol"],
  },

  georgia: {
    id: "georgia",
    name: "Georgia",
    flag: "🇬🇪",
    heroImage: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1600&q=80",
    region: "Caucasus",
    scores: {
      luxury: 42, nature: 85, city: 55, relaxation: 62, adventure: 80,
      social: 62, nightlife: 55, cultural: 88, food: 82, beach: 22,
      budget: 85, family: 62, romance: 70, wellness: 60,
    },
    climates: ["temperate", "cold", "continental"],
    travelStyles: ["adventure", "nature", "cultural", "history", "hiking", "wine", "off-beaten-path", "photography"],
    activities: ["hiking", "trekking", "history", "wine-tasting", "photography", "skiing", "caving", "churches"],
    cities: [
      { name: "Kazbegi",   tagline: "Gergeti Trinity Church above Caucasus glaciers",  bestFor: ["hiking", "photography", "nature"],    budgetFit: "budget" },
      { name: "Tbilisi",   tagline: "Ancient capital with warm people and wine caves", bestFor: ["culture", "food", "nightlife"],       budgetFit: "budget" },
      { name: "Kakheti",   tagline: "UNESCO wine region with 8000-year winemaking",   bestFor: ["wine", "culture", "relaxation"],      budgetFit: "budget" },
      { name: "Svaneti",   tagline: "Medieval towers in Caucasus mountain villages",   bestFor: ["hiking", "adventure", "photography"], budgetFit: "budget" },
    ],
    environmentTypes: ["mountain", "valley", "ancient-city", "vineyard", "cave", "glacier", "highland"],
    atmosphereTags: ["dramatic", "ancient", "warm", "undiscovered", "mystical", "rugged", "vibrant"],
    architectureIdentity: ["orthodox-church", "medieval-tower", "persian-influenced", "soviet", "modern"],
    culturalIdentity: ["georgian", "caucasian", "orthodox-christian", "ancient"],
    emotionalProfile: ["adventurous", "curious", "humbled", "free", "nourished"],
    terrain: ["mountainous", "forested", "rocky", "flat"],
    cityStyle: ["historic", "old-town", "traditional"],
    foodSignals: ["local-cuisine", "grilled", "wine", "bread", "spiced"],
    landmarkKeys: ["gergeti trinity church", "kazbegi georgia", "tbilisi old town", "georgian wine", "svaneti tower", "vardzia cave"],
  },

  malaysia: {
    id: "malaysia",
    name: "Malaysia",
    flag: "🇲🇾",
    heroImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f11?w=1600&q=80",
    region: "Southeast Asia",
    scores: {
      luxury: 65, nature: 85, city: 80, relaxation: 65, adventure: 78,
      social: 72, nightlife: 62, cultural: 82, food: 90, beach: 65,
      budget: 72, family: 80, romance: 62, wellness: 62,
    },
    climates: ["tropical", "warm", "humid"],
    travelStyles: ["nature", "wildlife", "city", "food", "cultural", "beach", "adventure", "family"],
    activities: ["wildlife-viewing", "hiking", "diving", "city-tours", "food-tour", "island-hopping", "photography", "orangutan"],
    cities: [
      { name: "Kuala Lumpur",   tagline: "Petronas Towers and world-class street food",  bestFor: ["city", "food", "culture"],            budgetFit: "mid-range" },
      { name: "Borneo Sabah",   tagline: "Orangutans, pygmy elephants, and coral reefs", bestFor: ["wildlife", "nature", "diving"],       budgetFit: "mid-range" },
      { name: "Penang",         tagline: "UNESCO George Town with murals and hawkers",   bestFor: ["food", "culture", "photography"],     budgetFit: "budget" },
      { name: "Langkawi",       tagline: "Mangrove kayaking and duty-free island life",  bestFor: ["beach", "relaxation", "nature"],     budgetFit: "mid-range" },
      { name: "Cameron Highlands", tagline: "Colonial tea plantations in cool hill air", bestFor: ["nature", "relaxation", "photography"], budgetFit: "budget" },
    ],
    environmentTypes: ["rainforest", "jungle", "beach", "city", "highland", "mangrove", "reef", "wetland"],
    atmosphereTags: ["vibrant", "lush", "diverse", "warm", "wild", "colorful", "multicultural"],
    architectureIdentity: ["modern-islamic", "colonial-british", "traditional-malay", "chinese-shophouse", "futuristic"],
    culturalIdentity: ["malay", "chinese-malay", "indian-malay", "southeast-asian", "multicultural"],
    emotionalProfile: ["curious", "amazed", "energized", "adventurous", "joyful"],
    terrain: ["forested", "coastal", "mountainous", "island", "flat"],
    cityStyle: ["modern", "futuristic", "historic", "traditional"],
    foodSignals: ["street-food", "asian-cuisine", "local-cuisine", "seafood", "spiced"],
    landmarkKeys: ["petronas towers", "petronas twin towers", "batu caves", "borneo orangutan", "kuala lumpur skyline", "penang street art"],
  },

  austria: {
    id: "austria",
    name: "Austria",
    flag: "🇦🇹",
    heroImage: "https://images.unsplash.com/photo-1516550893955-41b521f6ce65?w=1600&q=80",
    region: "Central Europe",
    scores: {
      luxury: 78, nature: 72, city: 75, relaxation: 70, adventure: 60,
      social: 62, nightlife: 58, cultural: 90, food: 78, beach: 0,
      budget: 38, family: 78, romance: 82, wellness: 72,
    },
    climates: ["temperate", "cold", "alpine"],
    travelStyles: ["cultural", "history", "romantic", "luxury", "skiing", "architecture", "music", "wellness"],
    activities: ["skiing", "hiking", "classical-music", "museums", "sightseeing", "architecture", "spa", "lakes"],
    cities: [
      { name: "Vienna",     tagline: "Imperial palaces, coffee houses, and Mozart",   bestFor: ["culture", "history", "romance"],     budgetFit: "luxury" },
      { name: "Hallstatt",  tagline: "Perfectly mirrored Alpine village on a lake",   bestFor: ["photography", "romance", "nature"],  budgetFit: "mid-range" },
      { name: "Salzburg",   tagline: "Baroque city birthplace of Mozart",             bestFor: ["culture", "history", "romance"],     budgetFit: "mid-range" },
      { name: "Innsbruck",  tagline: "Alpine city for skiing and mountain views",      bestFor: ["skiing", "adventure", "nature"],     budgetFit: "mid-range" },
    ],
    environmentTypes: ["alpine", "mountain", "lake", "city", "castle", "valley", "snow"],
    atmosphereTags: ["elegant", "romantic", "grand", "imperial", "charming", "scenic", "historic"],
    architectureIdentity: ["baroque", "imperial", "gothic", "art-nouveau", "rococo"],
    culturalIdentity: ["austrian", "central-european", "habsburg", "germanic"],
    emotionalProfile: ["enchanted", "romantic", "refined", "peaceful", "humbled"],
    terrain: ["mountainous", "forested", "flat"],
    cityStyle: ["historic", "old-town", "modern"],
    foodSignals: ["local-cuisine", "fine-dining", "beer", "grilled"],
    landmarkKeys: ["hallstatt lake austria", "hallstatt village", "schonbrunn palace", "vienna opera house", "grossglockner austria", "salzburg fortress"],
  },

  ireland: {
    id: "ireland",
    name: "Ireland",
    flag: "🇮🇪",
    heroImage: "https://images.unsplash.com/photo-1564959130747-897fb406b9af?w=1600&q=80",
    region: "Western Europe",
    scores: {
      luxury: 55, nature: 80, city: 55, relaxation: 68, adventure: 65,
      social: 75, nightlife: 68, cultural: 82, food: 62, beach: 35,
      budget: 42, family: 75, romance: 75, wellness: 60,
    },
    climates: ["temperate", "cool", "rainy"],
    travelStyles: ["nature", "cultural", "road-trip", "history", "pub-culture", "photography", "hiking"],
    activities: ["hiking", "history", "pub-visits", "coastal-drives", "photography", "castles", "trekking", "cycling"],
    cities: [
      { name: "Cliffs of Moher", tagline: "Dramatic 214m ocean cliffs on the Wild Atlantic", bestFor: ["photography", "nature", "romance"],   budgetFit: "mid-range" },
      { name: "Dublin",          tagline: "Guinness, Trinity College, and Celtic heritage",  bestFor: ["culture", "nightlife", "history"],    budgetFit: "mid-range" },
      { name: "Galway",          tagline: "Student city of murals, music, and festival",     bestFor: ["social", "culture", "nightlife"],     budgetFit: "mid-range" },
      { name: "Ring of Kerry",   tagline: "Scenic ring road through Atlantic landscapes",    bestFor: ["road-trip", "nature", "photography"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["coastal", "cliffs", "green-hills", "castle", "bog", "river", "ocean"],
    atmosphereTags: ["dramatic", "moody", "wild", "warm", "nostalgic", "green", "mystical"],
    architectureIdentity: ["celtic-stone", "medieval", "gothic", "georgian", "thatched"],
    culturalIdentity: ["irish", "celtic", "gaelic", "western-european"],
    emotionalProfile: ["free", "romantic", "nostalgic", "adventurous", "peaceful"],
    terrain: ["coastal", "rocky", "forested", "flat"],
    cityStyle: ["historic", "traditional", "modern"],
    foodSignals: ["local-cuisine", "seafood", "grilled"],
    landmarkKeys: ["cliffs of moher", "ireland green cliffs", "giant's causeway", "basalt columns northern ireland", "ring of kerry", "skellig michael ireland"],
  },

  // Expansion: 50 new destinations
  denmark: {
    id: "denmark", name: "Denmark", flag: "🇩🇰",
    heroImage: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1600&q=80",
    region: "Northern Europe",
    scores: { luxury: 70, nature: 52, city: 72, relaxation: 68, adventure: 42, social: 68, nightlife: 58, cultural: 78, food: 75, beach: 22, budget: 35, family: 80, romance: 68, wellness: 70 },
    climates: ["temperate", "cool"],
    travelStyles: ["cultural", "design", "history", "family", "hygge", "city-break"],
    activities: ["cycling", "museums", "architecture", "history", "family-parks", "castles"],
    cities: [
      { name: "Copenhagen", tagline: "Design, hygge and Nyhavn canal life", bestFor: ["culture", "food", "design"], budgetFit: "luxury" },
      { name: "Aarhus", tagline: "Denmark's second city full of art and café culture", bestFor: ["culture", "food", "nightlife"], budgetFit: "mid-range" },
      { name: "Bornholm", tagline: "Rocky Baltic island with smokehouses and cliffs", bestFor: ["nature", "food", "relaxation"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["canal", "coastal", "city", "countryside", "castle"],
    atmosphereTags: ["cozy", "design-forward", "modern", "fairy-tale", "clean", "welcoming"],
    architectureIdentity: ["scandinavian", "danish-half-timbered", "modern-nordic", "baroque"],
    culturalIdentity: ["danish", "scandinavian", "nordic", "viking"],
    emotionalProfile: ["content", "cozy", "inspired", "relaxed", "joyful"],
    terrain: ["flat", "coastal"], cityStyle: ["modern", "historic"],
    foodSignals: ["fine-dining", "seafood", "local-cuisine", "new-nordic"],
    landmarkKeys: ["nyhavn canal copenhagen", "little mermaid denmark", "kronborg castle"],
  },

  belgium: {
    id: "belgium", name: "Belgium", flag: "🇧🇪",
    heroImage: "https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=1600&q=80",
    region: "Western Europe",
    scores: { luxury: 68, nature: 45, city: 75, relaxation: 60, adventure: 38, social: 68, nightlife: 68, cultural: 88, food: 88, beach: 8, budget: 42, family: 72, romance: 72, wellness: 52 },
    climates: ["temperate", "cool", "rainy"],
    travelStyles: ["cultural", "history", "food", "city-break", "art", "architecture"],
    activities: ["museums", "food-tour", "history", "architecture", "beer-tasting", "chocolate"],
    cities: [
      { name: "Bruges", tagline: "Medieval canals and fairy-tale cobblestones", bestFor: ["romance", "history", "photography"], budgetFit: "mid-range" },
      { name: "Brussels", tagline: "Grand Place grandeur and world-class food scene", bestFor: ["culture", "food", "nightlife"], budgetFit: "mid-range" },
      { name: "Ghent", tagline: "Vibrant student city with medieval waterfront", bestFor: ["culture", "food", "nightlife"], budgetFit: "budget" },
    ],
    environmentTypes: ["canal", "medieval", "city", "countryside"],
    atmosphereTags: ["medieval", "charming", "cozy", "gastronomic", "historic", "art-filled"],
    architectureIdentity: ["gothic", "baroque", "flemish-renaissance", "art-nouveau"],
    culturalIdentity: ["flemish", "walloon", "belgian", "central-european"],
    emotionalProfile: ["charmed", "satisfied", "curious", "romantic"],
    terrain: ["flat", "forested"], cityStyle: ["historic", "modern"],
    foodSignals: ["fine-dining", "local-cuisine", "beer", "chocolate", "street-food"],
    landmarkKeys: ["bruges canal belgium", "grand place brussels", "bruges belfry"],
  },

  germany: {
    id: "germany", name: "Germany", flag: "🇩🇪",
    heroImage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600&q=80",
    region: "Central Europe",
    scores: { luxury: 72, nature: 62, city: 82, relaxation: 60, adventure: 55, social: 72, nightlife: 78, cultural: 88, food: 72, beach: 12, budget: 42, family: 80, romance: 65, wellness: 65 },
    climates: ["temperate", "cold"],
    travelStyles: ["cultural", "history", "city", "architecture", "road-trip", "Christmas-markets"],
    activities: ["castles", "museums", "hiking", "beer-culture", "architecture", "Christmas-markets"],
    cities: [
      { name: "Neuschwanstein", tagline: "Bavaria's fairy-tale castle above the Alps", bestFor: ["photography", "history", "romance"], budgetFit: "mid-range" },
      { name: "Berlin", tagline: "Edgy capital of art, history and nightlife", bestFor: ["culture", "nightlife", "history"], budgetFit: "mid-range" },
      { name: "Munich", tagline: "Beer halls, BMW and Bavarian tradition", bestFor: ["culture", "food", "nightlife"], budgetFit: "mid-range" },
      { name: "Rothenburg", tagline: "Perfectly preserved medieval walled town", bestFor: ["history", "photography", "romance"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["alpine", "medieval", "forest", "city", "river", "castle"],
    atmosphereTags: ["grand", "historic", "vibrant", "efficient", "festive", "romantic"],
    architectureIdentity: ["baroque", "gothic", "neoclassical", "bauhaus", "half-timbered"],
    culturalIdentity: ["german", "bavarian", "central-european", "germanic"],
    emotionalProfile: ["inspired", "festive", "curious", "efficient"],
    terrain: ["mountainous", "forested", "flat", "coastal"],
    cityStyle: ["historic", "modern", "old-town"],
    foodSignals: ["local-cuisine", "beer", "grilled", "fine-dining"],
    landmarkKeys: ["neuschwanstein castle bavaria", "brandenburg gate berlin", "cologne cathedral germany"],
  },

  hungary: {
    id: "hungary", name: "Hungary", flag: "🇭🇺",
    heroImage: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1600&q=80",
    region: "Central Europe",
    scores: { luxury: 60, nature: 50, city: 78, relaxation: 72, adventure: 42, social: 68, nightlife: 72, cultural: 88, food: 78, beach: 0, budget: 68, family: 70, romance: 80, wellness: 78 },
    climates: ["temperate", "continental"],
    travelStyles: ["cultural", "history", "romance", "wellness", "city-break", "architecture"],
    activities: ["thermal-baths", "sightseeing", "history", "museums", "ruin-bars", "wine-tasting"],
    cities: [
      { name: "Budapest", tagline: "Grand thermal baths and Parliament on the Danube", bestFor: ["romance", "culture", "wellness"], budgetFit: "mid-range" },
      { name: "Eger", tagline: "Castle, red wine and baroque old town", bestFor: ["culture", "food", "history"], budgetFit: "budget" },
      { name: "Tokaj", tagline: "UNESCO wine region of golden Aszú", bestFor: ["wine", "nature", "relaxation"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["river", "thermal-bath", "city", "castle", "vineyard"],
    atmosphereTags: ["grand", "romantic", "historic", "relaxed", "festive"],
    architectureIdentity: ["baroque", "art-nouveau", "neoclassical", "secession"],
    culturalIdentity: ["hungarian", "central-european", "slavic-germanic"],
    emotionalProfile: ["romantic", "refreshed", "curious", "grand"],
    terrain: ["flat", "forested"], cityStyle: ["historic", "modern", "old-town"],
    foodSignals: ["local-cuisine", "grilled", "wine", "spiced", "fine-dining"],
    landmarkKeys: ["budapest parliament danube", "chain bridge budapest", "széchenyi thermal bath"],
  },

  poland: {
    id: "poland", name: "Poland", flag: "🇵🇱",
    heroImage: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1600&q=80",
    region: "Central Europe",
    scores: { luxury: 52, nature: 58, city: 72, relaxation: 55, adventure: 52, social: 68, nightlife: 65, cultural: 88, food: 70, beach: 12, budget: 75, family: 72, romance: 65, wellness: 55 },
    climates: ["temperate", "cold"],
    travelStyles: ["cultural", "history", "WWII-history", "architecture", "nature", "city-break"],
    activities: ["history", "museums", "castles", "trekking", "food-tour", "salt-mine"],
    cities: [
      { name: "Krakow", tagline: "Royal capital with magnificent Old Town", bestFor: ["history", "culture", "nightlife"], budgetFit: "budget" },
      { name: "Warsaw", tagline: "Rebuilt city blending history with modern buzz", bestFor: ["culture", "history", "food"], budgetFit: "budget" },
      { name: "Gdańsk", tagline: "Hanseatic port city of amber and seafarers", bestFor: ["history", "culture", "sea"], budgetFit: "budget" },
      { name: "Zakopane", tagline: "Gateway to the dramatic Tatra Mountains", bestFor: ["hiking", "adventure", "nature"], budgetFit: "budget" },
    ],
    environmentTypes: ["medieval", "mountain", "forest", "city", "castle"],
    atmosphereTags: ["resilient", "historic", "vibrant", "artistic", "welcoming"],
    architectureIdentity: ["gothic", "baroque", "art-nouveau", "socialist-realist"],
    culturalIdentity: ["polish", "slavic", "central-european", "catholic"],
    emotionalProfile: ["moved", "curious", "humbled", "festive"],
    terrain: ["flat", "mountainous", "forested", "coastal"],
    cityStyle: ["historic", "modern", "old-town"],
    foodSignals: ["local-cuisine", "grilled", "beer", "street-food"],
    landmarkKeys: ["krakow old town poland", "wawel castle poland", "wieliczka salt mine"],
  },

  unitedkingdom: {
    id: "unitedkingdom", name: "United Kingdom", flag: "🇬🇧",
    heroImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=80",
    region: "Western Europe",
    scores: { luxury: 75, nature: 65, city: 85, relaxation: 58, adventure: 55, social: 75, nightlife: 78, cultural: 92, food: 70, beach: 30, budget: 30, family: 80, romance: 68, wellness: 60 },
    climates: ["temperate", "cool", "rainy"],
    travelStyles: ["cultural", "history", "city", "nature", "royal", "literature"],
    activities: ["museums", "history", "theatre", "hiking", "castles", "pub-culture", "gardens"],
    cities: [
      { name: "London", tagline: "World capital of museums, theatre and culture", bestFor: ["culture", "nightlife", "history"], budgetFit: "luxury" },
      { name: "Edinburgh", tagline: "Gothic capital with castle, fringe and whisky", bestFor: ["culture", "history", "nightlife"], budgetFit: "mid-range" },
      { name: "Lake District", tagline: "Poetic mountains and shimmering tarns", bestFor: ["hiking", "nature", "photography"], budgetFit: "mid-range" },
      { name: "Cotswolds", tagline: "Honey stone villages from a picture book", bestFor: ["romance", "photography", "history"], budgetFit: "luxury" },
    ],
    environmentTypes: ["city", "countryside", "coastal", "highland", "castle"],
    atmosphereTags: ["historic", "cultural", "grand", "green", "rainy", "vibrant"],
    architectureIdentity: ["georgian", "gothic", "victorian", "tudor", "neoclassical"],
    culturalIdentity: ["british", "english", "welsh", "scottish", "western-european"],
    emotionalProfile: ["proud", "curious", "entertained", "inspired"],
    terrain: ["coastal", "forested", "mountainous", "flat"],
    cityStyle: ["historic", "modern", "old-town"],
    foodSignals: ["local-cuisine", "fine-dining", "street-food", "pub"],
    landmarkKeys: ["big ben westminster london", "tower bridge london", "stonehenge england"],
  },

  scotland: {
    id: "scotland", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
    region: "Northern Europe",
    scores: { luxury: 58, nature: 88, city: 55, relaxation: 68, adventure: 78, social: 65, nightlife: 60, cultural: 82, food: 58, beach: 28, budget: 42, family: 68, romance: 80, wellness: 65 },
    climates: ["temperate", "cool", "rainy"],
    travelStyles: ["nature", "adventure", "history", "whisky", "photography", "road-trip"],
    activities: ["hiking", "castles", "whisky-tasting", "photography", "history", "wildlife-viewing"],
    cities: [
      { name: "Edinburgh", tagline: "Castle on a volcanic crag, fringe and whisky", bestFor: ["culture", "history", "nightlife"], budgetFit: "mid-range" },
      { name: "Isle of Skye", tagline: "Dramatic basalt pinnacles and fairy pools", bestFor: ["photography", "hiking", "nature"], budgetFit: "mid-range" },
      { name: "Highlands", tagline: "Misty glens, red deer and ancient castles", bestFor: ["nature", "road-trip", "photography"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["highland", "coastal", "loch", "castle", "moorland"],
    atmosphereTags: ["dramatic", "wild", "moody", "mysterious", "rugged", "romantic"],
    architectureIdentity: ["scottish-baronial", "celtic-stone", "highland-vernacular", "gothic"],
    culturalIdentity: ["scottish", "gaelic", "celtic", "nordic-influenced"],
    emotionalProfile: ["adventurous", "free", "romantic", "humbled", "mysterious"],
    terrain: ["mountainous", "coastal", "rocky", "forested"],
    cityStyle: ["historic", "traditional"],
    foodSignals: ["seafood", "local-cuisine", "whisky", "grilled"],
    landmarkKeys: ["edinburgh castle scotland", "isle of skye storr", "eilean donan castle loch"],
  },

  saudiarabia: {
    id: "saudiarabia", name: "Saudi Arabia", flag: "🇸🇦",
    heroImage: "https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=1600&q=80",
    region: "Middle East",
    scores: { luxury: 88, nature: 62, city: 72, relaxation: 60, adventure: 65, social: 45, nightlife: 22, cultural: 82, food: 70, beach: 55, budget: 20, family: 60, romance: 45, wellness: 55 },
    climates: ["desert", "warm", "arid"],
    travelStyles: ["luxury", "adventure", "history", "cultural", "desert", "diving"],
    activities: ["desert-safari", "history", "diving", "architecture", "hiking", "camping"],
    cities: [
      { name: "AlUla", tagline: "Ancient Nabataean tombs in rose-red canyon", bestFor: ["history", "photography", "adventure"], budgetFit: "luxury" },
      { name: "Riyadh", tagline: "Modern capital of glass and Edge of the World", bestFor: ["city", "culture", "luxury"], budgetFit: "luxury" },
      { name: "Jeddah", tagline: "Red Sea diver's hub and coral-stone old city", bestFor: ["diving", "history", "food"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["desert", "ancient-ruins", "dunes", "coastal", "canyon"],
    atmosphereTags: ["ancient", "vast", "dramatic", "luxurious", "mysterious"],
    architectureIdentity: ["nabataean", "islamic", "mud-brick", "modern-glass"],
    culturalIdentity: ["arabic", "islamic", "middle-eastern", "bedouin"],
    emotionalProfile: ["awestruck", "curious", "humbled", "adventurous"],
    terrain: ["desert", "mountainous", "coastal"],
    cityStyle: ["modern", "historic", "traditional"],
    foodSignals: ["local-cuisine", "grilled", "spiced", "seafood"],
    landmarkKeys: ["alula ancient carved sandstone", "hegra nabataean tomb saudi", "edge world escarpment riyadh"],
  },

  qatar: {
    id: "qatar", name: "Qatar", flag: "🇶🇦",
    heroImage: "https://images.unsplash.com/photo-1579033366696-3c9e5e6e6b7e?w=1600&q=80",
    region: "Middle East",
    scores: { luxury: 90, nature: 42, city: 80, relaxation: 65, adventure: 50, social: 58, nightlife: 45, cultural: 75, food: 72, beach: 52, budget: 15, family: 68, romance: 58, wellness: 65 },
    climates: ["desert", "warm", "arid"],
    travelStyles: ["luxury", "cultural", "city-break", "sport", "modern-architecture"],
    activities: ["museums", "architecture", "desert-safari", "diving", "shopping", "sports"],
    cities: [
      { name: "Doha", tagline: "Futuristic skyline meets Islamic museum masterpiece", bestFor: ["culture", "luxury", "architecture"], budgetFit: "luxury" },
      { name: "Inland Sea", tagline: "Dunes meeting turquoise sea in raw desert", bestFor: ["adventure", "photography", "nature"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["city", "desert", "coastal", "modern"],
    atmosphereTags: ["luxurious", "modern", "clean", "cultural", "surprising"],
    architectureIdentity: ["modern-islamic", "futuristic", "contemporary"],
    culturalIdentity: ["qatari", "arabic", "islamic", "middle-eastern"],
    emotionalProfile: ["impressed", "curious", "comfortable", "adventurous"],
    terrain: ["flat", "desert", "coastal"],
    cityStyle: ["modern", "futuristic"],
    foodSignals: ["fine-dining", "seafood", "local-cuisine", "spiced"],
    landmarkKeys: ["museum islamic art doha", "doha west bay skyline", "pearl qatar marina"],
  },

  oman: {
    id: "oman", name: "Oman", flag: "🇴🇲",
    heroImage: "https://images.unsplash.com/photo-1585016495481-91e8e9b52fc2?w=1600&q=80",
    region: "Middle East",
    scores: { luxury: 65, nature: 82, city: 48, relaxation: 72, adventure: 80, social: 52, nightlife: 28, cultural: 85, food: 65, beach: 72, budget: 55, family: 68, romance: 72, wellness: 68 },
    climates: ["desert", "warm", "subtropical"],
    travelStyles: ["adventure", "nature", "cultural", "history", "desert", "diving"],
    activities: ["desert-safari", "hiking", "diving", "history", "snorkelling", "road-trip"],
    cities: [
      { name: "Muscat", tagline: "Grand mosque, souq and dramatic fjords nearby", bestFor: ["culture", "history", "relaxation"], budgetFit: "mid-range" },
      { name: "Wahiba Sands", tagline: "Vast gold and red dunes of the interior", bestFor: ["adventure", "photography", "camping"], budgetFit: "mid-range" },
      { name: "Salalah", tagline: "Monsoon greenery in the Southern Arabian desert", bestFor: ["nature", "relaxation", "culture"], budgetFit: "mid-range" },
      { name: "Musandam", tagline: "Arabian Fjords — turquoise inlets by dhow", bestFor: ["diving", "photography", "nature"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["desert", "fjord", "canyon", "coastal", "mountain", "oasis"],
    atmosphereTags: ["ancient", "serene", "dramatic", "hospitable", "pristine"],
    architectureIdentity: ["islamic", "fort", "traditional-omani", "mud-brick"],
    culturalIdentity: ["omani", "arabic", "ibadi-muslim", "bedouin"],
    emotionalProfile: ["peaceful", "adventurous", "humbled", "curious"],
    terrain: ["desert", "mountainous", "coastal"],
    cityStyle: ["traditional", "historic"],
    foodSignals: ["local-cuisine", "seafood", "spiced", "grilled"],
    landmarkKeys: ["sultan qaboos grand mosque muscat", "wahiba sands oman dune", "musandam fjord oman turquoise"],
  },

  lebanon: {
    id: "lebanon", name: "Lebanon", flag: "🇱🇧",
    heroImage: "https://images.unsplash.com/photo-1574068468509-c1a4e42f1dde?w=1600&q=80",
    region: "Middle East",
    scores: { luxury: 62, nature: 62, city: 72, relaxation: 55, adventure: 58, social: 80, nightlife: 82, cultural: 90, food: 92, beach: 60, budget: 58, family: 62, romance: 68, wellness: 55 },
    climates: ["mediterranean", "temperate", "mountain"],
    travelStyles: ["cultural", "history", "food", "nightlife", "adventure", "off-beaten-path"],
    activities: ["history", "food-tour", "hiking", "skiing", "nightlife", "swimming", "archaeology"],
    cities: [
      { name: "Baalbek", tagline: "Roman temples on a colossal scale", bestFor: ["history", "photography", "culture"], budgetFit: "budget" },
      { name: "Beirut", tagline: "Resilient capital of art, food and nightlife", bestFor: ["nightlife", "food", "culture"], budgetFit: "mid-range" },
      { name: "Byblos", tagline: "One of the world's oldest inhabited cities", bestFor: ["history", "culture", "beach"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["ancient-ruins", "mountain", "coastal", "city", "cedar-forest"],
    atmosphereTags: ["vibrant", "resilient", "ancient", "gastronomic", "passionate"],
    architectureIdentity: ["roman", "ottoman", "french-colonial", "phoenician"],
    culturalIdentity: ["lebanese", "phoenician", "arab", "mediterranean"],
    emotionalProfile: ["joyful", "curious", "moved", "passionate"],
    terrain: ["mountainous", "coastal", "forested"],
    cityStyle: ["modern", "historic", "old-town"],
    foodSignals: ["local-cuisine", "fine-dining", "street-food", "mediterranean", "spiced"],
    landmarkKeys: ["baalbek roman temple lebanon", "byblos ancient port lebanon", "cedar tree mountain lebanon"],
  },

  madagascar: {
    id: "madagascar", name: "Madagascar", flag: "🇲🇬",
    heroImage: "https://images.unsplash.com/photo-1504020378809-0a37fd6c7c59?w=1600&q=80",
    region: "Indian Ocean",
    scores: { luxury: 42, nature: 98, city: 18, relaxation: 62, adventure: 88, social: 35, nightlife: 18, cultural: 68, food: 48, beach: 72, budget: 68, family: 55, romance: 65, wellness: 58 },
    climates: ["tropical", "warm", "seasonal"],
    travelStyles: ["wildlife", "nature", "adventure", "photography", "eco-tourism", "off-beaten-path"],
    activities: ["wildlife-viewing", "photography", "hiking", "diving", "snorkelling", "trekking"],
    cities: [
      { name: "Morondava / Baobabs", tagline: "Ancient baobabs line a cathedral avenue", bestFor: ["photography", "nature", "adventure"], budgetFit: "mid-range" },
      { name: "Nosy Be", tagline: "Tropical island with pristine reef", bestFor: ["diving", "beach", "relaxation"], budgetFit: "mid-range" },
      { name: "Andasibe", tagline: "Indri lemur calls ring through the forest", bestFor: ["wildlife", "nature", "photography"], budgetFit: "budget" },
    ],
    environmentTypes: ["rainforest", "desert", "coastal", "wildlife", "baobab"],
    atmosphereTags: ["wild", "otherworldly", "pristine", "remote", "unique", "lush"],
    architectureIdentity: ["vernacular", "eco-lodge"],
    culturalIdentity: ["malagasy", "african-indonesian", "mixed-heritage"],
    emotionalProfile: ["awestruck", "adventurous", "humbled", "joyful"],
    terrain: ["forested", "coastal", "rocky", "desert"],
    cityStyle: ["traditional"],
    foodSignals: ["local-cuisine", "seafood", "tropical-fruits"],
    landmarkKeys: ["avenue des baobabs madagascar", "tsingy de bemaraha madagascar", "ring-tailed lemur madagascar"],
  },

  mauritius: {
    id: "mauritius", name: "Mauritius", flag: "🇲🇺",
    heroImage: "https://images.unsplash.com/photo-1551649001-7a2482d98d05?w=1600&q=80",
    region: "Indian Ocean",
    scores: { luxury: 82, nature: 75, city: 35, relaxation: 90, adventure: 62, social: 55, nightlife: 45, cultural: 62, food: 72, beach: 92, budget: 28, family: 78, romance: 88, wellness: 80 },
    climates: ["tropical", "warm"],
    travelStyles: ["luxury", "beach", "romance", "honeymoon", "wellness", "diving"],
    activities: ["beach", "diving", "snorkelling", "hiking", "water-sports", "spa"],
    cities: [
      { name: "Le Morne", tagline: "Basalt peninsula over turquoise Indian Ocean", bestFor: ["beach", "kite-surfing", "photography"], budgetFit: "luxury" },
      { name: "Chamarel", tagline: "Seven-coloured earth and blue waterfall", bestFor: ["photography", "nature", "culture"], budgetFit: "mid-range" },
      { name: "Grand Baie", tagline: "Northern beach resort with clear lagoon", bestFor: ["beach", "water-sports", "nightlife"], budgetFit: "luxury" },
    ],
    environmentTypes: ["tropical-island", "beach", "lagoon", "reef", "mountain"],
    atmosphereTags: ["paradise", "romantic", "lush", "pristine", "tranquil", "warm"],
    architectureIdentity: ["colonial-french", "colonial-british", "vernacular"],
    culturalIdentity: ["mauritian", "indo-french", "african-creole", "multicultural"],
    emotionalProfile: ["romantic", "peaceful", "blissful", "luxurious"],
    terrain: ["island", "coastal", "volcanic"],
    cityStyle: ["modern", "traditional"],
    foodSignals: ["seafood", "local-cuisine", "fine-dining", "tropical-fruits"],
    landmarkKeys: ["chamarel coloured earth mauritius", "le morne brabant lagoon", "mauritius underwater waterfall"],
  },

  china: {
    id: "china", name: "China", flag: "🇨🇳",
    heroImage: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1600&q=80",
    region: "East Asia",
    scores: { luxury: 72, nature: 85, city: 88, relaxation: 52, adventure: 80, social: 68, nightlife: 62, cultural: 96, food: 92, beach: 38, budget: 65, family: 75, romance: 62, wellness: 65 },
    climates: ["varied", "temperate", "tropical", "alpine", "desert"],
    travelStyles: ["cultural", "history", "nature", "adventure", "food", "photography"],
    activities: ["hiking", "history", "temples", "food-tour", "photography", "wildlife-viewing"],
    cities: [
      { name: "Great Wall / Beijing", tagline: "Fortified ridge walking above ancient civilisation", bestFor: ["history", "photography", "culture"], budgetFit: "mid-range" },
      { name: "Zhangjiajie", tagline: "Avatar's floating mountains in the fog", bestFor: ["photography", "hiking", "nature"], budgetFit: "mid-range" },
      { name: "Guilin / Li River", tagline: "Karst mountains mirrored in the Li River", bestFor: ["photography", "nature", "boat-tour"], budgetFit: "mid-range" },
      { name: "Shanghai", tagline: "Blazing futuristic skyline meets French Concession", bestFor: ["city", "food", "nightlife"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["ancient-ruins", "karst-mountain", "modern-city", "jungle", "desert", "highland"],
    atmosphereTags: ["vast", "ancient", "energetic", "dramatic", "diverse"],
    architectureIdentity: ["imperial-chinese", "modern", "pagoda", "traditional-chinese"],
    culturalIdentity: ["chinese", "han", "east-asian", "confucian"],
    emotionalProfile: ["awestruck", "curious", "energized", "humbled"],
    terrain: ["mountainous", "forested", "flat", "coastal", "desert"],
    cityStyle: ["futuristic", "historic", "modern"],
    foodSignals: ["local-cuisine", "street-food", "asian-cuisine", "fine-dining", "seafood"],
    landmarkKeys: ["great wall china mountain", "zhangjiajie avatar mountain", "li river karst guilin"],
  },

  bhutan: {
    id: "bhutan", name: "Bhutan", flag: "🇧🇹",
    heroImage: "https://images.unsplash.com/photo-1544010807-0b3e2b65adfb?w=1600&q=80",
    region: "South Asia",
    scores: { luxury: 58, nature: 90, city: 22, relaxation: 78, adventure: 75, social: 35, nightlife: 15, cultural: 95, food: 58, beach: 0, budget: 30, family: 60, romance: 75, wellness: 88 },
    climates: ["alpine", "temperate", "cool"],
    travelStyles: ["spiritual", "nature", "cultural", "hiking", "wellness", "photography", "off-beaten-path"],
    activities: ["trekking", "temples", "meditation", "photography", "hiking", "cultural-tours"],
    cities: [
      { name: "Paro Taktsang", tagline: "Tiger's Nest monastery clings to a cliff face", bestFor: ["photography", "hiking", "spiritual"], budgetFit: "mid-range" },
      { name: "Punakha", tagline: "Dzong fortress at the confluence of two rivers", bestFor: ["photography", "culture", "relaxation"], budgetFit: "mid-range" },
      { name: "Thimphu", tagline: "Only capital with no traffic lights", bestFor: ["culture", "history", "food"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["himalayan", "monastery", "alpine", "forest", "valley"],
    atmosphereTags: ["spiritual", "serene", "ancient", "untouched", "mystical", "pure"],
    architectureIdentity: ["dzong-architecture", "buddhist-tibetan", "himalayan"],
    culturalIdentity: ["bhutanese", "buddhist", "tibetan-influenced", "himalayan"],
    emotionalProfile: ["peaceful", "humbled", "spiritual", "free", "refreshed"],
    terrain: ["mountainous", "forested"],
    cityStyle: ["traditional"],
    foodSignals: ["local-cuisine", "spiced"],
    landmarkKeys: ["paro taktsang tiger nest bhutan", "punakha dzong bhutan", "bhutan prayer flag himalaya"],
  },

  unitedstates: {
    id: "unitedstates", name: "United States", flag: "🇺🇸",
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
    region: "North America",
    scores: { luxury: 75, nature: 88, city: 88, relaxation: 65, adventure: 85, social: 78, nightlife: 80, cultural: 82, food: 82, beach: 72, budget: 38, family: 88, romance: 68, wellness: 72 },
    climates: ["varied", "temperate", "tropical", "alpine", "desert"],
    travelStyles: ["adventure", "road-trip", "nature", "city", "national-parks", "beach", "cultural"],
    activities: ["hiking", "national-parks", "road-trip", "beach", "skiing", "food-tour", "city-tours"],
    cities: [
      { name: "New York City", tagline: "World's greatest city of energy and culture",         bestFor: ["city", "culture", "food"],          budgetFit: "luxury" },
      { name: "Las Vegas",     tagline: "Entertainment, nightlife and luxury in the desert",   bestFor: ["nightlife", "luxury", "food"],       budgetFit: "mid-range" },
      { name: "Honolulu",      tagline: "Volcanic islands with perfect Pacific beaches",        bestFor: ["beach", "nature", "romance"],        budgetFit: "luxury" },
      { name: "Grand Canyon",  tagline: "Mile-deep geological marvel in Arizona",              bestFor: ["photography", "hiking", "nature"],   budgetFit: "budget" },
      { name: "Yellowstone",   tagline: "Geysers, bison herds and wild America",              bestFor: ["nature", "wildlife", "photography"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["canyon", "mountain", "forest", "desert", "beach", "city", "wetland"],
    atmosphereTags: ["vast", "dramatic", "energetic", "wild", "diverse", "ambitious"],
    architectureIdentity: ["modern", "neoclassical", "art-deco", "skyscraper", "vernacular"],
    culturalIdentity: ["american", "multicultural", "western"],
    emotionalProfile: ["free", "adventurous", "inspired", "energized"],
    terrain: ["mountainous", "coastal", "desert", "flat", "forested"],
    cityStyle: ["modern", "futuristic", "historic"],
    foodSignals: ["street-food", "fine-dining", "local-cuisine", "seafood"],
    landmarkKeys: ["grand canyon arizona", "monument valley navajo usa", "yellowstone geyser eruption"],
  },

  alaska: {
    id: "alaska", name: "Alaska", flag: "🏔️",
    heroImage: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&q=80",
    region: "North America",
    scores: { luxury: 52, nature: 98, city: 15, relaxation: 65, adventure: 96, social: 30, nightlife: 15, cultural: 55, food: 52, beach: 22, budget: 38, family: 60, romance: 72, wellness: 65 },
    climates: ["arctic", "cold", "temperate"],
    travelStyles: ["adventure", "wildlife", "photography", "nature", "hiking", "expedition"],
    activities: ["wildlife-viewing", "glacier-trekking", "kayaking", "photography", "fishing", "aurora-watching"],
    cities: [
      { name: "Denali", tagline: "North America's highest peak above permafrost", bestFor: ["hiking", "photography", "adventure"], budgetFit: "mid-range" },
      { name: "Kenai Fjords", tagline: "Glaciers calving into orca-filled waters", bestFor: ["wildlife", "photography", "nature"], budgetFit: "mid-range" },
      { name: "Katmai", tagline: "Brown bears catching sockeye salmon at Brooks Falls", bestFor: ["wildlife", "photography", "adventure"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["glacier", "tundra", "fjord", "forest", "wildlife", "mountain"],
    atmosphereTags: ["wild", "vast", "pristine", "raw", "remote", "dramatic"],
    architectureIdentity: ["vernacular", "log-cabin", "native-alaskan"],
    culturalIdentity: ["american", "indigenous-alaskan", "frontier"],
    emotionalProfile: ["free", "awestruck", "humbled", "adventurous"],
    terrain: ["mountainous", "coastal", "forested", "glacial"],
    cityStyle: ["traditional"],
    foodSignals: ["seafood", "local-cuisine", "grilled"],
    landmarkKeys: ["denali alaska snow peak", "kenai fjords glacier alaska", "grizzly bear salmon alaska"],
  },

  argentina: {
    id: "argentina", name: "Argentina", flag: "🇦🇷",
    heroImage: "https://images.unsplash.com/photo-1528361955814-d9e0f69e2f3e?w=1600&q=80",
    region: "South America",
    scores: { luxury: 60, nature: 88, city: 72, relaxation: 62, adventure: 85, social: 80, nightlife: 82, cultural: 82, food: 85, beach: 35, budget: 68, family: 65, romance: 80, wellness: 62 },
    climates: ["temperate", "cold", "tropical", "desert"],
    travelStyles: ["adventure", "nature", "food", "wine", "tango", "photography", "road-trip"],
    activities: ["glacier-trekking", "tango", "wine-tasting", "wildlife-viewing", "hiking", "food-tour"],
    cities: [
      { name: "Perito Moreno", tagline: "Glacier the size of Buenos Aires calving daily", bestFor: ["photography", "hiking", "nature"], budgetFit: "mid-range" },
      { name: "Buenos Aires", tagline: "Paris of the South — tango, beef and passion", bestFor: ["culture", "nightlife", "food"], budgetFit: "mid-range" },
      { name: "Mendoza", tagline: "Malbec vineyards at the foot of the Andes", bestFor: ["wine", "relaxation", "nature"], budgetFit: "mid-range" },
      { name: "Patagonia", tagline: "Wild windswept southern tip of the world", bestFor: ["hiking", "adventure", "photography"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["glacier", "pampa", "vineyard", "mountain", "city", "steppe"],
    atmosphereTags: ["passionate", "wild", "dramatic", "vibrant", "gastronomic", "nostalgic"],
    architectureIdentity: ["spanish-colonial", "art-nouveau", "modern", "beaux-arts"],
    culturalIdentity: ["argentinian", "latin-american", "italian-influenced", "spanish-colonial"],
    emotionalProfile: ["passionate", "adventurous", "romantic", "free", "energized"],
    terrain: ["mountainous", "flat", "forested", "coastal"],
    cityStyle: ["modern", "historic"],
    foodSignals: ["grilled", "local-cuisine", "fine-dining", "wine"],
    landmarkKeys: ["perito moreno glacier patagonia", "buenos aires tango", "iguazu falls argentina"],
  },

  chile: {
    id: "chile", name: "Chile", flag: "🇨🇱",
    heroImage: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=80",
    region: "South America",
    scores: { luxury: 58, nature: 96, city: 45, relaxation: 60, adventure: 96, social: 50, nightlife: 48, cultural: 68, food: 65, beach: 45, budget: 58, family: 62, romance: 78, wellness: 65 },
    climates: ["cold", "desert", "temperate"],
    travelStyles: ["adventure", "nature", "photography", "hiking", "expedition", "road-trip"],
    activities: ["trekking", "photography", "glacier-trekking", "hiking", "stargazing", "wine-tasting"],
    cities: [
      { name: "Torres del Paine", tagline: "Granite horns above jade-green glacial lakes", bestFor: ["hiking", "photography", "adventure"], budgetFit: "mid-range" },
      { name: "Atacama Desert", tagline: "Driest desert on Earth with alien landscapes", bestFor: ["photography", "stargazing", "adventure"], budgetFit: "mid-range" },
      { name: "Easter Island", tagline: "Moai statues of ancient Rapa Nui civilisation", bestFor: ["history", "photography", "culture"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["glacier", "desert", "mountain", "patagonia", "coastal", "volcanic"],
    atmosphereTags: ["dramatic", "wild", "remote", "pristine", "free"],
    architectureIdentity: ["spanish-colonial", "vernacular"],
    culturalIdentity: ["chilean", "latin-american", "mapuche", "spanish-colonial"],
    emotionalProfile: ["free", "awestruck", "adventurous", "humbled"],
    terrain: ["mountainous", "desert", "coastal", "glacial"],
    cityStyle: ["modern", "traditional"],
    foodSignals: ["seafood", "local-cuisine", "wine", "grilled"],
    landmarkKeys: ["torres del paine granite horns patagonia", "atacama desert moon valley chile", "easter island moai statue"],
  },

  dominicanrepublic: {
    id: "dominicanrepublic", name: "Dominican Republic", flag: "🇩🇴",
    heroImage: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1600&q=80",
    region: "Caribbean",
    scores: { luxury: 68, nature: 65, city: 42, relaxation: 88, adventure: 55, social: 78, nightlife: 72, cultural: 58, food: 65, beach: 92, budget: 60, family: 80, romance: 82, wellness: 72 },
    climates: ["tropical", "warm"],
    travelStyles: ["beach", "relaxation", "romance", "family", "nightlife", "all-inclusive"],
    activities: ["beach", "water-sports", "hiking", "snorkelling", "nightlife", "surfing"],
    cities: [
      { name: "Punta Cana", tagline: "Endless coconut-lined beach and clear Caribbean", bestFor: ["beach", "romance", "relaxation"], budgetFit: "mid-range" },
      { name: "Samaná", tagline: "Whale watching and waterfall-filled peninsula", bestFor: ["nature", "wildlife", "adventure"], budgetFit: "mid-range" },
      { name: "Santo Domingo", tagline: "Oldest European city in the Americas", bestFor: ["history", "culture", "nightlife"], budgetFit: "budget" },
    ],
    environmentTypes: ["tropical-island", "beach", "jungle", "mountain"],
    atmosphereTags: ["festive", "warm", "tropical", "vibrant", "relaxed"],
    architectureIdentity: ["spanish-colonial", "vernacular"],
    culturalIdentity: ["dominican", "caribbean", "afro-latino"],
    emotionalProfile: ["joyful", "relaxed", "festive", "romantic"],
    terrain: ["coastal", "mountainous", "forested"],
    cityStyle: ["traditional", "modern"],
    foodSignals: ["local-cuisine", "seafood", "tropical-fruits", "grilled"],
    landmarkKeys: ["punta cana beach coconut palm", "dominican republic waterfall jungle"],
  },

  jamaica: {
    id: "jamaica", name: "Jamaica", flag: "🇯🇲",
    heroImage: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1600&q=80",
    region: "Caribbean",
    scores: { luxury: 62, nature: 68, city: 42, relaxation: 85, adventure: 60, social: 85, nightlife: 80, cultural: 72, food: 72, beach: 90, budget: 65, family: 70, romance: 78, wellness: 70 },
    climates: ["tropical", "warm"],
    travelStyles: ["beach", "relaxation", "music", "culture", "adventure", "nightlife"],
    activities: ["beach", "reggae-music", "snorkelling", "hiking", "water-sports", "food-tour"],
    cities: [
      { name: "Negril", tagline: "Seven-mile beach and electric sunset cliffs", bestFor: ["beach", "relaxation", "nightlife"], budgetFit: "mid-range" },
      { name: "Blue Mountains", tagline: "World-famous coffee grown in cloud forest peaks", bestFor: ["hiking", "nature", "adventure"], budgetFit: "mid-range" },
      { name: "Montego Bay", tagline: "Hip Strip nightlife and glass-clear bay", bestFor: ["nightlife", "beach", "culture"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["tropical-island", "beach", "mountain", "jungle"],
    atmosphereTags: ["vibrant", "festive", "warm", "soulful", "relaxed", "colourful"],
    architectureIdentity: ["colonial-british", "vernacular", "tropical"],
    culturalIdentity: ["jamaican", "caribbean", "rastafarian", "afro-caribbean"],
    emotionalProfile: ["joyful", "free", "relaxed", "festive"],
    terrain: ["coastal", "mountainous", "forested"],
    cityStyle: ["traditional", "modern"],
    foodSignals: ["local-cuisine", "jerk", "seafood", "tropical-fruits"],
    landmarkKeys: ["seven mile beach jamaica", "jamaica blue mountains coffee", "dunn's river falls jamaica"],
  },

  bahamas: {
    id: "bahamas", name: "Bahamas", flag: "🇧🇸",
    heroImage: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1600&q=80",
    region: "Caribbean",
    scores: { luxury: 82, nature: 72, city: 30, relaxation: 90, adventure: 62, social: 68, nightlife: 55, cultural: 50, food: 60, beach: 96, budget: 28, family: 78, romance: 88, wellness: 78 },
    climates: ["tropical", "warm"],
    travelStyles: ["luxury", "beach", "romance", "honeymoon", "diving", "family"],
    activities: ["diving", "snorkelling", "beach", "water-sports", "swimming-with-pigs"],
    cities: [
      { name: "Exumas", tagline: "Swimming pigs and neon-bright Tropic of Cancer beach", bestFor: ["beach", "photography", "nature"], budgetFit: "luxury" },
      { name: "Nassau", tagline: "Colonial harbour meets Paradise Island casinos", bestFor: ["nightlife", "culture", "beach"], budgetFit: "luxury" },
      { name: "Eleuthera", tagline: "Pink sand beaches and Glass Window sea contrast", bestFor: ["beach", "romance", "photography"], budgetFit: "luxury" },
    ],
    environmentTypes: ["tropical-island", "beach", "reef", "lagoon"],
    atmosphereTags: ["paradise", "turquoise", "pristine", "romantic", "exclusive"],
    architectureIdentity: ["colonial-british", "vernacular"],
    culturalIdentity: ["bahamian", "caribbean", "afro-caribbean"],
    emotionalProfile: ["blissful", "romantic", "joyful", "peaceful"],
    terrain: ["island", "coastal", "flat"],
    cityStyle: ["traditional", "modern"],
    foodSignals: ["seafood", "local-cuisine", "tropical-fruits"],
    landmarkKeys: ["bahamas turquoise water exumas pig beach", "nassau harbour bahamas"],
  },

  borabora: {
    id: "borabora", name: "Bora Bora", flag: "🇵🇫",
    heroImage: "https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=1600&q=80",
    region: "South Pacific",
    scores: { luxury: 95, nature: 85, city: 10, relaxation: 96, adventure: 55, social: 42, nightlife: 30, cultural: 45, food: 68, beach: 98, budget: 5, family: 55, romance: 99, wellness: 88 },
    climates: ["tropical", "warm"],
    travelStyles: ["luxury", "romance", "honeymoon", "beach", "diving", "wellness"],
    activities: ["overwater-bungalow", "snorkelling", "diving", "beach", "spa", "sunbathing"],
    cities: [
      { name: "Matira Beach", tagline: "Perfect white sand point above a turquoise lagoon", bestFor: ["beach", "romance", "photography"], budgetFit: "luxury" },
      { name: "Vaitape", tagline: "Gateway village beneath the jagged Mount Otemanu", bestFor: ["culture", "diving", "nature"], budgetFit: "luxury" },
    ],
    environmentTypes: ["tropical-island", "overwater", "lagoon", "reef", "volcanic"],
    atmosphereTags: ["paradise", "romantic", "exclusive", "pristine", "dreamy", "luxurious"],
    architectureIdentity: ["polynesian-thatched", "overwater-bungalow"],
    culturalIdentity: ["french-polynesian", "tahitian", "pacific-islander"],
    emotionalProfile: ["blissful", "romantic", "dreamy", "luxurious"],
    terrain: ["island", "coastal", "volcanic"],
    cityStyle: ["traditional"],
    foodSignals: ["fine-dining", "seafood", "tropical-fruits", "french-cuisine"],
    landmarkKeys: ["bora bora overwater bungalow lagoon", "mount otemanu bora bora", "bora bora lagoon turquoise"],
  },

  fiji: {
    id: "fiji", name: "Fiji", flag: "🇫🇯",
    heroImage: "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=1600&q=80",
    region: "South Pacific",
    scores: { luxury: 78, nature: 88, city: 18, relaxation: 92, adventure: 68, social: 72, nightlife: 35, cultural: 65, food: 65, beach: 96, budget: 38, family: 82, romance: 92, wellness: 85 },
    climates: ["tropical", "warm"],
    travelStyles: ["beach", "romance", "luxury", "diving", "family", "adventure"],
    activities: ["diving", "snorkelling", "beach", "kayaking", "cultural-tours", "surfing"],
    cities: [
      { name: "Mamanuca Islands", tagline: "White sand and impossibly blue lagoons", bestFor: ["beach", "romance", "relaxation"], budgetFit: "luxury" },
      { name: "Yasawa Islands", tagline: "Remote volcanic islands with cave swims", bestFor: ["adventure", "diving", "relaxation"], budgetFit: "mid-range" },
      { name: "Taveuni", tagline: "Garden Island with waterfalls and rainbow reefs", bestFor: ["diving", "nature", "adventure"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["tropical-island", "beach", "reef", "jungle", "volcanic"],
    atmosphereTags: ["friendly", "tropical", "vibrant", "pristine", "joyful", "warm"],
    architectureIdentity: ["fijian-bure", "tropical-resort"],
    culturalIdentity: ["fijian", "indo-fijian", "melanesian", "pacific-islander"],
    emotionalProfile: ["joyful", "peaceful", "romantic", "adventurous"],
    terrain: ["island", "coastal", "forested"],
    cityStyle: ["traditional"],
    foodSignals: ["seafood", "local-cuisine", "tropical-fruits"],
    landmarkKeys: ["fiji tropical island beach clear water", "fiji coral reef diving"],
  },

  hawaii: {
    id: "hawaii", name: "Hawaii", flag: "🌺",
    heroImage: "https://images.unsplash.com/photo-1542259009477-d625272157b7?w=1600&q=80",
    region: "North America",
    scores: { luxury: 80, nature: 92, city: 42, relaxation: 88, adventure: 82, social: 68, nightlife: 52, cultural: 70, food: 78, beach: 96, budget: 25, family: 85, romance: 92, wellness: 88 },
    climates: ["tropical", "warm"],
    travelStyles: ["beach", "adventure", "nature", "romance", "honeymoon", "diving", "surfing"],
    activities: ["surfing", "volcano-trekking", "snorkelling", "beach", "hiking", "whale-watching"],
    cities: [
      { name: "Maui", tagline: "Road to Hana and Haleakalā above the clouds", bestFor: ["nature", "romance", "beach"], budgetFit: "luxury" },
      { name: "Big Island", tagline: "Active lava flowing to the Pacific coast", bestFor: ["photography", "adventure", "nature"], budgetFit: "luxury" },
      { name: "Kauai", tagline: "Na Pali cliffs straight from Jurassic Park", bestFor: ["photography", "hiking", "nature"], budgetFit: "luxury" },
    ],
    environmentTypes: ["volcanic", "tropical-island", "beach", "jungle", "mountain"],
    atmosphereTags: ["aloha", "lush", "vibrant", "dramatic", "warm", "romantic"],
    architectureIdentity: ["polynesian", "tropical-resort", "modern"],
    culturalIdentity: ["hawaiian", "polynesian", "american", "multicultural"],
    emotionalProfile: ["joyful", "free", "romantic", "awestruck"],
    terrain: ["volcanic", "island", "coastal", "forested"],
    cityStyle: ["modern", "traditional"],
    foodSignals: ["seafood", "local-cuisine", "tropical-fruits", "fine-dining"],
    landmarkKeys: ["kilauea volcano lava hawaii", "na pali coast kauai", "waimea canyon kauai"],
  },

  greenland: {
    id: "greenland", name: "Greenland", flag: "🇬🇱",
    heroImage: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&q=80",
    region: "Northern Europe",
    scores: { luxury: 42, nature: 99, city: 8, relaxation: 62, adventure: 98, social: 22, nightlife: 10, cultural: 52, food: 38, beach: 15, budget: 22, family: 40, romance: 65, wellness: 55 },
    climates: ["arctic", "polar", "cold"],
    travelStyles: ["expedition", "adventure", "photography", "wildlife", "aurora", "dog-sledding"],
    activities: ["dog-sledding", "hiking", "glacier-trekking", "aurora-watching", "kayaking", "fishing"],
    cities: [
      { name: "Ilulissat Icefjord", tagline: "UNESCO icefjord choked with ancient calving glaciers", bestFor: ["photography", "adventure", "nature"], budgetFit: "mid-range" },
      { name: "Nuuk", tagline: "Colourful houses on the world's most scenic capital", bestFor: ["culture", "nature", "photography"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["glacier", "arctic", "tundra", "fjord", "iceberg"],
    atmosphereTags: ["wild", "remote", "vast", "pristine", "dramatic", "otherworldly"],
    architectureIdentity: ["turf-house", "colourful-nordic", "vernacular"],
    culturalIdentity: ["greenlandic", "inuit", "danish-influenced"],
    emotionalProfile: ["humbled", "awestruck", "free", "adventurous"],
    terrain: ["glacial", "coastal", "mountainous", "tundra"],
    cityStyle: ["traditional"],
    foodSignals: ["local-cuisine", "seafood", "grilled"],
    landmarkKeys: ["ilulissat icefjord greenland iceberg", "greenland iceberg blue arctic"],
  },

  antarctica: {
    id: "antarctica", name: "Antarctica", flag: "🐧",
    heroImage: "https://images.unsplash.com/photo-1551415923-a2297c7fda79?w=1600&q=80",
    region: "Antarctica",
    scores: { luxury: 72, nature: 100, city: 0, relaxation: 55, adventure: 100, social: 18, nightlife: 0, cultural: 40, food: 35, beach: 8, budget: 5, family: 35, romance: 55, wellness: 48 },
    climates: ["polar", "arctic"],
    travelStyles: ["expedition", "wildlife", "photography", "adventure", "once-in-a-lifetime"],
    activities: ["wildlife-viewing", "glacier-trekking", "photography", "kayaking", "zodiac-cruise"],
    cities: [
      { name: "Antarctic Peninsula", tagline: "Penguin rookeries and calving glaciers", bestFor: ["wildlife", "photography", "adventure"], budgetFit: "luxury" },
      { name: "South Georgia", tagline: "King penguins and fur seals in staggering numbers", bestFor: ["wildlife", "photography", "expedition"], budgetFit: "luxury" },
    ],
    environmentTypes: ["glacier", "polar", "ice-shelf", "tundra", "wildlife"],
    atmosphereTags: ["pristine", "remote", "wild", "otherworldly", "epic", "silent"],
    architectureIdentity: ["research-station"],
    culturalIdentity: ["international-scientific"],
    emotionalProfile: ["humbled", "awestruck", "adventurous", "free"],
    terrain: ["glacial", "polar", "mountainous", "coastal"],
    cityStyle: ["none"],
    foodSignals: ["expeditionary"],
    landmarkKeys: ["antarctica penguin colony iceberg", "antarctica glacier ice blue massive"],
  },

  mongolia: {
    id: "mongolia", name: "Mongolia", flag: "🇲🇳",
    heroImage: "https://images.unsplash.com/photo-1588614959060-4d144f28b207?w=1600&q=80",
    region: "Central Asia",
    scores: { luxury: 35, nature: 92, city: 22, relaxation: 65, adventure: 92, social: 42, nightlife: 20, cultural: 80, food: 45, beach: 0, budget: 68, family: 55, romance: 62, wellness: 65 },
    climates: ["continental", "cold", "steppe"],
    travelStyles: ["adventure", "nomadic", "nature", "photography", "horse-trekking", "off-beaten-path"],
    activities: ["horse-trekking", "wildlife-viewing", "camping", "nomadic-stays", "eagle-hunting"],
    cities: [
      { name: "Gobi Desert", tagline: "Vast ice-canyon-and-dune desert in the world's heart", bestFor: ["photography", "adventure", "nature"], budgetFit: "mid-range" },
      { name: "Khövsgöl Lake", tagline: "Mongolia's Blue Pearl ringed by taiga forest", bestFor: ["nature", "adventure", "relaxation"], budgetFit: "budget" },
      { name: "Karakorum", tagline: "Site of Genghis Khan's legendary capital", bestFor: ["history", "culture", "adventure"], budgetFit: "budget" },
    ],
    environmentTypes: ["steppe", "desert", "mountain", "lake", "tundra"],
    atmosphereTags: ["vast", "free", "nomadic", "raw", "ancient", "remote"],
    architectureIdentity: ["yurt-ger", "lamaist", "vernacular"],
    culturalIdentity: ["mongolian", "nomadic", "central-asian", "buddhist-shamanist"],
    emotionalProfile: ["free", "humbled", "adventurous", "vast"],
    terrain: ["steppe", "desert", "mountainous"],
    cityStyle: ["traditional"],
    foodSignals: ["local-cuisine", "grilled", "nomadic"],
    landmarkKeys: ["mongolian steppe ger yurt horseback", "gobi desert mongolia dune", "mongolian eagle hunter kazakh"],
  },

  armenia: {
    id: "armenia", name: "Armenia", flag: "🇦🇲",
    heroImage: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1600&q=80",
    region: "Caucasus",
    scores: { luxury: 42, nature: 68, city: 48, relaxation: 58, adventure: 62, social: 55, nightlife: 50, cultural: 88, food: 72, beach: 0, budget: 78, family: 62, romance: 65, wellness: 58 },
    climates: ["continental", "temperate", "mountain"],
    travelStyles: ["cultural", "history", "off-beaten-path", "wine", "hiking", "spiritual"],
    activities: ["history", "monasteries", "hiking", "wine-tasting", "archaeology", "food-tour"],
    cities: [
      { name: "Geghard Monastery", tagline: "Rock-carved medieval monastery in a dramatic gorge", bestFor: ["history", "photography", "spiritual"], budgetFit: "budget" },
      { name: "Yerevan", tagline: "Pink-stone capital with Mount Ararat backdrop", bestFor: ["culture", "food", "nightlife"], budgetFit: "budget" },
      { name: "Tatev Monastery", tagline: "Eagle's perch monastery reached by world's longest cable car", bestFor: ["photography", "history", "nature"], budgetFit: "budget" },
    ],
    environmentTypes: ["mountain", "monastery", "canyon", "highland", "ancient-ruins"],
    atmosphereTags: ["ancient", "resilient", "spiritual", "warm", "hospitable"],
    architectureIdentity: ["armenian-medieval", "soviet", "khachkar-stone"],
    culturalIdentity: ["armenian", "caucasian", "christian-orthodox"],
    emotionalProfile: ["moved", "curious", "humbled", "warm"],
    terrain: ["mountainous", "forested"],
    cityStyle: ["historic", "modern"],
    foodSignals: ["local-cuisine", "grilled", "wine", "fine-dining"],
    landmarkKeys: ["geghard monastery armenia gorge", "noravank red canyon armenia", "mount ararat armenia"],
  },

  uzbekistan: {
    id: "uzbekistan", name: "Uzbekistan", flag: "🇺🇿",
    heroImage: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1600&q=80",
    region: "Central Asia",
    scores: { luxury: 48, nature: 52, city: 62, relaxation: 58, adventure: 65, social: 55, nightlife: 38, cultural: 95, food: 70, beach: 0, budget: 78, family: 60, romance: 68, wellness: 52 },
    climates: ["continental", "hot", "arid"],
    travelStyles: ["cultural", "history", "silk-road", "architecture", "photography", "off-beaten-path"],
    activities: ["history", "architecture", "photography", "bazaar", "caravanserai", "food-tour"],
    cities: [
      { name: "Samarkand", tagline: "Registan's blue tile mosaic dominated all of Central Asia", bestFor: ["history", "photography", "culture"], budgetFit: "budget" },
      { name: "Bukhara", tagline: "Living museum of 140 monuments", bestFor: ["history", "culture", "photography"], budgetFit: "budget" },
      { name: "Khiva", tagline: "Perfectly preserved walled city frozen in Timurid time", bestFor: ["history", "photography", "culture"], budgetFit: "budget" },
    ],
    environmentTypes: ["ancient-ruins", "desert", "city", "bazaar", "oasis"],
    atmosphereTags: ["ancient", "ornate", "mysterious", "colourful", "hospitable"],
    architectureIdentity: ["timurid", "islamic-mosaic", "persian-influenced", "silk-road"],
    culturalIdentity: ["uzbek", "central-asian", "persian-influenced", "islamic"],
    emotionalProfile: ["awestruck", "curious", "humbled", "moved"],
    terrain: ["flat", "desert", "mountainous"],
    cityStyle: ["historic", "traditional"],
    foodSignals: ["local-cuisine", "grilled", "spiced", "bazaar-food"],
    landmarkKeys: ["registan samarkand blue tile uzbekistan", "bukhara kalon minaret uzbekistan", "khiva walled city uzbekistan"],
  },

  romania: {
    id: "romania", name: "Romania", flag: "🇷🇴",
    heroImage: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1600&q=80",
    region: "Eastern Europe",
    scores: { luxury: 48, nature: 75, city: 58, relaxation: 60, adventure: 65, social: 58, nightlife: 58, cultural: 82, food: 65, beach: 25, budget: 82, family: 68, romance: 72, wellness: 62 },
    climates: ["temperate", "continental", "cold"],
    travelStyles: ["cultural", "history", "nature", "adventure", "road-trip", "off-beaten-path"],
    activities: ["castles", "hiking", "history", "wildlife-viewing", "monasteries", "photography"],
    cities: [
      { name: "Bran Castle / Transylvania", tagline: "Dracula's castle above the Carpathian forest", bestFor: ["history", "photography", "culture"], budgetFit: "budget" },
      { name: "Bucharest", tagline: "Neoclassical boulevards and electric nightlife", bestFor: ["culture", "nightlife", "food"], budgetFit: "budget" },
      { name: "Bucovina Monasteries", tagline: "Frescoed outdoor Byzantine art from the 15th century", bestFor: ["culture", "history", "photography"], budgetFit: "budget" },
    ],
    environmentTypes: ["castle", "forest", "mountain", "medieval", "city"],
    atmosphereTags: ["mysterious", "forested", "historic", "wild", "charming"],
    architectureIdentity: ["byzantine", "baroque", "gothic", "communist"],
    culturalIdentity: ["romanian", "eastern-european", "orthodox", "dacian"],
    emotionalProfile: ["mysterious", "curious", "adventurous", "charmed"],
    terrain: ["mountainous", "forested", "coastal"],
    cityStyle: ["historic", "modern", "old-town"],
    foodSignals: ["local-cuisine", "grilled", "wine"],
    landmarkKeys: ["bran castle transylvania romania", "peles castle carpathian romania", "painted monasteries bucovina"],
  },

  bulgaria: {
    id: "bulgaria", name: "Bulgaria", flag: "🇧🇬",
    heroImage: "https://images.unsplash.com/photo-1569863959822-9c86ffe8e495?w=1600&q=80",
    region: "Eastern Europe",
    scores: { luxury: 48, nature: 70, city: 55, relaxation: 65, adventure: 60, social: 60, nightlife: 58, cultural: 80, food: 65, beach: 55, budget: 85, family: 65, romance: 65, wellness: 62 },
    climates: ["temperate", "continental", "mediterranean"],
    travelStyles: ["cultural", "history", "beach", "skiing", "nature", "off-beaten-path"],
    activities: ["history", "skiing", "beach", "monasteries", "hiking", "rose-festival"],
    cities: [
      { name: "Rila Monastery", tagline: "UNESCO monastery in stunning mountain frescoes", bestFor: ["history", "photography", "culture"], budgetFit: "budget" },
      { name: "Sofia", tagline: "Ancient capital layered with empires and bohemian cafés", bestFor: ["culture", "history", "nightlife"], budgetFit: "budget" },
      { name: "Plovdiv", tagline: "Roman amphitheatre meets café culture in Old Town", bestFor: ["culture", "food", "history"], budgetFit: "budget" },
    ],
    environmentTypes: ["mountain", "monastery", "city", "coastal", "forested"],
    atmosphereTags: ["ancient", "layered", "charming", "welcoming", "off-beaten-path"],
    architectureIdentity: ["byzantine", "bulgarian-national-revival", "ottoman", "soviet"],
    culturalIdentity: ["bulgarian", "slavic", "orthodox-christian", "balkan"],
    emotionalProfile: ["curious", "charmed", "relaxed", "moved"],
    terrain: ["mountainous", "coastal", "forested"],
    cityStyle: ["historic", "modern"],
    foodSignals: ["local-cuisine", "grilled", "wine"],
    landmarkKeys: ["rila monastery bulgaria", "plovdiv old town amphitheatre", "belogradchik rocks bulgaria"],
  },

  slovenia: {
    id: "slovenia", name: "Slovenia", flag: "🇸🇮",
    heroImage: "https://images.unsplash.com/photo-1547132440-3a4c27b3dbab?w=1600&q=80",
    region: "Central Europe",
    scores: { luxury: 55, nature: 90, city: 52, relaxation: 75, adventure: 78, social: 62, nightlife: 52, cultural: 78, food: 70, beach: 25, budget: 62, family: 78, romance: 85, wellness: 78 },
    climates: ["temperate", "alpine", "mediterranean"],
    travelStyles: ["nature", "adventure", "romance", "hiking", "outdoor-sports", "cycling"],
    activities: ["hiking", "kayaking", "caves", "cycling", "skiing", "photography"],
    cities: [
      { name: "Lake Bled", tagline: "Fairy-tale island church in a glacial alpine lake", bestFor: ["photography", "romance", "nature"], budgetFit: "mid-range" },
      { name: "Postojna Cave", tagline: "15 km of stalactite cathedral underground", bestFor: ["adventure", "nature", "family"], budgetFit: "mid-range" },
      { name: "Ljubljana", tagline: "Compact dragon-city with a vibrant café culture", bestFor: ["culture", "food", "romance"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["alpine", "lake", "cave", "forest", "castle"],
    atmosphereTags: ["fairy-tale", "green", "serene", "romantic", "clean", "charming"],
    architectureIdentity: ["baroque", "medieval", "art-nouveau", "vernacular"],
    culturalIdentity: ["slovenian", "slavic", "central-european"],
    emotionalProfile: ["romantic", "peaceful", "refreshed", "charmed"],
    terrain: ["mountainous", "forested", "coastal"],
    cityStyle: ["historic", "modern"],
    foodSignals: ["local-cuisine", "fine-dining", "wine"],
    landmarkKeys: ["lake bled island church slovenia", "bled castle reflection alpine", "triglav mountain slovenia"],
  },

  slovakia: {
    id: "slovakia", name: "Slovakia", flag: "🇸🇰",
    heroImage: "https://images.unsplash.com/photo-1578632291769-3c1dc3a70d47?w=1600&q=80",
    region: "Central Europe",
    scores: { luxury: 48, nature: 78, city: 52, relaxation: 65, adventure: 70, social: 58, nightlife: 55, cultural: 78, food: 62, beach: 0, budget: 80, family: 70, romance: 68, wellness: 65 },
    climates: ["temperate", "continental", "alpine"],
    travelStyles: ["nature", "adventure", "history", "hiking", "skiing", "castles"],
    activities: ["hiking", "skiing", "castles", "caves", "wildlife-viewing", "cycling"],
    cities: [
      { name: "Tatras", tagline: "Granite peaks and alpine meadows of Central Europe", bestFor: ["hiking", "photography", "nature"], budgetFit: "budget" },
      { name: "Bratislava", tagline: "Compact castle-crowned capital on the Danube", bestFor: ["culture", "history", "nightlife"], budgetFit: "budget" },
      { name: "Banská Štiavnica", tagline: "UNESCO mining town of baroque squares", bestFor: ["history", "culture", "photography"], budgetFit: "budget" },
    ],
    environmentTypes: ["mountain", "castle", "forest", "cave", "city"],
    atmosphereTags: ["off-beaten-path", "charming", "forested", "historic", "welcoming"],
    architectureIdentity: ["baroque", "gothic", "renaissance", "vernacular"],
    culturalIdentity: ["slovak", "slavic", "central-european"],
    emotionalProfile: ["charmed", "adventurous", "relaxed", "curious"],
    terrain: ["mountainous", "forested"],
    cityStyle: ["historic", "modern"],
    foodSignals: ["local-cuisine", "grilled", "beer"],
    landmarkKeys: ["high tatras slovakia mountain", "bojnice castle slovakia", "bratislava castle danube"],
  },

  estonia: {
    id: "estonia", name: "Estonia", flag: "🇪🇪",
    heroImage: "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=1600&q=80",
    region: "Northern Europe",
    scores: { luxury: 52, nature: 68, city: 60, relaxation: 68, adventure: 52, social: 60, nightlife: 62, cultural: 82, food: 65, beach: 25, budget: 68, family: 70, romance: 70, wellness: 68 },
    climates: ["temperate", "cool"],
    travelStyles: ["cultural", "history", "digital-nomad", "nature", "medieval"],
    activities: ["history", "medieval-old-town", "hiking", "cycling", "digital-life", "islands"],
    cities: [
      { name: "Tallinn Old Town", tagline: "UNESCO medieval city under cone-roofed towers", bestFor: ["history", "photography", "romance"], budgetFit: "budget" },
      { name: "Lahemaa", tagline: "Boulders and bog of ancient Estonian forest", bestFor: ["nature", "hiking", "relaxation"], budgetFit: "budget" },
      { name: "Saaremaa", tagline: "Windmill island of juniper forests and meteor crater", bestFor: ["nature", "relaxation", "culture"], budgetFit: "budget" },
    ],
    environmentTypes: ["medieval", "forest", "coastal", "bog", "castle"],
    atmosphereTags: ["medieval", "digital", "serene", "green", "charming"],
    architectureIdentity: ["gothic", "hanseatic", "art-nouveau", "soviet"],
    culturalIdentity: ["estonian", "baltic", "finno-ugric"],
    emotionalProfile: ["curious", "charmed", "digital-savvy", "peaceful"],
    terrain: ["flat", "forested", "coastal"],
    cityStyle: ["historic", "modern"],
    foodSignals: ["local-cuisine", "seafood", "fine-dining"],
    landmarkKeys: ["tallinn old town medieval estonia", "tallinn town hall square"],
  },

  latvia: {
    id: "latvia", name: "Latvia", flag: "🇱🇻",
    heroImage: "https://images.unsplash.com/photo-1540200049732-71d3e3e97f58?w=1600&q=80",
    region: "Northern Europe",
    scores: { luxury: 48, nature: 70, city: 58, relaxation: 65, adventure: 50, social: 60, nightlife: 60, cultural: 80, food: 62, beach: 30, budget: 72, family: 65, romance: 68, wellness: 65 },
    climates: ["temperate", "cool"],
    travelStyles: ["cultural", "history", "nature", "art-nouveau", "relaxation"],
    activities: ["history", "art-nouveau", "hiking", "beach", "cycling", "museums"],
    cities: [
      { name: "Riga", tagline: "World capital of Art Nouveau architecture", bestFor: ["culture", "architecture", "nightlife"], budgetFit: "budget" },
      { name: "Sigulda", tagline: "Medieval castles in Latvia's Gauja valley", bestFor: ["history", "nature", "adventure"], budgetFit: "budget" },
      { name: "Jūrmala", tagline: "Pine-backed Baltic beach resort of wooden villas", bestFor: ["beach", "relaxation", "nature"], budgetFit: "budget" },
    ],
    environmentTypes: ["city", "forest", "coastal", "medieval", "river"],
    atmosphereTags: ["artistic", "green", "historic", "charming", "cool"],
    architectureIdentity: ["art-nouveau", "gothic", "hanseatic", "wooden-vernacular"],
    culturalIdentity: ["latvian", "baltic", "indo-european"],
    emotionalProfile: ["artistic", "curious", "peaceful", "charmed"],
    terrain: ["flat", "forested", "coastal"],
    cityStyle: ["historic", "modern"],
    foodSignals: ["local-cuisine", "seafood", "fine-dining"],
    landmarkKeys: ["riga art nouveau facade latvia", "riga old town gothic", "gauja valley castle latvia"],
  },

  lithuania: {
    id: "lithuania", name: "Lithuania", flag: "🇱🇹",
    heroImage: "https://images.unsplash.com/photo-1595872018818-97555653a011?w=1600&q=80",
    region: "Northern Europe",
    scores: { luxury: 48, nature: 68, city: 60, relaxation: 62, adventure: 52, social: 60, nightlife: 58, cultural: 82, food: 62, beach: 30, budget: 75, family: 65, romance: 65, wellness: 62 },
    climates: ["temperate", "cool"],
    travelStyles: ["cultural", "history", "nature", "off-beaten-path", "baroque"],
    activities: ["history", "baroque-architecture", "hill-of-crosses", "hiking", "cycling"],
    cities: [
      { name: "Hill of Crosses", tagline: "Over 200,000 crosses on a sacred pagan hill", bestFor: ["culture", "photography", "spiritual"], budgetFit: "budget" },
      { name: "Vilnius Old Town", tagline: "UNESCO baroque city of hidden courtyards", bestFor: ["history", "culture", "nightlife"], budgetFit: "budget" },
      { name: "Curonian Spit", tagline: "Baltic dune lagoon — sand drifts meeting pine forest", bestFor: ["nature", "relaxation", "photography"], budgetFit: "budget" },
    ],
    environmentTypes: ["medieval", "forest", "coastal", "spiritual", "dunes"],
    atmosphereTags: ["baroque", "serene", "historic", "spiritual", "charming"],
    architectureIdentity: ["baroque", "gothic", "classical", "soviet"],
    culturalIdentity: ["lithuanian", "baltic", "indo-european"],
    emotionalProfile: ["curious", "spiritual", "peaceful", "charmed"],
    terrain: ["flat", "forested", "coastal"],
    cityStyle: ["historic", "modern"],
    foodSignals: ["local-cuisine", "grilled"],
    landmarkKeys: ["hill of crosses lithuania", "vilnius baroque old town", "curonian spit dune lithuania"],
  },

  tunisia: {
    id: "tunisia", name: "Tunisia", flag: "🇹🇳",
    heroImage: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1600&q=80",
    region: "North Africa",
    scores: { luxury: 52, nature: 65, city: 55, relaxation: 68, adventure: 62, social: 60, nightlife: 48, cultural: 85, food: 72, beach: 72, budget: 80, family: 68, romance: 62, wellness: 58 },
    climates: ["mediterranean", "desert", "warm"],
    travelStyles: ["cultural", "history", "beach", "desert", "food", "off-beaten-path"],
    activities: ["history", "archaeology", "beach", "desert-safari", "food-tour", "medina-walk"],
    cities: [
      { name: "Sidi Bou Said", tagline: "Blue-white clifftop village above the Gulf of Tunis", bestFor: ["photography", "relaxation", "romance"], budgetFit: "budget" },
      { name: "Carthage", tagline: "Roman-Punic ruins above the Mediterranean", bestFor: ["history", "culture", "photography"], budgetFit: "budget" },
      { name: "Douz", tagline: "Gateway to Saharan dunes and Star Wars sets", bestFor: ["adventure", "photography", "desert"], budgetFit: "budget" },
    ],
    environmentTypes: ["mediterranean", "desert", "ancient-ruins", "coastal", "medina"],
    atmosphereTags: ["ancient", "colourful", "warm", "relaxed", "diverse"],
    architectureIdentity: ["roman", "ottoman", "arabic", "french-colonial"],
    culturalIdentity: ["tunisian", "north-african", "berber", "arab", "mediterranean"],
    emotionalProfile: ["curious", "charmed", "relaxed", "transported"],
    terrain: ["coastal", "desert", "mountainous"],
    cityStyle: ["historic", "traditional"],
    foodSignals: ["local-cuisine", "spiced", "seafood", "street-food"],
    landmarkKeys: ["sidi bou said blue white village", "carthage roman ruins tunisia", "tozeur sahara dune tunisia"],
  },

  algeria: {
    id: "algeria", name: "Algeria", flag: "🇩🇿",
    heroImage: "https://images.unsplash.com/photo-1562246470-b1f4a5c18a76?w=1600&q=80",
    region: "North Africa",
    scores: { luxury: 42, nature: 82, city: 45, relaxation: 58, adventure: 85, social: 42, nightlife: 30, cultural: 85, food: 62, beach: 45, budget: 82, family: 52, romance: 55, wellness: 52 },
    climates: ["desert", "mediterranean", "arid"],
    travelStyles: ["adventure", "off-beaten-path", "history", "desert", "photography", "expedition"],
    activities: ["desert-safari", "archaeology", "photography", "trekking", "history"],
    cities: [
      { name: "Algiers",         tagline: "Mediterranean capital of Moorish elegance and modern energy",    bestFor: ["culture", "history", "food"],          budgetFit: "mid-range" },
      { name: "Oran",            tagline: "Vibrant port city with French flair and Raï music heritage",     bestFor: ["nightlife", "food", "culture"],        budgetFit: "mid-range" },
      { name: "Tassili n'Ajjer", tagline: "Saharan cave paintings 10,000 years old in alien rock formations", bestFor: ["photography", "history", "adventure"], budgetFit: "mid-range" },
      { name: "M'Zab Valley",    tagline: "Five UNESCO planned Mozabite cities in the desert",              bestFor: ["history", "culture", "photography"],   budgetFit: "budget" },
      { name: "Timgad",          tagline: "Perfectly grid-planned Roman city lost in the Sahara",           bestFor: ["history", "photography", "culture"],   budgetFit: "budget" },
    ],
    environmentTypes: ["desert", "ancient-ruins", "canyon", "rock-formation", "mediterranean"],
    atmosphereTags: ["ancient", "remote", "dramatic", "raw", "undiscovered"],
    architectureIdentity: ["roman", "ottoman", "islamic", "berber", "mozabite"],
    culturalIdentity: ["algerian", "berber", "arab", "north-african"],
    emotionalProfile: ["awestruck", "adventurous", "humbled", "curious"],
    terrain: ["desert", "mountainous", "coastal"],
    cityStyle: ["traditional", "historic"],
    foodSignals: ["local-cuisine", "spiced", "grilled"],
    landmarkKeys: ["tassili n'ajjer rock paintings sahara", "timgad roman ruins algeria", "ghardaia m'zab valley algeria"],
  },

  rwanda: {
    id: "rwanda", name: "Rwanda", flag: "🇷🇼",
    heroImage: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80",
    region: "East Africa",
    scores: { luxury: 62, nature: 92, city: 38, relaxation: 62, adventure: 88, social: 45, nightlife: 30, cultural: 72, food: 52, beach: 0, budget: 42, family: 55, romance: 65, wellness: 62 },
    climates: ["tropical", "highland", "temperate"],
    travelStyles: ["wildlife", "adventure", "nature", "photography", "eco-tourism", "off-beaten-path"],
    activities: ["gorilla-trekking", "wildlife-viewing", "hiking", "photography", "cultural-tours"],
    cities: [
      { name: "Volcanoes National Park", tagline: "Mountain gorilla silverbacks in the Virunga mist", bestFor: ["wildlife", "photography", "adventure"], budgetFit: "luxury" },
      { name: "Kigali", tagline: "Africa's cleanest city with sobering memorial", bestFor: ["culture", "history", "food"], budgetFit: "mid-range" },
      { name: "Nyungwe Forest", tagline: "Ancient montane rainforest with chimpanzees", bestFor: ["wildlife", "nature", "hiking"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["rainforest", "mountain", "savanna", "highland", "wildlife"],
    atmosphereTags: ["resilient", "lush", "wild", "inspiring", "green", "tranquil"],
    architectureIdentity: ["vernacular", "modern", "eco-lodge"],
    culturalIdentity: ["rwandan", "bantu", "east-african"],
    emotionalProfile: ["moved", "humbled", "awestruck", "inspired"],
    terrain: ["mountainous", "forested", "highland"],
    cityStyle: ["modern", "traditional"],
    foodSignals: ["local-cuisine", "tropical-fruits"],
    landmarkKeys: ["mountain gorilla rwanda virunga", "gorilla silverback misty forest africa", "volcanoes national park rwanda"],
  },

  ethiopia: {
    id: "ethiopia", name: "Ethiopia", flag: "🇪🇹",
    heroImage: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1600&q=80",
    region: "East Africa",
    scores: { luxury: 40, nature: 88, city: 42, relaxation: 52, adventure: 90, social: 48, nightlife: 30, cultural: 95, food: 72, beach: 15, budget: 78, family: 50, romance: 55, wellness: 52 },
    climates: ["highland", "tropical", "desert", "temperate"],
    travelStyles: ["adventure", "history", "wildlife", "photography", "off-beaten-path", "expedition"],
    activities: ["trekking", "history", "wildlife-viewing", "photography", "cultural-tours", "rock-churches"],
    cities: [
      { name: "Lalibela", tagline: "Eleven rock-hewn churches carved from the ground", bestFor: ["history", "culture", "photography"], budgetFit: "budget" },
      { name: "Danakil Depression", tagline: "Hottest place on Earth: neon sulphur craters and salt flats", bestFor: ["adventure", "photography", "expedition"], budgetFit: "mid-range" },
      { name: "Simien Mountains", tagline: "Roof of Africa with gelada baboon cliffs", bestFor: ["hiking", "wildlife", "photography"], budgetFit: "budget" },
    ],
    environmentTypes: ["highland", "desert", "ancient-ruins", "mountain", "rift-valley", "rock-church"],
    atmosphereTags: ["ancient", "dramatic", "cultural", "remote", "diverse"],
    architectureIdentity: ["rock-hewn", "aksumite", "orthodox-ethiopian", "vernacular"],
    culturalIdentity: ["ethiopian", "amhara", "oromo", "tigrinya", "east-african"],
    emotionalProfile: ["humbled", "awestruck", "curious", "moved"],
    terrain: ["mountainous", "desert", "highland", "forested"],
    cityStyle: ["traditional", "modern"],
    foodSignals: ["local-cuisine", "spiced", "injera", "coffee"],
    landmarkKeys: ["lalibela rock church ethiopia", "danakil depression sulphur neon", "simien mountains gelada baboon"],
  },

  zimbabwe: {
    id: "zimbabwe", name: "Zimbabwe", flag: "🇿🇼",
    heroImage: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=80",
    region: "Southern Africa",
    scores: { luxury: 58, nature: 90, city: 28, relaxation: 62, adventure: 88, social: 42, nightlife: 28, cultural: 72, food: 50, beach: 0, budget: 65, family: 62, romance: 65, wellness: 58 },
    climates: ["tropical", "warm", "seasonal"],
    travelStyles: ["wildlife", "adventure", "nature", "photography", "safari"],
    activities: ["safari", "wildlife-viewing", "victoria-falls", "photography", "kayaking", "walking-safari"],
    cities: [
      { name: "Victoria Falls", tagline: "Smoke that thunders — world's largest waterfall curtain", bestFor: ["photography", "adventure", "nature"], budgetFit: "mid-range" },
      { name: "Hwange National Park", tagline: "Largest herds of elephant in Africa", bestFor: ["wildlife", "safari", "photography"], budgetFit: "mid-range" },
      { name: "Matobo Hills", tagline: "Balancing boulders with ancient San rock art", bestFor: ["history", "photography", "nature"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["savanna", "wildlife", "waterfall", "rock", "bush"],
    atmosphereTags: ["wild", "dramatic", "raw", "pristine", "timeless"],
    architectureIdentity: ["vernacular", "colonial", "safari-lodge"],
    culturalIdentity: ["zimbabwean", "shona", "ndebele", "african"],
    emotionalProfile: ["awestruck", "adventurous", "free", "humbled"],
    terrain: ["flat", "rocky", "forested"],
    cityStyle: ["traditional"],
    foodSignals: ["local-cuisine", "grilled"],
    landmarkKeys: ["victoria falls zimbabwe waterfall", "hwange elephant herd zimbabwe", "matobo balancing rocks zimbabwe"],
  },

  zambia: {
    id: "zambia", name: "Zambia", flag: "🇿🇲",
    heroImage: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=80",
    region: "Southern Africa",
    scores: { luxury: 55, nature: 90, city: 22, relaxation: 62, adventure: 88, social: 38, nightlife: 22, cultural: 62, food: 48, beach: 0, budget: 60, family: 55, romance: 62, wellness: 55 },
    climates: ["tropical", "warm", "seasonal"],
    travelStyles: ["wildlife", "adventure", "nature", "photography", "safari", "walking-safari"],
    activities: ["safari", "walking-safari", "wildlife-viewing", "victoria-falls", "kayaking", "photography"],
    cities: [
      { name: "South Luangwa", tagline: "Birthplace of the walking safari — leopard capital", bestFor: ["wildlife", "safari", "photography"], budgetFit: "luxury" },
      { name: "Kafue National Park", tagline: "Largest park in Africa — wild and uncrowded", bestFor: ["wildlife", "adventure", "nature"], budgetFit: "luxury" },
      { name: "Lower Zambezi", tagline: "Canoe safari between hippos and elephants", bestFor: ["adventure", "wildlife", "photography"], budgetFit: "luxury" },
    ],
    environmentTypes: ["savanna", "wildlife", "river", "bush", "waterfall"],
    atmosphereTags: ["wild", "remote", "pristine", "raw", "authentic"],
    architectureIdentity: ["vernacular", "safari-lodge"],
    culturalIdentity: ["zambian", "bantu", "african"],
    emotionalProfile: ["adventurous", "free", "awestruck", "peaceful"],
    terrain: ["flat", "forested", "riverine"],
    cityStyle: ["traditional"],
    foodSignals: ["local-cuisine", "grilled"],
    landmarkKeys: ["south luangwa leopard zambia", "victoria falls zambia mist", "zambezi river canoe hippo"],
  },

  panama: {
    id: "panama", name: "Panama", flag: "🇵🇦",
    heroImage: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80",
    region: "Central America",
    scores: { luxury: 62, nature: 85, city: 58, relaxation: 70, adventure: 80, social: 60, nightlife: 62, cultural: 72, food: 68, beach: 75, budget: 65, family: 68, romance: 72, wellness: 65 },
    climates: ["tropical", "warm"],
    travelStyles: ["nature", "adventure", "culture", "beach", "canal-history", "wildlife"],
    activities: ["snorkelling", "wildlife-viewing", "canal-tours", "beach", "hiking", "kayaking"],
    cities: [
      { name: "Panama Canal", tagline: "Engineering wonder linking two great oceans", bestFor: ["history", "culture", "photography"], budgetFit: "mid-range" },
      { name: "Bocas del Toro", tagline: "Caribbean island archipelago of colour and coral", bestFor: ["beach", "diving", "relaxation"], budgetFit: "budget" },
      { name: "San Blas Islands", tagline: "Kuna Yala: 365 palm islands in turquoise paradise", bestFor: ["beach", "culture", "nature"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["jungle", "coastal", "canal", "tropical-island", "beach"],
    atmosphereTags: ["vibrant", "biodiverse", "warm", "colourful", "adventurous"],
    architectureIdentity: ["spanish-colonial", "modern", "indigenous"],
    culturalIdentity: ["panamanian", "latin-american", "kuna-indigenous", "afro-caribbean"],
    emotionalProfile: ["adventurous", "joyful", "curious", "relaxed"],
    terrain: ["forested", "coastal", "mountainous"],
    cityStyle: ["modern", "traditional"],
    foodSignals: ["seafood", "local-cuisine", "tropical-fruits"],
    landmarkKeys: ["panama canal locks ship", "bocas del toro island panama", "san blas kuna yala island"],
  },

  ecuador: {
    id: "ecuador", name: "Ecuador", flag: "🇪🇨",
    heroImage: "https://images.unsplash.com/photo-1547932182-9b0db8d26e3e?w=1600&q=80",
    region: "South America",
    scores: { luxury: 52, nature: 96, city: 42, relaxation: 65, adventure: 92, social: 50, nightlife: 42, cultural: 75, food: 65, beach: 45, budget: 72, family: 68, romance: 68, wellness: 65 },
    climates: ["tropical", "highland", "varied"],
    travelStyles: ["wildlife", "adventure", "nature", "photography", "eco-tourism", "galapagos"],
    activities: ["galapagos-wildlife", "volcano-trekking", "amazon-exploration", "snorkelling", "hiking"],
    cities: [
      { name: "Galápagos Islands", tagline: "Darwin's lab: ancient tortoises and fearless iguanas", bestFor: ["wildlife", "photography", "nature"], budgetFit: "luxury" },
      { name: "Amazon Basin", tagline: "Pristine jungle lodge wildlife immersion", bestFor: ["wildlife", "nature", "adventure"], budgetFit: "mid-range" },
      { name: "Quilotoa", tagline: "Volcanic crater lake glowing jade-green at altitude", bestFor: ["photography", "hiking", "nature"], budgetFit: "budget" },
    ],
    environmentTypes: ["volcanic", "jungle", "highland", "coastal", "wildlife", "galapagos"],
    atmosphereTags: ["wild", "biodiverse", "dramatic", "pristine", "adventurous"],
    architectureIdentity: ["spanish-colonial", "vernacular"],
    culturalIdentity: ["ecuadorian", "latin-american", "quechua", "spanish-colonial"],
    emotionalProfile: ["awestruck", "adventurous", "humbled", "curious"],
    terrain: ["volcanic", "forested", "mountainous", "coastal"],
    cityStyle: ["traditional", "modern"],
    foodSignals: ["seafood", "local-cuisine", "tropical-fruits"],
    landmarkKeys: ["galapagos tortoise iguana island", "quilotoa volcanic crater lake", "cotopaxi volcano ecuador snow"],
  },

  bolivia: {
    id: "bolivia", name: "Bolivia", flag: "🇧🇴",
    heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
    region: "South America",
    scores: { luxury: 38, nature: 90, city: 38, relaxation: 52, adventure: 92, social: 48, nightlife: 40, cultural: 82, food: 55, beach: 0, budget: 85, family: 52, romance: 60, wellness: 55 },
    climates: ["highland", "alpine", "tropical"],
    travelStyles: ["adventure", "off-beaten-path", "nature", "photography", "cultural", "trekking"],
    activities: ["salt-flat-tours", "trekking", "wildlife-viewing", "photography", "cultural-tours", "altitude-experience"],
    cities: [
      { name: "Salar de Uyuni", tagline: "World's largest mirror — perfect sky reflection at sunrise", bestFor: ["photography", "adventure", "nature"], budgetFit: "budget" },
      { name: "Death Road", tagline: "World's Most Dangerous Road cycling adrenaline", bestFor: ["adventure", "cycling", "photography"], budgetFit: "budget" },
      { name: "Potosí", tagline: "Colonial mining city the highest in the world", bestFor: ["history", "culture", "adventure"], budgetFit: "budget" },
    ],
    environmentTypes: ["salt-flat", "highland", "mountain", "jungle", "desert"],
    atmosphereTags: ["dramatic", "remote", "ancient", "raw", "awe-inspiring"],
    architectureIdentity: ["spanish-colonial", "baroque", "indigenous", "vernacular"],
    culturalIdentity: ["bolivian", "latin-american", "quechua", "aymara", "indigenous"],
    emotionalProfile: ["awestruck", "adventurous", "humbled", "raw"],
    terrain: ["mountainous", "salt-flat", "forested", "highland"],
    cityStyle: ["traditional", "historic"],
    foodSignals: ["local-cuisine", "street-food"],
    landmarkKeys: ["salar uyuni salt flat mirror reflection bolivia", "uyuni salt flat sunrise bolivia"],
  },

  guatemala: {
    id: "guatemala", name: "Guatemala", flag: "🇬🇹",
    heroImage: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=80",
    region: "Central America",
    scores: { luxury: 45, nature: 82, city: 45, relaxation: 58, adventure: 80, social: 55, nightlife: 45, cultural: 90, food: 65, beach: 35, budget: 80, family: 60, romance: 68, wellness: 60 },
    climates: ["tropical", "highland", "temperate"],
    travelStyles: ["cultural", "history", "adventure", "nature", "photography", "off-beaten-path"],
    activities: ["mayan-history", "volcano-trekking", "lake-activities", "archaeology", "food-tour"],
    cities: [
      { name: "Tikal", tagline: "Mayan pyramids erupting through jungle canopy", bestFor: ["history", "photography", "nature"], budgetFit: "budget" },
      { name: "Atitlán Lake", tagline: "Most beautiful lake in the world by three volcanoes", bestFor: ["nature", "photography", "relaxation"], budgetFit: "budget" },
      { name: "Antigua", tagline: "Baroque colonial city framed by active Agua volcano", bestFor: ["history", "culture", "photography"], budgetFit: "budget" },
    ],
    environmentTypes: ["jungle", "volcanic", "lake", "ancient-ruins", "highland"],
    atmosphereTags: ["ancient", "colourful", "vibrant", "lush", "culturally-rich"],
    architectureIdentity: ["mayan", "spanish-colonial", "baroque"],
    culturalIdentity: ["guatemalan", "mayan", "latin-american", "spanish-colonial"],
    emotionalProfile: ["curious", "awestruck", "joyful", "moved"],
    terrain: ["volcanic", "forested", "highland", "coastal"],
    cityStyle: ["traditional", "historic"],
    foodSignals: ["local-cuisine", "street-food", "corn-based", "spiced"],
    landmarkKeys: ["tikal mayan pyramid jungle guatemala", "lake atitlan volcano guatemala", "antigua volcano colonial guatemala"],
  },

  nicaragua: {
    id: "nicaragua", name: "Nicaragua", flag: "🇳🇮",
    heroImage: "https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=1600&q=80",
    region: "Central America",
    scores: { luxury: 40, nature: 82, city: 40, relaxation: 65, adventure: 80, social: 62, nightlife: 52, cultural: 70, food: 60, beach: 68, budget: 88, family: 55, romance: 65, wellness: 60 },
    climates: ["tropical", "warm"],
    travelStyles: ["adventure", "off-beaten-path", "beach", "surfing", "nature", "budget"],
    activities: ["volcano-boarding", "surfing", "wildlife-viewing", "history", "beach", "hiking"],
    cities: [
      { name: "Masaya Volcano", tagline: "Peer into the glowing lava lake of the Gates of Hell", bestFor: ["adventure", "photography", "nature"], budgetFit: "budget" },
      { name: "Ometepe Island", tagline: "Twin volcanoes rising from freshwater Lake Nicaragua", bestFor: ["nature", "hiking", "adventure"], budgetFit: "budget" },
      { name: "Granada", tagline: "Colourful colonial city on the great lake shore", bestFor: ["culture", "history", "food"], budgetFit: "budget" },
    ],
    environmentTypes: ["volcanic", "lake", "jungle", "coastal", "colonial"],
    atmosphereTags: ["adventurous", "colourful", "warm", "authentic", "undiscovered"],
    architectureIdentity: ["spanish-colonial", "vernacular"],
    culturalIdentity: ["nicaraguan", "latin-american", "spanish-colonial", "indigenous"],
    emotionalProfile: ["adventurous", "free", "curious", "joyful"],
    terrain: ["volcanic", "forested", "coastal"],
    cityStyle: ["traditional", "historic"],
    foodSignals: ["local-cuisine", "street-food", "grilled"],
    landmarkKeys: ["masaya volcano lava nicaragua", "ometepe island volcano lake nicaragua", "cerro negro volcano boarding nicaragua"],
  },

  laos: {
    id: "laos", name: "Laos", flag: "🇱🇦",
    heroImage: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1600&q=80",
    region: "Southeast Asia",
    scores: { luxury: 45, nature: 82, city: 38, relaxation: 85, adventure: 68, social: 55, nightlife: 42, cultural: 88, food: 68, beach: 15, budget: 85, family: 60, romance: 75, wellness: 80 },
    climates: ["tropical", "warm", "monsoon"],
    travelStyles: ["cultural", "spiritual", "nature", "relaxation", "off-beaten-path", "slow-travel"],
    activities: ["temples", "mekong-cruise", "trekking", "meditation", "cycling", "tubing"],
    cities: [
      { name: "Luang Prabang", tagline: "Saffron monks and Buddhist temples in Mekong mist", bestFor: ["culture", "spiritual", "photography"], budgetFit: "budget" },
      { name: "Vang Vieng", tagline: "Karst mountain town on the Nam Song river", bestFor: ["adventure", "nature", "relaxation"], budgetFit: "budget" },
      { name: "Plain of Jars", tagline: "Megalithic stone jars on a mysterious plateau", bestFor: ["history", "photography", "culture"], budgetFit: "budget" },
    ],
    environmentTypes: ["jungle", "temple", "river", "karst-mountain", "mekong"],
    atmosphereTags: ["serene", "spiritual", "ancient", "lush", "slow", "golden"],
    architectureIdentity: ["buddhist-temple", "french-colonial", "vernacular"],
    culturalIdentity: ["lao", "buddhist", "southeast-asian", "mekong-culture"],
    emotionalProfile: ["peaceful", "spiritual", "curious", "slow"],
    terrain: ["mountainous", "forested", "riverine"],
    cityStyle: ["traditional", "historic"],
    foodSignals: ["local-cuisine", "street-food", "asian-cuisine", "spiced"],
    landmarkKeys: ["luang prabang monk alms ceremony dawn", "mekong sunset luang prabang", "kuang si waterfall laos"],
  },

  hongkong: {
    id: "hongkong", name: "Hong Kong", flag: "🇭🇰",
    heroImage: "https://images.unsplash.com/photo-1576788369575-c5ce5dbe0069?w=1600&q=80",
    region: "East Asia",
    scores: { luxury: 85, nature: 55, city: 98, relaxation: 40, adventure: 58, social: 82, nightlife: 88, cultural: 82, food: 95, beach: 38, budget: 35, family: 70, romance: 72, wellness: 55 },
    climates: ["subtropical", "warm", "humid"],
    travelStyles: ["city-break", "food", "luxury", "culture", "nightlife", "skyline"],
    activities: ["food-tour", "harbour-views", "hiking", "shopping", "nightlife", "temples"],
    cities: [
      { name: "Victoria Harbour", tagline: "Neon skyline reflected in Hong Kong's famous harbour", bestFor: ["photography", "city", "nightlife"], budgetFit: "luxury" },
      { name: "Kowloon", tagline: "Bustling street food and traditional market labyrinth", bestFor: ["food", "culture", "shopping"], budgetFit: "mid-range" },
      { name: "Lantau Island", tagline: "Giant Buddha above misty monastery on a green island", bestFor: ["culture", "nature", "photography"], budgetFit: "mid-range" },
    ],
    environmentTypes: ["city", "harbour", "mountain", "island", "neon"],
    atmosphereTags: ["electric", "neon", "vibrant", "gastronomic", "dense", "energetic"],
    architectureIdentity: ["skyscraper", "chinese-vernacular", "british-colonial", "modern"],
    culturalIdentity: ["hongkongese", "cantonese", "east-asian", "sino-british"],
    emotionalProfile: ["energized", "excited", "curious", "impressed"],
    terrain: ["coastal", "mountainous", "urban"],
    cityStyle: ["futuristic", "modern", "historic"],
    foodSignals: ["fine-dining", "street-food", "dim-sum", "seafood", "local-cuisine"],
    landmarkKeys: ["hong kong neon harbour skyline night", "victoria peak hong kong", "tian tan buddha lantau hong kong"],
  },
}

// Country hint → destination ID mapping (for landmark matching)
const COUNTRY_HINT_TO_DEST: Record<string, string> = {
  "japan": "japan", "japanese": "japan", "nippon": "japan",
  "france": "france", "french": "france",
  "thailand": "thailand", "thai": "thailand",
  "italy": "italy", "italian": "italy",
  "morocco": "morocco", "moroccan": "morocco",
  "greece": "greece", "greek": "greece", "hellenic": "greece",
  "spain": "spain", "spanish": "spain",
  "united arab emirates": "dubai", "uae": "dubai", "dubai": "dubai", "emirati": "dubai",
  "vietnam": "vietnam", "vietnamese": "vietnam",
  "india": "india", "indian": "india",
  "indonesia": "bali", "bali": "bali", "balinese": "bali",
  "maldives": "maldives", "maldivian": "maldives",
  "switzerland": "switzerland", "swiss": "switzerland",
  "new zealand": "newzealand", "aotearoa": "newzealand",
  "jordan": "jordan", "jordanian": "jordan",
  "iceland": "iceland", "icelandic": "iceland",
  "norway": "norway", "norwegian": "norway",
  "south africa": "southafrica", "south african": "southafrica",
  "finland": "finland", "finnish": "finland",
  "sweden": "sweden", "swedish": "sweden",
  "canada": "canada", "canadian": "canada",
  "kenya": "kenya", "kenyan": "kenya",
  "tanzania": "tanzania", "tanzanian": "tanzania",
  "seychelles": "seychelles", "seychellois": "seychelles",
  // Nordic catch-all (aurora borealis is ambiguous — boosts all nordic)
  "nordic": "iceland", "scandinavia": "norway", "scandinavian": "norway",
  // Expansion batch
  "cambodia": "cambodia", "cambodian": "cambodia", "khmer": "cambodia",
  "czech republic": "czechrepublic", "czech": "czechrepublic", "bohemia": "czechrepublic",
  "brazil": "brazil", "brazilian": "brazil",
  "colombia": "colombia", "colombian": "colombia",
  "sri lanka": "srilanka", "srilankan": "srilanka", "ceylon": "srilanka",
  "philippines": "philippines", "filipino": "philippines", "pilipinas": "philippines",
  "georgia": "georgia", "georgian": "georgia",
  "malaysia": "malaysia", "malaysian": "malaysia",
  "austria": "austria", "austrian": "austria",
  "ireland": "ireland", "irish": "ireland",
  // Second expansion batch
  "denmark": "denmark", "danish": "denmark",
  "belgium": "belgium", "belgian": "belgium",
  "germany": "germany", "german": "germany", "deutsch": "germany",
  "hungary": "hungary", "hungarian": "hungary",
  "poland": "poland", "polish": "poland",
  "united kingdom": "unitedkingdom", "uk": "unitedkingdom", "england": "unitedkingdom", "britain": "unitedkingdom", "british": "unitedkingdom",
  "scotland": "scotland", "scottish": "scotland",
  "saudi arabia": "saudiarabia", "saudi": "saudiarabia",
  "qatar": "qatar", "qatari": "qatar",
  "oman": "oman", "omani": "oman",
  "lebanon": "lebanon", "lebanese": "lebanon",
  "madagascar": "madagascar", "malagasy": "madagascar",
  "mauritius": "mauritius", "mauritian": "mauritius",
  "china": "china", "chinese": "china",
  "bhutan": "bhutan", "bhutanese": "bhutan",
  "united states": "unitedstates", "usa": "unitedstates", "american": "unitedstates",
  "alaska": "alaska", "alaskan": "alaska",
  "argentina": "argentina", "argentinian": "argentina", "argentine": "argentina",
  "chile": "chile", "chilean": "chile",
  "dominican republic": "dominicanrepublic", "dominican": "dominicanrepublic",
  "jamaica": "jamaica", "jamaican": "jamaica",
  "bahamas": "bahamas", "bahamian": "bahamas",
  "bora bora": "borabora", "borabora": "borabora", "tahiti": "borabora", "french polynesia": "borabora",
  "fiji": "fiji", "fijian": "fiji",
  "hawaii": "hawaii", "hawaiian": "hawaii",
  "greenland": "greenland", "greenlandic": "greenland",
  "antarctica": "antarctica", "antarctic": "antarctica",
  "mongolia": "mongolia", "mongolian": "mongolia",
  "armenia": "armenia", "armenian": "armenia",
  "uzbekistan": "uzbekistan", "uzbek": "uzbekistan",
  "romania": "romania", "romanian": "romania",
  "bulgaria": "bulgaria", "bulgarian": "bulgaria",
  "slovenia": "slovenia", "slovenian": "slovenia",
  "slovakia": "slovakia", "slovak": "slovakia",
  "estonia": "estonia", "estonian": "estonia",
  "latvia": "latvia", "latvian": "latvia",
  "lithuania": "lithuania", "lithuanian": "lithuania",
  "tunisia": "tunisia", "tunisian": "tunisia",
  "algeria": "algeria", "algerian": "algeria",
  "rwanda": "rwanda", "rwandan": "rwanda",
  "ethiopia": "ethiopia", "ethiopian": "ethiopia",
  "zimbabwe": "zimbabwe", "zimbabwean": "zimbabwe",
  "zambia": "zambia", "zambian": "zambia",
  "panama": "panama", "panamanian": "panama",
  "ecuador": "ecuador", "ecuadorian": "ecuador",
  "bolivia": "bolivia", "bolivian": "bolivia",
  "guatemala": "guatemala", "guatemalan": "guatemala",
  "nicaragua": "nicaragua", "nicaraguan": "nicaragua",
  "laos": "laos", "lao": "laos", "laotian": "laos",
  "hong kong": "hongkong", "hongkong": "hongkong", "hk": "hongkong",
}

// Region → destination mapping
const REGION_TO_DESTINATIONS: Record<string, string[]> = {
  "Mediterranean":      ["greece", "france", "italy", "spain", "croatia", "portugal", "lebanon", "tunisia"],
  "Western Europe":     ["france", "spain", "italy", "switzerland", "ireland", "belgium", "germany", "netherlands", "portugal", "unitedkingdom"],
  "Southern Europe":    ["italy", "greece", "spain", "croatia", "portugal"],
  "Eastern Europe":     ["czechrepublic", "romania", "bulgaria", "estonia", "latvia", "lithuania"],
  "Central Europe":     ["czechrepublic", "austria", "germany", "hungary", "poland", "slovenia", "slovakia"],
  "Northern Europe":    ["iceland", "norway", "finland", "sweden", "denmark", "estonia", "latvia", "lithuania", "scotland", "unitedkingdom", "greenland"],
  "Nordic":             ["iceland", "norway", "finland", "sweden", "denmark", "greenland"],
  "Scandinavia":        ["norway", "finland", "sweden", "denmark"],
  "North Africa":       ["morocco", "egypt", "tunisia", "algeria"],
  "Arab World":         ["morocco", "egypt", "dubai", "jordan", "saudiarabia", "qatar", "oman", "lebanon"],
  "Middle East":        ["dubai", "jordan", "saudiarabia", "qatar", "oman", "lebanon"],
  "East Asia":          ["japan", "southkorea", "china", "hongkong"],
  "Southeast Asia":     ["thailand", "bali", "vietnam", "malaysia", "philippines", "cambodia", "singapore", "laos"],
  "South Asia":         ["india", "maldives", "srilanka", "bhutan", "nepal"],
  "Tropical":           ["thailand", "bali", "vietnam", "india", "maldives", "malaysia", "philippines", "cambodia", "srilanka", "laos", "hawaii", "fiji", "dominicanrepublic", "jamaica", "borabora"],
  "Caribbean":          ["dominicanrepublic", "jamaica", "bahamas", "cuba"],
  "South America":      ["brazil", "colombia", "peru", "argentina", "chile", "ecuador", "bolivia"],
  "Central America":    ["costarica", "panama", "guatemala", "nicaragua"],
  "Africa":             ["southafrica", "morocco", "kenya", "tanzania", "botswana", "namibia", "ethiopia", "rwanda", "zimbabwe", "zambia", "madagascar", "mauritius", "tunisia", "algeria"],
  "Sub-Saharan Africa": ["southafrica", "kenya", "tanzania", "botswana", "namibia", "ethiopia", "rwanda", "zimbabwe", "zambia", "madagascar"],
  "East Africa":        ["kenya", "tanzania", "ethiopia", "rwanda", "zimbabwe", "zambia"],
  "Southern Africa":    ["southafrica", "botswana", "namibia", "zimbabwe", "zambia"],
  "West Africa":        [],
  "Indian Ocean":       ["seychelles", "maldives", "mauritius", "madagascar"],
  "North America":      ["canada", "unitedstates", "alaska"],
  "Oceania":            ["newzealand", "australia", "fiji"],
  "South Pacific":      ["fiji", "borabora"],
  "Caucasus":           ["georgia", "armenia"],
  "Central Asia":       ["mongolia", "uzbekistan"],
  "Antarctica":         ["antarctica"],
  "Himalayas":          ["nepal", "bhutan", "india"],
}

// Scoring helpers
function countTotal(map: Record<string, number>): number {
  return Object.values(map).reduce((s, c) => s + c, 0)
}

/**
 * Weighted overlap: fraction of user map signals that match the dest list × maxPts.
 * Higher-frequency signals in the user map count proportionally more.
 */
function overlapScore(
  userMap: Record<string, number>,
  destList: string[],
  maxPts: number
): number {
  const total = countTotal(userMap)
  if (total === 0) return 0
  let matched = 0
  for (const [key, count] of Object.entries(userMap)) {
    if (destList.includes(key)) matched += count
  }
  return (matched / total) * maxPts
}

/**
 * Fuzzy overlap: substring matching between user map keys and dest list items.
 * "islamic" matches "islamic-inspired", "roman" matches "roman-classical", etc.
 */
function fuzzyOverlapScore(
  profileMap: Record<string, number>,
  destList: string[],
  maxPts: number
): number {
  const total = countTotal(profileMap)
  if (total === 0 || destList.length === 0) return 0
  let matched = 0
  for (const [key, count] of Object.entries(profileMap)) {
    const kLower = key.toLowerCase()
    const hit = destList.some(d => {
      const dLower = d.toLowerCase()
      return dLower === kLower || dLower.includes(kLower) || kLower.includes(dLower)
    })
    if (hit) matched += count
  }
  return (matched / total) * maxPts
}

function budgetMultiplier(
  userBudget: MergedTravelProfile["budgetLevel"],
  destBudgetScore: number
): number {
  switch (userBudget) {
    case "ultra": return destBudgetScore < 40 ? 1.18 : destBudgetScore > 70 ? 0.82 : 1.0
    case "high":  return destBudgetScore < 50 ? 1.10 : destBudgetScore > 75 ? 0.92 : 1.0
    case "low":   return destBudgetScore > 70 ? 1.18 : destBudgetScore < 40 ? 0.82 : 1.0
    default:      return 1.0
  }
}

// Environment group definitions for contradiction penalties
const DESERT_ENVS   = ["desert", "dunes", "sandy", "arid", "dry", "canyon", "wadi", "sahara", "steppe"]
const BEACH_ENVS    = ["beach", "ocean", "coastal", "island", "turquoise-water", "shore", "lagoon", "coral", "atoll"]
const MOUNTAIN_ENVS = ["mountain", "alpine", "glacier", "snow", "tundra", "peak", "fjord", "cliff", "highland"]
const FOREST_ENVS   = ["forest", "jungle", "tropical-forest", "rainforest", "woodland", "lush", "verdant"]
const ARCTIC_ENVS   = ["aurora", "northern-lights", "arctic", "polar", "ice", "tundra", "glacier", "hot-spring", "geothermal", "highland", "midnight-sun"]
const SAVANNA_ENVS  = ["savanna", "wildlife", "grassland", "bush", "plains", "game-reserve", "safari"]

function getEnvGroupFraction(envMap: Record<string, number>, groupKeys: string[]): number {
  const total = countTotal(envMap)
  if (total === 0) return 0
  let matched = 0
  for (const [key, count] of Object.entries(envMap)) {
    const kLower = key.toLowerCase()
    if (groupKeys.some(g => kLower.includes(g) || g.includes(kLower))) matched += count
  }
  return matched / total
}

function destHasEnv(dest: ExploreDestination, groupKeys: string[]): boolean {
  return dest.environmentTypes.some(e => {
    const eLower = e.toLowerCase()
    return groupKeys.some(g => eLower.includes(g) || g.includes(eLower))
  })
}

function penaltyScore(profile: MergedTravelProfile, dest: ExploreDestination): number {
  let penalty = 0

  if (profile.budgetLevel === "low"   && dest.scores.budget < 25) penalty += 10
  if (profile.budgetLevel === "ultra" && dest.scores.budget > 80) penalty +=  6

  if (profile.culturalInterest > 75 && profile.nightlifeInterest < 25 && dest.scores.nightlife > 88) penalty += 7
  if (profile.adventureLevel > 80 && profile.relaxationLevel < 25 && dest.scores.relaxation > 85 && dest.scores.adventure < 55) penalty += 6
  if (profile.natureLevel > 80 && dest.scores.nature < 40) penalty += 5
  if (profile.cityLevel > 80   && dest.scores.city  < 50) penalty += 5

  const envMap   = profile.environmentTypes ?? {}
  const envTotal = countTotal(envMap)

  if (envTotal > 0) {
    const desertFrac   = getEnvGroupFraction(envMap, DESERT_ENVS)
    const beachFrac    = getEnvGroupFraction(envMap, BEACH_ENVS)
    const mountainFrac = getEnvGroupFraction(envMap, MOUNTAIN_ENVS)
    const forestFrac   = getEnvGroupFraction(envMap, FOREST_ENVS)
    const arcticFrac   = getEnvGroupFraction(envMap, ARCTIC_ENVS)
    const savannaFrac  = getEnvGroupFraction(envMap, SAVANNA_ENVS)
    const natureFrac   = mountainFrac + forestFrac

    if (desertFrac  > 0.4 && !destHasEnv(dest, DESERT_ENVS))  penalty += Math.round(desertFrac  * 32)
    if (beachFrac   > 0.4 && !destHasEnv(dest, BEACH_ENVS))   penalty += Math.round(beachFrac   * 32)
    if (natureFrac  > 0.4 && !destHasEnv(dest, [...MOUNTAIN_ENVS, ...FOREST_ENVS])) penalty += Math.round(natureFrac * 28)
    if (beachFrac   > 0.3 && profile.romanticAffinity > 65 && dest.scores.beach < 30) penalty += Math.round(beachFrac * 18)
    if (arcticFrac  > 0.35 && !destHasEnv(dest, ARCTIC_ENVS)) penalty += Math.round(arcticFrac * 30)
    if (savannaFrac > 0.3 && !destHasEnv(dest, SAVANNA_ENVS)) penalty += Math.round(savannaFrac * 35)
  }

  return Math.min(penalty, 55)
}

// Landmark matching
/**
 * Resolve a Gemini country-hint string to a destination ID.
 * Handles: exact matches, partial substring, and multi-word names ("South Africa").
 */
function resolveCountryHint(hint: string | null | undefined): string | null {
  if (!hint) return null
  const h = hint.trim().toLowerCase()
  // Exact match first
  if (COUNTRY_HINT_TO_DEST[h]) return COUNTRY_HINT_TO_DEST[h]
  // Partial match: does any key appear in the hint or vice-versa?
  for (const [k, v] of Object.entries(COUNTRY_HINT_TO_DEST)) {
    if (h.includes(k) || k.includes(h)) return v
  }
  return null
}

/**
 * Compute a landmark bonus for a specific destination.
 * Returns 0 if no landmark was detected or if it doesn't map to this dest.
 */
function landmarkBonus(
  profile: MergedTravelProfile,
  dest: ExploreDestination
): number {
  const lm = profile.detectedLandmark
  if (!lm?.detected || !lm.confidence) return 0

  const mappedDest = resolveCountryHint(lm.countryHint)

  if (mappedDest === dest.id) {
    // Direct country-hint match → scale bonus by confidence
    return Math.round(lm.confidence * 35)
  }

  // Keyword match: does the landmark name contain any of the dest's landmark keys?
  if (lm.name) {
    const nameLower = lm.name.toLowerCase()
    const keyMatch = dest.landmarkKeys.some(k => nameLower.includes(k) || k.includes(nameLower))
    if (keyMatch) return Math.round(lm.confidence * 28)
  }

  return 0
}

// Main ranking function
export function rankDestinations(
  profile: MergedTravelProfile,
  topN: number = Object.keys(EXPLORE_DESTINATIONS).length
): RankedDestination[] {
  const results: RankedDestination[] = []

  for (const dest of Object.values(EXPLORE_DESTINATIONS)) {
    // 1. Environment overlap  (30% → max 60 pts)
    const envScore = fuzzyOverlapScore(profile.environmentTypes ?? {}, dest.environmentTypes, 60)

    // 2. Activities overlap   (20% → max 40 pts)
    const actScore = overlapScore(profile.activities, dest.activities, 40)

    // 3. Climate overlap      (15% → max 30 pts)
    const climScore = overlapScore(profile.climatePreference, dest.climates, 30)

    // 4. Travel style overlap (10% → max 20 pts)
    const styleScore = overlapScore(profile.travelStyles, dest.travelStyles, 20)

    // 5. Mood / atmosphere    (10% → max 20 pts)
    // Use combined mood map (atmosphere + explicit mood from new prompt)
    const moodMap  = profile.mood && countTotal(profile.mood) > 0 ? profile.mood : profile.atmosphere
    const moodScore = fuzzyOverlapScore(moodMap ?? {}, dest.atmosphereTags, 20)

    // 6. Terrain overlap       (5% → max 10 pts)
    const terrainScore = fuzzyOverlapScore(profile.terrain ?? {}, dest.terrain, 10)

    // 7. City style overlap    (3% → max  6 pts)
    const cityStyleScore = fuzzyOverlapScore(profile.cityStyle ?? {}, dest.cityStyle, 6)

    // 8. Architecture overlap  (3% → max  6 pts)
    const archScore = fuzzyOverlapScore(profile.architectureStyle ?? {}, dest.architectureIdentity, 6)

    // 9. Food signals overlap  (2% → max  4 pts)
    const foodScore = fuzzyOverlapScore(profile.foodSignals ?? {}, dest.foodSignals, 4)

    // 10. Landmark bonus (up to +35 pts)
    const lmBonus = landmarkBonus(profile, dest)

    // 11. Region affinity bonus (up to +9 pts)
    const regionTotal = countTotal(profile.possibleRegions ?? {})
    let regionScore = 0
    if (regionTotal > 0) {
      let matched = 0
      for (const [region, count] of Object.entries(profile.possibleRegions ?? {})) {
        if ((REGION_TO_DESTINATIONS[region] ?? []).includes(dest.id)) matched += count
      }
      regionScore = (matched / regionTotal) * 9
    }

    // 12. Cultural context match (up to +10 pts)
    const cultureScore = fuzzyOverlapScore(profile.culturalContext ?? {}, dest.culturalIdentity, 10)

    // 13. Emotional vibe match (up to +5 pts)
    const emotionScore = fuzzyOverlapScore(profile.emotionalVibe ?? {}, dest.emotionalProfile, 5)

    // 14. Numeric behavior match (up to +12 pts)
    // Simplified 3-dimension match: luxury, romance, adventure
    const numDims: [number, number][] = [
      [profile.luxuryLevel,     dest.scores.luxury],
      [profile.romanticAffinity, dest.scores.romance],
      [profile.adventureLevel,  dest.scores.adventure],
    ]
    let numericScore = 0
    for (const [u, d] of numDims) {
      const closeness = 1 - Math.abs(u - d) / 100
      const strength  = u / 100
      numericScore += closeness * strength * 4
    }
    numericScore = Math.min(numericScore, 12)

    // 15. Family-friendly bonus
    const famBonus = (profile.familyFriendly && dest.scores.family > 72) ? 6 : 0

    // 16. Assemble base score
    let score = envScore + actScore + climScore + styleScore + moodScore
              + terrainScore + cityStyleScore + archScore + foodScore
              + lmBonus + regionScore + cultureScore + emotionScore
              + numericScore + famBonus

    // 17. Budget multiplier
    score *= budgetMultiplier(profile.budgetLevel, dest.scores.budget)

    // 18. Contradiction penalty
    const penalty = penaltyScore(profile, dest)
    score -= penalty

    const breakdown: ScoreBreakdown = {
      environment: Math.round(envScore),
      activities:  Math.round(actScore),
      climate:     Math.round(climScore),
      travelStyle: Math.round(styleScore),
      mood:        Math.round(moodScore),
      terrain:     Math.round(terrainScore),
      cityStyle:   Math.round(cityStyleScore),
      architecture:Math.round(archScore),
      food:        Math.round(foodScore),
      landmark:    Math.round(lmBonus),
      region:      Math.round(regionScore),
      cultural:    Math.round(cultureScore),
      emotional:   Math.round(emotionScore),
      numeric:     Math.round(numericScore),
      penalty:     Math.round(penalty),
    }

    const explanation = generateExplanation(dest, profile, breakdown)

    results.push({
      id: dest.id, name: dest.name, flag: dest.flag,
      heroImage: dest.heroImage, score, cities: dest.cities,
      explanation, scoreBreakdown: breakdown,
    })
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}

// Explanation generator
function topKey(map: Record<string, number>): string {
  return Object.entries(map).sort(([, a], [, b]) => b - a)[0]?.[0] ?? ""
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

function generateExplanation(
  dest: ExploreDestination,
  profile: MergedTravelProfile,
  breakdown: ScoreBreakdown
): string[] {
  const reasons: string[] = []

  // Landmark match — strongest possible signal
  const lm = profile.detectedLandmark
  if (lm?.detected && lm.confidence >= 0.65 && breakdown.landmark > 0) {
    reasons.push(`Landmark match: ${lm.name} detected in your selections (${Math.round(lm.confidence * 100)}% confidence)`)
  }

  // Environment match — highest weighted dimension
  if (breakdown.environment >= 28) {
    const topEnv = topKey(profile.environmentTypes ?? {})
    if (topEnv) reasons.push(`Strong ${topEnv.replace(/-/g, " ")} environment match — a defining feature of ${dest.name}`)
  } else if (breakdown.environment >= 14) {
    reasons.push(`Partial environment match with ${dest.name}'s landscapes`)
  }

  // Activity match
  if (breakdown.activities >= 18) {
    const topAct = topKey(profile.activities)
    if (topAct) reasons.push(`${cap(topAct.replace(/-/g, " "))} is a standout activity in ${dest.name}`)
  }

  // Climate match
  if (breakdown.climate >= 18) {
    const topClim = topKey(profile.climatePreference)
    if (topClim) reasons.push(`${cap(topClim)} climate aligns with your image preferences`)
  }

  // Architecture match (strong cultural discriminator)
  if (breakdown.architecture >= 3) {
    const topArch = topKey(profile.architectureStyle ?? {})
    if (topArch) reasons.push(`${cap(topArch)} architecture matches the style visible in your selections`)
  }

  // Terrain match
  if (breakdown.terrain >= 5) {
    const topTerrain = topKey(profile.terrain ?? {})
    if (topTerrain) reasons.push(`${cap(topTerrain)} terrain matches your selected images`)
  }

  // Cultural context match
  if (breakdown.cultural >= 5) {
    const topCulture = topKey(profile.culturalContext ?? {})
    if (topCulture) reasons.push(`Visual cultural aesthetic aligns with ${topCulture.replace(/-/g, " ")} character`)
  }

  // Mood / atmosphere match
  if (breakdown.mood >= 10) {
    const topMood = topKey(profile.mood && countTotal(profile.mood) > 0 ? profile.mood : profile.atmosphere ?? {})
    if (topMood) reasons.push(`${cap(topMood)} atmosphere — exactly the mood your images signal`)
  }

  // City style match
  if (breakdown.cityStyle >= 3) {
    const topCity = topKey(profile.cityStyle ?? {})
    if (topCity) reasons.push(`${cap(topCity)} city character matches your urban preferences`)
  }

  // Travel style match
  if (breakdown.travelStyle >= 10) {
    const topStyle = topKey(profile.travelStyles)
    if (topStyle) reasons.push(`Perfect for ${topStyle} travel — one of ${dest.name}'s core offerings`)
  }

  // Food match
  if (breakdown.food >= 2) {
    const topFood = topKey(profile.foodSignals ?? {})
    if (topFood) reasons.push(`${cap(topFood.replace(/-/g, " "))} culture is a highlight in ${dest.name}`)
  }

  // Fallback
  if (reasons.length === 0) {
    reasons.push(`Strong overall match across multiple preference dimensions`)
  }

  return reasons.slice(0, 4)
}

// Utility exports
export function extractProfileVibes(profile: MergedTravelProfile): string[] {
  const byFreq = (map: Record<string, number>) =>
    Object.entries(map).sort(([, a], [, b]) => b - a).map(([k]) => k)

  return [
    ...byFreq(profile.travelStyles).slice(0, 3),
    ...byFreq(profile.activities).slice(0, 3),
  ].slice(0, 6)
}

export function inferTravelStyle(profile: MergedTravelProfile): string {
  const topStyle = Object.entries(profile.travelStyles)
    .sort(([, a], [, b]) => b - a)[0]?.[0]
  return topStyle ?? (profile.luxuryLevel > 70 ? "luxury" : profile.adventureLevel > 65 ? "adventure" : "cultural")
}
