/**
 * Smart Fallback Layer
 *
 * Provides nearby-city, same-country, and global-static fallbacks for
 * destination data sections that return empty from primary API calls.
 *
 * Used exclusively by app/api/destination/route.ts.
 * Does NOT modify any CLIP/recommendation/matching logic.
 */

// ── Nearby city map ────────────────────────────────────────────────────────────
// Maps each tourist city to its single nearest major city for API retry.
export const NEARBY_CITY: Record<string, string> = {
  // Japan
  Tokyo:            "Osaka",
  Kyoto:            "Osaka",
  Osaka:            "Kyoto",
  Nara:             "Osaka",
  Yokohama:         "Tokyo",
  Hiroshima:        "Osaka",
  Fukuoka:          "Osaka",
  Sapporo:          "Tokyo",
  // Europe — France
  Paris:            "Lyon",
  Nice:             "Marseille",
  Bordeaux:         "Paris",
  Lyon:             "Paris",
  Marseille:        "Nice",
  Strasbourg:       "Paris",
  // Europe — Italy
  Rome:             "Florence",
  Florence:         "Rome",
  Milan:            "Turin",
  Venice:           "Verona",
  Naples:           "Rome",
  Palermo:          "Naples",
  Verona:           "Venice",
  Amalfi:           "Naples",
  Positano:         "Naples",
  Cinque:           "Genoa",
  // Europe — Spain
  Barcelona:        "Valencia",
  Madrid:           "Seville",
  Seville:          "Malaga",
  Malaga:           "Seville",
  Valencia:         "Barcelona",
  Bilbao:           "San Sebastian",
  Granada:          "Malaga",
  // Europe — Benelux
  Amsterdam:        "Rotterdam",
  Brussels:         "Bruges",
  Bruges:           "Brussels",
  Rotterdam:        "Amsterdam",
  Antwerp:          "Brussels",
  // Europe — Central
  Prague:           "Vienna",
  Vienna:           "Prague",
  Budapest:         "Vienna",
  Warsaw:           "Krakow",
  Krakow:           "Warsaw",
  // Europe — Iberia
  Lisbon:           "Porto",
  Porto:            "Lisbon",
  Sintra:           "Lisbon",
  Algarve:          "Lisbon",
  // Europe — Greece
  Santorini:        "Athens",
  Mykonos:          "Athens",
  Athens:           "Thessaloniki",
  Thessaloniki:     "Athens",
  Crete:            "Athens",
  Rhodes:           "Athens",
  Corfu:            "Athens",
  // Europe — Turkey
  Istanbul:         "Ankara",
  Ankara:           "Istanbul",
  Cappadocia:       "Ankara",
  Bodrum:           "Izmir",
  Izmir:            "Istanbul",
  // Europe — Other
  Edinburgh:        "Glasgow",
  Glasgow:          "Edinburgh",
  London:           "Edinburgh",
  Dublin:           "Belfast",
  Copenhagen:       "Stockholm",
  Stockholm:        "Copenhagen",
  Oslo:             "Stockholm",
  Helsinki:         "Stockholm",
  Reykjavik:        "Oslo",
  Zurich:           "Geneva",
  Geneva:           "Zurich",
  Dubrovnik:        "Split",
  Split:            "Dubrovnik",
  // Africa & Middle East
  Marrakech:        "Casablanca",
  Casablanca:       "Marrakech",
  Fez:              "Marrakech",
  Cairo:            "Alexandria",
  Petra:            "Amman",
  Amman:            "Petra",
  Dubai:            "Abu Dhabi",
  "Abu Dhabi":      "Dubai",
  Muscat:           "Dubai",
  "Cape Town":      "Johannesburg",
  Johannesburg:     "Cape Town",
  Zanzibar:         "Nairobi",
  Nairobi:          "Mombasa",
  Mombasa:          "Nairobi",
  // Southeast Asia
  Bangkok:          "Chiang Mai",
  "Chiang Mai":     "Bangkok",
  Phuket:           "Krabi",
  Krabi:            "Phuket",
  "Koh Samui":      "Phuket",
  "Koh Phi Phi":    "Phuket",
  Bali:             "Yogyakarta",
  Yogyakarta:       "Bali",
  Jakarta:          "Bali",
  Lombok:           "Bali",
  Singapore:        "Kuala Lumpur",
  "Kuala Lumpur":   "Penang",
  Penang:           "Kuala Lumpur",
  "Langkawi":       "Penang",
  "Ho Chi Minh City": "Hanoi",
  Hanoi:            "Ho Chi Minh City",
  "Hoi An":         "Danang",
  Danang:           "Hanoi",
  "Siem Reap":      "Phnom Penh",
  "Phnom Penh":     "Siem Reap",
  Colombo:          "Galle",
  Galle:            "Colombo",
  // South & East Asia
  Mumbai:           "Delhi",
  Delhi:            "Mumbai",
  Goa:              "Mumbai",
  Jaipur:           "Delhi",
  Agra:             "Delhi",
  Kathmandu:        "Delhi",
  Seoul:            "Busan",
  Busan:            "Seoul",
  Taipei:           "Taichung",
  // Americas
  "New York":       "Boston",
  Boston:           "New York",
  "Los Angeles":    "San Francisco",
  "San Francisco":  "Los Angeles",
  Miami:            "Orlando",
  Orlando:          "Miami",
  "Las Vegas":      "Los Angeles",
  Chicago:          "Detroit",
  Cancun:           "Mexico City",
  "Mexico City":    "Guadalajara",
  Guadalajara:      "Mexico City",
  "Rio de Janeiro": "São Paulo",
  "São Paulo":      "Rio de Janeiro",
  "Buenos Aires":   "Mendoza",
  Mendoza:          "Buenos Aires",
  Cartagena:        "Bogotá",
  Bogotá:           "Medellín",
  Medellín:         "Bogotá",
  Lima:             "Cusco",
  Cusco:            "Lima",
  "Machu Picchu":   "Cusco",
  Santiago:         "Valparaíso",
  // Oceania
  Sydney:           "Melbourne",
  Melbourne:        "Sydney",
  Brisbane:         "Sydney",
  Auckland:         "Queenstown",
  Queenstown:       "Auckland",
}

