/**
 * Destination Matching Engine
 *
 * Final score formula:
 *   score = visualMatch × 0.4 + budgetMatch × 0.3 + seasonMatch × 0.3
 *
 * visualMatch  = image-derived preference fit (activity + climate + mood + food)
 * budgetMatch  = how well destination cost fits user's budget  (budget-matcher.ts)
 * seasonMatch  = how well destination weather fits travel dates (season-matcher.ts)
 *
 * AI is NOT involved in this file. Gemini Vision feeds structured preferences
 * upstream; this module scores entirely with code logic.
 */

import { PreferenceProfile } from "./preferences-analyzer"
import { scoreBudgetCompatibility, getDestinationBudgetLabel, getDailyCostEstimate } from "./budget-matcher"
import { scoreSeasonCompatibility, getBestTimeToVisit, getSeasonHighlight } from "./season-matcher"

// ─── Public types ─────────────────────────────────────────────────────────────

export interface CityRecommendation {
  city: string
  why: string
  bestFor: string[]
  budgetFit: "budget" | "mid-range" | "luxury" | "all"
}

export interface DestinationMatch {
  countryCode: string
  countryName: string
  confidenceScore: number
  scoreBreakdown: ScoreBreakdown
  positives: string[]
  negatives: string[]
  climate: string
  activities: string[]
  foodHighlights: string[]
  hotels: HotelSuggestion[]
  cities?: CityRecommendation[]
  // Extended fields populated by the new engine
  budgetLabel: string
  dailyCostEstimate: string
  bestTimeToVisit: string
  seasonHighlight?: string
}

export interface ScoreBreakdown {
  activityScore: number
  climateScore:  number
  moodScore:     number
  foodScore:     number
  budgetScore:   number
  seasonScore:   number
}

export interface HotelSuggestion {
  name:           string
  style:          "budget" | "mid-range" | "luxury"
  activity_level: string
}

// ─── Scoring weights ──────────────────────────────────────────────────────────
// Visual preference match weight within the visualMatch sub-score
const V = { ACTIVITY: 0.40, CLIMATE: 0.30, MOOD: 0.20, FOOD: 0.10 }

// Top-level three-factor weights
const W = { VISUAL: 0.40, BUDGET: 0.30, SEASON: 0.30 }

// ─── Country profiles ─────────────────────────────────────────────────────────
// 24 destinations covering all major travel segments.
// Each profile defines the destination's characteristics — matching happens
// by comparing the user's extracted preferences against these arrays.

interface CountryProfile {
  name:               string
  climate:            string
  activities:         string[]
  activities_by_mood: Record<string, string[]>
  food_styles:        string[]
  food_match:         string[]
  hotels:             HotelSuggestion[]
  highlights?:        string[]
  landmarks?:         string[]
}

