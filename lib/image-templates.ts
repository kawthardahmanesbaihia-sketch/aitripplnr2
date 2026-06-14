export interface ImageTemplateTags {
  budget: "budget" | "mid-range" | "luxury"
  travelers: "solo" | "couple" | "friends" | "family"
  interests: string[]
  tripStyle: "relaxed" | "adventure" | "cultural" | "party" | "wellness" | "foodie"
  climate: "tropical" | "temperate" | "cold" | "desert" | "mediterranean"
  foodStyle: "street-food" | "local" | "fine-dining" | "seafood" | "vegan" | "diverse"
  environment: "beach" | "mountain" | "city" | "nature" | "countryside" | "desert"
  vibe: "luxurious" | "adventurous" | "romantic" | "social" | "peaceful" | "cultural"
}

export interface ImageTemplate {
  id: string
  query: string
  tags: ImageTemplateTags
}

export const IMAGE_TEMPLATES: ImageTemplate[] = [
  // LUXURY
  {
    id: "luxury_beach_resort",
    query: "luxury overwater bungalow resort infinity pool",
    tags: { budget: "luxury", travelers: "couple", interests: ["relaxation", "swimming"], tripStyle: "relaxed", climate: "tropical", foodStyle: "fine-dining", environment: "beach", vibe: "luxurious" },
  },
  {
    id: "luxury_city_hotel",
    query: "luxury penthouse suite city skyline rooftop",
    tags: { budget: "luxury", travelers: "couple", interests: ["city", "nightlife"], tripStyle: "cultural", climate: "temperate", foodStyle: "fine-dining", environment: "city", vibe: "luxurious" },
  },
  {
    id: "luxury_mountain_chalet",
    query: "luxury alpine chalet snow mountains hot tub",
    tags: { budget: "luxury", travelers: "couple", interests: ["skiing", "relaxation"], tripStyle: "relaxed", climate: "cold", foodStyle: "fine-dining", environment: "mountain", vibe: "romantic" },
  },
  {
    id: "luxury_safari_lodge",
    query: "luxury safari lodge Africa wildlife tent glamping",
    tags: { budget: "luxury", travelers: "couple", interests: ["wildlife", "nature"], tripStyle: "adventure", climate: "desert", foodStyle: "fine-dining", environment: "nature", vibe: "adventurous" },
  },
  {
    id: "luxury_villa_mediterranean",
    query: "luxury private villa infinity pool mediterranean sea view",
    tags: { budget: "luxury", travelers: "family", interests: ["relaxation", "swimming"], tripStyle: "relaxed", climate: "mediterranean", foodStyle: "fine-dining", environment: "beach", vibe: "luxurious" },
  },

  // BACKPACKING / BUDGET
  {
    id: "backpacking_hostel_social",
    query: "backpacker hostel common room travelers meeting friends",
    tags: { budget: "budget", travelers: "solo", interests: ["socializing", "meeting people"], tripStyle: "party", climate: "temperate", foodStyle: "street-food", environment: "city", vibe: "social" },
  },
  {
    id: "budget_street_food_market",
    query: "colorful street food market asia night market stalls",
    tags: { budget: "budget", travelers: "solo", interests: ["food", "culture"], tripStyle: "foodie", climate: "tropical", foodStyle: "street-food", environment: "city", vibe: "cultural" },
  },
  {
    id: "budget_camping_nature",
    query: "tent camping forest nature budget outdoor adventure",
    tags: { budget: "budget", travelers: "friends", interests: ["camping", "hiking"], tripStyle: "adventure", climate: "temperate", foodStyle: "local", environment: "nature", vibe: "adventurous" },
  },
  {
    id: "budget_travel_train",
    query: "scenic train journey countryside window seat travel",
    tags: { budget: "budget", travelers: "solo", interests: ["travel", "scenery"], tripStyle: "relaxed", climate: "temperate", foodStyle: "local", environment: "countryside", vibe: "peaceful" },
  },
  {
    id: "budget_beach_camping",
    query: "beach camping bonfire sunset ocean cheap travel",
    tags: { budget: "budget", travelers: "friends", interests: ["beach", "camping"], tripStyle: "adventure", climate: "tropical", foodStyle: "street-food", environment: "beach", vibe: "social" },
  },

  // SOLO TRAVEL
  {
    id: "solo_city_exploration",
    query: "solo traveler exploring city street photography urban",
    tags: { budget: "mid-range", travelers: "solo", interests: ["city", "photography"], tripStyle: "cultural", climate: "temperate", foodStyle: "local", environment: "city", vibe: "cultural" },
  },
  {
    id: "solo_meditation_retreat",
    query: "yoga meditation retreat mountain sunrise solo peaceful",
    tags: { budget: "mid-range", travelers: "solo", interests: ["wellness", "meditation"], tripStyle: "wellness", climate: "temperate", foodStyle: "vegan", environment: "mountain", vibe: "peaceful" },
  },
  {
    id: "solo_hiking_trail",
    query: "solo hiker trail backpack mountain wilderness",
    tags: { budget: "budget", travelers: "solo", interests: ["hiking", "nature"], tripStyle: "adventure", climate: "cold", foodStyle: "local", environment: "mountain", vibe: "adventurous" },
  },
  {
    id: "solo_beach_reading",
    query: "solo person beach hammock reading relaxing tropical",
    tags: { budget: "mid-range", travelers: "solo", interests: ["relaxation", "reading"], tripStyle: "relaxed", climate: "tropical", foodStyle: "seafood", environment: "beach", vibe: "peaceful" },
  },

  // COUPLE / ROMANTIC
  {
    id: "couple_paris_romantic",
    query: "couple romantic Paris Eiffel Tower sunset dinner",
    tags: { budget: "mid-range", travelers: "couple", interests: ["romance", "culture"], tripStyle: "cultural", climate: "temperate", foodStyle: "fine-dining", environment: "city", vibe: "romantic" },
  },
  {
    id: "couple_beach_sunset",
    query: "couple beach sunset walk tropical ocean romantic",
    tags: { budget: "mid-range", travelers: "couple", interests: ["beach", "romance"], tripStyle: "relaxed", climate: "tropical", foodStyle: "seafood", environment: "beach", vibe: "romantic" },
  },
  {
    id: "couple_wine_vineyard",
    query: "couple wine tasting vineyard countryside romantic",
    tags: { budget: "mid-range", travelers: "couple", interests: ["wine", "gastronomy"], tripStyle: "relaxed", climate: "mediterranean", foodStyle: "fine-dining", environment: "countryside", vibe: "romantic" },
  },
  {
    id: "couple_gondola_venice",
    query: "gondola canal Venice romantic couple Italy",
    tags: { budget: "mid-range", travelers: "couple", interests: ["culture", "romance"], tripStyle: "cultural", climate: "mediterranean", foodStyle: "fine-dining", environment: "city", vibe: "romantic" },
  },

  // FAMILY TRAVEL
  {
    id: "family_beach_kids",
    query: "family beach vacation kids playing sand ocean fun",
    tags: { budget: "mid-range", travelers: "family", interests: ["beach", "kids"], tripStyle: "relaxed", climate: "tropical", foodStyle: "diverse", environment: "beach", vibe: "social" },
  },
  {
    id: "family_theme_park",
    query: "family theme park rides fun children happy",
    tags: { budget: "mid-range", travelers: "family", interests: ["entertainment", "kids"], tripStyle: "party", climate: "temperate", foodStyle: "diverse", environment: "city", vibe: "social" },
  },
  {
    id: "family_mountain_cabin",
    query: "family mountain cabin vacation hiking forest kids",
    tags: { budget: "mid-range", travelers: "family", interests: ["nature", "hiking"], tripStyle: "adventure", climate: "cold", foodStyle: "local", environment: "mountain", vibe: "peaceful" },
  },
  {
    id: "family_cultural_tour",
    query: "family visiting historical monuments museum culture tour",
    tags: { budget: "mid-range", travelers: "family", interests: ["culture", "history"], tripStyle: "cultural", climate: "temperate", foodStyle: "local", environment: "city", vibe: "cultural" },
  },

  // FRIENDS / GROUP
  {
    id: "friends_road_trip",
    query: "friends road trip convertible car laughing highway",
    tags: { budget: "budget", travelers: "friends", interests: ["road-trip", "adventure"], tripStyle: "adventure", climate: "temperate", foodStyle: "local", environment: "countryside", vibe: "social" },
  },
  {
    id: "friends_rooftop_party",
    query: "friends rooftop party city night cocktails laughing",
    tags: { budget: "mid-range", travelers: "friends", interests: ["nightlife", "socializing"], tripStyle: "party", climate: "temperate", foodStyle: "diverse", environment: "city", vibe: "social" },
  },
  {
    id: "friends_group_hiking",
    query: "group of friends hiking mountains summit celebration",
    tags: { budget: "budget", travelers: "friends", interests: ["hiking", "fitness"], tripStyle: "adventure", climate: "cold", foodStyle: "local", environment: "mountain", vibe: "adventurous" },
  },
  {
    id: "friends_beach_volleyball",
    query: "friends beach volleyball game sunny tropical fun",
    tags: { budget: "budget", travelers: "friends", interests: ["sports", "beach"], tripStyle: "party", climate: "tropical", foodStyle: "seafood", environment: "beach", vibe: "social" },
  },
  {
    id: "friends_festival_crowd",
    query: "music festival crowd friends dancing colorful lights",
    tags: { budget: "mid-range", travelers: "friends", interests: ["music", "nightlife"], tripStyle: "party", climate: "temperate", foodStyle: "street-food", environment: "city", vibe: "social" },
  },

  // NIGHTLIFE / PARTY
  {
    id: "nightlife_club_ibiza",
    query: "nightclub Ibiza party DJ lights dancing crowd",
    tags: { budget: "mid-range", travelers: "friends", interests: ["nightlife", "music"], tripStyle: "party", climate: "mediterranean", foodStyle: "diverse", environment: "beach", vibe: "social" },
  },
  {
    id: "nightlife_cocktail_bar",
    query: "rooftop cocktail bar city skyline night lights",
    tags: { budget: "mid-range", travelers: "friends", interests: ["nightlife", "cocktails"], tripStyle: "party", climate: "temperate", foodStyle: "diverse", environment: "city", vibe: "social" },
  },
  {
    id: "nightlife_street_party",
    query: "carnival street party Brazil Rio festival dancing colorful",
    tags: { budget: "mid-range", travelers: "friends", interests: ["culture", "nightlife"], tripStyle: "party", climate: "tropical", foodStyle: "street-food", environment: "city", vibe: "social" },
  },

  // ADVENTURE
  {
    id: "adventure_bungee_jump",
    query: "bungee jump extreme sports adventure canyon",
    tags: { budget: "mid-range", travelers: "friends", interests: ["extreme-sports", "adrenaline"], tripStyle: "adventure", climate: "temperate", foodStyle: "local", environment: "mountain", vibe: "adventurous" },
  },
  {
    id: "adventure_scuba_diving",
    query: "scuba diving coral reef colorful fish underwater",
    tags: { budget: "mid-range", travelers: "friends", interests: ["diving", "ocean"], tripStyle: "adventure", climate: "tropical", foodStyle: "seafood", environment: "beach", vibe: "adventurous" },
  },
  {
    id: "adventure_kayaking",
    query: "kayaking sea caves turquoise water adventure paddling",
    tags: { budget: "budget", travelers: "solo", interests: ["kayaking", "nature"], tripStyle: "adventure", climate: "mediterranean", foodStyle: "local", environment: "beach", vibe: "adventurous" },
  },
  {
    id: "adventure_zip_line",
    query: "zip line canopy jungle rainforest adventure",
    tags: { budget: "budget", travelers: "friends", interests: ["adventure", "jungle"], tripStyle: "adventure", climate: "tropical", foodStyle: "local", environment: "nature", vibe: "adventurous" },
  },
  {
    id: "adventure_rock_climbing",
    query: "rock climbing cliff outdoor sport adventure",
    tags: { budget: "budget", travelers: "solo", interests: ["climbing", "fitness"], tripStyle: "adventure", climate: "temperate", foodStyle: "local", environment: "mountain", vibe: "adventurous" },
  },
  {
    id: "adventure_surfing",
    query: "surfing big waves ocean surf board",
    tags: { budget: "budget", travelers: "friends", interests: ["surfing", "ocean"], tripStyle: "adventure", climate: "tropical", foodStyle: "seafood", environment: "beach", vibe: "adventurous" },
  },
  {
    id: "adventure_paragliding",
    query: "paragliding mountain valley aerial view sport",
    tags: { budget: "mid-range", travelers: "friends", interests: ["paragliding", "adventure"], tripStyle: "adventure", climate: "temperate", foodStyle: "local", environment: "mountain", vibe: "adventurous" },
  },
  {
    id: "adventure_white_water_rafting",
    query: "white water rafting river rapids team sport",
    tags: { budget: "mid-range", travelers: "friends", interests: ["rafting", "adventure"], tripStyle: "adventure", climate: "temperate", foodStyle: "local", environment: "nature", vibe: "adventurous" },
  },
  {
    id: "adventure_hot_air_balloon",
    query: "hot air balloon colorful sky Cappadocia sunrise",
    tags: { budget: "mid-range", travelers: "couple", interests: ["ballooning", "scenery"], tripStyle: "adventure", climate: "temperate", foodStyle: "local", environment: "countryside", vibe: "romantic" },
  },
  {
    id: "adventure_mountain_biking",
    query: "mountain biking trail downhill dirt track forest",
    tags: { budget: "budget", travelers: "friends", interests: ["cycling", "adventure", "fitness"], tripStyle: "adventure", climate: "temperate", foodStyle: "local", environment: "nature", vibe: "adventurous" },
  },
  {
    id: "adventure_skydiving",
    query: "skydiving freefall parachute sky aerial sport",
    tags: { budget: "mid-range", travelers: "friends", interests: ["skydiving", "extreme-sports"], tripStyle: "adventure", climate: "temperate", foodStyle: "local", environment: "nature", vibe: "adventurous" },
  },
  {
    id: "adventure_canyoning",
    query: "canyoning waterfall gorge rope canyon sport",
    tags: { budget: "budget", travelers: "friends", interests: ["canyoning", "adventure", "nature"], tripStyle: "adventure", climate: "mediterranean", foodStyle: "local", environment: "nature", vibe: "adventurous" },
  },

  // HIKING / NATURE
  {
    id: "hiking_patagonia",
    query: "Patagonia trekking dramatic mountains glaciers landscapes",
    tags: { budget: "mid-range", travelers: "solo", interests: ["hiking", "nature"], tripStyle: "adventure", climate: "cold", foodStyle: "local", environment: "mountain", vibe: "adventurous" },
  },
  {
    id: "hiking_forest_trail",
    query: "ancient forest trail morning fog mystical hiking",
    tags: { budget: "budget", travelers: "solo", interests: ["hiking", "nature"], tripStyle: "relaxed", climate: "temperate", foodStyle: "local", environment: "nature", vibe: "peaceful" },
  },
  {
    id: "nature_waterfall",
    query: "tropical waterfall jungle lush green nature paradise",
    tags: { budget: "budget", travelers: "friends", interests: ["nature", "swimming"], tripStyle: "adventure", climate: "tropical", foodStyle: "local", environment: "nature", vibe: "adventurous" },
  },
  {
    id: "nature_northern_lights",
    query: "northern lights aurora borealis snow landscape night",
    tags: { budget: "mid-range", travelers: "couple", interests: ["nature", "photography"], tripStyle: "relaxed", climate: "cold", foodStyle: "local", environment: "nature", vibe: "romantic" },
  },
  {
    id: "nature_desert_dunes",
    query: "desert sand dunes sunset camel landscape",
    tags: { budget: "mid-range", travelers: "couple", interests: ["nature", "culture"], tripStyle: "adventure", climate: "desert", foodStyle: "local", environment: "desert", vibe: "adventurous" },
  },

  // BEACH
  {
    id: "beach_tropical_paradise",
    query: "tropical paradise beach crystal clear water white sand",
    tags: { budget: "mid-range", travelers: "couple", interests: ["beach", "relaxation"], tripStyle: "relaxed", climate: "tropical", foodStyle: "seafood", environment: "beach", vibe: "peaceful" },
  },
  {
    id: "beach_snorkeling",
    query: "snorkeling colorful tropical fish coral reef shallow water",
    tags: { budget: "mid-range", travelers: "family", interests: ["snorkeling", "ocean"], tripStyle: "adventure", climate: "tropical", foodStyle: "seafood", environment: "beach", vibe: "adventurous" },
  },
  {
    id: "beach_cliff_mediterranean",
    query: "dramatic cliff beach Mediterranean sea blue water",
    tags: { budget: "mid-range", travelers: "couple", interests: ["scenery", "relaxation"], tripStyle: "relaxed", climate: "mediterranean", foodStyle: "seafood", environment: "beach", vibe: "romantic" },
  },
  {
    id: "beach_seychelles",
    query: "Seychelles granite boulders turquoise lagoon tropical paradise",
    tags: { budget: "luxury", travelers: "couple", interests: ["beach", "relaxation", "diving"], tripStyle: "relaxed", climate: "tropical", foodStyle: "seafood", environment: "beach", vibe: "luxurious" },
  },
  {
    id: "beach_croatia_adriatic",
    query: "Croatia Adriatic clear water rocky beach village boats",
    tags: { budget: "mid-range", travelers: "friends", interests: ["beach", "sailing", "culture"], tripStyle: "relaxed", climate: "mediterranean", foodStyle: "seafood", environment: "beach", vibe: "social" },
  },
  {
    id: "beach_hawaii_surf",
    query: "Hawaii beach surfer waves palm trees volcanic",
    tags: { budget: "mid-range", travelers: "friends", interests: ["surfing", "beach", "nature"], tripStyle: "adventure", climate: "tropical", foodStyle: "diverse", environment: "beach", vibe: "adventurous" },
  },
  {
    id: "beach_tropical_hammock",
    query: "hammock between palm trees turquoise sea tropical",
    tags: { budget: "budget", travelers: "solo", interests: ["relaxation", "beach"], tripStyle: "relaxed", climate: "tropical", foodStyle: "local", environment: "beach", vibe: "peaceful" },
  },
  {
    id: "beach_sunset_silhouette",
    query: "beach sunset silhouette ocean waves golden hour",
    tags: { budget: "mid-range", travelers: "couple", interests: ["relaxation", "photography"], tripStyle: "relaxed", climate: "tropical", foodStyle: "seafood", environment: "beach", vibe: "romantic" },
  },

  // MOUNTAINS / SNOW
  {
    id: "skiing_resort",
    query: "ski resort powder snow slopes alpine mountains",
    tags: { budget: "mid-range", travelers: "friends", interests: ["skiing", "sports"], tripStyle: "adventure", climate: "cold", foodStyle: "local", environment: "mountain", vibe: "adventurous" },
  },
  {
    id: "snow_village",
    query: "cozy snow village christmas lights winter chalet",
    tags: { budget: "mid-range", travelers: "couple", interests: ["winter", "cozy"], tripStyle: "relaxed", climate: "cold", foodStyle: "local", environment: "mountain", vibe: "romantic" },
  },
  {
    id: "mountain_viewpoint",
    query: "mountain peak sunrise viewpoint spectacular landscape",
    tags: { budget: "budget", travelers: "solo", interests: ["hiking", "photography"], tripStyle: "adventure", climate: "cold", foodStyle: "local", environment: "mountain", vibe: "adventurous" },
  },

  // CULTURAL
  {
    id: "cultural_ancient_temples",
    query: "ancient temple ruins historical site morning light",
    tags: { budget: "budget", travelers: "solo", interests: ["history", "architecture"], tripStyle: "cultural", climate: "tropical", foodStyle: "local", environment: "city", vibe: "cultural" },
  },
  {
    id: "cultural_traditional_market",
    query: "traditional local market spices colors artisans bazaar",
    tags: { budget: "budget", travelers: "solo", interests: ["culture", "shopping"], tripStyle: "cultural", climate: "desert", foodStyle: "street-food", environment: "city", vibe: "cultural" },
  },
  {
    id: "cultural_japan_streets",
    query: "Japan traditional street lanterns cherry blossom culture",
    tags: { budget: "mid-range", travelers: "solo", interests: ["culture", "history"], tripStyle: "cultural", climate: "temperate", foodStyle: "local", environment: "city", vibe: "cultural" },
  },
  {
    id: "cultural_art_museum",
    query: "world class art museum gallery architecture modern",
    tags: { budget: "mid-range", travelers: "couple", interests: ["art", "culture"], tripStyle: "cultural", climate: "temperate", foodStyle: "fine-dining", environment: "city", vibe: "cultural" },
  },
  {
    id: "cultural_flamenco_dance",
    query: "flamenco dancer Spain traditional cultural show",
    tags: { budget: "mid-range", travelers: "couple", interests: ["culture", "arts"], tripStyle: "cultural", climate: "mediterranean", foodStyle: "fine-dining", environment: "city", vibe: "cultural" },
  },
  {
    id: "cultural_colosseum_rome",
    query: "Colosseum Rome ancient ruins historical landmark Italy",
    tags: { budget: "mid-range", travelers: "couple", interests: ["history", "architecture", "ruins"], tripStyle: "cultural", climate: "mediterranean", foodStyle: "local", environment: "city", vibe: "cultural" },
  },
  {
    id: "cultural_kyoto_tea_ceremony",
    query: "Japanese tea ceremony Kyoto geisha kimono traditional",
    tags: { budget: "mid-range", travelers: "solo", interests: ["culture", "tradition", "zen"], tripStyle: "cultural", climate: "temperate", foodStyle: "local", environment: "city", vibe: "peaceful" },
  },
  {
    id: "cultural_istanbul_mosque",
    query: "Blue Mosque Istanbul Turkey architecture Ottoman evening",
    tags: { budget: "budget", travelers: "couple", interests: ["history", "architecture", "culture"], tripStyle: "cultural", climate: "temperate", foodStyle: "local", environment: "city", vibe: "cultural" },
  },
  {
    id: "cultural_india_holi_festival",
    query: "India Holi festival color powder celebration people",
    tags: { budget: "budget", travelers: "friends", interests: ["culture", "festivals"], tripStyle: "cultural", climate: "tropical", foodStyle: "street-food", environment: "city", vibe: "social" },
  },
  {
    id: "cultural_chinese_new_year",
    query: "Chinese New Year lanterns red festival celebration street",
    tags: { budget: "budget", travelers: "family", interests: ["culture", "festivals", "history"], tripStyle: "cultural", climate: "temperate", foodStyle: "local", environment: "city", vibe: "social" },
  },
  {
    id: "cultural_medieval_castle",
    query: "medieval castle fortress stone architecture European history",
    tags: { budget: "mid-range", travelers: "family", interests: ["history", "architecture"], tripStyle: "cultural", climate: "temperate", foodStyle: "local", environment: "countryside", vibe: "cultural" },
  },
  {
    id: "cultural_street_murals",
    query: "street art murals urban culture colorful neighborhood",
    tags: { budget: "budget", travelers: "solo", interests: ["art", "culture", "city"], tripStyle: "cultural", climate: "temperate", foodStyle: "street-food", environment: "city", vibe: "adventurous" },
  },

  // FOOD & GASTRONOMY
  {
    id: "food_fine_dining",
    query: "fine dining restaurant gourmet dish elegant plate",
    tags: { budget: "luxury", travelers: "couple", interests: ["gastronomy", "food"], tripStyle: "foodie", climate: "temperate", foodStyle: "fine-dining", environment: "city", vibe: "luxurious" },
  },
  {
    id: "food_cooking_class",
    query: "cooking class local cuisine chef market fresh ingredients",
    tags: { budget: "mid-range", travelers: "couple", interests: ["food", "culture"], tripStyle: "foodie", climate: "tropical", foodStyle: "local", environment: "city", vibe: "cultural" },
  },
  {
    id: "food_street_asia",
    query: "asian street food ramen noodles night market stall",
    tags: { budget: "budget", travelers: "solo", interests: ["food", "culture"], tripStyle: "foodie", climate: "tropical", foodStyle: "street-food", environment: "city", vibe: "cultural" },
  },
  {
    id: "food_seafood_market",
    query: "fresh seafood fish market coastal harbor restaurant",
    tags: { budget: "mid-range", travelers: "family", interests: ["seafood", "food"], tripStyle: "foodie", climate: "mediterranean", foodStyle: "seafood", environment: "beach", vibe: "cultural" },
  },
  {
    id: "food_vineyard_dinner",
    query: "vineyard outdoor dinner sunset wine grapes Tuscany",
    tags: { budget: "luxury", travelers: "couple", interests: ["wine", "gastronomy"], tripStyle: "foodie", climate: "mediterranean", foodStyle: "fine-dining", environment: "countryside", vibe: "romantic" },
  },
  {
    id: "food_sushi_omakase",
    query: "sushi omakase chef japanese restaurant counter bar",
    tags: { budget: "luxury", travelers: "couple", interests: ["food", "japanese cuisine"], tripStyle: "foodie", climate: "temperate", foodStyle: "fine-dining", environment: "city", vibe: "cultural" },
  },
  {
    id: "food_pasta_making",
    query: "handmade pasta Italian kitchen traditional cooking flour",
    tags: { budget: "mid-range", travelers: "couple", interests: ["food", "culture", "cooking"], tripStyle: "foodie", climate: "mediterranean", foodStyle: "local", environment: "countryside", vibe: "cultural" },
  },
  {
    id: "food_indian_spice_market",
    query: "colorful Indian spice market turmeric curry powder vibrant",
    tags: { budget: "budget", travelers: "solo", interests: ["food", "culture", "markets"], tripStyle: "foodie", climate: "tropical", foodStyle: "local", environment: "city", vibe: "cultural" },
  },
  {
    id: "food_moroccan_tagine",
    query: "Moroccan tagine traditional clay pot restaurant terrace",
    tags: { budget: "budget", travelers: "couple", interests: ["food", "culture"], tripStyle: "foodie", climate: "desert", foodStyle: "local", environment: "city", vibe: "cultural" },
  },
  {
    id: "food_french_patisserie",
    query: "French patisserie croissant pastry bakery display Paris",
    tags: { budget: "mid-range", travelers: "couple", interests: ["food", "culture"], tripStyle: "foodie", climate: "temperate", foodStyle: "fine-dining", environment: "city", vibe: "romantic" },
  },
  {
    id: "food_tasting_menu",
    query: "chef tasting menu elegant plating courses gourmet",
    tags: { budget: "luxury", travelers: "couple", interests: ["gastronomy", "luxury dining"], tripStyle: "foodie", climate: "temperate", foodStyle: "fine-dining", environment: "city", vibe: "luxurious" },
  },
  {
    id: "food_mexican_street_tacos",
    query: "authentic Mexican street tacos taqueria market corn tortilla",
    tags: { budget: "budget", travelers: "friends", interests: ["food", "street food", "culture"], tripStyle: "foodie", climate: "tropical", foodStyle: "street-food", environment: "city", vibe: "social" },
  },
  {
    id: "food_dim_sum",
    query: "dim sum traditional Chinese restaurant bamboo steamer dumplings",
    tags: { budget: "budget", travelers: "family", interests: ["food", "culture"], tripStyle: "foodie", climate: "tropical", foodStyle: "local", environment: "city", vibe: "cultural" },
  },
  {
    id: "food_greek_mezze",
    query: "Greek mezze spread taverna seaside seafood olives",
    tags: { budget: "mid-range", travelers: "family", interests: ["food", "culture", "seafood"], tripStyle: "foodie", climate: "mediterranean", foodStyle: "seafood", environment: "beach", vibe: "social" },
  },
  {
    id: "food_pizza_naples",
    query: "authentic Neapolitan pizza wood fired oven Italy",
    tags: { budget: "budget", travelers: "friends", interests: ["food", "culture"], tripStyle: "foodie", climate: "mediterranean", foodStyle: "local", environment: "city", vibe: "social" },
  },
  {
    id: "food_bbq_grill",
    query: "outdoor barbecue grill smoke meat evening gathering",
    tags: { budget: "mid-range", travelers: "friends", interests: ["food", "socializing"], tripStyle: "foodie", climate: "temperate", foodStyle: "local", environment: "countryside", vibe: "social" },
  },
  {
    id: "food_farmers_market",
    query: "farmers market fresh produce vegetables colorful stalls morning",
    tags: { budget: "budget", travelers: "solo", interests: ["food", "local culture"], tripStyle: "foodie", climate: "temperate", foodStyle: "local", environment: "city", vibe: "peaceful" },
  },

  // WELLNESS / SPA
  {
    id: "wellness_spa_resort",
    query: "luxury spa resort wellness pool zen relaxation",
    tags: { budget: "luxury", travelers: "couple", interests: ["spa", "wellness"], tripStyle: "wellness", climate: "tropical", foodStyle: "vegan", environment: "nature", vibe: "peaceful" },
  },
  {
    id: "wellness_yoga_sunrise",
    query: "yoga sunrise ocean cliff meditation spiritual retreat",
    tags: { budget: "mid-range", travelers: "solo", interests: ["yoga", "meditation"], tripStyle: "wellness", climate: "tropical", foodStyle: "vegan", environment: "beach", vibe: "peaceful" },
  },
  {
    id: "wellness_hot_spring",
    query: "natural hot spring mineral pool mountain snow Japan",
    tags: { budget: "mid-range", travelers: "couple", interests: ["wellness", "nature"], tripStyle: "wellness", climate: "cold", foodStyle: "local", environment: "nature", vibe: "peaceful" },
  },
  {
    id: "wellness_forest_bathing",
    query: "forest bathing nature walk tall trees peaceful zen",
    tags: { budget: "budget", travelers: "solo", interests: ["nature", "wellness"], tripStyle: "wellness", climate: "temperate", foodStyle: "vegan", environment: "nature", vibe: "peaceful" },
  },

  // CITY TRIPS
  {
    id: "city_new_york",
    query: "New York City skyline Manhattan skyscrapers energy",
    tags: { budget: "mid-range", travelers: "friends", interests: ["city", "entertainment"], tripStyle: "cultural", climate: "temperate", foodStyle: "diverse", environment: "city", vibe: "social" },
  },
  {
    id: "city_tokyo_neon",
    query: "Tokyo neon lights Shibuya crossing night energy",
    tags: { budget: "mid-range", travelers: "solo", interests: ["city", "culture"], tripStyle: "cultural", climate: "temperate", foodStyle: "local", environment: "city", vibe: "cultural" },
  },
  {
    id: "city_european_cafe",
    query: "European sidewalk cafe cobblestone street morning coffee",
    tags: { budget: "mid-range", travelers: "couple", interests: ["culture", "relaxation"], tripStyle: "relaxed", climate: "temperate", foodStyle: "fine-dining", environment: "city", vibe: "romantic" },
  },
  {
    id: "city_singapore_gardens",
    query: "Singapore futuristic gardens by the bay architecture",
    tags: { budget: "mid-range", travelers: "family", interests: ["architecture", "city"], tripStyle: "cultural", climate: "tropical", foodStyle: "diverse", environment: "city", vibe: "cultural" },
  },

  // RESORTS
  {
    id: "resort_all_inclusive",
    query: "all inclusive tropical resort pool swim-up bar",
    tags: { budget: "mid-range", travelers: "family", interests: ["relaxation", "swimming"], tripStyle: "relaxed", climate: "tropical", foodStyle: "diverse", environment: "beach", vibe: "social" },
  },
  {
    id: "resort_maldives",
    query: "Maldives water villa coral reef turquoise lagoon",
    tags: { budget: "luxury", travelers: "couple", interests: ["diving", "relaxation"], tripStyle: "relaxed", climate: "tropical", foodStyle: "fine-dining", environment: "beach", vibe: "luxurious" },
  },
  {
    id: "resort_eco_lodge",
    query: "eco lodge rainforest sustainable nature retreat treehouse",
    tags: { budget: "mid-range", travelers: "couple", interests: ["nature", "sustainability"], tripStyle: "relaxed", climate: "tropical", foodStyle: "vegan", environment: "nature", vibe: "peaceful" },
  },
]