// ── Country → main tourist city ────────────────────────────────────────────────
// Used when the target city has no NEARBY_CITY entry.
export const COUNTRY_MAIN_CITY: Record<string, string> = {
  Japan:                "Tokyo",
  France:               "Paris",
  Italy:                "Rome",
  Spain:                "Barcelona",
  Germany:              "Berlin",
  Netherlands:          "Amsterdam",
  Belgium:              "Brussels",
  Portugal:             "Lisbon",
  Greece:               "Athens",
  "Czech Republic":     "Prague",
  Austria:              "Vienna",
  Hungary:              "Budapest",
  Turkey:               "Istanbul",
  Croatia:              "Dubrovnik",
  Poland:               "Krakow",
  Switzerland:          "Zurich",
  Sweden:               "Stockholm",
  Norway:               "Oslo",
  Denmark:              "Copenhagen",
  Finland:              "Helsinki",
  Ireland:              "Dublin",
  Scotland:             "Edinburgh",
  "United Kingdom":     "London",
  Iceland:              "Reykjavik",
  Morocco:              "Marrakech",
  Egypt:                "Cairo",
  "South Africa":       "Cape Town",
  Kenya:                "Nairobi",
  Tanzania:             "Zanzibar",
  Ethiopia:             "Addis Ababa",
  Thailand:             "Bangkok",
  Indonesia:            "Bali",
  Singapore:            "Singapore",
  Malaysia:             "Kuala Lumpur",
  Vietnam:              "Hanoi",
  Cambodia:             "Siem Reap",
  "Sri Lanka":          "Colombo",
  India:                "Mumbai",
  Nepal:                "Kathmandu",
  UAE:                  "Dubai",
  Jordan:               "Amman",
  Israel:               "Tel Aviv",
  "Saudi Arabia":       "Riyadh",
  Australia:            "Sydney",
  "New Zealand":        "Queenstown",
  "United States":      "New York",
  Canada:               "Toronto",
  Mexico:               "Mexico City",
  Brazil:               "Rio de Janeiro",
  Argentina:            "Buenos Aires",
  Peru:                 "Lima",
  Colombia:             "Cartagena",
  Chile:                "Santiago",
  "South Korea":        "Seoul",
  China:                "Beijing",
  Taiwan:               "Taipei",
  Philippines:          "Palawan",
  Maldives:             "Malé",
  Seychelles:           "Victoria",
}

// ── Country festivals ──────────────────────────────────────────────────────────
interface FestivalTemplate {
  name:        string
  description: string
  months:      number[]  // 1–12
  category:    string
}