const COUNTRY_PROFILES: Record<string, CountryProfile> = {
  // ── Americas ────────────────────────────────────────────────────────────────
  US: {
    name: "United States",
    climate: "varied",
    activities: ["hiking", "beach", "cultural", "adventure", "nightlife", "road-trip", "nature"],
    activities_by_mood: {
      calm:        ["national parks", "nature retreats", "Pacific Coast Highway"],
      adventurous: ["rock climbing", "surfing", "skydiving", "white-water rafting"],
      cultural:    ["museums", "galleries", "historical sites", "Broadway shows"],
      luxury:      ["fine dining", "spa resorts", "private island getaways"],
    },
    food_styles:  ["burgers", "bbq", "mexican", "asian fusion", "farm-to-table", "craft beer"],
    food_match:   ["casual", "fine_dining", "street_food"],
    hotels: [
      { name: "Motel 6",       style: "budget",    activity_level: "adventure" },
      { name: "Marriott",      style: "mid-range", activity_level: "mixed" },
      { name: "Four Seasons",  style: "luxury",    activity_level: "relaxation" },
    ],
  },
  BR: {
    name: "Brazil",
    climate: "tropical",
    activities: ["beach", "culture", "nightlife", "nature", "sports", "carnival", "wildlife"],
    activities_by_mood: {
      calm:        ["beach relaxation", "nature walks", "Amazon boat trips"],
      adventurous: ["surfing", "hiking", "water sports", "zip-lining in the Amazon"],
      cultural:    ["music", "dance", "samba schools", "museums"],
      luxury:      ["resort stays", "fine dining", "helicopter tours"],
    },
    food_styles:  ["churrasco", "seafood", "tropical fruits", "street food", "açaí"],
    food_match:   ["casual", "street_food", "fine_dining"],
    hotels: [
      { name: "Hostel",             style: "budget",    activity_level: "nightlife" },
      { name: "Windsor Hotels",     style: "mid-range", activity_level: "mixed" },
      { name: "Copacabana Palace",  style: "luxury",    activity_level: "relaxation" },
    ],
  },
  MX: {
    name: "Mexico",
    climate: "tropical",
    activities: ["beach", "culture", "adventure", "food", "nightlife", "ruins", "cenotes"],
    activities_by_mood: {
      calm:        ["beach relaxation", "spa", "yoga retreats"],
      adventurous: ["cenote diving", "hiking volcanoes", "water sports"],
      cultural:    ["Mayan ruins", "colonial cities", "traditional markets"],
      luxury:      ["all-inclusive resorts", "fine dining", "private beach clubs"],
    },
    food_styles:  ["tacos", "ceviche", "mole", "street food", "margaritas", "tropical fruits"],
    food_match:   ["street_food", "casual", "fine_dining"],
    hotels: [
      { name: "Budget Resort",      style: "budget",    activity_level: "adventure" },
      { name: "Grand Palladium",    style: "mid-range", activity_level: "mixed" },
      { name: "Four Seasons Punta", style: "luxury",    activity_level: "relaxation" },
    ],
  },
  PE: {
    name: "Peru",
    climate: "varied",
    activities: ["adventure", "hiking", "cultural", "ruins", "nature", "wildlife", "food"],
    activities_by_mood: {
      calm:        ["Sacred Valley villages", "Lake Titicaca boat trips"],
      adventurous: ["Inca Trail trek", "Rainbow Mountain hike", "white-water rafting"],
      cultural:    ["Machu Picchu", "Cusco colonial architecture", "artisan markets"],
      luxury:      ["luxury train to Machu Picchu", "Belmond hotels", "private guides"],
    },
    food_styles:  ["ceviche", "lomo saltado", "guinea pig", "quinoa dishes", "Peruvian fusion"],
    food_match:   ["traditional", "fine_dining", "street_food"],
    hotels: [
      { name: "Hostal Corihuasi",   style: "budget",    activity_level: "adventure" },
      { name: "JW Marriott Lima",   style: "mid-range", activity_level: "cultural" },
      { name: "Belmond Sanctuary",  style: "luxury",    activity_level: "relaxation" },
    ],
  },

  // ── Europe ──────────────────────────────────────────────────────────────────
  FR: {
    name: "France",
    climate: "temperate",
    activities: ["food", "cultural", "wine", "countryside", "art", "fashion", "history"],
    activities_by_mood: {
      calm:        ["countryside walks", "wine tasting", "Provençal markets"],
      adventurous: ["cycling through Loire Valley", "paragliding in Alps"],
      cultural:    ["art galleries", "historical monuments", "theater"],
      luxury:      ["Michelin dining", "spa châteaux", "fashion shopping"],
    },
    food_styles:  ["french cuisine", "wine", "cheese", "pâtisserie", "fine dining"],
    food_match:   ["fine_dining", "traditional"],
    hotels: [
      { name: "Ibis",     style: "budget",    activity_level: "sightseeing" },
      { name: "Sofitel",  style: "mid-range", activity_level: "mixed" },
      { name: "Le Ritz",  style: "luxury",    activity_level: "fine_dining" },
    ],
  },
  IT: {
    name: "Italy",
    climate: "mediterranean",
    activities: ["cultural", "food", "art", "beach", "hiking", "wine", "history"],
    activities_by_mood: {
      calm:        ["Tuscan countryside", "wine tasting", "coastal villages"],
      adventurous: ["Dolomites hiking", "water sports", "cycling"],
      cultural:    ["Colosseum", "Uffizi Gallery", "Vatican", "Pompeii"],
      luxury:      ["gondola experiences", "Michelin dining", "Lake Como villas"],
    },
    food_styles:  ["pasta", "pizza", "Italian cuisine", "wine", "gelato", "espresso"],
    food_match:   ["fine_dining", "traditional", "street_food"],
    hotels: [
      { name: "Ostello Bello",  style: "budget",    activity_level: "sightseeing" },
      { name: "NH Hotels",      style: "mid-range", activity_level: "mixed" },
      { name: "Four Seasons",   style: "luxury",    activity_level: "cultural" },
    ],
  },
  ES: {
    name: "Spain",
    climate: "mediterranean",
    activities: ["beach", "cultural", "food", "art", "nightlife", "festivals", "hiking"],
    activities_by_mood: {
      calm:        ["beach relaxation", "wine tasting", "Andalusian villages"],
      adventurous: ["hiking Sierra Nevada", "water sports", "cycling"],
      cultural:    ["flamenco", "Sagrada Família", "Prado Museum"],
      luxury:      ["private beach clubs", "Ibiza yachts", "fine dining"],
    },
    food_styles:  ["paella", "tapas", "sangria", "seafood", "jamón", "churros"],
    food_match:   ["traditional", "fine_dining", "street_food"],
    hotels: [
      { name: "Hostal",             style: "budget",    activity_level: "nightlife" },
      { name: "AC Hotels",          style: "mid-range", activity_level: "mixed" },
      { name: "Mandarin Oriental",  style: "luxury",    activity_level: "cultural" },
    ],
  },
  GR: {
    name: "Greece",
    climate: "mediterranean",
    activities: ["beach", "cultural", "sailing", "food", "history", "island-hopping", "photography"],
    activities_by_mood: {
      calm:        ["Santorini sunset", "Mykonos beach clubs", "Crete countryside"],
      adventurous: ["sailing the Cyclades", "hiking Samaria Gorge", "cliff diving"],
      cultural:    ["Acropolis", "Delphi", "Meteora monasteries", "Minoan ruins"],
      luxury:      ["private villa rentals", "yacht charters", "cave hotels Santorini"],
    },
    food_styles:  ["mezze", "moussaka", "fresh seafood", "Greek salad", "souvlaki", "baklava"],
    food_match:   ["traditional", "seafood", "fine_dining"],
    hotels: [
      { name: "Budget Guesthouse",  style: "budget",    activity_level: "exploration" },
      { name: "Electra Hotels",     style: "mid-range", activity_level: "mixed" },
      { name: "Katikies Santorini", style: "luxury",    activity_level: "relaxation" },
    ],
  },
  PT: {
    name: "Portugal",
    climate: "mediterranean",
    activities: ["beach", "cultural", "food", "surfing", "wine", "history", "nightlife"],
    activities_by_mood: {
      calm:        ["Alentejo vineyard stays", "Algarve beaches", "Sintra palaces"],
      adventurous: ["Nazaré big wave surfing", "hiking Rota Vicentina", "mountain biking"],
      cultural:    ["Belém Tower", "Fado music", "azulejo tile art", "historic trams"],
      luxury:      ["wine estates", "Bairro Alto boutique hotels", "Michelin dining Lisbon"],
    },
    food_styles:  ["pastéis de nata", "bacalhau", "francesinha", "seafood", "Douro wine"],
    food_match:   ["traditional", "seafood", "casual"],
    hotels: [
      { name: "Home Lisbon Hostel",  style: "budget",    activity_level: "exploration" },
      { name: "Tivoli Hotels",       style: "mid-range", activity_level: "mixed" },
      { name: "Bairro Alto Hotel",   style: "luxury",    activity_level: "cultural" },
    ],
  },
  CH: {
    name: "Switzerland",
    climate: "cold",
    activities: ["skiing", "hiking", "mountain", "luxury", "wellness", "nature", "culture"],
    activities_by_mood: {
      calm:        ["lakeside villages", "spa & wellness", "chocolate factory tours"],
      adventurous: ["skiing Verbier & Zermatt", "paragliding Interlaken", "via ferrata"],
      cultural:    ["Geneva museums", "Zurich art district", "Bern medieval old town"],
      luxury:      ["St. Moritz ski resort", "Michelin dining Zurich", "private chalets"],
    },
    food_styles:  ["fondue", "raclette", "rösti", "Swiss chocolate", "fine dining"],
    food_match:   ["fine_dining", "traditional", "luxury"],
    hotels: [
      { name: "Youth Hostel",      style: "budget",    activity_level: "adventure" },
      { name: "Swiss Quality",     style: "mid-range", activity_level: "mixed" },
      { name: "The Dolder Grand",  style: "luxury",    activity_level: "relaxation" },
    ],
  },
  HR: {
    name: "Croatia",
    climate: "mediterranean",
    activities: ["beach", "sailing", "cultural", "nightlife", "island-hopping", "history", "nature"],
    activities_by_mood: {
      calm:        ["Hvar island vineyards", "Plitvice Lakes walks", "Istrian truffle hunting"],
      adventurous: ["sea kayaking Dubrovnik", "rock climbing Paklenica", "cliff diving Vis"],
      cultural:    ["Diocletian's Palace Split", "Dubrovnik city walls", "Rovinj old town"],
      luxury:      ["private yacht charters", "Hvar boutique hotels", "truffle dinners"],
    },
    food_styles:  ["fresh Adriatic seafood", "pašticada", "Peka slow-cook", "truffles", "Dingač wine"],
    food_match:   ["seafood", "traditional", "fine_dining"],
    hotels: [
      { name: "Hostel Angelina",    style: "budget",    activity_level: "exploration" },
      { name: "Sheraton Dubrovnik", style: "mid-range", activity_level: "mixed" },
      { name: "Amfora Hvar",        style: "luxury",    activity_level: "relaxation" },
    ],
  },

  // ── Asia ────────────────────────────────────────────────────────────────────
  JP: {
    name: "Japan",
    climate: "temperate",
    activities: ["cultural", "hiking", "food", "technology", "nightlife", "wellness", "history"],
    activities_by_mood: {
      calm:        ["temples & gardens", "tea ceremonies", "ryokan onsen stays"],
      adventurous: ["Mount Fuji trek", "skiing Hakuba", "ninja experiences"],
      cultural:    ["shrine visits", "Noh theater", "art museums", "manga culture"],
      luxury:      ["kaiseki multi-course dining", "luxury ryokan", "private geisha show"],
    },
    food_styles:  ["sushi", "ramen", "tempura", "izakaya", "kaiseki", "wagyu beef"],
    food_match:   ["seafood", "traditional", "fine_dining"],
    hotels: [
      { name: "APA Hotel",        style: "budget",    activity_level: "exploration" },
      { name: "Mitsui Garden",    style: "mid-range", activity_level: "mixed" },
      { name: "The Prince Park Tower", style: "luxury", activity_level: "cultural" },
    ],
  },
  TH: {
    name: "Thailand",
    climate: "tropical",
    activities: ["beach", "culture", "food", "diving", "nightlife", "wellness", "elephants"],
    activities_by_mood: {
      calm:        ["beach relaxation", "spa", "meditation retreats", "elephant sanctuaries"],
      adventurous: ["rock climbing Railay", "jungle trekking Chiang Rai", "diving Koh Tao"],
      cultural:    ["Chiang Mai temples", "Bangkok floating markets", "hill tribe villages"],
      luxury:      ["private beach resort", "6-star spa retreats", "rooftop bars Bangkok"],
    },
    food_styles:  ["pad thai", "street food", "seafood BBQ", "Thai curry", "mango sticky rice"],
    food_match:   ["street_food", "seafood", "casual"],
    hotels: [
      { name: "Lub d Hostel",      style: "budget",    activity_level: "nightlife" },
      { name: "Centara Grand",     style: "mid-range", activity_level: "mixed" },
      { name: "Mandarin Oriental", style: "luxury",    activity_level: "relaxation" },
    ],
  },
  ID: {
    name: "Indonesia",
    climate: "tropical",
    activities: ["beach", "surfing", "cultural", "diving", "nature", "wellness", "volcano-trekking"],
    activities_by_mood: {
      calm:        ["Ubud rice terrace walks", "spa & yoga", "sunset at Tanah Lot"],
      adventurous: ["Mount Rinjani trek", "surfing Uluwatu", "diving Komodo"],
      cultural:    ["Uluwatu temple", "Tegallalang rice terraces", "Balinese dance"],
      luxury:      ["private pool villas", "COMO Shambhala retreat", "luxury safari Komodo"],
    },
    food_styles:  ["nasi goreng", "satay", "tempeh", "rendang", "fresh tropical fruit"],
    food_match:   ["street_food", "casual", "traditional"],
    hotels: [
      { name: "Puri Garden Hostel", style: "budget",    activity_level: "adventure" },
      { name: "Alaya Ubud",         style: "mid-range", activity_level: "mixed" },
      { name: "COMO Uma Ubud",      style: "luxury",    activity_level: "wellness" },
    ],
  },
  IN: {
    name: "India",
    climate: "tropical",
    activities: ["cultural", "food", "adventure", "spiritual", "nature", "wildlife", "wellness"],
    activities_by_mood: {
      calm:        ["meditation in Rishikesh", "Goa beach", "Kerala backwater houseboat"],
      adventurous: ["trekking Himalayas", "white-water rafting Rishikesh", "tiger safari Ranthambore"],
      cultural:    ["Taj Mahal", "Rajasthan forts", "Varanasi ghats", "Jaipur markets"],
      luxury:      ["palace hotels Udaipur", "private yoga retreats", "fine dining Mumbai"],
    },
    food_styles:  ["curry", "street food", "biryani", "thali", "tandoori", "chaats"],
    food_match:   ["street_food", "traditional"],
    hotels: [
      { name: "Zostel",       style: "budget",    activity_level: "exploration" },
      { name: "Taj Hotels",   style: "mid-range", activity_level: "mixed" },
      { name: "Oberoi",       style: "luxury",    activity_level: "cultural" },
    ],
  },
  TR: {
    name: "Turkey",
    climate: "mediterranean",
    activities: ["cultural", "beach", "food", "history", "hot-air-balloon", "bazaar", "wellness"],
    activities_by_mood: {
      calm:        ["Turkish bath hammam", "Cappadocia balloon", "Aegean coastal villages"],
      adventurous: ["hot-air ballooning Cappadocia", "Taurus Mountains hiking", "paragliding Ölüdeniz"],
      cultural:    ["Hagia Sophia", "Topkapi Palace", "Grand Bazaar", "Ephesus ruins"],
      luxury:      ["private gulet yacht cruise", "boutique Cappadocia cave hotels", "Bosphorus dinner"],
    },
    food_styles:  ["meze", "kebab", "baklava", "börek", "Turkish breakfast", "fresh seafood"],
    food_match:   ["street_food", "traditional", "fine_dining"],
    hotels: [
      { name: "Sultan Hostel",    style: "budget",    activity_level: "exploration" },
      { name: "Swissôtel Ankara", style: "mid-range", activity_level: "mixed" },
      { name: "Argos in Cappadocia", style: "luxury", activity_level: "cultural" },
    ],
  },
  VN: {
    name: "Vietnam",
    climate: "tropical",
    activities: ["food", "cultural", "nature", "beach", "history", "motorbike", "adventure"],
    activities_by_mood: {
      calm:        ["Ha Long Bay cruise", "Hội An old town", "Mekong Delta cycling"],
      adventurous: ["motorbike tour Hai Van Pass", "Ha Giang loop", "Fansipan summit trek"],
      cultural:    ["Hue Imperial City", "My Son Sanctuary", "Hanoi Old Quarter", "war museums"],
      luxury:      ["Heritage Cruises Ha Long", "Six Senses Côn Đảo", "Anantara Hội An"],
    },
    food_styles:  ["pho", "bánh mì", "fresh spring rolls", "bún bò Huế", "cà phê trứng"],
    food_match:   ["street_food", "traditional", "casual"],
    hotels: [
      { name: "Hanoi Backpackers",  style: "budget",    activity_level: "exploration" },
      { name: "Sofitel Legend",     style: "mid-range", activity_level: "mixed" },
      { name: "Nam Nghi Island",    style: "luxury",    activity_level: "relaxation" },
    ],
  },
  SG: {
    name: "Singapore",
    climate: "tropical",
    activities: ["food", "shopping", "nightlife", "cultural", "nature", "luxury", "technology"],
    activities_by_mood: {
      calm:        ["Singapore Botanic Gardens", "Sentosa beach", "hawker centre hopping"],
      adventurous: ["Clarke Quay nightlife", "G-MAX bungee", "Universal Studios"],
      cultural:    ["Chinatown", "Little India", "Arab Street", "Peranakan museum"],
      luxury:      ["Marina Bay Sands infinity pool", "Michelin-starred hawker stalls", "private clubs"],
    },
    food_styles:  ["hawker food", "chicken rice", "laksa", "char kway teow", "chilli crab", "durian"],
    food_match:   ["street_food", "fine_dining", "seafood"],
    hotels: [
      { name: "The Pod",          style: "budget",    activity_level: "exploration" },
      { name: "Parkroyal",        style: "mid-range", activity_level: "mixed" },
      { name: "Marina Bay Sands", style: "luxury",    activity_level: "nightlife" },
    ],
  },

  // ── Middle East & Africa ─────────────────────────────────────────────────────
  MA: {
    name: "Morocco",
    climate: "desert",
    activities: ["cultural", "desert", "food", "souks", "trekking", "history", "photography"],
    activities_by_mood: {
      calm:        ["riyadh rooftop tea", "Majorelle Garden Marrakech", "Essaouira medina"],
      adventurous: ["Sahara Desert camel trek", "Atlas Mountains hiking", "quad biking dunes"],
      cultural:    ["Fès el-Bali medina", "Medersa Bou Inania", "Aït Benhaddou kasbah"],
      luxury:      ["La Mamounia palace hotel", "Aman Amanjena", "private desert camp"],
    },
    food_styles:  ["tagine", "couscous", "mint tea", "pastilla", "merguez", "harira soup"],
    food_match:   ["traditional", "street_food", "casual"],
    hotels: [
      { name: "Riad Dar Zitoun",   style: "budget",    activity_level: "exploration" },
      { name: "Riad Yasmine",      style: "mid-range", activity_level: "cultural" },
      { name: "La Mamounia",       style: "luxury",    activity_level: "relaxation" },
    ],
  },





  AE: {
    name: "United Arab Emirates",
    climate: "desert",
    activities: ["luxury", "shopping", "desert", "beach", "architecture", "nightlife", "diving"],
    activities_by_mood: {
      calm:        ["spa day", "Abu Dhabi corniche walk", "desert sunset photography"],
      adventurous: ["dune bashing", "skydiving over Palm Jumeirah", "kite surfing"],
      cultural:    ["Louvre Abu Dhabi", "Dubai Museum of the Future", "Al Fahidi district"],
      luxury:      ["Burj Al Arab dinner", "private yacht charter", "helicopter city tour"],
    },
    food_styles:  ["mezze", "shawarma", "Emirati machboos", "international buffets", "fine dining"],
    food_match:   ["fine_dining", "street_food", "luxury"],
    hotels: [
      { name: "Ibis Dubai",      style: "budget",    activity_level: "sightseeing" },
      { name: "Marriott JBR",    style: "mid-range", activity_level: "mixed" },
      { name: "Burj Al Arab",    style: "luxury",    activity_level: "relaxation" },
    ],
  },
  ZA: {
    name: "South Africa",
    climate: "varied",
    activities: ["safari", "wildlife", "beach", "wine", "adventure", "hiking", "cultural"],
    activities_by_mood: {
      calm:        ["Cape Winelands wine tasting", "Boulders Beach penguins", "garden route drives"],
      adventurous: ["Cage diving with sharks", "Drakensberg hiking", "bungee jumping Bloukrans"],
      cultural:    ["Robben Island", "Apartheid Museum", "Zulu cultural villages"],
      luxury:      ["private game lodge Sabi Sands", "Ellerman House Cape Town", "Singita"],
    },
    food_styles:  ["braai (barbecue)", "bobotie", "biltong", "Cape Malay curry", "seafood"],
    food_match:   ["casual", "traditional", "fine_dining"],
    hotels: [
      { name: "Ashanti Lodge",     style: "budget",    activity_level: "adventure" },
      { name: "The Table Bay",     style: "mid-range", activity_level: "mixed" },
      { name: "Ellerman House",    style: "luxury",    activity_level: "relaxation" },
    ],
  },
 DZ: {
  name: "Algeria",
  climate: "mediterranean_desert",
  activities: [
    "cultural",
    "desert",
    "history",
    "food",
    "hiking",
    "photography",
    "beaches"
  ],
  activities_by_mood: {
    calm: [
      "Jardin d'Essai Algiers",
      "Casbah walking tour",
      "Ghardaia old town"
    ],
    adventurous: [
      "Hoggar Mountains trekking",
      "Sahara Desert expedition",
      "Tassili n'Ajjer exploration"
    ],
    cultural: [
      "Casbah of Algiers",
      "Timgad Roman ruins",
      "Djémila archaeological site"
    ],
    luxury: [
      "Royal Hotel Oran",
      "Sofitel Algiers Hamma Garden",
      "private Sahara luxury camp"
    ],
  },
  food_styles: [
    "couscous",
    "rechta",
    "chakchouka",
    "mechoui",
    "dolma",
    "makroud"
  ],
  food_match: [
    "traditional",
    "street_food",
    "casual"
  ],
  hotels: [
    {
      name: "Hotel El Aurassi",
      style: "luxury",
      activity_level: "business"
    },
    {
      name: "Sofitel Algiers Hamma Garden",
      style: "luxury",
      activity_level: "relaxation"
    },
    {
      name: "AZ Hotels Zeralda",
      style: "mid-range",
      activity_level: "beach"
    }
  ],
},

  // ── Oceania ─────────────────────────────────────────────────────────────────
  AU: {
    name: "Australia",
    climate: "tropical",
    activities: ["beach", "outdoor", "diving", "hiking", "wildlife", "surfing", "nature"],
    activities_by_mood: {
      calm:        ["Great Ocean Road drive", "Whitsundays sailing", "wildlife watching"],
      adventurous: ["surfing Bondi", "skydiving Mission Beach", "Great Barrier Reef diving"],
      cultural:    ["Aboriginal experiences", "Melbourne arts scene", "Opera House Sydney"],
      luxury:      ["Qualia Hamilton Island", "Saffire Freycinet", "helicopter reef tours"],
    },
    food_styles:  ["fresh seafood", "flat white coffee", "barbecue", "avocado toast", "native ingredients"],
    food_match:   ["seafood", "casual", "fine_dining"],
    hotels: [
      { name: "Base Backpackers",  style: "budget",    activity_level: "adventure" },
      { name: "Hilton Sydney",     style: "mid-range", activity_level: "mixed" },
      { name: "Park Hyatt Sydney", style: "luxury",    activity_level: "relaxation" },
    ],
  },
  NZ: {
    name: "New Zealand",
    climate: "temperate",
    activities: ["adventure", "hiking", "nature", "bungee", "cultural", "skiing", "wildlife"],
    activities_by_mood: {
      calm:        ["Marlborough wine region", "Milford Sound cruise", "Hobbiton tour"],
      adventurous: ["bungee jumping Queenstown", "Tongariro crossing", "skydiving Abel Tasman"],
      cultural:    ["Māori hangi experience", "Te Papa Museum Wellington", "Waitangi Treaty Grounds"],
      luxury:      ["Huka Lodge", "Eagles Nest", "helicopter skiing Wanaka"],
    },
    food_styles:  ["Māori hangi", "lamb", "green-lipped mussels", "pavlova", "flat white", "whitebait"],
    food_match:   ["casual", "traditional", "fine_dining"],
    hotels: [
      { name: "YHA Queenstown",   style: "budget",    activity_level: "adventure" },
      { name: "Sofitel Auckland", style: "mid-range", activity_level: "mixed" },
      { name: "Huka Lodge",       style: "luxury",    activity_level: "nature" },
    ],
  },
}

