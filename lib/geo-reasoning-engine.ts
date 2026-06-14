/**
 * Geographic Reasoning Engine
 *
 * Sits between raw CLIP phrase scores and final destination ranking.
 * Applies geographic intelligence ENTIRELY OFFLINE — no external APIs.
 *
 * Pipeline per image:
 *   CLIP phrase scores
 *     → detectSignals()              (which environments / landmarks visible?)
 *     → applyLandmarkOverrides()     (exclusive boosts for recognized landmarks)
 *     → applyEnvironmentRules()      (eliminate impossible destinations)
 *     → return multipliers + debug
 *
 * Multi-image progressive narrowing is achieved automatically: each image
 * applies its multipliers independently, and the aggregation step in
 * clip-scorer.ts compounds the evidence across all images.
 */

import type { LabelScore } from "./clip-service"

// Types
export interface ReasoningDebug {
  detectedSignals:  string[]
  landmarkMatches:  string[]
  boostedDests:     string[]
  eliminatedDests:  string[]
  lines:            string[]   // human-readable reasoning trace
}

export interface ReasoningResult {
  multipliers: Record<string, number>  // destId → multiplier (applied to raw CLIP score)
  debug:       ReasoningDebug
}

interface LandmarkRule {
  name:              string
  keywords:          string[]   // match against phrase text (lowercase)
  dests:             string[]   // destinations to boost
  boostMultiplier:   number     // how much to multiply matching dests
  othersMultiplier:  number     // how much to multiply all other dests
  exclusive:         boolean    // if true, othersMultiplier is applied globally
}

interface EnvironmentRule {
  name:            string
  keywords:        string[]   // detected from top CLIP phrases
  boostDests:      string[]
  reduceDests:     string[]
  boostMultiplier: number
  reduceMultiplier: number
}

// Landmark Registry
// These are high-confidence, exclusive landmark signals.
// When a landmark phrase appears in the top-15 CLIP results, it overrides
// the generic scoring and forces the matched destination to dominate.