const COUNTRY_FESTIVALS: Record<string, FestivalTemplate[]> = {
  Japan: [
    { name: "Cherry Blossom Season (Hanami)", description: "Japan's iconic spring festival where cherry trees burst into bloom across parks and gardens nationwide.", months: [3, 4], category: "Nature & Culture" },
    { name: "Gion Matsuri Festival", description: "One of Japan's most celebrated festivals featuring elaborate floats and traditional music in Kyoto.", months: [7], category: "Cultural Festival" },
    { name: "Golden Week", description: "Japan's major national holiday period with events, travel and cultural activities across the country.", months: [4, 5], category: "National Holiday" },
    { name: "Obon Festival", description: "Traditional Buddhist event honouring ancestors with lantern lighting, folk dances and family reunions.", months: [8], category: "Cultural Festival" },
    { name: "Autumn Foliage Season (Koyo)", description: "Japan's spectacular autumn leaves painting landscapes in brilliant reds and golds across temples and mountains.", months: [10, 11], category: "Nature" },
    { name: "Shogatsu (Japanese New Year)", description: "Japan's most important holiday with shrine visits, traditional food and nationwide festive celebrations.", months: [1, 12], category: "National Holiday" },
  ],
  France: [
    { name: "Bastille Day", description: "France's national day with fireworks over the Eiffel Tower and military parades on the Champs-Élysées.", months: [7], category: "National Holiday" },
    { name: "Cannes Film Festival", description: "The world's most prestigious film festival held on the glamorous French Riviera.", months: [5], category: "Film & Arts" },
    { name: "Nice Carnival", description: "One of Europe's largest carnivals with elaborate floats, costumed performers and festive atmosphere.", months: [2, 3], category: "Cultural Festival" },
    { name: "Tour de France", description: "The legendary annual cycling race winding through France's iconic cities and countryside.", months: [7], category: "Sports" },
    { name: "Paris Fashion Week", description: "The world's premier fashion event showcasing top designers' collections in the French capital.", months: [1, 3, 9, 10], category: "Fashion & Arts" },
  ],
  Italy: [
    { name: "Venice Carnival (Carnevale)", description: "Europe's most glamorous masked carnival with elaborate costumes and centuries-old tradition in the floating city.", months: [2, 3], category: "Cultural Festival" },
    { name: "Palio di Siena", description: "Medieval horse race held twice yearly around Siena's magnificent Piazza del Campo.", months: [7, 8], category: "Historical Event" },
    { name: "Verona Opera Festival", description: "World-class outdoor opera performances in Verona's magnificent ancient Roman amphitheatre.", months: [6, 7, 8, 9], category: "Music & Arts" },
    { name: "Florence Floralia Festival", description: "Spring festival celebrating Renaissance art, culture and Florentine history throughout the city.", months: [4, 5], category: "Cultural Festival" },
  ],
  Spain: [
    { name: "La Tomatina", description: "The world's biggest tomato fight held in Buñol, Valencia — one of Europe's most exhilarating festivals.", months: [8], category: "Cultural Festival" },
    { name: "San Fermín — Running of the Bulls", description: "Pamplona's iconic nine-day festival famous worldwide for its daring bull runs through the old city streets.", months: [7], category: "Cultural Festival" },
    { name: "Las Fallas Valencia", description: "Spectacular fire festival filling Valencia's streets with giant artistic sculptures before the midnight burning.", months: [3], category: "Cultural Festival" },
    { name: "Feria de Abril Seville", description: "Andalusia's most joyful festival with flamenco, elaborate costumes, horse carriages and festive casetas.", months: [4], category: "Cultural Festival" },
    { name: "La Mercè Barcelona", description: "Barcelona's largest festival celebrating the city's patron saint with concerts, fire runs and activities.", months: [9], category: "Cultural Festival" },
  ],
  Morocco: [
    { name: "Fes Festival of World Sacred Music", description: "Internationally acclaimed music festival bringing artists from across the globe to the ancient city of Fes.", months: [6], category: "Music & Arts" },
    { name: "Rose Festival (Festival des Roses)", description: "Vibrant celebration of the rose harvest in the Dadès Valley with music, dancing and rose markets.", months: [4, 5], category: "Cultural Festival" },
    { name: "Marrakech International Film Festival", description: "Prestigious film festival attracting international stars and filmmakers to the Red City.", months: [11, 12], category: "Film & Arts" },
    { name: "Ramadan & Eid al-Fitr", description: "Major Islamic celebration marking the end of Ramadan with prayers, feasting and family gatherings across Morocco.", months: [3, 4], category: "Religious Festival" },
  ],
  Thailand: [
    { name: "Songkran (Thai New Year Water Festival)", description: "Thailand's exuberant water festival marking the Buddhist New Year with nationwide water fights and temple ceremonies.", months: [4], category: "National Festival" },
    { name: "Loy Krathong — Festival of Lights", description: "The magical festival where thousands of candle-lit floats and sky lanterns illuminate Thailand's rivers and skies.", months: [11], category: "Cultural Festival" },
    { name: "Yi Peng Lantern Festival", description: "Chiang Mai's breathtaking festival releasing thousands of glowing lanterns into the night sky.", months: [11], category: "Cultural Festival" },
    { name: "Vegetarian Festival Phuket", description: "Nine-day festival with colourful street processions, firewalking and elaborate rituals on Phuket island.", months: [10], category: "Religious Festival" },
  ],
  Indonesia: [
    { name: "Nyepi — Bali Day of Silence", description: "Bali's unique New Year where the entire island observes complete silence and stillness for 24 hours.", months: [3], category: "Cultural Festival" },
    { name: "Bali Arts Festival", description: "Month-long celebration of Balinese arts, dance, music and crafts at the Bali Arts Centre in Denpasar.", months: [6, 7], category: "Arts & Culture" },
    { name: "Galungan Festival", description: "Bali's most important religious festival celebrating the victory of dharma, with decorated bamboo poles lining every street.", months: [2, 8], category: "Religious Festival" },
    { name: "Baliem Valley Festival", description: "Spectacular tribal war re-enactment and cultural festival in Papua's remote Baliem Valley.", months: [8], category: "Cultural Festival" },
  ],
  Greece: [
    { name: "Athens & Epidaurus Festival", description: "Prestigious summer arts festival with performances in ancient theatres under the stars.", months: [6, 7, 8], category: "Arts & Culture" },
    { name: "Greek Easter (Pascha)", description: "Greece's most important religious festival with candlelit midnight processions, fireworks and lamb feasts.", months: [4, 5], category: "Religious Festival" },
    { name: "Apokries (Greek Carnival)", description: "Three-week carnival season leading up to Lent with colourful parades and masquerade parties.", months: [2, 3], category: "Cultural Festival" },
    { name: "Thessaloniki International Film Festival", description: "One of Southern Europe's most significant film festivals screening international cinema.", months: [11], category: "Film & Arts" },
  ],
  Turkey: [
    { name: "Istanbul Music Festival", description: "International classical music performances in Istanbul's historic venues including palaces and ancient churches.", months: [6], category: "Music & Arts" },
    { name: "International Istanbul Film Festival", description: "One of the most significant film festivals in the world screening films from across the globe.", months: [4], category: "Film & Arts" },
    { name: "Camel Wrestling Festival", description: "Turkey's unique traditional sport gathering in Selçuk with colourfully decorated camels competing.", months: [1], category: "Traditional Sports" },
    { name: "Whirling Dervishes Festival Konya", description: "Sacred ceremonies and performances celebrating Rumi and Sufi culture in the heart of Anatolia.", months: [12], category: "Religious & Cultural" },
  ],
  UAE: [
    { name: "Dubai Shopping Festival", description: "The world's largest shopping event with massive discounts, entertainment and fireworks across Dubai.", months: [12, 1, 2], category: "Shopping & Entertainment" },
    { name: "Abu Dhabi Grand Prix", description: "Formula 1's stunning season finale at the Yas Marina Circuit on Yas Island.", months: [11], category: "Sports" },
    { name: "Dubai Food Festival", description: "Celebration of Dubai's diverse culinary scene with pop-up restaurants, competitions and street food.", months: [2, 3], category: "Food & Culture" },
    { name: "Art Dubai", description: "The Middle East's leading international art fair held at Madinat Jumeirah.", months: [3], category: "Arts & Culture" },
  ],
  India: [
    { name: "Holi — Festival of Colours", description: "India's spectacular festival of colours where people throw vibrant powders celebrating spring and new beginnings.", months: [3], category: "Cultural Festival" },
    { name: "Diwali — Festival of Lights", description: "The festival of lights illuminating India with oil lamps, fireworks, sweets and family celebrations.", months: [10, 11], category: "Cultural Festival" },
    { name: "Jaipur Literature Festival", description: "The world's largest free literary festival bringing writers and thinkers to the Pink City.", months: [1], category: "Literature & Arts" },
    { name: "Pushkar Camel Fair", description: "One of the world's largest camel fairs with cultural competitions, music and vast desert trading.", months: [11], category: "Cultural Festival" },
    { name: "Durga Puja", description: "Bengal's grand ten-day festival honouring goddess Durga with spectacular pandals and processions.", months: [10], category: "Religious Festival" },
  ],
  "United Kingdom": [
    { name: "Glastonbury Festival", description: "The world's most famous music and performing arts festival held on a Somerset farm.", months: [6], category: "Music Festival" },
    { name: "Edinburgh Festival Fringe", description: "The world's largest arts festival transforming Edinburgh into a global stage for theatre, comedy and performance.", months: [8], category: "Arts Festival" },
    { name: "Notting Hill Carnival", description: "Europe's largest street festival celebrating Caribbean culture with music, costumes and cuisine in London.", months: [8], category: "Cultural Festival" },
    { name: "Chelsea Flower Show", description: "The world's most famous horticultural event in London's Royal Hospital grounds.", months: [5], category: "Nature & Garden" },
    { name: "Bonfire Night", description: "Britain's beloved Guy Fawkes Night with spectacular fireworks displays across the country.", months: [11], category: "National Celebration" },
  ],
  Portugal: [
    { name: "Festas de Lisboa — Santo António", description: "Lisbon's biggest festival celebrating the city's patron saint with street parties, grilled sardines and dancing.", months: [6], category: "Cultural Festival" },
    { name: "NOS Alive Music Festival", description: "One of Europe's premier outdoor music festivals on the outskirts of Lisbon.", months: [7], category: "Music Festival" },
    { name: "Carnival of Torres Vedras", description: "Portugal's most irreverent carnival with satire, costumes and festive street celebrations.", months: [2, 3], category: "Cultural Festival" },
  ],
  Australia: [
    { name: "Sydney New Year's Eve Fireworks", description: "The world's first major New Year's celebration with Sydney Harbour's iconic fireworks show.", months: [12, 1], category: "National Celebration" },
    { name: "Sydney Gay & Lesbian Mardi Gras", description: "The Southern Hemisphere's biggest LGBTQ+ pride festival with a spectacular parade through Oxford Street.", months: [2, 3], category: "Cultural Festival" },
    { name: "Vivid Sydney", description: "Spectacular festival of light, music and ideas illuminating Sydney's famous landmarks.", months: [5, 6], category: "Arts & Technology" },
    { name: "Melbourne International Comedy Festival", description: "The world's third largest comedy festival with hundreds of shows across Melbourne.", months: [3, 4], category: "Arts Festival" },
  ],
  Brazil: [
    { name: "Rio Carnival", description: "The world's most famous carnival with spectacular samba school parades, elaborate costumes and five days of celebrations.", months: [2, 3], category: "Cultural Festival" },
    { name: "Festa Junina", description: "Traditional Brazilian June festival celebrating rural culture with forró dancing, colourful costumes and food.", months: [6], category: "Cultural Festival" },
    { name: "São Paulo Art Biennial", description: "One of the world's most important contemporary art exhibitions held in São Paulo's Ibirapuera Park.", months: [9, 10, 11], category: "Arts & Culture" },
  ],
  Mexico: [
    { name: "Día de los Muertos", description: "Mexico's iconic Day of the Dead when families celebrate departed loved ones with altars, marigolds and festivities.", months: [11], category: "Cultural Festival" },
    { name: "Guelaguetza Festival", description: "Oaxaca's magnificent festival of indigenous cultures with elaborate dance performances and traditional costumes.", months: [7], category: "Cultural Festival" },
    { name: "Carnaval de Veracruz", description: "One of Latin America's largest carnivals with parades, music and dancing along Mexico's Gulf coast.", months: [2, 3], category: "Cultural Festival" },
    { name: "Monarch Butterfly Migration", description: "Annual phenomenon where millions of monarch butterflies blanket the forests of Michoacán in an astonishing spectacle.", months: [11, 12, 1, 2], category: "Nature" },
  ],
  Singapore: [
    { name: "Chinese New Year", description: "Singapore's most vibrant festival with spectacular light-ups on Orchard Road, lion dances and fireworks.", months: [1, 2], category: "Cultural Festival" },
    { name: "Singapore Grand Prix", description: "Formula 1's only night race illuminating Marina Bay's skyline in a spectacular city street circuit.", months: [9], category: "Sports" },
    { name: "Deepavali — Festival of Lights", description: "Dazzling Hindu festival transforming Little India into a sea of lights and vibrant colour.", months: [10, 11], category: "Cultural Festival" },
    { name: "Singapore Food Festival", description: "Celebration of Singapore's extraordinary culinary diversity with special menus and food events.", months: [7], category: "Food & Culture" },
  ],
  "South Korea": [
    { name: "Boryeong Mud Festival", description: "One of South Korea's most popular summer festivals with mud-wrestling, slides and beach activities.", months: [7], category: "Cultural Festival" },
    { name: "Busan International Film Festival", description: "Asia's largest and most prestigious film festival attracting global cinema talent to Busan.", months: [10], category: "Film & Arts" },
    { name: "Cherry Blossom Festival", description: "Korea's beloved spring celebration of cherry blossoms blooming along riversides and through parks.", months: [3, 4], category: "Nature & Culture" },
    { name: "Chuseok (Korean Thanksgiving)", description: "Korea's major harvest festival with ancestral rites, traditional games and family gatherings.", months: [9, 10], category: "National Holiday" },
  ],
}

