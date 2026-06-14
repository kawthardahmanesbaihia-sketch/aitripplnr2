/**
 * Semantic Destination Knowledge Base
 *
 * Structured semantic profiles: each destination has 15–20 semantic categories,
 * each category contains rich CLIP-optimized visual phrases.
 *
 * The flat arrays (ALL_CONCEPT_LABELS etc.) are built automatically at the bottom.
 * The semantic structure drives category-weighted scoring in clip-scorer.ts.
 */

// Semantic category weights
// Higher weight = this category's CLIP score influences destination ranking more.

export const CATEGORY_WEIGHTS: Record<string, number> = {
  landmarks:            3.5,
  wildlife_fauna:       2.2,
  ancient_ruins:        1.8,
  volcanic_geothermal:  2.0,
  desert_arid:          1.8,
  winter_arctic:        1.8,
  natural_landscapes:   2.0,
  coastal_marine:       1.8,
  water_features:       1.6,
  tropical_lush:        1.6,
  urban_environment:    1.5,
  architecture:         1.5,
  spiritual_religious:  1.5,
  seasonal_spectacle:   1.5,
  cultural_traditional: 1.4,
  aerial_panoramic:     1.2,
  adventure_extreme:    1.2,
  luxury_premium:       1.2,
  nightlife_urban:      1.3,
  vegetation_flora:     1.3,
  cinematic_atmosphere: 1.1,
  food_market:          1.0,
  transportation_iconic:0.9,
  festival_celebration: 1.0,
}

// Contradiction pairs
// If categoryA fires strongly, penalise destinations that are incompatible.
export const CATEGORY_CONTRADICTIONS: Array<{
  dominant: string
  incompatible: string[]
  penaltyMultiplier: number
}> = [
  {
    dominant: "winter_arctic",
    incompatible: ["maldives","seychelles","bali","thailand","fiji","borabora","hawaii","mauritius","philippines","cambodia","laos","vietnam","dominicanrepublic","jamaica","bahamas"],
    penaltyMultiplier: 0.15,
  },
  {
    dominant: "tropical_lush",
    incompatible: ["greenland","antarctica","iceland","norway","finland"],
    penaltyMultiplier: 0.2,
  },
  {
    dominant: "desert_arid",
    incompatible: ["greenland","antarctica","maldives","seychelles","fiji"],
    penaltyMultiplier: 0.2,
  },
  {
    dominant: "wildlife_fauna",
    incompatible: ["maldives","seychelles","singapore","hongkong","netherlands","belgium"],
    penaltyMultiplier: 0.3,
  },
]

// Structured semantic destination profiles
export const DEST_CATEGORY_CONCEPTS: Record<string, Record<string, string[]>> = {

  // ═══════════════════════════════ EAST ASIA ══════════════════════════════════

  japan: {
    landmarks: [
      "Mount Fuji snow-capped peak reflection Japan",
      "red torii gate path Fushimi Inari Kyoto Japan",
      "Himeji Castle white stone walls Japan",
      "Senso-ji temple lanterns Asakusa Tokyo Japan",
      "Kinkaku-ji golden pavilion reflection pond Kyoto",
      "Tokyo Skytree tower evening cityscape Japan",
      "Nara deer park ancient temple Japan",
      "Hiroshima Peace Memorial dome reflection Japan",
      "Arashiyama bamboo grove path Japan",
      "Osaka Castle stone walls moat Japan",
      "Hakone Fuji lake clear water Japan",
      "Meiji Shrine forest Tokyo Japan",
      "Shinjuku Gyoen garden Japan traditional",
      "Nikko mausoleum elaborate wood carvings Japan",
      "Itsukushima floating torii gate sea Miyajima Japan",
    ],
    natural_landscapes: [
      "Japanese Alps snow peaks misty valley",
      "Yakushima ancient cedar forest Japan rain",
      "Hokkaido lavender flower fields Japan summer",
      "Fuji Five Lakes reflections Japan morning",
      "Japanese countryside terraced rice paddy fields",
      "Okinawa jungle cliffs aquamarine sea Japan",
      "Japan mountain forest autumn mist",
      "Shirakawa-go thatched roof village Japan snow",
      "Yaku Island primeval forest Japan fog",
      "Japan river valley cherry blossom spring",
    ],
    seasonal_spectacle: [
      "cherry blossom sakura pink Japan spring park",
      "Japan autumn maple red orange temple",
      "Hokkaido lavender purple fields summer Japan",
      "Japan snow monkey macaque hot spring winter",
      "firefly Japan summer forest glow night",
      "Japan hydrangea rainy season purple",
      "koyo autumn foliage Japan mountain village",
      "Japan winter snow covered temple garden",
      "hanami picnic cherry blossom Japan park",
      "Japanese plum blossom early spring pink white",
    ],
    urban_environment: [
      "Tokyo Shibuya pedestrian crossing busy Japan",
      "Shinjuku neon district night Japan",
      "Akihabara electronics anime neon street Tokyo",
      "Tokyo modern glass skyscrapers skyline Japan",
      "Osaka Dotonbori neon signs canal night Japan",
      "Kyoto traditional wooden machiya townhouse lane",
      "Tokyo busy train station commuters Japan",
      "Ginza luxury shopping district Tokyo evening",
      "Harajuku fashion street Tokyo colorful Japan",
      "Tokyo rooftop view city lights sunset Japan",
    ],
    architecture: [
      "Japanese pagoda five-story wood ancient",
      "traditional Japanese inn ryokan tatami room",
      "Japanese sliding shoji screen paper wood room",
      "Kyoto traditional ochre plaster wall alley",
      "Japanese zen garden raked gravel rock",
      "Japanese castle stone base white plaster walls",
      "torii gate vermilion red lacquer Japan",
      "Japanese temple wooden beam curved roof eaves",
      "onsen outdoor bath Japan snow mountain",
      "Japanese tea house garden moss path",
    ],
    cultural_traditional: [
      "geisha maiko kimono Kyoto street Japan",
      "Japanese tea ceremony bowl bamboo matcha",
      "sumo wrestler Japan bout ring",
      "Japanese festival matsuri lantern float parade",
      "samurai armor Japan museum warrior",
      "kabuki theater actor Japan stage makeup",
      "kendo practice Japan sword bamboo dojo",
      "Japanese calligraphy brush ink paper",
      "origami paper craft Japan traditional",
      "taiko drum performance Japan festival night",
    ],
    spiritual_religious: [
      "Buddhist temple incense smoke Japan meditation",
      "Shinto shrine offering box Japan",
      "Japanese temple bells bronze Japan winter",
      "zen monastery garden Japan stone moss",
      "Japanese funeral procession white kimono",
      "shrine maiden miko Japan red white",
      "Buddhist monk Japan orange robe walking",
      "stone lantern pathway Japan garden night",
      "Japanese fortune paper omikuji tied tree",
    ],
    food_market: [
      "ramen shop Japan steaming noodle bowl",
      "sushi Japan fresh fish counter",
      "Japanese street food takoyaki vendor",
      "Japanese convenience store 7-eleven night",
      "Tsukiji style fish market Japan seafood",
      "Japanese izakaya bar lantern night",
      "matcha green tea Japan sweets",
      "Japanese bento box lunch arrangement",
      "yakitori skewer grilled Japan smoky night",
      "Japan ramen street market steam warmth",
    ],
    nightlife_urban: [
      "Tokyo neon night street signs Japan",
      "Shinjuku kabukicho entertainment district Japan night",
      "Akihabara neon anime signs night Japan",
      "Golden Gai bar alley Tokyo narrow Japan night",
      "Japan rooftop bar night city lights",
      "Osaka evening street food lanterns Japan",
      "Japan jazz bar dim light retro",
    ],
    winter_arctic: [
      "snow monkey macaque Japan onsen hot spring winter",
      "Japan snow-covered temple garden serene white",
      "Hokkaido powder snow skiing Japan winter",
      "Japanese Alps winter snow peaks blue sky",
      "snow lantern Japan garden winter night",
      "Sapporo snow festival Japan ice sculpture",
      "Japan rural village deep snow roof",
    ],
    wildlife_fauna: [
      "Nara deer bowing Japan tame ancient temple",
      "snow monkey macaque bathing hot spring Japan",
      "Japanese crane red-crowned bird snow Japan",
      "koi fish pond Japan garden colorful",
      "Japanese fox shrine Miyagi Japan winter",
      "flying squirrel Japan forest night",
    ],
    vegetation_flora: [
      "bamboo grove Arashiyama Japan path green",
      "cherry blossom tunnel Japan park spring",
      "Japan moss garden green carpet Kyoto",
      "Japanese maple momiji autumn red leaves",
      "pine tree Japan coastal rocky shore",
      "lotus flower pond Japan summer pink",
      "Japan wisteria purple tunnel spring",
    ],
    cinematic_atmosphere: [
      "misty bamboo Japan morning fog diffuse light",
      "Japan rain narrow street lantern reflection",
      "golden hour Japan countryside rice terraces",
      "Japan foggy mountain temple dramatic atmosphere",
      "Japan night rain city reflection neon",
      "Japan minimalist zen atmosphere stone",
    ],
    transportation_iconic: [
      "shinkansen bullet train Japan Mount Fuji",
      "Tokyo subway platform crowd Japan rush hour",
      "Japanese rickshaw old town Kyoto",
      "Japan cable car mountain autumn forest",
    ],
    luxury_premium: [
      "Japan luxury ryokan onsen private bath tatami",
      "Kyoto high-end kaiseki dinner Japan ceramic",
      "Japan luxury train seven stars Kyushu",
      "Japan private machiya house Kyoto rental",
    ],
    adventure_extreme: [
      "Mount Fuji Japan climbing trail dawn summit",
      "Japan powder snow skiing Hokkaido deep",
      "Japan trail run mountain ridge summer",
      "Japan surfing Miyazaki Pacific wave",
    ],
    festival_celebration: [
      "Gion Matsuri Kyoto parade float Japan July",
      "Japan Hanabi fireworks summer festival lake",
      "Sapporo Japan Snow Festival ice sculpture February",
      "Japan Aomori Nebuta float lantern parade",
      "Japan Awa Odori dance festival Tokushima",
    ],
    aerial_panoramic: [
      "aerial view Tokyo sprawling Japan skyline",
      "Mount Fuji aerial view sunrise Japan",
      "Japan countryside rice terraces aerial summer",
      "Kyoto traditional rooftops aerial Japan",
      "Japan Arashiyama aerial bamboo green",
      "Japan Okinawa aerial coral reef turquoise",
    ],
  },

  france: {
    landmarks: [
      "Eiffel Tower Paris iron lattice evening lights",
      "Louvre museum glass pyramid Paris courtyard",
      "Palace of Versailles golden gate fountain gardens",
      "Mont Saint-Michel island monastery tidal France",
      "Arc de Triomphe Champs-Élysées Paris",
      "Pont du Gard Roman aqueduct France stone",
      "Sacré-Cœur basilica white dome Montmartre Paris",
      "Notre-Dame Cathedral Paris Gothic spires Seine",
      "Château de Chambord Loire Valley France tower",
      "Étretat white chalk cliffs Normandy France",
      "Carcassonne medieval walled city France hilltop",
      "Palais des Papes Avignon France fortress",
      "Gorges du Verdon turquoise canyon France",
    ],
    natural_landscapes: [
      "lavender purple fields Provence France summer",
      "Loire Valley château castle river France",
      "French Alps mountain peaks winter Chamonix",
      "Normandy green cliffs coast France",
      "Bordeaux vineyard rolling hills France autumn",
      "Mont Blanc snow peak French Alps",
      "Camargue white horse pink flamingo France wetland",
      "Dordogne Valley river cliff France green",
      "France countryside sunflower yellow field summer",
    ],
    urban_environment: [
      "Paris café outdoor terrace croissant morning",
      "Haussmann boulevard Paris balcony iron railing",
      "Montmartre steps artists cobblestones Paris",
      "Paris Seine river bridge golden hour",
      "Paris Marais district medieval lanes France",
      "Paris rooftop zinc grey city view",
      "Paris bookstall bouquiniste river Seine",
      "Bordeaux miroir d'eau water mirror reflection France",
    ],
    architecture: [
      "French Gothic cathedral flying buttresses stone",
      "Provence stone village perched hilltop France",
      "Alsace half-timbered colorful house wine France",
      "Baron Haussmann limestone building Paris ornate",
      "French château turret slate roof river",
      "Paris iron balcony building ornate stone",
      "French Baroque palace symmetry garden",
      "Colmar colorful canal house reflection Alsace France",
    ],
    coastal_marine: [
      "French Riviera turquoise bay cliff Monaco",
      "Nice promenade Côte d'Azur France blue sea",
      "Brittany rocky coast lighthouse France Atlantic",
      "Calanques white limestone creek turquoise France",
      "Biarritz beach surf France Atlantic",
      "Corsica turquoise beach pine France island",
      "Étretat chalk arch cliff sea France",
    ],
    cultural_traditional: [
      "French market baguette cheese outdoor stall",
      "Bastille Day fireworks Paris July France",
      "Paris fashion week model runway France",
      "French wine cellar barrel aged Bordeaux",
      "Tour de France cycling road mountain crowd",
      "Cannes film festival red carpet France",
      "French mime street performer Paris",
      "Provence farmer lavender harvest France",
    ],
    food_market: [
      "Paris patisserie macarons colorful window",
      "French boulangerie baguette morning France",
      "Burgundy wine tasting cellar France",
      "French cheese platter camembert brie",
      "Paris market fresh produce France morning",
      "French onion soup crouton bistro Paris",
      "crêpe street vendor Paris France",
    ],
    seasonal_spectacle: [
      "lavender Provence purple rows France July",
      "Paris spring chestnut blossom sidewalk France",
      "Alsace Christmas market lights snow France",
      "French Alps ski slope winter Chamonix snow",
      "autumn Bordeaux vineyard gold France",
    ],
    ancient_ruins: [
      "Pont du Gard Roman aqueduct stone arch France",
      "Arles Roman amphitheatre arena France",
      "Nîmes Roman temple maison carrée France",
      "prehistoric cave Lascaux cave painting France",
    ],
    cinematic_atmosphere: [
      "Paris golden hour Seine romantic afternoon",
      "misty French Alps valley morning Chamonix",
      "Paris rain café window reflection France",
      "Provence golden light lavender France dusk",
    ],
    aerial_panoramic: [
      "aerial Paris Eiffel Tower Seine panorama",
      "French Alps aerial chalets valley snow",
      "Loire Valley aerial château vineyards France",
    ],
    nightlife_urban: [
      "Paris illuminated night Eiffel Tower golden",
      "Moulin Rouge Paris red windmill France night",
      "France wine bar evening terrace lights",
      "Paris Marais cocktail bar neon France night",
      "Lyon France bouchon bistro evening",
    ],
    vegetation_flora: [
      "lavender Provence rows purple France bloom",
      "France Loire Valley poppy field spring red",
      "France Normandy apple orchard spring bloom",
      "France chestnut tree autumn boulevard Paris",
      "French Riviera Mediterranean palm promenade",
    ],
    luxury_premium: [
      "Paris Ritz luxury hotel France chandelier",
      "Côte d'Azur yacht France Cannes moored",
      "France three-star Michelin restaurant table",
      "Versailles private tour France grand",
    ],
    adventure_extreme: [
      "Chamonix Mont Blanc France alpinism climb",
      "France Alps paragliding aerial valley view",
      "France Gorges du Verdon kayak canyon",
    ],
    festival_celebration: [
      "Nice Carnival France float costume February",
      "Cannes film festival red carpet France Palme",
      "Fête de la Musique Paris France street June",
      "France Tour de France mountain stage crowd",
    ],
    water_features: [
      "France Seine river Paris bridge stone arch",
      "Verdon Gorge France turquoise lake canyon",
      "France Dordogne river château reflection",
      "France waterfall Pyrenees Cirque de Gavarnie",
    ],
    transportation_iconic: [
      "France TGV high-speed train countryside",
      "Paris Métro art nouveau entrance France",
      "French canal boat slow travel Burgundy",
    ],
    spiritual_religious: [
      "Mont Saint-Michel abbey interior Gothic France",
      "Paris Notre-Dame Cathedral rose window France",
      "France pilgrimage Lourdes basilica devotion",
      "Chartres Cathedral stained glass France",
    ],
  },

  italy: {
    landmarks: [
      "Colosseum Rome ancient stone amphitheater",
      "Venice Grand Canal gondola Italy",
      "Leaning Tower of Pisa marble Italy",
      "Trevi Fountain Rome Baroque marble coins",
      "St Peter's Basilica Vatican Rome dome",
      "Florence Duomo cathedral Renaissance dome Italy",
      "Sistine Chapel Vatican ceiling Michelangelo",
      "Pompeii ruins excavation volcanic Italy",
      "Amalfi coast terraced houses cliff Italy",
      "Cinque Terre pastel houses cliff sea Italy",
      "Piazza San Marco Venice basilica square",
      "Castel Sant'Angelo Rome river Tiber Italy",
      "Uffizi Gallery Florence Renaissance Italy",
      "Positano vertical village cliff Italy",
    ],
    natural_landscapes: [
      "Tuscany rolling hills vineyard cypress tree Italy",
      "Dolomites jagged peaks Italy alpine",
      "Sicily Mount Etna volcano island Italy",
      "Lake Como mirror reflection mountains Italy",
      "Italian Riviera coast cliff village Italy",
      "Sardinia white sand turquoise sea Italy",
      "Val d'Orcia wheat fields Italy summer",
      "Garda Lake Italy Alps village",
    ],
    urban_environment: [
      "Roman piazza cobblestone café outdoor Italy",
      "Venice narrow canal bridge Italy",
      "Florence Piazza della Signoria sculpture Italy",
      "Rome Trastevere lane evening Italy",
      "Milan fashion boutique Galleria Italy",
      "Naples street busy market Italy",
      "Rome Campo de' Fiori market morning Italy",
    ],
    architecture: [
      "Roman Doric column ancient ruin Italy",
      "Italian Baroque church ornate facade",
      "Venice palace Grand Canal Gothic arched window",
      "Tuscany stone farmhouse cypress Italy",
      "Italian Renaissance palace courtyard loggia",
      "Rome ancient brick aqueduct arch Italy",
      "Sicilian Baroque yellow stone cathedral Italy",
      "Italian hilltop medieval village stone Italy",
    ],
    coastal_marine: [
      "Amalfi Coast cliff village blue sea Italy",
      "Sardinia transparent turquoise sea beach Italy",
      "Sicily sea cave blue grotto Italy",
      "Positano beach umbrella Italy summer",
      "Italian Riviera colorful fishing village pier Italy",
      "Capri island blue grotto sea Italy",
      "Tropea cliff town sea Calabria Italy",
    ],
    cultural_traditional: [
      "Venice masked carnival costume colorful Italy",
      "Italian gelato shop colorful cone Italy",
      "Rome Aperol spritz outdoor terrace evening",
      "Italian opera house ornate gold Italy",
      "Sicily puppet marionette traditional Italy",
      "Italian wedding procession cobblestone village",
      "Siena Palio horse race piazza Italy",
    ],
    food_market: [
      "Italian pasta fresh handmade kitchen Italy",
      "Rome pizza margherita traditional Italy",
      "Italian market fresh tomato mozzarella Italy",
      "Sicily arancini street food Italy",
      "Florence bistecca steak Italy restaurant",
      "Italian espresso bar morning Italy",
      "Italian cheese wine antipasto Italy",
    ],
    ancient_ruins: [
      "Roman Forum ancient columns Italy ruin",
      "Pompeii excavated street Italy ancient",
      "Colosseum interior seating Italy ancient",
      "Roman aqueduct arch Italy ancient",
      "Paestum Greek temple Italy ancient",
      "Valley of the Temples Sicily Italy ancient",
      "Ostia Antica mosaic floor Italy Roman",
    ],
    seasonal_spectacle: [
      "Italy spring wisteria purple lane",
      "Tuscany autumn harvest vineyard gold Italy",
      "Italy Christmas market medieval piazza lights",
      "Venice snow canals winter Italy rare",
    ],
    spiritual_religious: [
      "Vatican interior gold mosaic ceiling Rome",
      "Italian cathedral choir stained glass Italy",
      "Assisi Saint Francis basilica Umbria Italy",
      "Italian roadside Madonna shrine stone Italy",
    ],
    aerial_panoramic: [
      "aerial Amalfi coast Italy winding road",
      "Florence panorama from Piazzale Michelangelo Italy",
      "Dolomites aerial jagged rock Italy",
    ],
    cinematic_atmosphere: [
      "Rome golden hour fountain Italy marble",
      "Venice morning mist canal Italy quiet",
      "Tuscany foggy valley cypress Italy dawn",
      "Italy Dolomites mountain pastel sky dawn",
      "Sicily golden sunset sea cliff Italy",
    ],
    nightlife_urban: [
      "Rome nightlife Piazza Navona fountain Italy",
      "Milan aperitivo evening terrace Italy",
      "Venice lit canal bridge night Italy",
      "Florence Piazza della Repubblica night Italy",
      "Naples Spaccanapoli street evening Italy",
    ],
    luxury_premium: [
      "Amalfi coast villa Italy private terrace sea",
      "Italy luxury villa Tuscany pool vineyard",
      "Venice gondola private evening champagne Italy",
      "Lake Como Italy villa luxury boat",
    ],
    vegetation_flora: [
      "Tuscany Italy cypress row hill road",
      "Italy olive tree grove grove silver",
      "Sicily almond blossom Italy spring white",
      "Italian Riviera bougainvillea pink cliff",
    ],
    transportation_iconic: [
      "Venice gondola canal Italy oar silhouette",
      "Italy train Trenitalia countryside window",
      "Rome Vespa scooter cobblestone Italy",
    ],
    adventure_extreme: [
      "Dolomites Italy via ferrata climb cliff",
      "Italy white water kayak Sesia gorge",
      "Mount Etna hike crater rim Italy",
    ],
    festival_celebration: [
      "Venice Carnival masked ball Italy February",
      "Siena Palio horse race Italy July August",
      "Italy Calcio Storico historical football Florence",
    ],
    water_features: [
      "Italy Lake Como village waterfront Alps",
      "Italy Lake Garda turquoise sail boat",
      "Trevi Fountain Rome Italy Baroque water",
    ],
  },

  switzerland: {
    landmarks: [
      "Matterhorn pyramid peak snow Zermatt Switzerland",
      "Chapel Bridge Kapellbrücke Lucerne medieval water",
      "Jungfrau mountain glacier Switzerland train",
      "Château de Chillon lake castle Switzerland",
      "Grindelwald village green valley Eiger Switzerland",
      "Lake Geneva Jet d'Eau fountain Switzerland",
      "Bern old town bear arcade fountain Switzerland",
      "Interlaken valley peaks lakes Switzerland",
    ],
    natural_landscapes: [
      "Swiss Alps valley glacier blue sky",
      "alpine meadow wildflowers Switzerland summer green",
      "Swiss lake mirror reflection mountain peaks",
      "Lauterbrunnen valley waterfall cliff Switzerland",
      "Swiss mountain pass road scenic hairpin",
      "Graubünden mountain autumn Swiss landscape",
      "Swiss glacier icefields crevasse blue",
    ],
    winter_arctic: [
      "Swiss Alps ski resort slope winter powder",
      "Matterhorn winter snow blue sky Zermatt",
      "Switzerland snow village Christmas lights",
      "Swiss chalet snow roof mountain winter",
      "frozen Swiss mountain lake winter",
      "cross-country skiing Switzerland valley snow",
    ],
    architecture: [
      "Swiss chalet carved wood balcony mountain",
      "Lucerne old town painted facade arch",
      "Swiss Gothic church steeple valley town",
      "wooden covered bridge Switzerland medieval",
      "Swiss Art Nouveau train station ornate",
    ],
    water_features: [
      "Swiss waterfall cliff Lauterbrunnen",
      "Lake Lucerne crystal reflection Alps Switzerland",
      "Rhine Falls waterfall Schaffhausen Switzerland",
      "Swiss mountain glacier meltwater stream",
      "Lake Zurich city waterfront Switzerland",
    ],
    adventure_extreme: [
      "paragliding Switzerland Alps valley flight",
      "Switzerland hiking trail mountain ridge summer",
      "canyoning gorge Switzerland waterfall",
      "Switzerland bungee jump bridge valley",
    ],
    cinematic_atmosphere: [
      "Swiss mountain fog valley morning dreamy",
      "Switzerland golden meadow Alps evening light",
      "Matterhorn dramatic cloud at peak",
    ],
    food_market: [
      "Swiss chocolate shop window dark milk",
      "Swiss cheese fondue melting pot traditional",
      "Zurich Christmas market mulled wine lights",
    ],
    aerial_panoramic: [
      "aerial Switzerland Alps panorama valley",
      "Jungfraujoch aerial glacier top of Europe",
    ],
    urban_environment: [
      "Zürich lakeside elegant city Switzerland",
      "Geneva United Nations headquarters lake city",
      "Basel art museum riverside Switzerland",
    ],
  },

  iceland: {
    landmarks: [
      "Northern Lights aurora borealis Iceland night sky",
      "Reynisfjara black sand beach basalt columns Iceland",
      "Blue Lagoon geothermal milky blue Iceland",
      "Seljalandsfoss waterfall Iceland walk behind",
      "Jökulsárlón glacier lagoon icebergs Iceland",
      "Skógafoss waterfall Iceland rainbow mist",
      "Hallgrímskirkja church Reykjavik concrete spire Iceland",
      "Diamond Beach ice blocks black sand Iceland",
      "Strokkur geyser eruption steam Iceland",
      "Godafoss waterfall Iceland wide fall",
      "Kirkjufell mountain reflection Iceland",
      "Háifoss waterfall Iceland tall drop",
    ],
    natural_landscapes: [
      "Iceland volcanic lava field moss green",
      "Iceland glacier Vatnajökull ice cap aerial",
      "Iceland midnight sun horizon orange sky",
      "Iceland fjord dramatic cliff sea village",
      "Iceland highland interior desolate beauty",
      "Iceland geothermal steam vent valley",
      "Iceland mountain reflection lake Landmannalaugar",
      "Iceland fog tundra eerie landscape",
    ],
    winter_arctic: [
      "aurora green Iceland sky reflection lake",
      "Iceland ice cave blue crystal interior",
      "Iceland snow landscape winter road empty",
      "Iceland wolf geothermal pool steam winter",
      "Iceland glacier ice climbing crampons",
      "Iceland snowmobile glacier winter adventure",
      "Iceland husky dog sled snow",
    ],
    volcanic_geothermal: [
      "Iceland erupting volcano lava night red glow",
      "Iceland geothermal hot spring steam mist",
      "Iceland lava field black rock grey sky",
      "Iceland caldera boiling mud pot",
      "Iceland fissure eruption lava flow 2024",
      "Iceland obsidian volcanic glass formation",
      "Grímsvötn Iceland eruption ash cloud",
    ],
    coastal_marine: [
      "Iceland puffin bird cliff coast summer",
      "Iceland basalt column coast hexagonal rock",
      "Iceland Arctic ocean dark cliff waves crash",
      "Iceland lighthouse red coast dramatic",
    ],
    wildlife_fauna: [
      "Iceland puffin seabird cliff",
      "Iceland Arctic fox white winter Iceland",
      "Iceland reindeer Eastfjords Iceland",
      "Iceland whale watching Husavik humpback",
      "Iceland horse Icelandic pony winter",
    ],
    water_features: [
      "Iceland waterfall double cliff canyon",
      "Iceland river turquoise melt glacial clear",
      "Iceland geothermal pool outdoor swim hot",
    ],
    aerial_panoramic: [
      "Iceland aerial glacier ice cap blue",
      "Iceland drone lava field mossy green aerial",
      "Iceland aerial waterfall horseshoe bird eye",
      "Iceland aerial farmhouse green turf roof",
    ],
    food_market: [
      "Reykjavik harbour fish market Iceland fresh",
      "Iceland skyr fermented dairy traditional",
      "Iceland lamb soup traditional bowl winter",
    ],
    urban_environment: [
      "Reykjavik colorful corrugated iron house Iceland",
      "Reykjavik hot dog stand outdoor Iceland",
      "Reykjavik Rainbow Street Iceland pride",
    ],
    luxury_premium: [
      "Iceland glass igloo sleep aurora luxury",
      "Iceland hot spring private pool outdoor winter",
      "Iceland luxury lodge remote highland volcanic",
    ],
    adventure_extreme: [
      "Iceland glacier hiking crampons ice axe",
      "Iceland snowmobile glacier winter speed",
      "Iceland rafting glacial river rapids",
      "Iceland volcano trekking Fimmvörðuháls trail",
    ],
    transportation_iconic: [
      "Iceland camper van Ring Road trip",
      "Iceland Super Jeep highland F-road",
    ],
    seasonal_spectacle: [
      "Iceland midnight sun June bright horizon",
      "Iceland aurora green dancing sky winter",
      "Iceland wildflower lupine purple summer",
    ],
    cinematic_atmosphere: [
      "Iceland aurora reflection lake dramatic",
      "Iceland storm cloud dramatic landscape moody",
      "Iceland midnight sun golden road endless",
      "Iceland fog volcanic black landscape ethereal",
    ],
  },

  norway: {
    landmarks: [
      "Geirangerfjord Norway cruise ship cliff waterfall",
      "Preikestolen Pulpit Rock Norway cliff fjord view",
      "Trolltunga Norway rock tongue cliff view",
      "Lofoten Islands red cabin beach Norway",
      "Bryggen wharf Bergen Norway colorful wood",
      "Nærøyfjord Norway narrow fjord steep cliff",
      "Bødalsbreen glacier blue Norway Jostedalsbreen",
      "Seven Sisters waterfall Norway fjord cliff",
      "Kjeragbolten boulder wedge cliff Norway",
    ],
    natural_landscapes: [
      "Norway fjord mountain village reflection water",
      "Norwegian plateau vidda reindeer tundra",
      "Norway mountain hiking autumn color",
      "Svalbard Norway Arctic wilderness polar",
      "Norway forest lake autumn reflection",
      "Hardangerfjord Norway orchard blossom spring",
    ],
    winter_arctic: [
      "Northern Lights aurora Norway green sky snow",
      "Norway dog sled husky snow winter",
      "Tromsø Norway aurora city winter",
      "Norway ice hotel Arctic snow winter",
      "Svalbard polar bear Norway snow",
      "Norway midnight sun summer Arctic",
    ],
    coastal_marine: [
      "Lofoten Islands fishing village Norway coast",
      "Norwegian fjord cruise boat misty",
      "Norway rocky coast lighthouse storm Atlantic",
      "Norway cod fishing village Norway coast",
    ],
    wildlife_fauna: [
      "Norway reindeer Svalbard arctic snow",
      "Norwegian moose forest Norway Norway",
      "Norway Arctic fox Svalbard white",
      "Norway walrus Svalbard coast ice",
    ],
    architecture: [
      "Norwegian stave church ancient wood dark",
      "Norway Bergen wooden wharf colorful",
      "Norwegian log cabin forest Norway winter",
      "Norway modern Oslo glass architecture",
    ],
    aerial_panoramic: [
      "Norway fjord aerial serpentine water cliff",
      "Lofoten Norway aerial island bay mountain",
    ],
    food_market: [
      "Bergen fish market Norway fresh seafood",
      "Norway cloudberry Nordic nature berry",
      "Norway rakfisk fermented trout traditional",
      "Oslo Norway Mathallen food hall modern",
    ],
    luxury_premium: [
      "Norway fjord luxury cabin glass mountain view",
      "Norway private fjord cruise yacht silent",
    ],
    adventure_extreme: [
      "Norway kayak fjord cliff paddle",
      "Norway hiking trail mountain ridge summer",
      "Norway ski Norway mountain slope winter",
      "Norway kayak fjord cliff midnight sun paddle",
      "Norway via ferrata climb cliff wall steel",
    ],
    vegetation_flora: [
      "Norway birch forest autumn gold reflection lake",
      "Norway moss rock forest green Norway",
      "Norway Arctic tundra lichen carpet colorful",
    ],
    transportation_iconic: [
      "Norway Flam railway mountain train scenic",
      "Norway Hurtigruten coastal express ship",
      "Norway ferry fjord village connection",
    ],
    cinematic_atmosphere: [
      "Norway fjord morning fog dramatic silence",
      "Norway aurora reflection fjord water night",
      "Norway midnight sun August golden pink sky",
      "Norway snow-capped peak dramatic cloud",
    ],
    seasonal_spectacle: [
      "Norway cherry blossom Hardanger spring pink",
      "Norway autumn birch reflection lake gold",
      "Norway midnight sun summer Arctic June",
    ],
    festival_celebration: [
      "Norway Constitution Day 17 Mai Oslo parade",
      "Norway Bergen Fish Market festival summer",
    ],
  },

  greece: {
    landmarks: [
      "Santorini blue dome white church caldera view Greece",
      "Acropolis Parthenon hill Athens ancient Greece",
      "Oia Santorini sunset cliff white village Greece",
      "Mykonos windmill white-washed island Greece",
      "Rhodes medieval walled city cobblestone Greece",
      "Meteora monastery cliff rock pinnacle Greece",
      "Delphi ancient Oracle temple Greece",
      "Lindos castle cliff Rhodes Greece",
      "Navagio shipwreck beach Zakynthos Greece",
      "Athens Panathenaic stadium marble Greece",
    ],
    natural_landscapes: [
      "Greece island turquoise water rocky coast",
      "Cycladic landscape white village blue shutter",
      "Greece olive grove landscape dry hills",
      "Epirus mountains canyon Vikos Greece",
      "Greek island volcanic black rock shore",
      "Pindus mountains forest river Greece",
    ],
    coastal_marine: [
      "Greek turquoise crystal bay summer",
      "Cyclades island sea ferry Greece",
      "Corfu cove emerald green sea Greece",
      "Greece pebble beach clear sea summer",
      "Greek island harbour colourful boat",
      "Kefalonia Myrtos Beach cliff Greece turquoise",
    ],
    ancient_ruins: [
      "Acropolis temple column marble Athens Greece",
      "Delphi theatre ancient hillside Greece",
      "Olympia ancient gymnasium column Greece",
      "Knossos palace Crete fresco Greece",
      "Corinth ancient Greek column ruin",
      "Ephesus library ruin Turkey Greek heritage",
    ],
    architecture: [
      "Cycladic white cube house blue shutter Greece",
      "Santorini cave house cliff carved Greece",
      "Chora whitewashed lane narrow Greece",
      "Greek Orthodox church blue dome island",
      "Venetian fortress Greece coast medieval",
    ],
    cultural_traditional: [
      "Greek Orthodox Easter ceremony candle Greece",
      "traditional Greek taverna outdoor dining",
      "Greek fisherman nets harbour morning",
      "blue-painted wall Greece alley flower pot",
      "Greece wedding dance celebration outdoor",
    ],
    food_market: [
      "Greek mezze platter feta olive tzatziki",
      "Athens Central Market fresh produce Greece",
      "Greek souvlaki street food lamb Greece",
      "Athenian café frappé outdoor Greece",
    ],
    cinematic_atmosphere: [
      "Santorini golden sunset dramatic caldera Greece",
      "Greece dawn white village pink sky",
      "Greece fog valley Meteora monastery dramatic",
    ],
    aerial_panoramic: [
      "Santorini aerial white village caldera Greece",
      "Greece island aerial turquoise water bay",
    ],
    nightlife_urban: [
      "Athens Monastiraki square night Greece",
      "Mykonos party beach bar Greece night",
      "Greece island outdoor bar sunset cliff",
      "Thessaloniki Ladadika bar district Greece",
      "Athens rooftop bar Acropolis view night",
    ],
    luxury_premium: [
      "Santorini infinity pool caldera sea Greece",
      "Greece boutique cave hotel cliff suite",
      "Mykonos luxury villa private pool blue sea",
      "Greece yacht charter island sunset cruise",
      "Santorini honeymoon terrace sunset candles",
    ],
    adventure_extreme: [
      "Greece sea kayak sea cave island coast",
      "Crete Samaria Gorge hike narrow canyon",
      "Greece cliff jump blue water summer",
      "Zagori gorge hike stone arch bridge Greece",
      "Greece kite surfing Paros wind island",
    ],
    vegetation_flora: [
      "Greece bougainvillea pink wall white alley",
      "olive grove Greece silvery-green leaf Crete",
      "Greece wildflower spring hillside Aegean",
      "cypress tree Greece Ionian island green",
      "Greece lemon orange grove orchard island",
    ],
    spiritual_religious: [
      "Meteora monastery cliff orthodox Greece",
      "Greece orthodox chapel tiny blue dome rock",
      "Mount Athos monastery peninsula Greece orthodox",
      "Greece candle liturgy Easter orthodox ceremony",
    ],
    festival_celebration: [
      "Greece carnival Apokries colourful Greece",
      "Athens Carnival float parade celebration",
      "Greece Easter fireworks church midnight orthodox",
      "Thessaloniki film festival autumn Greece",
    ],
    transportation_iconic: [
      "Greece ferry white ship island blue Aegean",
      "Santorini cable car caldera descent Greece",
      "Greece donkey cobblestone path island",
      "Athens tram coast Piraeus Greece",
    ],
    seasonal_spectacle: [
      "Greece blue sea summer August midday heat",
      "Greece almond blossom spring pink hillside",
      "Santorini sunset orange sky October Greece",
      "Greece snow mountain Pindos winter quiet",
    ],
    urban_environment: [
      "Athens Syntagma square monument Greece",
      "Athens Plaka neighbourhood old town Greece",
      "Thessaloniki White Tower waterfront Greece",
      "Athens graffiti urban street art Exarcheia",
    ],
  },

  // ════════════════════════════ MEDITERRANEAN / MIDDLE EAST ═══════════════════

  morocco: {
    landmarks: [
      "Chefchaouen blue painted alley walls Morocco",
      "Sahara desert golden dunes camel Morocco",
      "Hassan II Mosque Casablanca ocean Morocco",
      "Ait Ben Haddou kasbah mud-brick Morocco",
      "Marrakech Jemaa el-Fna square crowd Morocco",
      "Fes el Bali medina leather tannery Morocco",
      "Todra Gorge canyon cliff Morocco",
      "Koutoubia minaret Marrakech mosque Morocco",
    ],
    desert_arid: [
      "Sahara desert Morocco rolling dunes sunrise",
      "Erg Chebbi Morocco camel trek sunset",
      "Morocco desert camp nomad stars night",
      "Sahara Morocco 4x4 dune bashing",
      "Merzouga Morocco golden sand dunes",
      "Morocco wadi dry riverbed canyon cliff",
      "Draa Valley Morocco palm oasis desert",
      "Morocco desert rock plateau barren",
    ],
    natural_landscapes: [
      "Atlas Mountains Morocco Berber village snow",
      "Morocco Anti-Atlas mountains barren landscape",
      "Morocco cedar forest Azrou Barbary macaque",
      "Todra Gorge Morocco narrow canyon rock",
    ],
    architecture: [
      "Moroccan riad courtyard fountain tile zellige",
      "Morocco Islamic geometric tile mosaic",
      "Morocco ornate carved plaster stucco wall",
      "fez tannery colorful vat dye leather Morocco",
      "Moroccan wooden carved cedar door intricate",
      "Morocco adobe mud-brick ksar desert",
    ],
    cultural_traditional: [
      "Morocco souk market textile color vibrant",
      "Moroccan spice market jars colorful",
      "Morocco hammam bath traditional tile",
      "Morocco Berber woman traditional dress",
      "Morocco musician Gnawa blue robe Marrakech",
      "Morocco mint tea silver pot traditional",
    ],
    spiritual_religious: [
      "Morocco mosque minaret call to prayer",
      "Moroccan medersa theological school ornate",
      "Fes Al-Qarawiyyin mosque Morocco ancient",
    ],
    food_market: [
      "Morocco tagine clay pot slow food",
      "Marrakech street food cooked stall Morocco",
      "Moroccan couscous Friday family dish",
      "Morocco orange juice street cart Marrakech",
    ],
    cinematic_atmosphere: [
      "Morocco golden sunset mud-brick village",
      "Chefchaouen blue alley cat Morocco",
      "Morocco Sahara starry night clear sky",
      "Morocco Atlas Mountains fog dramatic morning",
      "Morocco lantern riad courtyard dusk amber",
    ],
    aerial_panoramic: [
      "Morocco aerial Sahara dunes shadow pattern",
      "Marrakech aerial medina dense rooftops Morocco",
      "Morocco aerial Chefchaouen blue hillside village",
      "Ait Ben Haddou aerial kasbah cliff Morocco",
    ],
    luxury_premium: [
      "Morocco luxury riad Marrakech rooftop pool tile",
      "Morocco desert luxury camp Sahara glamping",
      "Marrakech boutique riad zellige courtyard fountain",
      "Morocco private Atlas lodge mountain view",
    ],
    adventure_extreme: [
      "Morocco Sahara camel trek sunrise dunes",
      "Morocco Atlas Mountains hiking High Atlas trail",
      "Morocco Toubkal summit snow peak High Atlas",
      "Morocco off-road 4x4 sand dune desert",
      "Morocco surf Atlantic coast Taghazout wave",
    ],
    vegetation_flora: [
      "Morocco argan tree Sous valley terraced",
      "Draa Valley Morocco palm grove oasis green",
      "Morocco rose valley Dades gorge flower bloom",
      "Morocco cedar forest Barbary macaque tree",
    ],
    transportation_iconic: [
      "Morocco camel caravan Sahara silhouette sunset",
      "Marrakech horse-drawn carriage medina Morocco",
      "Morocco Marrakech railway station travel",
      "Morocco donkey load medina narrow passage",
    ],
    festival_celebration: [
      "Morocco Imilchil wedding festival Berber Atlas",
      "Marrakech Gnawa music festival Jemaa el-Fna",
      "Morocco Fes Festival World Sacred Music",
      "Morocco Ramadan lantern decorated street",
    ],
    nightlife_urban: [
      "Marrakech rooftop bar Koutoubia minaret view",
      "Morocco Mellah Jewish quarter Fes night",
      "Essaouira seafront Morocco evening stroll",
    ],
    urban_environment: [
      "Marrakech medina souks narrow lane Morocco",
      "Casablanca Art Deco boulevard Morocco modern",
      "Rabat Kasbah des Oudaias blue white Morocco",
      "Fes Al-Bali ancient medina UNESCO Morocco",
    ],
    water_features: [
      "Morocco Ouzoud waterfall cascade red rock",
      "Morocco Akchour waterfall forest river",
      "Ourika valley Morocco river mountain stream",
    ],
  },

  egypt: {
    landmarks: [
      "Pyramids of Giza Egypt desert ancient wonder",
      "Great Sphinx Egypt limestone plateau",
      "Luxor Temple columns night Egypt",
      "Abu Simbel rock temple Egypt Ramesses",
      "Valley of the Kings Luxor Egypt tomb",
      "Karnak temple hypostyle hall column Egypt",
      "Nile River felucca sailboat Egypt sunset",
      "Philae temple island Aswan Egypt",
      "Egyptian Museum Cairo mummy sarcophagus",
    ],
    desert_arid: [
      "Egypt Sahara desert sand dune golden",
      "Egypt Western Desert White Desert chalk",
      "Sinai Peninsula desert mountain Egypt",
      "Egypt oasis palm tree water desert",
      "Egypt camel caravan Sahara trail",
      "Egypt dry canyon Wadi Rum style",
    ],
    ancient_ruins: [
      "Pharaonic column hieroglyph Egypt ancient",
      "Egypt ancient wall relief carving painted",
      "Egypt pyramid interior chamber passage",
      "Cairo Coptic church ancient Egypt",
      "Egypt Roman era ruin Luxor ancient",
      "Dendera temple ceiling zodiac Egypt",
    ],
    coastal_marine: [
      "Red Sea coral reef Egypt snorkel clear",
      "Sharm el-Sheikh Egypt beach dive resort",
      "Dahab Blue Hole Egypt diving cliff",
      "Egypt Red Sea turquoise coral colorful fish",
    ],
    cultural_traditional: [
      "Egypt Nubian village colorful painted house",
      "Cairo Khan el-Khalili souk Egypt market",
      "Egypt galabiya traditional robe man",
      "Egypt sound light show Pyramids night",
    ],
    food_market: [
      "Egypt ful medames bean breakfast dish",
      "Cairo koshary rice lentil street Egypt",
      "Egypt fresh mango juice vendor Cairo",
    ],
    water_features: [
      "Nile River Egypt green banks narrow",
      "Aswan Nile Egypt felucca sail evening",
    ],
    aerial_panoramic: [
      "Egypt Pyramids aerial desert plateau Giza",
      "Luxor Egypt aerial Nile green strip",
    ],
  },

  jordan: {
    landmarks: [
      "Petra Treasury Al-Khazneh rose rock Jordan",
      "Petra siq narrow gorge sandstone Jordan",
      "Wadi Rum red desert valley Jordan",
      "Dead Sea salt float Jordan shore",
      "Jerash Roman ruins colonnaded street Jordan",
      "Amman citadel Roman temple column Jordan",
      "Wadi Mujib gorge canyon canyon Jordan",
      "Aqaba Red Sea Jordan reef dive",
    ],
    desert_arid: [
      "Wadi Rum Jordan red sand dune desert",
      "Jordan Bedouin camp desert fire night stars",
      "Jordan desert red rock arch erosion",
      "Jordan 4x4 desert off-road adventure",
      "Wadi Rum Jordan Lawrence of Arabia",
    ],
    ancient_ruins: [
      "Petra carved rock tomb facade Jordan",
      "Jerash colonnaded cardo Jordan Roman",
      "Jordan Umayyad palace desert ancient",
      "Madaba mosaic map Byzantine Jordan church",
    ],
    cultural_traditional: [
      "Jordan Bedouin traditional tent hospitality",
      "Jordan traditional coffee cardamom bitter",
      "Jordan keffiyeh scarf man traditional",
    ],
    natural_landscapes: [
      "Dead Sea salt crystal shore Jordan extreme",
      "Jordan Dana nature reserve valley",
      "Jordan Rift Valley dramatic geological",
    ],
    aerial_panoramic: [
      "Wadi Rum Jordan aerial red desert dunes",
      "Petra Jordan aerial canyon valley aerial",
    ],
    food_market: [
      "Jordan mansaf lamb rice traditional",
      "Amman falafel street vendor Jordan",
      "Jordan mezze hummus flatbread table",
      "Aqaba Jordan seafood Red Sea fresh",
    ],
    cinematic_atmosphere: [
      "Petra Jordan Al-Khazneh facade torch night candlelit",
      "Wadi Rum Jordan dusk red rock star sky",
      "Jordan Dead Sea salt crystal float sunrise",
      "Petra Jordan siq narrow light beam dramatic",
    ],
    adventure_extreme: [
      "Jordan Wadi Rum rock climbing sandstone",
      "Jordan Dana reserve hiking trail canyon",
      "Petra Jordan trek monastery Ad Deir hike",
      "Jordan Wadi Mujib canyon slot water wade",
    ],
    coastal_marine: [
      "Aqaba Jordan Red Sea coral reef dive",
      "Jordan Red Sea snorkel colorful fish",
    ],
    luxury_premium: [
      "Wadi Rum Jordan luxury bubble tent star",
      "Jordan Dead Sea luxury spa resort float",
      "Petra Jordan boutique cave hotel",
    ],
    seasonal_spectacle: [
      "Petra Jordan night candlelit starlight ceremony",
      "Jordan spring wildflower Ajloun forest bloom",
    ],
    spiritual_religious: [
      "Jordan Mount Nebo Moses view Israel",
      "Baptism Site Bethany Jordan Jesus site",
    ],
  },

  // ═════════════════════════════════ GULF ═════════════════════════════════════

  dubai: {
    landmarks: [
      "Burj Khalifa skyscraper Dubai night glowing",
      "Burj Al Arab sail hotel Dubai beach",
      "Palm Jumeirah artificial island aerial Dubai",
      "Dubai Frame gold skyline monument",
      "Sheikh Zayed Grand Mosque white dome Abu Dhabi",
      "Dubai Marina towers reflection water yacht",
      "Museum of the Future Dubai metallic torus",
      "Dubai Mall indoor fountain waterfall",
    ],
    urban_environment: [
      "Dubai skyline glass towers dusk reflection",
      "Downtown Dubai skyscraper canyon street",
      "Dubai JBR walk beach tower promenade",
      "Dubai golden sunset desert skyline",
      "Dubai luxury car supercar street",
      "Dubai mall indoor snow ski slope",
    ],
    desert_arid: [
      "Dubai desert golden dunes 4x4 sunset Arabia",
      "UAE camel trek desert sand Dubai",
      "Dubai desert safari camp fire night stars",
      "Liwa oasis dune UAE vast sand",
    ],
    luxury_premium: [
      "Dubai luxury infinity pool skyscraper view",
      "Dubai 7-star hotel opulent interior",
      "Dubai yacht marina luxury evening",
      "Dubai gold souk jewelry traditional",
      "Abu Dhabi Ferrari World indoor theme park",
    ],
    architecture: [
      "Dubai futuristic twisting tower glass",
      "Dubai Islamic geometric tile pattern mosque",
      "Sheikh Zayed Mosque interior white marble",
      "Dubai old quarter wind-tower barjeel",
    ],
    cultural_traditional: [
      "Dubai Al Fahidi old town heritage quarter",
      "UAE falcon handler traditional Arabia",
      "Dubai traditional abra boat creek crossing",
    ],
    food_market: [
      "Dubai spice souk traditional market UAE",
      "Dubai Michelin restaurant view Burj Khalifa",
      "UAE arabic coffee dallah pot dates",
    ],
    aerial_panoramic: [
      "Dubai aerial Palm Jumeirah island shape",
      "Dubai skyline aerial glass city Arabian Gulf",
    ],
    nightlife_urban: [
      "Dubai rooftop bar night skyline Burj glowing",
      "Dubai downtown night fountain show lights",
    ],
  },

  turkey: {
    landmarks: [
      "Cappadocia hot air balloon sunrise rock Turkey",
      "Hagia Sophia dome Istanbul golden interior Turkey",
      "Blue Mosque six minarets Istanbul Turkey",
      "Ephesus library Celsus ancient ruin Turkey",
      "Pamukkale white travertine terraces Turkey",
      "Topkapi Palace Istanbul Ottoman Turkey",
      "Galata Tower Istanbul medieval stone Turkey",
      "Bosphorus bridge Istanbul suspension Turkey",
      "Göreme fairy chimney rock Turkey",
    ],
    natural_landscapes: [
      "Cappadocia fairy chimney rock valley Turkey",
      "Turkey Taurus mountains cedar forest",
      "Phrygian Valley Turkey volcanic rock art",
      "Turkey Lake Van high altitude plateau",
      "Turkish coast Aegean turquoise cliff",
    ],
    coastal_marine: [
      "Turkey turquoise coast gulet boat Aegean",
      "Ölüdeniz blue lagoon Turkey beach",
      "Turkey cliff bay Aegean summer dive",
      "Antalya old harbour Roman wall Turkey coast",
    ],
    ancient_ruins: [
      "Ephesus marble colonnaded street Turkey ancient",
      "Troy ruins excavation Turkey ancient",
      "Nemrut Dağ giant heads mountain Turkey",
      "Aspendos Roman theatre Turkey ancient",
      "Pergamon acropolis column Turkey ancient",
    ],
    cultural_traditional: [
      "Istanbul Grand Bazaar covered market Turkey",
      "Turkey Turkish tea glass tulip-shaped",
      "whirling dervish Sufi ceremony Turkey",
      "Turkey hammam bath traditional marble",
      "Istanbul Spice Bazaar vivid colour Turkey",
    ],
    volcanic_geothermal: [
      "Pamukkale terraces white calcium carbonate Turkey",
      "Turkey hot spring thermal pool turquoise",
    ],
    food_market: [
      "Turkey kebab grilled skewer bread market",
      "Istanbul street corn mussels vendor Turkey",
      "Turkish baklava sweet pastry pistachio",
    ],
    aerial_panoramic: [
      "Cappadocia balloon aerial valley Turkey",
      "Istanbul aerial Bosphorus strait Turkey",
      "Turkey aerial Pamukkale white terrace mineral",
      "Cappadocia aerial dawn dozens balloon sky Turkey",
    ],
    nightlife_urban: [
      "Istanbul Bosphorus waterfront evening Turkey",
      "Turkey Bodrum nightlife terrace summer sea",
      "Istanbul Taksim square night crowds Turkey",
      "Turkey Karakoy district bar waterfront Istanbul",
    ],
    cinematic_atmosphere: [
      "Cappadocia balloon golden glow sunrise Turkey",
      "Istanbul Bosphorus fog morning bridge Turkey",
      "Turkey Cappadocia fairy chimney dusk silhouette",
      "Istanbul golden horn sunset dome minaret Turkey",
      "Turkey ancient ruins column dusk orange sky",
    ],
    luxury_premium: [
      "Turkey cave hotel Cappadocia luxury suite",
      "Istanbul luxury Bosphorus-view hotel suite",
      "Turkey yacht Aegean turquoise private gulet",
      "Cappadocia private balloon sunrise champagne",
    ],
    adventure_extreme: [
      "Turkey Cappadocia hot air balloon ride sunrise",
      "Turkey Taurus mountains trekking trail forest",
      "Turkey Ölüdeniz paragliding cliff sea launch",
      "Turkey whitewater rafting Köprülü Canyon",
      "Turkey sea cave dive Aegean coast",
    ],
    vegetation_flora: [
      "Turkey Pamukkale thermal pool travertine white",
      "Turkey tulip Istanbul spring garden bloom",
      "Turkey cherry blossom valley Cappadocia spring",
      "Turkey lavender field Isparta summer purple",
    ],
    spiritual_religious: [
      "Hagia Sophia interior dome mosaic Istanbul",
      "Turkey Blue Mosque interior carpet tile Istanbul",
      "Turkey dervish ceremony Konya spiritual",
      "Turkey Mount Nemrut giant head goddess sunset",
    ],
    festival_celebration: [
      "Turkey Istanbul Tulip Festival Emirgan spring",
      "Turkey Oil Wrestling Kirkpinar festival",
      "Turkey Ramadan iftar lantern Istanbul street",
      "Turkey Camel wrestling Selçuk festival",
    ],
    transportation_iconic: [
      "Istanbul Bosphorus ferry crossing strait Turkey",
      "Turkey Orient Express Istanbul vintage train",
      "Istanbul Grand Bazaar covered archway Turkey",
      "Turkey tram Istiklal street Istanbul",
    ],
    urban_environment: [
      "Istanbul old city Sultanahmet Ottoman Turkey",
      "Istanbul modern Karaköy district art Turkey",
      "Ankara Turkish capital boulevard modern Turkey",
      "Izmir waterfront kordon Turkey Aegean city",
    ],
    seasonal_spectacle: [
      "Turkey Black Sea mountains snow winter",
      "Turkey spring wildflower Aegean coast",
      "Turkey autumn Cappadocia gold foliage valley",
    ],
  },

  spain: {
    landmarks: [
      "Sagrada Família Barcelona Gaudí cathedral spire Spain",
      "Alhambra Granada Moorish palace garden Spain",
      "Park Güell mosaic terrace Barcelona Spain",
      "Seville Cathedral Giralda tower Spain",
      "Montserrat mountain monastery Catalonia Spain",
      "Toledo medieval hilltop city Spain",
      "Mezquita Córdoba mosque forest columns Spain",
      "Camino de Santiago pilgrimage trail Spain",
      "Picos de Europa mountain Spain Asturias",
    ],
    urban_environment: [
      "Barcelona La Rambla boulevard Spain",
      "Madrid Gran Vía street Spain evening",
      "Seville Triana quarter Spain evening",
      "Valencia futuristic City Arts Sciences Spain",
      "Spain plaza mayor arcaded square village",
    ],
    coastal_marine: [
      "San Sebastián bay beach Spain Basque",
      "Ibiza beach bar sunset Spain island",
      "Costa Brava cliff cove turquoise Spain",
      "Mallorca turquoise cove Spain limestone",
      "Canary Islands beach volcanic Spain",
    ],
    cultural_traditional: [
      "flamenco dancer red dress Seville Spain",
      "Running of the Bulls Pamplona Spain",
      "Spain paella rice seafood Valencia",
      "La Tomatina tomato festival Spain",
      "Spain feria festival Seville colourful dress",
    ],
    architecture: [
      "Gaudí organic architecture Barcelona Spain",
      "Andalusia whitewashed village Spain hillside",
      "Spain Moorish arched window geometric tile",
      "Salamanca sandstone university facade Spain",
      "Bilbao Guggenheim titanium curves Spain",
    ],
    food_market: [
      "Spain tapas bar ham jamón counter",
      "Barcelona Boqueria market colour Spain",
      "Spain churros chocolate dipping morning",
      "pintxos Basque bar counter Spain",
    ],
    nightlife_urban: [
      "Barcelona nightlife Barceloneta beach Spain night",
      "Madrid bar crawl tapas night Spain",
      "Ibiza DJ electronic music outdoor Spain night",
    ],
    ancient_ruins: [
      "Segovia Roman aqueduct Spain ancient",
      "Mérida Roman theatre Spain ancient",
      "Tarragona Roman amphitheatre Spain coast",
      "Italica Roman ruins Seville Spain ancient",
    ],
    aerial_panoramic: [
      "Barcelona aerial Eixample grid Spain",
      "Spain Andalusia aerial white village hill",
      "Spain aerial Sahara dunes Canary Islands",
      "Mallorca aerial turquoise cove Spain",
    ],
    cinematic_atmosphere: [
      "Spain Alhambra interior Moorish arch golden Spain",
      "Andalusia whitewashed village golden hour Spain",
      "Barcelona Sagrada Familia interior light stained glass",
      "Spain Meseta plateau dusk road Castile",
      "Seville flamenco narrow lane night dramatic Spain",
    ],
    luxury_premium: [
      "Barcelona luxury hotel rooftop pool Spain",
      "Marbella luxury resort pool Costa del Sol Spain",
      "Spain parador castle heritage luxury",
      "Ibiza luxury yacht sunset Mediterranean Spain",
    ],
    adventure_extreme: [
      "Spain Pyrenees skiing mountain winter resort",
      "Spain Canary Islands surfing Tenerife Atlantic",
      "Spain rock climbing Montserrat limestone Spain",
      "Spain trail running Picos de Europa Asturias",
      "Spain kite surfing Tarifa wind Atlantic",
    ],
    vegetation_flora: [
      "Spain orange blossom Seville April scent",
      "Spain almond blossom Mallorca February pink",
      "Andalusia sunflower field summer Cordoba Spain",
      "Spain cork oak forest Extremadura landscape",
      "Spain lavender Brihuega Guadalajara field purple",
    ],
    festival_celebration: [
      "Spain La Feria de Abril Seville April dress",
      "Spain Las Fallas Valencia fire March float",
      "Spain Running of the Bulls Pamplona July",
      "Spain Semana Santa procession Easter Seville",
      "Spain Moros y Cristianos Alcoy festival",
    ],
    transportation_iconic: [
      "Spain AVE high-speed train station modern",
      "Seville electric bike historic quarter Spain",
      "Barcelona metro design modernist station Spain",
      "Spain coastal road Catalonia sea cliff drive",
    ],
    spiritual_religious: [
      "Santiago de Compostela cathedral pilgrim Spain",
      "Spain Holy Week procession Semana Santa",
      "Mezquita Córdoba interior forest columns Spain",
      "Barcelona Sagrada Família Gaudí interior light",
    ],
    seasonal_spectacle: [
      "Spain summer Ibiza Mediterranean turquoise July",
      "Spain autumn Pyrenees foliage orange",
      "Spain spring wildflower Extremadura meadow",
      "Canary Islands Spain winter warm escape January",
    ],
  },

  portugal: {
    landmarks: [
      "Lisbon Belém Tower Tagus river Portugal",
      "Sintra palace colorful hill Portugal",
      "Pena Palace Sintra romantic hill Portugal",
      "Jerónimos Monastery Manueline Portugal",
      "Douro Valley terraced vineyard river Portugal",
      "Algarve golden arch cliff sea Portugal",
      "Porto Ribeira colorful houses Douro Portugal",
      "Roque de Santo António yellow building Porto",
    ],
    coastal_marine: [
      "Algarve sea arch cliff golden Portugal",
      "Nazaré giant wave surf Portugal Atlantic",
      "Sagres Cape SW Portugal cliff Atlantic",
      "Portugal Alentejo coast dune natural reserve",
      "Cascais Portugal coast town Atlantic",
    ],
    urban_environment: [
      "Lisbon tram yellow hills Portugal",
      "Alfama district Lisbon fado Portugal",
      "Porto azulejo blue tile building Portugal",
      "Lisbon viewpoint miradouro city view Portugal",
    ],
    cultural_traditional: [
      "fado music Portugal melancholy guitar Lisbon",
      "Portugal rooster luck symbol Barcelos",
      "Portugal pastel de nata egg tart Belém",
      "Lisbon street guitar blue tile Portugal",
      "Portugal Arraiolos hand-stitched wool rug",
      "Portugal Viana do Castelo gold filigree jewellery",
    ],
    natural_landscapes: [
      "Douro Valley terraced vineyard Portugal autumn",
      "Peneda-Gerês national park Portugal waterfall",
      "Portugal Alentejo cork oak tree plain",
    ],
    food_market: [
      "Portugal bacalhau salt cod traditional dish",
      "Lisbon mercado food hall Portugal",
      "Portuguese wine glass Douro Portugal",
    ],
    aerial_panoramic: [
      "Porto aerial Douro river bridge Portugal",
      "Sintra aerial forest palace Portugal",
      "Algarve Portugal aerial golden arch cliff",
      "Lisbon Portugal aerial miradouro hills river",
    ],
    cinematic_atmosphere: [
      "Lisbon Portugal tram yellow sunset Alfama hill",
      "Porto Portugal wine cellar barrel dusk golden",
      "Douro Valley Portugal dawn mist vineyard river",
      "Algarve Portugal sunset golden arch sea dramatic",
    ],
    adventure_extreme: [
      "Portugal Nazaré giant wave surf record Atlantic",
      "Portugal Sintra trail cycling Serra hills",
      "Portugal Algarve kayak sea cave cliff arch",
      "Portugal Alentejo horse riding cork oak plain",
    ],
    nightlife_urban: [
      "Lisbon Portugal Bairro Alto bar night lane",
      "Porto Portugal wine bar Sandeman cellar tasting",
      "Lisbon LX Factory weekend market hipster Portugal",
    ],
    luxury_premium: [
      "Douro Valley Portugal luxury quinta wine estate",
      "Algarve Portugal resort cliff ocean view",
      "Lisbon Portugal luxury Bairro Alto Hotel",
    ],
    architecture: [
      "Portugal azulejo blue tile train station Porto",
      "Sintra Portugal Moorish castle ruin hilltop",
      "Portugal Manueline ornate stone arch Belém",
    ],
    vegetation_flora: [
      "Portugal Alentejo cork oak silvery bark forest",
      "Madeira island Portugal tropical garden bloom",
      "Portugal almond blossom Algarve February pink",
    ],
    spiritual_religious: [
      "Fatima Portugal pilgrimage basilica Catholic",
      "Portugal monastery Batalha Gothic carved stone",
      "Porto Clérigos tower Porto baroque Portugal",
    ],
    seasonal_spectacle: [
      "Portugal summer Algarve beach August blue sea",
      "Portugal spring Alentejo wildflower plain",
      "Madeira Portugal Carnival February floral float",
    ],
    transportation_iconic: [
      "Lisbon Portugal yellow tram 28 Alfama hill",
      "Porto Portugal Dom Luís bridge iron arch",
    ],
    festival_celebration: [
      "Lisbon Portugal Santo António festival June",
      "Portugal Semana Santa Braga procession Easter",
    ],
    winter_arctic: [
      "Portugal Madeira Christmas lantern festive mild",
    ],
  },

  croatia: {
    landmarks: [
      "Dubrovnik old town walls sea Croatia",
      "Plitvice Lakes waterfall turquoise Croatia",
      "Diocletian's Palace Split Croatia ancient",
      "Rovinec old town peninsula Croatia",
      "Hvar harbour lavender Croatia island",
      "Krka National Park waterfall Croatia",
    ],
    coastal_marine: [
      "Croatia Adriatic turquoise bay sailing",
      "Dalmatian coast cliff island Croatia summer",
      "Croatia catamaran sailing Adriatic blue",
      "Hvar Island turquoise bay Croatia",
      "Vis island cove Croatia boat swim",
    ],
    architecture: [
      "Dubrovnik orange rooftop Baroque wall Croatia",
      "Croatia Venetian Gothic tower coastal town",
      "Split Roman Diocletian columns Croatia",
    ],
    water_features: [
      "Plitvice Lakes Croatia layered turquoise terraces",
      "Croatia waterfall wooden walkway lake",
    ],
    ancient_ruins: [
      "Split Diocletian Palace ancient Roman Croatia",
      "Pula Roman amphitheater Croatia arena",
    ],
    food_market: [
      "Croatia truffle Istria black white shaved",
      "Dalmatian fresh fish grill Croatia outdoor",
      "Croatia peka slow-cooked lamb bell dome",
      "Croatia Pelješac oyster Ston shell fresh",
    ],
    aerial_panoramic: [
      "Dubrovnik walls aerial Adriatic Croatia",
      "Croatia island aerial Adriatic archipelago",
      "Plitvice Lakes Croatia aerial turquoise tiers",
    ],
    cinematic_atmosphere: [
      "Dubrovnik Croatia sunset orange Adriatic dramatic",
      "Plitvice Lakes Croatia mist waterfall morning",
      "Croatia lavender field Hvar summer purple",
    ],
    adventure_extreme: [
      "Croatia sea kayaking Dubrovnik old town walls",
      "Croatia zip-line Omis canyon river split",
      "Croatia cliff jumping Dalmatia cove blue",
      "Plitvice Croatia hiking trail lake boardwalk",
    ],
    luxury_premium: [
      "Croatia Hvar luxury yacht charter Adriatic",
      "Dubrovnik Croatia boutique hotel old town view",
    ],
    nightlife_urban: [
      "Hvar Croatia nightlife beach bar summer party",
      "Split Croatia Diocletian Palace bar night",
    ],
    cultural_traditional: [
      "Croatia Dubrovnik Game of Thrones location",
      "Croatia Moreška sword dance Korčula island",
    ],
    vegetation_flora: [
      "Croatia Hvar lavender purple field island",
      "Croatia Istria olive grove truffle oak forest",
    ],
    seasonal_spectacle: [
      "Croatia summer Adriatic turquoise July August",
      "Croatia Dubrovnik winter quiet December stone",
      "Croatia Plitvice autumn golden waterfall October",
    ],
    spiritual_religious: [
      "Dubrovnik Croatia Franciscan monastery old town",
      "Split Croatia Cathedral of St Domnius Roman tomb",
    ],
    transportation_iconic: [
      "Croatia ferry island hopping Adriatic white boat",
      "Dubrovnik Croatia cable car fort Lovrijenac view",
    ],
    festival_celebration: [
      "Dubrovnik Summer Festival Croatia outdoor theatre",
      "Split Croatia Ultra music festival beach summer",
      "Croatia Moreška sword dance Korčula July",
    ],
    urban_environment: [
      "Split Croatia Riva promenade harbour café",
      "Dubrovnik Croatia Stradun main street pedestrian",
      "Zagreb Croatia Dolac market colourful stalls",
    ],
  },

  // ═════════════════════════════════ AFRICA ══════════════════════════════════

  kenya: {
    landmarks: [
      "Maasai Mara wildebeest migration river crossing Kenya",
      "Mount Kenya snow peak Africa equatorial",
      "Maasai warrior red shuka spear Kenya",
      "Amboseli elephant Kilimanjaro Kenya background",
      "Nairobi National Park giraffe skyline Kenya",
    ],
    wildlife_fauna: [
      "lion pride savanna grass Kenya golden hour",
      "elephant herd Kenya acacia tree dust",
      "cheetah running open Kenya savanna",
      "giraffe acacia tree Kenya dry landscape",
      "leopard tree Kenya spotted resting",
      "wildebeest crossing Mara river Kenya crocodile",
      "zebra herd Kenya grassland stripe",
      "hippo pool Kenya river submerged",
      "Kenya rhino black endangered grass",
      "African wild dog Kenya pack",
      "flamingo pink Lake Nakuru Kenya",
      "Kenya baboon troop roadside",
    ],
    natural_landscapes: [
      "Kenya savanna golden grass acacia sunset",
      "Maasai Mara Kenya open plain horizon",
      "Kenya Rift Valley dramatic viewpoint cliff",
      "Amboseli Kenya dust cloud elephant",
    ],
    cultural_traditional: [
      "Maasai Kenya beaded jewellery red shuka",
      "Kenya Maasai jumping ceremony dance",
      "Kenya tribal village traditional hut",
    ],
    aerial_panoramic: [
      "Kenya savanna aerial wildebeest mass",
      "Maasai Mara Kenya hot air balloon sunrise",
    ],
    food_market: [
      "Kenya nyama choma roast meat barbecue",
      "Nairobi market local produce Kenya",
      "Kenya chai tea street vendor Nairobi",
      "Kenya samosa fried snack market stall",
    ],
    cinematic_atmosphere: [
      "Kenya Maasai Mara lion golden hour savanna dramatic",
      "Kenya hot air balloon safari sunrise Mara",
      "Kenya Amboseli elephant Kilimanjaro dust storm",
      "Kenya wildebeest river crossing Mara crocodile",
    ],
    adventure_extreme: [
      "Kenya safari 4x4 open vehicle savanna track",
      "Kenya Mount Kenya glacial peak climbing",
      "Kenya camel trek northern desert frontier",
    ],
    luxury_premium: [
      "Kenya Maasai Mara luxury tented camp sunset",
      "Kenya private conservancy safari exclusive",
      "Kenya Laikipia horseback safari highland",
    ],
    coastal_marine: [
      "Kenya Lamu island coral dhow traditional",
      "Diani Beach Kenya Indian Ocean tropical",
      "Kenya Watamu marine park turtle dive",
    ],
    architecture: [
      "Lamu Kenya old town coral stone UNESCO",
      "Nairobi Kenya modern glass tower CBD",
    ],
    seasonal_spectacle: [
      "Kenya Great Migration wildebeest August crossing",
      "Kenya flamingo Lake Bogoria million pink",
    ],
  },

  tanzania: {
    landmarks: [
      "Mount Kilimanjaro snow summit Africa Tanzania",
      "Serengeti plains wildebeest migration Tanzania",
      "Ngorongoro Crater caldera Tanzania aerial",
      "Zanzibar Stone Town spice market Tanzania",
      "Serengeti Tanzania lion pride rocks",
      "Lake Manyara Tanzania flamingo pink",
    ],
    wildlife_fauna: [
      "Tanzania lion pride Serengeti golden hour",
      "Serengeti Tanzania wildebeest massive herd",
      "Tanzania elephant family Serengeti walk",
      "Tanzania cheetah coalition hunting grass",
      "Ngorongoro Tanzania lion resting mud",
      "Tanzania leopard acacia tree spotted",
      "flamingo Lake Natron Tanzania pink",
      "Tanzania hippo pool open mouth",
      "giraffe silhouette Tanzania sunset acacia",
    ],
    natural_landscapes: [
      "Tanzania Serengeti vast flat horizon",
      "Ngorongoro Crater Tanzania mist morning",
      "Tanzania Kilimanjaro cloud base level",
      "Tanzania Selous reserve river boat",
    ],
    coastal_marine: [
      "Zanzibar beach Tanzania turquoise dhow boat",
      "Tanzania coral reef snorkeling Indian Ocean",
      "Zanzibar dhow wooden boat sunset Tanzania",
    ],
    cultural_traditional: [
      "Zanzibar spice clove Tanzania market",
      "Tanzania Maasai culture warrior dance",
      "Zanzibar narrow alley Stone Town Tanzania",
    ],
    aerial_panoramic: [
      "Serengeti Tanzania aerial migration dust cloud",
      "Ngorongoro Tanzania aerial caldera volcanic",
      "Kilimanjaro Tanzania aerial summit glacier ice",
      "Tanzania Zanzibar aerial turquoise reef coral",
      "Tanzania Selous reserve aerial river bend",
      "Ruaha Tanzania aerial elephant herd river",
    ],
    adventure_extreme: [
      "Mount Kilimanjaro Tanzania summit climb high altitude",
      "Tanzania Serengeti hot air balloon safari sunrise",
      "Zanzibar Tanzania kitesurfing wind Paje beach",
      "Tanzania Mahale Mountains chimpanzee trek forest",
      "Kilimanjaro Tanzania Marangu route porters trail",
      "Tanzania Ruaha rafting river wild hippo danger",
      "Tanzania Ngorongoro rim hike crater edge view",
      "Tanzania Usambara Mountains hiking tea forest",
    ],
    cinematic_atmosphere: [
      "Serengeti Tanzania golden hour wildebeest dust",
      "Tanzania Ngorongoro fog morning caldera mist",
      "Kilimanjaro Tanzania cloud above savanna dramatic",
      "Zanzibar Tanzania dhow sunset silhouette orange",
      "Tanzania acacia tree sunset lone Serengeti",
      "Tanzania Maasai warrior spear sunset silhouette",
      "Tanzania lion pride rocky outcrop dramatic light",
      "Tanzania leopard acacia silhouette golden dusk",
    ],
    luxury_premium: [
      "Tanzania Serengeti luxury tented camp private",
      "Ngorongoro Crater Lodge Tanzania luxury cliff",
      "Zanzibar Tanzania beach hotel luxury overwater",
      "Tanzania private conservancy exclusive safari",
      "Serengeti Tanzania mobile camp migration follow",
      "Tanzania Mnemba Island luxury atoll private beach",
    ],
    food_market: [
      "Zanzibar Tanzania spice tour clove nutmeg farm",
      "Stone Town Tanzania Forodhani night market seafood",
      "Tanzania Maasai fermented milk calabash traditional",
      "Tanzania ugali nyama choma traditional meal",
      "Zanzibar Tanzania pilau rice spice aromatic",
      "Tanzania fresh coconut beach vendor Zanzibar",
    ],
    spiritual_religious: [
      "Stone Town Tanzania Zanzibar Old Fort Arabic",
      "Tanzania mosque minaret Zanzibar stone town",
      "Tanzania Maasai boma ceremony traditional dance",
      "Tanzania Catholic cathedral Dar es Salaam",
    ],
    architecture: [
      "Zanzibar Stone Town Tanzania carved wooden door",
      "Tanzania Arabic house carved coral stone block",
      "Stone Town Zanzibar narrow alley whitewash Tanzania",
      "Tanzania Beit el-Ajaib House of Wonders Palace",
    ],
    transportation_iconic: [
      "Tanzania dhow traditional wooden sailing vessel",
      "Tanzania Serengeti Land Rover open roof game drive",
      "Zanzibar Tanzania dala dala minibus local transport",
      "Tanzania TAZARA railway steam African journey",
    ],
    seasonal_spectacle: [
      "Tanzania Serengeti wildebeest calving season January",
      "Tanzania migration river crossing crocodile Mara",
      "Zanzibar Tanzania monsoon green lush season",
      "Tanzania Ngorongoro rainy season green caldera",
      "Tanzania Kilimanjaro snow summit dry season clear",
    ],
    nightlife_urban: [
      "Dar es Salaam Tanzania beach bar Coco Beach night",
      "Zanzibar Tanzania Stonetown bar rooftop Indian Ocean",
      "Tanzania Arusha town restaurant grill evening",
    ],
    urban_environment: [
      "Dar es Salaam Tanzania harbour city waterfront",
      "Arusha Tanzania market gateway safari town",
      "Stone Town Zanzibar Tanzania plaza historical",
    ],
    vegetation_flora: [
      "Tanzania Kilimanjaro rainforest zone lush green",
      "Tanzania Serengeti grass tall acacia canopy",
      "Zanzibar Tanzania spice garden tropical leaves",
      "Tanzania Usambara Mountains tea plantation green",
      "Tanzania Mahale forest chimpanzee jungle dense",
    ],
    winter_arctic: [
      "Kilimanjaro Tanzania summit ice glacier arctic zone",
      "Tanzania Kilimanjaro Uhuru Peak snow crater rim",
    ],
    ancient_ruins: [
      "Kilwa Kisiwani Tanzania ruins Swahili Coast UNESCO",
      "Tanzania Olduvai Gorge hominid fossil site",
      "Zanzibar Tanzania Portuguese fort ancient stone",
    ],
    festival_celebration: [
      "Tanzania Zanzibar Festival of the Dhow Countries",
      "Tanzania Serengeti Cultural Festival Maasai dance",
      "Zanzibar Tanzania Sauti za Busara music festival",
    ],
  },

  southafrica: {
    landmarks: [
      "Cape Town Table Mountain cloud tablecloth South Africa",
      "Cape Town Boulders Beach penguin South Africa",
      "Cape of Good Hope cliff South Africa Atlantic",
      "Robben Island Cape Town South Africa prison",
      "Kruger Park South Africa Big Five safari",
      "Drakensberg mountains South Africa dramatic",
      "Cape Town Twelve Apostles mountain South Africa",
    ],
    wildlife_fauna: [
      "Kruger lion South Africa safari",
      "Cape Town penguin colony Boulders beach South Africa",
      "South Africa elephant herd Kruger landscape",
      "rhino horn grass South Africa savanna",
      "leopard tree South Africa spots",
      "African buffalo horn South Africa herd",
      "South Africa great white shark cage dive",
      "South Africa whale watching Cape Town",
    ],
    natural_landscapes: [
      "Cape Town coastline Atlantic South Africa dramatic",
      "Drakensberg escarpment South Africa amphitheatre",
      "Garden Route coast forest South Africa",
      "South Africa Namaqualand wildflower bloom",
      "Stellenbosch vineyard mountain South Africa",
    ],
    coastal_marine: [
      "Cape Town beach Camps Bay South Africa",
      "South Africa surf waves Western Cape",
      "Cape Point South Africa rocky coast",
    ],
    urban_environment: [
      "Cape Town Bo-Kaap colorful house cobblestone",
      "Johannesburg Soweto township South Africa",
      "Cape Town Waterfront harbour South Africa",
    ],
    food_market: [
      "Cape Town braai barbecue South Africa outdoor",
      "South Africa biltong dried meat snack",
      "Stellenbosch wine tasting cellar South Africa",
    ],
    aerial_panoramic: [
      "Cape Town aerial Table Mountain city South Africa",
      "South Africa winelands aerial valley",
      "Cape Town aerial Boulders Beach penguin colony",
      "South Africa Drakensberg aerial escarpment",
      "Kruger aerial South Africa bush river bend",
    ],
    cinematic_atmosphere: [
      "Cape Town Table Mountain cloud tablecloth dramatic",
      "South Africa Cape Point sunset Atlantic orange",
      "Kruger Park South Africa lion dusk golden grass",
      "South Africa Drakensberg golden valley dramatic",
      "South Africa Namaqualand wildflower vast color",
      "Cape Town sunset Lion's Head silhouette pink",
    ],
    adventure_extreme: [
      "South Africa cage dive great white shark",
      "South Africa Drakensberg hiking Amphitheatre",
      "South Africa bungee Bloukrans bridge highest world",
      "South Africa Garden Route mountain bike trail",
      "South Africa abseiling Table Mountain face",
      "South Africa surf perfect wave Jeffreys Bay",
    ],
    luxury_premium: [
      "Cape Town Ellerman House luxury sea view hotel",
      "South Africa Singita Sabi Sand luxury lodge",
      "Stellenbosch South Africa luxury wine estate",
      "South Africa Tswalu Kalahari exclusive private",
      "Cape Town luxury yacht ocean charter Atlantic",
    ],
    nightlife_urban: [
      "Cape Town Long Street South Africa bar night",
      "Johannesburg Maboneng Precinct South Africa art",
      "Cape Town V&A Waterfront restaurant evening",
      "Cape Town Kloof Street bar vibrant night South Africa",
    ],
    architecture: [
      "Cape Town Bo-Kaap colorful pastel house cobblestone",
      "South Africa Soweto Vilakazi Street history",
      "Johannesburg Carlton Centre skyline South Africa",
    ],
    seasonal_spectacle: [
      "South Africa whale watching Hermanus June southern right",
      "South Africa wildflower Namaqualand spring bloom August",
      "Stellenbosch South Africa grape harvest March autumn",
      "Cape Town South Africa Pride parade colorful December",
    ],
    cultural_traditional: [
      "South Africa Zulu beadwork ceremony traditional",
      "South Africa Ndebele painted geometric house",
      "South Africa Xhosa ceremony initiation traditional",
    ],
    spiritual_religious: [
      "Cape Town Robben Island Nelson Mandela history",
      "South Africa Johannesburg Apartheid Museum memorial",
    ],
    transportation_iconic: [
      "South Africa Blue Train luxury railway Cape Town",
      "Cape Town Metrorail train mountain view daily",
    ],
    vegetation_flora: [
      "South Africa fynbos Cape Point protea flower",
      "South Africa Knysna forest yellowwood ancient",
      "Stellenbosch vineyard autumn gold red South Africa",
    ],
    festival_celebration: [
      "Cape Town Carnival South Africa parade colorful",
      "South Africa Durban July horse race fashion",
      "Hermanus Whale Festival South Africa October",
    ],
  },

  botswana: {
    wildlife_fauna: [
      "Botswana Okavango Delta elephant swim water",
      "Chobe Botswana elephant herd river bank",
      "Botswana lion pride dry riverbed",
      "Botswana meerkat Kalahari desert standing",
      "Okavango Delta Botswana hippo water lily",
      "Botswana giraffe herd dry woodland",
      "Botswana buffalo herd stampede Chobe",
      "Botswana wild dog painted pack",
    ],
    natural_landscapes: [
      "Okavango Delta Botswana aerial water channel",
      "Kalahari Desert Botswana red sand dry",
      "Botswana Makgadikgadi salt pan vast flat",
      "Botswana flood plain mokoro canoe sunset",
    ],
    aerial_panoramic: [
      "Okavango Delta Botswana aerial green water maze",
      "Botswana salt pan aerial vast white",
    ],
    adventure_extreme: [
      "Botswana mokoro canoe Okavango papyrus",
      "Botswana walking safari guide bush",
      "Botswana Chobe boat safari elephant river",
      "Botswana Makgadikgadi quad biking salt pan",
      "Botswana kayak Okavango Delta hippo channel",
      "Botswana night game drive spotlight predator",
      "Botswana Kalahari 4x4 off-road sand trail",
      "Botswana horseback safari Okavango water gallop",
    ],
    cinematic_atmosphere: [
      "Okavango Delta Botswana sunset golden elephant",
      "Botswana Makgadikgadi pan vast silence dusk",
      "Botswana meerkat sunrise Kalahari dramatic",
      "Botswana Chobe sunset boat river orange glow",
      "Botswana Okavango morning mist reflection water",
      "Botswana star-filled sky Kalahari milky way dark",
      "Botswana baobab tree silhouette red sky sunset",
      "Botswana lion cub golden grass afternoon light",
    ],
    luxury_premium: [
      "Okavango Delta Botswana luxury lodge helicopter",
      "Botswana exclusive tented camp private game",
      "Botswana andBeyond Sandibe luxury Okavango",
      "Botswana Wilderness Vumbura Plains luxury suite",
      "Botswana private island camp Okavango exclusive",
      "Botswana exclusive fly-camp Makgadikgadi stars",
    ],
    seasonal_spectacle: [
      "Botswana Okavango flood season July green",
      "Botswana Zebra migration Makgadikgadi",
      "Botswana Kalahari green season thunderstorm dramatic",
      "Botswana Chobe dry season elephant concentration",
      "Botswana bat-eared fox pup Kalahari spring",
    ],
    food_market: [
      "Botswana braai barbecue outdoor fire traditional",
      "Botswana seswaa pounded meat traditional stew",
      "Botswana sorghum beer traditional clay pot",
      "Botswana Maun local market fresh produce",
      "Botswana camp chef bush dinner evening starlight",
    ],
    cultural_traditional: [
      "Botswana Bushmen San people traditional tracking",
      "Botswana San Bushmen rock painting ancient",
      "Botswana Hambukushu basket weaving Okavango",
      "Botswana Maun village local cultural ceremony",
      "Botswana cattle post traditional Tswana lifestyle",
    ],
    spiritual_religious: [
      "Botswana San Bushmen rock art spiritual trance",
      "Botswana traditional healer ngaka ceremony",
    ],
    architecture: [
      "Botswana Gaborone civic centre modern capital",
      "Botswana Khama Rhino Sanctuary camp traditional",
    ],
    transportation_iconic: [
      "Botswana Okavango bush plane landing dirt strip",
      "Botswana mokoro canoe traditional dugout pole",
      "Botswana Cessna charter flight aerial game",
    ],
    vegetation_flora: [
      "Botswana Okavango papyrus reed island waterway",
      "Botswana Kalahari acacia bush golden dry",
      "Botswana Makgadikgadi grass after rain green",
      "Botswana baobab tree ancient wide trunk Kalahari",
    ],
    nightlife_urban: [
      "Gaborone Botswana restaurant modern city evening",
      "Botswana bush dinner campfire starlight open",
    ],
    urban_environment: [
      "Gaborone Botswana modern capital city mall",
      "Maun Botswana gateway Okavango safari town",
    ],
  },

  namibia: {
    landmarks: [
      "Sossusvlei red orange dune Namibia desert",
      "Deadvlei white pan dead tree Namibia dune",
      "Fish River Canyon Namibia vast gorge Africa",
      "Etosha salt pan Namibia elephant waterhole",
      "Namibia Spitzkoppe granite peak desert",
    ],
    desert_arid: [
      "Namib Desert red dune Sossusvlei Namibia",
      "Namibia desert sand wave abstract dune",
      "Namib Desert Namibia star dune orange",
      "Skeleton Coast Namibia fog ship wreck",
      "Namibia dry riverbed Namib ancient",
    ],
    wildlife_fauna: [
      "Etosha Namibia elephant dust waterhole",
      "Namibia desert adapted elephant sand",
      "Namibia oryx desert sand",
      "Etosha Namibia lion sunset dry",
      "Namibia cheetah running sand",
    ],
    natural_landscapes: [
      "Namibia landscape vast flat arid horizon",
      "Twyfelfontein Namibia rock engravings ancient",
    ],
    aerial_panoramic: [
      "Sossusvlei Namibia aerial dunes pattern red",
      "Namibia aerial Namib desert curve dunes",
      "Fish River Canyon Namibia aerial vast gorge",
      "Namibia Skeleton Coast aerial shipwreck fog",
    ],
    cinematic_atmosphere: [
      "Deadvlei Namibia white dead tree orange dune",
      "Sossusvlei Namibia dawn red dune silhouette",
      "Namibia Skeleton Coast fog eerie dramatic",
    ],
    adventure_extreme: [
      "Namibia Sossusvlei dune 45 climb sand",
      "Namibia Brandberg mountain hike petroglyphs",
      "Namibia quad bike desert Swakopmund",
      "Namibia sandboarding dune slope fast",
    ],
    cultural_traditional: [
      "Namibia Himba woman traditional ochre red tribe",
      "Namibia San Bushmen rock art petroglyphs",
    ],
    luxury_premium: [
      "Namibia desert lodge luxury Sossusvlei private",
      "Namibia Etosha private reserve tented camp",
    ],
    food_market: [
      "Swakopmund Namibia seafood German colonial",
    ],
    seasonal_spectacle: [
      "Namibia dry season July Etosha game gather",
      "Sossusvlei Namibia Big Daddy dune sunrise dawn",
    ],
    urban_environment: [
      "Swakopmund Namibia German colonial architecture",
      "Windhoek Namibia modern capital Africa",
    ],
  },

  // ══════════════════════════════ SOUTH ASIA ══════════════════════════════════

  india: {
    landmarks: [
      "Taj Mahal white marble mausoleum India Agra",
      "Varanasi ghats Ganges ceremony India dawn",
      "Golden Temple Amritsar Punjab India Sikh",
      "Jaipur Amber Fort hillside Rajasthan India",
      "Hawa Mahal pink honeycomb facade Jaipur India",
      "Kerala houseboat backwater green India",
      "Mysore Palace illuminated night India",
      "Ajanta Ellora cave temple India Maharashtra",
      "Hampi ruins stone chariot Karnataka India",
    ],
    natural_landscapes: [
      "India Himalaya snow peak sunrise blue",
      "Kerala backwaters green coconut boat India",
      "Rajasthan desert camel sand India",
      "India Western Ghats tea plantation hill",
      "Andaman islands turquoise India coral",
    ],
    cultural_traditional: [
      "Holi festival colour powder India celebration",
      "India Diwali lamp light Rangoli floor",
      "Indian woman sari colorful fabric",
      "Pushkar camel fair Rajasthan India market",
      "India classical dance Bharatanatyam costume",
      "Indian wedding elaborate mandap ceremony",
      "Ganesh Chaturthi procession India deity",
    ],
    spiritual_religious: [
      "India Hindu temple ornate colorful gopuram",
      "Varanasi Hindu ceremony ghats sacred fire India",
      "India Buddha statue monastery Ladakh",
      "Rishikesh ashram yoga Ganges India",
      "India mosque Mughal architecture minaret",
      "Bodh Gaya Bodhi tree India Buddhism",
    ],
    wildlife_fauna: [
      "India Bengal tiger jungle grass reserve",
      "India elephant mahout forest ride",
      "India peacock display feather jungle",
      "India rhino one-horned Kaziranga grass",
      "India monkey macaque temple crowd",
    ],
    food_market: [
      "India street food chaat Delhi spice vibrant",
      "India spice market colorful sacks",
      "India biryani rice saffron curry",
      "Mumbai dabbawalas tiffin delivery India",
    ],
    architecture: [
      "Mughal arch India marble inlay pietra dura",
      "India Rajasthan haveli ornate carved stone",
      "Dravidian temple tower India colorful",
      "India stepwell geometric stone Adalaj",
      "India Art Deco Mumbai building",
    ],
    aerial_panoramic: [
      "India Taj Mahal aerial garden geometry",
      "India Varanasi aerial Ganges ghat line",
      "India Jaipur aerial pink city Rajasthan",
      "India Kerala aerial green backwater canal",
    ],
    cinematic_atmosphere: [
      "India golden hour Taj Mahal mist marble",
      "Varanasi dawn fog river ceremony India",
      "India monsoon rain temple courtyard dramatic",
      "Rajasthan desert sunset camel silhouette India",
      "India Holi festival colour cloud dramatic",
    ],
    luxury_premium: [
      "India palace hotel heritage Jaipur Rajasthan",
      "India Taj Lake Palace Udaipur lake marble",
      "India luxury train Maharajas Express Rajasthan",
      "India Ranthambore luxury tent wildlife",
    ],
    adventure_extreme: [
      "India Ladakh high-altitude biking pass",
      "India Himalaya trekking Chadar frozen river",
      "India Rishikesh white-water rafting Ganges",
      "India paragliding Bir Billing Himachal Pradesh",
      "India scuba dive Andaman coral reef",
    ],
    vegetation_flora: [
      "India tea plantation Munnar green hillside",
      "India lotus pond pink flower reflection",
      "India Nilgiri hills mist forest shola",
      "India marigold garland flower market",
      "India jasmine bougainvillea temple courtyard",
    ],
    nightlife_urban: [
      "Mumbai Marine Drive night India seafront",
      "Delhi Connaught Place night India",
      "Goa beach shack bonfire party night India",
      "Bangalore pub street craft beer India",
    ],
    transportation_iconic: [
      "India Darjeeling toy train mountain railway",
      "India auto-rickshaw colourful street traffic",
      "India express train rural countryside",
      "India boat Kerala backwater punting",
    ],
    festival_celebration: [
      "India Holi festival colour throw crowd",
      "India Diwali candle light festival night",
      "India Navratri garba dance Gujarat",
      "India Pushkar fair camel decorated Rajasthan",
      "India Kumbh Mela million pilgrims river",
    ],
    urban_environment: [
      "Mumbai colonial Chhatrapati Shivaji Terminus India",
      "Delhi Humayun Tomb garden red sandstone India",
      "Kolkata tram street colonial India",
      "Jaipur pink city wall bazaar India",
    ],
    seasonal_spectacle: [
      "India monsoon rain dramatic storm field",
      "India wheat harvest Punjab golden field",
      "India spring mustard field yellow Rajasthan",
    ],
    water_features: [
      "India Kerala houseboat backwater green canal",
      "Varanasi Ganges river India holy bath",
      "India Dudhsagar waterfall green Goa cascade",
    ],
  },

  nepal: {
    landmarks: [
      "Mount Everest Nepal Himalayas snow peak",
      "Everest Base Camp Nepal prayer flag",
      "Annapurna Nepal trekking mountain pass",
      "Pashupatinath temple Nepal Hindu sacred",
      "Boudhanath stupa Nepal Buddhist white dome",
      "Swayambhunath monkey temple hill Nepal",
      "Pokhara Phewa lake Annapurna reflection Nepal",
    ],
    natural_landscapes: [
      "Nepal Himalaya mountain range snow vista",
      "Nepal valley green terraced paddy village",
      "Nepal rhododendron forest spring blooms",
      "Annapurna Circuit Nepal mountain landscape",
      "Nepal cloud sea below peak clear sky",
    ],
    winter_arctic: [
      "Nepal snow peak prayer flag blue sky",
      "Nepal Everest storm wind high altitude",
      "Nepal winter mountain pass snow rope",
    ],
    cultural_traditional: [
      "Nepal prayer flag colorful mountain pass",
      "Nepali Sherpa guide mountain village",
      "Nepal Buddhist monk monastery orange robe",
      "Nepal Thangka painting religious art",
      "Nepal Dashain festival Kathmandu celebration",
    ],
    spiritual_religious: [
      "Nepal stupa golden spire Boudhanath",
      "Nepal prayer wheel monastery spin",
      "Nepal Pashupatinath cremation ghat sacred",
      "Nepal monastery cliff dramatic mountain",
      "Nepal incense smoke Buddhist temple",
    ],
    adventure_extreme: [
      "Nepal trekking Himalayas mountain trail",
      "Nepal paragliding Pokhara lake Annapurna",
      "Nepal white water rafting river gorge",
    ],
    aerial_panoramic: [
      "Nepal aerial Himalayas snow peaks range",
      "Nepal aerial Kathmandu valley morning fog",
      "Nepal aerial Pokhara lake Annapurna reflection",
      "Nepal aerial Everest Base Camp glacier moraine",
      "Nepal Chitwan aerial river forest green",
    ],
    cinematic_atmosphere: [
      "Nepal Everest summit sunrise golden Himalaya",
      "Nepal prayer flag flutter wind mountain pass",
      "Nepal Annapurna morning light cloud sea below",
      "Nepal Kathmandu temple smoke incense dawn",
      "Nepal Pokhara reflection still lake Machhapuchhre",
      "Nepal Himalayas dramatic storm cloud peak",
    ],
    luxury_premium: [
      "Nepal Dwarika's Hotel Kathmandu heritage luxury",
      "Nepal Tiger Mountain lodge Pokhara luxury",
      "Nepal Chitwan luxury lodge wildlife service",
      "Nepal Everest panorama helicopter landing luxury",
    ],
    food_market: [
      "Nepal Kathmandu Thamel market food street",
      "Nepal dal bhat traditional plate lentil rice",
      "Nepal momo dumpling steamed spicy Nepal",
      "Nepal Boudhanath bakery coffee monastery view",
      "Nepal market Bhaktapur pottery square food",
    ],
    wildlife_fauna: [
      "Nepal Bengal tiger Chitwan National Park",
      "Nepal one-horned rhino Chitwan grassland",
      "Nepal elephant safari Chitwan river",
      "Nepal snow leopard Himalaya rare mountain",
      "Nepal red panda forest bamboo mountain",
    ],
    urban_environment: [
      "Kathmandu Nepal Durbar Square ancient palace",
      "Nepal Bhaktapur Pottery Square traditional craft",
      "Kathmandu Nepal Thamel street market narrow",
      "Nepal Patan Durbar Square wood carving temple",
    ],
    architecture: [
      "Nepal Pashupatinath temple pagoda tiered gilded",
      "Boudhanath stupa white dome prayer Nepal",
      "Nepal Bhaktapur Nyatapola five-tiered pagoda",
      "Nepal Kathmandu wood carved window peacock",
    ],
    transportation_iconic: [
      "Nepal mountain flight Everest window seat view",
      "Nepal Kathmandu rickshaw street colorful",
      "Nepal Yak caravan mountain trail Himalaya",
    ],
    seasonal_spectacle: [
      "Nepal rhododendron forest spring pink bloom",
      "Nepal Everest clear sky October November peak",
      "Nepal Dashain festival kite Kathmandu sky",
      "Nepal Tihar festival light lamp Diwali",
    ],
    nightlife_urban: [
      "Kathmandu Nepal Thamel rooftop bar mountain view",
      "Nepal Pokhara lakeside restaurant evening calm",
    ],
    vegetation_flora: [
      "Nepal Himalaya rhododendron forest altitude spring",
      "Nepal Terai jungle tall grass Chitwan green",
      "Nepal high altitude alpine meadow wildflower",
    ],
    festival_celebration: [
      "Nepal Indra Jatra festival Kathmandu mask dance",
      "Nepal Holi festival colour crowd street",
      "Nepal Losar Tibetan New Year monastery prayer",
    ],
    ancient_ruins: [
      "Nepal Patan ancient city Newari architecture",
      "Nepal Changu Narayan oldest temple hill",
      "Nepal Mustang ancient cave cliff carving",
    ],
  },

  // ════════════════════════════ SOUTHEAST ASIA ════════════════════════════════

  thailand: {
    landmarks: [
      "Grand Palace golden spire Bangkok Thailand",
      "Wat Arun temple of dawn Bangkok river Thailand",
      "Chiang Mai temple mountain Thailand",
      "Phi Phi island limestone cliff turquoise Thailand",
      "Wat Pho reclining Buddha gold Bangkok Thailand",
      "Erawan National Park waterfall Thailand",
      "Bridge over River Kwai Kanchanaburi Thailand",
      "Tiger Cave temple viewpoint Krabi Thailand",
    ],
    tropical_lush: [
      "Thailand jungle waterfall lush green",
      "Thailand monsoon green rice terraces north",
      "Ko Samui palm beach tropical Thailand",
      "Thailand mangrove kayak sea cave",
      "Khao Yai Thailand jungle elephant walk",
      "Thailand cloud forest mountain north misty",
    ],
    coastal_marine: [
      "Thailand turquoise bay longtail boat limestone",
      "Krabi Thailand cliff karst beach",
      "Thailand coral reef snorkel fish color",
      "Phuket beach sunset Thailand palm",
      "Similan islands Thailand underwater coral",
    ],
    spiritual_religious: [
      "Thai Buddhist temple ornate gold Thailand",
      "Thailand monk orange robe alms morning",
      "Bangkok temple gold spire detail Thailand",
      "Thailand spirit house flower offering",
    ],
    cultural_traditional: [
      "Chiang Mai lantern sky Yi Peng Thailand",
      "Thai floating market boat Thailand canal",
      "Thai street food vendor Bangkok market",
      "Thailand traditional dance costume gold",
      "Thailand elephant ride jungle sanctuary",
      "Thailand tuk-tuk Bangkok street",
    ],
    food_market: [
      "Thailand pad thai wok street vendor",
      "Bangkok night market food court Thailand",
      "Thailand mango sticky rice dessert",
      "Thai som tam papaya salad spicy mortar",
    ],
    nightlife_urban: [
      "Bangkok night market Chinatown Thailand neon",
      "Thailand Ko Samui beach bar fire show",
      "Bangkok rooftop bar view Thailand night",
    ],
    aerial_panoramic: [
      "Thailand aerial limestone karst island bay",
      "Bangkok aerial temple rooftop grid Thailand",
      "Thailand Chiang Mai aerial mountain valley north",
      "Thailand aerial island turquoise blue water",
    ],
    cinematic_atmosphere: [
      "Thailand longtail boat limestone karst misty morning",
      "Bangkok golden temple sunrise silhouette Thailand",
      "Thailand Chiang Mai lantern sky night glow",
      "Thailand jungle waterfall mist ethereal green",
      "Thailand monsoon rain street market dramatic",
    ],
    luxury_premium: [
      "Thailand overwater bungalow resort Maldives-style",
      "Bangkok luxury rooftop pool hotel Thailand",
      "Thailand private island resort Koh Samui",
      "Thailand luxury elephant conservation lodge",
    ],
    adventure_extreme: [
      "Thailand rock climbing Railay limestone cliff",
      "Thailand diving Richelieu Rock whale shark",
      "Thailand bungee jump Pattaya extreme",
      "Thailand zip-line canopy forest Chiang Mai",
      "Thailand sea kayak cave mangrove Krabi",
    ],
    vegetation_flora: [
      "Thailand orchid garden bloom Chiang Mai",
      "Thailand lotus pond Buddhist monastery",
      "Thailand tropical jungle fern waterfall green",
      "Thailand mangrove forest root sea green",
    ],
    festival_celebration: [
      "Thailand Yi Peng lantern festival sky November",
      "Thailand Songkran water festival crowd Bangkok",
      "Thailand Loi Krathong lotus lantern river",
      "Chiang Mai flower festival February parade Thailand",
    ],
    transportation_iconic: [
      "Thailand longtail boat Bangkok river canal",
      "Thailand tuk-tuk colourful Bangkok street night",
      "Bangkok BTS Skytrain elevated rail Thailand",
      "Thailand sleeper train overnight journey",
    ],
    seasonal_spectacle: [
      "Thailand monsoon green lush July August",
      "Thailand cool season Chiang Mai November misty",
      "Thailand dry season turquoise sea January",
    ],
    urban_environment: [
      "Bangkok Chinatown Yaowarat neon sign street",
      "Bangkok temple canal old town Thailand",
      "Chiang Mai old city moat wall Thailand",
      "Bangkok modern skyscraper night Silom",
    ],
  },

  bali: {
    landmarks: [
      "Tanah Lot sea temple sunset rock Bali",
      "Uluwatu cliff temple Bali ocean sunset",
      "Tegallalang rice terraces green Ubud Bali",
      "Besakih mother temple volcanic Bali",
      "Pura Ulun Danu Bratan lake temple Bali",
      "Mount Batur volcano crater lake Bali",
    ],
    tropical_lush: [
      "Bali jungle waterfall lush green tropical",
      "Bali rice paddy green reflections terraces",
      "Ubud jungle monkey forest Bali green",
      "Bali tropical flower frangipani offering",
      "Bali green bamboo forest path",
      "Bali rainforest misty morning valley",
    ],
    coastal_marine: [
      "Bali surf beach Seminyak sunset orange",
      "Nusa Penida cliff beach turquoise Bali",
      "Bali snorkel coral reef colorful fish",
      "Uluwatu Bali cliff turquoise ocean view",
    ],
    cultural_traditional: [
      "Bali Kecak fire dance ceremony performer",
      "Balinese ceremony offering flower incense",
      "Bali woman traditional headdress offering",
      "Ubud market Bali tropical offerings flowers",
      "Bali temple gate ornate carved stone",
    ],
    spiritual_religious: [
      "Bali Hindu temple ceremony incense smoke",
      "Bali split gate candi bentar carved",
      "Bali priest white costume blessing ceremony",
      "Bali sacred spring Tirta Empul pool",
    ],
    luxury_premium: [
      "Bali private villa infinity pool jungle",
      "Ubud jungle resort nest infinity Bali",
      "Bali luxury spa treatment flower bath",
    ],
    food_market: [
      "Bali warung local food banana leaf",
      "Ubud organic café healthy food Bali",
      "Bali coffee luwak civet traditional",
    ],
    aerial_panoramic: [
      "Bali rice terraces aerial green Ubud",
      "Bali aerial coast cliff temple sunset",
    ],
    cinematic_atmosphere: [
      "Bali misty morning rice terrace valley",
      "Bali sunset pink orange sea reflection",
      "Bali temple ceremony incense smoke golden",
      "Bali rainforest river gorge dramatic green",
      "Bali volcano crater mist morning Batur",
    ],
    nightlife_urban: [
      "Seminyak Bali beach bar sunset crowd",
      "Bali Kuta night market street food vendor",
      "Bali Canggu rooftop bar surf culture",
      "Seminyak Bali rooftop cocktail sunset view",
    ],
    adventure_extreme: [
      "Bali Mount Batur volcano sunrise hike",
      "Bali surf lesson wave beginner Kuta beach",
      "Bali white-water rafting Ayung river jungle",
      "Bali cliff jump Nusa Penida ocean blue",
      "Bali mountain bike jungle trail Ubud",
    ],
    vegetation_flora: [
      "Bali frangipani white flower tropical fragrant",
      "Bali bamboo forest towering green light",
      "Ubud rice paddy green morning dew Bali",
      "Bali tropical garden lotus water lily pool",
      "Bali palm grove beach coconut tree horizon",
    ],
    transportation_iconic: [
      "Bali scooter motorbike village road palm",
      "Bali jukung outrigger boat wooden painted",
      "Bali bamboo craft boat traditional fishing",
    ],
    festival_celebration: [
      "Bali Nyepi silent day Hindu ceremony",
      "Bali Ogoh-ogoh parade float demon effigy",
      "Bali Galungan ceremony offering palm leaf",
      "Bali cremation Ngaben ceremony procession",
    ],
    seasonal_spectacle: [
      "Bali dry season June July clear blue sky",
      "Bali rainy season lush green waterfall December",
    ],
    water_features: [
      "Bali waterfall hidden jungle Sekumpul",
      "Bali rice paddy flooded reflection mirror",
      "Bali Tirta Gangga royal water palace pool",
      "Bali Munduk waterfall mountain misty north",
    ],
    urban_environment: [
      "Ubud art gallery Bali cultural quarter",
      "Seminyak Bali boutique street art gallery",
      "Kuta Bali commercial street surf shop",
      "Canggu Bali digital nomad café laptop",
    ],
  },

  vietnam: {
    landmarks: [
      "Ha Long Bay limestone karst islands emerald Vietnam",
      "Hoi An Ancient Town yellow lanterns night Vietnam",
      "Hue Citadel Imperial Vietnam ancient",
      "My Son ruins Cham temple Vietnam",
      "Sapa rice terraces foggy mountain Vietnam",
      "Phong Nha cave Vietnam largest cavern",
    ],
    natural_landscapes: [
      "Vietnam terraced rice fields Sapa misty",
      "Mekong Delta boat Vietnam water green",
      "Vietnam jungle karst mountain fog morning",
      "Ha Giang Vietnam mountain winding road",
      "Vietnam river valley forest limestone",
    ],
    coastal_marine: [
      "Ha Long Bay Vietnam emerald water boat",
      "Phu Quoc island Vietnam white beach",
      "Vietnam coastal fishing village dawn boats",
      "Mui Ne Vietnam red dune coast",
    ],
    cultural_traditional: [
      "Vietnam ao dai traditional dress woman",
      "Hoi An lantern river Vietnam festival",
      "Vietnamese street food pho bowl steam",
      "Hanoi Old Quarter motorbike Vietnam",
      "Vietnam conical hat non la rice paddy",
    ],
    food_market: [
      "Vietnam pho soup noodle beef Hanoi",
      "Hoi An Vietnamese sandwich banh mi",
      "Vietnam market fresh herb street food",
      "Vietnam coffee drip phin condensed milk",
    ],
    urban_environment: [
      "Hanoi Old Quarter lane motorbike Vietnam",
      "Ho Chi Minh City traffic scooter busy",
      "Vietnam alley wires overhead neon",
    ],
    aerial_panoramic: [
      "Ha Long Bay Vietnam aerial island mist",
      "Vietnam rice terrace aerial Sapa green",
      "Ho Chi Minh City Vietnam aerial dense streets",
      "Vietnam Ha Giang mountain aerial road winding",
    ],
    cinematic_atmosphere: [
      "Ha Long Bay Vietnam morning mist limestone",
      "Hoi An Vietnam lantern night river reflection",
      "Vietnam Sapa fog valley rice terrace dawn",
      "Vietnam Mekong Delta boat silhouette sunrise",
      "Hue citadel Vietnam dusk purple sky",
    ],
    luxury_premium: [
      "Ha Long Bay luxury cruise Vietnam private deck",
      "Hoi An boutique resort Vietnam pool colonial",
      "Vietnam Evason Six Senses Ninh Van luxury",
    ],
    adventure_extreme: [
      "Vietnam motorbike Ha Giang mountain pass",
      "Vietnam Phong Nha cave expedition spelunking",
      "Vietnam kite surfing Mui Ne wind coast",
      "Vietnam kayak Ha Long Bay sea cave",
    ],
    spiritual_religious: [
      "Vietnam Perfume Pagoda Buddhist shrine",
      "Hue Vietnam royal tombs Nguyen dynasty",
      "Vietnam Buddhist temple incense prayer",
      "My Son Cham ruins Hindu Vietnam",
    ],
    festival_celebration: [
      "Vietnam Tet New Year lanterns fireworks Hanoi",
      "Hoi An Vietnam lantern full moon festival",
      "Vietnam Mid-Autumn Festival mooncake lantern",
    ],
    transportation_iconic: [
      "Vietnam scooter swarm city traffic chaos",
      "Ha Long Bay junk boat wooden sail Vietnam",
      "Vietnam train narrow gauge coastal route",
      "Mekong Delta Vietnam sampan boat canal",
    ],
    vegetation_flora: [
      "Vietnam Sapa rice paddy green terrace mist",
      "Vietnam lotus flower pink pond Hanoi",
      "Vietnam coffee plantation hill Dalat",
      "Vietnam bamboo forest path green quiet",
    ],
    seasonal_spectacle: [
      "Vietnam north winter fog mountain Sapa",
      "Vietnam central dry season April beach sun",
      "Vietnam monsoon rain tropical July August",
    ],
  },

  cambodia: {
    landmarks: [
      "Angkor Wat temple dawn reflection Cambodia",
      "Bayon temple stone face Cambodia Angkor",
      "Ta Prohm tree roots temple Cambodia jungle",
      "Angkor Thom gate giant face Cambodia",
      "Tonle Sap floating village Cambodia lake",
      "Preah Khan temple Cambodia jungle ruin",
    ],
    ancient_ruins: [
      "Angkor Cambodia sandstone carved bas relief",
      "Khmer temple face stone Cambodia",
      "Cambodia ruin jungle tree overgrown",
      "Angkor Wat Cambodia sunrise golden reflection",
    ],
    cultural_traditional: [
      "Cambodian Apsara classical dance costume",
      "Cambodia Buddhist monk saffron robe alms",
      "Siem Reap night market Cambodia",
      "Cambodia traditional krama scarf pattern",
    ],
    tropical_lush: [
      "Cambodia jungle temple overgrown root",
      "Cambodia monsoon green forest wet",
    ],
    food_market: [
      "Cambodia Khmer curry amok fish coconut",
      "Phnom Penh street food market Cambodia",
    ],
    aerial_panoramic: [
      "Angkor Wat Cambodia aerial complex temple",
      "Cambodia Angkor Wat aerial moat sunrise",
      "Tonle Sap Cambodia aerial floating village lake",
    ],
    spiritual_religious: [
      "Cambodia Buddhist pagoda gilded roof",
      "Cambodia prayer offering incense smoke",
      "Phnom Penh Cambodia Silver Pagoda floor tile",
      "Cambodia monks dawn Angkor ceremony",
    ],
    cinematic_atmosphere: [
      "Angkor Wat Cambodia dawn mist reflection golden",
      "Ta Prohm Cambodia tree root temple dramatic",
      "Cambodia monsoon rain temple stone atmospheric",
    ],
    adventure_extreme: [
      "Cambodia kayaking Mekong river Kratie dolphin",
      "Cambodia motorbike Cardamom mountains trail",
      "Phnom Kulen Cambodia waterfall swim hike",
    ],
    luxury_premium: [
      "Siem Reap Cambodia luxury villa resort pool",
      "Phnom Penh Cambodia boutique hotel colonial",
    ],
    coastal_marine: [
      "Koh Rong Cambodia turquoise island beach",
      "Cambodian coast Sihanoukville clear sea",
    ],
    seasonal_spectacle: [
      "Cambodia Water Festival Phnom Penh November",
      "Cambodia dry season November April clear sky",
    ],
    urban_environment: [
      "Phnom Penh Cambodia riverside colonial quarter",
    ],
    natural_landscapes: [
      "Cambodia Cardamom Mountains remote forest river",
    ],
  },

  singapore: {
    landmarks: [
      "Marina Bay Sands rooftop infinity pool Singapore",
      "Gardens by the Bay supertree grove Singapore",
      "Singapore CBD skyline reflection bay night",
      "Merlion water spout Singapore harbour",
      "Jewel Changi waterfall indoor Singapore",
      "Singapore Helix Bridge metallic pedestrian",
    ],
    urban_environment: [
      "Singapore futuristic glass tower skyline",
      "Chinatown Singapore colorful shophouse lantern",
      "Little India Singapore vibrant color market",
      "Orchard Road Singapore luxury shopping",
      "Clarke Quay Singapore night riverside bar",
    ],
    nightlife_urban: [
      "Singapore rooftop bar night skyline view",
      "Singapore Marina Bay night light reflection",
      "Clarke Quay Singapore neon bar riverside night",
    ],
    food_market: [
      "Singapore hawker centre food stall busy",
      "Singapore chilli crab restaurant dinner",
      "Singapore satay Lau Pa Sat night stall",
      "Singapore kaya toast kopitiam breakfast",
    ],
    architecture: [
      "Singapore colourful Peranakan shophouse ornate",
      "Singapore colonial building white civic",
      "Singapore modern sustainable green building",
    ],
    tropical_lush: [
      "Singapore Botanic Garden lush tropical",
      "Singapore MacRitchie forest green walk",
    ],
    aerial_panoramic: [
      "Singapore aerial Marina Bay cityscape night",
      "Singapore aerial Gardens by the Bay shape",
      "Singapore aerial Sentosa island resort",
      "Singapore aerial CBD glass towers green",
    ],
    cinematic_atmosphere: [
      "Singapore Marina Bay Sands night reflection water",
      "Singapore rain tropical storm dramatic city",
      "Singapore Gardens Bay cloud forest mist",
      "Singapore Supertree grove light show night",
    ],
    luxury_premium: [
      "Singapore Marina Bay Sands rooftop pool luxury",
      "Singapore Raffles Hotel colonial luxury bar",
      "Singapore luxury hotel Orchard Road",
      "Singapore private dining Michelin-starred",
    ],
    adventure_extreme: [
      "Singapore Universal Studios roller coaster Sentosa",
      "Singapore Giant Swing AJ Sentosa extreme",
    ],
    vegetation_flora: [
      "Singapore Botanic Garden World Heritage orchid",
      "Singapore Gardens by the Bay flower dome",
      "Singapore urban green rooftop garden",
    ],
    festival_celebration: [
      "Singapore National Day fireworks Marina Bay",
      "Singapore Chinese New Year Chinatown lights",
      "Singapore Deepavali Little India festival lights",
    ],
    transportation_iconic: [
      "Singapore MRT metro train modern efficient",
      "Singapore cable car Sentosa Mount Faber",
      "Singapore river bumboat Clarke Quay cruise",
    ],
    seasonal_spectacle: [
      "Singapore year-round tropical heat humid green",
      "Singapore Gardens by the Bay Christmas lights",
    ],
  },

  malaysia: {
    landmarks: [
      "Petronas Twin Towers KL Malaysia night",
      "Batu Caves gold statue steps Malaysia",
      "George Town Penang street art Malaysia",
      "Mount Kinabalu Sabah Malaysia summit",
      "Cameron Highlands tea plantation green Malaysia",
      "Langkawi island cable car Malaysia",
    ],
    tropical_lush: [
      "Borneo Malaysia jungle orangutan canopy",
      "Malaysia rainforest Taman Negara ancient",
      "Borneo Sabah river boat jungle Malaysia",
      "Malaysia tree fern tropical forest green",
    ],
    wildlife_fauna: [
      "Orangutan Borneo Malaysia jungle fruit",
      "Malaysia proboscis monkey Borneo river",
      "Sabah Malaysia pygmy elephant river",
      "Malaysia orangutan feeding station",
    ],
    coastal_marine: [
      "Tioman island Malaysia coral clear sea",
      "Langkawi beach Malaysia palm sunset",
      "Sipadan island Malaysia world dive coral",
    ],
    cultural_traditional: [
      "Malaysia Baba-Nyonya Peranakan culture",
      "KL Malaysia diverse culture street market",
      "Malaysia batik fabric pattern traditional",
    ],
    food_market: [
      "Penang Malaysia hawker street food noodle",
      "Malaysia nasi lemak coconut rice dish",
      "KL Malaysia food court Chinatown street",
    ],
    aerial_panoramic: [
      "Petronas Towers KL Malaysia aerial night",
      "Malaysia Langkawi aerial island green bay",
      "Borneo Malaysia aerial river jungle canopy",
    ],
    cinematic_atmosphere: [
      "Petronas Towers Malaysia night blue hour twin",
      "Malaysia Batu Caves golden statue dawn light",
      "Borneo Malaysia misty jungle morning canopy",
      "George Town Penang Malaysia street art dusk",
    ],
    adventure_extreme: [
      "Mount Kinabalu Malaysia summit trail dawn",
      "Borneo Malaysia river rapids kayak",
      "Malaysia cave trekking Mulu Sarawak",
      "Langkawi Malaysia jungle ziplining cable car",
    ],
    architecture: [
      "Petronas Twin Towers Malaysia steel glass soar",
      "George Town Malaysia shophouse terrace Penang",
      "KL Malaysia China town street temple bright",
    ],
    luxury_premium: [
      "Malaysia Langkawi overwater villa sunset luxury",
      "KL Malaysia luxury rooftop infinity pool Petronas",
      "Borneo Malaysia eco-lodge canopy rainforest",
    ],
    nightlife_urban: [
      "KL Malaysia rooftop bar Petronas view night",
      "George Town Penang Malaysia night market bustling",
    ],
    seasonal_spectacle: [
      "Malaysia firefly river cruise Kuala Selangor",
      "Malaysia Thaipusam festival Batu Caves Hindu",
    ],
    urban_environment: [
      "KL Malaysia street food night hawker stall",
      "Malaysia Little India Brickfields vibrant colour",
    ],
  },

  philippines: {
    landmarks: [
      "El Nido Palawan lagoon karst cliff Philippines",
      "Banaue rice terraces ifugao Philippines",
      "Mayon Volcano perfect cone Philippines",
      "Puerto Princesa underground river Philippines",
      "Chocolate Hills Bohol Philippines pattern",
    ],
    coastal_marine: [
      "Philippines Palawan turquoise lagoon clear",
      "Coron Philippines wreck dive coral",
      "Philippines coral reef fish colorful",
      "Siargao island surf wave Philippines",
      "Philippines sea cave kayak limestone",
    ],
    tropical_lush: [
      "Philippines jungle waterfall Luzon green",
      "Philippines coconut palm beach tropical",
      "Bohol Philippines green rolling hills",
    ],
    wildlife_fauna: [
      "Philippines tarsier primate huge eyes",
      "Philippines whale shark Oslob feeding",
      "Philippines sea turtle green snorkel",
      "Philippines manta ray Tubbataha reef",
    ],
    food_market: [
      "Philippines lechon roast pig celebration",
      "Philippines halo-halo dessert colorful",
      "Philippines sisig sizzling pork street food",
      "Philippines balut street food duck egg",
    ],
    aerial_panoramic: [
      "El Nido Philippines aerial lagoon green",
      "Chocolate Hills Philippines aerial pattern",
      "Philippines Palawan aerial karst island turquoise",
      "Banaue rice terraces Philippines aerial green",
    ],
    cinematic_atmosphere: [
      "El Nido Philippines sunset lagoon dramatic orange",
      "Philippines Mayon volcano perfect cone mist",
      "Banaue rice terrace Philippines morning mist",
    ],
    adventure_extreme: [
      "Philippines freediving Tubbataha reef",
      "Philippines kitesurfing Boracay wind",
      "Siargao Philippines surfing cloud nine wave",
      "Philippines zip-line Bohol adventure",
    ],
    luxury_premium: [
      "Palawan Philippines luxury resort overwater villa",
      "El Nido Philippines eco-resort cliff lagoon",
    ],
    cultural_traditional: [
      "Philippines Sinulog festival Cebu January parade",
      "Philippines jeepney colourful bus street",
      "Banaue Philippines Ifugao indigenous festival",
    ],
    seasonal_spectacle: [
      "Philippines dry season November May Pacific",
    ],
    urban_environment: [
      "Manila Philippines Intramuros walled city colonial",
    ],
  },

  southkorea: {
    landmarks: [
      "Gyeongbokgung Palace Seoul South Korea",
      "Bukchon Hanok village Seoul South Korea",
      "N Seoul Tower Namsan hill South Korea",
      "Seoraksan mountain autumn South Korea",
      "DMZ Korean border fence South Korea",
      "Haeinsa temple Korea Buddhist forest",
    ],
    urban_environment: [
      "Seoul Gangnam Apgujeong fashion South Korea",
      "Seoul Myeongdong shopping neon South Korea",
      "Seoul Han River park bridge night",
      "Seoul rooftop café Han River view",
      "Busan colourful Gamcheon village South Korea",
    ],
    cultural_traditional: [
      "Korea traditional hanbok dress ceremony",
      "Korea kimchi making traditional ferment",
      "Korea Confucian ceremony traditional robe",
      "Korea haenyeo woman diver Jeju island",
    ],
    seasonal_spectacle: [
      "South Korea cherry blossom spring Seoul",
      "Korea Jinhae cherry blossom festival",
      "South Korea autumn maple Seoraksan red",
    ],
    food_market: [
      "Korea BBQ grill table restaurant Seoul",
      "Korea street food tteokbokki spicy rice",
      "Gwangjang Market Seoul Korea food stall",
    ],
    nightlife_urban: [
      "Seoul Hongdae nightlife neon South Korea",
      "Dongdaemun Seoul night fashion Korea",
    ],
    aerial_panoramic: [
      "Seoul aerial Han River bridge South Korea",
      "Seoul aerial city skyscrapers mountains Korea",
      "Jeju island aerial coast South Korea",
    ],
    cinematic_atmosphere: [
      "Seoul cherry blossom pink spring Korea dramatic",
      "South Korea autumn red maple mountain dramatic",
      "Seoul night skyline Han River reflection Korea",
      "Korea Bukchon Hanok snow winter quiet",
      "Korea palace lantern ceremony night dusk",
    ],
    luxury_premium: [
      "Seoul luxury K-beauty spa treatment Korea",
      "South Korea luxury sky hotel Seoul Lotte",
      "Korea Jeju island luxury resort ocean view",
    ],
    adventure_extreme: [
      "South Korea Seoraksan hiking rocky ridge",
      "Korea Jeju Island scuba dive underwater",
      "Korea snowboard Pyeongchang resort winter",
    ],
    vegetation_flora: [
      "Korea cherry blossom Gyeongju spring row",
      "South Korea azalea mountain bloom spring",
      "Korea autumn foliage Naejangsan maple",
      "Korea bamboo grove path Damyang green",
    ],
    spiritual_religious: [
      "Korea Bulguksa temple Buddhist Gyeongju",
      "Korea Templestay Buddhist morning drum ceremony",
      "Jogyesa Seoul Buddhist urban temple Korea",
    ],
    festival_celebration: [
      "Korea Boryeong Mud Festival summer July",
      "Korea Jinju Lantern Festival October river",
      "Korea Seollal Lunar New Year ancestral rite",
      "Korea Chuseok harvest festival family Korea",
    ],
    transportation_iconic: [
      "Seoul KTX bullet train platform Korea",
      "Seoul subway map neon signage Korea",
      "Korea bike path Han River cycling Seoul",
    ],
    natural_landscapes: [
      "South Korea Jeju island volcanic Hallasan",
      "Korea coastal cliff Haedong Yonggungsa temple",
      "South Korea Jirisan mountain green valley",
    ],
    architecture: [
      "Korea modern glass tower Seoul Gangnam",
      "Korea traditional hanok roof curved tile",
      "Dongdaemun Design Plaza Seoul Zaha Hadid",
    ],
  },

  china: {
    landmarks: [
      "Great Wall of China mountain ridge winding",
      "Zhangjiajie Avatar mountains pillar China",
      "Li River Guilin karst peaks boat China",
      "Forbidden City Beijing red wall China",
      "Terracotta Army Xi'an China soldiers",
      "Potala Palace Lhasa Tibet China",
      "Shanghai Bund waterfront Pudong China",
      "Huangshan Yellow Mountain China pine mist",
    ],
    natural_landscapes: [
      "China karst mountain morning mist Li River",
      "China rice terrace Longji dragon back",
      "China Jiuzhaigou blue pool turquoise",
      "China Zhangjiajie forest pillar cliff",
      "China Gobi Desert sand dune Mongolia border",
    ],
    urban_environment: [
      "Shanghai Pudong skyline Pearl Tower China",
      "Beijing hutong lane old city China",
      "Hong Kong Shanghai Bank glass tower China",
      "Chengdu pandas eating bamboo China",
    ],
    ancient_ruins: [
      "Terracotta warriors Xi'an pit China ancient",
      "Great Wall China ancient stone fortress",
      "China ancient pagoda hill dynasty",
      "Pingyao walled city China Ming dynasty",
    ],
    cultural_traditional: [
      "China dragon lantern parade festival",
      "China opera Beijing mask costume face",
      "China tea ceremony Yunnan traditional",
      "Shanghai French Concession lane China",
    ],
    wildlife_fauna: [
      "China giant panda Chengdu bamboo eat",
      "China golden monkey Zhangjiajie forest",
      "China snow leopard Tibetan plateau rare",
    ],
    food_market: [
      "China Sichuan hotpot boiling spicy table",
      "Beijing Peking duck crispy restaurant",
      "Shanghai dumpling dim sum China morning",
    ],
    aerial_panoramic: [
      "Great Wall China aerial mountain ridge",
      "China Zhangjiajie aerial pillar cloud",
    ],
  },

  // ══════════════════════════ CENTRAL EUROPE ══════════════════════════════════

  czechrepublic: {
    landmarks: [
      "Prague Charles Bridge stone statues Czech Republic",
      "Prague Old Town Astronomical Clock Czech Republic",
      "Prague Castle Hradcany hill Czech Republic",
      "Czech Republic Cesky Krumlov castle river town",
      "Prague Vltava river reflections Czech Republic",
      "Karlovy Vary spa colonnade Czech Republic",
    ],
    architecture: [
      "Prague Gothic Baroque spire old town Czech",
      "Czech Republic Art Nouveau building ornate",
      "Prague Renaissance town hall facade Czech",
      "Czech Republic Renaissance château countryside",
    ],
    urban_environment: [
      "Prague Wenceslas Square evening Czech Republic",
      "Prague old town square cobblestone Christmas",
      "Brno Czech Republic modern architecture district",
    ],
    cultural_traditional: [
      "Czech Republic Bohemian crystal glass craft",
      "Prague beer garden Czech pilsner tradition",
      "Czech Republic Karlovy Vary wafer oblat snack",
    ],
    ancient_ruins: [
      "Kutná Hora Czech Republic Sedlec bone church",
      "Czech Moravia megalith Celtic ancient",
    ],
    food_market: [
      "Prague trdelník pastry chimney street Czech",
      "Czech Republic svíčková beef sauce dumpling",
    ],
    aerial_panoramic: [
      "Prague aerial red roof old town Czech Republic",
      "Cesky Krumlov Czech Republic aerial river meander",
    ],
    seasonal_spectacle: [
      "Prague Christmas market Old Town Square Czech",
      "Czech Republic autumn vineyard Moravia golden",
      "Prague spring blossom riverside Czech Republic",
    ],
    cinematic_atmosphere: [
      "Prague Charles Bridge dawn mist river dramatic",
      "Prague Old Town night golden lantern Czech",
      "Cesky Krumlov Czech Republic castle dusk river",
    ],
    adventure_extreme: [
      "Czech Republic Bohemian Switzerland hiking arch",
      "Prague cycling Vltava riverside path Czech",
      "Czech Republic Moravian karst cave boat tour",
    ],
    nightlife_urban: [
      "Prague nightlife old town bar Czech Republic",
      "Czech Republic craft beer microbrewery pub",
    ],
    luxury_premium: [
      "Prague boutique hotel castle view Czech Republic",
    ],
    natural_landscapes: [
      "Czech Republic Bohemian Switzerland sandstone arch",
      "Moravia vineyard rolling hills Czech landscape",
    ],
    spiritual_religious: [
      "Prague St Vitus Cathedral Gothic Czech interior",
      "Czech Republic Olomouc Holy Trinity Column UNESCO",
    ],
  },

  hungary: {
    landmarks: [
      "Budapest Parliament Danube night Hungary",
      "Széchenyi Chain Bridge Budapest Hungary",
      "Buda Castle hill Hungary panorama Danube",
      "Budapest Fisherman's Bastion tower Hungary",
      "Ruin bar Budapest courtyard Hungary",
      "Hortobágy Great Plain Hungary puszta",
    ],
    architecture: [
      "Budapest Art Nouveau Jugendstil Hungary ornate",
      "Hungarian Parliament Neo-Gothic dome Hungary",
      "Budapest inner city thermal bath Hungary",
    ],
    cultural_traditional: [
      "Hungary Széchenyi thermal bath outdoor Hungary",
      "Hungarian folk embroidery Matyó pattern",
      "Hungary paprika market red spice stall",
    ],
    urban_environment: [
      "Budapest ruin bar Szimpla kert Hungary",
      "Budapest Grand Market Hall iron glass Hungary",
      "Budapest Andrássy Avenue boulevard Hungary",
    ],
    water_features: [
      "Danube River Budapest bridge sunset Hungary",
      "Lake Balaton Hungary sunset largest central",
    ],
    food_market: [
      "Hungary goulash beef paprika soup stew",
      "Budapest chimney cake street market Hungary",
      "Hungary lángos fried dough sour cream cheese",
      "Budapest Great Market Hall fresh food Hungary",
    ],
    aerial_panoramic: [
      "Budapest aerial Danube parliament Hungary night",
      "Hungary aerial Buda Castle hill Danube bridge",
    ],
    cinematic_atmosphere: [
      "Budapest Parliament Hungary night Danube reflection",
      "Budapest Chain Bridge fog morning Hungary",
      "Hungary Széchenyi bath steam golden interior",
    ],
    adventure_extreme: [
      "Hungary caving Aggtelek show cave underground",
      "Budapest escape room game Hungary",
      "Hungary cycling Danube bend scenic route",
    ],
    nightlife_urban: [
      "Budapest ruin bar Szimpla kert party Hungary",
      "Hungary Budapest nightclub cellar bar",
    ],
    luxury_premium: [
      "Budapest Gresham Palace luxury hotel Four Seasons",
    ],
    seasonal_spectacle: [
      "Budapest Christmas market vörösmarty Hungary",
      "Hungary Lake Balaton summer beach",
    ],
    vegetation_flora: [
      "Hungary Hortobágy puszta wildflower plain",
    ],
    spiritual_religious: [
      "Hungary Esztergom Basilica largest Hungary",
    ],
  },

  poland: {
    landmarks: [
      "Wawel Castle Krakow hilltop Poland Vistula",
      "Krakow Main Market Square Poland medieval",
      "Wieliczka Salt Mine underground crystal Poland",
      "Auschwitz Memorial Poland history grave solemn",
      "Warsaw Old Town reconstructed Poland",
      "Zakopane Tatra mountains Poland Highlands",
    ],
    architecture: [
      "Poland Gothic Brick church Malbork castle",
      "Krakow Poland Sukiennica Cloth Hall Gothic",
      "Wrocław colourful market square Poland",
    ],
    natural_landscapes: [
      "Tatra mountains Poland high rocky peak",
      "Poland Białowieża forest ancient primeval",
      "Mazury Poland lake district summer boat",
    ],
    cultural_traditional: [
      "Poland amber Baltic craft jewellery",
      "Krakow Poland Lajkonik parade costume",
      "Poland Christmas market Wrocław ornament",
    ],
    ancient_ruins: [
      "Malbork Castle Poland Teutonic Gothic",
      "Poland Gniezno cathedral Romanesque ancient",
    ],
    food_market: [
      "Poland pierogi dumpling boiled butter",
      "Poland żurek sour rye soup bread bowl",
      "Poland kielbasa sausage barbecue grill market",
      "Krakow Poland Stary Kleparz outdoor market fresh",
    ],
    aerial_panoramic: [
      "Krakow Poland aerial old town Wawel Castle",
      "Warsaw Poland aerial reconstructed old town",
      "Poland Tatra mountains aerial glacial lake",
    ],
    cinematic_atmosphere: [
      "Krakow Poland Main Market Square dusk golden",
      "Poland Wieliczka salt mine cathedral underground",
      "Warsaw Poland sunset Vistula river bridge",
      "Auschwitz Poland memorial solemn birch winter",
    ],
    adventure_extreme: [
      "Poland Tatra mountains hiking Rysy summit",
      "Poland kayaking Krutynia river lake district",
      "Poland cycling EuroVelo Baltic coast",
    ],
    nightlife_urban: [
      "Krakow Poland Kazimierz Jewish quarter bar",
      "Warsaw Poland Praga district bar nightlife",
    ],
    luxury_premium: [
      "Krakow Poland boutique hotel historic centre",
    ],
    seasonal_spectacle: [
      "Poland Krakow Christmas market December market",
      "Poland autumn Białowieża forest bison gold",
    ],
    vegetation_flora: [
      "Poland Białowieża primeval forest ancient oak",
    ],
    spiritual_religious: [
      "Poland Jasna Góra Czestochowa Black Madonna",
    ],
    wildlife_fauna: [
      "Poland European bison Białowieża primeval rare",
    ],
  },

  // ═══════════════════════════ NORDIC / NORTH EUROPE ═════════════════════════

  sweden: {
    landmarks: [
      "Stockholm Gamla Stan old town Sweden cobblestone",
      "Abisko Sweden aurora mountain lake reflection",
      "Gotland Visby medieval wall Sweden",
      "Icehotel Jukkasjärvi Sweden ice sculpture",
      "Stockholm archipelago island summer Sweden",
    ],
    winter_arctic: [
      "Sweden Northern Lights forest winter snow",
      "Sweden Icehotel room ice bed Sweden",
      "Sweden reindeer Sami Lapland snow herder",
      "Sweden cross-country ski trail winter white",
      "Kiruna Sweden midnight sun summer Sweden",
    ],
    natural_landscapes: [
      "Sweden Lapland birch tree autumn tundra",
      "Sweden lake forest summer canoe",
      "Sweden archipelago Stockholm granite island",
      "Abisko national park Sweden mountain stream",
    ],
    cultural_traditional: [
      "Sweden Midsommar maypole dance flowers",
      "Sweden fika coffee cake social tradition",
      "Sami Sweden traditional reindeer herder",
    ],
    urban_environment: [
      "Stockholm waterfront city hall Sweden",
      "Gothenburg canal tram street Sweden",
    ],
    food_market: [
      "Sweden gravlax cured salmon dill traditional",
      "Stockholm Christmas market Old Town Sweden",
      "Sweden IKEA meatball lingonberry traditional",
      "Stockholm glögg mulled wine Christmas market",
    ],
    aerial_panoramic: [
      "Stockholm archipelago Sweden aerial granite island",
      "Sweden Abisko aerial winter frozen lake mountain",
      "Stockholm Sweden aerial old town island water",
    ],
    cinematic_atmosphere: [
      "Stockholm Gamla Stan Sweden dusk reflection canal",
      "Sweden Northern Lights mountain reflection lake",
      "Sweden Icehotel ice room dramatic frozen",
    ],
    adventure_extreme: [
      "Sweden dogsledding Lapland Sami trail winter",
      "Sweden kayaking Stockholm archipelago island",
      "Sweden skiing Åre resort mountain Sweden",
    ],
    luxury_premium: [
      "Sweden Icehotel Jukkasjärvi room unique luxury",
      "Stockholm Sweden waterfront design hotel",
    ],
    nightlife_urban: [
      "Stockholm Södermalm bar rooftop view Sweden",
      "Sweden midsommar outdoor party lake",
    ],
    seasonal_spectacle: [
      "Sweden midsommar June maypole garland flower",
      "Sweden crayfish party August lake pier",
    ],
    vegetation_flora: [
      "Sweden Arctic birch autumn tundra golden",
      "Sweden forest blueberry picking summer green",
    ],
    spiritual_religious: [
      "Sweden Gamla Uppsala burial mounds Viking",
    ],
  },

  finland: {
    landmarks: [
      "Finland aurora borealis lake reflection",
      "Helsinki Cathedral Senate Square Finland",
      "Saariselkä Finland reindeer herd winter",
      "Finland Santa Claus Village Rovaniemi",
      "Helsinki waterfront market harbor Finland",
    ],
    winter_arctic: [
      "Finland Northern Lights forest aurora green",
      "Finland reindeer Lapland snow herder",
      "Finland husky dog sled winter Lapland",
      "Finland glass igloo sleep aurora sky",
      "Finland frozen lake ice fishing winter",
      "Finland sauna smoke lake jetty summer",
      "Finland snowmobile Lapland winter trail",
    ],
    natural_landscapes: [
      "Finland thousand lakes summer forest green",
      "Finland birch forest autumn gold",
      "Finland midnight sun lake horizon orange",
      "Nuuksio Finland national park lake summer",
    ],
    cultural_traditional: [
      "Finland sauna lake jump culture tradition",
      "Finland Kalevala folk tradition nature",
    ],
    food_market: [
      "Finland reindeer stew Lapland traditional",
      "Helsinki market square salmon soup Finland",
    ],
    aerial_panoramic: [
      "Finland lakes aerial summer green forest",
      "Finland Lapland aerial winter white snowscape",
      "Helsinki Finland aerial waterfront islands",
    ],
    cinematic_atmosphere: [
      "Finland aurora borealis reflection lake ice dark",
      "Finland glass igloo aurora sky dramatic night",
      "Finland fog lake summer morning misty",
    ],
    adventure_extreme: [
      "Finland husky sled Lapland trail winter",
      "Finland ice fishing frozen lake drill hole",
      "Finland snowmobile Lapland wilderness",
      "Finland wild swimming lake summer jump",
    ],
    luxury_premium: [
      "Finland aurora glass cabin luxury Lapland",
      "Helsinki Finland design hotel Nordic spa",
    ],
    nightlife_urban: [
      "Helsinki Finland bar terrace summer night",
      "Finland midsummer bonfire lake shore party",
    ],
    seasonal_spectacle: [
      "Finland midnight sun June July endless day",
      "Finland polar night December Lapland dark blue",
    ],
    urban_environment: [
      "Helsinki Finland design district coffee",
      "Turku Finland medieval castle river",
    ],
    vegetation_flora: [
      "Finland blueberry picking forest berry summer",
      "Finland autumn colours birch gold red",
    ],
    spiritual_religious: [
      "Temppeliaukio Helsinki Finland rock church carved",
    ],
  },

  denmark: {
    landmarks: [
      "Nyhavn canal colorful houses Copenhagen Denmark",
      "Kronborg Castle Helsingør Denmark Hamlet",
      "Little Mermaid statue Copenhagen harbour Denmark",
      "Frederiksborg Castle lake reflection Denmark",
      "Legoland Billund Denmark colorful brick",
    ],
    urban_environment: [
      "Copenhagen bicycle bridge canal Denmark",
      "Aarhus ARoS museum rainbow walkway Denmark",
      "Denmark hygge café warm candle interior",
    ],
    coastal_marine: [
      "Denmark North Sea beach dune grass",
      "Copenhagen harbour kayak Denmark",
      "Skagen where two seas meet Denmark",
    ],
    architecture: [
      "Danish half-timbered house colourful Denmark",
      "Copenhagen opera house modern Denmark",
      "Denmark Viking Age longhouse reconstruction",
    ],
    cultural_traditional: [
      "Denmark Christmas market Tivoli lights Copenhagen",
      "Denmark design furniture minimalist interior",
    ],
    food_market: [
      "Copenhagen smørrebrød open rye sandwich Denmark",
      "Denmark Noma new Nordic cuisine restaurant",
    ],
    aerial_panoramic: [
      "Copenhagen aerial canal bike path Denmark",
      "Denmark aerial Nyhavn colourful houses canal",
      "Skagen Denmark aerial two seas peninsula tip",
    ],
    cinematic_atmosphere: [
      "Nyhavn Copenhagen sunrise colourful reflection",
      "Denmark hygge candlelit window winter cosy",
      "Copenhagen Denmark bridge sunset dramatic water",
    ],
    adventure_extreme: [
      "Denmark cycling coastal dunes North Jutland",
      "Copenhagen harbour kayak Denmark self-guided",
      "Denmark surfing Klitmøller cold waves North Sea",
    ],
    luxury_premium: [
      "Copenhagen Noma Nordic luxury tasting menu",
      "Denmark design hotel minimalist Scandinavian",
    ],
    nightlife_urban: [
      "Copenhagen Meatpacking district bar nightlife",
      "Tivoli Gardens Denmark evening illuminated",
    ],
    seasonal_spectacle: [
      "Denmark Tivoli Christmas lights winter December",
      "Denmark midsummer bonfires June Sankthans",
    ],
    vegetation_flora: [
      "Denmark rapeseed yellow field spring",
      "Denmark beach grass dune North Sea coastal",
    ],
    spiritual_religious: [
      "Roskilde Cathedral Denmark Viking kings burial",
    ],
    transportation_iconic: [
      "Copenhagen metro Denmark modern efficient",
      "Denmark ferry island crossing Baltic sea",
    ],
  },

  netherlands: {
    landmarks: [
      "Amsterdam canal houses reflection tilted Netherlands",
      "Keukenhof tulip flower park Netherlands spring",
      "Kinderdijk windmill row Netherlands",
      "Anne Frank House Amsterdam Netherlands",
      "Rijksmuseum Amsterdam entrance Netherlands",
      "Giethoorn village canal boat Netherlands",
    ],
    natural_landscapes: [
      "Netherlands tulip field yellow red stripe",
      "Netherlands flat polder green windmill sky",
      "Netherlands flower bulb field spring color",
    ],
    urban_environment: [
      "Amsterdam bicycle canal bridge Netherlands",
      "Rotterdam modern architecture Netherlands port",
      "Delft blue pottery town Netherlands",
    ],
    architecture: [
      "Amsterdam canal house gabled roof Netherlands",
      "Netherlands windmill classic countryside",
      "Rotterdam cube house tilted Piet Netherlands",
    ],
    cultural_traditional: [
      "Netherlands wooden clog shoe traditional",
      "Amsterdam Jordaan district Netherlands market",
      "Netherlands King's Day orange crowd",
    ],
    food_market: [
      "Netherlands stroopwafel syrup cookie traditional",
      "Amsterdam herring bun street stall Netherlands",
    ],
    aerial_panoramic: [
      "Netherlands aerial tulip field stripe color",
      "Amsterdam aerial canal ring Netherlands",
      "Kinderdijk Netherlands aerial windmill row polder",
    ],
    cinematic_atmosphere: [
      "Amsterdam canal foggy morning Netherlands reflection",
      "Keukenhof tulip field Netherlands spring bloom pink",
      "Netherlands windmill sunset orange sky reflection",
    ],
    adventure_extreme: [
      "Netherlands cycling dike polder countryside wind",
      "Amsterdam skateboard Vondelpark Netherlands",
      "Netherlands kite surfing Zandvoort coast wind",
    ],
    luxury_premium: [
      "Amsterdam Netherlands luxury canal house hotel",
      "Netherlands hotel tulip garden suite view",
    ],
    nightlife_urban: [
      "Amsterdam Leidseplein nightlife bar square Netherlands",
      "Netherlands Amsterdam Paradiso music venue stage",
      "Amsterdam Red Light District neon canal Netherlands",
    ],
    seasonal_spectacle: [
      "Keukenhof Netherlands tulip spring field striped bloom",
      "Netherlands King's Day orange crowd Amsterdam canal",
      "Netherlands Christmas Amsterdam canal lights reflection",
    ],
    coastal_marine: [
      "Netherlands Zandvoort North Sea beach Netherlands",
      "Netherlands Texel island beach dune wildlife",
    ],
    transportation_iconic: [
      "Amsterdam Netherlands canal boat tour narrow",
      "Netherlands bicycle ferry Amsterdam",
    ],
  },

  belgium: {
    landmarks: [
      "Grand Place Brussels guild hall gold Belgium",
      "Bruges canal medieval bridge Belgium",
      "Bruges belfry tower market square Belgium",
      "Ghent Graslei waterfront Belgium medieval",
      "Manneken Pis statue Brussels Belgium",
      "Atomium Brussels dome Belgium landmark",
    ],
    architecture: [
      "Brussels Art Nouveau house ornate Belgium",
      "Bruges Gothic town hall Belgium",
      "Belgium chocolate shop display artisan",
    ],
    cultural_traditional: [
      "Belgium beer abbey Trappist monastery",
      "Belgium waffle street vendor Brussels",
      "Belgium Carnival Binche festival costume",
    ],
    urban_environment: [
      "Brussels European Quarter Belgium modern",
      "Antwerp fashion diamond district Belgium",
    ],
    food_market: [
      "Belgium Belgian chocolate praline artisan",
      "Brussels moules frites mussels Belgium",
      "Belgium Bruges chocolate shop window display",
    ],
    aerial_panoramic: [
      "Bruges aerial canal medieval Belgium",
      "Belgium Brussels aerial Grand Place golden roof",
      "Ghent Belgium aerial medieval three towers river",
    ],
    cinematic_atmosphere: [
      "Bruges Belgium canal bridge medieval evening mist",
      "Grand Place Brussels Belgium night illuminated gold",
      "Ghent Belgium three towers dusk river reflection",
    ],
    adventure_extreme: [
      "Belgium Ardennes kayaking Ourthe river canyon",
      "Belgium mountain biking Ardennes trail forest",
    ],
    luxury_premium: [
      "Bruges Belgium boutique hotel canal view",
      "Brussels Belgium luxury hotel Art Nouveau",
    ],
    nightlife_urban: [
      "Brussels Belgium bar Belgian craft beer scene",
      "Ghent Belgium student city bar canal nightlife",
    ],
    seasonal_spectacle: [
      "Belgium Ghent Light Festival art night January",
      "Belgium Christmas market Bruges medieval square",
    ],
    natural_landscapes: [
      "Belgium Ardennes forest hill valley river",
      "Belgium High Fens plateau misty moorland",
    ],
    transportation_iconic: [
      "Belgium Thalys Eurostar high-speed station Brussels",
    ],
    spiritual_religious: [
      "Bruges Belgium basilica holy blood relic",
      "Belgium Trappist monastery abbey beer garden",
    ],
  },

  austria: {
    landmarks: [
      "Hallstatt lake mountain village Austria",
      "Schönbrunn Palace Vienna Baroque garden Austria",
      "Vienna State Opera House gold Austria",
      "Belvedere Palace Upper Vienna Austria",
      "Grossglockner high alpine road Austria",
    ],
    natural_landscapes: [
      "Austria Alps valley glacier summer green",
      "Austria Tyrol meadow flower mountain",
      "Austria Salzburg lake mountain region",
    ],
    winter_arctic: [
      "Austria ski resort powder slope winter",
      "Austria Alps snow village Christmas lights",
      "Vienna snow Christmas market Austria winter",
    ],
    urban_environment: [
      "Vienna Ringstrasse boulevard Austria",
      "Vienna coffee house Kaffeehaus tradition",
      "Salzburg Mozart birthplace narrow Austria",
    ],
    cultural_traditional: [
      "Vienna Waltz New Year's Ball Austria",
      "Austria Dirndl Lederhosen Tyrol costume",
      "Austria alpine horn yodel mountain",
    ],
    food_market: [
      "Austria Wiener Schnitzel Vienna traditional",
      "Sachertorte chocolate cake Vienna Austria",
      "Vienna Christmas market mulled wine stall",
    ],
    architecture: [
      "Vienna Ringstrasse Gothic parliament Austria",
      "Salzburg Baroque church Austria ornate",
      "Austrian farm house alpine wooden balcony",
    ],
    aerial_panoramic: [
      "Hallstatt Austria aerial lake mountain",
      "Austrian Alps aerial valley glacier summer",
      "Vienna Austria aerial Ringstrasse boulevard",
    ],
    cinematic_atmosphere: [
      "Hallstatt Austria misty lake dawn reflection",
      "Vienna Austria Christmas market snow lantern glow",
      "Austrian Alps summit sunrise alpenglow",
      "Salzburg Austria Baroque dome fog morning",
    ],
    adventure_extreme: [
      "Austria Tyrol alpine hiking summit cross",
      "Austria ski freeride backcountry powder Alps",
      "Austria Stubai glacier skiing summer",
      "Austria via ferrata rock face Dolomite climbing",
    ],
    luxury_premium: [
      "Vienna Austria luxury grand hotel Ringstrasse",
      "Austria Arlberg ski chalet luxury slope",
      "Salzburg Austria castle hotel panoramic view",
    ],
    nightlife_urban: [
      "Vienna Austria Opera Ball glamour evening",
      "Vienna Austria jazz café wine bar Heurigen",
    ],
    wildlife_fauna: [
      "Austria chamois Alpine mountain goat cliff",
      "Austria golden eagle Alps soar thermal",
    ],
    seasonal_spectacle: [
      "Austria Christmas market snow lantern Vienna",
      "Austrian Alps spring wildflower meadow bloom",
      "Austria Hallstatt autumn fog lake mirror",
    ],
    spiritual_religious: [
      "Vienna St Stephen's Cathedral gothic Austria",
      "Salzburg Benedictine Nonnberg Abbey Austria",
    ],
  },

  germany: {
    landmarks: [
      "Neuschwanstein Castle fairy-tale Bavaria Germany",
      "Brandenburg Gate Berlin monument Germany",
      "Cologne Cathedral twin spire Rhine Germany",
      "Black Forest Germany dense dark pine",
      "Rhine Valley castle cliff vineyard Germany",
      "Berchtesgaden Eagle's Nest Alps Germany",
      "Oktoberfest Munich beer tent Germany",
    ],
    natural_landscapes: [
      "Germany Black Forest dense conifer dark",
      "Rhine Valley cliff vine terraced Germany",
      "Bavaria Alps mountain lake Germany",
      "Germany Bavarian countryside autumn harvest",
    ],
    urban_environment: [
      "Berlin modern glass mixed old Germany",
      "Munich Marienplatz town hall Germany",
      "Hamburg Speicherstadt canal warehouse Germany",
    ],
    architecture: [
      "Germany half-timbered fachwerk house village",
      "Berlin Reichstag glass dome Germany",
      "Germany Baroque cathedral ornate south",
    ],
    cultural_traditional: [
      "Oktoberfest Germany beer pretzels lederhosen",
      "Germany Christmas market Nuremburg lights",
      "Germany Carnival Rhineland costume parade",
    ],
    food_market: [
      "Germany bratwurst grill sauerkraut market",
      "Berlin currywurst street food Germany",
      "German Christmas market mulled wine stall",
    ],
    winter_arctic: [
      "Germany winter Bavaria snow village picture",
      "Germany Christmas market snow lights festive",
    ],
    aerial_panoramic: [
      "Neuschwanstein Germany aerial mountain forest",
      "Rhine Valley Germany aerial vineyard castle",
      "Berlin Germany aerial city bridge Spree",
      "Hamburg Germany aerial harbour Elbphilharmonie",
    ],
    cinematic_atmosphere: [
      "Neuschwanstein Germany winter fog fairy tale castle",
      "Berlin Germany Brandenburg Gate night light drama",
      "Cologne Germany Cathedral Rhine dusk golden",
      "Germany Black Forest snow pine winter moody",
    ],
    adventure_extreme: [
      "Germany Alps skiing Zugspitze Bavaria powder",
      "Germany Rhine cycle path vineyard hill",
      "Munich Germany Englischer Garten surf wave canal",
      "Germany Baltic Sea kite surfing wind beach",
    ],
    luxury_premium: [
      "Germany luxury spa Baden-Baden thermal bath",
      "Hamburg Germany Elbphilharmonie concert hall glass",
      "Germany Ritz Carlton Berlin luxury hotel suite",
    ],
    nightlife_urban: [
      "Berlin Germany techno club Berghain underground",
      "Munich Germany Oktoberfest beer hall dance",
      "Hamburg Germany Reeperbahn night entertainment",
    ],
    seasonal_spectacle: [
      "Germany Nuremberg Christmas market snow lantern",
      "Germany Rhine in Flames fireworks castle river",
      "Germany spring Blossom Cherry tree Bonn",
    ],
    coastal_marine: [
      "Germany North Sea mudflat Watt walk tidal",
      "Germany Baltic coast white chalk cliff Rugen",
      "Germany Sylt island North Sea beach red dune",
    ],
    spiritual_religious: [
      "Cologne Germany Gothic Cathedral interior stained glass",
      "Germany Neuschwanstein chapel interior ornate",
      "Germany Wies Church rococo ornate Bavaria",
    ],
    transportation_iconic: [
      "Germany Autobahn highway fast unlimited",
      "Germany ICE high-speed train platform sleek",
    ],
    wildlife_fauna: [
      "Germany stork nest village chimney spring",
      "Germany Bavarian forest wolf lynx rewilding",
    ],
  },

  ireland: {
    landmarks: [
      "Cliffs of Moher Ireland dramatic Atlantic",
      "Giant's Causeway basalt hexagonal Ireland",
      "Rock of Cashel Ireland medieval hilltop",
      "Skellig Michael island monastery Ireland",
      "Blarney Castle tower Cork Ireland",
      "Kilronan Aran Islands Ireland stone wall",
    ],
    natural_landscapes: [
      "Ireland green rolling hills stone wall",
      "Connemara bog lake mountain Ireland",
      "Galway Bay Atlantic coast Ireland",
      "Ireland countryside sheep farm mist",
    ],
    coastal_marine: [
      "Ireland Atlantic cliff storm wave dramatic",
      "Ring of Kerry coastal road Ireland",
      "Dingle Peninsula Ireland coast cliff",
    ],
    cultural_traditional: [
      "Ireland pub traditional music fiddle session",
      "Ireland St Patrick's Day green parade",
      "Ireland Celtic knotwork ancient symbol",
    ],
    architecture: [
      "Dublin Georgian red door house Ireland",
      "Ireland round tower monastery medieval",
    ],
    food_market: [
      "Ireland stew lamb pub traditional food",
      "Dublin Guinness brewery Ireland dark stout",
    ],
    aerial_panoramic: [
      "Ireland Cliffs of Moher aerial Atlantic",
    ],
    cinematic_atmosphere: [
      "Ireland green misty morning valley sheep",
      "Cliffs of Moher Ireland storm wave dramatic",
      "Giant's Causeway Ireland golden sunset basalt",
      "Skellig Michael Ireland island cliff dramatic sea",
    ],
    adventure_extreme: [
      "Ireland surfing Sligo Atlantic wave",
      "Ireland cliff walk Moher UNESCO coastal",
      "Ireland sea kayaking wild Atlantic Donegal",
      "Connemara Ireland trail running mountain",
    ],
    luxury_premium: [
      "Ireland Ashford Castle luxury hotel Cong",
      "Ireland country house hotel estate parkland",
    ],
    nightlife_urban: [
      "Dublin Temple Bar Ireland pub live music night",
      "Galway Ireland pub session trad music outdoor",
    ],
    seasonal_spectacle: [
      "Ireland St Patrick's Day March green parade",
      "Ireland autumn October Halloween Samhain origin",
    ],
    vegetation_flora: [
      "Ireland gorse yellow flower coastal cliff",
      "Ireland wild Burren flower limestone plateau",
    ],
    transportation_iconic: [
      "Ireland Wild Atlantic Way coastal road drive",
      "Dublin Ireland DART train coast sea view",
    ],
    urban_environment: [
      "Dublin Ireland Temple Bar colourful facade",
      "Cork Ireland English Market food hall",
    ],
    spiritual_religious: [
      "Ireland Glendalough monastic site round tower",
      "Ireland Croagh Patrick pilgrimage mountain",
    ],
  },

  unitedkingdom: {
    landmarks: [
      "Big Ben Westminster Bridge Thames London",
      "Tower Bridge Thames London iconic England",
      "Stonehenge stone circle Wiltshire England",
      "Windsor Castle royal England Berkshire",
      "Buckingham Palace guard London England",
      "British Museum London columns England",
      "Glastonbury Festival England summer UK",
    ],
    natural_landscapes: [
      "England Peak District moorland purple heather",
      "England Cotswolds village honey stone",
      "Lake District Cumbria England fells reflection",
      "Yorkshire Dales England limestone wall",
    ],
    urban_environment: [
      "London Canary Wharf glass tower reflection",
      "London Borough Market food hall England",
      "London red double-decker bus iconic",
      "Manchester Northern Quarter England street art",
    ],
    architecture: [
      "England Georgian terrace Bath stone elegant",
      "London Victorian red brick terrace housing",
      "Oxford University gothic quadrangle England",
    ],
    cultural_traditional: [
      "England cricket match village green summer",
      "Royal Ascot horse racing hat England",
      "England tea cup scone traditional afternoon",
    ],
    food_market: [
      "London Borough Market artisan food stall",
      "England fish chips newspaper seaside",
    ],
    aerial_panoramic: [
      "London aerial Thames bridge city England",
      "England Cotswolds aerial honey village green",
      "Lake District England aerial fells reflection",
    ],
    cinematic_atmosphere: [
      "London Thames fog dramatic Tower Bridge night",
      "England countryside morning mist rolling green",
      "London underground tube Baker Street vintage",
      "Stonehenge England winter solstice dawn dramatic",
    ],
    adventure_extreme: [
      "England Dartmoor wild camping moor tent",
      "Wales Snowdonia mountain hiking UK",
      "England coastal path cliff walk Jurassic",
      "Lake District England wild swim cold",
    ],
    wildlife_fauna: [
      "England red kite bird of prey soar Wales",
      "England coastal puffin Bempton cliff",
      "England deer Richmond Park autumn stag",
    ],
    luxury_premium: [
      "London Claridge's luxury hotel art deco England",
      "England country house hotel estate grounds",
      "London Michelin restaurant tasting menu England",
    ],
    nightlife_urban: [
      "London Soho bar pub vibrant night scene",
      "Manchester Northern Quarter England live music",
      "London West End theatre show evening England",
    ],
    seasonal_spectacle: [
      "England Chelsea Flower Show bloom spring London",
      "England Glastonbury Festival field crowd summer",
      "London Bonfire Night fireworks Thames November",
    ],
    transportation_iconic: [
      "London red double-decker bus Big Ben iconic",
      "England steam railway heritage countryside",
    ],
    spiritual_religious: [
      "England Canterbury Cathedral gothic pilgrimage",
      "York Minster England Gothic interior stained glass",
      "England Salisbury Cathedral spire medieval",
    ],
  },

  scotland: {
    landmarks: [
      "Edinburgh Castle rock skyline Scotland",
      "Old Man of Storr Isle of Skye Scotland",
      "Eilean Donan Castle Scotland loch",
      "Glencoe valley dramatic mountain Scotland",
      "Glenfinnan Viaduct Scotland steam train Harry Potter",
      "Loch Ness Scotland monster legend dark water",
    ],
    natural_landscapes: [
      "Scottish Highlands glens mountain mist",
      "Isle of Skye Scotland Cuillin mountain",
      "Scotland loch mirror reflection autumn",
      "Scotland moorland heather purple",
    ],
    coastal_marine: [
      "Scotland Atlantic coast dramatic cliff",
      "Scotland sea cave arch rocky shore",
      "Orkney Skara Brae coast Scotland ancient",
    ],
    cultural_traditional: [
      "Scotland Highland Games caber toss kilt",
      "Scotland bagpipe kilt Edinburgh castle",
      "Edinburgh Hogmanay New Year Scotland",
    ],
    cinematic_atmosphere: [
      "Scotland misty glen dramatic fog mountain",
      "Scotland golden moorland sunset heather",
    ],
    ancient_ruins: [
      "Scotland Skara Brae prehistoric village stone",
      "Scotland medieval castle ruin highland",
    ],
    aerial_panoramic: [
      "Scotland aerial Highlands valley loch aerial",
      "Scotland aerial Isle of Skye dramatic peninsula",
      "Scotland Glencoe aerial valley glacier carved",
    ],
    wildlife_fauna: [
      "Scotland red deer stag Highland autumn rut",
      "Scotland golden eagle Highland sky soar",
      "Scotland puffin seabird cliff nesting Isle",
      "Scotland red squirrel forest woodland",
      "Scotland Highland cattle shaggy orange glen",
    ],
    adventure_extreme: [
      "Scotland munro bagging mountain summit Highland",
      "Scotland mountain biking Torridon trail",
      "Scotland wild swimming loch clear cold",
      "Scotland kayak sea cave Atlantic coast",
      "Scotland white water rafting River Tay",
    ],
    food_market: [
      "Scotland single malt whisky distillery Scotland",
      "Scotland smoked salmon Scottish highland",
      "Edinburgh Scotland food market artisan stall",
      "Scotland haggis neeps tatties traditional meal",
      "Scotland Scottish shortbread cream tea",
    ],
    luxury_premium: [
      "Scotland Highland castle hotel loch view",
      "Scotland luxury glamping pod aurora Highland",
      "Edinburgh boutique hotel old town Scotland",
    ],
    architecture: [
      "Edinburgh Scotland New Town Georgian terrace",
      "Scotland St Andrews Cathedral ruins medieval",
      "Edinburgh Holyrood Palace Scotland royal",
    ],
    seasonal_spectacle: [
      "Scotland aurora borealis Highland winter green",
      "Scotland autumn golden glen Glencoe October",
      "Edinburgh Hogmanay torchlight procession Scotland",
    ],
  },

  // ══════════════════════════════ GULF/LEVANT ═════════════════════════════════

  saudiarabia: {
    landmarks: [
      "AlUla Hegra nabataean rock tomb Saudi Arabia",
      "Riyadh Edge of the World escarpment Saudi",
      "Masmak Fortress Riyadh Saudi Arabia mud brick",
      "Saudi Arabia Diriyah ancient walled town",
      "Jeddah Al-Balad old town coral house Saudi",
    ],
    desert_arid: [
      "Saudi Arabia Rub' al Khali Empty Quarter vast dune",
      "Saudi Arabia red dune desert Hijaz sand",
      "Saudi Asir mountains terraced village highland",
      "Saudi Arabia sand sea golden horizon",
    ],
    architecture: [
      "Saudi Arabia mudbrick fortress tower",
      "Riyadh modern glass Kingdom Tower Saudi",
      "Saudi Arabia Nabataean carved cliff tomb",
      "Jeddah coral stone traditional Saudi heritage",
    ],
    cultural_traditional: [
      "Saudi Arabia traditional falcon hawking desert",
      "Saudi Arabia coffee ceremony dallah gold",
    ],
    luxury_premium: [
      "NEOM futuristic city Saudi Arabia concept",
      "AlUla luxury resort canyon Saudi Arabia",
    ],
    ancient_ruins: [
      "Hegra Saudi Arabia Nabataean tomb carved rock",
      "Madain Saleh Saudi pillar carved facade",
      "Diriyah Saudi Arabia mud brick walled city",
    ],
    cinematic_atmosphere: [
      "AlUla Saudi Arabia canyon dusk golden rock",
      "Saudi Arabia Empty Quarter vast dune sunset orange",
      "Jeddah Saudi corniche Red Sea sunset dramatic",
    ],
    adventure_extreme: [
      "Saudi Arabia dune bashing Empty Quarter",
      "AlUla rock climbing canyon adventure Saudi",
      "Saudi Arabia camel race desert traditional",
    ],
    food_market: [
      "Saudi Arabia kabsa rice lamb traditional",
      "Jeddah Saudi seafood Red Sea market fresh",
      "Riyadh Al-Zal historic market Saudi",
    ],
    aerial_panoramic: [
      "AlUla Saudi Arabia aerial canyon rock vast",
      "Riyadh Saudi Arabia aerial modern city",
    ],
    seasonal_spectacle: [
      "Saudi Arabia Riyadh Season Festival lights event",
      "AlUla Saudi Arabia winter arts festival",
    ],
  },

  qatar: {
    landmarks: [
      "Museum of Islamic Art Doha waterfront Qatar",
      "Souq Waqif Doha traditional market Qatar",
      "West Bay skyline Doha Qatar glass towers",
      "National Museum Qatar wave architecture",
      "Katara Cultural Village Doha amphitheatre Qatar",
    ],
    urban_environment: [
      "Doha corniche waterfront promenade Qatar",
      "Qatar Education City futuristic dome",
      "Doha night skyline reflection water Qatar",
      "Doha Qatar West Bay skyline glass tower night",
      "Qatar Pearl Island luxury marina yacht Doha",
      "Doha Msheireb Downtown smart city Qatar",
    ],
    desert_arid: [
      "Qatar Inland Sea Khor Al Adaid dune",
      "Qatar desert 4x4 dune bashing golden",
    ],
    luxury_premium: [
      "Qatar luxury hotel Doha beach infinity pool",
      "Doha Pearl Qatar artificial island luxury",
    ],
    architecture: [
      "Doha Islamic geometric architecture facade Qatar",
      "Qatar modern glass tower futuristic Doha",
    ],
    food_market: [
      "Qatar Souq Waqif spice stall Doha",
      "Qatar Arabic coffee machboos rice traditional",
      "Doha Qatar fish market fresh seafood",
      "Qatar modern restaurant skyline view Doha",
    ],
    cinematic_atmosphere: [
      "Doha Qatar skyline night mirror water dramatic",
      "Qatar Inland Sea dune meets sea dramatic",
      "Doha Museum of Islamic Art sunset water",
    ],
    adventure_extreme: [
      "Qatar Inland Sea 4x4 sand dune",
      "Qatar dune buggy desert tour golden",
    ],
    aerial_panoramic: [
      "Doha Qatar aerial skyline Pearl district",
      "Qatar Inland Sea aerial dune meets water",
    ],
    cultural_traditional: [
      "Qatar falconry traditional Bedouin heritage",
      "Qatar dhow wooden boat harbour sunset",
    ],
    seasonal_spectacle: [
      "Qatar winter festival December cool desert air",
      "Qatar FIFA World Cup stadiums 2022 legacy",
      "Qatar National Day December parade traditional",
      "Qatar Eid festival Doha fireworks Corniche night",
    ],
    natural_landscapes: [
      "Qatar Inland Sea Khor Al Adaid UNESCO dune sea",
      "Qatar mangrove Al Thakira kayak green estuary",
      "Qatar rocky escarpment Zekreet limestone plateau",
    ],
    nightlife_urban: [
      "Doha Qatar W Hotel rooftop bar night skyline",
      "Qatar Katara Amphitheatre cultural night show",
      "Doha Qatar mall luxury shopping evening Pearl",
    ],
    spiritual_religious: [
      "Doha Qatar Islamic museum prayer hall ornate",
      "Qatar Grand Mosque Doha white interior",
      "Qatar Souq Waqif mosque minaret traditional",
    ],
    transportation_iconic: [
      "Qatar Airways A380 luxury cabin business class",
      "Doha Qatar metro modern station futuristic",
      "Qatar dhow traditional heritage harbour racing",
    ],
    wildlife_fauna: [
      "Qatar oryx desert national symbol wildlife",
      "Qatar flamingo mangrove pink bird Al Thakira",
      "Qatar turtle nesting beach Fuwairit",
    ],
    vegetation_flora: [
      "Qatar Al Khor mangrove forest green estuary",
      "Qatar desert wildflower bloom winter rain",
    ],
    festival_celebration: [
      "Qatar National Day parade military heritage camel",
      "Doha Qatar International Food Festival outdoor",
    ],
    ancient_ruins: [
      "Al Zubarah Qatar UNESCO pearl diving village fort",
      "Qatar historic fort tower stone desert ruin",
    ],
  },

  oman: {
    landmarks: [
      "Sultan Qaboos Grand Mosque Muscat Oman",
      "Musandam fjord Khasab Oman turquoise",
      "Nizwa Fort Oman mud tower ancient",
      "Wahiba Sands Oman desert dune",
      "Mutrah Souq Muscat Oman traditional",
      "Al Hajar mountains wadi Oman dramatic",
    ],
    desert_arid: [
      "Wahiba Sands Oman red dune vast desert",
      "Oman Wadi Bani Khalid emerald pool",
      "Oman desert camp traditional Bedouin",
      "Oman Hajar Mountains dramatic wadi dry",
    ],
    coastal_marine: [
      "Oman Musandam dhow cruise turquoise fjord",
      "Oman turtle nesting beach Ras Al Jinz",
      "Oman clear sea dive coral Indian Ocean",
    ],
    cultural_traditional: [
      "Oman Muscat old soul silver khanjar",
      "Omani traditional dishdasha robe market",
      "Oman falconry traditional desert Arabia",
    ],
    natural_landscapes: [
      "Oman green Dhofar monsoon khareef unusual",
      "Oman Jebel Akhdar green highland terraced",
      "Oman wadi pool lush green palm gorge",
    ],
    architecture: [
      "Oman mud fort tower ancient watchtower",
      "Oman whitewash building Muscat ornate",
      "Sultan Qaboos mosque Muscat interior mosaic",
      "Nizwa fort Oman round tower mud brick",
    ],
    cinematic_atmosphere: [
      "Oman Wahiba Sands dune sunset orange gold",
      "Musandam Oman fjord turquoise dhow dramatic",
      "Oman Jebel Shams canyon dramatic cliff edge",
    ],
    adventure_extreme: [
      "Oman Jebel Akhdar via ferrata canyon trek",
      "Oman Wadi Shab hike swim cave emerald",
      "Oman 4x4 Wahiba Sands dune bashing",
      "Oman sea kayaking Musandam fjord dolphin",
    ],
    luxury_premium: [
      "Oman Alila Jabal Akhdar cliff luxury resort",
      "Oman Six Senses Zighy Bay beach villa",
    ],
    food_market: [
      "Oman shuwa slow-cooked lamb traditional",
      "Muscat Oman Muttrah Souq spice silver",
      "Oman halwa sweet rosewater traditional",
    ],
    aerial_panoramic: [
      "Oman Wahiba Sands aerial dune pattern",
      "Musandam Oman aerial fjord turquoise cliff",
    ],
    seasonal_spectacle: [
      "Oman Khareef Salalah monsoon green July",
      "Oman turtle nesting season May July Ras Al Jinz",
    ],
    urban_environment: [
      "Muscat Oman corniche white mosque promenade",
    ],
  },

  lebanon: {
    landmarks: [
      "Baalbek Roman temple Jupiter Lebanon",
      "Beirut Corniche Mediterranean Lebanon promenade",
      "Byblos ancient harbor Lebanon Phoenician",
      "Jeita Grotto stalactite cave Lebanon boat",
      "Qadisha Valley Lebanon monastery cliff",
    ],
    natural_landscapes: [
      "Lebanon cedar tree ancient Bcharre mountain",
      "Lebanon mountain ski slope winter Faraya",
      "Shouf Biosphere Reserve Lebanon cedar valley",
    ],
    ancient_ruins: [
      "Baalbek Roman column Lebanon temple largest",
      "Tyre Lebanon ancient city Roman ruins",
      "Byblos Lebanon Phoenician excavation",
    ],
    cultural_traditional: [
      "Beirut fashion café vibrant Lebanon",
      "Lebanon mezze spread table food colorful",
    ],
    food_market: [
      "Lebanon mezze hummus fattoush kibbeh",
      "Beirut street vendor man'oushe Lebanon",
    ],
    coastal_marine: [
      "Lebanon Mediterranean coast cliff sunset",
      "Beirut beach Ramlet el Baida Lebanon",
      "Lebanon Tyre beach clear Mediterranean",
    ],
    cinematic_atmosphere: [
      "Baalbek Lebanon Jupiter temple columns sunset",
      "Qadisha Valley Lebanon monastery cliff mist",
      "Beirut Lebanon sunset corniche Mediterranean",
    ],
    adventure_extreme: [
      "Lebanon ski Faraya Mzaar winter snow",
      "Lebanon Chouf mountain hiking trail cedar",
      "Lebanon canyoning Nahr Ibrahim gorge water",
    ],
    nightlife_urban: [
      "Beirut Lebanon nightlife Gemmayze bar vibrant",
      "Beirut rooftop bar Mediterranean view Lebanon",
    ],
    urban_environment: [
      "Beirut Lebanon downtown reconstructed Solidere",
      "Byblos Lebanon old port fishing colourful",
    ],
    luxury_premium: [
      "Beirut Lebanon luxury hotel rooftop pool",
    ],
    seasonal_spectacle: [
      "Lebanon spring wildflower mountain bloom May",
      "Lebanon cedar snow winter Bcharre January",
    ],
    aerial_panoramic: [
      "Baalbek Lebanon aerial Roman temple vast",
      "Beirut Lebanon aerial city coast Mediterranean",
    ],
    spiritual_religious: [
      "Lebanon Harissa Our Lady statue mountain",
    ],
  },

  // ════════════════════════════════ EAST AFRICA ════════════════════════════════

  madagascar: {
    landmarks: [
      "Avenue of the Baobabs Madagascar sunset",
      "Tsingy de Bemaraha needle limestone Madagascar",
      "Madagascar lemur ring-tailed tree",
      "Isalo canyon red sandstone Madagascar",
    ],
    wildlife_fauna: [
      "Madagascar ring-tailed lemur group rock",
      "Madagascar chameleon colorful branch",
      "Madagascar fossa predator forest",
      "Madagascar aye-aye nocturnal primate",
      "Madagascar whale humpback sea bay",
      "Madagascar lemur indri black white tree",
    ],
    natural_landscapes: [
      "Madagascar baobab tree sunset orange field",
      "Madagascar red laterite road landscape",
      "Masoala Peninsula Madagascar rainforest beach",
    ],
    tropical_lush: [
      "Madagascar rainforest endemic species lush",
      "Madagascar highland rice terrace landscape",
    ],
    coastal_marine: [
      "Madagascar turquoise lagoon coral reef",
      "Nosy Be Madagascar beach palm tropical",
    ],
    aerial_panoramic: [
      "Madagascar baobab avenue aerial sunset",
      "Tsingy de Bemaraha Madagascar aerial needle",
      "Madagascar Isalo canyon aerial red sandstone",
    ],
    cinematic_atmosphere: [
      "Avenue of Baobabs Madagascar twilight silhouette",
      "Madagascar Tsingy limestone needle dramatic sky",
      "Madagascar chameleon branch vivid color close-up",
    ],
    adventure_extreme: [
      "Madagascar Tsingy de Bemaraha hike harness",
      "Madagascar whale watching Sainte-Marie island",
      "Madagascar kayak Nosy Be island hop",
    ],
    cultural_traditional: [
      "Madagascar Merina highland people rice paddy",
      "Madagascar zebu cattle village traditional",
    ],
    food_market: [
      "Madagascar vanilla plantation spice Sava",
      "Madagascar romazava stew leafy traditional",
    ],
    luxury_premium: [
      "Madagascar Nosy Be luxury bungalow beach",
    ],
    seasonal_spectacle: [
      "Madagascar dry season June September baobab",
      "Madagascar humpback whale July September Sainte-Marie",
    ],
  },

  seychelles: {
    landmarks: [
      "Anse Source d'Argent beach pink granite Seychelles",
      "La Digue Seychelles granite boulder beach",
      "Vallée de Mai primeval palm forest Seychelles",
      "Praslin island Seychelles coco de mer palm",
    ],
    coastal_marine: [
      "Seychelles turquoise lagoon coral reef snorkel",
      "Seychelles white sand beach clear water crystal",
      "Mahé Seychelles tropical bay island",
      "Seychelles beach sunset silhouette palm",
      "Seychelles sea turtle swimming clear water",
    ],
    wildlife_fauna: [
      "Seychelles giant tortoise Aldabra island",
      "Seychelles sea turtle nesting beach night",
      "Seychelles fairy tern white bird unique",
      "Seychelles hawksbill turtle coral reef",
    ],
    luxury_premium: [
      "Seychelles private island resort overwater villa",
      "Seychelles infinity pool clear sea resort",
    ],
    aerial_panoramic: [
      "Seychelles aerial granite island turquoise",
      "La Digue Seychelles aerial small island reef",
    ],
    tropical_lush: [
      "Seychelles jungle path coco palm forest",
      "Seychelles Vallée de Mai endemic palm canopy",
      "Seychelles tropical island endemic bird quiet",
    ],
    cinematic_atmosphere: [
      "Seychelles sunrise granite boulder pink sky",
      "La Digue Seychelles golden hour beach dramatic",
      "Seychelles turquoise sea granite rock frame",
    ],
    adventure_extreme: [
      "Seychelles snorkelling marine national park",
      "Seychelles deep sea fishing charter boat",
      "Seychelles kayak island hop clear sea",
    ],
    cultural_traditional: [
      "Seychelles creole music festival island",
      "Seychelles colourful fishing village La Digue",
    ],
    food_market: [
      "Seychelles grilled fish creole fresh market",
      "Seychelles ladob coconut dessert island",
      "Seychelles market Victoria Mahé fresh produce",
    ],
    natural_landscapes: [
      "Seychelles endemic bird rare bird watching",
      "Seychelles coral atoll flat island blue",
    ],
    seasonal_spectacle: [
      "Seychelles calm flat sea northwest monsoon December",
      "Seychelles southeast monsoon wave July dramatic",
    ],
  },

  maldives: {
    landmarks: [
      "Maldives overwater bungalow turquoise lagoon",
      "Maldives water villa wooden deck Indian Ocean",
      "Maldives atoll aerial channel turquoise",
      "Maldives sunset orange silhouette jetty water",
    ],
    coastal_marine: [
      "Maldives coral reef snorkel tropical fish",
      "Maldives crystal clear water coral garden",
      "Maldives manta ray graceful underwater",
      "Maldives whale shark snorkel blue water",
      "Maldives underwater restaurant glass floor",
      "Maldives reef shark patrolling coral",
    ],
    luxury_premium: [
      "Maldives luxury resort infinity pool private",
      "Maldives villa private pool sea deck",
      "Maldives champagne beach sunset couple",
      "Maldives underwater room hotel bed glass",
    ],
    aerial_panoramic: [
      "Maldives aerial atoll ring reef channel",
      "Maldives seaplane aerial turquoise island",
    ],
    natural_landscapes: [
      "Maldives pristine white sand beach palm",
      "Maldives bioluminescent night beach glow",
      "Maldives sandbank emerald water white sand",
      "Maldives palm island flat atoll low horizon",
    ],
    cinematic_atmosphere: [
      "Maldives sunset overwater villa silhouette golden",
      "Maldives morning calm mirror flat sea reflection",
      "Maldives night sky stars tropical dark island",
      "Maldives twilight jetty couple walk romantic",
    ],
    tropical_lush: [
      "Maldives island palm tree white beach Indian Ocean",
      "Maldives tropical garden resort path",
    ],
    adventure_extreme: [
      "Maldives surfing break wave tropical",
      "Maldives night dive bioluminescent plankton",
      "Maldives parasailing tropical ocean",
      "Maldives kitesurfing wind flat lagoon",
    ],
    cultural_traditional: [
      "Maldives local island fishing community",
      "Maldivian traditional dhoni wooden boat",
      "Maldives Male capital mosques island nation",
    ],
    food_market: [
      "Maldives fresh seafood barbecue beach resort",
      "Maldives underwater restaurant table dining",
      "Maldives breakfast overwater deck tropical",
    ],
    transportation_iconic: [
      "Maldives seaplane landing atoll aerial turquoise",
      "Maldives speedboat resort transfer island",
      "Maldives traditional dhow wooden boat sunset",
    ],
    seasonal_spectacle: [
      "Maldives dry season clear water January April",
      "Maldives whale shark season May June",
    ],
  },

  mauritius: {
    landmarks: [
      "Le Morne Brabant cliff Mauritius mountain sea",
      "Chamarel seven colored earth Mauritius",
      "Black River Gorges Mauritius green valley",
      "Mauritius underwater waterfall illusion sand",
    ],
    coastal_marine: [
      "Mauritius turquoise lagoon reef beach",
      "Mauritius blue bay snorkel coral fish",
      "Mauritius catamaran cruise island sunset",
      "Mauritius volcanic rock beach dramatic",
    ],
    luxury_premium: [
      "Mauritius luxury hotel overwater villa resort",
      "Mauritius honeymoon beach couple sunset",
    ],
    wildlife_fauna: [
      "Mauritius dodo bird sculpture island",
      "Mauritius deer black river park",
    ],
    natural_landscapes: [
      "Mauritius valley green tea plantation",
      "Mauritius waterfall tropical forest",
      "Mauritius mountain Le Pouce Piton de la Petite Rivière Noire",
      "Mauritius Black River Gorges waterfall valley",
    ],
    aerial_panoramic: [
      "Mauritius aerial lagoon turquoise island",
      "Mauritius aerial underwater waterfall sand channel",
      "Mauritius aerial Le Morne mountain sea",
    ],
    cinematic_atmosphere: [
      "Mauritius sunset horizon Indian Ocean purple",
      "Mauritius Chamarel valley mist morning dramatic",
      "Mauritius waterfall cascade tropical forest dramatic",
    ],
    adventure_extreme: [
      "Mauritius kitesurfing One Eye beach wind",
      "Mauritius quad biking volcanic crater adventure",
      "Mauritius shark diving lagoon reef",
      "Mauritius zip-line Black River Gorges forest",
    ],
    cultural_traditional: [
      "Mauritius Hindu festival Maha Shivaratri pilgrims",
      "Mauritius Creole multicultural island festival",
      "Mauritius sugar cane field plantation",
    ],
    food_market: [
      "Mauritius dholl puri street food island",
      "Mauritius seafood market Port Louis fish",
      "Mauritius rum distillery tropical island",
      "Mauritius colourful Port Louis market produce",
    ],
    transportation_iconic: [
      "Mauritius catamaran sunset island cruise",
      "Mauritius golf course sea view luxury resort",
    ],
    vegetation_flora: [
      "Mauritius tropical forest endemic palm garden",
      "Mauritius Pamplemousses botanical garden giant lily",
    ],
    seasonal_spectacle: [
      "Mauritius summer December turquoise calm lagoon",
      "Mauritius winter July whale watching Southern",
    ],
  },

  // ═══════════════════════════════ SOUTH ASIA ═════════════════════════════════

  bhutan: {
    landmarks: [
      "Tiger's Nest Paro Taktsang cliff monastery Bhutan",
      "Punakha Dzong fortress river Bhutan",
      "Bhutan prayer flag mountain pass colorful",
      "Thimphu Buddha statue hilltop Bhutan",
    ],
    spiritual_religious: [
      "Bhutan monastery cliff mountain sacred",
      "Bhutan monk robe traditional prayer",
      "Bhutan prayer wheel monastery ancient",
      "Bhutan incense butter lamp monastery",
    ],
    natural_landscapes: [
      "Bhutan Himalaya mountain valley village",
      "Bhutan forest rhododendron spring blooms",
      "Bhutan highland yak grazing peaceful",
    ],
    cultural_traditional: [
      "Bhutan traditional festival mask dance",
      "Bhutan archer traditional bow sport",
      "Bhutan men gho robe traditional dress",
    ],
    aerial_panoramic: [
      "Bhutan Tiger's Nest aerial cliff monastery",
      "Bhutan Himalaya valley aerial green forest",
    ],
    cinematic_atmosphere: [
      "Bhutan mist valley monastery peaceful dawn",
      "Tiger's Nest Bhutan cliff dramatic golden morning",
      "Bhutan prayer flag mountain pass wind dramatic",
      "Bhutan rice terrace valley green village quiet",
    ],
    adventure_extreme: [
      "Bhutan Jomolhari Trek Himalaya high altitude",
      "Bhutan Snowman Trek remote difficult mountains",
      "Bhutan mountain bike Paro valley trail",
    ],
    luxury_premium: [
      "Bhutan Amankora luxury lodge mountain valley",
      "Bhutan eco-lodge forest river private",
    ],
    food_market: [
      "Bhutan ema datshi chilli cheese dish national",
      "Bhutan red rice traditional meal monastery",
    ],
    seasonal_spectacle: [
      "Bhutan Paro Tsechu festival mask spring March",
      "Bhutan rhododendron bloom spring April forest",
    ],
    wildlife_fauna: [
      "Bhutan black-necked crane winter Phobjikha",
      "Bhutan takin national animal forest endemic",
    ],
    vegetation_flora: [
      "Bhutan rhododendron red pink forest bloom",
      "Bhutan blue pine forest monastery",
    ],
    transportation_iconic: [
      "Bhutan Paro airport mountain landing dramatic",
    ],
  },

  srilanka: {
    landmarks: [
      "Sigiriya lion rock fortress Sri Lanka ancient",
      "Nine Arch Bridge Ella train Sri Lanka",
      "Temple of the Tooth Kandy Sri Lanka",
      "Dambulla cave temple Sri Lanka golden",
      "Polonnaruwa ancient city Sri Lanka ruin",
      "Galle Dutch Fort Sri Lanka wall coast",
    ],
    natural_landscapes: [
      "Sri Lanka tea plantation hill misty green",
      "Sri Lanka Ella mountain valley green",
      "Sri Lanka waterfall tropical lush",
      "Yala national park Sri Lanka dry landscape",
    ],
    wildlife_fauna: [
      "Sri Lanka elephant herd Minneriya lake",
      "Sri Lanka leopard Yala national park",
      "Sri Lanka blue whale world's largest",
      "Sri Lanka stilt fisherman traditional coast",
    ],
    coastal_marine: [
      "Sri Lanka tropical beach palm turquoise",
      "Mirissa beach Sri Lanka whale watch",
      "Sri Lanka Unawatuna bay clear snorkel",
    ],
    cultural_traditional: [
      "Sri Lanka Kandy Perahera elephant festival",
      "Sri Lanka monk orange robe temple",
      "Sri Lanka colorful tuk-tuk street",
    ],
    food_market: [
      "Sri Lanka hoppers rice pancake traditional",
      "Sri Lanka kottu roti chop street food",
    ],
    aerial_panoramic: [
      "Sri Lanka Sigiriya aerial rock forest",
      "Sri Lanka Nine Arch Bridge aerial train valley",
      "Sri Lanka tea estate aerial green hillside",
    ],
    cinematic_atmosphere: [
      "Sigiriya Sri Lanka sunrise mist ancient rock",
      "Sri Lanka Ella Nine Arch Bridge train misty",
      "Sri Lanka temple incense smoke golden dusk",
      "Sri Lanka stilt fisherman sunset silhouette coast",
      "Sri Lanka tea plantation mist morning green",
    ],
    adventure_extreme: [
      "Sri Lanka surfing Arugam Bay point break wave",
      "Sri Lanka white water rafting Kitulgala",
      "Sri Lanka Little Adam's Peak hike Ella trail",
      "Sri Lanka Horton Plains cliff World's End",
    ],
    luxury_premium: [
      "Sri Lanka Galle Fort boutique hotel colonial",
      "Sri Lanka luxury train Viceroy Special Ella",
      "Sri Lanka wildlife lodge Yala tent camp",
    ],
    spiritual_religious: [
      "Sri Lanka Kandy Dalada Maligawa tooth relic",
      "Sri Lanka Dambulla cave temple golden statue",
      "Sri Lanka Adam's Peak pilgrimage dawn summit",
    ],
    vegetation_flora: [
      "Sri Lanka tea estate green hillside row",
      "Sri Lanka spice garden cinnamon nutmeg",
      "Sri Lanka tropical flower frangipani beach",
    ],
    seasonal_spectacle: [
      "Sri Lanka Kandy Perahera August elephant parade",
      "Sri Lanka whale season November March Mirissa",
    ],
    transportation_iconic: [
      "Sri Lanka train Ella hill country window view",
      "Sri Lanka tuk-tuk colourful road coastal",
    ],
  },

  // ═══════════════════════════════ PACIFIC ════════════════════════════════════

  australia: {
    landmarks: [
      "Sydney Opera House harbour Australia",
      "Sydney Harbour Bridge Australia arch steel",
      "Uluru red monolith Australia outback sunset",
      "Great Barrier Reef aerial Australia coral",
      "Twelve Apostles Victoria Australia coast cliff",
      "Blue Mountains New South Wales Australia valley",
      "Kakadu national park Australia Aboriginal art",
    ],
    natural_landscapes: [
      "Australia outback red ochre landscape",
      "Australia Kimberley gorge orange cliff",
      "Great Ocean Road Australia coastal cliff",
      "Australia Northern Territory flat billabong",
    ],
    wildlife_fauna: [
      "Australia kangaroo outback red sunset",
      "Australia koala tree eucalyptus sleepy",
      "Australia wombat national park Australia",
      "Australia crocodile warning sign outback",
      "Australia quokka Rottnest island smile",
      "Australia platypus river stream unique",
      "Australia cockatoo colorful parrot tree",
    ],
    coastal_marine: [
      "Great Barrier Reef Australia coral colourful",
      "Bondi Beach Sydney Australia surf wave",
      "Whitsundays Australia white sand aerial island",
      "Australia Ningaloo reef whale shark snorkel",
    ],
    urban_environment: [
      "Sydney CBD skyline Australia harbour",
      "Melbourne laneway street art coffee Australia",
    ],
    cultural_traditional: [
      "Australia Aboriginal didgeridoo art circle",
      "Australia bush tucker ochre ceremony",
    ],
    aerial_panoramic: [
      "Uluru Australia aerial red outback",
      "Great Barrier Reef Australia aerial pattern",
      "Whitsundays Australia aerial white sand blue",
      "Sydney Harbour Australia aerial bridge opera",
    ],
    cinematic_atmosphere: [
      "Uluru Australia sunset orange glow monolith",
      "Sydney Opera House Australia dusk harbour gold",
      "Australia Milky Way outback night clear",
      "Twelve Apostles Australia sunrise golden sea",
    ],
    adventure_extreme: [
      "Australia surfing Byron Bay wave Queensland",
      "Australia Great Ocean Road road trip coastal",
      "Australia kayak Sydney Harbour morning",
      "Australia scuba dive Great Barrier Reef coral",
    ],
    food_market: [
      "Australia Tim Tam biscuit coffee breakfast",
      "Sydney Australia brunch cafe flat white",
      "Melbourne Australia food laneway coffee art",
      "Australia Barossa Valley wine glass vineyard",
    ],
    luxury_premium: [
      "Australia Whitsundays luxury yacht charter",
      "Sydney Australia luxury harbour hotel view",
      "Australia Southern Ocean Lodge Kangaroo Island",
    ],
    nightlife_urban: [
      "Sydney Australia Darling Harbour bar scene",
      "Melbourne Australia rooftop bar CBD view",
    ],
    seasonal_spectacle: [
      "Australia Sydney New Year fireworks harbour",
      "Australia wildflower bloom Western Australia spring",
    ],
    architecture: [
      "Sydney Opera House Australia shell roof unique",
      "Melbourne Australia Flinders Street station dome",
    ],
  },

  newzealand: {
    landmarks: [
      "Milford Sound fiord New Zealand cliff waterfall",
      "Hobbiton Shire New Zealand green hill",
      "Aoraki Mount Cook New Zealand glacier",
      "Bay of Islands New Zealand turquoise",
      "Tongariro Crossing volcano New Zealand",
      "Queenstown adventure capital New Zealand",
    ],
    natural_landscapes: [
      "New Zealand fiordland mirror lake cliff",
      "South Island New Zealand alpine lake blue",
      "New Zealand rolling green hills sheep farm",
      "Coromandel New Zealand volcanic hot water",
      "New Zealand Westland glacier valley",
    ],
    volcanic_geothermal: [
      "Rotorua New Zealand geothermal pool steam",
      "Tongariro volcano New Zealand lava field",
      "Wai-O-Tapu New Zealand color thermal pool",
      "New Zealand boiling mud geyser thermal",
    ],
    wildlife_fauna: [
      "New Zealand kiwi bird nocturnal rare",
      "New Zealand dolphin pod bay jumping",
      "New Zealand fur seal coast rocky",
      "New Zealand yellow-eyed penguin rare",
    ],
    coastal_marine: [
      "New Zealand bay turquoise island ferry",
      "Abel Tasman New Zealand golden coast",
    ],
    adventure_extreme: [
      "Queenstown New Zealand bungee bridge",
      "New Zealand skydive scenic drop",
      "New Zealand heli-skiing powder snow",
    ],
    cultural_traditional: [
      "New Zealand Haka Maori warrior dance",
      "New Zealand Maori tattoo tā moko",
    ],
    aerial_panoramic: [
      "Milford Sound New Zealand aerial fiord",
      "New Zealand South Island aerial lake mountain",
      "Queenstown New Zealand aerial Remarkables lake",
      "New Zealand Abel Tasman aerial golden coast",
    ],
    cinematic_atmosphere: [
      "Milford Sound New Zealand waterfall rain dramatic",
      "New Zealand Fiordland dawn mist lake mirror",
      "Hobbiton New Zealand morning green hill",
      "Aoraki Mount Cook New Zealand glacier dusk alpenglow",
    ],
    food_market: [
      "New Zealand green-lipped mussel seafood market",
      "New Zealand Sauvignon Blanc wine Marlborough",
      "New Zealand Hangi earth oven Maori feast",
      "Queenstown New Zealand craft beer bar",
    ],
    luxury_premium: [
      "New Zealand exclusive lodge Fiordland private",
      "Queenstown New Zealand luxury alpine resort",
      "New Zealand helicopter heli-hike glacier",
    ],
    nightlife_urban: [
      "Queenstown New Zealand bar scene lakefront",
      "Auckland New Zealand Sky Tower rooftop view",
    ],
    seasonal_spectacle: [
      "New Zealand Southern Lights aurora winter",
      "New Zealand South Island autumn golden beech",
      "New Zealand spring blossom cherry Wellington",
    ],
    food_culture: [
      "New Zealand flat white coffee café culture",
      "New Zealand seafood chowder wharf market",
    ],
  },

  // ═══════════════════════════════ AMERICAS ═══════════════════════════════════

  unitedstates: {
    landmarks: [
      "Grand Canyon Arizona USA red rock vast",
      "Monument Valley Arizona USA sandstone butte",
      "Antelope Canyon Arizona USA slot swirling",
      "Golden Gate Bridge San Francisco USA",
      "Yellowstone geyser Old Faithful USA steam",
      "Manhattan skyline New York USA skyscraper",
      "Niagara Falls USA Canada mist thunder",
      "Statue of Liberty New York harbour USA",
    ],
    natural_landscapes: [
      "USA national park canyon red rock Arizona",
      "Yosemite USA valley granite cliff waterfall",
      "USA Great Smoky Mountains fog Tennessee",
      "USA Death Valley heat sand dune desert",
      "Zion Canyon Utah USA red cliff slot",
    ],
    desert_arid: [
      "USA Monument Valley red desert southwest",
      "Grand Canyon USA layered red rock vast",
      "Death Valley USA salt flat extreme heat",
      "Utah Bryce Canyon USA red hoodoo column",
    ],
    urban_environment: [
      "New York Times Square billboard neon USA",
      "Chicago Loop architecture riverwalk USA",
      "Los Angeles Hollywood sign hills USA",
      "New Orleans French Quarter jazz balcony USA",
    ],
    cultural_traditional: [
      "USA Route 66 classic diner neon retro",
      "New Orleans Mardi Gras beads mask USA",
      "USA rodeo cowboy horse arena western",
    ],
    wildlife_fauna: [
      "Yellowstone bison herd USA national park",
      "Alaska USA brown bear catching salmon",
      "USA bald eagle river nest",
      "Florida Everglades USA alligator marsh",
    ],
    food_market: [
      "USA BBQ Texas smoked brisket outdoor",
      "New York hot dog street vendor USA",
    ],
    aerial_panoramic: [
      "Grand Canyon USA aerial depth red layer",
      "New York aerial Manhattan grid USA",
      "Antelope Canyon Arizona USA aerial slot swirl",
      "Hawaii USA aerial volcanic crater island",
      "USA Everglades aerial mangrove river green",
    ],
    cinematic_atmosphere: [
      "Monument Valley Arizona USA sunrise dramatic butte",
      "Antelope Canyon USA swirling light beam sand",
      "USA Yosemite valley fog morning granite dramatic",
      "New York Times Square rain night neon reflections",
      "USA Grand Canyon sunset orange layered vast",
      "Death Valley USA salt flat heat shimmer dramatic",
    ],
    adventure_extreme: [
      "USA white water rafting Colorado River Grand Canyon",
      "USA Yosemite rock climbing El Capitan vertical",
      "USA skiing Aspen Colorado mountain powder",
      "Hawaii USA volcano hike active lava field",
      "USA base jumping Moab Utah canyon rim",
      "USA surfing Pipeline Hawaii barrel wave",
      "USA mountain biking Moab Utah slickrock trail",
    ],
    luxury_premium: [
      "New York USA luxury penthouse hotel Manhattan view",
      "USA Napa Valley luxury wine estate private tour",
      "USA Hamptons beach house luxury summer retreat",
      "Miami USA South Beach luxury hotel art deco",
      "USA Jackson Hole Wyoming luxury ski lodge mountain",
    ],
    nightlife_urban: [
      "Las Vegas USA neon strip night casino dazzle",
      "New York USA Manhattan rooftop bar skyline night",
      "Miami USA South Beach nightclub beach party neon",
      "New Orleans USA Bourbon Street jazz live night",
      "Nashville USA honky tonk live country music row",
    ],
    seasonal_spectacle: [
      "USA New England autumn leaf colour October red",
      "USA Yellowstone spring bison calving geyser",
      "USA cherry blossom Washington DC spring pink",
      "Utah USA slot canyon winter light beam December",
      "USA Niagara Falls winter frozen ice dramatic",
    ],
    coastal_marine: [
      "USA California Pacific Coast Highway cliff ocean",
      "Florida Keys USA turquoise water coral reef snorkel",
      "Big Sur USA dramatic cliff ocean fog coastal",
      "Cape Cod USA beach lighthouse New England",
    ],
    architecture: [
      "Chicago USA skyscraper architecture river canyon",
      "New York USA Brooklyn Bridge iron cable span",
      "USA Fallingwater Pennsylvania Frank Lloyd Wright",
      "San Francisco USA Victorian painted ladies house",
    ],
    transportation_iconic: [
      "USA Route 66 classic convertible highway desert",
      "New York USA yellow taxi cab Times Square rain",
      "San Francisco USA cable car hill ride iconic",
      "USA steam locomotive heritage railway mountain",
    ],
    spiritual_religious: [
      "USA Sedona red rock vortex spiritual Arizona",
      "USA National Cathedral Washington DC Gothic",
      "USA Gettysburg battlefield memorial Pennsylvania",
    ],
    vegetation_flora: [
      "USA Pacific Northwest old-growth forest Washington",
      "USA California Sequoia forest giant tree trunk",
      "USA Great Plains wildflower prairie spring bloom",
      "USA Sonoran Desert saguaro cactus Arizona sunset",
    ],
    winter_arctic: [
      "USA Yellowstone winter frozen geyser steam bison",
      "USA Minnesota Boundary Waters frozen lake aurora",
    ],
    festival_celebration: [
      "USA New York Fourth of July fireworks Hudson",
      "Mardi Gras New Orleans USA parade float mask",
      "USA Burning Man Nevada desert art festival",
      "USA Coachella music festival California desert",
    ],
  },

  alaska: {
    landmarks: [
      "Denali Alaska mountain reflection USA",
      "Alaska Kenai Fjords glacier calving ice",
      "Glacier Bay Alaska whale jumping ice",
      "Alaska brown bear catching salmon river",
      "Inside Passage Alaska boat fjord Alaska",
    ],
    winter_arctic: [
      "Alaska aurora borealis green sky winter",
      "Alaska dog mushing Iditarod snow trail",
      "Alaska permafrost tundra arctic vast",
      "Alaska frozen river winter ice",
    ],
    natural_landscapes: [
      "Alaska mountain range glacial valley",
      "Alaska pristine wilderness taiga forest",
      "Wrangell-St. Elias Alaska mountain vast",
    ],
    wildlife_fauna: [
      "Alaska brown bear salmon river fishing",
      "Alaska moose forest lake reflection",
      "Alaska bald eagle nest Alaska coast",
      "Alaska humpback whale breach Alaska fjord",
      "Alaska orca killer whale surface fjord",
      "Alaska Dall sheep mountain cliff",
    ],
    aerial_panoramic: [
      "Alaska aerial glacier tongue valley",
      "Denali Alaska aerial snowy peak",
    ],
    cinematic_atmosphere: [
      "Alaska aurora green sky mountain reflection",
      "Alaska glacier calving ice crash dramatic blue",
      "Alaska bear salmon river misty morning",
      "Alaska vast wilderness silence untouched",
    ],
    adventure_extreme: [
      "Alaska glacier hiking crampons ice blue",
      "Alaska kayak iceberg fjord Kenai",
      "Alaska snowmobile Denali backcountry winter",
      "Alaska flightseeing Denali bush plane",
      "Alaska whitewater rafting glacial river",
    ],
    coastal_marine: [
      "Alaska Inside Passage fjord green coast",
      "Alaska sea otter kelp float Pacific",
      "Alaska halibut fishing boat coast",
      "Alaska tide pool rocky shore starfish",
    ],
    food_market: [
      "Alaska king crab seafood fresh Pacific",
      "Alaska wild-caught salmon grill outdoor",
      "Alaska native Athabascan food tradition",
    ],
    seasonal_spectacle: [
      "Alaska midnight sun summer solstice golden",
      "Alaska aurora borealis purple curtain winter",
      "Alaska fall tundra blueberry red mosaic",
    ],
  },

  canada: {
    landmarks: [
      "Niagara Falls Canada mist rainbow",
      "Banff Lake Louise turquoise Canada Rockies",
      "Moraine Lake Canada turquoise reflection",
      "CN Tower Toronto Canada iconic",
      "Quebec City old town Canada winter snow",
      "Canadian Rockies Icefields Parkway USA",
    ],
    natural_landscapes: [
      "Canadian Rockies mountain lake turquoise blue",
      "Canada boreal forest autumn tamarack gold",
      "Banff national park Canada reflection lake",
      "British Columbia fjord Canada green",
    ],
    winter_arctic: [
      "Canada aurora borealis Yukon winter sky",
      "Canada skiing Whistler powder snow",
      "Quebec Winter Carnival Canada ice palace",
      "Canada Churchill polar bear tundra",
    ],
    wildlife_fauna: [
      "Canada grizzly bear British Columbia river",
      "Churchill Canada polar bear tundra snow",
      "Canada moose lake forest autumn",
      "Canada beluga whale Quebec estuary",
    ],
    aerial_panoramic: [
      "Moraine Lake Canada aerial turquoise Valley",
      "Canada Rockies aerial mountain range",
    ],
    urban_environment: [
      "Vancouver Canada ocean mountain backdrop city",
      "Montreal Old Port Canada summer festival",
      "Toronto Canada skyline lake Ontario evening",
      "Ottawa Canada Parliament Hill autumn",
    ],
    adventure_extreme: [
      "Canada Banff rock climbing via ferrata Rockies",
      "Canada kayaking British Columbia coastal island",
      "Canada Niagara helicopter aerial mist tour",
      "Canada backcountry snowshoeing Rockies powder",
    ],
    food_market: [
      "Canada poutine fries cheese curd gravy Quebec",
      "Montreal Canada bagel smoked meat deli",
      "Canada maple syrup tree tap sugar bush",
      "Vancouver Canada sushi Japanese Asian fusion",
    ],
    cultural_traditional: [
      "Canada Indigenous First Nations totem pole Pacific",
      "Canada Mountie RCMP red serge horse",
      "Canada Cariboo rodeo cowboy Alberta",
    ],
    cinematic_atmosphere: [
      "Moraine Lake Canada turquoise mountain reflection dawn",
      "Canada Rockies peak alpenglow pink sunrise",
      "Canada Aurora borealis Yukon curtain night",
      "Canada autumn maple red orange road",
    ],
    coastal_marine: [
      "Vancouver Island Canada orca pod breach Pacific",
      "Canada Bay of Fundy tidal bore Nova Scotia",
      "Canada Pacific Rim Tofino surf storm wave",
    ],
    luxury_premium: [
      "Canada Fairmont Banff Springs castle luxury",
      "Canada Whistler luxury ski lodge mountain",
      "Canada remote wilderness lodge float plane",
    ],
    seasonal_spectacle: [
      "Canada autumn maple leaf peak October red",
      "Canada Banff winter ice bubble lake frozen",
      "Canada Yukon Midnight Sun summer solstice",
    ],
    architecture: [
      "Quebec City Canada old town walls fortress",
      "Canada Château Frontenac castle hotel Quebec",
    ],
  },

  mexico: {
    landmarks: [
      "Chichen Itza pyramid Mexico Mayan ancient",
      "Teotihuacan Pyramid of the Sun Mexico",
      "Palenque jungle pyramid Mexico Mayan",
      "Mexico City Metropolitan Cathedral baroque",
      "Copper Canyon Chihuahua Mexico dramatic",
    ],
    coastal_marine: [
      "Mexico Riviera Maya turquoise beach Caribbean",
      "Tulum Mexico cliff temple sea",
      "Mexico Pacific coast surf Sayulita beach",
      "Cenote Mexico underground pool turquoise jade",
    ],
    natural_landscapes: [
      "Mexico Hierve el Agua petrified waterfall",
      "Copper Canyon Mexico dramatic depth cliff",
      "Mexico volcanoes Popocatépetl smoke peak",
    ],
    cultural_traditional: [
      "Mexico Day of the Dead Día de Muertos altar",
      "Oaxaca Mexico traditional crafts market",
      "Mexico mariachi band sombrero guitar",
      "Mexico lucha libre wrestling mask colorful",
    ],
    ancient_ruins: [
      "Teotihuacan Mexico pyramid walk ancient",
      "Chichen Itza Mexico platform serpent carving",
      "Palenque temple Mexico jungle ruin",
      "Monte Albán Mexico hilltop Zapotec ruins",
    ],
    food_market: [
      "Mexico tacos al pastor street corn tortilla",
      "Oaxaca Mexico mole sauce chocolate rich",
      "Mexico street market tostadas guacamole",
    ],
    aerial_panoramic: [
      "Tulum Mexico aerial cliff sea turquoise",
      "Teotihuacan Mexico aerial pyramid sun",
      "Mexico Copper Canyon aerial vast depth",
      "Cenote Mexico aerial turquoise sinkhole",
    ],
    cinematic_atmosphere: [
      "Mexico Day of the Dead altar marigold candle night",
      "Tulum Mexico cliff temple sea golden sunrise",
      "Oaxaca Mexico colourful market street vibrant",
      "Mexico City cathedral night illuminated zocalo",
    ],
    adventure_extreme: [
      "Mexico Copper Canyon zip-line Tarahumara",
      "Mexico Caribbean cenote cave dive Tulum",
      "Mexico surf Puerto Escondido barrel wave",
      "Mexico Popocatepetl volcano climb approach",
    ],
    luxury_premium: [
      "Tulum Mexico eco-luxury hotel beach jungle",
      "Mexico Los Cabos resort Pacific cliff infinity pool",
      "Mexico City boutique hotel Polanco upscale",
    ],
    nightlife_urban: [
      "Mexico City Roma Norte bar mezcal artisan",
      "Playa del Carmen Mexico Quinta Avenida evening",
      "Oaxaca Mexico mezcal bar live music night",
    ],
    architecture: [
      "Mexico City Palacio de Bellas Artes Art Nouveau",
      "Oaxaca Mexico colonial church facade green stone",
      "Guanajuato Mexico colourful hillside terrace alley",
    ],
    wildlife_fauna: [
      "Mexico whale shark Holbox island snorkel",
      "Mexico monarch butterfly Michoacan million",
      "Mexico Caribbean sea turtle Akumal beach",
      "Mexico grey whale Baja California bay birth",
    ],
    desert_arid: [
      "Mexico San Luis Potosi Real de Catorce ghost town",
      "Sonora Mexico cactus desert saguaro",
    ],
    seasonal_spectacle: [
      "Mexico Dia de Muertos ofrenda marigold festive",
      "Mexico monarch butterfly winter colony Michoacan",
    ],
  },

  peru: {
    landmarks: [
      "Machu Picchu Inca ruins Peru Andes cloud",
      "Lake Titicaca reed island Peru Bolivia",
      "Rainbow Mountain Peru colorful stripes",
      "Huacachina lagoon dunes Peru oasis",
      "Nazca Lines Peru aerial geoglyph",
      "Sacsayhuamán Cusco Inca fortress Peru",
    ],
    natural_landscapes: [
      "Peru Andes mountain valley cloud forest",
      "Amazon river Peru jungle boat canoe",
      "Peru Colca Canyon condor soar cliff",
      "Rainbow Mountain Peru Vinicunca color",
    ],
    ancient_ruins: [
      "Machu Picchu Peru terraced platform Inca",
      "Ollantaytambo Peru Inca massive stone",
      "Peru Choquequirao Inca ruin trekking",
      "Cusco Peru Inca stone wall colonial",
    ],
    wildlife_fauna: [
      "Peru condor soar Colca Canyon Andes",
      "Lake Titicaca Peru giant frog amphibian",
      "Peru Amazon jungle parrot macaw",
      "Peru llama Andes traditional Quechua",
    ],
    desert_arid: [
      "Huacachina Peru sand dune oasis village",
      "Peru Atacama desert edge dry extreme",
    ],
    cultural_traditional: [
      "Cusco Peru Inti Raymi sun festival",
      "Peru Quechua woman traditional hat llama",
      "Pisac market Peru traditional textile weave",
    ],
    food_market: [
      "Peru ceviche lime fresh fish marinate",
      "Lima Peru gastronomic capital restaurant",
      "Peru tiradito sashimi Nikkei Lima dish",
      "Cusco Peru quinoa soup Andean traditional",
      "Peru cuy guinea pig traditional Andean",
    ],
    aerial_panoramic: [
      "Machu Picchu Peru aerial mountain cloud",
      "Rainbow Mountain Peru aerial Andes color",
      "Nazca Lines Peru aerial geoglyph bird hand",
      "Lake Titicaca Peru aerial island blue",
    ],
    cinematic_atmosphere: [
      "Machu Picchu Peru misty cloud morning ruins",
      "Rainbow Mountain Peru color striped layer dramatic",
      "Peru Amazon canoe river dawn mist jungle",
      "Cusco Peru colonial street purple flower",
    ],
    adventure_extreme: [
      "Inca Trail Peru four-day trek Machu Picchu",
      "Peru Colca Canyon condor trekking depth",
      "Peru Huacachina sand dune boarding",
      "Peru Amazon jungle survival expedition",
    ],
    luxury_premium: [
      "Machu Picchu Peru luxury train Belmond Vista",
      "Lima Peru luxury restaurant Miraflores ocean",
      "Peru Amazon luxury eco-lodge canopy",
    ],
    coastal_marine: [
      "Peru Lima Miraflores cliff Pacific surf sunset",
      "Paracas Peru sea lion colony Ballestas island",
    ],
    seasonal_spectacle: [
      "Cusco Peru Inti Raymi sun festival winter solstice",
      "Peru Colca Canyon condor thermal morning soar",
    ],
  },

  brazil: {
    landmarks: [
      "Christ the Redeemer Rio de Janeiro statue Brazil",
      "Iguazu Falls Brazil Argentina waterfall mist",
      "Rio de Janeiro Copacabana beach carnival Brazil",
      "Amazon river Brazil jungle aerial canopy",
      "Sugarloaf Mountain Rio harbour Brazil",
    ],
    natural_landscapes: [
      "Amazon jungle Brazil river canopy aerial",
      "Brazil Chapada Diamantina waterfall valley",
      "Pantanal Brazil wetland jaguar wildlife",
      "Brazil Lençóis Maranhenses white dune lagoon",
    ],
    wildlife_fauna: [
      "Brazil jaguar Pantanal river bank prowl",
      "Brazil Amazon toucan colorful beak bird",
      "Brazil Amazon river dolphin pink boto",
      "Brazil macaw blue yellow flight jungle",
      "Brazil capybara river bank family",
    ],
    coastal_marine: [
      "Rio de Janeiro Ipanema beach Brazil waves",
      "Fernando de Noronha Brazil turquoise beach",
      "Brazil Pantanal caiman reptile bank",
    ],
    cultural_traditional: [
      "Brazil Carnival samba dancer feathers Rio",
      "Brazil Capoeira martial arts dance beach",
      "Brazil favela colorful hillside Rio",
    ],
    food_market: [
      "Brazil churrasco BBQ skewer restaurant",
      "Rio Brazil açaí bowl purple health",
    ],
    aerial_panoramic: [
      "Rio de Janeiro Brazil aerial Sugarloaf bay",
      "Amazon Brazil aerial river bend green canopy",
      "Lençóis Maranhenses Brazil aerial white dune lagoon",
    ],
    cinematic_atmosphere: [
      "Rio de Janeiro sunset Christ Redeemer dramatic",
      "Amazon Brazil mist river dawn canopy light",
      "Brazil Carnival night parade samba color lights",
      "Iguazu Falls Brazil mist rainbow golden light",
    ],
    adventure_extreme: [
      "Brazil Amazon jungle trek survival expedition",
      "Rio Brazil hang gliding Tijuca forest launch",
      "Brazil Chapada Diamantina canyoning waterfall",
      "Brazil surf Florianopolis wave Atlantic",
    ],
    architecture: [
      "Brasilia Brazil Oscar Niemeyer modernist dome",
      "Rio Brazil Santa Teresa hillside colonial",
      "Brazil colonial church baroque gold interior",
    ],
    nightlife_urban: [
      "Rio Brazil samba bar lapa arches night",
      "São Paulo Brazil club nightlife rooftop",
      "Brazil Carnival blocos street party day",
    ],
    luxury_premium: [
      "Rio Brazil luxury hotel beach Ipanema view",
      "Amazon Brazil eco-lodge canopy treehouse",
      "Fernando de Noronha Brazil exclusive island resort",
    ],
    seasonal_spectacle: [
      "Brazil Carnival Rio de Janeiro float parade",
      "Amazon Brazil wet season flooded forest",
      "Brazil Pantanal wildlife peak season jaguar",
    ],
  },

  argentina: {
    landmarks: [
      "Perito Moreno glacier Argentina calving blue ice",
      "Iguazu Falls Argentina spectacular mist",
      "Buenos Aires Recoleta cemetery ornate Argentina",
      "Tierra del Fuego Argentina end of world",
      "Patagonia Argentina granite tower lake",
    ],
    natural_landscapes: [
      "Patagonia Argentina granite peak wind lake",
      "Argentina steppe Patagonia wind guanaco",
      "Mendoza Argentina vineyard Andes backdrop",
      "Argentina Quebrada de Humahuaca colorful hill",
    ],
    adventure_extreme: [
      "Argentina trekking Patagonia wind mountain",
      "Argentina ski Bariloche slope Argentina",
      "Perito Moreno Argentina ice trekking walk",
    ],
    cultural_traditional: [
      "Argentina tango dance couple Buenos Aires",
      "Buenos Aires Boca neighbourhood colorful Argentina",
      "Argentina gaucho horse cattle estancia",
    ],
    food_market: [
      "Argentina asado beef grilled outdoor grill",
      "Buenos Aires steak restaurant Argentine",
    ],
    aerial_panoramic: [
      "Perito Moreno Argentina aerial glacier blue",
      "Patagonia Argentina aerial mountain lake",
    ],
    wildlife_fauna: [
      "Valdes Peninsula Argentina whale sea",
      "Patagonia Argentina condor soar cliff",
      "Argentina flamingo Puna highland lake pink",
      "Patagonia Argentina puma mountain stalking",
    ],
    cinematic_atmosphere: [
      "Patagonia Argentina Torres granite dawn orange sky",
      "Perito Moreno Argentina blue ice face dramatic",
      "Buenos Aires Argentina melancholy tango night",
      "Mendoza Argentina vineyard Andes snow backdrop",
    ],
    architecture: [
      "Buenos Aires Argentina Recoleta Art Nouveau building",
      "Buenos Aires Teatro Colon opera house Argentina",
      "Argentina Palermo Buenos Aires French mansion",
    ],
    coastal_marine: [
      "Valdes Peninsula Argentina sea lion colony beach",
      "Argentina Patagonia coast rocky cliff penguin",
      "Mar del Plata Argentina Atlantic coast beach",
    ],
    luxury_premium: [
      "Mendoza Argentina vineyard estate wine tasting",
      "Buenos Aires Argentina luxury boutique hotel Palermo",
      "Patagonia Argentina private estancia ranch",
    ],
    seasonal_spectacle: [
      "Patagonia Argentina spring wildflower plain bloom",
      "Buenos Aires Argentina tango festival spring",
      "Argentina Iguazu Falls sunset golden mist rainbow",
    ],
  },

  chile: {
    landmarks: [
      "Torres del Paine granite spires Chile Patagonia",
      "Easter Island moai statue Pacific Chile",
      "Atacama Desert Valley of the Moon Chile",
      "Marble Caves Lake General Carrera Chile",
      "Cerro Torre Chile Patagonia mountain fog",
    ],
    natural_landscapes: [
      "Chile Patagonia glacial lake granite peak",
      "Atacama Chile salt flat sunset color",
      "Chile lake district volcano reflection",
      "Chile Carretera Austral road fjord forest",
    ],
    desert_arid: [
      "Atacama Desert Chile driest world salt",
      "Atacama Chile stargazing clear night sky",
      "Valle de la Luna Chile moon landscape",
      "Atacama Chile colorful canyon Rainbow Valley",
    ],
    volcanic_geothermal: [
      "Chile Atacama Tatio geyser steam sunrise",
      "Osorno Volcano Chile cone symmetry lake",
      "Chile lake district volcano snow perfect cone",
    ],
    adventure_extreme: [
      "Torres del Paine Chile trekking W trail",
      "Chile Atacama trail biking desert",
    ],
    wildlife_fauna: [
      "Atacama Chile flamingo salt lake pink",
      "Chile condor Andes soar thermal",
      "Easter Island Chile sea turtle coast",
    ],
    aerial_panoramic: [
      "Torres del Paine Chile aerial granite spires",
      "Atacama Chile aerial salt flat geometric",
      "Chile Carretera Austral aerial fjord green",
      "Easter Island Chile aerial moai coast cliff",
    ],
    cinematic_atmosphere: [
      "Torres del Paine Chile granite tower storm cloud",
      "Atacama Chile night sky Milky Way clear desert",
      "Chile Marble Caves turquoise lake dawn light",
      "Patagonia Chile wind lenticular cloud dramatic",
    ],
    coastal_marine: [
      "Chile Patagonia fjord narrow boat channel",
      "Easter Island Chile coast wave dramatic cliff",
      "Chile Pacific coast sea lion colony beach",
    ],
    food_market: [
      "Chile Valparaiso market seafood empanada",
      "Chile pisco sour cocktail traditional",
      "Santiago Chile Mercado Central seafood fresh",
      "Chile carménère wine glass vineyard outdoor",
    ],
    cultural_traditional: [
      "Easter Island Chile Rapa Nui ceremony moai",
      "Chile Mapuche indigenous craft textile weave",
      "Valparaiso Chile street mural colourful hill",
    ],
    architecture: [
      "Valparaiso Chile colourful hillside terrace house",
      "Santiago Chile modern glass tower plaza",
      "Chile colonial church whitewash courtyard",
    ],
    luxury_premium: [
      "Torres del Paine Chile luxury lodge mountain view",
      "Atacama Chile eco-lodge private stargazing tour",
      "Chile wine estate Maipo Valley luxury stay",
    ],
    seasonal_spectacle: [
      "Atacama Chile spring flower desert bloom purple",
      "Torres del Paine Chile autumn golden beech tree",
      "Chile Villarrica Volcano eruption night glow",
    ],
  },

  colombia: {
    landmarks: [
      "Cartagena walled old city Colombia colorful",
      "Cocora Valley wax palm tree Colombia tall",
      "Medellín cable car hillside Colombia",
      "Lost City Ciudad Perdida Colombia jungle trek",
      "Coffee region Colombia finca landscape",
    ],
    natural_landscapes: [
      "Colombia Coffee Region green mountain finca",
      "Colombia Amazon jungle river canoe",
      "Colombia Caribbean coast ocean cliff",
    ],
    coastal_marine: [
      "Cartagena Colombia Caribbean coast beach",
      "Colombia Tayrona beach jungle coast",
      "Cartagena Colombia city wall sea blue",
    ],
    cultural_traditional: [
      "Colombia Cartagena flower woman Palenquera",
      "Medellin Colombia transformation graffiti vibrant",
      "Colombia feria de las flores Medellín festival",
    ],
    wildlife_fauna: [
      "Colombia Amazon anaconda jungle river",
      "Colombia bird cloud forest hummingbird",
    ],
    food_market: [
      "Colombia bandeja paisa full plate traditional",
      "Medellín Colombia fruit market exotic",
      "Colombia arepas corn cake street food",
      "Bogotá Colombia Paloquemao market tropical",
    ],
    cinematic_atmosphere: [
      "Cartagena Colombia golden hour pastel wall dramatic",
      "Cocora Valley Colombia tall wax palm mist",
      "Medellín Colombia cable car hillside lights night",
    ],
    adventure_extreme: [
      "Colombia trekking Ciudad Perdida Lost City 4 days",
      "Colombia Tayrona National Park coastal hike",
      "Colombia paragliding Medellín valley aerial",
    ],
    urban_environment: [
      "Medellín Colombia urban transformation Poblado",
      "Bogotá Colombia Usaquén colonial neighbourhood",
    ],
    luxury_premium: [
      "Cartagena Colombia boutique hotel walled city",
      "Colombia coffee finca hacienda luxury stay",
    ],
    aerial_panoramic: [
      "Cocora Valley Colombia aerial wax palm green",
      "Cartagena Colombia aerial old city Caribbean",
    ],
    seasonal_spectacle: [
      "Medellín Colombia Feria de las Flores August",
      "Colombia dry season December March Caribbean",
    ],
  },

  costarica: {
    landmarks: [
      "Arenal Volcano Costa Rica cone forest",
      "Monteverde Cloud Forest Costa Rica mist",
      "Manuel Antonio Costa Rica beach jungle",
      "Tortuguero Costa Rica sea turtle nest",
      "Corcovado Costa Rica jaguar rainforest",
    ],
    volcanic_geothermal: [
      "Arenal Costa Rica volcano erupt lava night",
      "Costa Rica hot spring pool Arenal volcanic",
      "Rincón de la Vieja Costa Rica geyser steam",
    ],
    tropical_lush: [
      "Costa Rica rainforest canopy hanging bridge",
      "Monteverde Costa Rica cloud forest misty green",
      "Costa Rica waterfall jungle lush blue",
      "Costa Rica jungle biodiversity tree frog",
    ],
    wildlife_fauna: [
      "Costa Rica sloth hanging tree rainforest",
      "Costa Rica toucan colorful beak tree",
      "Costa Rica quetzal cloud forest Guatemala",
      "Costa Rica sea turtle Tortuguero night nest",
      "Costa Rica macaw scarlet rainforest pair",
      "Costa Rica jaguar Corcovado rare trail",
    ],
    coastal_marine: [
      "Costa Rica Pacific beach surf wave",
      "Costa Rica Osa Peninsula coast jungle",
    ],
    adventure_extreme: [
      "Costa Rica zip-line canopy forest fast",
      "Costa Rica whitewater rafting river",
      "Costa Rica surfing beach wave Nosara",
      "Costa Rica kayaking Tortuguero canal night turtle",
    ],
    cinematic_atmosphere: [
      "Costa Rica Arenal volcano sunset orange lava glow",
      "Monteverde Costa Rica cloud forest mist ethereal",
      "Costa Rica Pacific beach sunset dramatic orange",
    ],
    food_market: [
      "Costa Rica gallo pinto rice beans breakfast",
      "Costa Rica fruit juice pipa fría fresh",
      "Arenal Costa Rica outdoor restaurant volcano view",
    ],
    aerial_panoramic: [
      "Costa Rica aerial Arenal cone lake forest",
      "Costa Rica aerial Osa Peninsula jungle coast",
    ],
    urban_environment: [
      "San José Costa Rica theatre colonial architecture",
    ],
    luxury_premium: [
      "Costa Rica eco-lodge jungle treehouse canopy",
      "Arenal Costa Rica luxury hot spring resort",
    ],
    seasonal_spectacle: [
      "Costa Rica dry season December April Pacific surf",
      "Costa Rica green season September waterfall lush",
    ],
  },

  cuba: {
    landmarks: [
      "Havana Cuba vintage 1950s car street pastel",
      "Trinidad Cuba colonial street cobblestone",
      "Viñales Valley Cuba tobacco mogote hill",
      "Havana Malecon seafront promenade Cuba",
      "El Capitolio building Havana Cuba",
    ],
    cultural_traditional: [
      "Cuba salsa dance couple colorful Havana",
      "Cuba rum mojito cocktail Havana bar",
      "Cuba cigar rolled tobacco traditional",
      "Cuba Carnival Santiago colorful float",
    ],
    natural_landscapes: [
      "Viñales Cuba valley limestone mogote green",
      "Cuba Trinidad mountains coffee plantation",
      "Cuba Playa Paraíso Cayo Largo beach",
    ],
    coastal_marine: [
      "Cuba turquoise beach clear warm Caribbean",
      "Cuba dive coral reef colorful fish",
    ],
    urban_environment: [
      "Havana Cuba faded colonial facade colorful",
      "Cuba Old Havana alley washing line",
    ],
    food_market: [
      "Cuba black beans rice ropa vieja food",
      "Havana Cuba street food sandwich cubano",
      "Cuba fresh fruit stand tropical market",
      "Cuba Havana outdoor café live band",
    ],
    cinematic_atmosphere: [
      "Havana Cuba pastel facade decay atmospheric",
      "Cuba vintage car Havana boulevard golden hour",
      "Viñales Cuba early morning mist valley green",
      "Cuba Malecon ocean spray dramatic dusk",
    ],
    aerial_panoramic: [
      "Havana Cuba aerial grid colonial city",
      "Cuba Viñales aerial tobacco valley mogote",
    ],
    luxury_premium: [
      "Cuba colonial boutique hotel restored Havana",
      "Cuba Varadero resort white beach Caribbean",
    ],
    adventure_extreme: [
      "Cuba scuba diving Bay of Pigs coral",
      "Cuba rock climbing Viñales mogote cliff",
      "Cuba trekking Gran Parque Natural Montemar",
    ],
    nightlife_urban: [
      "Havana Cuba jazz bar music night live",
      "Cuba Tropicana outdoor cabaret show night",
    ],
    seasonal_spectacle: [
      "Cuba dry season November April sunshine",
      "Cuba Santiago Carnival July street party",
    ],
    spiritual_religious: [
      "Cuba Santeria ceremony Afro-Cuban ritual",
      "Cuba Trinidad colonial church bell tower",
    ],
  },

  dominicanrepublic: {
    landmarks: [
      "Punta Cana Dominican Republic resort beach",
      "Samaná Peninsula whale watching bay DOM",
      "Los Haitises National Park cave mangrove",
      "Santo Domingo colonial architecture oldest",
    ],
    coastal_marine: [
      "Dominican Republic turquoise water paradise beach",
      "Punta Cana beach palm resort Dominican",
      "Dominican Republic Caribbean coral snorkel",
      "Samaná beach Dominican Republic tropical",
    ],
    cultural_traditional: [
      "Dominican Republic merengue dance music",
      "Santo Domingo first cathedral Americas",
    ],
    wildlife_fauna: [
      "Dominican Republic humpback whale Samaná",
      "Dominican Republic flamingo Lago Enriquillo",
      "Dominican Republic humpback whale Samaná bay breaching",
      "Dominican Republic parrot Amazon endemic forest green",
    ],
    natural_landscapes: [
      "Dominican Republic mountain interior green",
      "Dominican Republic Pico Duarte snow mountain",
      "Dominican Republic waterfall Salto El Limón jungle",
    ],
    cinematic_atmosphere: [
      "Punta Cana Dominican Republic sunrise palm dramatic",
      "Dominican Republic Los Haitises mangrove mist morning",
    ],
    urban_environment: [
      "Santo Domingo Zona Colonial stone street Dominican",
      "Dominican Republic colourful market city",
    ],
    food_market: [
      "Dominican Republic sancocho stew traditional",
      "Dominican Republic mangú plantain breakfast",
      "Dominican Republic fresh coconut water beach",
    ],
    adventure_extreme: [
      "Dominican Republic surfing Cabarete windsurf",
      "Dominican Republic canyoning Jarabacoa waterfall",
      "Dominican Republic whale watching Samaná January",
    ],
    luxury_premium: [
      "Punta Cana Dominican Republic all-inclusive resort",
      "Dominican Republic luxury beach villa Cap Cana",
      "Dominican Republic luxury beach villa Cap Cana golf",
      "Dominican Republic yacht charter catamaran Caribbean",
    ],
    vegetation_flora: [
      "Dominican Republic tropical jungle green interior",
      "Dominican Republic mangrove forest cave kayak",
      "Dominican Republic palm grove coconut beach row",
      "Dominican Republic cacao farm chocolate tropical",
    ],
    seasonal_spectacle: [
      "Dominican Republic humpback whale Samaná January March",
      "Dominican Republic carnival February colourful parade",
      "Dominican Republic Christmas posada festival tradition",
    ],
    aerial_panoramic: [
      "Punta Cana Dominican Republic aerial resort beach",
      "Samaná Peninsula Dominican Republic aerial bay whale",
      "Dominican Republic Los Haitises aerial mangrove",
      "Dominican Republic coastline aerial Caribbean turquoise",
    ],
    nightlife_urban: [
      "Santo Domingo Dominican Republic colonial zone bar",
      "Punta Cana Dominican Republic beach party nightclub",
      "Dominican Republic merengue bachata dance bar live",
    ],
    transportation_iconic: [
      "Dominican Republic guagua shared minibus colourful",
      "Santo Domingo Dominican Republic old port ship",
    ],
    spiritual_religious: [
      "Santo Domingo Dominican Republic Cathedral Americas first",
      "Dominican Republic Church Las Mercedes colonial stone",
    ],
    architecture: [
      "Santo Domingo Dominican Republic Zona Colonial UNESCO",
      "Dominican Republic colonial fortress Ozama stone",
      "Dominican Republic Victorian house Sosua pastel",
    ],
    festival_celebration: [
      "Dominican Republic carnival La Vega colourful costume",
      "Santo Domingo Dominican Republic Merengue Festival",
    ],
  },

  jamaica: {
    landmarks: [
      "Negril Seven Mile Beach Jamaica turquoise",
      "Dunn's River Falls Jamaica cascading swim",
      "Blue Mountains Jamaica coffee peak mist",
      "Ricks Café Jamaica cliff dive sunset",
    ],
    coastal_marine: [
      "Jamaica warm Caribbean turquoise beach rum",
      "Negril Jamaica beach bar reggae music",
      "Jamaica coral reef snorkel colorful",
    ],
    cultural_traditional: [
      "Jamaica reggae music Rastafarian color",
      "Jamaica Bob Marley memorial Kingston",
      "Jamaica jerk chicken spicy outdoor grill",
      "Jamaica Nine Night ceremony traditional wake",
      "Jamaica domino game street community yard",
    ],
    natural_landscapes: [
      "Blue Mountains Jamaica coffee mist green",
      "Jamaica Cockpit Country jungle hills",
      "Jamaica YS Falls waterfall natural pool",
    ],
    cinematic_atmosphere: [
      "Negril Jamaica cliff sunset dramatic orange",
      "Jamaica Rastafarian sunset palm silhouette",
    ],
    food_market: [
      "Jamaica jerk chicken street vendor barrel grill",
      "Jamaica rum punch tropical cocktail beach",
      "Jamaica patty street snack Scotch bonnet",
      "Jamaica fresh market Kingston tropical produce",
    ],
    adventure_extreme: [
      "Jamaica cliff diving Negril sunset Ricks café",
      "Jamaica horseback ride beach sea swim",
      "Jamaica zip-line canopy Ocho Rios",
    ],
    nightlife_urban: [
      "Jamaica reggae live music outdoor bar night",
      "Kingston Jamaica dancehall party night",
    ],
    urban_environment: [
      "Kingston Jamaica street art Bob Marley",
      "Jamaica Falmouth Georgian colonial town",
    ],
    luxury_premium: [
      "Jamaica Sandals luxury resort beach all-inclusive",
      "Jamaica villa Blue Mountains retreat private",
    ],
    wildlife_fauna: [
      "Jamaica hummingbird endemic streamer-tail",
      "Jamaica snorkel clear Caribbean sea turtle",
    ],
    seasonal_spectacle: [
      "Jamaica winter tourism December clear sea",
      "Jamaica hurricane season summer tropical storm",
      "Jamaica Accompong Maroon festival January heritage",
    ],
    aerial_panoramic: [
      "Jamaica Negril Seven Mile Beach aerial turquoise",
      "Jamaica Blue Mountains aerial peak cloud mist",
      "Jamaica Montego Bay aerial harbour coral reef",
    ],
    transportation_iconic: [
      "Jamaica vintage car Kingston street colourful",
      "Jamaica boat cruise sunset catamaran rum",
    ],
    architecture: [
      "Kingston Jamaica colonial Georgian grand house",
      "Jamaica Falmouth Georgian town well-preserved",
      "Jamaica plantation great house sugar colonial",
    ],
    spiritual_religious: [
      "Jamaica Rastafarian temple faith colour red gold",
      "Kingston Jamaica church Ethiopian Orthodox",
    ],
    vegetation_flora: [
      "Jamaica Blue Mountains coffee plant mist altitude",
      "Jamaica tropical jungle fern green dense",
      "Jamaica bamboo avenue Cockpit Country canopy",
    ],
    festival_celebration: [
      "Jamaica Reggae Sumfest festival Montego Bay",
      "Jamaica Independence Day August parade Kingston",
      "Jamaica carnival spring Easter costume road march",
    ],
  },

  bahamas: {
    landmarks: [
      "Bahamas Exuma swimming pigs beach lagoon",
      "Nassau Bahamas colorful colonial pink",
      "Blue Holes Bahamas underwater cave system",
      "Eleuthera Bahamas pink sand beach unique",
    ],
    coastal_marine: [
      "Bahamas turquoise shallow sandbank stunning",
      "Bahamas snorkel reef colorful tropical fish",
      "Exuma Bahamas boat turquoise bar shallow",
      "Bahamas hammerhead shark dive Bimini",
    ],
    luxury_premium: [
      "Bahamas luxury resort beach private island",
      "Nassau Bahamas casino resort beach",
      "Bahamas Atlantis resort Paradise Island casino",
      "Bahamas private island charter yacht",
      "Bahamas One&Only Ocean Club luxury resort",
    ],
    aerial_panoramic: [
      "Bahamas aerial sandbar turquoise gradient",
      "Bahamas aerial Exuma chain island turquoise",
      "Bahamas aerial Andros island flats vast blue",
    ],
    cinematic_atmosphere: [
      "Bahamas crystal clear water sun dapple sand bar",
      "Nassau Bahamas colonial pastel pink dramatic",
      "Bahamas sunrise gradient turquoise sand white glow",
      "Bahamas night bioluminescence kayak paddle green",
    ],
    natural_landscapes: [
      "Bahamas blue hole underwater cave dark abyss",
      "Eleuthera Bahamas pink sand beach unique",
      "Bahamas mangrove maze kayak island",
    ],
    cultural_traditional: [
      "Nassau Bahamas Junkanoo festival colourful parade",
      "Bahamas sponge dive Andros traditional",
    ],
    food_market: [
      "Bahamas conch salad fresh street vendor",
      "Nassau Bahamas fish fry Arawak Cay",
      "Bahamas fresh lobster beach restaurant",
    ],
    adventure_extreme: [
      "Bahamas shark dive Bimini reef feeding",
      "Bahamas dolphin swim encounter Nassau",
      "Bahamas kitesurfing Eleuthera Atlantic wind",
      "Bahamas deep sea fishing marlin blue water",
      "Bahamas blue hole cave diving dark abyss",
    ],
    wildlife_fauna: [
      "Bahamas swimming pigs Exuma island pink",
      "Bahamas flamingo Inagua pink wetland flock",
      "Bahamas nurse shark shallow sandbar approach",
      "Bahamas sea turtle nesting Long Island beach",
    ],
    vegetation_flora: [
      "Bahamas sea grape tree beach tropical coast",
      "Bahamas casuarina pine beach coastal tree",
      "Bahamas tropical garden hibiscus flamingo flower",
    ],
    seasonal_spectacle: [
      "Bahamas bioluminescence kayak night glow dark",
      "Bahamas migration whale shark Exuma winter",
      "Bahamas clear-water visibility January dry season",
    ],
    nightlife_urban: [
      "Nassau Bahamas Fish Fry Arawak Cay evening local",
      "Bahamas beach bonfire party night sand music",
      "Paradise Island Bahamas casino resort night",
    ],
    transportation_iconic: [
      "Bahamas inter-island ferry mail boat Andros",
      "Nassau Bahamas water taxi boat harbour",
    ],
    architecture: [
      "Nassau Bahamas colonial pastel Government House pink",
      "Bahamas conch shell cottage Exuma traditional",
    ],
    festival_celebration: [
      "Nassau Bahamas Junkanoo parade Boxing Day colourful",
      "Bahamas Family Island Regatta Georgetown sailing",
    ],
    urban_environment: [
      "Nassau Bahamas Straw Market craft vendor colonial",
      "Nassau Bahamas Prince George Wharf cruise ship",
    ],
  },

  borabora: {
    landmarks: [
      "Bora Bora overwater bungalow French Polynesia",
      "Bora Bora turquoise lagoon Mount Otemanu",
      "Bora Bora aerial atoll reef circle",
      "Bora Bora villa deck turquoise sunset",
    ],
    coastal_marine: [
      "Bora Bora lagoon crystal clear coral snorkel",
      "French Polynesia turquoise shallow stingray",
      "Bora Bora black tip shark lagoon snorkel",
      "Bora Bora coral garden tropical fish",
    ],
    luxury_premium: [
      "Bora Bora luxury overwater villa couple sunset",
      "Bora Bora private resort French Polynesia",
    ],
    aerial_panoramic: [
      "Bora Bora aerial lagoon green island reef",
      "French Polynesia aerial atoll ring perfect",
    ],
    natural_landscapes: [
      "Bora Bora palm beach white sand sunset",
      "Bora Bora crystal shallow lagoon sand bar",
      "French Polynesia turquoise gradient deep blue",
    ],
    cinematic_atmosphere: [
      "Bora Bora sunset overwater villa golden dramatic",
      "Bora Bora morning calm lagoon glass reflection",
      "Bora Bora Mount Otemanu peak cloud mist island",
    ],
    cultural_traditional: [
      "French Polynesia Tahitian dance festival",
      "Bora Bora outrigger canoe paddle traditional",
      "French Polynesia pearl black market jewellery",
    ],
    food_market: [
      "French Polynesia poisson cru raw fish coconut lime",
      "Bora Bora beach barbecue fresh tuna resort",
    ],
    adventure_extreme: [
      "Bora Bora jet ski lagoon reef circuit",
      "French Polynesia shark ray snorkel lagoon tour",
      "Bora Bora deep sea dive coral wall",
    ],
    wildlife_fauna: [
      "Bora Bora stingray shallow lagoon interaction",
      "French Polynesia reef shark patrol coral",
      "Bora Bora dolphin spinner French Polynesia",
    ],
    transportation_iconic: [
      "Bora Bora outrigger speedboat island shuttle",
      "French Polynesia inter-island flight small plane",
    ],
    vegetation_flora: [
      "Bora Bora hibiscus tiare gardenia island flower",
      "French Polynesia tropical green interior island",
    ],
    seasonal_spectacle: [
      "Bora Bora dry season July August perfect sky",
      "French Polynesia Heiva festival July cultural",
    ],
  },

  fiji: {
    landmarks: [
      "Fiji overwater bungalow lagoon tropical Pacific",
      "Fiji Yasawa islands turquoise bay",
      "Nadi Fiji sacred temple Indian",
      "Pacific ocean Fiji coral reef world-class",
    ],
    coastal_marine: [
      "Fiji coral reef soft coral underwater world",
      "Fiji tropical beach palm white sand",
      "Fiji shark feeding dive reef",
      "Fiji manta ray dive snorkel",
    ],
    cultural_traditional: [
      "Fiji kava ceremony traditional chief welcome",
      "Fiji local village meke dance traditional",
    ],
    tropical_lush: [
      "Fiji jungle waterfall green lush tropical",
      "Fiji palm tree beach tropical Pacific",
    ],
    aerial_panoramic: [
      "Fiji aerial island lagoon Pacific gradient",
      "Fiji Yasawa islands aerial blue channel water",
      "Fiji Great Astrolabe Reef aerial",
    ],
    cinematic_atmosphere: [
      "Fiji sunset Pacific orange golden horizon",
      "Fiji morning calm lagoon mist village canoe",
      "Fiji tropical cyclone rainbow after storm",
    ],
    luxury_premium: [
      "Fiji private island resort overwater bungalow",
      "Fiji luxury dive liveaboard boat Pacific",
    ],
    adventure_extreme: [
      "Fiji surfing Cloud Break wave barrel",
      "Fiji sea kayak island mangrove tour",
      "Fiji zipline river canyon adventure",
      "Fiji shark dive Pacific reef feeding",
    ],
    natural_landscapes: [
      "Fiji remote island uninhabited white sand",
      "Fiji volcanic interior mountain green jungle",
      "Fiji mangrove estuary kayak river",
    ],
    wildlife_fauna: [
      "Fiji hawksbill sea turtle reef swimming",
      "Fiji tropical bird parrot island endemic",
    ],
    food_market: [
      "Fiji lovo ground oven feast traditional",
      "Fiji fish market Suva fresh Pacific",
      "Fiji kokoda raw fish lime coconut dish",
    ],
    vegetation_flora: [
      "Fiji tropical flower hibiscus red bloom",
      "Fiji bamboo jungle walk island interior",
    ],
    seasonal_spectacle: [
      "Fiji dry season May October calm sea",
      "Fiji whale watching humpback season July",
    ],
    transportation_iconic: [
      "Fiji Beachcomber ferry inter-island wooden",
      "Fiji seaplane charter outer island Pacific",
    ],
  },

  hawaii: {
    landmarks: [
      "Nāpali Coast Kauai cliff Hawaii dramatic",
      "Kilauea lava flow ocean Hawaii big island",
      "Waimea Canyon Hawaii Grand Canyon Pacific",
      "Diamond Head crater Honolulu Hawaii",
      "Haleakalā volcano crater sunrise Hawaii Maui",
      "Road to Hana Maui curves Hawaii coast",
    ],
    volcanic_geothermal: [
      "Kilauea Hawaii lava red flow night ocean",
      "Hawaii Volcanoes National Park lava field",
      "Hawaii volcanic black sand beach wave",
      "Big Island Hawaii lava delta ocean steam",
    ],
    coastal_marine: [
      "Hawaii Oahu beach North Shore surf wave",
      "Maui Hawaii snorkel sea turtle coral reef",
      "Hawaii Lanai beach clear blue tropical",
      "Hawaii humpback whale breaching winter",
    ],
    natural_landscapes: [
      "Hawaii Maui bamboo forest waterfall Iao",
      "Kauai Hawaii Na Pali ridge green dramatic",
      "Hawaii helicopter aerial coast cliff",
    ],
    cultural_traditional: [
      "Hawaii hula dance grass skirt fire",
      "Hawaii luau feast poi roast pig",
      "Hawaii lei flower garland welcome",
    ],
    aerial_panoramic: [
      "Nāpali Coast Hawaii aerial helicopter cliff",
      "Kilauea Hawaii aerial lava flow ocean",
      "Hawaii Maui aerial green ridge valley waterfall",
    ],
    cinematic_atmosphere: [
      "Hawaii Nāpali Coast sunset golden cliff dramatic",
      "Kilauea Hawaii lava ocean steam dramatic night",
      "Haleakalā Hawaii sunrise above clouds summit",
      "Hawaii North Shore pipeline wave curl dramatic",
    ],
    adventure_extreme: [
      "Hawaii big wave surfing Pipeline Oahu North Shore",
      "Hawaii Kauai zip-line rainforest canopy",
      "Hawaii Maui windsurfing Hookipa beach",
      "Hawaii volcano hike lava field Big Island",
    ],
    wildlife_fauna: [
      "Hawaii green sea turtle beach resting sand",
      "Hawaii humpback whale winter breach Maui",
      "Hawaii monk seal beach resting endangered",
      "Hawaii manta ray night dive Big Island",
    ],
    food_market: [
      "Hawaii poke bowl fresh tuna rice sesame",
      "Hawaii shave ice rainbow tropical sweet",
      "Hawaii luau roast pig kalua traditional feast",
      "Hawaii macadamia nut farm Big Island",
    ],
    luxury_premium: [
      "Hawaii Maui resort infinity pool ocean view",
      "Hawaii Four Seasons Hualalai private villa",
      "Lanai Hawaii secluded luxury beach resort",
    ],
    seasonal_spectacle: [
      "Hawaii whale season winter Maui breach sunrise",
      "Hawaii Merrie Monarch hula festival spring",
      "Hawaii night sky Mauna Kea observatory stars",
    ],
    nightlife_urban: [
      "Honolulu Waikiki Hawaii rooftop bar sunset",
      "Maui Hawaii open-air restaurant beachfront",
    ],
  },

  greenland: {
    landmarks: [
      "Ilulissat Icefjord Greenland icebergs massive",
      "Disko Bay Greenland iceberg blue sea",
      "Greenland aurora borealis ice fjord night",
      "Nuuk Greenland colorful wooden houses snow",
    ],
    winter_arctic: [
      "Greenland iceberg massive blue sea fjord",
      "Greenland sea ice pack polar vast",
      "Greenland tundra snow polar bear region",
      "Greenland glacier calving ice ocean",
      "Greenland aurora ice snow dark sky",
    ],
    natural_landscapes: [
      "Greenland Arctic tundra vast endless summer",
      "Greenland midnight sun Arctic horizon glow",
      "Greenland fjord dramatic cliff iceberg",
    ],
    wildlife_fauna: [
      "Greenland musk ox tundra Arctic",
      "Greenland narwhal tusk fjord Arctic",
      "Greenland sled dog team snow trail",
    ],
    aerial_panoramic: [
      "Greenland aerial ice sheet vast white",
      "Ilulissat Greenland aerial icefjord blue",
      "Greenland aerial fjord ice mountain vast",
    ],
    cinematic_atmosphere: [
      "Greenland aurora borealis ice reflection night",
      "Greenland iceberg blue glow dramatic Arctic",
      "Greenland midnight sun orange horizon ice",
    ],
    adventure_extreme: [
      "Greenland dogsled ice trail Arctic winter",
      "Greenland hiking Ilulissat icefjord trail",
      "Greenland kayaking iceberg Arctic sea",
      "Greenland skiing remote backcountry Arctic",
      "Greenland snowmobile expedition Arctic ice field",
      "Greenland ice cap skiing traverse polar",
      "Greenland whale watching humpback Disko Bay summer",
    ],
    cultural_traditional: [
      "Greenland Inuit hunters traditional heritage",
      "Nuuk Greenland colourful wooden house winter",
    ],
    seasonal_spectacle: [
      "Greenland midnight sun continuous day summer",
      "Greenland polar winter darkness aurora sky",
    ],
    food_market: [
      "Greenland musk ox seal whale traditional hunt",
      "Greenland dried fish traditional Inuit food",
      "Nuuk Greenland restaurant arctic char fresh",
    ],
    luxury_premium: [
      "Greenland luxury expedition cruise icefjord private",
      "Greenland helicopter glacier private tour ice",
    ],
    transportation_iconic: [
      "Greenland helicopter flight icefjord landscape aerial",
      "Greenland Air Greenland small plane remote landing",
      "Greenland dogsled traditional Inuit team trail",
    ],
    spiritual_religious: [
      "Nuuk Greenland Katuaq cultural centre wood wave",
      "Greenland Inuit shaman drum dance ceremony",
    ],
    vegetation_flora: [
      "Greenland Arctic wildflower tundra short summer bloom",
      "Greenland lichen rock colour Arctic ground",
    ],
    nightlife_urban: [
      "Nuuk Greenland bar harbour evening colourful",
      "Greenland summer midnight sun outdoor gathering",
    ],
    urban_environment: [
      "Nuuk Greenland colourful houses harbour modern",
      "Greenland remote village settlement helicopter link",
    ],
    festival_celebration: [
      "Greenland National Day June 21 Nuuk parade",
      "Greenland Inuit kayaking festival traditional race",
    ],
  },

  antarctica: {
    landmarks: [
      "Antarctica penguin colony emperor ice continent",
      "Antarctica iceberg blue underwater Antarctica",
      "Antarctica Discovery Hut historical hut Scott",
      "Antarctica icebreaker ship Ross Sea",
    ],
    winter_arctic: [
      "Antarctica polar south pole vast white",
      "Antarctica ice shelf calving ocean",
      "Antarctica blizzard dramatic katabatic wind",
      "Antarctica midnight sun summer horizon",
      "Antarctica aurora australis southern lights",
    ],
    wildlife_fauna: [
      "Antarctica emperor penguin chick huddle ice",
      "Antarctica leopard seal ice floe resting",
      "Antarctica orca pod swimming ice cold water",
      "Antarctica humpback whale breach fjord",
      "Antarctica Weddell seal ice circle",
    ],
    natural_landscapes: [
      "Antarctica dramatic mountain ice continent",
      "Antarctica blue iceberg towering sea",
      "Antarctica frozen sea ice pack",
    ],
    aerial_panoramic: [
      "Antarctica aerial vast white ice sheet",
      "Antarctica iceberg aerial blue formation",
      "Antarctica aerial peninsula mountain ice dramatic",
    ],
    cinematic_atmosphere: [
      "Antarctica iceberg towering blue glow dramatic",
      "Antarctica aurora australis green sky polar",
      "Antarctica sunset orange pink sky ice reflection",
      "Antarctica whiteout blizzard wind dramatic stark",
      "Antarctica emperor penguin march ice endless white",
    ],
    adventure_extreme: [
      "Antarctica icebreaker expedition polar crossing",
      "Antarctica polar plunge swim icy water",
      "Antarctica ski touring remote glacier",
      "Antarctica kayak iceberg channel close paddle",
      "Antarctica camping overnight ice tent polar",
      "Antarctica scuba dive under ice sealed clear",
      "Antarctica mountaineering remote peak unclimbed",
    ],
    seasonal_spectacle: [
      "Antarctica summer December penguin colony active",
      "Antarctica winter dark polar aurora long night",
    ],
    luxury_premium: [
      "Antarctica luxury expedition cruise ship polar",
      "Antarctica private helicopter glacier landing",
      "Antarctica exclusive icebreaker Zodiac landing",
    ],
    food_market: [
      "Antarctica expedition galley meal ship polar crew",
      "Antarctica ship chef fresh food Antarctic crossing",
    ],
    transportation_iconic: [
      "Antarctica icebreaker ship bow ice crush polar",
      "Antarctica Zodiac inflatable boat iceberg shore",
      "Antarctica Twin Otter plane ski landing ice",
    ],
    cultural_traditional: [
      "Antarctica scientific research station flag pole",
      "Antarctica Shackleton Endurance historical memorial",
    ],
    vegetation_flora: [
      "Antarctica Antarctic moss green rock rare",
      "Antarctica lichen colourful rock coast sparse",
    ],
    urban_environment: [
      "Antarctica McMurdo Station research base metal",
      "Antarctica Esperanza base Argentina Antarctica",
    ],
    festival_celebration: [
      "Antarctica midwinter celebration June solstice station",
    ],
  },

  mongolia: {
    landmarks: [
      "Mongolia eagle hunter Altai mountain traditional",
      "Mongolia Ger white tent vast steppe",
      "Khövsgöl Lake Mongolia clear reflection mountain",
      "Gobi Desert Mongolia sand dune camel",
      "Karakorum ancient capital Mongolia ruins",
    ],
    natural_landscapes: [
      "Mongolia vast steppe grassland endless sky",
      "Gobi Mongolia sand dune dramatic horizon",
      "Mongolia lake mountain reflection crystal",
      "Mongolia wild horse Przewalski freedom",
    ],
    cultural_traditional: [
      "Mongolia nomad horseback traditional festival",
      "Naadam Mongolia wrestling horse race archery",
      "Mongolia traditional throat singing Mongolian",
      "Mongolian nomad family felt ger white tent",
    ],
    wildlife_fauna: [
      "Mongolia Bactrian camel Gobi two hump",
      "Mongolia snow leopard mountain rare",
      "Mongolia wild horse freedom steppe",
    ],
    desert_arid: [
      "Gobi Desert Mongolia dune camel orange",
      "Mongolia Flaming Cliffs red Gobi fossil",
    ],
    aerial_panoramic: [
      "Mongolia steppe aerial endless grassland",
      "Gobi Mongolia aerial dune red sunset",
      "Mongolia Khövsgöl lake aerial turquoise mountain",
    ],
    cinematic_atmosphere: [
      "Mongolia vast steppe horizon lone ger dramatic",
      "Gobi Mongolia flamingo cliffs red sunset dramatic",
      "Mongolia Naadam festival horseback dust dramatic",
    ],
    adventure_extreme: [
      "Mongolia horseback trekking steppe multi-day",
      "Mongolia Gobi Desert 4x4 adventure",
      "Mongolia eagle hunting traditional falconer",
    ],
    seasonal_spectacle: [
      "Mongolia Naadam July festival wrestling archery",
      "Mongolia winter frozen steppe −40°C extreme",
    ],
    food_market: [
      "Mongolia airag fermented mare milk traditional",
      "Mongolia khorkhog meat stone fire pot",
      "Mongolia buuz steamed dumpling meat festival",
      "Ulaanbaatar Mongolia market noodle tsuivan stew",
    ],
    luxury_premium: [
      "Mongolia luxury ger camp desert starry night",
      "Mongolia Gobi private camp chandelier tent exclusive",
      "Mongolia helicopter Khövsgöl private landing lake",
    ],
    spiritual_religious: [
      "Mongolia Erdene Zuu monastery Karakorum ancient",
      "Mongolia Buddhist monastery thangka prayer drum",
      "Mongolia ovoo sacred cairn stone sky shaman",
    ],
    architecture: [
      "Mongolia Ulaanbaatar Gandan Monastery golden Buddha",
      "Mongolia ger felt white round traditional dwelling",
      "Mongolia Soviet-era building Ulaanbaatar square",
    ],
    urban_environment: [
      "Ulaanbaatar Mongolia Sukhbaatar Square capital",
      "Mongolia Ulaanbaatar modern city winter cold",
    ],
    nightlife_urban: [
      "Ulaanbaatar Mongolia bar restaurant modern city",
      "Mongolia Naadam festival evening concert outdoor",
    ],
    transportation_iconic: [
      "Mongolia Trans-Siberian railway train journey vast",
      "Mongolia horse traditional transport steppe nomad",
      "Mongolia camel Gobi trek two hump traditional",
    ],
    winter_arctic: [
      "Mongolia Gobi winter −40 frozen desert extreme",
      "Mongolia steppe winter snow ger smoke fire",
      "Mongolia Khövsgöl frozen lake ice festival winter",
    ],
    vegetation_flora: [
      "Mongolia steppe grass endless green summer rain",
      "Mongolia Khövsgöl taiga forest pine autumn",
      "Mongolia wildflower steppe spring burst colour",
    ],
    festival_celebration: [
      "Mongolia Naadam July wrestling horse archery crowd",
      "Mongolia Tsagaan Sar lunar new year family feast",
      "Mongolia Golden Eagle Festival October Altai",
    ],
    ancient_ruins: [
      "Mongolia Karakorum ruins ancient Mongol Empire",
      "Mongolia deer stone ancient carved rock steppe",
      "Mongolia Erdene Zuu monastery wall white ancient",
    ],
  },

  georgia: {
    landmarks: [
      "Gergeti Trinity Church Kazbegi Georgia mountain",
      "Mtskheta Jvari cross church Georgia hill",
      "Tbilisi old town sulfur bath Georgia balcony",
      "Narikala fortress Tbilisi Georgia hillside",
      "Svaneti medieval tower Georgia mountain",
    ],
    natural_landscapes: [
      "Georgia Caucasus mountain snow peak dramatic",
      "Svaneti valley Georgia mountain village tower",
      "Georgia Kazbegi green valley mountain mist",
    ],
    cultural_traditional: [
      "Georgia polyphonic choir traditional singing",
      "Georgia traditional feast supra table food",
      "Georgia Tbilisi old town balcony ornate wood",
    ],
    wine: [
      "Georgia qvevri clay wine vessel ancient",
      "Georgia Kakheti vineyard wine row",
    ],
    architecture: [
      "Tbilisi Georgia ornate wooden balcony house",
      "Georgia Caucasus fortress tower medieval",
    ],
    food_market: [
      "Georgia khinkali dumpling fold twist",
      "Georgia khachapuri cheese bread boat",
    ],
    ancient_ruins: [
      "Georgia Uplistsikhe cave city rock ancient",
      "Georgia Mtskheta Svetitskhoveli cathedral ancient",
    ],
    cinematic_atmosphere: [
      "Kazbegi Georgia Gergeti church mountain mist",
      "Georgia Tbilisi old town balcony dusk golden",
      "Georgia Svaneti medieval tower snow peak mist",
    ],
    adventure_extreme: [
      "Georgia Kazbegi trek mountain trail summit",
      "Georgia Svaneti trekking Mestia multi-day",
      "Georgia paragliding Gudauri ski resort",
    ],
    spiritual_religious: [
      "Georgia Jvari monastery hill ancient stone",
      "Georgia Alaverdi Cathedral orchard vineyard",
    ],
    nightlife_urban: [
      "Tbilisi Georgia Fabrika bar courtyard hipster",
      "Tbilisi nightclub underground techno Georgia",
    ],
    luxury_premium: [
      "Georgia Kakheti wine estate luxury hotel vineyard",
      "Tbilisi boutique hotel sulfur bath Georgia",
    ],
    seasonal_spectacle: [
      "Georgia Kakheti autumn harvest wine golden",
      "Georgia Kazbegi winter snow peak pine",
    ],
    aerial_panoramic: [
      "Tbilisi Georgia aerial fortress hill river",
      "Georgia Kazbegi valley aerial mountain church",
    ],
    vegetation_flora: [
      "Georgia Kakheti vineyard autumn gold October",
    ],
  },

  armenia: {
    landmarks: [
      "Khor Virap monastery Mount Ararat Armenia",
      "Geghard monastery rock carved Armenia",
      "Tatev monastery cliff gorge Armenia",
      "Lake Sevan Armenia mountain blue highland",
      "Noravank church red rock gorge Armenia",
    ],
    ancient_ruins: [
      "Armenia Garni pagan temple column Hellenistic",
      "Armenia Zvartnots ruined cathedral Artashat",
      "Armenia ancient khachkar cross stone carved",
    ],
    natural_landscapes: [
      "Armenia Debed Canyon gorge monastery cliff",
      "Armenia highland plateau Mount Ararat view",
    ],
    cultural_traditional: [
      "Armenia apricot national symbol traditional",
      "Yerevan Armenia pomegranate pink stone building",
      "Armenia lavash bread baking traditional UNESCO",
      "Armenia duduk music wooden oboe ancient",
    ],
    food_market: [
      "Armenia dolma vine leaf stuffed lamb",
      "Yerevan Armenia street market fresh fruit",
      "Armenia basturma dried spiced meat traditional",
      "Armenia pomegranate wine Areni cave cellar",
      "Yerevan Armenia GUM market fresh lavash bread",
    ],
    spiritual_religious: [
      "Armenia ancient church stone cross mountain",
      "Armenia Christian oldest church world claim",
      "Armenia Khor Virap chapel Ararat backdrop",
    ],
    cinematic_atmosphere: [
      "Khor Virap Armenia Ararat snow volcano dramatic",
      "Armenia Tatev monastery cliff gorge dusk",
      "Armenia Noravank red rock canyon church",
    ],
    adventure_extreme: [
      "Armenia Tatev cable car world longest gondola",
      "Armenia hiking Aragats summit volcano trail",
      "Armenia Dilijan forest trail mountain Tavush",
    ],
    urban_environment: [
      "Yerevan Armenia pink tuff stone square modern",
      "Yerevan Armenia Cascade sculpture garden",
    ],
    aerial_panoramic: [
      "Armenia Ararat plain aerial Khor Virap monastery",
      "Armenia highland lake Sevan aerial",
    ],
    seasonal_spectacle: [
      "Armenia apricot blossom spring April pink",
      "Armenia Ararat snow-capped clear November",
      "Armenia Vardavar water festival summer July",
      "Armenia snow winter Tatev monastery December",
    ],
    luxury_premium: [
      "Yerevan Armenia luxury hotel Marriott Republic Square",
      "Armenia wine tour Areni cave Vayots Dzor",
      "Armenia private tour ancient monastery helicopter",
    ],
    nightlife_urban: [
      "Yerevan Armenia North Avenue bar café pedestrian",
      "Armenia Yerevan Republic Square fountain show",
      "Yerevan Armenia rooftop bar Ararat view sunset",
    ],
    transportation_iconic: [
      "Armenia Tatev cable way gondola longest world",
      "Yerevan Armenia metro station Soviet mosaic art",
    ],
    vegetation_flora: [
      "Armenia Dilijan forest beech autumn colour gold",
      "Armenia Sevan lakeshore reed green summer",
      "Armenia apricot orchard blossom pink spring",
    ],
    architecture: [
      "Yerevan Armenia pink tuff stone Republic Square",
      "Armenia Zvartnots Cathedral ruin column Armenia",
      "Yerevan Armenia Cascade monument staircase",
    ],
    festival_celebration: [
      "Armenia Yerevan wine festival Areni October",
      "Armenia Vardavar water festival crowd summer",
      "Armenia jazz festival Yerevan open air summer",
    ],
    wildlife_fauna: [
      "Armenia Lake Sevan gull bird mountain lake",
      "Armenia brown bear Dilijan forest wildlife",
    ],
    coastal_marine: [
      "Armenia Lake Sevan highland largest lake blue",
      "Armenia Sevan peninsula monastery water view",
    ],
  },

  uzbekistan: {
    landmarks: [
      "Registan Samarkand blue tile madrasah Uzbekistan",
      "Shah-i-Zinda Samarkand turquoise tile street",
      "Bukhara old city minaret Uzbekistan",
      "Bibi-Khanym mosque ruin Samarkand Uzbekistan",
      "Khiva Itchan Kala walled city Uzbekistan",
    ],
    ancient_ruins: [
      "Samarkand Uzbekistan Timur Tamerlane mausoleum",
      "Afrasiab Uzbekistan ancient Silk Road ruins",
      "Termez Uzbekistan Buddhist ancient monastery",
    ],
    architecture: [
      "Uzbekistan blue turquoise dome mosaic intricate",
      "Registan Uzbekistan blue tile star geometric",
      "Bukhara old town mud-brick bazaar Uzbekistan",
    ],
    cultural_traditional: [
      "Uzbekistan Silk Road bazaar trading ancient",
      "Uzbekistan embroidery suzani textile pattern",
      "Samarkand Uzbekistan plov rice national dish",
    ],
    desert_arid: [
      "Uzbekistan Kyzylkum desert camel caravan",
      "Aral Sea Uzbekistan shipwreck dry tragedy",
    ],
    food_market: [
      "Uzbekistan samsa baked pastry market",
      "Uzbekistan plov rice national dish feast",
      "Uzbekistan non bread flatbread tandoor oven",
      "Samarkand Uzbekistan market spice vibrant color",
    ],
    cinematic_atmosphere: [
      "Registan Samarkand Uzbekistan dusk blue dome gold",
      "Shah-i-Zinda Uzbekistan tile alley narrow turquoise",
      "Khiva Uzbekistan golden hour minaret ancient",
    ],
    aerial_panoramic: [
      "Registan Samarkand Uzbekistan aerial mosque complex",
      "Bukhara Uzbekistan aerial minaret old city",
    ],
    adventure_extreme: [
      "Uzbekistan Aral Sea shipwreck desert trek",
      "Uzbekistan Fan Mountains trekking high altitude",
    ],
    luxury_premium: [
      "Samarkand Uzbekistan boutique heritage hotel Silk Road",
    ],
    spiritual_religious: [
      "Uzbekistan mosque blue dome Islamic prayer",
      "Bukhara Uzbekistan Kalon Minaret ancient mosque",
    ],
    seasonal_spectacle: [
      "Uzbekistan spring apricot blossom Fergana April",
      "Uzbekistan Navruz spring festival March food",
    ],
    transportation_iconic: [
      "Uzbekistan Afrosiyob high-speed train Silk Road",
      "Bukhara Uzbekistan donkey cart old city bazaar",
    ],
    urban_environment: [
      "Samarkand Uzbekistan old city UNESCO heritage lane",
      "Tashkent Uzbekistan Soviet era metro station ornate",
    ],
  },

  romania: {
    landmarks: [
      "Bran Castle Transylvania Romania Dracula",
      "Peles Castle Sinaia Romania ornate mountain",
      "Transfăgărășan mountain road Romania dramatic",
      "Painted Monasteries Bucovina Romania exterior fresco",
      "Corvin Castle Hunedoara Romania Gothic moat",
    ],
    natural_landscapes: [
      "Carpathian mountain Romania forest autumn",
      "Danube Delta Romania reed wetland bird",
      "Romania Bucegi mountain rock formation",
    ],
    cultural_traditional: [
      "Romania traditional village Maramures wood church",
      "Romania Maramures carved wooden gate",
      "Romania folk costume embroidery traditional",
    ],
    wildlife_fauna: [
      "Romania Carpathian brown bear forest",
      "Romania Danube Delta pelican colony white",
    ],
    architecture: [
      "Romania Gothic castle courtyard Renaissance",
      "Sibiu Romania colorful house eye window",
    ],
    ancient_ruins: [
      "Sarmizegetusa Romania Dacian ancient ruins",
    ],
    food_market: [
      "Romania sarmale cabbage roll traditional",
      "Bucharest Romania outdoor market fresh",
      "Romania cozonac sweet bread Easter traditional",
      "Bucharest Romania street food chimney cake",
      "Romania ciorba sour soup rustic traditional",
    ],
    cinematic_atmosphere: [
      "Transfăgărășan Romania serpentine road mountain fog",
      "Bran Castle Romania dusk misty Transylvania",
      "Romania Bucovina painted monastery colorful wall",
      "Romania Maramures wooden church winter snow",
    ],
    urban_environment: [
      "Bucharest Romania communist palace grand building",
      "Brasov Romania medieval square colorful facades",
      "Sibiu Romania central square cobblestone",
    ],
    adventure_extreme: [
      "Romania Transfăgărășan road motorcycle drive",
      "Romania Apuseni cave spelunking adventure",
      "Romania Carpathian trail hiking peak autumn",
    ],
    seasonal_spectacle: [
      "Romania Transylvania autumn forest golden mist",
      "Romania Danube Delta spring bird migration",
      "Romania Christmas market Sibiu winter lights",
    ],
    luxury_premium: [
      "Romania Transylvania castle boutique hotel",
      "Romania Danube Delta eco-lodge boat reed sunset",
      "Sinaia Romania Peles Palace luxury mountain resort",
      "Romania Bran Castle private tour Dracula legend",
    ],
    spiritual_religious: [
      "Romania Bucovina monastery exterior fresco painted",
      "Curtea de Arges Cathedral Romania Byzantine",
      "Romania Voroneț Monastery blue exterior fresco",
    ],
    nightlife_urban: [
      "Bucharest Romania Calea Victoriei nightlife bar",
      "Cluj-Napoca Romania student city bar nightlife",
    ],
    coastal_marine: [
      "Romania Constanta Black Sea beach summer",
      "Mamaia Romania Black Sea resort turquoise sand",
    ],
    transportation_iconic: [
      "Transfăgărășan Romania mountain road hairpin drive",
    ],
  },

  bulgaria: {
    landmarks: [
      "Rila Monastery Bulgaria frescoed courtyard",
      "Alexander Nevsky Cathedral Sofia Bulgaria",
      "Old Nessebar Black Sea Bulgaria Byzantine",
      "Plovdiv old town Bulgaria painted house",
      "Shipka Pass memorial Bulgaria mountain",
    ],
    natural_landscapes: [
      "Bulgaria Rhodope mountains valley village",
      "Bulgaria Rose Valley Kazanlak field pink",
      "Bulgaria Vitosha mountain Sofia backdrop",
    ],
    cultural_traditional: [
      "Bulgaria rose festival Kazanlak traditional",
      "Bulgaria folk dance Horo circle costume",
    ],
    ancient_ruins: [
      "Bulgaria Thracian tomb Kazanlak ancient",
      "Plovdiv Bulgaria Roman theatre ancient",
    ],
    coastal_marine: [
      "Bulgaria Black Sea beach resort summer",
      "Sozopol Bulgaria Old Town sea Bulgaria",
      "Bulgaria Sunny Beach resort turquoise summer",
      "Bulgaria Varna sea garden promenade",
    ],
    cinematic_atmosphere: [
      "Rila Monastery Bulgaria mountain courtyard atmospheric",
      "Bulgaria Rose Valley June dawn pink field",
      "Plovdiv Bulgaria old town hill dusk dramatic",
    ],
    urban_environment: [
      "Plovdiv Bulgaria Kapana creative district art",
      "Sofia Bulgaria city park mountain backdrop",
    ],
    adventure_extreme: [
      "Bulgaria Bansko ski resort mountain winter",
      "Bulgaria Rhodope mountains cycling trail",
      "Bulgaria cave diving Prohodna Eye of God",
      "Bulgaria canyoning Trigrad Gorge Rhodope",
    ],
    food_market: [
      "Bulgaria banitsa filo pastry cheese street",
      "Bulgaria rose product rose oil cosmetic market",
      "Bulgaria shopska salad fresh summer tomato",
      "Bulgaria tarator cold yogurt soup cucumber",
    ],
    seasonal_spectacle: [
      "Bulgaria Rose Festival Kazanlak June harvest",
      "Bulgaria autumn Rhodope foliage mountain",
      "Bulgaria Black Sea beach August summer peak",
    ],
    spiritual_religious: [
      "Rila Monastery Bulgaria orthodox icon fresco",
      "Bulgaria Bachkovo Monastery canyon valley",
      "Sofia Bulgaria Banya Bashi mosque Ottoman",
    ],
    vegetation_flora: [
      "Bulgaria Valley of Roses pink bloom June",
      "Bulgaria Rhodope forest beech oak autumn",
    ],
    luxury_premium: [
      "Bulgaria Plovdiv boutique hotel old town",
      "Bulgaria Black Sea resort luxury hotel summer",
    ],
    nightlife_urban: [
      "Sofia Bulgaria bar district Vitosha Boulevard",
      "Plovdiv Bulgaria Kapana bar night creative",
    ],
    architecture: [
      "Sofia Bulgaria Alexander Nevsky Cathedral dome",
      "Plovdiv Bulgaria Roman amphitheatre stone",
      "Bulgaria Sozopol Old Town stone house sea",
    ],
    transportation_iconic: [
      "Bulgaria Sofia metro station map modern",
      "Bulgaria Rhodope narrow-gauge steam train",
    ],
    wildlife_fauna: [
      "Bulgaria Rhodope griffon vulture soar cliff",
      "Bulgaria wolf brown bear Rhodope forest",
    ],
  },

  slovenia: {
    landmarks: [
      "Lake Bled island church Slovenia reflection",
      "Predjama Castle cliff Slovenia cave",
      "Ljubljana dragon bridge Slovenia capital",
      "Triglav mountain Slovenia alpine national",
      "Skocjan cave Slovenia underground river",
    ],
    natural_landscapes: [
      "Slovenia Triglav National Park alpine lake",
      "Lake Bohinj Slovenia mountain reflection",
      "Slovenia Julian Alps meadow flower",
    ],
    water_features: [
      "Lake Bled Slovenia turquoise reflection",
      "Vintgar gorge Slovenia river canyon",
    ],
    architecture: [
      "Ljubljana Slovenia old town castle hill",
    ],
    adventure_extreme: [
      "Slovenia Soča river emerald kayak canyon",
      "Slovenia Triglav summit climb alpine challenge",
      "Slovenia Bovec white water rafting Soča",
      "Slovenia via ferrata mountain wall steel cable",
    ],
    cinematic_atmosphere: [
      "Lake Bled Slovenia morning mist island church",
      "Slovenia Julian Alps dramatic peak cloud dusk",
      "Predjama Castle Slovenia cliff face dramatic",
    ],
    cultural_traditional: [
      "Ljubljana Slovenia Christmas market lights river",
      "Slovenia Kurentovanje Ptuj carnival mask spring",
    ],
    food_market: [
      "Slovenia Kranjska klobasa sausage traditional",
      "Ljubljana central market Slovenia fresh produce",
      "Slovenia honey traditional Carniolan bee",
    ],
    urban_environment: [
      "Ljubljana Slovenia old town riverside café",
      "Ljubljana Slovenia triple bridge green city",
    ],
    luxury_premium: [
      "Lake Bled Slovenia luxury resort castle view",
      "Slovenia Lipica stud farm white horse luxury",
    ],
    seasonal_spectacle: [
      "Lake Bled Slovenia winter snow church island",
      "Slovenia Julian Alps spring meadow wildflower",
    ],
    aerial_panoramic: [
      "Lake Bled Slovenia aerial island church turquoise",
      "Slovenia Triglav national park aerial",
      "Soča Valley Slovenia aerial emerald river canyon",
    ],
    nightlife_urban: [
      "Ljubljana Slovenia old town outdoor bar summer",
      "Ljubljana Slovenia Metelkova alternative art bar",
    ],
    wildlife_fauna: [
      "Slovenia Triglav chamois mountain goat rocky",
      "Slovenia brown bear Kočevje forest rare",
    ],
    coastal_marine: [
      "Piran Slovenia Adriatic coast old town cliff",
      "Slovenia Portorož beach Adriatic blue summer",
    ],
    spiritual_religious: [
      "Ljubljana Slovenia cathedral twin spire baroque",
      "Plečnik Slovenia National Library Ljubljana ornate",
    ],
    transportation_iconic: [
      "Ljubljana Slovenia Plečnik triple bridge cycle",
      "Slovenia mountain train Bohinj tunnel scenic",
    ],
    vegetation_flora: [
      "Triglav Slovenia alpine meadow gentian flower",
      "Lake Bohinj Slovenia water lily summer",
    ],
    winter_arctic: [
      "Slovenia Kranjska Gora ski resort Alpine winter",
      "Lake Bled Slovenia winter snow church island",
    ],
  },

  slovakia: {
    landmarks: [
      "Bojnice Castle Slovakia ornate fairy tale",
      "Bratislava Castle hill Slovakia Danube",
      "Tatra mountains Slovakia high peak rocky",
      "Spis Castle Slovakia ruins hilltop large",
    ],
    natural_landscapes: [
      "High Tatras Slovakia mountain lake glacial",
      "Slovakia Tatra rocky peak summer hike",
      "Slovakia Tatra glacial lake mountain cirque",
      "Slovakia autumn beech forest Carpathian",
    ],
    architecture: [
      "Bratislava old town Slovakia historic lane",
      "Bojnice Castle Slovakia neo-Gothic tower moat",
      "Bratislava Devin Castle cliff ruin confluence",
    ],
    cultural_traditional: [
      "Slovakia folk embroidery traditional pattern",
      "Slovakia Vlkolínec UNESCO village wooden",
      "Slovakia folk dance Čardáš costume circle",
    ],
    cinematic_atmosphere: [
      "High Tatras Slovakia dramatic peak cloud",
      "Slovakia Spis Castle hilltop ruin misty",
      "Bratislava Slovakia Danube sunset bridge",
    ],
    adventure_extreme: [
      "Slovakia High Tatras hiking ridge summer",
      "Slovakia Tatra ski resort winter powder",
      "Slovakia caving Demänovská ice cave",
    ],
    food_market: [
      "Slovakia bryndzové halušky sheep cheese dumplings",
      "Bratislava Slovakia Christmas market mulled wine",
    ],
    urban_environment: [
      "Bratislava old town Slovakia café cobblestone",
      "Kosice Slovakia pedestrian zone beautiful",
    ],
    seasonal_spectacle: [
      "Slovakia Christmas market Bratislava December",
      "Slovakia spring wildflower meadow alpine",
      "Slovakia Tatra autumn larch gold October",
    ],
    aerial_panoramic: [
      "Spis Castle Slovakia aerial hilltop ruin vast",
      "Slovakia High Tatras aerial glacier lake rocky",
      "Bratislava Slovakia aerial castle hill Danube",
    ],
    luxury_premium: [
      "Bratislava Slovakia boutique hotel old town",
      "Slovakia Tatra mountain lodge spa winter",
    ],
    wildlife_fauna: [
      "Slovakia High Tatras brown bear trail forest",
      "Slovakia chamois Tatras rocky mountain",
      "Slovakia eagle nest Tatra peak soar",
    ],
    nightlife_urban: [
      "Bratislava Slovakia bar old town cobblestone night",
      "Bratislava Slovakia Rybné Námestie bar riverside",
    ],
    spiritual_religious: [
      "Slovakia Levoca Basilica UNESCO pilgrimage hill",
      "Slovakia wooden church UNESCO Carpathian heritage",
    ],
    winter_arctic: [
      "Slovakia Jasná ski resort High Tatras powder",
      "Slovakia Tatras winter snow ice frozen lake",
    ],
    coastal_marine: [
      "Bratislava Slovakia Danube river cruise embankment",
    ],
    transportation_iconic: [
      "Bratislava Slovakia UFO bridge observation deck",
    ],
    vegetation_flora: [
      "Slovakia High Tatras edelweiss alpine flower",
      "Slovakia autumn beech copper Carpathian ridge",
    ],
  },

  estonia: {
    landmarks: [
      "Tallinn Old Town medieval tower wall Estonia",
      "Tallinn Town Hall square Estonia cobblestone",
      "Lahemaa national park Estonia forest coast",
      "Viru Bog Estonia floating boardwalk misty",
    ],
    urban_environment: [
      "Tallinn Estonia hanseatic medieval market",
      "Tallinn old town colourful guild hall Estonia",
      "Tartu Estonia university town cobblestone",
    ],
    winter_arctic: [
      "Estonia winter snow forest frozen bog",
      "Tallinn Estonia Christmas market medieval square",
      "Estonia frozen Baltic sea ice shore winter",
    ],
    cultural_traditional: [
      "Estonia Song Festival outdoor choir tradition",
      "Estonia folk dance laulupidu outdoor massive",
      "Estonia Saaremaa windmill traditional island",
    ],
    natural_landscapes: [
      "Estonia coastal island reed wetland Baltic",
      "Estonia peat bog boardwalk autumn misty",
      "Lahemaa forest Estonia ancient pine coastal",
    ],
    cinematic_atmosphere: [
      "Tallinn Estonia medieval towers dusk dramatic",
      "Estonia bog lake misty morning autumn",
      "Tallinn Estonia snow church tower winter quiet",
    ],
    food_market: [
      "Tallinn Estonia old market hall fresh",
      "Estonia black bread rye traditional",
      "Estonia smoked fish traditional Baltic",
    ],
    adventure_extreme: [
      "Estonia bog walking wetland experience",
      "Estonia cycling Saaremaa island coast",
    ],
    aerial_panoramic: [
      "Tallinn Estonia aerial medieval roof tile",
      "Estonia Lahemaa coast aerial sea island",
      "Estonia Viru bog aerial floating island lake",
    ],
    luxury_premium: [
      "Tallinn Estonia luxury boutique hotel old town",
      "Estonia forest cabin sauna lake private",
    ],
    nightlife_urban: [
      "Tallinn Estonia medieval bar vault cellar",
      "Tallinn Estonia old town pub terrace summer",
    ],
    spiritual_religious: [
      "Tallinn Estonia Alexander Nevsky Cathedral onion dome",
      "Tallinn Toompea Estonia Lutheran cathedral medieval",
    ],
    coastal_marine: [
      "Estonia Pärnu beach Baltic summer warm",
      "Estonia Hiiumaa island lighthouse Baltic coast",
    ],
    seasonal_spectacle: [
      "Estonia summer Midsummer bonfire solstice beach",
      "Tallinn Estonia Christmas market square snow",
      "Estonia autumn peat bog copper red October",
    ],
    transportation_iconic: [
      "Tallinn Estonia old city tram cobblestone narrow",
    ],
    vegetation_flora: [
      "Estonia Lahemaa bog cotton grass June float",
      "Estonia spring bluebell forest Lahemaa",
    ],
    wildlife_fauna: [
      "Estonia Lahemaa brown bear forest trail",
      "Estonia white stork nest chimney summer",
      "Estonia seal colony Baltic coast rocky",
    ],
  },

  latvia: {
    landmarks: [
      "Riga Art Nouveau facade Latvia ornate",
      "Riga old town dome cathedral Latvia",
      "Gauja National Park Latvia cliff castle",
      "Cape Kolka Latvia Baltic wind sea",
    ],
    architecture: [
      "Riga Latvia Jugendstil building ornate facade",
      "Riga Old Town Latvia painted facade medieval",
      "Latvia wooden house Riga old suburb colourful",
    ],
    natural_landscapes: [
      "Latvia Sigulda Gauja valley forest autumn",
      "Latvia Kemeri bog boardwalk misty Latvia",
      "Latvia Gauja National Park sandstone cliff cave",
    ],
    cultural_traditional: [
      "Latvia song dance festival Riga tradition",
      "Latvia Midsummer Jāņi bonfire flower crown",
      "Riga Central Market Latvia old zeppelin hangar",
    ],
    cinematic_atmosphere: [
      "Riga Latvia old town dusk tower silhouette",
      "Latvia amber Baltic coast wave dramatic",
      "Latvia autumn Gauja valley fog forest",
    ],
    urban_environment: [
      "Riga Art Nouveau district Latvia ornate building",
      "Riga old town cobblestone lane café Latvia",
    ],
    food_market: [
      "Riga Latvia Central Market produce fresh",
      "Latvia grey peas bacon traditional dish",
      "Latvia smoked fish market Baltic",
    ],
    winter_arctic: [
      "Riga Latvia Christmas market medieval December",
      "Latvia frozen Gauja river winter ice",
    ],
    aerial_panoramic: [
      "Riga Latvia aerial old town red roof",
      "Latvia Gauja valley aerial forest river curve",
    ],
    adventure_extreme: [
      "Latvia bobsled track Sigulda winter",
      "Latvia bungee jump Gauja suspension bridge",
      "Latvia kayak Gauja river valley canyon",
    ],
    luxury_premium: [
      "Riga Latvia boutique hotel Art Nouveau design",
      "Latvia Jurmala beach resort Baltic luxury spa",
    ],
    nightlife_urban: [
      "Riga Latvia bar district old town night lively",
      "Latvia Jurmala summer concert outdoor music",
    ],
    coastal_marine: [
      "Jurmala Latvia Baltic white sand beach pine",
      "Cape Kolka Latvia Baltic sea confluence wild",
    ],
    seasonal_spectacle: [
      "Latvia Jāņi solstice bonfire garland flower crown",
      "Riga Latvia Christmas market oldest tradition",
      "Latvia autumn Sigulda forest golden October",
    ],
    wildlife_fauna: [
      "Latvia Kemeri bog white-tailed eagle winter",
      "Latvia Gauja forest lynx wild boar",
    ],
    spiritual_religious: [
      "Riga Latvia Dome Cathedral medieval vault organ",
      "Latvia Aglona Basilica pilgrimage Catholic major",
    ],
    vegetation_flora: [
      "Latvia Kemeri National Park bog sedge grass",
      "Latvia spring lilac flower Riga garden bloom",
    ],
  },

  lithuania: {
    landmarks: [
      "Hill of Crosses Lithuania iron cross thousand",
      "Trakai Island Castle Lithuania lake",
      "Vilnius old town church baroque Lithuania",
      "Curonian Spit Lithuania sand dune tall",
    ],
    architecture: [
      "Vilnius Lithuania baroque church spire old",
      "Vilnius Gediminas Tower hill castle Lithuania",
      "Kaunas Lithuania interwar modernist building",
    ],
    cultural_traditional: [
      "Lithuania amber Baltic coast traditional",
      "Lithuania Uzgavenes Shrove Tuesday pancake mask",
      "Lithuania Song Festival choir grass outdoor",
    ],
    natural_landscapes: [
      "Lithuania Curonian Spit dune Baltic unique",
      "Lithuania Aukstaitija lake forest canoe",
      "Lithuania Dzukija forest mushroom autumn",
    ],
    cinematic_atmosphere: [
      "Hill of Crosses Lithuania iron cross misty morning",
      "Trakai Castle Lithuania lake island dusk",
      "Vilnius Lithuania baroque spires evening gold",
    ],
    urban_environment: [
      "Vilnius old town Lithuania narrow lane church",
      "Vilnius Uzupis bohemian quarter Lithuania",
    ],
    food_market: [
      "Lithuania cepelinai potato dumpling meat dish",
      "Vilnius Hales market food hall Lithuania",
      "Lithuania dark rye bread traditional Baltic",
    ],
    winter_arctic: [
      "Vilnius Lithuania Christmas market cathedral square",
      "Lithuania frozen lake winter skate",
    ],
    adventure_extreme: [
      "Lithuania kayak Nemunas river delta loop",
      "Lithuania cycling Curonian Spit dune forest",
    ],
    coastal_marine: [
      "Palanga Lithuania Baltic beach summer pier",
      "Lithuania Curonian Lagoon water calm flat",
    ],
    aerial_panoramic: [
      "Vilnius Lithuania aerial baroque old town rooftop",
      "Lithuania Curonian Spit aerial dune pine narrow",
      "Trakai Lithuania aerial lake castle island",
    ],
    luxury_premium: [
      "Vilnius Lithuania boutique hotel old town",
      "Lithuania spa retreat forest lake wellness",
    ],
    nightlife_urban: [
      "Vilnius Lithuania Uzupis bar outdoor summer",
      "Lithuania Kaunas Old Town bar student vibrant",
    ],
    seasonal_spectacle: [
      "Lithuania Rasos summer solstice bonfire night",
      "Vilnius Lithuania Christmas market cathedral December",
    ],
    wildlife_fauna: [
      "Lithuania Dzukija forest mushroom forest wild boar",
      "Lithuania Curonian Spit crane migration autumn",
    ],
    spiritual_religious: [
      "Vilnius Lithuania Gate of Dawn Madonna shrine",
      "Hill of Crosses Lithuania sacred Catholic pilgrimage",
    ],
    vegetation_flora: [
      "Lithuania Dzukija blueberry heather forest floor",
      "Vilnius Lithuania spring chestnut blossom boulevard",
    ],
    transportation_iconic: [
      "Lithuania Vilnius old town tram cobble narrow lane",
    ],
  },

  // ══════���═════════════════════ NORTH AFRICA ════════════���═══════════════════

  tunisia: {
    landmarks: [
      "Sidi Bou Said Tunisia blue white village",
      "El Djem amphitheatre Roman Tunisia grand",
      "Tunis Medina souk Tunisia ancient",
      "Douz Tunisia gateway Sahara oasis",
      "Matmata Tunisia troglodyte home Star Wars",
    ],
    desert_arid: [
      "Tunisia Sahara dune Douz camel sunset",
      "Tunisia Chott el Djerid salt flat pink",
      "Tunisia south desert horizon endless sand",
    ],
    ancient_ruins: [
      "Carthage Tunisia Roman ruins column",
      "El Djem Tunisia Roman colosseum large",
      "Tunisia Dougga ancient roman site hill",
    ],
    coastal_marine: [
      "Tunisia Mediterranean beach summer Djerba",
      "Tunis Gulf coast Tunisia warm sea",
    ],
    cultural_traditional: [
      "Tunisia traditional market Tunis medina",
      "Tunisia mosaic Bardo museum ancient art",
      "Tunisia Hammamet whitewashed medina blue",
      "Tunisia traditional pottery Nabeul colourful",
    ],
    architecture: [
      "Sidi Bou Said Tunisia blue door white wall",
      "Tunisia Kairouan Great Mosque minaret ancient",
      "Tunisia Tunis medina ornate arch gateway",
    ],
    cinematic_atmosphere: [
      "Sidi Bou Said Tunisia sunrise blue white dramatic",
      "Tunisia Chott el Djerid salt flat sunrise pink",
      "El Djem Tunisia amphitheatre inside dramatic",
    ],
    adventure_extreme: [
      "Tunisia Sahara 4x4 dune bashing Douz",
      "Tunisia camel trek overnight desert camp",
      "Tunisia quad bike Tozeur date palm oasis",
    ],
    food_market: [
      "Tunisia brick pastry egg harissa street",
      "Tunisia Tunis medina market fresh spice",
      "Tunisia couscous fish seafood Djerba",
    ],
    luxury_premium: [
      "Tunisia Djerba resort beach Mediterranean",
    ],
    aerial_panoramic: [
      "Chott el Djerid Tunisia aerial salt flat pink",
    ],
    spiritual_religious: [
      "Kairouan Tunisia Great Mosque Islamic pilgrimage",
      "Tunisia Kairouan mosque oldest Islam Africa",
    ],
    seasonal_spectacle: [
      "Tunisia Douz International Festival December",
      "Tunisia summer June beach Mediterranean sun",
      "Tunisia spring wildflower Sahara edge April",
    ],
    nightlife_urban: [
      "Sidi Bou Said Tunisia café terrace evening",
      "Tunis Tunisia La Marsa beach bar summer",
    ],
    urban_environment: [
      "Tunis Tunisia Medina souk narrow lane",
      "Hammamet Tunisia walled medina whitewash",
    ],
    transportation_iconic: [
      "Tunisia TGM train coast Sidi Bou Said",
      "Tunisia camel caravan Sahara desert sunset",
    ],
    wildlife_fauna: [
      "Tunisia Ichkeul Lake flamingo bird reserve",
    ],
  },

  algeria: {
    landmarks: [
      "Tassili n'Ajjer rock art Algeria prehistoric",
      "Ghardaia Algeria M'zab valley UNESCO",
      "Djemila Roman ruins Algeria mountain",
      "Algeria Sahara Tadrart red rock dramatic",
    ],
    desert_arid: [
      "Algeria Sahara Tadrart red sandstone arch",
      "Algeria Hoggar mountain desert landscape",
      "Algeria Erg dune vast Sahara golden",
    ],
    ancient_ruins: [
      "Timgad Algeria Roman city grid ancient",
      "Djemila Algeria Roman theatre carved",
    ],
    natural_landscapes: [
      "Atlas Mountains Algeria forest cedar green",
      "Algeria Hoggar mountain dramatic peak granite",
      "Algeria Grand Erg Occidental dune vast",
    ],
    cinematic_atmosphere: [
      "Algeria Tadrart red sandstone canyon dawn",
      "Algeria Sahara starry night clear dark sky",
      "Algeria ancient Roman ruins sunset dramatic",
    ],
    adventure_extreme: [
      "Algeria Hoggar mountain trekking 4x4",
      "Algeria Sahara camel trek Tamanrasset",
    ],
    cultural_traditional: [
      "Algeria Tuareg blue robe desert traditional",
      "Algiers Casbah old medina white alley",
    ],
    food_market: [
      "Algeria couscous tagine traditional North Africa",
      "Algiers central market fresh produce",
    ],
    aerial_panoramic: [
      "Algeria Sahara aerial dune pattern vast",
      "Algeria Tadrart aerial red rock canyon dramatic",
    ],
    coastal_marine: [
      "Algeria Mediterranean coast Annaba clear sea",
      "Algeria Tipasa Roman ruins coast sea cliff",
    ],
    luxury_premium: [
      "Algeria Tamanrasset desert camp Hoggar stars",
      "Algiers Algeria Sofitel El Djazair colonial luxury",
    ],
    nightlife_urban: [
      "Algiers Algeria Casbah café evening terrace",
      "Oran Algeria music raï café night",
    ],
    urban_environment: [
      "Algiers Algeria Casbah white hill UNESCO",
      "Oran Algeria Spanish fort Santa Cruz hilltop",
    ],
    spiritual_religious: [
      "Algeria Tlemcen Great Mosque Islamic heritage",
      "Algeria Djemaa El Djazair mosque largest Africa",
    ],
    seasonal_spectacle: [
      "Algeria Sahara spring wildflower Hoggar bloom",
      "Algeria summer Mediterranean coast July beach",
    ],
    transportation_iconic: [
      "Algeria camel caravan Sahara Tuareg silhouette",
    ],
  },

  // ════════════════════════════ EAST / CENTRAL AFRICA ══════════════════════

  rwanda: {
    landmarks: [
      "Rwanda mountain gorilla trekking Virunga jungle",
      "Kigali Rwanda Memorial Genocide history",
      "Nyungwe Rwanda cloud forest canopy walk",
      "Lake Kivu Rwanda Democratic Congo border",
    ],
    wildlife_fauna: [
      "Rwanda silverback gorilla bamboo forest",
      "Rwanda mountain gorilla family group trekking",
      "Rwanda chimpanzee Nyungwe forest canopy",
      "Rwanda colobus monkey forest tree",
    ],
    natural_landscapes: [
      "Rwanda thousand hills green terraced slope",
      "Rwanda lush green volcanic highlands",
      "Virunga volcanoes Rwanda Uganda Congo",
    ],
    cultural_traditional: [
      "Rwanda Intore dance traditional warrior costume",
      "Rwanda imigongo cow-dung pattern art geometric",
      "Kigali Rwanda vibrant city café modern Africa",
    ],
    cinematic_atmosphere: [
      "Rwanda volcano Virunga gorilla mist morning",
      "Rwanda thousand hills terraced green dramatic",
      "Rwanda Lake Kivu sunset golden African",
    ],
    adventure_extreme: [
      "Rwanda mountain gorilla trekking bamboo forest",
      "Rwanda canopy walk Nyungwe suspension bridge",
      "Rwanda cycling thousand hills terrain",
    ],
    food_market: [
      "Rwanda Kigali market fresh tropical produce",
      "Rwanda brochette grilled meat street charcoal",
      "Rwanda urwagwa banana beer traditional",
    ],
    aerial_panoramic: [
      "Rwanda thousand hills aerial green patchwork",
      "Rwanda Virunga volcano chain aerial",
    ],
    luxury_premium: [
      "Rwanda luxury gorilla lodge Volcanoes Park",
      "Rwanda Kigali upscale hotel city modern",
    ],
    urban_environment: [
      "Kigali Rwanda clean city modern Africa",
      "Kigali Rwanda Kimironko market busy colourful",
    ],
    seasonal_spectacle: [
      "Rwanda gorilla season June September dry clear",
      "Rwanda dry season July August golden light",
    ],
    spiritual_religious: [
      "Rwanda Genocide Memorial Kigali solemn reflection",
      "Rwanda Catholic church colonial hilltop Kigali",
    ],
    architecture: [
      "Kigali Rwanda modern glass office building Africa",
      "Rwanda colonial church red brick hill",
    ],
    transportation_iconic: [
      "Rwanda moto-taxi Kigali motorcycle urban",
      "Rwanda Akagera safari jeep open vehicle",
    ],
    coastal_marine: [
      "Lake Kivu Rwanda beach swim freshwater Africa",
    ],
    nightlife_urban: [
      "Kigali Rwanda Kimihurura bar upscale nightlife",
    ],
  },

  ethiopia: {
    landmarks: [
      "Lalibela rock-hewn church Ethiopia ancient",
      "Danakil Depression sulfur lake Ethiopia alien",
      "Simien Mountains Ethiopia gelada monkey cliff",
      "Axum obelisk Ethiopia ancient kingdom",
      "Blue Nile Falls Ethiopia water cascade",
      "Erta Ale lava lake Ethiopia active volcano",
    ],
    volcanic_geothermal: [
      "Danakil Depression Ethiopia sulfur yellow green",
      "Erta Ale Ethiopia lava lake active boiling",
      "Dallol hydrothermal Ethiopia alien landscape",
    ],
    ancient_ruins: [
      "Axum stele obelisk Ethiopia ancient kingdom",
      "Lalibela Ethiopia carved rock church heritage",
    ],
    wildlife_fauna: [
      "Gelada baboon bleeding heart Ethiopia cliff",
      "Ethiopian wolf Simien rare highland",
      "Simien Mountains Ethiopia ibex goat cliff",
    ],
    cultural_traditional: [
      "Ethiopia coffee ceremony traditional ceremony",
      "Ethiopia Omo Valley tribe body paint",
      "Ethiopia Timkat Epiphany procession white robe",
      "Ethiopia Meskel cross festival Addis Ababa bonfire",
    ],
    natural_landscapes: [
      "Simien Mountains Ethiopia dramatic escarpment",
      "Ethiopia Danakil lowest place earth depression",
      "Ethiopia Blue Nile Gorge vast canyon",
    ],
    cinematic_atmosphere: [
      "Danakil Ethiopia sulfur lake alien colourful",
      "Lalibela Ethiopia rock church ancient dramatic",
      "Simien Ethiopia escarpment cloud morning mist",
    ],
    adventure_extreme: [
      "Ethiopia Erta Ale lava lake night descent",
      "Simien Mountains Ethiopia trekking summit camp",
      "Ethiopia Omo Valley walking cultural safari",
    ],
    food_market: [
      "Ethiopia injera fermented flatbread stew tibs",
      "Addis Ababa Ethiopia Merkato largest market Africa",
      "Ethiopia coffee ceremony jebena clay pot beans",
      "Ethiopia tej honey wine traditional bar",
    ],
    aerial_panoramic: [
      "Danakil Depression Ethiopia aerial sulfur yellow",
      "Ethiopia Simien escarpment aerial vast canyon",
    ],
    spiritual_religious: [
      "Lalibela Ethiopia rock church carved monolith",
      "Ethiopia orthodox cross ceremony priest",
      "Axum Ethiopia Ark of the Covenant church",
      "Ethiopia Timkat Orthodox procession candle cross",
    ],
    luxury_premium: [
      "Ethiopia Simien Mountains luxury lodge trekking",
      "Addis Ababa Ethiopia boutique heritage hotel",
    ],
    urban_environment: [
      "Addis Ababa Ethiopia Piazza Italian colonial quarter",
      "Ethiopia Addis Merkato vast open market",
    ],
    coastal_marine: [
      "Ethiopia Djibouti border Red Sea diving coral",
    ],
    transportation_iconic: [
      "Ethiopia Addis Ababa light rail modern Africa",
      "Ethiopia highland village mule trail remote",
    ],
    seasonal_spectacle: [
      "Ethiopia Meskel Cross fire festival September",
      "Ethiopia Timkat January epiphany water ceremony",
    ],
    architecture: [
      "Lalibela Ethiopia sunken church carved monolith",
      "Harar Ethiopia old walled city gate Jugol",
    ],
  },

  zimbabwe: {
    landmarks: [
      "Victoria Falls Zimbabwe spray rainbow mist",
      "Great Zimbabwe stone wall ruins ancient",
      "Hwange National Park Zimbabwe elephant herd",
      "Mana Pools Zimbabwe river canoeing canoe",
    ],
    wildlife_fauna: [
      "Zimbabwe elephant herd Hwange waterhole",
      "Zimbabwe lion Hwange national park",
      "Victoria Falls Zimbabwe cliff waterfall",
      "Zimbabwe painted wild dog Hwange",
    ],
    water_features: [
      "Victoria Falls Zimbabwe largest waterfall world",
      "Zambezi River Zimbabwe rafting rapid",
    ],
    natural_landscapes: [
      "Zimbabwe baobab tree dramatic sunset",
      "Zimbabwe Mana Pools floodplain river dry",
      "Zimbabwe Matobo Hills granite boulder dramatic",
    ],
    cinematic_atmosphere: [
      "Victoria Falls Zimbabwe spray mist rainbow",
      "Zimbabwe elephant sunset golden dust Hwange",
      "Mana Pools Zimbabwe river hippo dusk",
    ],
    adventure_extreme: [
      "Zimbabwe Victoria Falls bungee jump gorge",
      "Zimbabwe white water rafting Zambezi grade 5",
      "Zimbabwe walking safari Mana Pools canoe",
    ],
    aerial_panoramic: [
      "Victoria Falls Zimbabwe aerial spray gorge",
      "Zimbabwe Hwange aerial waterhole elephant herd",
    ],
    cultural_traditional: [
      "Zimbabwe Shona stone sculpture traditional",
      "Zimbabwe Great Zimbabwe stone wall heritage",
    ],
    food_market: [
      "Zimbabwe Harare street market fresh produce",
      "Zimbabwe sadza mealie pap traditional dish",
      "Zimbabwe biltong dried meat snack traditional",
    ],
    luxury_premium: [
      "Zimbabwe Hwange luxury tented camp wildlife",
      "Zimbabwe Victoria Falls River Lodge exclusive",
      "Mana Pools Zimbabwe private tented camp river",
    ],
    seasonal_spectacle: [
      "Zimbabwe dry season July September wildlife",
      "Zimbabwe Victoria Falls peak flow April May mist",
    ],
    spiritual_religious: [
      "Great Zimbabwe ruins sacred site ancient",
      "Zimbabwe Matobo Hills Mzilikazi tomb sacred",
    ],
    urban_environment: [
      "Harare Zimbabwe avenues tree lined suburb",
      "Victoria Falls Zimbabwe town tourist market",
    ],
    transportation_iconic: [
      "Zimbabwe Victoria Falls bridge colonial walk",
      "Zimbabwe Hwange game drive open Land Rover",
    ],
    architecture: [
      "Great Zimbabwe dry stone wall ancient Africa",
      "Victoria Falls Hotel Zimbabwe colonial grandeur",
    ],
  },

  zambia: {
    landmarks: [
      "Victoria Falls Zambia Devil's Pool swim edge",
      "Luangwa Valley Zambia safari sunset",
      "Zambia Liuwa Plain wildebeest migration",
    ],
    wildlife_fauna: [
      "Zambia lion pride South Luangwa safari",
      "Zambia leopard tree night Luangwa",
      "Zambia hippo school river South Luangwa",
      "Zambia wildebeest Liuwa plain migration",
    ],
    water_features: [
      "Zambia Victoria Falls edge mist rainbow",
      "Zambia Zambezi River sunset boat cruise",
    ],
    adventure_extreme: [
      "Zambia Victoria Falls bungee bridge jump",
      "Zambia white water rafting Zambezi gorge",
      "Zambia canoe safari lower Zambezi river",
      "Zambia walking safari South Luangwa guide",
    ],
    cinematic_atmosphere: [
      "Zambia Victoria Falls Devil's Pool edge dramatic",
      "South Luangwa Zambia elephant sunset dust",
      "Zambia Zambezi sunset hippo river golden",
    ],
    aerial_panoramic: [
      "Victoria Falls Zambia aerial gorge mist spray",
      "Zambia Liuwa plain aerial wildebeest migration",
      "Zambia Lower Zambezi aerial river floodplain",
      "Kafue Zambia aerial vast national park",
    ],
    natural_landscapes: [
      "Zambia South Luangwa floodplain lagoon green",
      "Zambia Kafue National Park vast wilderness",
    ],
    cultural_traditional: [
      "Zambia Kuomboka ceremony royal barge Lozi",
      "Zambia Ngoni warrior dance traditional",
    ],
    food_market: [
      "Zambia Lusaka market fresh tropical Africa",
      "Zambia nshima corn porridge traditional",
      "Zambia kapenta dried fish Lake Tanganyika",
    ],
    luxury_premium: [
      "Zambia South Luangwa luxury lodge river view",
      "Zambia Lower Zambezi private camp sunset",
      "Zambia Kafue exclusive eco-lodge safari",
    ],
    seasonal_spectacle: [
      "Zambia emerald season green November safari",
      "Zambia Liuwa zebra migration October herd",
    ],
    urban_environment: [
      "Lusaka Zambia modern market city Africa",
      "Livingstone Zambia colonial town Victoria Falls",
    ],
    architecture: [
      "Victoria Falls Hotel Zambia colonial facade",
    ],
    transportation_iconic: [
      "Zambia mokoro dugout canoe Zambezi channel",
    ],
    spiritual_religious: [
      "Zambia Livingstone memorial church David explorer",
    ],
  },

  // ═══════════════════════════ CENTRAL AMERICA ════════════════════════════════

  panama: {
    landmarks: [
      "Panama Canal lock ship passing Panama",
      "Panama Casco Viejo colonial old town",
      "Bocas del Toro Panama Caribbean island",
      "Panama City modern skyline canal view",
    ],
    coastal_marine: [
      "Bocas del Toro Panama turquoise tropical",
      "Panama Caribbean island beach clear",
    ],
    natural_landscapes: [
      "Panama cloud forest flower Boquete mountain",
    ],
    wildlife_fauna: [
      "Panama sloth tree tropical rainforest",
      "Panama harpy eagle rainforest large",
    ],
    food_market: [
      "Panama City fusion food Latin Americas",
      "Panama ceviche fresh seafood Pacific",
      "Panama market Balboa Avenue food street",
    ],
    cinematic_atmosphere: [
      "Panama Canal ship lock dramatic engineering",
      "Panama City sunset skyline canal golden",
      "Bocas del Toro Panama overwater hut turquoise",
    ],
    urban_environment: [
      "Panama City financial district skyscraper",
      "Casco Viejo Panama colonial colourful facade",
    ],
    tropical_lush: [
      "Panama rainforest Darien canopy dense green",
      "Boquete Panama cloud forest flower hummingbird",
    ],
    adventure_extreme: [
      "Panama surfing Santa Catalina Pacific wave",
      "Bocas del Toro Panama kayak mangrove tour",
      "Panama Canal transit boat sailing adventure",
    ],
    cultural_traditional: [
      "Panama Mola textile Kuna indigenous pattern",
      "Panama hat traditional woven weaving",
    ],
    luxury_premium: [
      "Panama City luxury marina hotel canal view",
    ],
    aerial_panoramic: [
      "Panama Canal aerial ship lock water",
      "Bocas del Toro Panama aerial Caribbean island",
    ],
    seasonal_spectacle: [
      "Panama dry season January April Pacific coast",
      "Panama whale season Pacific July October humpback",
    ],
    spiritual_religious: [
      "Panama Casco Viejo church ruined colonial stone",
      "Panama indigenous Kuna island spiritual ceremony",
    ],
    architecture: [
      "Panama City Casco Viejo pastel colonial decay",
      "Panama Canal lock gate massive steel engineering",
    ],
    nightlife_urban: [
      "Panama City Casco Viejo rooftop bar night",
      "Panama City Miraflores bar canal view evening",
    ],
    vegetation_flora: [
      "Panama Boquete coffee flower blossom highland",
      "Panama rainforest orchid flower exotic bloom",
      "Panama harpy eagle forest canopy rare large",
      "Panama jaguar Darién jungle remote trail",
      "Panama sea turtle nesting Pacific Pacific beach",
    ],
  },

  ecuador: {
    landmarks: [
      "Galápagos Islands Ecuador giant tortoise",
      "Cotopaxi volcano Ecuador snow cone",
      "Quito Ecuador colonial church hilltop",
      "Amazon jungle Ecuador canoe river",
      "Avenue of the Volcanoes Ecuador range",
    ],
    volcanic_geothermal: [
      "Cotopaxi Ecuador snow active volcano smoke",
      "Ecuador Tungurahua eruption ash cloud",
    ],
    wildlife_fauna: [
      "Galápagos Ecuador marine iguana unique",
      "Galápagos Ecuador blue-footed booby",
      "Galápagos Ecuador sea lion beach relax",
      "Galápagos Ecuador frigate bird red pouch",
    ],
    natural_landscapes: [
      "Ecuador Amazon jungle river canoe boat",
      "Ecuador páramo high altitude moor wetland",
      "Ecuador Quilotoa crater lake turquoise green",
      "Ecuador Mindo cloud forest butterfly flower",
    ],
    aerial_panoramic: [
      "Galápagos Ecuador aerial volcanic island",
      "Cotopaxi Ecuador aerial snow volcano cone",
      "Ecuador Quilotoa crater lake aerial turquoise",
    ],
    cinematic_atmosphere: [
      "Galápagos Ecuador blue iguana volcanic dramatic",
      "Ecuador Cotopaxi snow cone sunset dramatic",
      "Amazon Ecuador river mist morning canoe",
    ],
    adventure_extreme: [
      "Ecuador Cotopaxi volcano hike summit crater",
      "Ecuador whitewater rafting Pastaza river canyon",
      "Ecuador zip-line Amazon canopy adventure",
      "Ecuador mountain biking Death Road Bolivia",
    ],
    cultural_traditional: [
      "Quito Ecuador colonial church carved gold",
      "Ecuador Otavalo market indigenous textile color",
    ],
    coastal_marine: [
      "Galápagos Ecuador snorkel sea turtle clear",
      "Ecuador Pacific coast surf wave Montañita",
    ],
    food_market: [
      "Ecuador ceviche seafood lemon coastal",
      "Quito Ecuador mercado artisan market",
    ],
    spiritual_religious: [
      "Quito Ecuador Basílica Gothic Andean Ecuador",
      "Quito Ecuador La Compañía church gold interior",
    ],
    luxury_premium: [
      "Galápagos Ecuador luxury liveaboard dive cruise",
      "Ecuador Amazon luxury eco-lodge canopy river",
    ],
    architecture: [
      "Quito Ecuador colonial baroque gold church ornate",
      "Ecuador Cuenca colonial blue dome cathedral",
    ],
    nightlife_urban: [
      "Quito Ecuador La Mariscal bar scene nightlife",
      "Ecuador Guayaquil Malecon promenade evening",
    ],
    seasonal_spectacle: [
      "Galápagos Ecuador breeding season tortoise June",
      "Ecuador Otavalo market Saturday colorful peak",
    ],
    transportation_iconic: [
      "Ecuador Devil's Nose train descent steep Andes",
      "Galápagos Ecuador zodiac dinghy shore landing",
    ],
    urban_environment: [
      "Quito Ecuador historic centre UNESCO old town",
      "Cuenca Ecuador colonial straw-hat market",
    ],
  },

  bolivia: {
    landmarks: [
      "Salar de Uyuni salt flat mirror Bolivia",
      "La Paz Bolivia cable car city high altitude",
      "Sucre colonial white city Bolivia",
      "Tiwanaku ancient ruins Bolivia altiplano",
      "Death Road Bolivia cliff mountain biking",
    ],
    desert_arid: [
      "Uyuni salt flat Bolivia white vast sky mirror",
      "Bolivia Eduardo Avaroa red lagoon flamingo",
      "Bolivia Salar de Uyuni hexagon pattern salt",
      "Bolivia altiplano high altitude vast",
    ],
    wildlife_fauna: [
      "Bolivia flamingo Eduardo Avaroa lagoon red",
      "Bolivia condor Andes soar high",
      "Bolivia vicuña altiplano highlands pale",
    ],
    natural_landscapes: [
      "Bolivia Valle de la Luna eroded canyon",
      "Lake Titicaca Bolivia Peru floating island",
    ],
    cultural_traditional: [
      "Bolivia cholita woman bowler hat colorful",
      "La Paz Bolivia market indigenous color",
      "Bolivia Carnival Oruro devil dancer costume",
      "Bolivia Tiwanaku ceremony indigenous ancient",
    ],
    aerial_panoramic: [
      "Salar de Uyuni Bolivia aerial mirror vast",
      "La Paz Bolivia cable car aerial city valley",
      "Bolivia Eduardo Avaroa lagoon aerial red",
    ],
    cinematic_atmosphere: [
      "Salar de Uyuni Bolivia rain mirror sky reflection",
      "Bolivia altiplano vast flat horizon lone",
      "La Paz Bolivia cable car city mountain dramatic",
      "Bolivia red lagoon flamingo Andes dramatic",
    ],
    adventure_extreme: [
      "Bolivia Death Road downhill mountain bike cliff",
      "Bolivia Salar de Uyuni 4x4 tour white flat",
      "Bolivia Huayna Potosi summit ice climb",
    ],
    urban_environment: [
      "La Paz Bolivia witch market street vendor",
      "Sucre Bolivia colonial white centre square",
    ],
    food_market: [
      "La Paz Bolivia salteña empanada street",
      "Bolivia quinoa Andean grain market",
    ],
    seasonal_spectacle: [
      "Bolivia Salar de Uyuni flood season mirror",
      "Bolivia Andes spring August dry clear sky",
      "Bolivia Oruro Carnival February devil dancer",
    ],
    luxury_premium: [
      "Bolivia Salar de Uyuni salt hotel night sky",
      "Bolivia private tour Eduardo Avaroa lagoon",
    ],
    ancient_ruins: [
      "Tiwanaku Bolivia Gateway of the Sun altiplano",
      "Bolivia Samaipata pre-Inca rock carved",
    ],
    spiritual_religious: [
      "Bolivia La Paz Witches Market spell item",
      "Bolivia cholita wrestling ritual sport",
    ],
    architecture: [
      "Sucre Bolivia white colonial cathedral plaza",
      "La Paz Bolivia Cholita cable car station",
    ],
    nightlife_urban: [
      "La Paz Bolivia Sopocachi bar craft beer",
      "Sucre Bolivia plaza cafe colonial evening",
    ],
    vegetation_flora: [
      "Bolivia Amazon jungle Madidi orchid rare",
      "Bolivia Yungas cloud forest butterfly bloom",
    ],
    transportation_iconic: [
      "La Paz Bolivia Mi Teleférico cable car system",
      "Bolivia Death Road narrow cliff edge track",
    ],
  },

  guatemala: {
    landmarks: [
      "Tikal Mayan pyramid Guatemala jungle ancient",
      "Atitlán Lake Guatemala volcano reflection",
      "Antigua Guatemala colonial arch volcano",
      "Semuc Champey Guatemala turquoise pool",
    ],
    ancient_ruins: [
      "Tikal Guatemala jungle pyramid Mayan",
      "Guatemala Quiriguá stone stele ancient",
    ],
    natural_landscapes: [
      "Lake Atitlán Guatemala volcano reflection",
      "Guatemala cloud forest highland mist",
    ],
    cultural_traditional: [
      "Chichicastenango Guatemala market Maya color",
      "Guatemala traditional weaving huipil color",
    ],
    volcanic_geothermal: [
      "Santiaguito Guatemala eruption volcano smoke",
      "Guatemala Pacaya volcano active lava field",
    ],
    cinematic_atmosphere: [
      "Antigua Guatemala volcano smoke colonial dusk",
      "Lake Atitlán Guatemala volcano dawn mist",
      "Tikal Guatemala jungle pyramid sunrise mist",
    ],
    adventure_extreme: [
      "Guatemala Acatenango volcano overnight hike",
      "Guatemala kayak Lake Atitlán volcanic lake",
      "Semuc Champey Guatemala jungle pool swim",
    ],
    food_market: [
      "Guatemala market Chichicastenango colour",
      "Guatemala pepián stew corn tortilla traditional",
    ],
    urban_environment: [
      "Antigua Guatemala colonial arch Santa Catalina",
      "Guatemala City Zona Viva modern district",
    ],
    luxury_premium: [
      "Lake Atitlán Guatemala boutique eco-lodge dock",
    ],
    vegetation_flora: [
      "Guatemala cloud forest Quetzal resplendent bird",
      "Guatemala tropical fern waterfall green lush",
    ],
    seasonal_spectacle: [
      "Guatemala Semana Santa Antigua procession carpet",
      "Guatemala dry season November April clear",
      "Guatemala Quetzal bird resplendent cloud forest",
    ],
    coastal_marine: [
      "Guatemala Pacific coast black sand beach surf",
      "Guatemala Caribbean Livingston Garifuna coast",
    ],
    wildlife_fauna: [
      "Guatemala quetzal cloud forest highland rare",
      "Guatemala howler monkey Tikal canopy tree",
      "Guatemala jaguar Petén jungle Tikal",
    ],
    architecture: [
      "Antigua Guatemala yellow arch Santa Catalina",
      "Guatemala colonial church facade Antigua baroque",
    ],
    spiritual_religious: [
      "Guatemala Maximón deity folk Catholic shrine",
      "Guatemala Maya ceremony sacred fire copal smoke",
    ],
    aerial_panoramic: [
      "Lake Atitlán Guatemala aerial three volcanoes",
      "Tikal Guatemala aerial jungle pyramid canopy",
    ],
    nightlife_urban: [
      "Antigua Guatemala La Sin Ventura bar cobblestone",
      "Guatemala City Zona Viva rooftop nightlife",
    ],
    transportation_iconic: [
      "Guatemala chicken bus colourful converted school",
      "Lake Atitlán Guatemala motorboat village hop",
    ],
  },

  nicaragua: {
    landmarks: [
      "Masaya Volcano Nicaragua active lava lake",
      "Ometepe island two volcano Nicaragua lake",
      "Granada Nicaragua colonial color street",
      "Corn Islands Nicaragua Caribbean clear",
    ],
    volcanic_geothermal: [
      "Masaya Nicaragua lava lake active night",
      "Nicaragua volcano sandboarding slope",
    ],
    coastal_marine: [
      "Nicaragua Pacific surf wave beach",
      "Corn Islands Nicaragua turquoise Caribbean",
    ],
    natural_landscapes: [
      "Nicaragua Lake Managua volcanic landscape",
      "Nicaragua Ometepe island two volcanoes lake",
      "Nicaragua Bosawás rainforest jungle green",
    ],
    cinematic_atmosphere: [
      "Nicaragua Masaya lava lake night red glow",
      "Nicaragua colonial Granada pink dusk dramatic",
      "Ometepe Nicaragua lake volcano silhouette sunrise",
    ],
    adventure_extreme: [
      "Nicaragua volcano boarding Cerro Negro ash",
      "Nicaragua surf Pacific beach wave Popoyo",
      "Nicaragua kayak Ometepe lake volcanic",
    ],
    cultural_traditional: [
      "Nicaragua Granada colonial colourful street",
      "Nicaragua traditional festival folk dance",
    ],
    food_market: [
      "Nicaragua gallo pinto rice beans breakfast",
      "Nicaragua street food nacatamal corn tamale",
      "Nicaragua vigorón yuca chicharrón street Granada",
      "Nicaragua rum Flor de Caña distillery tour",
    ],
    luxury_premium: [
      "Nicaragua eco-lodge jungle canopy tree house",
    ],
    urban_environment: [
      "León Nicaragua revolutionary mural street",
      "Granada Nicaragua horse carriage colonial",
    ],
    vegetation_flora: [
      "Nicaragua jungle tropical flower orchid cloud",
      "Nicaragua Corn Islands palm beach Caribbean green",
    ],
    spiritual_religious: [
      "Nicaragua León Cathedral colonial largest roof",
      "Nicaragua Granada colonial church bell tower",
    ],
    aerial_panoramic: [
      "Ometepe Nicaragua aerial twin volcano lake",
      "Nicaragua Masaya lava lake aerial night red",
    ],
    architecture: [
      "Granada Nicaragua colonial pastel facade arch",
      "León Nicaragua catedral roof walk panorama",
    ],
    wildlife_fauna: [
      "Nicaragua Indio Maíz jaguar tropical reserve",
      "Nicaragua sea turtle Pacific nesting beach",
    ],
    seasonal_spectacle: [
      "Nicaragua dry season November April surf peak",
      "Granada Nicaragua hipica horse parade festival",
    ],
  },

  laos: {
    landmarks: [
      "Luang Prabang monk alms morning Laos",
      "Kuang Si waterfalls turquoise Laos",
      "Plain of Jars megalith Laos ancient mystery",
      "Vat Phou temple hill Laos ancient",
      "Mekong River sunset Laos boat",
    ],
    cultural_traditional: [
      "Laos Buddhist monk orange robe morning",
      "Luang Prabang Laos lantern festival",
      "Laos traditional silk weaving loom",
    ],
    natural_landscapes: [
      "Laos Mekong River misty morning valley",
      "Nam Ou River Laos limestone valley",
    ],
    water_features: [
      "Kuang Si waterfall Laos turquoise tier",
      "Mekong Laos sunset wide river boat",
    ],
    ancient_ruins: [
      "Vat Phou Laos UNESCO Khmer temple",
    ],
    food_market: [
      "Laos sticky rice bamboo traditional meal",
      "Luang Prabang night market Laos craft food",
      "Laos coconut milk curry lemongrass river fish",
    ],
    cinematic_atmosphere: [
      "Luang Prabang Laos mist river morning golden",
      "Laos Mekong sunset orange wide river boat",
      "Kuang Si Laos turquoise waterfall ethereal green",
    ],
    adventure_extreme: [
      "Laos kayak Mekong river island loop",
      "Laos Vang Vieng tubing Nam Song river",
      "Laos zip-line Gibbon Experience forest canopy",
    ],
    tropical_lush: [
      "Laos jungle waterfall green tropical lush",
      "Laos bamboo forest path green quiet river",
    ],
    spiritual_religious: [
      "Luang Prabang Laos temple gilded roof ornate",
      "Laos monk alms dawn ceremony orange robe",
    ],
    luxury_premium: [
      "Luang Prabang Laos boutique heritage hotel river",
    ],
    urban_environment: [
      "Vientiane Laos colonial French stupa",
    ],
    seasonal_spectacle: [
      "Laos Bun Pi Mai water festival April splash",
    ],
    aerial_panoramic: [
      "Luang Prabang Laos aerial river confluence",
      "Laos Mekong river aerial island sand bank",
      "Laos Plain of Jars aerial hillside field",
    ],
    wildlife_fauna: [
      "Laos Mekong Irrawaddy dolphin Khone Falls",
      "Laos gibbon canopy Bokeo forest rare",
      "Laos Asian elephant Nam Et Phiou reserve",
    ],
    architecture: [
      "Luang Prabang Laos French colonial mansion",
      "Vientiane Laos Patuxai victory arch monument",
      "Luang Prabang Laos temple gilded wood carving",
    ],
    nightlife_urban: [
      "Luang Prabang Laos night market lantern street",
      "Vang Vieng Laos bar riverside Nam Song",
    ],
    vegetation_flora: [
      "Laos jungle bamboo palm tropical river bank",
      "Kuang Si Laos butterfly falls fern pool",
    ],
    transportation_iconic: [
      "Laos slow boat Mekong two-day journey",
      "Laos tuk-tuk colourful Vientiane street",
    ],
  },

  hongkong: {
    landmarks: [
      "Hong Kong Victoria Harbour skyline neon night",
      "Victoria Peak panorama Hong Kong cityscape",
      "Wong Tai Sin temple incense Hong Kong",
      "Hong Kong tram double-decker island",
      "Big Buddha Lantau Island Hong Kong",
    ],
    urban_environment: [
      "Hong Kong Mong Kok neon market dense",
      "Kowloon dense apartments laundry Hong Kong",
      "Central Hong Kong financial towers glass",
      "Hong Kong night market street food neon",
    ],
    nightlife_urban: [
      "Hong Kong neon night street Tsim Sha Tsui",
      "Hong Kong Symphony of Lights harbour show",
      "Lan Kwai Fong Hong Kong nightlife bar",
    ],
    coastal_marine: [
      "Hong Kong outlying island ferry boat",
      "Sai Kung Hong Kong turquoise bay fishing",
    ],
    food_market: [
      "Hong Kong dim sum bamboo steamer morning",
      "Mong Kok Hong Kong street food stall busy",
      "Hong Kong egg tart Portuguese pastry",
    ],
    aerial_panoramic: [
      "Hong Kong aerial Victoria Harbour night city",
      "Hong Kong Peak aerial harbour towers night",
    ],
    architecture: [
      "Hong Kong traditional tong lau tenement",
      "Hong Kong modern financial district glass",
      "Hong Kong Lippo Centre egg-shape tower unique",
      "Hong Kong Sheung Wan dried seafood shop",
    ],
    cinematic_atmosphere: [
      "Hong Kong neon night rain street umbrella",
      "Victoria Harbour Hong Kong sunrise golden tower",
      "Hong Kong kowloon rooftop city dense atmosphere",
      "Hong Kong morning harbour mist tower silhouette",
    ],
    adventure_extreme: [
      "Hong Kong Dragon's Back hiking ridge sea view",
      "Hong Kong MacLehose Trail coast mountain",
      "Lantau Hong Kong mountain peak Wisdom Path",
    ],
    cultural_traditional: [
      "Hong Kong Chinese New Year lantern red street",
      "Hong Kong Mid-Autumn Festival lantern park",
      "Hong Kong Tin Hau Festival boat harbor joss",
      "Hong Kong Cheung Chau bun festival climb",
    ],
    seasonal_spectacle: [
      "Hong Kong Chinese New Year fireworks harbour",
      "Hong Kong Lunar New Year flower market busy",
    ],
    luxury_premium: [
      "Hong Kong Mandarin Oriental luxury harbour view",
      "Hong Kong private yacht harbour dinner cruise",
      "Hong Kong Michelin restaurant dim sum luxury",
    ],
    natural_landscapes: [
      "Sai Kung Hong Kong country park green island",
      "Lantau Island Hong Kong mountain peak green",
      "New Territories Hong Kong wetland reserve bird",
    ],
    transportation_iconic: [
      "Hong Kong Star Ferry crossing harbour iconic",
      "Hong Kong Central-Mid-Levels escalator longest",
      "Hong Kong Peak Tram funicular city view",
      "Hong Kong double-decker tram island narrow street",
    ],
  },

} // End Part 2

// // The full export block is appended after all destinations are inserted.
// ---
// Flat array exports (built from structured data)
export const ALL_CONCEPT_LABELS: string[] = []
export const LABEL_TO_DEST: Record<string, string> = {}
export const LABEL_TO_CATEGORY: Record<string, string> = {}
export const DEST_PHRASE_COUNT: Record<string, number> = {}

for (const [destId, categories] of Object.entries(DEST_CATEGORY_CONCEPTS)) {
  let count = 0
  for (const [category, phrases] of Object.entries(categories)) {
    for (const phrase of phrases) {
      if (!LABEL_TO_DEST[phrase]) {
        ALL_CONCEPT_LABELS.push(phrase)
        LABEL_TO_DEST[phrase] = destId
        LABEL_TO_CATEGORY[phrase] = category
        count++
      }
    }
  }
  DEST_PHRASE_COUNT[destId] = count
}

console.log(
  `[KnowledgeBase] ${Object.keys(DEST_CATEGORY_CONCEPTS).length} destinations | ` +
  `${ALL_CONCEPT_LABELS.length} total concept phrases`
)