// ─── City-level recommendations per country ───────────────────────────────────

const CITY_PROFILES: Record<string, CityRecommendation[]> = {
  US: [
    { city: "New York",         why: "World-class culture, dining and nightlife",           bestFor: ["cultural", "nightlife", "food"],   budgetFit: "all" },
    { city: "Los Angeles",      why: "Beach, entertainment and outdoor lifestyle",           bestFor: ["beach", "adventure", "party"],      budgetFit: "mid-range" },
    { city: "New Orleans",      why: "Vibrant music scene and rich Creole food culture",    bestFor: ["nightlife", "food", "cultural"],    budgetFit: "budget" },
    { city: "Las Vegas",        why: "Entertainment, nightlife and luxury resorts — gateway to the Grand Canyon", bestFor: ["party", "luxury", "nature"], budgetFit: "mid-range" },
    { city: "San Francisco",    why: "Bay city of innovation, hills and world-class dining",bestFor: ["cultural", "food", "adventure"],    budgetFit: "mid-range" },
  ],
  BR: [
    { city: "Rio de Janeiro",   why: "Carnival, beaches and legendary nightlife",           bestFor: ["beach", "party", "nightlife"],      budgetFit: "mid-range" },
    { city: "Manaus",           why: "Amazon gateway city with jungle lodges and wildlife", bestFor: ["nature", "adventure", "wildlife"],  budgetFit: "budget" },
    { city: "São Paulo",        why: "Cultural melting pot with world-class gastronomy",    bestFor: ["food", "cultural", "nightlife"],    budgetFit: "all" },
    { city: "Fernando de Noronha", why: "Remote paradise with pristine diving and beaches", bestFor: ["beach", "diving", "relaxation"],   budgetFit: "luxury" },
  ],
  MX: [
    { city: "Mexico City",      why: "Vibrant culture, street food and historic sites",    bestFor: ["food", "cultural", "history"],      budgetFit: "budget" },
    { city: "Tulum",            why: "Bohemian beach vibes with cenotes and ruins",        bestFor: ["beach", "wellness", "adventure"],   budgetFit: "mid-range" },
    { city: "Cancún",           why: "Lively resort strip with turquoise Caribbean",       bestFor: ["beach", "party", "nightlife"],      budgetFit: "all" },
    { city: "Oaxaca",           why: "Rich indigenous culture and exceptional food scene", bestFor: ["food", "cultural", "art"],          budgetFit: "budget" },
  ],
  FR: [
    { city: "Paris",            why: "Art, fashion, romance and legendary fine dining",    bestFor: ["cultural", "food", "romance"],      budgetFit: "all" },
    { city: "Nice / Côte d'Azur", why: "Glamorous Mediterranean riviera lifestyle",       bestFor: ["beach", "luxury", "relaxation"],   budgetFit: "luxury" },
    { city: "Lyon",             why: "Gastronomic capital with authentic local bistros",   bestFor: ["food", "cultural"],                budgetFit: "mid-range" },
    { city: "Chamonix",         why: "Alpine adventure — skiing, hiking, Mont Blanc",      bestFor: ["adventure", "skiing", "nature"],   budgetFit: "mid-range" },
  ],
  IT: [
    { city: "Rome",             why: "Eternal city — ancient history and incredible food", bestFor: ["cultural", "history", "food"],      budgetFit: "all" },
    { city: "Florence",         why: "Renaissance art capital with stunning architecture", bestFor: ["art", "cultural", "food"],          budgetFit: "mid-range" },
    { city: "Amalfi Coast",     why: "Dramatic cliffs, luxury and Mediterranean beauty",  bestFor: ["beach", "luxury", "romance"],       budgetFit: "luxury" },
    { city: "Dolomites",        why: "Dramatic peaks for hiking, skiing and scenery",     bestFor: ["adventure", "hiking", "nature"],    budgetFit: "mid-range" },
    { city: "Venice",           why: "Romantic canals and unique historic atmosphere",    bestFor: ["romance", "cultural", "art"],       budgetFit: "all" },
  ],
  ES: [
    { city: "Barcelona",        why: "Architecture, beach and electric nightlife",         bestFor: ["cultural", "beach", "nightlife"],   budgetFit: "all" },
    { city: "Ibiza",            why: "World-famous club scene and beautiful beaches",     bestFor: ["party", "nightlife", "beach"],      budgetFit: "mid-range" },
    { city: "Madrid",           why: "World-class museums, tapas and vibrant culture",    bestFor: ["cultural", "food", "nightlife"],    budgetFit: "all" },
    { city: "Seville",          why: "Flamenco, Moorish architecture and tapas culture",  bestFor: ["cultural", "food", "history"],      budgetFit: "budget" },
  ],
  JP: [
    { city: "Tokyo",            why: "Neon-lit megacity — nightlife, tech and street food", bestFor: ["city", "food", "nightlife"],      budgetFit: "all" },
    { city: "Kyoto",            why: "Ancient temples, geisha districts and zen gardens",  bestFor: ["cultural", "history", "wellness"], budgetFit: "mid-range" },
    { city: "Osaka",            why: "Japan's food capital with irresistible street eats", bestFor: ["food", "nightlife", "cultural"],   budgetFit: "budget" },
    { city: "Hokkaido",         why: "World-class skiing and pristine powder snow",        bestFor: ["skiing", "nature", "adventure"],   budgetFit: "mid-range" },
  ],
  TH: [
    { city: "Bangkok",          why: "Sensory overload — temples, street food and nightlife", bestFor: ["food", "nightlife", "cultural"], budgetFit: "budget" },
    { city: "Phuket",           why: "Tropical beaches with lively bar scene",              bestFor: ["beach", "party", "relaxation"],   budgetFit: "all" },
    { city: "Chiang Mai",       why: "Cultural temples, jungle treks and wellness retreats", bestFor: ["cultural", "wellness", "nature"], budgetFit: "budget" },
    { city: "Koh Samui",        why: "Luxury beach resorts on a stunning island",           bestFor: ["beach", "luxury", "relaxation"],  budgetFit: "luxury" },
  ],
  ID: [
    { city: "Bali",             why: "Spiritual retreats, surf and rice-field scenery",    bestFor: ["wellness", "surf", "cultural"],     budgetFit: "all" },
    { city: "Lombok",           why: "Pristine beaches and world-class surf breaks",       bestFor: ["beach", "adventure", "surf"],       budgetFit: "budget" },
    { city: "Raja Ampat",       why: "World's best diving in remote island paradise",      bestFor: ["diving", "nature", "adventure"],    budgetFit: "luxury" },
  ],
  GR: [
    { city: "Santorini",        why: "Iconic cliffside views and unforgettable sunsets",   bestFor: ["romance", "luxury", "relaxation"],  budgetFit: "luxury" },
    { city: "Athens",           why: "Ancient history meets vibrant modern culture",       bestFor: ["cultural", "history", "food"],      budgetFit: "mid-range" },
    { city: "Mykonos",          why: "Glamorous nightlife and beautiful beaches",          bestFor: ["party", "nightlife", "beach"],      budgetFit: "luxury" },
    { city: "Crete",            why: "Diverse beaches, villages and Minoan history",       bestFor: ["beach", "cultural", "nature"],      budgetFit: "all" },
  ],
  MA: [
    { city: "Marrakech",        why: "Labyrinthine medina, souks and rooftop dining",      bestFor: ["cultural", "food", "adventure"],    budgetFit: "all" },
    { city: "Merzouga",         why: "Desert town on the edge of the Sahara — camel treks and star camps", bestFor: ["adventure", "nature", "photography"], budgetFit: "mid-range" },
    { city: "Essaouira",        why: "Laid-back Atlantic coast with kite-surfing culture", bestFor: ["beach", "adventure", "relaxation"], budgetFit: "budget" },
  ],
  AE: [
    { city: "Dubai",            why: "Hyper-luxurious skyline with world-record everything", bestFor: ["luxury", "nightlife", "shopping"], budgetFit: "luxury" },
    { city: "Abu Dhabi",        why: "Cultural depth, grand mosques and F1 racing",        bestFor: ["cultural", "luxury", "adventure"],  budgetFit: "luxury" },
  ],
  AU: [
    { city: "Sydney",           why: "Iconic harbour, beaches and cosmopolitan dining",    bestFor: ["beach", "food", "cultural"],        budgetFit: "all" },
    { city: "Cairns",           why: "Tropical gateway to the Great Barrier Reef and rainforest", bestFor: ["diving", "nature", "adventure"], budgetFit: "mid-range" },
    { city: "Melbourne",        why: "Arts, coffee culture and laneway bar scene",         bestFor: ["cultural", "food", "nightlife"],    budgetFit: "all" },
    { city: "Alice Springs",    why: "Red Centre base for Uluru and Aboriginal culture",   bestFor: ["cultural", "adventure", "nature"],  budgetFit: "mid-range" },
  ],
  SG: [
    { city: "Singapore",        why: "Futuristic city-state with incredible food diversity", bestFor: ["food", "city", "cultural"],       budgetFit: "all" },
  ],
  IN: [
    { city: "Rajasthan",        why: "Majestic palaces, desert forts and vibrant culture", bestFor: ["cultural", "history", "adventure"], budgetFit: "all" },
    { city: "Goa",              why: "Beach parties, Portuguese heritage and yoga retreats", bestFor: ["beach", "party", "wellness"],     budgetFit: "budget" },
    { city: "Kerala",           why: "Backwaters, spice plantations and Ayurvedic wellness", bestFor: ["wellness", "nature", "cultural"],  budgetFit: "budget" },
  ],
  TR: [
    { city: "Istanbul",         why: "East-meets-West — bazaars, mosques and incredible food", bestFor: ["cultural", "food", "history"], budgetFit: "all" },
    { city: "Cappadocia",       why: "Surreal landscapes and hot air balloon rides",        bestFor: ["adventure", "nature", "romance"],   budgetFit: "mid-range" },
    { city: "Bodrum",           why: "Aegean riviera with luxury marinas and beach clubs",  bestFor: ["beach", "luxury", "nightlife"],    budgetFit: "luxury" },
  ],
  VN: [
    { city: "Hanoi",            why: "Chaotic yet charming capital with superb street food", bestFor: ["food", "cultural", "history"],    budgetFit: "budget" },
    { city: "Ha Long City",     why: "Gateway to Ha Long Bay's dramatic karst islands",      bestFor: ["nature", "adventure", "relaxation"], budgetFit: "mid-range" },
    { city: "Hoi An",           why: "Lantern-lit Old Town — perfect for food and culture",  bestFor: ["cultural", "food", "beach"],       budgetFit: "budget" },
  ],
  PE: [
    { city: "Cusco",            why: "Inca capital at altitude — base for Machu Picchu treks", bestFor: ["history", "adventure", "cultural"], budgetFit: "mid-range" },
    { city: "Lima",             why: "South America's gastronomic capital",                bestFor: ["food", "cultural", "nightlife"],    budgetFit: "all" },
    { city: "Iquitos",          why: "Amazon jungle city accessible only by boat or plane", bestFor: ["nature", "adventure", "wildlife"],  budgetFit: "mid-range" },
  ],
  CH: [
    { city: "Zurich",           why: "Clean, wealthy city with excellent museums and food", bestFor: ["cultural", "food", "luxury"],      budgetFit: "luxury" },
    { city: "Interlaken",       why: "Adventure sports hub between two glacier lakes",     bestFor: ["adventure", "skiing", "nature"],    budgetFit: "mid-range" },
    { city: "Zermatt",          why: "Car-free alpine village with views of the Matterhorn", bestFor: ["skiing", "nature", "romance"],   budgetFit: "luxury" },
  ],
  PT: [
    { city: "Lisbon",           why: "Hilly city with fado music, tiles and great food",  bestFor: ["cultural", "food", "nightlife"],    budgetFit: "budget" },
    { city: "Porto",            why: "Wine cellars, riverside charm and port wine tastings", bestFor: ["food", "cultural", "relaxation"], budgetFit: "budget" },
    { city: "Algarve",          why: "Dramatic sea cliffs and golden beaches",             bestFor: ["beach", "nature", "relaxation"],   budgetFit: "mid-range" },
  ],
  HR: [
    { city: "Dubrovnik",        why: "Game-of-Thrones walled city on the Adriatic",       bestFor: ["cultural", "beach", "history"],     budgetFit: "mid-range" },
    { city: "Split",            why: "Vibrant nightlife inside a Roman palace",           bestFor: ["nightlife", "cultural", "beach"],   budgetFit: "budget" },
    { city: "Hvar Island",      why: "Glamorous island with beach clubs and lavender",    bestFor: ["party", "beach", "luxury"],         budgetFit: "luxury" },
  ],
  ZA: [
    { city: "Cape Town",        why: "Stunning mountain-sea scenery and wine routes",      bestFor: ["nature", "food", "adventure"],      budgetFit: "all" },
    { city: "Hoedspruit",       why: "Safari town — gateway to Kruger and Big Five game", bestFor: ["wildlife", "nature", "adventure"],  budgetFit: "mid-range" },
    { city: "George",           why: "Garden Route hub with beaches, forests and golf",   bestFor: ["nature", "adventure", "road-trip"], budgetFit: "budget" },
  ],
  
  DZ: [
  {
    city: "Algiers",
    why: "Historic capital blending Mediterranean charm, Ottoman heritage, and modern culture",
    bestFor: ["cultural", "history", "food"],
    budgetFit: "mid-range"
  },
  {
    city: "Constantine",
    why: "Spectacular city of bridges with dramatic cliffs and rich history",
    bestFor: ["history", "photography", "cultural"],
    budgetFit: "budget"
  },
  {
    city: "Oran",
    why: "Vibrant coastal city known for music, nightlife, beaches, and architecture",
    bestFor: ["beach", "nightlife", "food"],
    budgetFit: "mid-range"
  },
  {
    city: "Djanet",
    why: "Gateway to the Sahara with breathtaking desert landscapes and ancient rock art",
    bestFor: ["adventure", "nature", "photography"],
    budgetFit: "luxury"
  },
  {
    city: "Tamanrasset",
    why: "Home of the Hoggar Mountains and unforgettable desert expeditions",
    bestFor: ["adventure", "hiking", "nature"],
    budgetFit: "mid-range"
  },
  {
    city: "Ghardaia",
    why: "UNESCO-listed desert city showcasing unique Mozabite architecture and traditions",
    bestFor: ["cultural", "history", "architecture"],
    budgetFit: "budget"
  },
  {
    city: "Tipaza",
    why: "Beautiful Mediterranean coastline with remarkable Roman ruins",
    bestFor: ["beach", "history", "relaxation"],
    budgetFit: "budget"
  }
],
  NZ: [
    { city: "Queenstown",       why: "Adventure capital of the world — bungee, skiing, skydiving", bestFor: ["adventure", "skiing", "party"], budgetFit: "mid-range" },
    { city: "Te Anau",          why: "Lakeside town — base for Fiordland and Milford Sound", bestFor: ["nature", "hiking", "photography"], budgetFit: "mid-range" },
    { city: "Rotorua",          why: "Māori culture meets volcanic geothermal landscape",   bestFor: ["cultural", "adventure", "nature"], budgetFit: "budget" },
  ],
}