// ── Curated global hotel fallback ─────────────────────────────────────────────
// Used only when all API sources (primary + nearby city) return zero hotels.
// Climate and city are used to generate destination-appropriate names.
export function getGlobalHotelFallback(
  climate: string,
  city:    string,
): object[] {
  const cl = climate.toLowerCase()
  const isBeach    = cl.includes("tropical") || cl.includes("beach") || cl.includes("humid")
  const isMountain = cl.includes("alpine") || cl.includes("mountain") || cl.includes("cool")

  if (isBeach) return [
    { name: `${city} Beach Resort`,     rating: 4.2, priceLevel: "luxury",    price: "$$$$" },
    { name: `Oceanfront Hotel`,         rating: 4.0, priceLevel: "mid-range", price: "$$$" },
    { name: `Palm Garden Inn`,          rating: 3.8, priceLevel: "budget",    price: "$$"  },
  ]
  if (isMountain) return [
    { name: `${city} Mountain Lodge`,   rating: 4.3, priceLevel: "mid-range", price: "$$$" },
    { name: `Alpine Resort & Spa`,      rating: 4.5, priceLevel: "luxury",    price: "$$$$" },
    { name: `Chalet Guesthouse`,        rating: 3.9, priceLevel: "budget",    price: "$$"  },
  ]
  // Urban / general
  return [
    { name: `${city} Grand Hotel`,      rating: 4.2, priceLevel: "luxury",    price: "$$$$" },
    { name: `${city} Boutique Hotel`,   rating: 4.1, priceLevel: "mid-range", price: "$$$" },
    { name: `${city} Heritage Inn`,     rating: 3.9, priceLevel: "budget",    price: "$$"  },
  ]
}