const LANDMARK_RULES: LandmarkRule[] = [
  // Japan
  {
    name: "Mount Fuji",
    keywords: ["mount fuji", "fuji mountain", "fuji snow peak", "fujisan"],
    dests: ["japan"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  {
    name: "Cherry Blossom / Sakura",
    keywords: ["cherry blossom", "sakura pink", "sakura japan"],
    dests: ["japan"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.35,
    exclusive: true,
  },
  {
    name: "Torii Gate",
    keywords: ["torii gate", "fushimi inari", "red torii"],
    dests: ["japan"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.35,
    exclusive: true,
  },
  // France
  {
    name: "Eiffel Tower",
    keywords: ["eiffel tower", "eiffel"],
    dests: ["france"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  {
    name: "Louvre / Versailles",
    keywords: ["louvre museum", "versailles", "palace of versailles", "louvre pyramid"],
    dests: ["france"],
    boostMultiplier: 10.0,
    othersMultiplier: 0.35,
    exclusive: true,
  },
  // Jordan
  {
    name: "Petra",
    keywords: ["petra treasury", "petra al khazneh", "petra jordan", "al khazneh", "petra siq"],
    dests: ["jordan"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  {
    name: "Wadi Rum",
    keywords: ["wadi rum"],
    dests: ["jordan"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  // Greece
  {
    name: "Santorini",
    keywords: ["santorini", "oia santorini", "santorini blue dome", "caldera santorini"],
    dests: ["greece"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Acropolis / Parthenon",
    keywords: ["acropolis", "parthenon athens"],
    dests: ["greece"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // Italy
  {
    name: "Colosseum",
    keywords: ["colosseum", "coliseum rome"],
    dests: ["italy"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  {
    name: "Venice Canal",
    keywords: ["venice canal", "gondola venice", "venice gondola"],
    dests: ["italy"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  {
    name: "Amalfi / Cinque Terre",
    keywords: ["amalfi coast", "cinque terre", "positano"],
    dests: ["italy"],
    boostMultiplier: 10.0,
    othersMultiplier: 0.35,
    exclusive: true,
  },
  // Iceland
  {
    name: "Black Sand Beach Iceland",
    keywords: ["reynisfjara", "black sand beach iceland", "basalt columns iceland"],
    dests: ["iceland"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  {
    name: "Blue Lagoon Iceland",
    keywords: ["blue lagoon iceland", "geothermal blue lagoon"],
    dests: ["iceland"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  {
    name: "Glacier Lagoon Iceland",
    keywords: ["jokulsarlon", "jökulsárlón", "glacier lagoon icebergs iceland"],
    dests: ["iceland"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  // Norway
  {
    name: "Norwegian Fjords",
    keywords: ["geirangerfjord", "nærøyfjord", "sognefjord", "fjord norway", "norwegian fjord"],
    dests: ["norway"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  {
    name: "Trolltunga / Preikestolen",
    keywords: ["trolltunga", "preikestolen", "pulpit rock norway"],
    dests: ["norway"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  {
    name: "Lofoten Islands",
    keywords: ["lofoten"],
    dests: ["norway"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  // Switzerland
  {
    name: "Matterhorn",
    keywords: ["matterhorn", "zermatt matterhorn"],
    dests: ["switzerland"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  {
    name: "Swiss Alps / Jungfrau",
    keywords: ["jungfrau", "interlaken", "grindelwald", "kapellbrücke", "chapel bridge lucerne"],
    dests: ["switzerland"],
    boostMultiplier: 10.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // Morocco
  {
    name: "Sahara Desert Morocco",
    keywords: ["sahara desert", "sahara dunes", "sahara morocco", "erg chebbi", "merzouga"],
    dests: ["morocco"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  {
    name: "Chefchaouen Blue City",
    keywords: ["chefchaouen", "blue city morocco", "blue painted walls alley morocco"],
    dests: ["morocco"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // India
  {
    name: "Taj Mahal",
    keywords: ["taj mahal", "taj mahal agra"],
    dests: ["india"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  // Thailand
  {
    name: "Thai Temples",
    keywords: ["wat arun", "grand palace bangkok", "thai buddhist temple ornate gold"],
    dests: ["thailand"],
    boostMultiplier: 10.0,
    othersMultiplier: 0.35,
    exclusive: true,
  },
  {
    name: "Phi Phi Islands",
    keywords: ["phi phi", "maya bay", "phi phi island limestone"],
    dests: ["thailand"],
    boostMultiplier: 10.0,
    othersMultiplier: 0.35,
    exclusive: true,
  },
  // Kenya / Tanzania
  {
    name: "Maasai Mara Migration",
    keywords: ["maasai mara", "wildebeest migration kenya", "wildebeest crossing river"],
    dests: ["kenya", "tanzania"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.15,
    exclusive: false,
  },
  {
    name: "Kilimanjaro",
    keywords: ["kilimanjaro", "mount kilimanjaro"],
    dests: ["tanzania"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  {
    name: "Serengeti",
    keywords: ["serengeti"],
    dests: ["tanzania"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Dubai
  {
    name: "Burj Khalifa / Dubai Skyline",
    keywords: ["burj khalifa", "burj al arab", "palm jumeirah", "dubai marina"],
    dests: ["dubai"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // Maldives / Seychelles
  {
    name: "Overwater Bungalow",
    keywords: ["overwater bungalow", "water villa", "overwater villa"],
    dests: ["maldives", "seychelles", "bali"],
    boostMultiplier: 8.0,
    othersMultiplier: 0.3,
    exclusive: false,
  },
  // Peru
  {
    name: "Machu Picchu",
    keywords: ["machu picchu", "machu picchu inca", "inca ruins peru"],
    dests: ["peru"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  // Australia
  {
    name: "Sydney Opera House",
    keywords: ["sydney opera house", "sydney harbour bridge"],
    dests: ["australia"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Great Barrier Reef",
    keywords: ["great barrier reef", "barrier reef australia"],
    dests: ["australia"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  {
    name: "Uluru",
    keywords: ["uluru", "ayers rock", "uluru red monolith"],
    dests: ["australia"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Turkey
  {
    name: "Cappadocia Balloons",
    keywords: ["cappadocia", "hot air balloon cappadocia", "cappadocia balloon"],
    dests: ["turkey"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Blue Mosque / Hagia Sophia",
    keywords: ["blue mosque", "hagia sophia", "sultan ahmed mosque istanbul"],
    dests: ["turkey"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // Egypt
  {
    name: "Pyramids of Giza",
    keywords: ["pyramid giza", "pyramids giza", "great pyramid", "sphinx egypt", "giza pyramid"],
    dests: ["egypt"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  // New Zealand
  {
    name: "Milford Sound / Fjords NZ",
    keywords: ["milford sound", "fiordland new zealand"],
    dests: ["newzealand"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // Vietnam
  {
    name: "Ha Long Bay",
    keywords: ["ha long bay", "halong bay", "ha long limestone"],
    dests: ["vietnam"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // Spain
  {
    name: "Sagrada Familia",
    keywords: ["sagrada familia", "sagrada família", "gaudi barcelona"],
    dests: ["spain"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // South Korea
  {
    name: "Seoul Landmark",
    keywords: ["gyeongbokgung", "bukchon hanok", "n seoul tower", "gyeongbok palace"],
    dests: ["southkorea"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // Singapore
  {
    name: "Marina Bay Sands / Gardens",
    keywords: ["marina bay sands", "gardens by the bay", "supertree singapore", "marina bay singapore"],
    dests: ["singapore"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  // Mexico
  {
    name: "Chichen Itza",
    keywords: ["chichen itza", "chichén itzá", "mayan pyramid mexico"],
    dests: ["mexico"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Croatia
  {
    name: "Dubrovnik",
    keywords: ["dubrovnik", "dubrovnik old town", "dubrovnik walls"],
    dests: ["croatia"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  // Nepal
  {
    name: "Mount Everest",
    keywords: ["mount everest", "everest base camp", "everest nepal", "sagarmatha"],
    dests: ["nepal"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Namibia
  {
    name: "Sossusvlei",
    keywords: ["sossusvlei", "deadvlei", "namib desert dunes", "namib sossusvlei"],
    dests: ["namibia"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Cambodia
  {
    name: "Angkor Wat",
    keywords: ["angkor wat", "angkor temple", "angkor siem reap", "bayon temple face", "ta prohm jungle", "khmer temple"],
    dests: ["cambodia"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  // Czech Republic
  {
    name: "Prague Old Town / Charles Bridge",
    keywords: ["charles bridge prague", "prague clock tower", "astronomical clock prague", "prague old town", "prague castle", "prague vltava"],
    dests: ["czechrepublic"],
    boostMultiplier: 10.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  {
    name: "Cesky Krumlov",
    keywords: ["cesky krumlov", "ceský krumlov"],
    dests: ["czechrepublic"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Brazil
  {
    name: "Christ the Redeemer",
    keywords: ["christ the redeemer", "cristo redentor", "rio de janeiro statue", "corcovado"],
    dests: ["brazil"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  {
    name: "Iguazu Falls",
    keywords: ["iguazu falls", "iguaçu falls", "iguazu waterfall"],
    dests: ["brazil"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: false,
  },
  // Sri Lanka
  {
    name: "Sigiriya",
    keywords: ["sigiriya", "lion rock sri lanka", "sigiriya rock fortress"],
    dests: ["srilanka"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Nine Arch Bridge",
    keywords: ["nine arch bridge", "nine arch bridge ella", "ella bridge train sri lanka"],
    dests: ["srilanka"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  // Philippines
  {
    name: "El Nido Palawan",
    keywords: ["el nido palawan", "el nido", "palawan lagoon", "palawan limestone karst"],
    dests: ["philippines"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  {
    name: "Banaue Rice Terraces",
    keywords: ["banaue rice terraces", "banaue ifugao", "rice terraces philippines"],
    dests: ["philippines"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // Georgia (country)
  {
    name: "Gergeti Trinity Church",
    keywords: ["gergeti trinity church", "kazbegi church", "stepantsminda church", "kazbegi georgia"],
    dests: ["georgia"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Malaysia
  {
    name: "Petronas Towers",
    keywords: ["petronas towers", "petronas twin towers", "klcc towers", "kuala lumpur twin towers"],
    dests: ["malaysia"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Batu Caves",
    keywords: ["batu caves", "batu cave golden statue", "batu cave stairs"],
    dests: ["malaysia"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  // Austria
  {
    name: "Hallstatt",
    keywords: ["hallstatt", "hallstatt lake austria", "hallstatt village reflection"],
    dests: ["austria"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Schönbrunn Palace",
    keywords: ["schonbrunn palace", "schönbrunn", "vienna schonbrunn", "vienna palace baroque"],
    dests: ["austria"],
    boostMultiplier: 10.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // Ireland
  {
    name: "Cliffs of Moher",
    keywords: ["cliffs of moher", "moher cliffs ireland", "ireland ocean cliffs dramatic"],
    dests: ["ireland"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Giant's Causeway",
    keywords: ["giant's causeway", "giants causeway", "basalt columns northern ireland", "hexagonal basalt"],
    dests: ["ireland"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Colombia
  {
    name: "Cartagena Walled City",
    keywords: ["cartagena walled city", "cartagena colombia colonial", "cartagena old town"],
    dests: ["colombia"],
    boostMultiplier: 10.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  {
    name: "Cocora Valley / Wax Palms",
    keywords: ["cocora valley", "wax palm tree colombia", "cocora wax palm"],
    dests: ["colombia"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },

  // Denmark
  {
    name: "Nyhavn Copenhagen",
    keywords: ["nyhavn", "nyhavn copenhagen canal", "copenhagen colourful canal house"],
    dests: ["denmark"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Belgium
  {
    name: "Grand Place Brussels",
    keywords: ["grand place brussels", "grand place belgium", "brussels guild hall"],
    dests: ["belgium"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Bruges Canals",
    keywords: ["bruges canal", "bruges medieval canal", "bruges belfry"],
    dests: ["belgium"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  // Germany
  {
    name: "Neuschwanstein Castle",
    keywords: ["neuschwanstein", "neuschwanstein castle bavaria"],
    dests: ["germany"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  {
    name: "Brandenburg Gate",
    keywords: ["brandenburg gate", "brandenburger tor", "berlin gate monument"],
    dests: ["germany"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Cologne Cathedral",
    keywords: ["cologne cathedral", "kölner dom", "cologne twin spire"],
    dests: ["germany"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  // Hungary
  {
    name: "Budapest Parliament",
    keywords: ["budapest parliament", "parliament danube budapest", "budapest parliament night"],
    dests: ["hungary"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  {
    name: "Chain Bridge Budapest",
    keywords: ["chain bridge budapest", "széchenyi bridge budapest", "buda castle danube"],
    dests: ["hungary"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  // Poland
  {
    name: "Wieliczka Salt Mine",
    keywords: ["wieliczka", "wieliczka salt mine", "underground chamber crystal poland"],
    dests: ["poland"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Wawel / Krakow Old Town",
    keywords: ["wawel castle", "krakow old town", "krakow cloth hall"],
    dests: ["poland"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // United Kingdom
  {
    name: "Big Ben / Westminster",
    keywords: ["big ben", "westminster palace london", "tower of london", "tower bridge thames"],
    dests: ["unitedkingdom"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Stonehenge",
    keywords: ["stonehenge", "stonehenge wiltshire", "stonehenge ancient circle"],
    dests: ["unitedkingdom"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Scotland
  {
    name: "Edinburgh Castle",
    keywords: ["edinburgh castle", "edinburgh castle rock scotland", "edinburgh skyline"],
    dests: ["scotland"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Isle of Skye / Old Man of Storr",
    keywords: ["old man of storr", "isle of skye storr", "skye pinnacle scotland"],
    dests: ["scotland"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Eilean Donan Castle",
    keywords: ["eilean donan", "eilean donan castle"],
    dests: ["scotland"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Saudi Arabia
  {
    name: "AlUla / Hegra",
    keywords: ["alula", "al-ula", "hegra", "madain saleh", "nabataean tomb saudi"],
    dests: ["saudiarabia"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  {
    name: "Edge of the World",
    keywords: ["edge of the world saudi", "jebel fihrayn", "escarpment riyadh plateau"],
    dests: ["saudiarabia"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // Qatar
  {
    name: "Museum of Islamic Art Doha",
    keywords: ["museum islamic art doha", "doha museum waterfront", "qatar national museum"],
    dests: ["qatar"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Oman
  {
    name: "Sultan Qaboos Grand Mosque",
    keywords: ["sultan qaboos mosque", "grand mosque muscat", "muscat grand mosque oman"],
    dests: ["oman"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Musandam Fjords / Oman",
    keywords: ["musandam fjord", "khasab fjord oman", "oman fjord turquoise"],
    dests: ["oman"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // Lebanon
  {
    name: "Baalbek",
    keywords: ["baalbek", "baalbek roman temple", "baalbek jupiter column"],
    dests: ["lebanon"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Madagascar
  {
    name: "Avenue des Baobabs",
    keywords: ["avenue des baobabs", "baobab alley madagascar", "baobab tree madagascar sunset"],
    dests: ["madagascar"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  {
    name: "Tsingy",
    keywords: ["tsingy", "tsingy de bemaraha", "needle limestone madagascar"],
    dests: ["madagascar"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Mauritius
  {
    name: "Chamarel Coloured Earth",
    keywords: ["chamarel", "chamarel coloured earth", "chamarel seven colours"],
    dests: ["mauritius"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Le Morne Brabant",
    keywords: ["le morne", "le morne brabant", "morne brabant cliff mauritius"],
    dests: ["mauritius"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  // China
  {
    name: "Great Wall of China",
    keywords: ["great wall of china", "great wall china", "great wall mountain ridge"],
    dests: ["china"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.1,
    exclusive: true,
  },
  {
    name: "Zhangjiajie",
    keywords: ["zhangjiajie", "zhangjiajie avatar mountain", "floating pillar mountain china"],
    dests: ["china"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  {
    name: "Li River Guilin",
    keywords: ["li river guilin", "guilin karst", "guilin karst boat china"],
    dests: ["china"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Forbidden City / Temple of Heaven",
    keywords: ["forbidden city beijing", "temple of heaven beijing", "tiananmen beijing"],
    dests: ["china"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Bhutan
  {
    name: "Tiger's Nest / Paro Taktsang",
    keywords: ["tiger's nest", "paro taktsang", "tiger nest bhutan", "taktsang cliff monastery bhutan"],
    dests: ["bhutan"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.1,
    exclusive: true,
  },
  // United States
  {
    name: "Grand Canyon",
    keywords: ["grand canyon", "grand canyon arizona", "grand canyon red rock vast"],
    dests: ["unitedstates"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Monument Valley",
    keywords: ["monument valley", "monument valley navajo", "sandstone buttes navajo"],
    dests: ["unitedstates"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Antelope Canyon",
    keywords: ["antelope canyon", "slot canyon arizona", "antelope canyon swirling"],
    dests: ["unitedstates"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Yellowstone",
    keywords: ["yellowstone geyser", "yellowstone old faithful", "old faithful geyser steam"],
    dests: ["unitedstates"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  {
    name: "Golden Gate Bridge",
    keywords: ["golden gate bridge", "golden gate san francisco"],
    dests: ["unitedstates"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Alaska
  {
    name: "Denali",
    keywords: ["denali", "denali alaska", "mount mckinley alaska", "denali mountain reflection"],
    dests: ["alaska"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Argentina
  {
    name: "Perito Moreno Glacier",
    keywords: ["perito moreno", "perito moreno glacier", "patagonia argentina glacier calving"],
    dests: ["argentina"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Chile
  {
    name: "Torres del Paine",
    keywords: ["torres del paine", "torres paine granite", "patagonia granite towers chile"],
    dests: ["chile"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  {
    name: "Easter Island Moai",
    keywords: ["easter island", "moai chile", "ahu tongariki", "moai statue pacific chile"],
    dests: ["chile"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.1,
    exclusive: true,
  },
  {
    name: "Atacama Desert Salt Flat",
    keywords: ["atacama desert", "valle de la luna chile", "atacama salt flat chile"],
    dests: ["chile"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: false,
  },
  // Hawaii
  {
    name: "Napali Coast",
    keywords: ["napali coast", "kauai napali cliff", "napali coast hawaii"],
    dests: ["hawaii"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Kilauea / Lava Flow",
    keywords: ["kilauea", "hawaii lava flow ocean", "big island lava flow"],
    dests: ["hawaii"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Greenland
  {
    name: "Ilulissat Icefjord",
    keywords: ["ilulissat", "ilulissat icefjord", "greenland icefjord", "disko bay greenland"],
    dests: ["greenland"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  // Mongolia
  {
    name: "Eagle Hunter / Ger Tent",
    keywords: ["eagle hunter mongolia", "mongolian eagle hunter", "gobi desert ger tent", "mongolian nomad ger"],
    dests: ["mongolia"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Armenia
  {
    name: "Khor Virap / Mount Ararat",
    keywords: ["khor virap", "mount ararat armenia", "ararat monastery armenia"],
    dests: ["armenia"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Geghard Monastery",
    keywords: ["geghard", "geghard monastery rock", "geghard carved rock armenia"],
    dests: ["armenia"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Uzbekistan
  {
    name: "Registan Samarkand",
    keywords: ["registan", "samarkand registan", "registan blue tile madrasah"],
    dests: ["uzbekistan"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  // Romania
  {
    name: "Peles Castle",
    keywords: ["peles castle", "peles sinaia romania"],
    dests: ["romania"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Bran Castle (Dracula)",
    keywords: ["bran castle", "bran castle transylvania", "dracula castle romania"],
    dests: ["romania"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // Bulgaria
  {
    name: "Rila Monastery",
    keywords: ["rila monastery", "rila monastery bulgaria", "rila monastery fresco courtyard"],
    dests: ["bulgaria"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Slovenia
  {
    name: "Lake Bled Island Church",
    keywords: ["lake bled", "bled island church", "lake bled slovenia reflection"],
    dests: ["slovenia"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  // Estonia
  {
    name: "Tallinn Old Town",
    keywords: ["tallinn old town", "tallinn medieval tower", "tallinn town hall"],
    dests: ["estonia"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Latvia
  {
    name: "Riga Art Nouveau",
    keywords: ["riga art nouveau", "riga art nouveau facade"],
    dests: ["latvia"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // Lithuania
  {
    name: "Hill of Crosses",
    keywords: ["hill of crosses", "kryžių kalnas", "thousands iron crosses lithuania"],
    dests: ["lithuania"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  {
    name: "Trakai Castle",
    keywords: ["trakai island castle", "trakai castle lake"],
    dests: ["lithuania"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
  // Tunisia
  {
    name: "Sidi Bou Said",
    keywords: ["sidi bou said", "sidi bou said blue white"],
    dests: ["tunisia"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "El Djem Amphitheatre",
    keywords: ["el djem", "el djem amphitheatre", "el djem roman tunisia"],
    dests: ["tunisia"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.25,
    exclusive: true,
  },
  // Algeria
  {
    name: "Tassili n'Ajjer",
    keywords: ["tassili", "tassili n'ajjer", "tassili rock art algeria"],
    dests: ["algeria"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  // Rwanda
  {
    name: "Mountain Gorilla Rwanda",
    keywords: ["mountain gorilla", "gorilla trekking", "gorilla rwanda", "silverback gorilla trekking"],
    dests: ["rwanda"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.1,
    exclusive: true,
  },
  // Ethiopia
  {
    name: "Lalibela Rock Churches",
    keywords: ["lalibela", "lalibela rock church", "lalibela hewn church ethiopia"],
    dests: ["ethiopia"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.1,
    exclusive: true,
  },
  {
    name: "Danakil Depression",
    keywords: ["danakil", "danakil depression", "danakil sulfur lake", "erta ale lava"],
    dests: ["ethiopia"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.1,
    exclusive: true,
  },
  // Zimbabwe
  {
    name: "Victoria Falls Zimbabwe",
    keywords: ["victoria falls zimbabwe", "victoria falls spray mist zimbabwe", "zimbabwe falls bridge"],
    dests: ["zimbabwe"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: false,
  },
  // Zambia
  {
    name: "Victoria Falls Zambia / Devil's Pool",
    keywords: ["victoria falls zambia", "devil's pool zambia", "zambia victoria falls"],
    dests: ["zambia"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: false,
  },
  // Panama
  {
    name: "Panama Canal",
    keywords: ["panama canal", "panama canal locks", "canal locks ship panama"],
    dests: ["panama"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  // Ecuador
  {
    name: "Galápagos Islands",
    keywords: ["galápagos", "galapagos islands", "galapagos tortoise darwin", "galapagos marine iguana"],
    dests: ["ecuador"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.1,
    exclusive: true,
  },
  // Bolivia
  {
    name: "Salar de Uyuni",
    keywords: ["salar de uyuni", "uyuni salt flat", "uyuni mirror bolivia", "bolivian salt flat"],
    dests: ["bolivia"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.1,
    exclusive: true,
  },
  // Guatemala
  {
    name: "Tikal",
    keywords: ["tikal", "tikal mayan temple", "tikal jungle pyramid guatemala"],
    dests: ["guatemala"],
    boostMultiplier: 16.0,
    othersMultiplier: 0.15,
    exclusive: true,
  },
  // Laos
  {
    name: "Luang Prabang Alms Giving",
    keywords: ["luang prabang monk alms", "monk alms orange laos", "luang prabang dawn monks"],
    dests: ["laos"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  // Hong Kong
  {
    name: "Hong Kong Neon Skyline",
    keywords: ["hong kong skyline", "victoria harbour hong kong", "hong kong neon harbour"],
    dests: ["hongkong"],
    boostMultiplier: 14.0,
    othersMultiplier: 0.2,
    exclusive: true,
  },
  {
    name: "Victoria Peak",
    keywords: ["victoria peak hong kong", "hong kong peak panorama"],
    dests: ["hongkong"],
    boostMultiplier: 12.0,
    othersMultiplier: 0.3,
    exclusive: true,
  },
]

// Environment Signal Rules
// Triggered when environment keywords appear in the top CLIP phrases.
// Applied AFTER landmark detection to handle non-landmark environmental images.

const ENVIRONMENT_RULES: EnvironmentRule[] = [
  {
    name: "arctic_cold",
    keywords: [
      "aurora", "northern lights", "borealis", "glacier", "iceberg", "ice cave",
      "frozen lake", "arctic", "polar bear", "permafrost", "tundra", "snowfield",
      "husky", "igloo", "snowmobile", "lapland", "reindeer finland", "ice hotel",
      "midnight sun arctic",
    ],
    boostDests: ["iceland", "norway", "finland", "sweden", "canada"],
    reduceDests: ["maldives", "seychelles", "bali", "thailand", "kenya", "tanzania", "india", "vietnam", "morocco"],
    boostMultiplier: 2.5,
    reduceMultiplier: 0.15,
  },
  {
    name: "alpine_mountain_snow",
    keywords: [
      "ski resort", "ski slope", "ski mountain", "alpine village", "snow peaks alps",
      "matterhorn", "jungfrau", "snowy alpine", "powder snow ski",
    ],
    boostDests: ["switzerland", "norway", "canada", "iceland", "newzealand", "france"],
    reduceDests: ["maldives", "seychelles", "thailand", "kenya", "dubai"],
    boostMultiplier: 2.0,
    reduceMultiplier: 0.3,
  },
  {
    name: "safari_savanna",
    keywords: [
      "safari", "savanna", "savannah", "wildebeest", "maasai", "serengeti",
      "ngorongoro", "okavango", "kruger", "big five", "game drive", "lion pride",
      "elephant herd", "giraffe acacia", "cheetah running grass", "zebra herd",
      "hippo river africa",
    ],
    boostDests: ["kenya", "tanzania", "southafrica", "botswana", "namibia"],
    reduceDests: ["maldives", "seychelles", "france", "italy", "japan", "iceland", "finland", "norway", "switzerland"],
    boostMultiplier: 4.0,
    reduceMultiplier: 0.1,
  },
  {
    name: "tropical_beach",
    keywords: [
      "overwater bungalow", "coral reef snorkel", "turquoise lagoon palm",
      "manta ray tropical", "tropical fish reef", "coconut palm white sand",
      "crystal lagoon island", "pristine tropical beach",
    ],
    boostDests: ["maldives", "seychelles", "bali", "thailand", "malaysia"],
    reduceDests: ["iceland", "finland", "norway", "sweden", "switzerland", "canada"],
    boostMultiplier: 2.0,
    reduceMultiplier: 0.3,
  },
  {
    name: "desert_arid",
    keywords: [
      "sand dune", "sahara", "bedouin camp", "wadi dry", "arid canyon",
      "desert sunset dunes", "camel desert trail", "red sand desert",
    ],
    boostDests: ["jordan", "morocco", "dubai", "egypt", "namibia"],
    reduceDests: ["iceland", "finland", "norway", "maldives", "bali", "vietnam"],
    boostMultiplier: 3.0,
    reduceMultiplier: 0.2,
  },
  {
    name: "fjord_scandinavia",
    keywords: [
      "fjord", "fjord cruise", "fjord village", "steep fjord walls",
      "lofoten", "geiranger", "nærøyfjord", "hardanger", "aurlandsfjord",
    ],
    boostDests: ["norway", "iceland", "newzealand"],
    reduceDests: ["maldives", "thailand", "kenya", "dubai", "india"],
    boostMultiplier: 3.0,
    reduceMultiplier: 0.25,
  },
  {
    name: "jungle_rainforest",
    keywords: [
      "rainforest canopy", "amazon jungle", "cloud forest", "tropical jungle",
      "mangrove", "dense forest tropical", "jungle waterfall", "wildlife jungle",
    ],
    boostDests: ["costarica", "vietnam", "thailand", "bali", "malaysia"],
    reduceDests: ["iceland", "norway", "finland", "maldives", "dubai"],
    boostMultiplier: 2.0,
    reduceMultiplier: 0.35,
  },
  {
    name: "medieval_european",
    keywords: [
      "medieval castle", "cobblestone old town", "gothic cathedral", "roman ruins",
      "walled city medieval", "stone bridge medieval", "renaissance palace", "baroque church",
    ],
    boostDests: ["italy", "france", "spain", "croatia", "turkey", "portugal", "netherlands"],
    reduceDests: ["maldives", "kenya", "tanzania", "dubai"],
    boostMultiplier: 1.8,
    reduceMultiplier: 0.5,
  },
  {
    name: "volcano_geothermal",
    keywords: [
      "volcano crater", "lava field", "volcanic landscape", "geothermal pool",
      "volcanic eruption", "lava flow", "geyser eruption steam", "caldera",
    ],
    boostDests: ["iceland", "bali", "newzealand", "costarica", "hawaii", "ecuador", "nicaragua", "ethiopia"],
    reduceDests: ["france", "maldives", "kenya", "netherlands"],
    boostMultiplier: 2.5,
    reduceMultiplier: 0.4,
  },

  // New disambiguation rules
  {
    name: "futuristic_neon_megacity",
    keywords: [
      "neon sign street", "cyberpunk city", "glass skyscraper night", "neon light urban",
      "futuristic glass tower", "hypermodern skyline", "led lights city night",
      "neon street market", "towering glass city", "city lights night skyline",
    ],
    boostDests: ["japan", "southkorea", "singapore", "dubai", "hongkong", "china", "malaysia", "unitedstates"],
    reduceDests: ["iceland", "norway", "morocco", "kenya", "mongolia", "bhutan", "namibia", "botswana"],
    boostMultiplier: 2.5,
    reduceMultiplier: 0.25,
  },

  {
    name: "gothic_medieval_central_europe",
    keywords: [
      "gothic spire old town", "cobblestone medieval square", "baroque palace european",
      "renaissance town hall", "art nouveau facade", "medieval walled city european",
      "half-timbered house medieval", "gothic cathedral old town",
    ],
    boostDests: ["czechrepublic", "austria", "hungary", "germany", "belgium", "poland", "estonia", "latvia", "lithuania", "romania", "slovakia", "slovenia", "croatia"],
    reduceDests: ["maldives", "kenya", "dubai", "bali", "thailand", "mongolia"],
    boostMultiplier: 2.0,
    reduceMultiplier: 0.3,
  },

  {
    name: "himalayan_high_altitude",
    keywords: [
      "himalayan mountain prayer flag", "prayer flag mountain pass", "high altitude monastery",
      "tibetan plateau", "himalaya snow peak blue", "himalayan village yak",
    ],
    boostDests: ["nepal", "bhutan", "india", "china", "tibet"],
    reduceDests: ["maldives", "seychelles", "kenya", "bahamas", "netherlands", "singapore", "denmark"],
    boostMultiplier: 3.5,
    reduceMultiplier: 0.15,
  },

  {
    name: "patagonia_wild",
    keywords: [
      "patagonia wilderness", "torres del paine", "patagonia glacial lake", "patagonian steppe",
      "patagonia granite peak wind", "perito moreno glacier", "end of the world",
    ],
    boostDests: ["chile", "argentina"],
    reduceDests: ["maldives", "thailand", "morocco", "egypt", "singapore", "bahamas"],
    boostMultiplier: 5.0,
    reduceMultiplier: 0.1,
  },

  {
    name: "silk_road_ancient",
    keywords: [
      "blue tile dome madrasah", "silk road ancient city", "samarkand registan",
      "caravanserai ancient", "islamic mosaic geometric dome", "turquoise tile ancient mosque",
    ],
    boostDests: ["uzbekistan", "turkey", "morocco", "jordan", "iran", "india"],
    reduceDests: ["iceland", "norway", "canada", "australia", "maldives"],
    boostMultiplier: 3.0,
    reduceMultiplier: 0.25,
  },

  {
    name: "caribbean_tropical_resort",
    keywords: [
      "caribbean turquoise beach resort", "caribbean island palm all-inclusive",
      "reggae beach bar", "turquoise caribbean warm", "tropical resort beach bar",
      "coral bay turquoise shallow swim",
    ],
    boostDests: ["jamaica", "bahamas", "dominicanrepublic", "cuba", "costarica"],
    reduceDests: ["iceland", "norway", "switzerland", "mongolia", "bhutan", "finland"],
    boostMultiplier: 2.5,
    reduceMultiplier: 0.25,
  },

  {
    name: "pacific_island_paradise",
    keywords: [
      "overwater bungalow lagoon sunrise", "south pacific island coral ring",
      "polynesian lagoon crystal clear", "atoll reef aerial", "bora bora turquoise",
    ],
    boostDests: ["borabora", "fiji", "maldives", "seychelles", "mauritius", "hawaii"],
    reduceDests: ["iceland", "norway", "mongolia", "nepal", "czech republic", "poland"],
    boostMultiplier: 3.0,
    reduceMultiplier: 0.2,
  },

  {
    name: "gorilla_primate",
    keywords: [
      "mountain gorilla", "silverback gorilla", "gorilla trekking jungle",
      "gorilla bamboo forest", "gorilla close face",
    ],
    boostDests: ["rwanda", "ethiopia", "zambia", "southafrica"],
    reduceDests: ["iceland", "norway", "dubai", "netherlands", "singapore", "maldives"],
    boostMultiplier: 5.0,
    reduceMultiplier: 0.1,
  },

  {
    name: "salt_flat_arid_extreme",
    keywords: [
      "salt flat mirror reflection sky", "uyuni salt flat", "salar vast white flat",
      "dead salt lake flat", "flat white salt expanse",
    ],
    boostDests: ["bolivia", "chile", "namibia", "mongolia"],
    reduceDests: ["maldives", "seychelles", "norway", "ireland", "newzealand"],
    boostMultiplier: 4.0,
    reduceMultiplier: 0.15,
  },

  {
    name: "ancient_mayan_aztec",
    keywords: [
      "mayan temple pyramid jungle", "aztec pyramid", "mesoamerican pyramid",
      "tikal pyramid", "chichen itza", "mayan ruins jungle",
    ],
    boostDests: ["mexico", "guatemala", "peru", "bolivia", "cambodia"],
    reduceDests: ["iceland", "norway", "maldives", "singapore"],
    boostMultiplier: 3.5,
    reduceMultiplier: 0.2,
  },

  {
    name: "polar_penguin_ice",
    keywords: [
      "emperor penguin", "penguin colony ice", "penguin ice floe",
      "penguin antarctic", "penguin tuxedo ice",
    ],
    boostDests: ["antarctica"],
    reduceDests: ["maldives", "kenya", "thailand", "dubai", "vietnam", "brazil"],
    boostMultiplier: 20.0,
    reduceMultiplier: 0.05,
  },

  {
    name: "scandinavian_coastal_village",
    keywords: [
      "scandinavian fishing village colourful", "nordic colourful wooden house",
      "norwegian red wooden house coast", "danish half-timbered house",
      "nordic village white summer night",
    ],
    boostDests: ["norway", "denmark", "sweden", "finland", "greenland"],
    reduceDests: ["maldives", "morocco", "kenya", "thailand", "dubai"],
    boostMultiplier: 2.0,
    reduceMultiplier: 0.35,
  },

  {
    name: "african_savanna_expanded",
    keywords: [
      "wildebeest migration river", "elephant herd savanna africa",
      "giraffe acacia africa", "rhino africa savanna",
      "leopard tree africa", "wild dog africa", "cheetah africa grass",
    ],
    boostDests: ["kenya", "tanzania", "southafrica", "botswana", "namibia", "zimbabwe", "zambia", "rwanda", "ethiopia"],
    reduceDests: ["iceland", "norway", "maldives", "singapore", "japan"],
    boostMultiplier: 3.5,
    reduceMultiplier: 0.1,
  },
]

// Precompiled keyword indices (built once at module load)
// Avoids repeated .toLowerCase() calls on every rule/keyword during hot path.

interface _CompiledKw { lower: string; ruleIdx: number }

const _landmarkKws: _CompiledKw[] = []
const _envKws: _CompiledKw[] = []

for (let i = 0; i < LANDMARK_RULES.length; i++) {
  for (const kw of LANDMARK_RULES[i].keywords) {
    _landmarkKws.push({ lower: kw.toLowerCase(), ruleIdx: i })
  }
}
for (let i = 0; i < ENVIRONMENT_RULES.length; i++) {
  for (const kw of ENVIRONMENT_RULES[i].keywords) {
    _envKws.push({ lower: kw.toLowerCase(), ruleIdx: i })
  }
}

// Detection Helpers
function topN(labelScores: LabelScore[], n: number): LabelScore[] {
  return labelScores.slice(0, n)
}

// Core Reasoning Function
/**
 * Apply geographic reasoning to per-destination base scores.
 *
 * @param baseScores    Raw hybrid scores per destination (from clip-scorer)
 * @param labelScores   Full sorted CLIP phrase scores for this image
 * @param destIds       All destination IDs in the knowledge base
 * @returns             Adjusted multipliers per dest + debug information
 */
export function applyGeographicReasoning(
  baseScores: Record<string, number>,
  labelScores: LabelScore[],
  destIds: string[],
): ReasoningResult {
  const multipliers: Record<string, number> = {}
  for (const id of destIds) multipliers[id] = 1.0

  const debug: ReasoningDebug = {
    detectedSignals:  [],
    landmarkMatches:  [],
    boostedDests:     [],
    eliminatedDests:  [],
    lines:            [],
  }

  const top15 = topN(labelScores, 15)
  const top30 = topN(labelScores, 30)

  // Step 1: Landmark Detection (precompiled index)
  // Scan top-15 labels once; for each label check all precompiled keywords.
  // Avoids O(rules × labels × keywords) repeated toLowerCase() calls.

  const _triggeredLandmarks = new Map<number, LabelScore>()
  for (const ls of top15) {
    const lower = ls.label.toLowerCase()
    for (const { lower: kw, ruleIdx } of _landmarkKws) {
      if (!_triggeredLandmarks.has(ruleIdx) && lower.includes(kw)) {
        _triggeredLandmarks.set(ruleIdx, ls)
      }
    }
  }

  for (const [ruleIdx, matchingPhrase] of _triggeredLandmarks) {
    const rule = LANDMARK_RULES[ruleIdx]

    debug.landmarkMatches.push(`${rule.name} (phrase: "${matchingPhrase.label.substring(0, 60)}", score: ${matchingPhrase.score.toFixed(4)})`)
    debug.lines.push(`[LANDMARK] ${rule.name} detected → boost ${rule.dests.join("+")} ×${rule.boostMultiplier}`)

    for (const dest of rule.dests) {
      if (multipliers[dest] !== undefined) {
        multipliers[dest] *= rule.boostMultiplier
        if (!debug.boostedDests.includes(dest)) debug.boostedDests.push(dest)
      }
    }

    if (rule.exclusive || rule.othersMultiplier < 0.5) {
      for (const dest of destIds) {
        if (!rule.dests.includes(dest)) {
          multipliers[dest] *= rule.othersMultiplier
          if (rule.othersMultiplier < 0.3 && !debug.eliminatedDests.includes(dest)) {
            debug.eliminatedDests.push(dest)
          }
        }
      }
    }

  }

  // Step 2: Environment Signal Detection (precompiled index)
  // Scan top-30 labels once against precompiled env keywords.

  const _triggeredEnv = new Map<number, LabelScore>()
  for (const ls of top30) {
    const lower = ls.label.toLowerCase()
    for (const { lower: kw, ruleIdx } of _envKws) {
      if (!_triggeredEnv.has(ruleIdx) && lower.includes(kw)) {
        _triggeredEnv.set(ruleIdx, ls)
      }
    }
  }

  for (const [ruleIdx, matchingPhrase] of _triggeredEnv) {
    const rule = ENVIRONMENT_RULES[ruleIdx]

    debug.detectedSignals.push(rule.name)
    debug.lines.push(
      `[ENV] ${rule.name} detected (phrase: "${matchingPhrase.label.substring(0, 55)}") ` +
      `→ boost [${rule.boostDests.join(",")}] × ${rule.boostMultiplier} | ` +
      `reduce [${rule.reduceDests.join(",")}] × ${rule.reduceMultiplier}`
    )

    for (const dest of rule.boostDests) {
      if (multipliers[dest] !== undefined) {
        multipliers[dest] *= rule.boostMultiplier
        if (!debug.boostedDests.includes(dest)) debug.boostedDests.push(dest)
      }
    }

    for (const dest of rule.reduceDests) {
      if (multipliers[dest] !== undefined) {
        multipliers[dest] *= rule.reduceMultiplier
        if (!debug.eliminatedDests.includes(dest)) debug.eliminatedDests.push(dest)
      }
    }
  }

  // Step 3: Contradiction Protection
  // If both cold AND tropical signals detected (e.g. "tropical beach in Iceland"),
  // reduce the confidence on both and trust the landmark rules more.
  const hasCold    = debug.detectedSignals.includes("arctic_cold") || debug.detectedSignals.includes("alpine_mountain_snow")
  const hasTropical= debug.detectedSignals.includes("tropical_beach")
  const hasSafari  = debug.detectedSignals.includes("safari_savanna")
  const hasDesert  = debug.detectedSignals.includes("desert_arid")

  if (hasCold && hasTropical) {
    debug.lines.push("[CONFLICT] Cold + tropical both detected — softening both rules")
    // Re-soften the more extreme multipliers
    for (const dest of ["maldives", "seychelles", "bali", "thailand"]) {
      if (multipliers[dest] !== undefined) multipliers[dest] = Math.max(multipliers[dest], 0.3)
    }
    for (const dest of ["iceland", "norway", "finland", "sweden"]) {
      if (multipliers[dest] !== undefined) multipliers[dest] = Math.max(multipliers[dest], 0.3)
    }
  }

  // Debug summary
  debug.lines.push(
    `[SUMMARY] Detected: ${debug.detectedSignals.join(", ") || "none"} | ` +
    `Landmarks: ${debug.landmarkMatches.length > 0 ? debug.landmarkMatches.map(m => m.split(" (")[0]).join(", ") : "none"}`
  )

  return { multipliers, debug }
}

/**
 * Aggregate reasoning across multiple images.
 * Progressive narrowing: each additional image compounds evidence.
 * Later images receive higher weight (recency bias).
 */
export function aggregateReasoningResults(
  results: ReasoningResult[],
  destIds: string[],
): Record<string, number> {
  const combined: Record<string, number> = {}
  for (const id of destIds) combined[id] = 1.0

  for (let i = 0; i < results.length; i++) {
    const weight = 1.0 + i * 0.15  // image 1=1.0×, image 2=1.15×, image 5=1.6×
    for (const id of destIds) {
      const m = results[i].multipliers[id] ?? 1.0
      // Weighted geometric mean of multipliers
      combined[id] *= Math.pow(m, weight)
    }
  }

  return combined
}

/**
 * Print the full reasoning trace to the server console.
 */
export function logReasoningDebug(results: ReasoningResult[], imageCount: number): void {
  console.log(`\n${"═".repeat(60)}`)
  console.log(`[GEO-REASONING] Analysis for ${imageCount} image(s)`)
  console.log(`${"═".repeat(60)}`)

  // Aggregate across all images for Phase 6 summary logs
  const allMatched:    string[] = []
  const allBoosted:    string[] = []
  const allEliminated: string[] = []

  for (let i = 0; i < results.length; i++) {
    const d = results[i].debug
    console.log(`\n--- Image ${i + 1} ---`)

    if (d.landmarkMatches.length > 0) {
      console.log(`  Landmark Matches:`)
      d.landmarkMatches.forEach(m => {
        console.log(`    ✦ ${m}`)
        const name = m.split(" (phrase:")[0]
        if (!allMatched.includes(name)) allMatched.push(name)
      })
    }
    if (d.detectedSignals.length > 0) {
      console.log(`  Detected Environments: ${d.detectedSignals.join(" | ")}`)
      for (const s of d.detectedSignals) {
        if (!allMatched.includes(s)) allMatched.push(s)
      }
    }
    if (d.boostedDests.length > 0) {
      console.log(`  Boosted: ${d.boostedDests.join(", ")}`)
      for (const b of d.boostedDests) {
        if (!allBoosted.includes(b)) allBoosted.push(b)
      }
    }
    if (d.eliminatedDests.length > 0) {
      console.log(`  Eliminated: ${d.eliminatedDests.join(", ")}`)
      for (const e of d.eliminatedDests) {
        if (!allEliminated.includes(e)) allEliminated.push(e)
      }
    }
    d.lines.forEach(l => console.log(`  ${l}`))
  }

  console.log(`${"═".repeat(60)}`)

  // Phase 6 summary lines
  if (allMatched.length > 0)
    console.log(`[Reasoning] Matched concepts: ${allMatched.join(", ")}`)
  if (allBoosted.length > 0)
    console.log(`[Reasoning] Boosted countries: ${allBoosted.join(", ")}`)
  if (allEliminated.length > 0)
    console.log(`[Reasoning] Eliminated countries: ${allEliminated.join(", ")}`)
  if (allMatched.length === 0 && allBoosted.length === 0)
    console.log(`[Reasoning] No landmarks or environment signals detected — relying on CLIP phrase scores only`)

  console.log(`${"═".repeat(60)}\n`)
}

// Semantic Category Consistency Check
// Called by clip-scorer after category-weighted scoring to log which
// semantic categories are most relevant across all images.

export interface SemanticConsistency {
  dominantCategories: string[]   // categories with highest cross-image agreement
  conflictingPairs:   string[]   // detected contradictory category pairs
  climateSignal:      "cold" | "tropical" | "arid" | "temperate" | "unknown"
}

export function analyseSemanticConsistency(
  activatedCategoryLists: string[][],  // one array per image
): SemanticConsistency {
  const catCount: Record<string, number> = {}
  for (const cats of activatedCategoryLists) {
    for (const cat of cats) {
      catCount[cat] = (catCount[cat] ?? 0) + 1
    }
  }

  const imageCount = activatedCategoryLists.length
  const dominant   = Object.entries(catCount)
    .filter(([, count]) => count >= Math.ceil(imageCount / 2))
    .sort(([, a], [, b]) => b - a)
    .map(([cat]) => cat)

  const conflicting: string[] = []
  if (catCount["winter_arctic"] && catCount["tropical_lush"]) {
    conflicting.push("winter_arctic ↔ tropical_lush")
  }
  if (catCount["desert_arid"] && catCount["winter_arctic"]) {
    conflicting.push("desert_arid ↔ winter_arctic")
  }
  if (catCount["coastal_marine"] && catCount["desert_arid"]) {
    conflicting.push("coastal_marine ↔ desert_arid (cold desert context)")
  }

  let climate: SemanticConsistency["climateSignal"] = "unknown"
  if (catCount["winter_arctic"])    climate = "cold"
  else if (catCount["tropical_lush"]) climate = "tropical"
  else if (catCount["desert_arid"])   climate = "arid"
  else if (catCount["coastal_marine"] || catCount["natural_landscapes"]) climate = "temperate"

  if (dominant.length > 0) {
    console.log(`[Semantic] Consistent categories across ${imageCount} image(s): ${dominant.slice(0, 5).join(", ")}`)
  }
  if (conflicting.length > 0) {
    console.log(`[Semantic] ⚠ Conflicting signals: ${conflicting.join(" | ")}`)
  }
  console.log(`[Semantic] Climate signal: ${climate}`)

  return { dominantCategories: dominant, conflictingPairs: conflicting, climateSignal: climate }
}