export type TemplateId = typeof IMAGE_TEMPLATES[number]["id"]

export function getTemplateById(id: string): ImageTemplate | undefined {
  return IMAGE_TEMPLATES.find((t) => t.id === id)
}

export function getTemplatesByBudget(budget: ImageTemplateTags["budget"]): ImageTemplate[] {
  return IMAGE_TEMPLATES.filter((t) => t.tags.budget === budget)
}

export function getTemplatesByTravelers(travelers: ImageTemplateTags["travelers"]): ImageTemplate[] {
  return IMAGE_TEMPLATES.filter((t) => t.tags.travelers === travelers)
}

export function getTemplatesByVibe(vibe: ImageTemplateTags["vibe"]): ImageTemplate[] {
  return IMAGE_TEMPLATES.filter((t) => t.tags.vibe === vibe)
}

export function getDiversifiedBatch(count: number = 12): ImageTemplate[] {
  const vibes: ImageTemplateTags["vibe"][] = ["luxurious", "adventurous", "romantic", "social", "peaceful", "cultural"]
  const budgets: ImageTemplateTags["budget"][] = ["budget", "mid-range", "luxury"]
  const environments: ImageTemplateTags["environment"][] = ["beach", "mountain", "city", "nature", "countryside", "desert"]

  const selected = new Set<string>()
  const result: ImageTemplate[] = []

  // One per vibe first
  for (const vibe of vibes) {
    const byVibe = IMAGE_TEMPLATES.filter((t) => t.tags.vibe === vibe && !selected.has(t.id))
    if (byVibe.length > 0) {
      const pick = byVibe[Math.floor(Math.random() * byVibe.length)]
      selected.add(pick.id)
      result.push(pick)
    }
  }

  // Fill remaining slots with environment diversity
  for (const env of environments) {
    if (result.length >= count) break
    const byEnv = IMAGE_TEMPLATES.filter((t) => t.tags.environment === env && !selected.has(t.id))
    if (byEnv.length > 0) {
      const pick = byEnv[Math.floor(Math.random() * byEnv.length)]
      selected.add(pick.id)
      result.push(pick)
    }
  }

  // Fill remaining with budget diversity
  while (result.length < count) {
    const remaining = IMAGE_TEMPLATES.filter((t) => !selected.has(t.id))
    if (remaining.length === 0) break
    const pick = remaining[Math.floor(Math.random() * remaining.length)]
    selected.add(pick.id)
    result.push(pick)
  }

  return result.slice(0, count)
}