// ── Curated global restaurant fallback ────────────────────────────────────────
// Country-appropriate cuisine names used when all API sources return zero.
export function getGlobalRestaurantFallback(countryName: string): object[] {
  const MAP: Record<string, { cuisine: string; names: string[] }> = {
    Japan:              { cuisine: "Japanese",    names: ["Sakura Ramen House", "Sushi Ichiban", "Yakitori Grill", "Tempura Restaurant"] },
    France:             { cuisine: "French",      names: ["Bistro de Lyon", "Café Parisien", "Brasserie Centrale", "La Crêperie"] },
    Italy:              { cuisine: "Italian",     names: ["Trattoria Roma", "Pizzeria del Centro", "Osteria Fiorentina", "Ristorante Italia"] },
    Spain:              { cuisine: "Spanish",     names: ["La Tapería", "Paella Valenciana", "Bar Cervecería", "Gastrobar Español"] },
    Thailand:           { cuisine: "Thai",        names: ["Thai Kitchen", "Pad Thai Street Food", "Tom Kha Gai House", "Som Tum Restaurant"] },
    Indonesia:          { cuisine: "Indonesian",  names: ["Warung Nasi Goreng", "Bali Kitchen", "Sate House", "Rijsttafel Restaurant"] },
    Morocco:            { cuisine: "Moroccan",    names: ["Tagine House", "Medina Café", "Moroccan Spice Kitchen", "Riad Restaurant"] },
    Greece:             { cuisine: "Greek",       names: ["Taverna Hellas", "Greek Meze Bar", "Ouzo & Fish Taverna", "Gyros & Souvlaki"] },
    India:              { cuisine: "Indian",      names: ["Curry Palace", "Spice Garden", "Biryani House", "Tandoori Kitchen"] },
    Vietnam:            { cuisine: "Vietnamese",  names: ["Pho Noodle House", "Banh Mi Street Kitchen", "Bun Cha Restaurant", "Vietnamese Table"] },
    UAE:                { cuisine: "Middle Eastern", names: ["Mezze Lounge", "Shawarma House", "Arabic Grill", "The Spice Souk Restaurant"] },
    "United Kingdom":   { cuisine: "British",     names: ["The Crown Public House", "Fish & Chips Restaurant", "British Bistro", "Sunday Roast Restaurant"] },
    Portugal:           { cuisine: "Portuguese",  names: ["Tasca Portuguesa", "Bacalhau Restaurant", "Pastelaria Lisboa", "Restaurante Fado"] },
    Turkey:             { cuisine: "Turkish",     names: ["Turkish Kebab House", "Meze Lounge Istanbul", "Anatolian Kitchen", "Boğaz Restaurant"] },
    Singapore:          { cuisine: "Singaporean", names: ["Hawker Centre", "Chilli Crab House", "Singapore Noodle Bar", "Laksa Restaurant"] },
    "South Korea":      { cuisine: "Korean",      names: ["Seoul BBQ Restaurant", "Bibimbap House", "Korean Fried Chicken", "Jjigae Kitchen"] },
    Australia:          { cuisine: "Modern Australian", names: ["The Harbour Kitchen", "Bondi Beach Café", "Modern Australian Bistro", "The Rooftop Grill"] },
    Mexico:             { cuisine: "Mexican",     names: ["Taquería Mexicana", "El Mercado Restaurant", "Mole & Mezcal Bar", "Cantina de México"] },
    Brazil:             { cuisine: "Brazilian",   names: ["Churrascaria Gaúcha", "Feijão & Farinha", "Boteco Carioca", "Açaí & Grill"] },
    "South Africa":     { cuisine: "South African", names: ["Braai House", "Cape Malay Kitchen", "Safari Grill", "The Vineyard Bistro"] },
  }

  const config = MAP[countryName]
  if (!config) {
    return [
      { name: "Local Cuisine Restaurant", cuisine: "Local cuisine",  rating: 4.2, priceLevel: "mid-range", price: "$$" },
      { name: "International Kitchen",    cuisine: "International",  rating: 4.0, priceLevel: "budget",    price: "$"  },
      { name: "The Traditional Table",    cuisine: "Traditional",    rating: 4.3, priceLevel: "mid-range", price: "$$" },
    ]
  }

  return config.names.map((name, i) => ({
    name,
    cuisine:    config.cuisine,
    rating:     parseFloat((4.0 + i * 0.1).toFixed(1)),
    priceLevel: (["budget", "mid-range", "mid-range", "luxury"] as const)[i] ?? "mid-range",
    price:      (["$", "$$", "$$", "$$$"])[i] ?? "$$",
  }))
}

// ── Curated global activity fallback ──────────────────────────────────────────
// Used when ALL live providers (HotelBeds, OpenTripMap, Google, smart fallback)
// return zero activities.  Guarantees the activities section is never empty.
// Objects match the shape produced by adaptActivity / adaptGoogleActivity so
// the frontend receives a consistent JSON structure.