// ─── City recommendation engine ───────────────────────────────────────────────

export function getCityRecommendations(
  countryCode: string,
  profile: PreferenceProfile,
  budget?: string,
  limit: number = 3
): CityRecommendation[] {
  const cities = CITY_PROFILES[countryCode]
  if (!cities) return []

  const userInterests = [
    profile.dominantMood,
    profile.preferredEnvironment,
    profile.activityLevel,
    ...profile.allTags,
  ].map((s) => s.toLowerCase())

  const budgetFitMap: Record<string, string[]> = {
    low:     ["budget", "all"],
    budget:  ["budget", "all"],
    medium:  ["budget", "mid-range", "all"],
    high:    ["mid-range", "luxury", "all"],
    luxury:  ["luxury", "all"],
    premium: ["luxury", "all"],
  }
  const allowedBudgets = budgetFitMap[budget ?? "medium"] ?? ["budget", "mid-range", "all"]

  const scored = cities
    .filter((c) => allowedBudgets.includes(c.budgetFit))
    .map((c) => {
      const matches = c.bestFor.filter((tag) =>
        userInterests.some((u) => u.includes(tag) || tag.includes(u))
      ).length
      return { city: c, score: matches }
    })
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map((s) => s.city)
}

// ─── Helper: score one preference dimension ───────────────────────────────────