const ACTIVITY_FALLBACK: Record<string, Array<{
  name: string; description: string; duration: string
  rating: number; price: string; category: string
}>> = {
  France: [
    { name: "Eiffel Tower Visit",         description: "Ascend Paris's iconic 330 m iron tower for breathtaking panoramic views over the city.", duration: "2–3 hours", rating: 4.8, price: "$$",   category: "Landmark"      },
    { name: "Louvre Museum",              description: "World's largest art museum — home to the Mona Lisa, Venus de Milo and over 35,000 masterpieces.", duration: "4–5 hours", rating: 4.8, price: "$$",   category: "Museum"        },
    { name: "Palace of Versailles",       description: "Extravagant royal palace with gilded state apartments and 800 hectares of formal gardens.", duration: "Full day",  rating: 4.7, price: "$$",   category: "Historic Site"  },
    { name: "Mont Saint-Michel",          description: "Dramatic tidal island abbey rising from Normandy's bay — one of France's greatest landmarks.", duration: "Full day",  rating: 4.8, price: "$$",   category: "Historic Site"  },
    { name: "Loire Valley Châteaux Tour", description: "Scenic valley of over 300 Renaissance castles set among vineyards and rolling countryside.", duration: "Full day",  rating: 4.6, price: "$$$",  category: "Scenic Tour"    },
    { name: "D-Day Beaches, Normandy",    description: "Moving WWII memorial coastline with museums, cemeteries and preserved landing beaches.", duration: "Full day",  rating: 4.7, price: "$",    category: "Historical"     },
  ],
  Italy: [
    { name: "Colosseum & Roman Forum",           description: "Ancient Rome's great amphitheatre seating 50,000 — the defining monument of the Empire.", duration: "3–4 hours", rating: 4.8, price: "$$",   category: "Historic Site" },
    { name: "Vatican Museums & Sistine Chapel",  description: "Michelangelo's extraordinary ceiling and papal collections spanning 1,400 rooms.", duration: "4–5 hours", rating: 4.8, price: "$$$",  category: "Museum"        },
    { name: "Venice Gondola Ride",               description: "Glide silently through ancient canals past Renaissance palaces on a traditional gondola.", duration: "1 hour",     rating: 4.7, price: "$$$",  category: "Experience"    },
    { name: "Florence: Uffizi Gallery",          description: "Renaissance masterpieces by Botticelli, Raphael, Leonardo and Michelangelo under one roof.", duration: "3–4 hours", rating: 4.7, price: "$$",   category: "Museum"        },
    { name: "Amalfi Coast Drive",                description: "Dramatic clifftop road threading through colourful villages above the deep blue Mediterranean.", duration: "Full day",  rating: 4.8, price: "$$",   category: "Scenic Drive"  },
    { name: "Pompeii Archaeological Park",       description: "Remarkably preserved Roman city buried by Vesuvius in 79 AD, revealing life 2,000 years ago.", duration: "3–4 hours", rating: 4.7, price: "$$",   category: "Historic Site" },
  ],
  Spain: [
    { name: "Sagrada Família, Barcelona", description: "Gaudí's soaring unfinished basilica — a UNESCO masterpiece of organic Art Nouveau architecture.", duration: "2–3 hours", rating: 4.8, price: "$$",   category: "Landmark"      },
    { name: "Alhambra Palace, Granada",   description: "Exquisite Moorish palace complex with intricate tilework, courtyard fountains and mountain views.", duration: "4–5 hours", rating: 4.9, price: "$$",   category: "Historic Site"  },
    { name: "Prado Museum, Madrid",       description: "Spain's national gallery housing works by Velázquez, Goya and El Greco.", duration: "3–4 hours", rating: 4.8, price: "$$",   category: "Museum"        },
    { name: "Flamenco Show, Seville",     description: "Passionate traditional dance performance in an intimate tablao — Spain's most soulful art form.", duration: "2 hours",    rating: 4.7, price: "$$$",  category: "Cultural Show"  },
    { name: "Park Güell, Barcelona",      description: "Gaudí's whimsical mosaic park with vibrant terraces and sweeping views across Barcelona.", duration: "2 hours",    rating: 4.6, price: "$",    category: "Park"           },
    { name: "Toledo Old City",            description: "Walled medieval city perched on a dramatic gorge — the 'City of Three Cultures' and former capital.", duration: "Full day",  rating: 4.6, price: "$",    category: "Historic Site"  },
  ],
  Portugal: [
    { name: "Jerónimos Monastery, Lisbon", description: "Manueline jewel of European architecture and UNESCO World Heritage site in Belém.", duration: "2 hours",    rating: 4.7, price: "$",    category: "Historic Site"  },
    { name: "Sintra Palaces & Castles",    description: "Fairy-tale palaces across forested hills near Lisbon — a UNESCO Cultural Landscape.", duration: "Full day",  rating: 4.8, price: "$$",   category: "Historic Site"  },
    { name: "Porto Wine Cave Tour",        description: "Traditional Port wine lodges in Vila Nova de Gaia with guided tastings of aged vintage wines.", duration: "2–3 hours", rating: 4.6, price: "$$",   category: "Wine Tour"      },
    { name: "Douro Valley River Cruise",   description: "Glide through Portugal's UNESCO wine country with terraced vineyards rising from the river.", duration: "Half day",  rating: 4.8, price: "$$$",  category: "River Cruise"   },
    { name: "Algarve Sea Cave Boat Tour",  description: "Golden rock arches, sea caves and hidden beaches along the Atlantic coast.", duration: "2–3 hours", rating: 4.7, price: "$$",   category: "Nature Tour"    },
    { name: "Fado Live Performance",       description: "Hauntingly beautiful UNESCO-recognised music in an authentic Lisbon fado house.", duration: "2 hours",    rating: 4.7, price: "$$",   category: "Cultural Show"  },
  ],
  Morocco: [
    { name: "Marrakech Medina Souk Walk", description: "Labyrinthine ancient marketplace — spice stalls, leather tanneries and artisan workshops.", duration: "3–4 hours", rating: 4.7, price: "Free", category: "Cultural"       },
    { name: "Sahara Desert Camel Trek",   description: "Sunrise camel ride into the golden dunes of Erg Chebbi, camping under the stars.", duration: "2 days",    rating: 4.9, price: "$$$",  category: "Adventure"      },
    { name: "Fès Medina Walking Tour",    description: "UNESCO-listed medieval city with the world's oldest university and ancient souks.", duration: "4–5 hours", rating: 4.8, price: "$$",   category: "Historic Site"  },
    { name: "Jardin Majorelle, Marrakech",description: "Vivid blue villa garden created by Jacques Majorelle and later owned by Yves Saint Laurent.", duration: "1–2 hours", rating: 4.6, price: "$",    category: "Garden"         },
    { name: "Atlas Mountains Day Trip",   description: "Drive through Berber villages and dramatic mountain passes to peaks above 4,000 m.", duration: "Full day",  rating: 4.7, price: "$$",   category: "Nature"         },
    { name: "Blue City, Chefchaouen",     description: "Enchanting blue-painted mountain city in the Rif Mountains — Morocco's most photogenic town.", duration: "Full day",  rating: 4.8, price: "$",    category: "Scenic Town"    },
  ],
  Japan: [
    { name: "Fushimi Inari Shrine, Kyoto", description: "Walk through thousands of vermilion torii gates winding up the sacred mountain south of Kyoto.", duration: "3–4 hours", rating: 4.8, price: "Free", category: "Shrine"        },
    { name: "Mount Fuji Day Trip",          description: "Japan's iconic snow-capped sacred volcano, with views from the 5th station.", duration: "Full day",  rating: 4.8, price: "$$",   category: "Nature"         },
    { name: "Hiroshima Peace Memorial",     description: "Moving UNESCO memorial and museum dedicated to the 1945 atomic bombing and the pursuit of peace.", duration: "3–4 hours", rating: 4.8, price: "$",    category: "Memorial"       },
    { name: "Kyoto Temple Circuit",         description: "Walk between Golden Pavilion (Kinkaku-ji), rock garden of Ryōan-ji and Silver Pavilion.", duration: "Full day",  rating: 4.7, price: "$",    category: "Historic Site"  },
    { name: "Shibuya Crossing & Harajuku",  description: "Tokyo's famous pedestrian scramble crossing and the vibrant pop-culture street of Harajuku.", duration: "2–3 hours", rating: 4.6, price: "Free", category: "Cultural"       },
    { name: "Tokyo Skytree Observatory",    description: "Panoramic views over the Tokyo megalopolis from Japan's tallest structure at 634 metres.", duration: "2 hours",    rating: 4.6, price: "$$",   category: "Landmark"       },
  ],
  Thailand: [
    { name: "Grand Palace & Wat Phra Kaew",  description: "Thailand's most sacred site — the revered Emerald Buddha and golden royal palace complex in Bangkok.", duration: "3–4 hours", rating: 4.8, price: "$",    category: "Temple"         },
    { name: "Phi Phi Islands Snorkel Tour",  description: "Boat day trip to crystal-clear waters and dramatic limestone cliffs of the Phi Phi archipelago.", duration: "Full day",  rating: 4.8, price: "$$",   category: "Nature Tour"    },
    { name: "Elephant Nature Park",          description: "Ethical elephant sanctuary near Chiang Mai — feed, bathe and walk with rescued elephants.", duration: "Full day",  rating: 4.9, price: "$$$",  category: "Wildlife"       },
    { name: "Thai Cooking Class",            description: "Learn to prepare pad thai, green curry and tom kha gai from a local chef in Bangkok.", duration: "3–4 hours", rating: 4.7, price: "$$",   category: "Culinary"       },
    { name: "Doi Suthep Temple, Chiang Mai", description: "Sacred hilltop temple reached via a Naga staircase with panoramic mountain views.", duration: "2–3 hours", rating: 4.7, price: "$",    category: "Temple"         },
    { name: "Bangkok Floating Market",       description: "Traditional waterway market where vendors sell tropical fruit and street food from longtail boats.", duration: "3–4 hours", rating: 4.5, price: "$",    category: "Cultural"       },
  ],
  Turkey: [
    { name: "Hagia Sophia, Istanbul",        description: "Magnificent 6th-century Byzantine cathedral turned mosque — Istanbul's most awe-inspiring monument.", duration: "2–3 hours", rating: 4.8, price: "$",    category: "Historic Site"  },
    { name: "Cappadocia Hot Air Balloon",    description: "Sunrise flight over fairy-chimney rock formations, carved cave dwellings and ancient valleys.", duration: "3–4 hours", rating: 4.9, price: "$$$$", category: "Experience"     },
    { name: "Ephesus Ancient City",          description: "Remarkably preserved Greco-Roman city with the Library of Celsus and Temple of Artemis remains.", duration: "3–4 hours", rating: 4.8, price: "$$",   category: "Historic Site"  },
    { name: "Grand Bazaar, Istanbul",        description: "One of the world's oldest covered markets with 4,000+ shops across 61 vaulted streets.", duration: "2–3 hours", rating: 4.6, price: "Free", category: "Market"         },
    { name: "Pamukkale Thermal Pools",       description: "Surreal white calcium travertine terraces with warm mineral-rich thermal pools in western Turkey.", duration: "Half day",  rating: 4.7, price: "$",    category: "Nature"         },
    { name: "Bosphorus Evening Cruise",      description: "Boat voyage along the strait dividing Europe and Asia, past lit Ottoman palaces at dusk.", duration: "3 hours",    rating: 4.6, price: "$$$",  category: "Cruise"         },
  ],
  Greece: [
    { name: "Acropolis & Parthenon, Athens", description: "The world's finest ancient citadel, crowned by the Parthenon — a monument to classical civilisation.", duration: "3–4 hours", rating: 4.8, price: "$$",   category: "Historic Site"  },
    { name: "Santorini Caldera Walk",         description: "Dramatic cliff-edge path from Fira to Oia with iconic sunset views over the volcanic caldera.", duration: "3–4 hours", rating: 4.9, price: "Free", category: "Scenic Walk"    },
    { name: "Meteora Monasteries",            description: "UNESCO monasteries perched atop towering rock pillars in central Greece — a surreal landscape.", duration: "Full day",  rating: 4.8, price: "$$",   category: "Historic Site"  },
    { name: "Delphi Archaeological Site",     description: "Ancient Greek oracle and sanctuary set dramatically on the slopes of Mount Parnassus.", duration: "3–4 hours", rating: 4.7, price: "$$",   category: "Historic Site"  },
    { name: "Greek Island Sailing Day Trip",  description: "Sail between whitewashed Cyclades islands in the deep blue Aegean Sea.", duration: "Full day",  rating: 4.8, price: "$$$",  category: "Sailing"        },
    { name: "National Archaeological Museum", description: "Athens' world-class collection of ancient Greek artefacts spanning over 11,000 years.", duration: "3–4 hours", rating: 4.7, price: "$",    category: "Museum"         },
  ],
  Switzerland: [
    { name: "Jungfraujoch — Top of Europe", description: "Cogwheel train to a glacial plateau at 3,454 m — the highest railway station in Europe.", duration: "Full day",  rating: 4.8, price: "$$$$", category: "Mountain"       },
    { name: "Matterhorn, Zermatt",           description: "See the world's most photographed peak from the car-free alpine village with cable car access.", duration: "Half day",  rating: 4.9, price: "$$",   category: "Nature"         },
    { name: "Rhine Falls, Schaffhausen",     description: "Europe's largest waterfall with boat rides to the central rock and spectacular spray views.", duration: "2–3 hours", rating: 4.6, price: "$",    category: "Nature"         },
    { name: "Lake Geneva Cruise",            description: "Relaxing steamship voyage on Europe's largest alpine lake between Geneva and Lausanne.", duration: "2–3 hours", rating: 4.6, price: "$$",   category: "River Cruise"   },
    { name: "Bern Old Town Walk",            description: "UNESCO medieval capital with 6 km of arcaded walkways, fountains and an astronomical clock.", duration: "2–3 hours", rating: 4.6, price: "Free", category: "Historic Site"  },
    { name: "Château de Chillon",            description: "Exquisitely preserved medieval island castle on Lake Geneva shores — inspiration for Lord Byron.", duration: "2 hours",    rating: 4.7, price: "$",    category: "Historic Site"  },
  ],
  Norway: [
    { name: "Geirangerfjord Cruise",        description: "UNESCO World Heritage fjord with towering cliffs, Seven Sisters waterfall and emerald green water.", duration: "Full day",  rating: 4.9, price: "$$",   category: "Nature Tour"    },
    { name: "Northern Lights Viewing",      description: "Chase the aurora borealis through Norway's winter skies on a guided evening excursion.", duration: "Evening",    rating: 4.9, price: "$$$",  category: "Nature"         },
    { name: "Flåm Railway",                 description: "One of the world's most scenic rail journeys — descending 867 m through waterfalls and mountains.", duration: "2–3 hours", rating: 4.8, price: "$$",   category: "Scenic Train"   },
    { name: "Vigeland Sculpture Park, Oslo",description: "The world's largest sculpture installation by a single artist — 212 bronze and granite figures.", duration: "2–3 hours", rating: 4.6, price: "Free", category: "Park"           },
    { name: "Midnight Sun Hike",            description: "Hike under a sun that never sets on a guided midnight excursion in Northern Norway.", duration: "Half day",  rating: 4.8, price: "$",    category: "Nature"         },
    { name: "Nærøyfjord Kayak Tour",        description: "Paddle through the narrowest UNESCO fjord in Europe, flanked by 1,700 m sheer rock walls.", duration: "Full day",  rating: 4.8, price: "$$$",  category: "Adventure"      },
  ],
  Iceland: [
    { name: "Golden Circle Tour",                   description: "Day circuit to Þingvellir National Park, erupting Geysir and the thundering Gullfoss waterfall.", duration: "Full day",  rating: 4.8, price: "$$",   category: "Scenic Tour"    },
    { name: "Blue Lagoon Geothermal Spa",            description: "Iconic milky-blue mineral pools set in a dramatic black lava landscape near Reykjavik.", duration: "3–4 hours", rating: 4.7, price: "$$$",  category: "Wellness"       },
    { name: "Northern Lights Hunting",               description: "Guided evening excursion into Iceland's dark skies in search of the shimmering aurora.", duration: "Evening",    rating: 4.9, price: "$$$",  category: "Nature"         },
    { name: "South Coast: Waterfalls & Black Beach", description: "Road trip to Seljalandsfoss, Skógafoss and Reynisfjara's eerie black basalt beach.", duration: "Full day",  rating: 4.8, price: "Free", category: "Nature"         },
    { name: "Whale Watching from Húsavík",           description: "World-class whale watching in Iceland's premier whale capital — humpbacks and minkes.", duration: "3–4 hours", rating: 4.8, price: "$$",   category: "Wildlife"       },
    { name: "Glacier Hike on Vatnajökull",           description: "Guided ice walk across Europe's largest glacier with crampons and stunning crevasse formations.", duration: "3–4 hours", rating: 4.8, price: "$$$",  category: "Adventure"      },
  ],
  "United States": [
    { name: "Grand Canyon National Park",      description: "One of the world's great natural wonders — a mile-deep canyon carved by the Colorado River.", duration: "Full day",  rating: 4.9, price: "$",    category: "National Park"  },
    { name: "Central Park & NYC Skyline Walk", description: "New York's iconic 843-acre park with skyline views, rowboats and meandering woodland paths.", duration: "3–4 hours", rating: 4.7, price: "Free", category: "Park"           },
    { name: "Yellowstone National Park",       description: "America's first national park: Old Faithful geyser, prismatic springs and roaming bison.", duration: "Full day",  rating: 4.9, price: "$$",   category: "National Park"  },
    { name: "Smithsonian Museums, D.C.",       description: "America's national museums on the Mall — free admission to natural history and space collections.", duration: "Full day",  rating: 4.8, price: "Free", category: "Museum"         },
    { name: "Las Vegas Strip Night Tour",      description: "Walk the dazzling neon boulevard of mega-casino resorts and spectacles that never sleeps.", duration: "Evening",    rating: 4.6, price: "$$",   category: "Entertainment"  },
    { name: "Alcatraz Island, San Francisco",  description: "Compelling audio tour of the infamous federal penitentiary on a rocky island in the Bay.", duration: "3–4 hours", rating: 4.7, price: "$$",   category: "Historic Site"  },
  ],
}

export function getGlobalActivityFallback(countryName: string): object[] {
  const entries = ACTIVITY_FALLBACK[countryName]

  if (entries && entries.length > 0) {
    return entries.map(a => ({
      name:        a.name,
      title:       a.name,
      description: a.description,
      duration:    a.duration,
      rating:      a.rating,
      price:       a.price,
      category:    a.category,
      image:       undefined,
    }))
  }

  // Generic fallback for any country not explicitly listed above
  return [
    {
      name:        `${countryName} City Walking Tour`,
      title:       `${countryName} City Walking Tour`,
      description: `Explore the historic streets and key landmarks of ${countryName}'s most iconic city.`,
      duration:    "3–4 hours",
      rating:      4.5,
      price:       "Free",
      category:    "Cultural",
      image:       undefined,
    },
    {
      name:        "Local History Museum",
      title:       "Local History Museum",
      description: `Discover ${countryName}'s history, traditions and heritage through fascinating artefacts and exhibits.`,
      duration:    "2–3 hours",
      rating:      4.4,
      price:       "$",
      category:    "Museum",
      image:       undefined,
    },
    {
      name:        "Scenic Viewpoint & Panorama",
      title:       "Scenic Viewpoint & Panorama",
      description: `Panoramic views over the surrounding landscape from ${countryName}'s most spectacular vantage point.`,
      duration:    "1–2 hours",
      rating:      4.5,
      price:       "Free",
      category:    "Nature",
      image:       undefined,
    },
    {
      name:        "Traditional Market Experience",
      title:       "Traditional Market Experience",
      description: `Browse local crafts, fresh produce and street food at ${countryName}'s vibrant traditional market.`,
      duration:    "2 hours",
      rating:      4.4,
      price:       "Free",
      category:    "Cultural",
      image:       undefined,
    },
    {
      name:        "Cultural Heritage Site",
      title:       "Cultural Heritage Site",
      description: `A nationally significant site that defines ${countryName}'s cultural identity and history.`,
      duration:    "2–3 hours",
      rating:      4.5,
      price:       "$",
      category:    "Historic Site",
      image:       undefined,
    },
  ]
}