function scoreAspect(userPrefs: string[], countryOptions: string[]): number {
  if (userPrefs.length === 0 || countryOptions.length === 0) return 70

  const valid = userPrefs.filter((p) => p?.length > 0)
  if (valid.length === 0) return 70

  let matches = 0
  for (const pref of valid) {
    for (const opt of countryOptions) {
      if (
        pref.toLowerCase().includes(opt.toLowerCase()) ||
        opt.toLowerCase().includes(pref.toLowerCase())
      ) {
        matches++
        break
      }
    }
  }

  const pct = (matches / valid.length) * 100
  return Math.min(95, Math.round(60 + pct * 0.35))
}

// ─── Context passed from the API route ───────────────────────────────────────

export interface MatchingContext {
  budget?:      string
  travelDates?: { start: string; end: string }
}

// ─── Core matching function ───────────────────────────────────────────────────

function matchDestinations(
  profile:  PreferenceProfile,
  context?: MatchingContext
): DestinationMatch[] {
  const matches: DestinationMatch[] = []

  for (const [code, cp] of Object.entries(COUNTRY_PROFILES)) {
    // ── Visual match (image preference analysis) ──
    const activityScore = scoreAspect(
      [profile.activityLevel, ...profile.allTags],
      cp.activities
    )
    const climateScore = scoreAspect(
      [profile.preferredClimate],
      [cp.climate]
    )
    const moodScore = scoreAspect(
      [profile.dominantMood],
      Object.keys(cp.activities_by_mood)
    )
    const foodScore = scoreAspect(profile.foodPreferences, cp.food_match)

    const visualMatch = Math.round(
      activityScore * V.ACTIVITY +
      climateScore  * V.CLIMATE  +
      moodScore     * V.MOOD     +
      foodScore     * V.FOOD
    )

    // ── Budget match ──────────────────────────────
    const budgetScore = scoreBudgetCompatibility(code, context?.budget)

    // ── Season match ──────────────────────────────
    const seasonScore = scoreSeasonCompatibility(code, context?.travelDates)

    // ── Final weighted score ──────────────────────
    const confidenceScore = Math.round(
      Math.max(55, Math.min(97,
        visualMatch  * W.VISUAL +
        budgetScore  * W.BUDGET +
        seasonScore  * W.SEASON
      ))
    )

    // ── Positives & negatives ─────────────────────
    const positives: string[] = []
    const negatives: string[] = []

    if (activityScore >= 70) positives.push(`Great ${profile.activityLevel}-activity options`)
    else negatives.push(`Limited ${profile.activityLevel} activity options`)

    if (climateScore >= 70) positives.push(`Ideal ${profile.preferredClimate} climate`)
    else negatives.push(`Climate differs from your preference`)

    if (foodScore >= 70) positives.push("Food scene matches your taste")
    else negatives.push("Limited matching food styles")

    if (budgetScore >= 80) positives.push(getDestinationBudgetLabel(code))
    else if (budgetScore < 55) negatives.push("Destination may exceed your budget")

    if (seasonScore >= 80) {
      const highlight = getSeasonHighlight(
        code,
        context?.travelDates
          ? new Date(context.travelDates.start).getMonth() + 1
          : new Date().getMonth() + 1
      )
      if (highlight) positives.push(highlight)
      else positives.push("Great time to visit")
    } else if (seasonScore < 45) {
      negatives.push("Off-peak season during your travel dates")
    }

    const moodActivities =
      cp.activities_by_mood[profile.dominantMood] ||
      cp.activities_by_mood["calm"] ||
      []

    // Season highlight for the travel month
    const travelMonth = context?.travelDates
      ? new Date(context.travelDates.start).getMonth() + 1
      : new Date().getMonth() + 1

    matches.push({
      countryCode:       code,
      countryName:       cp.name,
      confidenceScore,
      scoreBreakdown: {
        activityScore,
        climateScore,
        moodScore,
        foodScore,
        budgetScore,
        seasonScore,
      },
      positives: positives.slice(0, 4),
      negatives: negatives.slice(0, 2),
      climate:        cp.climate,
      activities:     moodActivities.slice(0, 5),
      foodHighlights: cp.food_styles.slice(0, 5),
      hotels:         cp.hotels,
      cities:         getCityRecommendations(code, profile, context?.budget, 3),
      budgetLabel:       getDestinationBudgetLabel(code),
      dailyCostEstimate: getDailyCostEstimate(code, context?.budget ?? "medium"),
      bestTimeToVisit:   getBestTimeToVisit(code),
      seasonHighlight:   getSeasonHighlight(code, travelMonth) ?? undefined,
    })
  }

  return matches.sort((a, b) => b.confidenceScore - a.confidenceScore)
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get the top N destination matches for a user profile.
 * Accepts optional context (budget, travel dates) to power the
 * budget and season scoring layers.
 */
export function getTopDestinations(
  profile:  PreferenceProfile,
  limit:    number = 3,
  context?: MatchingContext
): DestinationMatch[] {
  const all = matchDestinations(profile, context)
  // Keep top tier then allow variation; don't shuffle the very top result away
  return all.slice(0, Math.max(limit, 6)).slice(0, limit)
}