// ── Country festivals for travel-date event fallback ──────────────────────────
/**
 * Returns 2–4 real annual festivals for the country that overlap with the
 * travel month (±1 month).  Falls back to the first 3 festivals for any month
 * if no overlap is found.  Returns [] when the country has no festival data.
 */
export function getCountryFestivalsForMonth(
  countryName: string,
  travelStart: string,
): object[] {
  const festivals = COUNTRY_FESTIVALS[countryName]
  if (!festivals || festivals.length === 0) return []

  const travelMonth = new Date(travelStart).getMonth() + 1  // 1–12
  const travelYear  = new Date(travelStart).getFullYear()

  const relevant = festivals.filter(f =>
    f.months.some(m => Math.abs(m - travelMonth) <= 1)
  )
  const toShow = relevant.length > 0 ? relevant.slice(0, 4) : festivals.slice(0, 3)

  return toShow.map(f => {
    const displayMonth = f.months.find(m => Math.abs(m - travelMonth) <= 1) ?? f.months[0]
    const festDate     = new Date(travelYear, displayMonth - 1, 15)

    return {
      id:          `festival-${f.name.replace(/\W+/g, "-").toLowerCase()}`,
      name:        f.name,
      date:        festDate.toISOString().split("T")[0],
      location:    countryName,
      description: f.description,
      url:         "",
      category:    f.category,
      image:       undefined,
    }
  })
}
