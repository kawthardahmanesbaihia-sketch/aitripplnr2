// Central data store for the explore dashboard.
// All content is squad-aware: filter hotels/restaurants/activities by squadTags,
// and read squad-keyed objects (taglines, positives, itinerary, aiInsight) directly.

export type SquadType = 'solo' | 'couple' | 'friends' | 'family';

export interface Hotel {
  id: string;
  name: string;
  image: string;
  rating: number;
  price: string;
  priceLevel: 'budget' | 'mid-range' | 'luxury';
  address: string;
  amenities: string[];
  description: string;
  squadTags: SquadType[];
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  cuisine: string;
  description: string;
  price: string;
  priceLevel: 'budget' | 'mid-range' | 'luxury';
  address: string;
  tags: string[];
  squadTags: SquadType[];
}

export interface Activity {
  id: string;
  name: string;
  image: string;
  description: string;
  duration: string;
  rating: number;
  price: string;
  category: string;
  accentColor: string;
  squadTags: SquadType[];
}

export interface TravelEvent {
  id: string;
  name: string;
  category: string;
  date: string;
  matchPercentage: number;
  description: string;
  squadTags: SquadType[];
}

export interface ItineraryDay {
  day: number;
  theme: string;
  morning: string;
  afternoon: string;
  evening: string;
  icon: string;
}

export interface DestinationEntry {
  id: string;
  name: string;
  flag: string;
  heroImage: string;
  cardImage: string;
  taglines: Record<SquadType, string>;
  weather: { temp: string; condition: string; icon: string };
  matchPercentage: number;
  description: string;
  currency: string;
  language: string;
  timezone: string;
  positives: Record<SquadType, string[]>;
  negatives: Record<SquadType, string[]>;
  hotels: Hotel[];
  restaurants: Restaurant[];
  activities: Activity[];
  events: TravelEvent[];
  itinerary: Record<SquadType, ItineraryDay[]>;
  aiInsight: Record<SquadType, string>;
  mapCenter: { lat: number; lng: number };
}

// Destinations
export const DESTINATIONS: DestinationEntry[] = [
  {
    id: 'japan',
    name: 'Japan',
    flag: '🇯🇵',
    heroImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80',
    taglines: {
      solo:    'A peaceful solo adventure awaits',
      couple:  'A romantic cultural journey for two',
      friends: 'An unforgettable group experience',
      family:  'Memories the whole family will treasure',
    },
    weather: { temp: '15–25°C', condition: 'Comfortable', icon: '⛅' },
    matchPercentage: 87,
    description: 'A perfect blend of ancient temples, futuristic cities, and stunning nature.',
    currency: '¥ Yen',
    language: 'Japanese',
    timezone: 'UTC+9',
    positives: {
      solo:    ['Safe for solo travelers', 'Excellent public transport', 'Rich cultural experiences', 'Zen temples & meditation retreats', 'Quiet ryokan stays'],
      couple:  ['Romantic cherry blossom season', 'Intimate izakaya dining', 'Scenic ryokan with onsen', 'Couples tea ceremonies', 'Kyoto evening strolls'],
      friends: ['Vibrant nightlife in Tokyo', 'Group karaoke experiences', 'Street food tours', 'Theme parks & arcades', 'Mt. Fuji day trips'],
      family:  ['Very safe for children', 'Kid-friendly attractions', 'Amazing themed restaurants', 'Disneyland Tokyo', 'Pokemon centers everywhere'],
    },
    negatives: {
      solo:    ['Language barrier outside cities', 'Some restaurants prefer groups', 'Can feel lonely during festivals'],
      couple:  ['Hotels can be small', 'Cherry blossom crowds in April', 'Booking popular ryokans far in advance needed'],
      friends: ['Expensive for large groups', 'Accommodation size limits', 'Some areas are strict about noise'],
      family:  ['Long flights from most countries', 'Some attractions have age/height limits', 'Jet lag with young children'],
    },
    hotels: [
      {
        id: 'h1', name: 'Park Hyatt Tokyo', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
        rating: 4.9, price: '$450/night', priceLevel: 'luxury', address: 'Shinjuku, Tokyo',
        amenities: ['Infinity Pool', 'Spa', 'City Views', 'Michelin Restaurant'],
        description: 'Iconic luxury tower with breathtaking Tokyo skyline views. Featured in Lost in Translation.',
        squadTags: ['couple', 'solo'],
      },
      {
        id: 'h2', name: 'Hoshinoya Kyoto', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80',
        rating: 4.8, price: '$380/night', priceLevel: 'luxury', address: 'Arashiyama, Kyoto',
        amenities: ['Onsen', 'Private River Access', 'Garden Views', 'Tea Ceremony'],
        description: 'Only accessible by boat, this ryokan offers an exclusive retreat in Arashiyama forest.',
        squadTags: ['couple', 'solo'],
      },
      {
        id: 'h3', name: 'Cerulean Tower Tokyu', image: 'https://images.unsplash.com/photo-1551882547-ff40c4a49ce7?w=600&q=80',
        rating: 4.7, price: '$220/night', priceLevel: 'mid-range', address: 'Shibuya, Tokyo',
        amenities: ['Rooftop Bar', 'Jazz Club', 'Fitness Center', 'Group Dining'],
        description: 'Right in Shibuya\'s heart — perfect for friend groups exploring Tokyo\'s buzzing nightlife.',
        squadTags: ['friends'],
      },
      {
        id: 'h4', name: 'Tokyo Disneyland Hotel', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
        rating: 4.6, price: '$180/night', priceLevel: 'mid-range', address: 'Urayasu, Chiba',
        amenities: ['Kids Club', 'Disney Themes', 'Pool', 'Character Breakfast'],
        description: 'Step into a fairy tale — rooms themed after Disney characters, right at the park gates.',
        squadTags: ['family'],
      },
      {
        id: 'h5', name: 'Khaosan Tokyo Origami', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80',
        rating: 4.3, price: '$60/night', priceLevel: 'budget', address: 'Asakusa, Tokyo',
        amenities: ['Common Room', 'Bike Rental', 'City Tours', 'Breakfast'],
        description: 'Social hostel in historic Asakusa, loved by solo travelers for its community feel.',
        squadTags: ['solo', 'friends'],
      },
    ],
    restaurants: [
      {
        id: 'r1', name: 'Narisawa', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
        rating: 4.9, cuisine: 'Innovative Japanese', description: 'Two Michelin stars, blending nature and gastronomy in an intimate 40-seat dining room.',
        price: '$250/person', priceLevel: 'luxury', address: 'Minami-Aoyama, Tokyo',
        tags: ['romantic', 'fine-dining', 'michelin'], squadTags: ['couple', 'solo'],
      },
      {
        id: 'r2', name: 'Gonpachi Nishi-Azabu', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80',
        rating: 4.6, cuisine: 'Izakaya', description: 'The iconic "Kill Bill" restaurant — lively, fun, perfect for groups to share yakitori and sake.',
        price: '$35/person', priceLevel: 'mid-range', address: 'Nishi-Azabu, Tokyo',
        tags: ['lively', 'group-friendly', 'iconic'], squadTags: ['friends', 'couple'],
      },
      {
        id: 'r3', name: 'Kura Sushi Family', image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&q=80',
        rating: 4.5, cuisine: 'Sushi Conveyor', description: 'Rotating sushi on a conveyor belt — kids love picking their favorites, parents love the prices.',
        price: '$20/person', priceLevel: 'budget', address: 'Multiple locations, Tokyo',
        tags: ['kid-friendly', 'fun', 'interactive'], squadTags: ['family'],
      },
      {
        id: 'r4', name: 'Ichiran Ramen', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
        rating: 4.7, cuisine: 'Ramen', description: 'Solo dining booths designed for full focus on your ramen — the ultimate solo food experience.',
        price: '$15/person', priceLevel: 'budget', address: 'Multiple locations, Japan',
        tags: ['solo-friendly', 'iconic', 'focused'], squadTags: ['solo'],
      },
      {
        id: 'r5', name: 'Ninja Restaurant', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80',
        rating: 4.4, cuisine: 'Japanese with Entertainment', description: 'Ninja-costumed servers, magic shows at the table, secret passages. Kids and friends go wild.',
        price: '$80/person', priceLevel: 'luxury', address: 'Akasaka, Tokyo',
        tags: ['entertainment', 'fun', 'themed'], squadTags: ['family', 'friends'],
      },
    ],
    activities: [
      {
        id: 'a1', name: 'Senso-ji Temple at Dawn', image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80',
        description: 'Experience the ancient Asakusa temple before the crowds arrive. Meditative and awe-inspiring.',
        duration: '2 hours', rating: 4.9, price: 'Free', category: 'Culture', accentColor: 'from-amber-500 to-orange-600',
        squadTags: ['solo', 'couple'],
      },
      {
        id: 'a2', name: 'Shibuya Crossing at Night', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80',
        description: 'Stand in the world\'s busiest intersection as thousands cross simultaneously under neon lights.',
        duration: '1 hour', rating: 4.8, price: 'Free', category: 'Urban', accentColor: 'from-purple-500 to-pink-600',
        squadTags: ['friends', 'couple', 'solo'],
      },
      {
        id: 'a3', name: 'Mt. Fuji Day Trip', image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&q=80',
        description: 'Hike or ride to the 5th station with panoramic views of Japan\'s iconic sacred mountain.',
        duration: 'Full day', rating: 4.9, price: '$50', category: 'Nature', accentColor: 'from-blue-500 to-cyan-600',
        squadTags: ['solo', 'friends', 'couple'],
      },
      {
        id: 'a4', name: 'Teamlab Borderless', image: 'https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=600&q=80',
        description: 'Immersive digital art museum where art moves freely between rooms. Mesmerizing for all ages.',
        duration: '3 hours', rating: 4.9, price: '$30', category: 'Art', accentColor: 'from-violet-500 to-indigo-600',
        squadTags: ['family', 'couple', 'friends'],
      },
      {
        id: 'a5', name: 'Robot Restaurant Show', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
        description: 'Over-the-top neon, robots, and performers — the most uniquely Tokyo experience possible.',
        duration: '2 hours', rating: 4.5, price: '$80', category: 'Entertainment', accentColor: 'from-red-500 to-rose-600',
        squadTags: ['friends', 'family'],
      },
      {
        id: 'a6', name: 'Arashiyama Bamboo Grove', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80',
        description: 'Walk through towering bamboo stalks at dawn for a deeply peaceful and photogenic experience.',
        duration: '2 hours', rating: 4.8, price: 'Free', category: 'Nature', accentColor: 'from-green-500 to-emerald-600',
        squadTags: ['couple', 'solo'],
      },
      {
        id: 'a7', name: 'Mario Kart Street Tour', image: 'https://images.unsplash.com/photo-1522158637959-30385a09e0da?w=600&q=80',
        description: 'Dress as Mario characters and race real go-karts through Tokyo\'s streets. Absolute chaos — the best kind.',
        duration: '3 hours', rating: 4.7, price: '$100', category: 'Adventure', accentColor: 'from-yellow-500 to-orange-600',
        squadTags: ['friends', 'family'],
      },
    ],
    events: [
      { id: 'e1', name: 'Hanami Cherry Blossom Festival', category: 'Festival', date: 'Apr 1–15', matchPercentage: 95, description: 'Japan\'s iconic cherry blossom viewing season.', squadTags: ['couple', 'solo', 'friends', 'family'] },
      { id: 'e2', name: 'Tokyo Game Show', category: 'Gaming', date: 'Sep 20–23', matchPercentage: 88, description: 'Asia\'s largest gaming expo with hundreds of previews.', squadTags: ['friends', 'solo'] },
      { id: 'e3', name: 'Obon Summer Festival', category: 'Cultural', date: 'Aug 13–16', matchPercentage: 82, description: 'Traditional lantern dances honoring ancestors.', squadTags: ['family', 'couple', 'solo'] },
      { id: 'e4', name: 'Awa Odori Dance Parade', category: 'Dance', date: 'Aug 12–15', matchPercentage: 78, description: 'Tokushima\'s famous street dance festival.', squadTags: ['friends', 'family'] },
      { id: 'e5', name: 'Tokyo Marathon', category: 'Sport', date: 'Mar 3', matchPercentage: 70, description: 'One of the six World Marathon Majors.', squadTags: ['solo', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Arrival & Asakusa', morning: 'Senso-ji Temple at dawn before crowds arrive', afternoon: 'Explore Nakamise Street & Akihabara electronics district', evening: 'Solo ramen at Ichiran — the ultimate solo dining ritual', icon: '🏛️' },
        { day: 2, theme: 'Zen & Nature', morning: 'Meiji Shrine & Yoyogi Park meditation walk', afternoon: 'Teamlab Borderless digital art museum', evening: 'Quiet sake bar in Golden Gai, Shinjuku', icon: '🌿' },
        { day: 3, theme: 'Day Trip to Kyoto', morning: 'Shinkansen to Kyoto', afternoon: 'Fushimi Inari shrine — hike the thousand torii gates alone', evening: 'Return to Tokyo, reflect over sushi omakase', icon: '🚄' },
      ],
      couple: [
        { day: 1, theme: 'Romantic Tokyo', morning: 'Tokyo Skytree sunrise view', afternoon: 'Couples tea ceremony in Hamarikyu Gardens', evening: 'Dinner at Narisawa (book months ahead)', icon: '🌸' },
        { day: 2, theme: 'Kyoto Romance', morning: 'Arashiyama bamboo grove at dawn', afternoon: 'Couples kimono rental & Gion stroll', evening: 'Kaiseki dinner in a lantern-lit restaurant', icon: '👘' },
        { day: 3, theme: 'Onsen Escape', morning: 'Hakone hot springs ryokan check-in', afternoon: 'Outdoor onsen with Mt. Fuji view', evening: 'Private multi-course kaiseki dinner', icon: '♨️' },
      ],
      friends: [
        { day: 1, theme: 'Tokyo Chaos', morning: 'Tsukiji outer market seafood breakfast', afternoon: 'Mario Kart street tour through Shibuya', evening: 'Karaoke in Shinjuku + Shibuya Crossing at night', icon: '🎮' },
        { day: 2, theme: 'Theme Parks', morning: 'Universal Studios Japan (Harry Potter World)', afternoon: 'More rides until closing', evening: 'Robot Restaurant dinner show', icon: '🎢' },
        { day: 3, theme: 'Mt. Fuji Adventure', morning: 'Early bus to Fuji 5th Station', afternoon: 'Hike & explore Fuji Five Lakes', evening: 'Izakaya feast in Gonpachi', icon: '🗻' },
      ],
      family: [
        { day: 1, theme: 'Disney Magic', morning: 'Tokyo Disneyland — arrive at opening', afternoon: 'Fantasyland & Tomorrowland attractions', evening: 'Disney parade & character dinner', icon: '🎡' },
        { day: 2, theme: 'Edo & Culture', morning: 'Edo-Tokyo Museum — interactive history for kids', afternoon: 'Teamlab Planets immersive art', evening: 'Ninja Restaurant performance dinner', icon: '⚔️' },
        { day: 3, theme: 'Nature & Science', morning: 'Ueno Zoo — giant pandas!', afternoon: 'National Museum of Nature & Science', evening: 'Kura Sushi conveyor belt dinner — kids\' favorite', icon: '🐼' },
      ],
    },
    aiInsight: {
      solo:    'Japan is a solo traveler\'s paradise. The culture of respecting personal space, the incredibly safe streets, and the meditative temple circuits make it ideal for self-discovery. The famous solo dining booths at Ichiran Ramen were literally designed for people like you.',
      couple:  'From cherry blossom picnics in Maruyama Park to candlelit ryokan dinners in Kyoto, Japan creates deeply romantic memories. The onsen tradition of communal hot spring bathing adds an intimate cultural ritual couples won\'t find anywhere else.',
      friends: 'Tokyo never sleeps and it\'s built for groups. Karaoke rooms, izakayas designed for sharing, Mario Kart street tours, theme parks — every corner of Japan offers something to laugh about together. Golden Gai in Shinjuku has 200+ tiny bars to explore.',
      family:  'Japan consistently ranks as one of the world\'s most family-friendly destinations. Tokyo Disneyland, Pokemon Centers, Studio Ghibli Museum, and the sheer novelty of vending machines on every corner keep children endlessly entertained while parents enjoy world-class cuisine.',
    },
    mapCenter: { lat: 35.6762, lng: 139.6503 },
  },

  {
    id: 'france',
    name: 'France',
    flag: '🇫🇷',
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1431274172761-fcdab704f2e0?w=600&q=80',
    taglines: {
      solo:    'Discover yourself in the city of light',
      couple:  'The most romantic destination on Earth',
      friends: 'Wine, laughter and Parisian adventures',
      family:  'History, magic and croissants for everyone',
    },
    weather: { temp: '10–22°C', condition: 'Mild & Sunny', icon: '🌤️' },
    matchPercentage: 82,
    description: 'Art, gastronomy, fashion and romance woven into every cobblestone.',
    currency: '€ Euro',
    language: 'French',
    timezone: 'UTC+1',
    positives: {
      solo:    ['World-class museums to explore alone', 'Café culture perfect for solo lingering', 'Excellent train network', 'Welcoming solo travel hostels', 'Art scenes everywhere'],
      couple:  ['Most romantic city in the world', 'Eiffel Tower at night', 'Champagne & fine dining', 'Lavender fields in Provence', 'Seine river cruises'],
      friends: ['Amazing nightlife in Le Marais', 'Wine tastings in Bordeaux', 'Group cooking classes', 'Affordable wine & cheese', 'Versailles day trip'],
      family:  ['Disneyland Paris', 'Rich history for kids', 'Crepe stands everywhere', 'Easy family train travel', 'Louvre family tours'],
    },
    negatives: {
      solo:    ['Some locals can seem cold', 'French language useful to know', 'Some restaurants are pricey solo'],
      couple:  ['Very crowded in summer', 'Pickpockets in tourist areas', 'Accommodation is expensive'],
      friends: ['Expensive nightlife', 'Language barrier in smaller cities', 'Long queues at attractions'],
      family:  ['Heat in July/August', 'Museum queues with children', 'Cost adds up quickly'],
    },
    hotels: [
      { id: 'h1', name: 'Le Bristol Paris', image: 'https://images.unsplash.com/photo-1551882547-ff40c4a49ce7?w=600&q=80', rating: 4.9, price: '$650/night', priceLevel: 'luxury', address: 'Rue du Faubourg Saint-Honoré, Paris', amenities: ['Rooftop Pool', '3 Michelin Stars', 'Spa', 'Garden'], description: 'Palace hotel where celebrities and dignitaries have stayed since 1925. Ultimate Parisian luxury.', squadTags: ['couple', 'solo'] },
      { id: 'h2', name: 'Generator Paris', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.5, price: '$55/night', priceLevel: 'budget', address: 'Canal Saint-Martin, Paris', amenities: ['Rooftop Bar', 'Social Events', 'Tour Booking', 'Café'], description: 'Buzzing hostel with a legendary rooftop and social scene. The friend-group headquarters in Paris.', squadTags: ['friends', 'solo'] },
      { id: 'h3', name: 'Hôtel du Petit Moulin', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 4.7, price: '$280/night', priceLevel: 'luxury', address: 'Le Marais, Paris', amenities: ['Boutique Design', 'Wine Bar', 'Couples Packages', 'City Views'], description: 'Intimate designer hotel in Le Marais with rooms designed by Christian Lacroix. Utterly romantic.', squadTags: ['couple'] },
      { id: 'h4', name: 'Disneyland Hotel Paris', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.6, price: '$200/night', priceLevel: 'mid-range', address: 'Marne-la-Vallée, Paris', amenities: ['Disney Themes', 'Kids Pool', 'Character Meets', 'Park Access'], description: 'The pink castle hotel at the entrance of Disneyland Paris. Kids will never forget it.', squadTags: ['family'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Le Jules Verne', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.8, cuisine: 'French Gastronomic', description: 'Alain Ducasse restaurant on the second floor of the Eiffel Tower. Dining at 125 meters.', price: '$300/person', priceLevel: 'luxury', address: 'Eiffel Tower, Paris', tags: ['romantic', 'iconic', 'fine-dining'], squadTags: ['couple'] },
      { id: 'r2', name: 'Bouillon Chartier', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', rating: 4.6, cuisine: 'Traditional French', description: 'Classic 1896 Parisian brasserie with shared tables, marble counters and €12 steak frites. Legendary.', price: '$20/person', priceLevel: 'budget', address: '7 Rue du Faubourg Montmartre, Paris', tags: ['historic', 'communal', 'affordable'], squadTags: ['friends', 'solo', 'family'] },
      { id: 'r3', name: 'Septime', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.9, cuisine: 'Modern French', description: 'Reservation-only natural wine bistro, consistently rated Paris\'s best restaurant. Worth the wait.', price: '$90/person', priceLevel: 'luxury', address: 'Bastille, Paris', tags: ['trendy', 'natural-wine', 'creative'], squadTags: ['solo', 'couple'] },
    ],
    activities: [
      { id: 'a1', name: 'Louvre Museum', image: 'https://images.unsplash.com/photo-1499856374997-73a4db6e54eb?w=600&q=80', description: 'World\'s largest art museum housing 38,000 objects from prehistory to modern era including the Mona Lisa.', duration: '4 hours', rating: 4.8, price: '$22', category: 'Culture', accentColor: 'from-amber-500 to-orange-600', squadTags: ['solo', 'couple', 'family', 'friends'] },
      { id: 'a2', name: 'Versailles Palace & Gardens', image: 'https://images.unsplash.com/photo-1559656914-a30970c1affd?w=600&q=80', description: 'The Sun King\'s incomprehensible palace with 2,300 rooms and 800 hectares of garden.', duration: 'Full day', rating: 4.7, price: '$30', category: 'History', accentColor: 'from-yellow-500 to-amber-600', squadTags: ['family', 'couple', 'friends'] },
      { id: 'a3', name: 'Seine River Cruise', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80', description: 'Float past Notre-Dame, Eiffel Tower, and the Louvre at dusk with a glass of champagne.', duration: '1 hour', rating: 4.6, price: '$25', category: 'Romantic', accentColor: 'from-blue-500 to-indigo-600', squadTags: ['couple', 'friends', 'family'] },
      { id: 'a4', name: 'Montmartre Art Walk', image: 'https://images.unsplash.com/photo-1431274172761-fcdab704f2e0?w=600&q=80', description: 'Wander cobblestone streets where Picasso and van Gogh once lived. Street artists still work here daily.', duration: '3 hours', rating: 4.7, price: 'Free', category: 'Art', accentColor: 'from-rose-500 to-pink-600', squadTags: ['solo', 'couple', 'friends'] },
    ],
    events: [
      { id: 'e1', name: 'Bastille Day Celebrations', category: 'National', date: 'Jul 14', matchPercentage: 92, description: 'Military parade on the Champs-Élysées + massive fireworks over the Eiffel Tower.', squadTags: ['family', 'friends', 'couple', 'solo'] },
      { id: 'e2', name: 'Paris Fashion Week', category: 'Fashion', date: 'Sep 25 – Oct 3', matchPercentage: 85, description: 'The world\'s most prestigious fashion event. Shows by Chanel, Dior, and Saint Laurent.', squadTags: ['couple', 'solo'] },
      { id: 'e3', name: 'Nuit Blanche Art Night', category: 'Art', date: 'Oct 5', matchPercentage: 80, description: 'All-night contemporary art installations across the entire city. Free entry.', squadTags: ['friends', 'solo', 'couple'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Arrival & Montmartre', morning: 'Settle in, coffee at a corner café', afternoon: 'Montmartre art walk, Sacré-Cœur', evening: 'Solo wine bar in Le Marais', icon: '🎨' },
        { day: 2, theme: 'The Great Museums', morning: 'Louvre — Mona Lisa, Venus de Milo, Winged Victory', afternoon: 'Musée d\'Orsay Impressionists', evening: 'Seine walk at sunset', icon: '🖼️' },
        { day: 3, theme: 'Day Trip', morning: 'Train to Versailles', afternoon: 'Palace and gardens exploration', evening: 'Return for a bistro dinner and reflection', icon: '🏰' },
      ],
      couple: [
        { day: 1, theme: 'Iconic Romance', morning: 'Eiffel Tower at opening hour (no crowds)', afternoon: 'Picnic in Champ de Mars with champagne', evening: 'Dinner at Le Jules Verne inside the tower', icon: '🗼' },
        { day: 2, theme: 'Art & Strolling', morning: 'Musée Rodin — The Kiss, The Thinker', afternoon: 'Stroll along the Seine, bookstall browsing', evening: 'Evening Seine cruise with wine', icon: '🌹' },
        { day: 3, theme: 'Versailles Escape', morning: 'Versailles Palace — Hall of Mirrors', afternoon: 'Row a boat in the Grand Canal', evening: 'Candlelit dinner in a classic Parisian bistro', icon: '🕯️' },
      ],
      friends: [
        { day: 1, theme: 'Food & Markets', morning: 'Marché d\'Aligre food market breakfast', afternoon: 'Louvre highlights tour (focus on the best bits)', evening: 'Bouillon Chartier dinner + Le Marais bar crawl', icon: '🍷' },
        { day: 2, theme: 'Versailles & Picnic', morning: 'Versailles day trip', afternoon: 'Group picnic in the palace gardens', evening: 'Back to Paris — rooftop bar sunset drinks', icon: '🧺' },
        { day: 3, theme: 'Nightlife', morning: 'Sleep in, brunch in Bastille', afternoon: 'Cooking class — croissants and crêpes', evening: 'Club night in Pigalle or Canal Saint-Martin', icon: '🎉' },
      ],
      family: [
        { day: 1, theme: 'Disneyland Paris', morning: 'Arrive at Disneyland at opening, beat the queues', afternoon: 'Fantasyland and Adventureland', evening: 'Parade & fireworks show', icon: '🏰' },
        { day: 2, theme: 'Paris Icons', morning: 'Eiffel Tower visit (kids love the lift)', afternoon: 'Boat tour on the Seine', evening: 'Crêpes for dinner near Notre-Dame', icon: '🗼' },
        { day: 3, theme: 'Discovery & Fun', morning: 'Cité des Sciences et de l\'Industrie (Science museum for kids)', afternoon: 'Luxembourg Gardens puppet show', evening: 'Bouillon Chartier — French classics the whole family will enjoy', icon: '🔬' },
      ],
    },
    aiInsight: {
      solo:    'Paris rewards the solo traveler who slows down. The café culture is practically designed for one — order a café au lait, open a notebook, and watch the city flow by. Every museum, every arrondissement offers hours of exploration without needing company.',
      couple:  'Paris earned its reputation as the world\'s most romantic city for a reason. Every element — the light, the architecture, the food, the language — conspires to create intimacy. Whether it\'s your first trip or your fifth, it feels new when shared with someone you love.',
      friends: 'French culture is built for shared pleasure. Wine is meant to be split, cheese boards are for discussion, and the French believe eating alone is a waste. Paris with friends is loud, joyful, and full of discoveries — from hidden jazz bars to all-night parties in the Pigalle.',
      family:  'Disneyland Paris alone makes this a legendary family destination. But the food, the history, the child-sized crêpe portions, the boat rides, and the sheer magic of the Eiffel Tower for a child who\'s never seen it — these moments are priceless.',
    },
    mapCenter: { lat: 48.8566, lng: 2.3522 },
  },

  {
    id: 'thailand',
    name: 'Thailand',
    flag: '🇹🇭',
    heroImage: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=600&q=80',
    taglines: {
      solo:    'Find your inner peace in the Land of Smiles',
      couple:  'Romance on turquoise waters',
      friends: 'The ultimate group adventure',
      family:  'Magical temples, beaches and elephant sanctuaries',
    },
    weather: { temp: '28–35°C', condition: 'Tropical & Warm', icon: '☀️' },
    matchPercentage: 91,
    description: 'Temples, beaches, street food, and world-class hospitality at an unbeatable price.',
    currency: '฿ Baht',
    language: 'Thai',
    timezone: 'UTC+7',
    positives: {
      solo:    ['One of the world\'s top solo destinations', 'Very safe and welcoming', 'Extremely budget-friendly', 'Yoga & meditation retreats', 'Easy island hopping'],
      couple:  ['Stunning beach resorts', 'Private island rentals possible', 'Romantic Thai massage for two', 'Beautiful temple atmospheres', 'Sunset boat tours'],
      friends: ['World-class party scene in Bangkok', 'Incredibly affordable', 'Group villa rentals', 'Muay Thai experiences', 'Night market feasts'],
      family:  ['Very family-friendly culture', 'Elephant sanctuaries', 'Warm, safe waters for swimming', 'Thai cooking classes for kids', 'Affordable luxury'],
    },
    negatives: {
      solo:    ['Occasional scams targeting tourists', 'Can be very hot', 'Some areas crowded'],
      couple:  ['Rainy season June-October', 'Some beaches very busy', 'Dress codes at temples'],
      friends: ['Party areas can be overwhelming', 'Haggling exhausting for some', 'Night buses not for everyone'],
      family:  ['Heat can overwhelm small children', 'Temple dress codes strict', 'Travel between islands time-consuming'],
    },
    hotels: [
      { id: 'h1', name: 'Soneva Kiri Koh Kood', image: 'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=600&q=80', rating: 5.0, price: '$800/night', priceLevel: 'luxury', address: 'Koh Kood Island', amenities: ['Private Pool Villa', 'Overwater Cinema', 'Organic Farm', 'Spa'], description: 'Barefoot luxury on a private island. Rooms come with personal butlers and hammocks over the sea.', squadTags: ['couple'] },
      { id: 'h2', name: 'Mad Monkey Bangkok', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.5, price: '$25/night', priceLevel: 'budget', address: 'Silom, Bangkok', amenities: ['Rooftop Pool', 'Bar', 'Tour Desk', 'Social Events'], description: 'Bangkok\'s most social hostel. Rooftop pool parties, pub crawls, and instant friendships.', squadTags: ['friends', 'solo'] },
      { id: 'h3', name: 'Anantara Riverside', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 4.8, price: '$180/night', priceLevel: 'mid-range', address: 'Chao Phraya, Bangkok', amenities: ['River Pool', 'Cooking Class', 'Kids Club', 'Elephant Camp Transfer'], description: 'Riverside resort with a world-class kids club and one of Bangkok\'s best cooking schools.', squadTags: ['family', 'couple'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Gaggan Anand', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 5.0, cuisine: 'Progressive Indian-Thai', description: 'Asia\'s best restaurant. 25-course emoji menu. A once-in-a-lifetime experience.', price: '$250/person', priceLevel: 'luxury', address: 'Ekkamai, Bangkok', tags: ['best-in-asia', 'experiential', 'emoji-menu'], squadTags: ['couple', 'solo'] },
      { id: 'r2', name: 'Or Tor Kor Market', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', rating: 4.7, cuisine: 'Thai Street Food', description: 'Bangkok\'s finest fresh market. Mangoes, curries, satay, and som tum fresh from the vendors.', price: '$5/person', priceLevel: 'budget', address: 'Chatuchak, Bangkok', tags: ['street-food', 'authentic', 'market'], squadTags: ['friends', 'family', 'solo'] },
    ],
    activities: [
      { id: 'a1', name: 'Elephant Nature Park', image: 'https://images.unsplash.com/photo-1551522435-a13afa10f103?w=600&q=80', description: 'Ethical elephant sanctuary in Chiang Mai. Bathe, feed, and walk with rescued elephants.', duration: 'Full day', rating: 5.0, price: '$80', category: 'Nature', accentColor: 'from-green-500 to-emerald-600', squadTags: ['family', 'couple', 'solo', 'friends'] },
      { id: 'a2', name: 'Phi Phi Islands Snorkeling', image: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=600&q=80', description: 'Crystal clear waters, vibrant coral reefs, and the famous Maya Bay from The Beach (film).', duration: 'Full day', rating: 4.9, price: '$60', category: 'Water', accentColor: 'from-cyan-500 to-blue-600', squadTags: ['friends', 'couple', 'solo', 'family'] },
      { id: 'a3', name: 'Bangkok Night Markets', image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&q=80', description: 'Train Night Market, Jodd Fairs, Chatuchak — thousands of stalls of food, fashion and everything.', duration: '4 hours', rating: 4.7, price: 'Free', category: 'Shopping', accentColor: 'from-orange-500 to-red-600', squadTags: ['friends', 'family'] },
      { id: 'a4', name: 'Muay Thai Class', image: 'https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=600&q=80', description: 'Learn Thailand\'s national combat sport from world-class trainers at a real Bangkok gym.', duration: '2 hours', rating: 4.6, price: '$25', category: 'Sport', accentColor: 'from-red-500 to-rose-600', squadTags: ['friends', 'solo'] },
    ],
    events: [
      { id: 'e1', name: 'Songkran Water Festival', category: 'Festival', date: 'Apr 13–15', matchPercentage: 97, description: 'Thai New Year — the world\'s biggest water fight across every street in Thailand.', squadTags: ['friends', 'family', 'solo', 'couple'] },
      { id: 'e2', name: 'Yi Peng Lantern Festival', category: 'Cultural', date: 'Nov 15', matchPercentage: 94, description: 'Thousands of lanterns released into the Chiang Mai night sky. Breathtakingly beautiful.', squadTags: ['couple', 'solo', 'friends', 'family'] },
      { id: 'e3', name: 'Full Moon Party Koh Phangan', category: 'Nightlife', date: 'Monthly', matchPercentage: 89, description: 'The world\'s largest beach party — 30,000 people on Haad Rin beach every full moon.', squadTags: ['friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Bangkok Arrival', morning: 'Wat Pho temple — Buddha & traditional massage', afternoon: 'Grand Palace & Emerald Buddha', evening: 'Solo dinner at Or Tor Kor Market', icon: '🛕' },
        { day: 2, theme: 'Chiang Mai Retreat', morning: 'Fly to Chiang Mai, check into eco-lodge', afternoon: 'Doi Suthep temple hike', evening: 'Meditation class at a local temple', icon: '🧘' },
        { day: 3, theme: 'Elephant Sanctuary', morning: 'Full day at Elephant Nature Park', afternoon: 'Bathe and feed rescued elephants', evening: 'Night Bazaar in Chiang Mai', icon: '🐘' },
      ],
      couple: [
        { day: 1, theme: 'Bangkok Romance', morning: 'Floating market at dawn', afternoon: 'Thai cooking class for two', evening: 'Rooftop dinner with city views', icon: '🌅' },
        { day: 2, theme: 'Island Escape', morning: 'Fly/ferry to Koh Samui or Koh Lanta', afternoon: 'Check into beach villa, private sunset swim', evening: 'Beachside candlelit dinner', icon: '🏝️' },
        { day: 3, theme: 'Spa & Snorkeling', morning: 'Couples Thai massage (4 hands, 2 hours)', afternoon: 'Snorkeling trip to nearby coral reef', evening: 'Seafood BBQ on the beach', icon: '🧖' },
      ],
      friends: [
        { day: 1, theme: 'Bangkok Arrival', morning: 'Grand Palace + Muay Thai class', afternoon: 'Chatuchak Weekend Market', evening: 'Mad Monkey pub crawl', icon: '🥊' },
        { day: 2, theme: 'Phi Phi Islands', morning: 'Speedboat to Phi Phi Islands', afternoon: 'Snorkeling, cliff jumping, beach clubs', evening: 'Phi Phi nightlife (fire shows!)', icon: '🏄' },
        { day: 3, theme: 'Full Moon Prep', morning: 'Beach day on Koh Phangan', afternoon: 'Body paint and neon outfits shopping', evening: 'Full Moon Party all night', icon: '🌕' },
      ],
      family: [
        { day: 1, theme: 'Bangkok Highlights', morning: 'Grand Palace & Temple of the Emerald Buddha', afternoon: 'Or Tor Kor Market for food adventure', evening: 'Asiatique riverfront night market', icon: '🏯' },
        { day: 2, theme: 'Elephant Day', morning: 'Drive to elephant sanctuary near Bangkok', afternoon: 'Feed, walk and bathe with elephants', evening: 'Traditional Thai dinner with cultural show', icon: '🐘' },
        { day: 3, theme: 'Beach Family Day', morning: 'Ferry to Koh Samui or Koh Chang', afternoon: 'Calm waters swimming, sand castles', evening: 'Beachside family BBQ', icon: '🏖️' },
      ],
    },
    aiInsight: {
      solo:    'Thailand tops every solo travel poll for good reason: it\'s safe, remarkably affordable, the people are genuinely warm, and there\'s an entire infrastructure of hostels, meditation retreats, and cooking schools designed around the solo traveler experience.',
      couple:  'From the overwater villas of Koh Kood to the candlelit temples of Chiang Mai, Thailand is engineered for romance. The golden hour on any Thai beach, with warm water and a coconut in hand, is simply one of the most beautiful settings in the world.',
      friends: 'Thailand is the friend group destination. The Full Moon Party on Koh Phangan, $3 cocktail buckets on the beach, speedboats to limestone cliffs, muay thai classes, street food tours for $5 — it\'s the best value adventure trip your group will ever take.',
      family:  'Thai people genuinely love children and it shows in every interaction. The ethical elephant experiences, the calm warm beach waters, the fascinating temple culture, and the fact that a family of four can eat well for $20 makes Thailand extraordinarily family-friendly.',
    },
    mapCenter: { lat: 13.7563, lng: 100.5018 },
  },

  {
    id: 'italy',
    name: 'Italy',
    flag: '🇮🇹',
    heroImage: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=600&q=80',
    taglines: {
      solo:    'La dolce vita is best savored alone',
      couple:  'Love was invented here',
      friends: 'Wine, pasta, and unforgettable chaos',
      family:  'History alive in every piazza',
    },
    weather: { temp: '18–28°C', condition: 'Mediterranean', icon: '🌞' },
    matchPercentage: 79,
    description: 'Ancient ruins, Renaissance art, coastal villages, and the world\'s greatest food.',
    currency: '€ Euro',
    language: 'Italian',
    timezone: 'UTC+1',
    positives: {
      solo:    ['Welcoming café culture', 'World-class art and architecture', 'Excellent train network', 'Incredible solo dining — order a carafe of house wine', 'Coastal hiking in Cinque Terre'],
      couple:  ['Venice gondola rides', 'Amalfi Coast driving', 'Truffle dinners in Tuscany', 'Vineyard stays', 'Operatic evenings in Verona'],
      friends: ['Affordable wine & aperitivo', 'Cooking classes everywhere', 'Scenic road trips', 'Group villa rentals in Tuscany', 'Beach clubs in Sicily'],
      family:  ['Children eat free in many restaurants', 'Romans love children', 'Gelato on every corner', 'Interactive history everywhere', 'Theme parks near Rome'],
    },
    negatives: {
      solo:    ['Can be touristy in July', 'Some areas expensive', 'Language useful'],
      couple:  ['Venice floods (acqua alta)', 'Expensive in summer', 'Overcrowded popular spots'],
      friends: ['Car rental needed outside cities', 'Traffic chaos in Rome', 'Scams near tourist sites'],
      family:  ['Hills and cobblestones with strollers', 'Summer heat intense', 'Long drives between regions'],
    },
    hotels: [
      { id: 'h1', name: 'Hotel Cipriani Venice', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 5.0, price: '$1200/night', priceLevel: 'luxury', address: 'Giudecca Island, Venice', amenities: ['Private Island', 'Pool', 'Michelin Restaurant', 'Boat Service'], description: 'The legendary Venice island hotel reachable only by private launch. Timeless and extraordinary.', squadTags: ['couple'] },
      { id: 'h2', name: 'Belmond Villa San Michele', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80', rating: 4.9, price: '$750/night', priceLevel: 'luxury', address: 'Fiesole, Florence', amenities: ['Pool', 'Michelin Dining', 'Wine Cellar', 'Garden'], description: 'Former 15th-century monastery overlooking Florence with a façade attributed to Michelangelo.', squadTags: ['couple', 'solo'] },
      { id: 'h3', name: 'Family Hotel Garni Riviera', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.5, price: '$120/night', priceLevel: 'mid-range', address: 'Lake Garda, Lombardy', amenities: ['Lake Views', 'Kids Pool', 'Garden', 'Bike Rental'], description: 'Family-friendly hotel on Lake Garda with shallow swimming areas and a beautiful garden.', squadTags: ['family'] },
      { id: 'h4', name: 'The RomeHello Hostel', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.4, price: '$40/night', priceLevel: 'budget', address: 'Termini, Rome', amenities: ['Rooftop Terrace', 'Free Tours', 'Bar', 'Lockers'], description: 'Social hostel near the Colosseum with free walking tours and a lively rooftop hangout.', squadTags: ['friends', 'solo'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Da Ivo Venice', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.8, cuisine: 'Venetian', description: 'The most romantic restaurant in Venice, hidden down a quiet canal alley. Candlelit, intimate, perfect.', price: '$120/person', priceLevel: 'luxury', address: 'San Marco, Venice', tags: ['romantic', 'hidden', 'candlelit'], squadTags: ['couple'] },
      { id: 'r2', name: 'Trattoria Dall\'Olio', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.7, cuisine: 'Tuscan', description: 'A family-run trattoria in Florence\'s Oltrarno. Grandmother cooks, prices are 1970s, flavors are eternal.', price: '$25/person', priceLevel: 'budget', address: 'Oltrarno, Florence', tags: ['family-run', 'authentic', 'traditional'], squadTags: ['friends', 'family', 'solo'] },
    ],
    activities: [
      { id: 'a1', name: 'Colosseum VIP Night Tour', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80', description: 'Walk the ancient arena floor after dark with only 12 guests. Utterly haunting and magnificent.', duration: '2 hours', rating: 5.0, price: '$120', category: 'History', accentColor: 'from-amber-500 to-orange-600', squadTags: ['couple', 'solo', 'friends'] },
      { id: 'a2', name: 'Amalfi Coast Drive', image: 'https://images.unsplash.com/photo-1534445538923-ab0e2b26f3f6?w=600&q=80', description: 'Rent a convertible or hire a local driver for the most dramatic coastal road in Europe.', duration: 'Full day', rating: 4.9, price: '$150', category: 'Scenic', accentColor: 'from-blue-500 to-cyan-600', squadTags: ['couple', 'friends'] },
      { id: 'a3', name: 'Cooking Class in Bologna', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', description: 'Make fresh tagliatelle and ragù with a Bolognese nonnas. The real way. Worth every pasta calorie.', duration: '4 hours', rating: 4.9, price: '$90', category: 'Food', accentColor: 'from-red-500 to-orange-600', squadTags: ['friends', 'couple', 'family', 'solo'] },
    ],
    events: [
      { id: 'e1', name: 'Venice Carnival', category: 'Festival', date: 'Feb 17–25', matchPercentage: 93, description: 'Masks, elaborate costumes, and centuries of tradition in the streets and canals of Venice.', squadTags: ['couple', 'friends', 'solo'] },
      { id: 'e2', name: 'Verona Opera at Arena', category: 'Music', date: 'Jun–Aug', matchPercentage: 88, description: 'World-class opera in a 2,000-year-old Roman amphitheater under the stars.', squadTags: ['couple', 'solo'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Rome Classics', morning: 'Vatican & Sistine Chapel (early entry)', afternoon: 'Roman Forum & Palatine Hill', evening: 'Aperitivo in Trastevere', icon: '🏛️' },
        { day: 2, theme: 'Florence Discovery', morning: 'Train to Florence, Uffizi Gallery (Botticelli)', afternoon: 'Oltrarno neighborhood exploration', evening: 'Wine bar in Enoteca Pitti Gola e Cantina', icon: '🎨' },
        { day: 3, theme: 'Tuscan Hills', morning: 'Day trip to Siena or San Gimignano', afternoon: 'Vineyard visit with wine tasting', evening: 'Return to Florence, bistecca for one', icon: '🍷' },
      ],
      couple: [
        { day: 1, theme: 'Venice Romance', morning: 'Arrive Venice, gondola through quiet canals', afternoon: 'St. Mark\'s Basilica & Doge\'s Palace', evening: 'Dinner at Da Ivo with Aperol spritz', icon: '🚤' },
        { day: 2, theme: 'Floating City', morning: 'Murano glass-blowing demonstration', afternoon: 'Burano island — the colorful houses', evening: 'Sunset Prosecco on the Rialto Bridge', icon: '🏡' },
        { day: 3, theme: 'Cinque Terre', morning: 'Train to Cinque Terre', afternoon: 'Hike between the five villages', evening: 'Seafood dinner with a cliffside view', icon: '🌊' },
      ],
      friends: [
        { day: 1, theme: 'Rome Squad Day', morning: 'Colosseum & Roman Forum', afternoon: 'Trastevere street food tour', evening: 'Bar crawl in Pigneto neighborhood', icon: '🍕' },
        { day: 2, theme: 'Day Trip to Naples', morning: 'Train to Naples', afternoon: 'Real Neapolitan pizza at Da Michele', evening: 'Return — Aperol spritz night in Rome', icon: '🍕' },
        { day: 3, theme: 'Amalfi Adventure', morning: 'Drive the Amalfi Coast', afternoon: 'Swimming off the rocks in Positano', evening: 'Beach club sunset party', icon: '🌊' },
      ],
      family: [
        { day: 1, theme: 'Rome for Kids', morning: 'Colosseum gladiator tour (kid-friendly guide)', afternoon: 'Gelato route through the historic center', evening: 'Pizza making class for the family', icon: '🗡️' },
        { day: 2, theme: 'Vatican Wonders', morning: 'Vatican Museums — mummies, maps, and Raphael', afternoon: 'Piazza Navona — street performers and fountains', evening: 'Pasta dinner in a family trattoria', icon: '🙏' },
        { day: 3, theme: 'Lake Escape', morning: 'Drive to Lake Garda', afternoon: 'Gardaland theme park (Italy\'s Disney)', evening: 'Lakeside pizza and gelato', icon: '🎡' },
      ],
    },
    aiInsight: {
      solo:    'Italy rewards the solo traveler who moves slowly. Order a carafe of house wine in Florence, sketch the Colosseum at dawn in Rome, take a slow train through Tuscany — Italy\'s beauty is best when unhurried and yours alone.',
      couple:  'Italy didn\'t invent love, but it perfected the setting. Venice, Verona, the Amalfi Coast, the Tuscan hills at harvest time — every backdrop in Italy was made for two people who want to be overwhelmed together.',
      friends: 'An Italian friend group trip is a masterclass in joy. Aperitivo culture means you order a $5 drink and get a free buffet. Group cooking classes. Long lunches. Noisy trattorias. The Italians understand that the best meals take three hours and end in argument about who ate the most.',
      family:  'Italians famously adore children — bambini get preferential treatment in restaurants, special attention in shops, and genuine affection from strangers. The history is alive and interactive, and the food is so good that even picky children find something to love.',
    },
    mapCenter: { lat: 41.9028, lng: 12.4964 },
  },

  {
    id: 'morocco',
    name: 'Morocco',
    flag: '🇲🇦',
    heroImage: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=600&q=80',
    taglines: {
      solo:    'Lose yourself in the medinas',
      couple:  'A thousand and one nights of romance',
      friends: 'Desert adventures you\'ll talk about forever',
      family:  'A sensory world that opens young minds',
    },
    weather: { temp: '20–32°C', condition: 'Warm & Sunny', icon: '🌞' },
    matchPercentage: 74,
    description: 'Labyrinthine medinas, Sahara dunes, blue cities, and the warmest hospitality.',
    currency: 'MAD Dirham',
    language: 'Arabic/French',
    timezone: 'UTC+1',
    positives: {
      solo:    ['Very affordable', 'Fascinating cultural exploration', 'Excellent riads', 'Sahara desert experience', 'Unique medina labyrinth walking'],
      couple:  ['Romantic riad stays', 'Sahara sunset together', 'Hammam spa for two', 'Blue city of Chefchaouen', 'Intimate rooftop dinners'],
      friends: ['Camel trekking in the Sahara', 'Group riad villa rentals', 'Quad biking in dunes', 'Night camping under stars', 'Medina market treasure hunting'],
      family:  ['Fascinating spice markets', 'Camel rides for kids', 'Friendly local families', 'Affordable luxury', 'Snake charmers in Djemaa el-Fna'],
    },
    negatives: {
      solo:    ['Solo women face more attention', 'Persistent touts in medinas', 'Haggling exhausting'],
      couple:  ['Public displays of affection frowned upon', 'Hot summers', 'Some sites far from cities'],
      friends: ['Desert camps fill up fast in winter', 'Alcohol limited outside tourist areas', 'Long bus journeys between cities'],
      family:  ['Heat can overwhelm young children', 'Medina labyrinth hard with strollers', 'Some food too spicy for kids'],
    },
    hotels: [
      { id: 'h1', name: 'La Mamounia Marrakech', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 4.9, price: '$450/night', priceLevel: 'luxury', address: 'Avenue Bab Jdid, Marrakech', amenities: ['Pool', 'Hammam Spa', 'Gardens', 'Churchill\'s Bar'], description: 'Winston Churchill called it the most beautiful place in the world. A palace surrounded by olive groves.', squadTags: ['couple', 'solo'] },
      { id: 'h2', name: 'Dar Ahlam Desert Camp', image: 'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=600&q=80', rating: 5.0, price: '$600/night', priceLevel: 'luxury', address: 'Sahara Desert, Skoura', amenities: ['Private Tents', 'Star Gazing', 'Camel Trek', 'Gourmet Camp Dining'], description: 'Luxury Sahara camp with astronomers, private guides, and meals under the Milky Way. Unforgettable.', squadTags: ['couple', 'friends', 'solo'] },
      { id: 'h3', name: 'Riad Yasmine', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80', rating: 4.6, price: '$90/night', priceLevel: 'budget', address: 'Medina, Marrakech', amenities: ['Pool', 'Rooftop', 'Breakfast', 'Hammam'], description: 'Instagram-famous pink plunge pool riad in the heart of the medina. Excellent value.', squadTags: ['friends', 'couple', 'family'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Nomad Marrakech', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.7, cuisine: 'Contemporary Moroccan', description: 'Rooftop restaurant with views over the medina. Modern takes on tagine and couscous with natural wines.', price: '$35/person', priceLevel: 'mid-range', address: 'Derb Berima, Marrakech', tags: ['rooftop', 'views', 'modern'], squadTags: ['couple', 'friends', 'solo'] },
      { id: 'r2', name: 'Djemaa el-Fna Stalls', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', rating: 4.5, cuisine: 'Moroccan Street Food', description: 'The world\'s greatest outdoor dining experience. Hundreds of stalls at dusk serving harira, merguez, and snails.', price: '$5/person', priceLevel: 'budget', address: 'Djemaa el-Fna Square, Marrakech', tags: ['street-food', 'experience', 'authentic'], squadTags: ['friends', 'family', 'solo'] },
    ],
    activities: [
      { id: 'a1', name: 'Sahara Camel Trek & Camp', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80', description: 'Ride camels into the Erg Chebbi dunes, camp overnight, and watch the sunrise paint the sand pink.', duration: '2 days', rating: 5.0, price: '$150', category: 'Adventure', accentColor: 'from-amber-500 to-orange-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a2', name: 'Fes Medina Guided Walk', image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600&q=80', description: 'Navigate the world\'s largest car-free urban area with a local guide. Medieval tanneries, spice souks, fountains.', duration: '4 hours', rating: 4.8, price: '$40', category: 'Culture', accentColor: 'from-teal-500 to-emerald-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a3', name: 'Chefchaouen Blue City', image: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=600&q=80', description: 'The blue-painted mountain city is impossibly photogenic. Every alley is a perfect photo.', duration: 'Full day', rating: 4.9, price: 'Free', category: 'Photography', accentColor: 'from-blue-500 to-indigo-600', squadTags: ['solo', 'couple', 'friends'] },
    ],
    events: [
      { id: 'e1', name: 'Marrakech International Film Festival', category: 'Film', date: 'Nov 29 – Dec 7', matchPercentage: 80, description: 'Red carpet events and screenings in the Palais des Congrès.', squadTags: ['couple', 'solo'] },
      { id: 'e2', name: 'Fes Festival of World Sacred Music', category: 'Music', date: 'Jun 14–22', matchPercentage: 85, description: 'World music festival in an ancient walled medina setting.', squadTags: ['solo', 'couple', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Marrakech Arrival', morning: 'Get lost in the medina (intentionally)', afternoon: 'Bahia Palace & Saadian Tombs', evening: 'Rooftop dinner watching the square come alive', icon: '🕌' },
        { day: 2, theme: 'Blue City', morning: 'Day trip to Chefchaouen', afternoon: 'Wander the blue alleys and medina', evening: 'Stay in Chefchaouen riad overnight', icon: '💙' },
        { day: 3, theme: 'Sahara Journey', morning: 'Drive to Merzouga desert', afternoon: 'Camel trek into the dunes', evening: 'Camp under the Milky Way', icon: '🐪' },
      ],
      couple: [
        { day: 1, theme: 'Marrakech Magic', morning: 'Majorelle Garden & Yves Saint Laurent Museum', afternoon: 'Couples hammam & massage at the riad', evening: 'Private rooftop dinner under the stars', icon: '🌺' },
        { day: 2, theme: 'Atlas Day Trip', morning: 'Drive through the Atlas Mountains to Aït Benhaddou', afternoon: 'Explore the UNESCO-listed ancient ksar', evening: 'Return for sunset cocktails at La Mamounia', icon: '⛰️' },
        { day: 3, theme: 'Sahara Romance', morning: 'Arrive at Sahara camp', afternoon: 'Dune sunset with champagne', evening: 'Private Berber dinner under the stars', icon: '✨' },
      ],
      friends: [
        { day: 1, theme: 'Marrakech Chaos', morning: 'Medina treasure hunt (guided)', afternoon: 'Hammam followed by mint tea in the souk', evening: 'Djemaa el-Fna feast + storytellers + music', icon: '🎭' },
        { day: 2, theme: 'Desert Adventure', morning: 'Drive to Sahara via Aït Benhaddou', afternoon: 'Quad biking on the dunes', evening: 'Group camp with live Gnawa music', icon: '🏍️' },
        { day: 3, theme: 'Blue City Trip', morning: 'Chefchaouen group exploration', afternoon: 'Photography challenge through the medina', evening: 'Return to Marrakech for a last night celebration', icon: '📸' },
      ],
      family: [
        { day: 1, theme: 'Marrakech Senses', morning: 'Djemaa el-Fna — snake charmers, musicians', afternoon: 'Majorelle Garden — peacocks and exotic plants', evening: 'Family tagine dinner in the medina', icon: '🐍' },
        { day: 2, theme: 'Desert & Camels', morning: 'Drive south, stop at Aït Benhaddou', afternoon: 'Camel ride on the dunes (kids love it)', evening: 'Family camp with stories around the fire', icon: '🐪' },
        { day: 3, theme: 'Markets & Crafts', morning: 'Spice souk tour — smell every jar', afternoon: 'Pottery workshop — make your own bowl', evening: 'Last rooftop dinner, watch the medina at dusk', icon: '🎨' },
      ],
    },
    aiInsight: {
      solo:    'Morocco is the ultimate solo journey into otherness. The medinas of Fes and Marrakech reward explorers who get deliberately lost. The warmth of Moroccan hospitality — endless mint tea, conversations with strangers — creates connections that solo travelers treasure.',
      couple:  'A thousand and one nights isn\'t just a book title in Morocco — it\'s the promise of every riad. Sleeping under canvas in the Sahara, watching the sun set over the Atlas, taking a hammam together in a 14th-century bathhouse: these are experiences that become part of your story.',
      friends: 'Morocco with friends is controlled chaos at its most beautiful. The medina treasure hunt, the Sahara camp with live music, the impossibly cheap food, the quad bikes on dunes, the group riad with a shared plunge pool — every day generates stories that outlast the trip.',
      family:  'Children experience Morocco through pure wonder. The snake charmers in Djemaa el-Fna, the rainbow spice mounds in the souk, the camel ride at sunset, the call to prayer echoing through ancient walls — it\'s a living, breathing education in the world\'s diversity.',
    },
    mapCenter: { lat: 31.6295, lng: -7.9811 },
  },

  {
    id: 'greece',
    name: 'Greece',
    flag: '🇬🇷',
    heroImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80',
    taglines: {
      solo:    'Ancient stories and sun-bleached islands await',
      couple:  'Blue domes, sunsets and eternal romance',
      friends: 'Ouzo, beaches and memories for life',
      family:  'Myths, meze and Mediterranean magic',
    },
    weather: { temp: '20–30°C', condition: 'Sunny & Warm', icon: '☀️' },
    matchPercentage: 85,
    description: 'Whitewashed villages, volcanic beaches, ancient ruins, and legendary Mediterranean hospitality.',
    currency: '€ Euro',
    language: 'Greek',
    timezone: 'UTC+2',
    positives: {
      solo:    ['Safe and welcoming culture', 'Island hopping easy by ferry', 'Affordable accommodation', 'Rich history to explore alone', 'Vibrant café culture'],
      couple:  ['World-famous Santorini sunsets', 'Intimate cave hotels', 'Wine tasting in Santorini vineyards', 'Secluded cove beaches', 'Romantic seaside tavernas'],
      friends: ['Legendary Mykonos nightlife', 'Affordable island parties', 'Group villa rentals', 'Water sports and boat trips', 'Amazing street food and mezze'],
      family:  ['Very family-friendly culture', 'Calm shallow waters on many islands', 'Kids love ancient ruins', 'Affordable family tavernas', 'Safe and clean beaches'],
    },
    negatives: {
      solo:    ['Peak season very crowded', 'Some islands expensive', 'Ferry schedules can be unreliable'],
      couple:  ['Santorini extremely busy July–August', 'Accommodation prices high in summer', 'Mosquitoes at night'],
      friends: ['Mykonos nightlife very expensive', 'Transport between islands takes time', 'Accommodation books up fast'],
      family:  ['Sun very intense in July–August', 'Some ancient sites have no shade', 'Ferry travel long with young children'],
    },
    hotels: [
      { id: 'h1', name: 'Canaves Oia Epitome', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 5.0, price: '$900/night', priceLevel: 'luxury', address: 'Oia, Santorini', amenities: ['Infinity Pool', 'Cave Suites', 'Sunset Views', 'Fine Dining'], description: 'The most iconic cave hotel in Santorini, perched on the caldera with incomparable sunset views.', squadTags: ['couple'] },
      { id: 'h2', name: 'Mykonos Blu Resort', image: 'https://images.unsplash.com/photo-1551882547-ff40c4a49ce7?w=600&q=80', rating: 4.8, price: '$450/night', priceLevel: 'luxury', address: 'Psarou Beach, Mykonos', amenities: ['Beach Club', 'Pool', 'Spa', 'DJ Sets'], description: 'Elegant resort steps from Psarou Beach with a world-famous beach club and party scene.', squadTags: ['friends', 'couple'] },
      { id: 'h3', name: 'Athens Gate Hotel', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.6, price: '$120/night', priceLevel: 'mid-range', address: 'Syntagma, Athens', amenities: ['Rooftop Bar', 'Acropolis Views', 'Restaurant', 'City Center'], description: 'Boutique hotel in Athens with an iconic rooftop bar overlooking the Acropolis and Temple of Zeus.', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'h4', name: 'Creta Maris Beach Resort', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.7, price: '$200/night', priceLevel: 'mid-range', address: 'Hersonissos, Crete', amenities: ['Kids Club', 'Waterslides', 'Multiple Pools', 'Kids Activities'], description: 'All-inclusive family resort on Crete with dedicated kids club and calm shallow beach.', squadTags: ['family'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Selene Santorini', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.9, cuisine: 'Modern Greek', description: 'Santorini\'s finest restaurant showcasing local ingredients — fava, cherry tomatoes, white eggplant — with caldera views.', price: '$120/person', priceLevel: 'luxury', address: 'Pyrgos, Santorini', tags: ['romantic', 'fine-dining', 'views'], squadTags: ['couple', 'solo'] },
      { id: 'r2', name: 'Thanasis Taverna', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.7, cuisine: 'Traditional Greek', description: 'Athens\' most beloved souvlaki and kebab taverna since 1960s. Always a queue, always worth it.', price: '$12/person', priceLevel: 'budget', address: 'Monastiraki, Athens', tags: ['iconic', 'street-food', 'traditional'], squadTags: ['friends', 'family', 'solo'] },
      { id: 'r3', name: 'Nautilus Mykonos', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', rating: 4.6, cuisine: 'Seafood', description: 'Fresh daily catch on Little Venice waterfront. Octopus, sea urchin, grilled fish — as Greek as it gets.', price: '$50/person', priceLevel: 'mid-range', address: 'Little Venice, Mykonos', tags: ['seafood', 'waterfront', 'fresh'], squadTags: ['friends', 'couple'] },
    ],
    activities: [
      { id: 'a1', name: 'Acropolis Sunrise Visit', image: 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=600&q=80', description: 'Visit the Parthenon and ancient Acropolis at opening time before the crowds. One of humanity\'s greatest monuments.', duration: '3 hours', rating: 4.9, price: '$25', category: 'Culture', accentColor: 'from-amber-500 to-orange-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a2', name: 'Santorini Caldera Boat Tour', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80', description: 'Sail around the volcanic caldera, swim in hot springs, and watch the sunset from the water.', duration: 'Full day', rating: 5.0, price: '$90', category: 'Scenic', accentColor: 'from-blue-500 to-cyan-600', squadTags: ['couple', 'friends', 'family', 'solo'] },
      { id: 'a3', name: 'Mykonos Beach Clubs', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', description: 'Paradise Beach and Super Paradise Beach — world-class DJ sets, cocktails, and Mediterranean vibes.', duration: 'Full day', rating: 4.7, price: '$30+', category: 'Nightlife', accentColor: 'from-purple-500 to-pink-600', squadTags: ['friends'] },
      { id: 'a4', name: 'Crete Palace of Knossos', image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80', description: 'Europe\'s oldest city and birthplace of the Minoan civilization. Kids love the labyrinth legends.', duration: '3 hours', rating: 4.7, price: '$15', category: 'History', accentColor: 'from-yellow-500 to-amber-600', squadTags: ['family', 'solo', 'couple'] },
    ],
    events: [
      { id: 'e1', name: 'Athens Epidaurus Festival', category: 'Cultural', date: 'Jun–Aug', matchPercentage: 88, description: 'Ancient Greek theatre performed in the 2,400-year-old Epidaurus amphitheater. Extraordinary.', squadTags: ['couple', 'solo', 'friends'] },
      { id: 'e2', name: 'Mykonos Pride', category: 'Festival', date: 'Jun', matchPercentage: 85, description: 'One of Europe\'s most vibrant and welcoming Pride celebrations on the island.', squadTags: ['friends', 'solo'] },
      { id: 'e3', name: 'Greek Easter (Pascha)', category: 'Cultural', date: 'Apr (varies)', matchPercentage: 90, description: 'The most important Greek celebration — midnight services, fireworks, lamb feasts. Unforgettable.', squadTags: ['family', 'couple', 'solo', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Athens Ancient Core', morning: 'Acropolis at opening hour — Parthenon alone at dawn', afternoon: 'National Archaeological Museum', evening: 'Solo mezze at a Monastiraki wine bar', icon: '🏛️' },
        { day: 2, theme: 'Santorini Arrival', morning: 'Ferry to Santorini, settle in Oia', afternoon: 'Walk the caldera rim from Oia to Fira', evening: 'Sunset solo wine tasting at a vineyard', icon: '🍷' },
        { day: 3, theme: 'Island Exploration', morning: 'Rent a quad bike, explore hidden beaches', afternoon: 'Red Beach and Black Beach swim', evening: 'Fresh seafood dinner in Ammoudi Bay', icon: '🛵' },
      ],
      couple: [
        { day: 1, theme: 'Santorini Romance', morning: 'Check into cave hotel, caldera views', afternoon: 'Boat tour around the volcanic islands', evening: 'Dinner at Selene restaurant', icon: '💙' },
        { day: 2, theme: 'Island Day', morning: 'Oia village walk at dawn (before crowds)', afternoon: 'Private wine tasting at Santo Wines', evening: 'Watch Oia sunset — world\'s most romantic view', icon: '🌅' },
        { day: 3, theme: 'Athens Culture', morning: 'Ferry to Athens, Acropolis visit', afternoon: 'Plaka neighborhood stroll, souvenir shopping', evening: 'Rooftop dinner with Acropolis views at dusk', icon: '🏛️' },
      ],
      friends: [
        { day: 1, theme: 'Athens Party Start', morning: 'Acropolis morning, history done fast', afternoon: 'Monastiraki food market, cheap mezze feast', evening: 'Athens bar scene in Psiri neighborhood', icon: '🎉' },
        { day: 2, theme: 'Mykonos Island Life', morning: 'Ferry to Mykonos, beach club arrival', afternoon: 'Paradise Beach DJ sets and swimming', evening: 'Mykonos Town nightlife until dawn', icon: '🏖️' },
        { day: 3, theme: 'Recovery & Boat', morning: 'Late brunch, Little Venice waterfront', afternoon: 'Sailing trip around the island, snorkeling', evening: 'Farewell seafood dinner and cocktails', icon: '⛵' },
      ],
      family: [
        { day: 1, theme: 'Athens Family', morning: 'Acropolis with guided family tour', afternoon: 'Stavros Niarchos Cultural Center & park', evening: 'Family dinner in a traditional taverna', icon: '🏛️' },
        { day: 2, theme: 'Crete Adventure', morning: 'Fly/ferry to Crete, Knossos Palace tour', afternoon: 'Beach afternoon at Elafonissi (pink sand)', evening: 'Fresh grilled fish dinner by the sea', icon: '🏺' },
        { day: 3, theme: 'Beach Day', morning: 'Calm beach resort morning, waterslides', afternoon: 'Glass-bottom boat tour, spot fish below', evening: 'Kids choose dinner — souvlaki wins every time', icon: '🐠' },
      ],
    },
    aiInsight: {
      solo:    'Greece rewards the solo traveler who moves between worlds — from the intellectual weight of Athens to the breezy freedom of the islands. The ferry network makes island hopping natural, and Greek café culture makes sitting alone feel like an art form.',
      couple:  'Santorini exists for couples. The iconic blue-domed churches, the caldera at sunset, the cave hotels carved into volcanic rock — every element conspires to create an unforgettable romantic backdrop. It\'s as beautiful as every photograph promises, and more.',
      friends: 'Greece with friends is a masterpiece. Mykonos is unashamedly the party capital of the Mediterranean — world-class DJs, beach clubs at midday, waterfront cocktails at 3am. Athens provides the culture, Mykonos provides the chaos. Both are perfect.',
      family:  'Greece is brilliant for families — the calm azure waters of Crete, the legends of the Minotaur that bring history alive for children, the ice cream shops on every corner, and the genuinely child-loving Greek culture make every family feel like royalty here.',
    },
    mapCenter: { lat: 37.9838, lng: 23.7275 },
  },

  {
    id: 'spain',
    name: 'Spain',
    flag: '🇪🇸',
    heroImage: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600&q=80',
    taglines: {
      solo:    'Live like a local in the most alive country on Earth',
      couple:  'Flamenco, tapas and endless Iberian romance',
      friends: 'The friend group trip that never ends',
      family:  'Sun, paella and Barcelona adventures',
    },
    weather: { temp: '18–30°C', condition: 'Sunny & Mediterranean', icon: '☀️' },
    matchPercentage: 86,
    description: 'Passionate culture, world-class food, golden beaches, and architectural masterpieces.',
    currency: '€ Euro',
    language: 'Spanish',
    timezone: 'UTC+1',
    positives: {
      solo:    ['Incredibly social culture', 'Excellent solo dining (tapas bars)', 'Great train network', 'Safe for solo travelers', 'Affordable tapas and wine'],
      couple:  ['Romantic flamenco shows', 'Stunning Alhambra palace', 'Gaudi architecture in Barcelona', 'Pintxos tours in San Sebastián', 'Golden sunsets on Costa del Sol'],
      friends: ['World-class nightlife (Barcelona, Ibiza, Madrid)', 'Affordable wine and cocktails', 'Group cooking classes', 'Football matches in Camp Nou', 'San Sebastián food tours'],
      family:  ['PortAventura World theme park', 'Great beaches with calm waters', 'Child-friendly culture', 'Affordable family restaurants', 'Fascinating Gaudi for curious kids'],
    },
    negatives: {
      solo:    ['Late night culture can be tiring', 'Summer heat intense', 'Pickpockets in tourist areas'],
      couple:  ['Very crowded in summer', 'Barcelona accommodation expensive', 'Language barrier outside cities'],
      friends: ['Ibiza very expensive', 'Nightlife starts very late', 'Heat in July/August extreme'],
      family:  ['Long drives between regions', 'Summer beaches very crowded', 'Iberian heat exhausting for young children'],
    },
    hotels: [
      { id: 'h1', name: 'Hotel Arts Barcelona', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 4.9, price: '$500/night', priceLevel: 'luxury', address: 'Barceloneta, Barcelona', amenities: ['Beach Club', 'Infinity Pool', 'Michelin Spa', 'City & Sea Views'], description: 'Iconic tower hotel on the Barcelona beachfront with a world-famous rooftop pool overlooking the Mediterranean.', squadTags: ['couple', 'friends'] },
      { id: 'h2', name: 'Parador de Granada', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80', rating: 4.8, price: '$280/night', priceLevel: 'luxury', address: 'Alhambra, Granada', amenities: ['Historic Palace', 'Garden', 'Flamenco', 'Andalusian Cuisine'], description: 'Sleep inside the Alhambra complex itself — a 15th-century convent converted into a magnificent parador.', squadTags: ['couple', 'solo'] },
      { id: 'h3', name: 'Chic & Basic Born', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.5, price: '$80/night', priceLevel: 'budget', address: 'El Born, Barcelona', amenities: ['Rooftop Terrace', 'Design Hotel', 'Central Location', 'Bar'], description: 'Stylish budget-friendly hotel in Barcelona\'s coolest neighborhood, steps from Gothic Quarter and La Boqueria.', squadTags: ['friends', 'solo'] },
      { id: 'h4', name: 'Hotel Mas Ses Vinyes', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.6, price: '$160/night', priceLevel: 'mid-range', address: 'Costa Daurada, Catalonia', amenities: ['Pool', 'Kids Club', 'Near PortAventura', 'Gardens'], description: 'Family resort near PortAventura theme park with pools, kids activities, and calm Mediterranean beach access.', squadTags: ['family'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Tickets Barcelona', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 5.0, cuisine: 'Creative Tapas', description: 'Albert Adrià\'s legendary tapas bar where every bite is a miniature work of art. Book 2 months ahead.', price: '$90/person', priceLevel: 'luxury', address: 'El Poble Sec, Barcelona', tags: ['creative', 'michelin', 'tapas'], squadTags: ['couple', 'friends', 'solo'] },
      { id: 'r2', name: 'Bar El Xampanyet', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.7, cuisine: 'Traditional Tapas', description: 'Barcelona\'s most beloved traditional tapas bar since 1929. House cava, anchovies, and a perfect bar atmosphere.', price: '$20/person', priceLevel: 'budget', address: 'El Born, Barcelona', tags: ['traditional', 'cava', 'historic'], squadTags: ['friends', 'solo', 'couple'] },
      { id: 'r3', name: 'La Mar Salada', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', rating: 4.6, cuisine: 'Seafood & Paella', description: 'Exceptional seafood paella overlooking the beach. The black rice with squid ink is extraordinary.', price: '$45/person', priceLevel: 'mid-range', address: 'Barceloneta, Barcelona', tags: ['seafood', 'paella', 'beach-view'], squadTags: ['family', 'friends', 'couple'] },
    ],
    activities: [
      { id: 'a1', name: 'Sagrada Família Visit', image: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=600&q=80', description: 'Gaudí\'s unfinished masterpiece — the most visited monument in Spain and one of the world\'s greatest buildings.', duration: '3 hours', rating: 5.0, price: '$30', category: 'Culture', accentColor: 'from-amber-500 to-orange-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a2', name: 'Alhambra Palace Granada', image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600&q=80', description: 'The most exquisite Moorish palace in the world. Intricate tile work, garden courtyards, and mountain views.', duration: '4 hours', rating: 5.0, price: '$18', category: 'History', accentColor: 'from-teal-500 to-emerald-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a3', name: 'Flamenco Show Seville', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&q=80', description: 'Authentic flamenco in a traditional tablao — raw emotion, stamping feet, and guitar in a 19th-century tavern.', duration: '2 hours', rating: 4.9, price: '$40', category: 'Culture', accentColor: 'from-red-500 to-rose-600', squadTags: ['couple', 'friends', 'solo', 'family'] },
      { id: 'a4', name: 'Ibiza Beach Clubs', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', description: 'Nikki Beach, Ushuaïa, Amnesia — the greatest DJ lineup in the world on the most electric island.', duration: 'Full day', rating: 4.8, price: '$50+', category: 'Nightlife', accentColor: 'from-purple-500 to-violet-600', squadTags: ['friends'] },
      { id: 'a5', name: 'PortAventura World', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80', description: 'Spain\'s biggest theme park with Dragon Khan roller coaster and Ferrari Land next door.', duration: 'Full day', rating: 4.7, price: '$60', category: 'Adventure', accentColor: 'from-yellow-500 to-orange-600', squadTags: ['family', 'friends'] },
    ],
    events: [
      { id: 'e1', name: 'La Tomatina', category: 'Festival', date: 'Aug 28', matchPercentage: 91, description: 'The world\'s biggest food fight — 40,000 people hurling 150,000 tomatoes in Buñol. Legendary.', squadTags: ['friends'] },
      { id: 'e2', name: 'San Fermín Running of the Bulls', category: 'Festival', date: 'Jul 6–14', matchPercentage: 88, description: 'Pamplona\'s iconic week-long festival with bull runs, music, and parties through the night.', squadTags: ['friends', 'solo'] },
      { id: 'e3', name: 'Feria de Abril Seville', category: 'Cultural', date: 'Apr (varies)', matchPercentage: 92, description: 'Flamenco dresses, horse parades, and casetas serving manzanilla — Seville\'s magical spring fair.', squadTags: ['couple', 'friends', 'family', 'solo'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Barcelona Discovery', morning: 'Sagrada Família and Park Güell', afternoon: 'La Boqueria market food tour', evening: 'Solo tapas crawl in El Born neighborhood', icon: '🏗️' },
        { day: 2, theme: 'Gothic & Modern', morning: 'Gothic Quarter exploration at dawn', afternoon: 'Picasso Museum', evening: 'Bar El Xampanyet cava and anchovies', icon: '🎨' },
        { day: 3, theme: 'Day Trip', morning: 'Train to Montserrat monastery', afternoon: 'Hike the mountain trails', evening: 'Return to Barcelona — wine bar in Eixample', icon: '⛰️' },
      ],
      couple: [
        { day: 1, theme: 'Granada Romance', morning: 'Alhambra Palace at opening (pre-booked)', afternoon: 'Generalife gardens, Nasrid Palaces', evening: 'Flamenco show in the Sacromonte caves', icon: '🌹' },
        { day: 2, theme: 'Seville Magic', morning: 'Train to Seville, Real Alcázar palace', afternoon: 'Tapas in Triana, walk along the river', evening: 'Rooftop cocktails with Giralda tower views', icon: '🎭' },
        { day: 3, theme: 'Barcelona Together', morning: 'Sagrada Família morning visit', afternoon: 'Picnic at Park Güell with views', evening: 'Fine dining at Tickets or beachfront dinner', icon: '🏗️' },
      ],
      friends: [
        { day: 1, theme: 'Barcelona Culture & Food', morning: 'Sagrada Família quick visit', afternoon: 'La Boqueria market, street food feast', evening: 'Bar crawl through El Born and Barceloneta', icon: '🍻' },
        { day: 2, theme: 'Ibiza Day Trip', morning: 'Fly or ferry to Ibiza', afternoon: 'Beach clubs from noon (Ushuaïa)', evening: 'Amnesia or Pacha nightclub until 6am', icon: '🎧' },
        { day: 3, theme: 'Recovery Beach Day', morning: 'Late start, Barceloneta beach', afternoon: 'Group paella lunch by the sea', evening: 'Vermouth and tapas at sunset — perfect ending', icon: '🥘' },
      ],
      family: [
        { day: 1, theme: 'Barcelona Icons', morning: 'Sagrada Família (kids love the towers)', afternoon: 'Park Güell mosaic terrace and views', evening: 'Beachfront dinner at Barceloneta', icon: '🏗️' },
        { day: 2, theme: 'Theme Park Day', morning: 'PortAventura World — open at gates', afternoon: 'Ferrari Land next door', evening: 'Tired but happy — hotel pool time', icon: '🎡' },
        { day: 3, theme: 'Beach & Culture', morning: 'Camp Nou stadium tour (football mad kids)', afternoon: 'Barceloneta beach afternoon swim', evening: 'La Boqueria dinner — let kids pick from the stalls', icon: '⚽' },
      ],
    },
    aiInsight: {
      solo:    'Spain is built for social solo travelers. Tapas bars are designed to be visited alone — you stand, you order small plates, you talk to strangers. The Spanish culture of communal eating makes solitude impossible here, and that\'s entirely the point.',
      couple:  'The Alhambra in Granada, a flamenco performance in Seville\'s caves, a shared paella on the Barcelona beachfront — Spain delivers romance through passion, not cliché. The architecture, the food, the music, the people: all of it conspires to make couples feel intensely alive.',
      friends: 'Spain is the friend group\'s paradise. Barcelona has beach AND nightlife. Ibiza is Ibiza. San Sebastián has the best pintxos bars in Europe. La Tomatina exists. If your group needs convincing, show them any of the above and the argument is over.',
      family:  'Spain adores children and the culture shows it. Kids eat free, play late, and see magnificent things — Gaudí\'s dragon staircases, Roman amphitheaters, the sheer chaos of La Boqueria market. PortAventura seals the deal for any family hesitating.',
    },
    mapCenter: { lat: 40.4168, lng: -3.7038 },
  },

  {
    id: 'dubai',
    name: 'Dubai',
    flag: '🇦🇪',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
    taglines: {
      solo:    'The future arrived early — and it\'s spectacular',
      couple:  'Luxury beyond imagination, together',
      friends: 'The most extravagant group trip on Earth',
      family:  'Thrills, wonders and no limits',
    },
    weather: { temp: '20–35°C', condition: 'Sunny & Arid', icon: '🌞' },
    matchPercentage: 80,
    description: 'Ultra-modern skyline, desert adventures, world-record attractions, and five-star everything.',
    currency: 'AED Dirham',
    language: 'Arabic/English',
    timezone: 'UTC+4',
    positives: {
      solo:    ['Extremely safe city', 'World-class malls and attractions', 'Tax-free shopping', 'Efficient metro system', 'English spoken everywhere'],
      couple:  ['Ultra-luxury hotels and resorts', 'Romantic desert dinners', 'Private beach clubs', 'Helicopter tours of the skyline', 'Burj Khalifa sunset views'],
      friends: ['Amazing brunch culture', 'Ski Dubai indoor slopes', 'Supercar rentals', 'Yacht charters', 'Wild Wadi and Atlantis waterparks'],
      family:  ['IMG Worlds of Adventure', 'Legoland Dubai', 'Dubai Aquarium', 'Very safe environment', 'KidZania education park'],
    },
    negatives: {
      solo:    ['Very expensive', 'Strict cultural codes', 'Alcohol only in licensed venues'],
      couple:  ['Public displays of affection restricted', 'Extreme summer heat (June–Sep)', 'Very expensive for luxury travel'],
      friends: ['Alcohol laws restrict party culture', 'Summer months unbearably hot', 'Expensive by regional standards'],
      family:  ['Summer heat dangerous for young children', 'Everything is very expensive', 'Cultural restrictions to navigate'],
    },
    hotels: [
      { id: 'h1', name: 'Burj Al Arab Jumeirah', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 5.0, price: '$2000/night', priceLevel: 'luxury', address: 'Jumeirah Beach, Dubai', amenities: ['Private Beach', 'Helipad', 'Butler Service', '9 Restaurants'], description: 'The world\'s most recognizable luxury hotel, built on its own island. Truly the pinnacle of opulence.', squadTags: ['couple'] },
      { id: 'h2', name: 'Atlantis The Palm', image: 'https://images.unsplash.com/photo-1551882547-ff40c4a49ce7?w=600&q=80', rating: 4.8, price: '$500/night', priceLevel: 'luxury', address: 'Palm Jumeirah, Dubai', amenities: ['Aquaventure Waterpark', 'Aquarium', 'Kids Club', 'Private Beach'], description: 'The iconic Palm resort with the world\'s most thrilling waterpark and an enormous marine habitat.', squadTags: ['family', 'friends'] },
      { id: 'h3', name: 'Rove Downtown', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.5, price: '$120/night', priceLevel: 'mid-range', address: 'Downtown Dubai', amenities: ['Rooftop Pool', 'Gym', 'Burj Khalifa Walking Distance', 'Social Lounge'], description: 'Smart, design-forward hotel steps from the Burj Khalifa and Dubai Mall. Outstanding value in a prime location.', squadTags: ['solo', 'friends', 'couple'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Nobu Dubai', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.9, cuisine: 'Japanese-Peruvian', description: 'Nobu Matsuhisa\'s legendary fusion restaurant in Atlantis. Black cod miso here is the definitive version.', price: '$150/person', priceLevel: 'luxury', address: 'Atlantis The Palm, Dubai', tags: ['celebrity', 'fine-dining', 'fusion'], squadTags: ['couple', 'friends', 'solo'] },
      { id: 'r2', name: 'Al Fanar Restaurant', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.7, cuisine: 'Emirati', description: 'Authentic Emirati cuisine in a heritage setting — camel meat, luqaimat dessert, and fresh laban. A rare window into local culture.', price: '$35/person', priceLevel: 'mid-range', address: 'Festival City, Dubai', tags: ['authentic', 'local', 'cultural'], squadTags: ['solo', 'couple', 'family', 'friends'] },
      { id: 'r3', name: 'Shakespeare and Co.', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', rating: 4.5, cuisine: 'International', description: 'Whimsical Victorian-themed café chain beloved by Dubai families. Excellent brunch menu at a fraction of hotel prices.', price: '$25/person', priceLevel: 'mid-range', address: 'Multiple locations, Dubai', tags: ['family-friendly', 'brunch', 'whimsical'], squadTags: ['family', 'friends'] },
    ],
    activities: [
      { id: 'a1', name: 'Burj Khalifa At The Top', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80', description: 'Visit the world\'s tallest building. The 124th floor observation deck offers 360° views of the city, desert, and sea.', duration: '2 hours', rating: 4.9, price: '$40', category: 'Landmark', accentColor: 'from-blue-500 to-cyan-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a2', name: 'Desert Safari & Camp', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80', description: 'Dune bashing, camel rides, sandboarding, and a Bedouin camp dinner under the desert stars with live entertainment.', duration: 'Full day', rating: 4.8, price: '$80', category: 'Adventure', accentColor: 'from-amber-500 to-orange-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a3', name: 'Dubai Mall & Fountain Show', image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&q=80', description: 'The world\'s largest mall + the world\'s largest dancing fountain show every evening. Staggering spectacle.', duration: '4 hours', rating: 4.7, price: 'Free', category: 'Shopping', accentColor: 'from-yellow-500 to-amber-600', squadTags: ['family', 'friends', 'couple', 'solo'] },
      { id: 'a4', name: 'Aquaventure Waterpark', image: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&q=80', description: 'Atlantis\'s record-breaking waterpark with 105 rides, rapids, private beach, and an aquarium tunnel.', duration: 'Full day', rating: 4.9, price: '$90', category: 'Adventure', accentColor: 'from-blue-500 to-indigo-600', squadTags: ['family', 'friends'] },
    ],
    events: [
      { id: 'e1', name: 'Dubai Shopping Festival', category: 'Shopping', date: 'Jan–Feb', matchPercentage: 85, description: 'Massive citywide shopping festival with huge discounts, fireworks, raffles and live performances.', squadTags: ['friends', 'family', 'solo', 'couple'] },
      { id: 'e2', name: 'Dubai Food Festival', category: 'Food', date: 'Feb–Mar', matchPercentage: 88, description: 'City-wide culinary event celebrating Dubai\'s extraordinary dining scene with special menus and pop-ups.', squadTags: ['couple', 'friends', 'solo'] },
      { id: 'e3', name: 'New Year\'s Eve at Burj Khalifa', category: 'Celebration', date: 'Dec 31', matchPercentage: 97, description: 'The world\'s most spectacular New Year\'s countdown with the tallest fireworks display on Earth.', squadTags: ['friends', 'couple', 'family', 'solo'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Modern Dubai', morning: 'Burj Khalifa observation deck', afternoon: 'Dubai Mall, indoor ice rink, aquarium', evening: 'Dubai Fountain show at dusk, solo dinner at Al Fanar', icon: '🏙️' },
        { day: 2, theme: 'Desert & Heritage', morning: 'Old Dubai — spice souk and gold souk', afternoon: 'Dubai Museum and Al Fahidi heritage district', evening: 'Desert safari and Bedouin camp dinner', icon: '🐪' },
        { day: 3, theme: 'Modern Extremes', morning: 'Ski Dubai indoor slopes', afternoon: 'Palm Jumeirah monorail and The View at The Palm', evening: 'Sunset rooftop bar, tax-free shopping', icon: '🎿' },
      ],
      couple: [
        { day: 1, theme: 'Arrival & Luxury', morning: 'Check into iconic hotel, beach time', afternoon: 'Dubai Mall, afternoon tea at Burj Al Arab', evening: 'Burj Khalifa sunset + Dubai Fountain', icon: '✨' },
        { day: 2, theme: 'Desert Romance', morning: 'Private helicopter tour of the skyline', afternoon: 'Desert safari, private dune dinner', evening: 'Bedouin camp, stargazing in the Arabian Desert', icon: '🌟' },
        { day: 3, theme: 'Beach & Indulgence', morning: 'Private beach club morning', afternoon: 'Couples spa at a 5-star hotel', evening: 'Nobu dinner — sunset over the Palm', icon: '🌅' },
      ],
      friends: [
        { day: 1, theme: 'Dubai Icons', morning: 'Burj Khalifa + Dubai Frame', afternoon: 'Dubai Mall — Virtual Reality Park & Aquarium', evening: 'Rooftop bar crawl — Zero Gravity, Barasti Beach', icon: '🏗️' },
        { day: 2, theme: 'Aquaventure Day', morning: 'Atlantis Aquaventure waterpark all day', afternoon: 'Private beach at Atlantis', evening: 'Nobu dinner, then yacht party or club', icon: '💦' },
        { day: 3, theme: 'Desert & Shopping', morning: 'Group desert safari — dune bashing', afternoon: 'Dubai Mall tax-free luxury shopping', evening: 'Brunch at Saffron (Atlantis famous brunch)', icon: '🏎️' },
      ],
      family: [
        { day: 1, theme: 'Dubai Wonders', morning: 'Burj Khalifa — kids love the elevator speed', afternoon: 'Dubai Aquarium & Underwater Zoo', evening: 'Dubai Fountain show + dinner in Dubai Mall', icon: '🏙️' },
        { day: 2, theme: 'Theme Park Day', morning: 'IMG Worlds of Adventure (Marvel, Cartoon Network)', afternoon: 'More rides, Legoland preview', evening: 'Pool evening at hotel, exhausted but happy', icon: '🎡' },
        { day: 3, theme: 'Water & Desert', morning: 'Aquaventure Waterpark', afternoon: 'Afternoon desert safari — camel rides for kids', evening: 'Al Fanar Emirati dinner — kids try local food', icon: '🐫' },
      ],
    },
    aiInsight: {
      solo:    'Dubai rewards solo travelers with sheer spectacle and convenience. English is universal, the metro is world-class, everything is signposted, and the city is extraordinarily safe. The desert heritage sits quietly beneath the glass towers — finding it is the solo traveler\'s reward.',
      couple:  'Dubai stages luxury romance on an almost theatrical scale. Helicopter rides over the Palm, private beach dinners under the stars, suites in the Burj Al Arab — it\'s designed to impress at every turn. If you want a trip that feels entirely extraordinary, this is it.',
      friends: 'Dubai for friend groups is an arms race of experience. The brunches are legendary — 5-star hotel buffets with free-flow for 4 hours. The waterparks are world-record holders. The rooftop bars are vertical. The desert safaris are adrenaline. It competes with itself constantly.',
      family:  'Dubai has quietly become one of the world\'s best family destinations. IMG Worlds, Legoland, KidZania, Aquaventure, the Dubai Aquarium — every attraction is world-class and engineered for families. The city is safe, clean, and entirely set up to make children feel like the main characters.',
    },
    mapCenter: { lat: 25.2048, lng: 55.2708 },
  },

  {
    id: 'vietnam',
    name: 'Vietnam',
    flag: '🇻🇳',
    heroImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80',
    taglines: {
      solo:    'A thousand kilometers of wonder at your own pace',
      couple:  'Ancient lanterns, emerald bays, and just the two of you',
      friends: 'The best budget adventure on the planet',
      family:  'History, nature and the freshest food on Earth',
    },
    weather: { temp: '22–32°C', condition: 'Tropical', icon: '🌤️' },
    matchPercentage: 83,
    description: 'Emerald rice terraces, ancient towns, dramatic karst bays, and the world\'s best street food.',
    currency: 'VND Dong',
    language: 'Vietnamese',
    timezone: 'UTC+7',
    positives: {
      solo:    ['One of Asia\'s best solo destinations', 'Extremely affordable', 'Easy north-south train journey', 'Very safe for solo travelers', 'Incredible local food culture'],
      couple:  ['Hoi An romantic lantern-lit old town', 'Ha Long Bay private cruise', 'Quieter beaches than Thailand', 'Affordable private villa rentals', 'Beautiful countryside cycling'],
      friends: ['Insanely affordable everything', 'Motorbike road trips', 'Night market street food', 'Group cooking classes in Hoi An', 'Pub street in Hanoi and Hoi An'],
      family:  ['Very child-friendly culture', 'Fascinating history for older kids', 'Safe and gentle countryside', 'UNESCO World Heritage sites', 'Affordable luxury resorts'],
    },
    negatives: {
      solo:    ['Persistent touts in tourist areas', 'Traffic chaotic in Hanoi and HCMC', 'Scams around major tourist sites'],
      couple:  ['Rainy season flooding in some areas', 'Some beaches crowded', 'Long distances between highlights'],
      friends: ['Motorbike rental risks', 'Food safety variable at street stalls', 'Alcohol culture lower-key than elsewhere'],
      family:  ['Long journey between north and south', 'Heat can be intense', 'Some historical sites distressing for young children'],
    },
    hotels: [
      { id: 'h1', name: 'Four Seasons Nam Hai', image: 'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=600&q=80', rating: 5.0, price: '$700/night', priceLevel: 'luxury', address: 'Ha My Beach, Hoi An', amenities: ['Private Pool Villas', 'Spa', 'Cooking School', 'Beach Club'], description: 'Vietnam\'s finest resort — 100 private pool villas on a secluded beach 10 minutes from Hoi An Ancient Town.', squadTags: ['couple'] },
      { id: 'h2', name: 'Hanoi La Siesta', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 4.7, price: '$85/night', priceLevel: 'mid-range', address: 'Old Quarter, Hanoi', amenities: ['Rooftop Pool', 'Spa', 'Restaurant', 'City Views'], description: 'Beautiful boutique hotel in the heart of Hanoi\'s Old Quarter with rooftop pool overlooking the ancient streets.', squadTags: ['couple', 'solo'] },
      { id: 'h3', name: 'Hoi An Backpackers', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.5, price: '$15/night', priceLevel: 'budget', address: 'Hoi An Ancient Town', amenities: ['Pool', 'Free Bikes', 'Social Events', 'Bar'], description: 'Social party hostel in Hoi An with free bicycles, pool parties, and the legendary weekly pub quiz.', squadTags: ['friends', 'solo'] },
      { id: 'h4', name: 'Vinpearl Nha Trang', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.6, price: '$180/night', priceLevel: 'mid-range', address: 'Nha Trang Island', amenities: ['Waterpark', 'Kids Club', 'Private Island', 'Multiple Pools'], description: 'Private island family resort accessible only by cable car, with a dedicated waterpark and kids club.', squadTags: ['family'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Madam Hiên Hanoi', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.8, cuisine: 'Traditional Vietnamese', description: 'Award-winning restaurant serving perfectly executed Vietnamese classics in a beautiful French colonial setting. The pho is transcendent.', price: '$25/person', priceLevel: 'mid-range', address: 'Hoan Kiem, Hanoi', tags: ['traditional', 'award-winning', 'colonial'], squadTags: ['couple', 'solo', 'friends'] },
      { id: 'r2', name: 'Bún Bò Huế Mệ Rơi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.7, cuisine: 'Vietnamese Street Food', description: 'The definitive version of Vietnam\'s most complex noodle soup — lemongrass, shrimp paste, pork knuckle. Life-changing at $2.', price: '$2/person', priceLevel: 'budget', address: 'Hue, Central Vietnam', tags: ['street-food', 'iconic', 'authentic'], squadTags: ['friends', 'solo', 'family'] },
      { id: 'r3', name: 'Morning Glory Hoi An', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', rating: 4.7, cuisine: 'Hoi An Street Food', description: 'Hoi An\'s most beloved restaurant serving regional specialties — cao lầu, white rose dumplings, banh mi. Essential.', price: '$15/person', priceLevel: 'budget', address: 'Hoi An Ancient Town', tags: ['regional', 'must-try', 'authentic'], squadTags: ['family', 'friends', 'couple', 'solo'] },
    ],
    activities: [
      { id: 'a1', name: 'Ha Long Bay Cruise', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80', description: 'Overnight cruise through 2,000 limestone islands rising from emerald water. UNESCO World Heritage Site. Genuinely awe-inspiring.', duration: '2 days', rating: 5.0, price: '$120', category: 'Nature', accentColor: 'from-teal-500 to-cyan-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a2', name: 'Hoi An Lantern Festival', image: 'https://images.unsplash.com/photo-1540541338537-71e1d30f5e9f?w=600&q=80', description: 'Every full moon, Hoi An switches off its lights and floats thousands of lanterns on the river. Magical beyond words.', duration: '3 hours', rating: 5.0, price: 'Free', category: 'Cultural', accentColor: 'from-orange-500 to-amber-600', squadTags: ['couple', 'solo', 'friends', 'family'] },
      { id: 'a3', name: 'Hoi An Cooking Class', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', description: 'Visit the morning market, pick fresh ingredients, and cook pho, spring rolls, and banh xeo with a local chef.', duration: '4 hours', rating: 4.9, price: '$35', category: 'Food', accentColor: 'from-green-500 to-emerald-600', squadTags: ['friends', 'couple', 'family', 'solo'] },
      { id: 'a4', name: 'Motorbike Ha Giang Loop', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', description: 'The most spectacular motorbike route in Asia — 4 days through rice terraces, mountain passes, and ethnic minority villages.', duration: '4 days', rating: 5.0, price: '$60', category: 'Adventure', accentColor: 'from-red-500 to-rose-600', squadTags: ['friends', 'solo'] },
    ],
    events: [
      { id: 'e1', name: 'Tết Lunar New Year', category: 'Cultural', date: 'Jan/Feb (varies)', matchPercentage: 94, description: 'Vietnam\'s biggest celebration — fireworks, flower markets, family feasts, and temple visits across the country.', squadTags: ['family', 'couple', 'solo', 'friends'] },
      { id: 'e2', name: 'Hoi An Full Moon Lantern Festival', category: 'Cultural', date: 'Monthly', matchPercentage: 97, description: 'Monthly lantern festival when the ancient town goes dark and glows with candlelit paper lanterns on the river.', squadTags: ['couple', 'solo', 'friends', 'family'] },
      { id: 'e3', name: 'Hue Festival', category: 'Cultural', date: 'Apr/May (even years)', matchPercentage: 82, description: 'Biennial arts and cultural festival in the imperial city of Hue, with royal ceremonies and traditional performances.', squadTags: ['solo', 'couple', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Hanoi Old Quarter', morning: 'Hoan Kiem Lake at dawn, Ngoc Son Temple', afternoon: 'Old Quarter walking tour — 36 ancient streets', evening: 'Bia hoi corner — $0.25 draft beer with locals', icon: '🛵' },
        { day: 2, theme: 'Ha Long Bay', morning: 'Bus to Ha Long, board cruise ship', afternoon: 'Kayaking through limestone caves', evening: 'Sunset cocktail on the deck, seafood dinner', icon: '🚢' },
        { day: 3, theme: 'Hoi An Ancient Town', morning: 'Fly to Da Nang, cycle into Hoi An', afternoon: 'Ancient Town walking tour, lantern shopping', evening: 'Full Moon Lantern Festival on the Thu Bon River', icon: '🏮' },
      ],
      couple: [
        { day: 1, theme: 'Hanoi Charm', morning: 'Temple of Literature at dawn', afternoon: 'Old Quarter exploration and silk shopping', evening: 'Fine dining at Madam Hiên, evening walk', icon: '🌸' },
        { day: 2, theme: 'Ha Long Romance', morning: 'Private cruise boarding, champagne welcome', afternoon: 'Kayaking through hidden caves together', evening: 'Sunset tai chi on deck, private seafood dinner', icon: '🌅' },
        { day: 3, theme: 'Hoi An Together', morning: 'Cooking class — learn Vietnamese cuisine', afternoon: 'Cycle through rice fields to a secret beach', evening: 'Lantern release on the river at dusk', icon: '🏮' },
      ],
      friends: [
        { day: 1, theme: 'Hanoi Street Food', morning: 'Bun cha breakfast like Obama had here', afternoon: 'Old Quarter scooter tour', evening: 'Bia hoi corner — cheapest fun in Asia', icon: '🍜' },
        { day: 2, theme: 'Ha Long Adventure', morning: 'Ha Long Bay party cruise', afternoon: 'Cliff jumping, kayaking, swimming', evening: 'Boat party deck with cocktails and music', icon: '🏄' },
        { day: 3, theme: 'Hoi An Vibes', morning: 'Motorbike to My Son ruins', afternoon: 'Cooking class with group', evening: 'Hoi An pub street — bar crawl through the old town', icon: '🛵' },
      ],
      family: [
        { day: 1, theme: 'Hanoi Discovery', morning: 'Ho Chi Minh Mausoleum and Museum', afternoon: 'Vietnam Museum of Ethnology — hands-on for kids', evening: 'Hoan Kiem lake evening walk, street food', icon: '🏛️' },
        { day: 2, theme: 'Ha Long Bay', morning: 'Board family cruise, cabin settling', afternoon: 'Cave exploration, fishing off the boat', evening: 'Kids cook spring rolls with the ship\'s chef', icon: '🐉' },
        { day: 3, theme: 'Hoi An Family Day', morning: 'Lantern-making workshop for kids', afternoon: 'Cycle through the countryside to the rice fields', evening: 'Lantern release on the river — kids remember this forever', icon: '🏮' },
      ],
    },
    aiInsight: {
      solo:    'Vietnam is a solo traveler\'s masterpiece. The north-south train journey is one of Asia\'s great rail experiences. The bia hoi culture of Hanoi — street corner plastic chairs, 25-cent beers, instant friendships — exists nowhere else. Travel here slowly and everything reveals itself.',
      couple:  'Vietnam offers rare romantic moments that feel genuinely undiscovered. The Hoi An lantern festival at full moon, a private Ha Long Bay cruise through morning mist, cycling to a secret beach — these aren\'t Instagram constructs, they\'re real. Vietnam for couples is quietly extraordinary.',
      friends: 'Vietnam is the benchmark budget group trip. Ha Long Bay party boats. Motorbike loops through the mountains. Street food for $1 per meal. Cooking classes in Hoi An. The Ha Giang Loop. Pub Street. At $40/day everything included, it\'s the trip that ruins other trips.',
      family:  'Vietnam is endlessly fascinating for children — the lantern festivals, the Ha Long karsts, the street food variety, the friendly locals, the living history. The country rewards curious young minds and produces memories that last a lifetime. Costs are low enough that splurging on quality experiences is easy.',
    },
    mapCenter: { lat: 21.0285, lng: 105.8542 },
  },

  {
    id: 'india',
    name: 'India',
    flag: '🇮🇳',
    heroImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80',
    taglines: {
      solo:    'The journey that changes you forever',
      couple:  'The Taj Mahal, Rajasthan, and a love story',
      friends: 'Colors, chaos, and the greatest adventure',
      family:  'Wildlife, palaces and a world of wonder',
    },
    weather: { temp: '18–35°C', condition: 'Varied by Region', icon: '🌤️' },
    matchPercentage: 78,
    description: 'Ancient temples, Mughal palaces, Himalayan peaks, tropical beaches, and the world\'s most vibrant culture.',
    currency: '₹ Rupee',
    language: 'Hindi/English',
    timezone: 'UTC+5:30',
    positives: {
      solo:    ['Incredibly diverse country to explore', 'Very affordable for solo travelers', 'Yoga and meditation retreats in Rishikesh', 'Rich philosophical and spiritual culture', 'World-class street food'],
      couple:  ['Taj Mahal — the ultimate romantic monument', 'Rajasthan palace hotels', 'Kerala houseboat romance', 'Vibrant wedding culture to witness', 'Private Ranthambore safari'],
      friends: ['Holi festival — world\'s most colorful celebration', 'Affordable group travel', 'Goa beaches and parties', 'Himalayan trekking', 'Train journeys through incredible landscapes'],
      family:  ['Tiger safaris in national parks', 'Incredible wildlife diversity', 'Elephant experiences (ethical)', 'Rich storytelling and mythology for kids', 'Budget-friendly family travel'],
    },
    negatives: {
      solo:    ['Solo women face safety concerns in some areas', 'Very intense for first-time travelers', 'Air pollution in Delhi and major cities'],
      couple:  ['Public displays of affection discouraged', 'Stomach issues common if not careful', 'Travel distances very large'],
      friends: ['Group logistics complex', 'Goa expensive by Indian standards', 'Holi festival can be overwhelming'],
      family:  ['Delhi air pollution hard on children', 'Stomach bugs a real risk', 'Heat in summer extreme and dangerous'],
    },
    hotels: [
      { id: 'h1', name: 'Taj Lake Palace Udaipur', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 5.0, price: '$600/night', priceLevel: 'luxury', address: 'Lake Pichola, Udaipur', amenities: ['Lake Views', 'Floating Palace', 'Royal Spa', 'Boat Transfer Only'], description: 'A marble palace floating in the middle of a lake, accessible only by boat. The most dramatic hotel setting in the world.', squadTags: ['couple'] },
      { id: 'h2', name: 'The Leela Palace Delhi', image: 'https://images.unsplash.com/photo-1551882547-ff40c4a49ce7?w=600&q=80', rating: 4.9, price: '$300/night', priceLevel: 'luxury', address: 'Diplomatic Enclave, New Delhi', amenities: ['Spa', 'Multiple Restaurants', 'Pool', 'Butler Service'], description: 'India\'s finest luxury hotel in the heart of diplomatic Delhi. Mughal architecture meets modern indulgence.', squadTags: ['couple', 'solo'] },
      { id: 'h3', name: 'Zostel Jaipur', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.5, price: '$8/night', priceLevel: 'budget', address: 'Pink City, Jaipur', amenities: ['Rooftop Lounge', 'Social Events', 'Local Tours', 'Bike Rental'], description: 'India\'s best hostel chain — social, safe, and beautifully designed. The rooftop view of the Pink City is stunning.', squadTags: ['friends', 'solo'] },
      { id: 'h4', name: 'Taj Exotica Goa', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.7, price: '$250/night', priceLevel: 'luxury', address: 'Benaulim Beach, South Goa', amenities: ['Private Beach', 'Kids Club', 'Pool', 'Water Sports'], description: 'South Goa\'s most elegant family resort on a quiet beach, away from the party crowds. Perfect for families.', squadTags: ['family', 'couple'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Indian Accent Delhi', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.9, cuisine: 'Modern Indian', description: 'Asia\'s best Indian restaurant — traditional recipes reimagined with global technique. Duck khurchan, meetha achar martini.', price: '$80/person', priceLevel: 'luxury', address: 'The Lodhi, New Delhi', tags: ['fine-dining', 'creative', 'award-winning'], squadTags: ['couple', 'solo'] },
      { id: 'r2', name: 'Karim\'s Old Delhi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.8, cuisine: 'Mughal', description: 'Legendary Old Delhi institution since 1913 near Jama Masjid. The nihari and seekh kebabs are 100-year-old recipes. Extraordinary.', price: '$6/person', priceLevel: 'budget', address: 'Jama Masjid, Old Delhi', tags: ['historic', 'mughal', 'iconic'], squadTags: ['friends', 'solo', 'family'] },
      { id: 'r3', name: 'Swaswara Goa', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', rating: 4.7, cuisine: 'Konkani & Ayurvedic', description: 'Wellness resort restaurant serving Konkani coastal cuisine and Ayurvedic meals. Fresh fish, coconut curries, toddy vinegar.', price: '$30/person', priceLevel: 'mid-range', address: 'Om Beach, Gokarna, Goa', tags: ['wellness', 'coastal', 'authentic'], squadTags: ['solo', 'couple'] },
    ],
    activities: [
      { id: 'a1', name: 'Taj Mahal Sunrise Visit', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80', description: 'Watch the Taj Mahal materialize from morning mist at sunrise — the most beautiful building ever constructed by human hands.', duration: '3 hours', rating: 5.0, price: '$15', category: 'Culture', accentColor: 'from-amber-500 to-orange-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a2', name: 'Ranthambore Tiger Safari', image: 'https://images.unsplash.com/photo-1551522435-a13afa10f103?w=600&q=80', description: 'Jeep safari into one of India\'s best tiger reserves. India has the world\'s largest wild tiger population.', duration: '4 hours', rating: 4.9, price: '$50', category: 'Nature', accentColor: 'from-orange-500 to-red-600', squadTags: ['family', 'couple', 'solo', 'friends'] },
      { id: 'a3', name: 'Holi Festival Vrindavan', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80', description: 'The original Holi celebration in the birthplace of Krishna — the most colorful, joyful, overwhelming day of your life.', duration: 'Full day', rating: 5.0, price: '$10', category: 'Festival', accentColor: 'from-pink-500 to-purple-600', squadTags: ['friends', 'solo', 'couple'] },
      { id: 'a4', name: 'Kerala Houseboat Cruise', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', description: 'Sleep on a traditional Kerala kettuvallam boat drifting through the backwater canals lined with palms and paddy fields.', duration: '2 days', rating: 4.9, price: '$80', category: 'Nature', accentColor: 'from-green-500 to-teal-600', squadTags: ['couple', 'solo', 'family'] },
      { id: 'a5', name: 'Varanasi Ganga Aarti', image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600&q=80', description: 'Witness the ancient evening fire ritual on the ghats of the Ganges — one of the most spiritually intense experiences on Earth.', duration: '2 hours', rating: 5.0, price: 'Free', category: 'Spiritual', accentColor: 'from-yellow-500 to-orange-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
    ],
    events: [
      { id: 'e1', name: 'Diwali Festival of Lights', category: 'Cultural', date: 'Oct/Nov (varies)', matchPercentage: 95, description: 'India\'s most spectacular celebration — a billion lights, fireworks for days, and the sweetest sweets on Earth.', squadTags: ['family', 'couple', 'solo', 'friends'] },
      { id: 'e2', name: 'Holi Color Festival', category: 'Festival', date: 'Mar (varies)', matchPercentage: 97, description: 'The world\'s most joyful festival — colored powder, water guns, music, dancing, absolute chaos and pure happiness.', squadTags: ['friends', 'couple', 'solo', 'family'] },
      { id: 'e3', name: 'Pushkar Camel Fair', category: 'Cultural', date: 'Nov (varies)', matchPercentage: 88, description: 'The world\'s largest camel fair — 50,000 camels, traders, musicians, and pilgrims at a sacred desert lake.', squadTags: ['solo', 'couple', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Delhi Introduction', morning: 'Old Delhi — Red Fort, Jama Masjid, Chandni Chowk spice market', afternoon: 'Humayun\'s Tomb and Lodhi Garden', evening: 'Karim\'s dinner, then chai on the rooftop', icon: '🕌' },
        { day: 2, theme: 'Agra & the Taj', morning: 'Train to Agra, Taj Mahal at opening hour', afternoon: 'Agra Fort and Mehtab Bagh garden across the river', evening: 'Return train to Delhi, reflect', icon: '🕌' },
        { day: 3, theme: 'Varanasi Soul', morning: 'Dawn boat on the Ganges — ghats at sunrise', afternoon: 'Kashi Vishwanath Temple, narrow lane exploration', evening: 'Ganga Aarti fire ceremony at dusk — unforgettable', icon: '🔥' },
      ],
      couple: [
        { day: 1, theme: 'Taj Mahal', morning: 'Taj Mahal at sunrise — arrive before gates open', afternoon: 'Agra Fort, then Mehtab Bagh sunset view across the river', evening: 'Rooftop dinner watching the Taj glow at dusk', icon: '💞' },
        { day: 2, theme: 'Udaipur Palace', morning: 'Fly to Udaipur, boat transfer to Lake Palace', afternoon: 'City Palace exploration', evening: 'Rooftop dinner over Lake Pichola with sunset and candles', icon: '🛕' },
        { day: 3, theme: 'Kerala Romance', morning: 'Fly to Kochi, board houseboat', afternoon: 'Drift through backwaters, watch village life unfold', evening: 'Ayurvedic couples massage, starlight on the water', icon: '🌴' },
      ],
      friends: [
        { day: 1, theme: 'Delhi Food & History', morning: 'Old Delhi food tour — jalebi, paratha, lassi, kebabs', afternoon: 'Qutub Minar and Humayun\'s Tomb', evening: 'Hauz Khas Village — rooftop bars, DJs, street art', icon: '🍛' },
        { day: 2, theme: 'Holi Festival', morning: 'Travel to Mathura/Vrindavan for Holi', afternoon: 'The most colorful afternoon of your lives', evening: 'Clean up (eventually), celebrate, street food feast', icon: '🎨' },
        { day: 3, theme: 'Jaipur Pink City', morning: 'Amber Fort elephant road', afternoon: 'Hawa Mahal, City Palace, bazaar shopping', evening: 'Rooftop dinner with view, traditional Rajasthani folk music', icon: '🐘' },
      ],
      family: [
        { day: 1, theme: 'Taj Mahal', morning: 'Taj Mahal family visit — kids photograph it endlessly', afternoon: 'Agra Fort — Mughal history comes alive', evening: 'Agra street food tour — kids try everything', icon: '🏯' },
        { day: 2, theme: 'Tiger Safari', morning: 'Ranthambore National Park tiger jeep safari', afternoon: 'Afternoon safari — spot leopards, sloth bears, crocodiles', evening: 'Wildlife documentary then camp dinner', icon: '🐯' },
        { day: 3, theme: 'Jaipur Elephants', morning: 'Amber Fort entry via elephant (if ethical option available)', afternoon: 'Jaipur City Palace museum — kids love the armor and weapons', evening: 'Puppet show and Rajasthani thali dinner', icon: '🐘' },
      ],
    },
    aiInsight: {
      solo:    'India is the solo traveler\'s ultimate challenge and greatest reward. It overwhelms every sense simultaneously — the chaos, the color, the spiritual intensity, the extraordinary food. It also offers the deepest personal transformations: a Varanasi dawn, a Himalayan meditation retreat, the silence of a palace at 6am.',
      couple:  'India\'s romantic credentials are ancient — the Taj Mahal was literally built as a monument to love. Udaipur\'s lake palace hotels, Kerala\'s houseboat drifting through palms, Rajasthan\'s painted havelis at golden hour — India stages romance on an epic, historic scale.',
      friends: 'India with friends is controlled magnificent chaos. Holi in Vrindavan. A train journey through Rajasthan. Street food in Old Delhi at midnight. Tiger safaris in the morning. The sheer volume of extraordinary experiences at almost no cost makes it the group trip that gets referenced forever.',
      family:  'India reveals the world\'s diversity to children in the most vivid, sensory way imaginable. Tiger safaris, elephant encounters, the Taj Mahal, Diwali fireworks, temple monkeys, snake charmers — India hands children a living encyclopedia and makes it unforgettable. Travel here young.',
    },
    mapCenter: { lat: 20.5937, lng: 78.9629 },
  },

  {
    id: 'bali',
    name: 'Bali',
    flag: '🇮🇩',
    heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80',
    taglines: {
      solo:    'Find your balance in the Island of the Gods',
      couple:  'Paradise found, together',
      friends: 'The group trip that changes everything',
      family:  'Where the whole family falls in love',
    },
    weather: { temp: '26–32°C', condition: 'Tropical & Lush', icon: '🌴' },
    matchPercentage: 88,
    description: 'Rice terraces, temple ceremonies, world-class surf, and spiritual serenity.',
    currency: 'Rp Rupiah',
    language: 'Balinese/Indonesian',
    timezone: 'UTC+8',
    positives: {
      solo:    ['Top solo travel destination', 'Yoga & wellness retreats in Ubud', 'Very affordable', 'Welcoming expat community', 'Easy scooter travel'],
      couple:  ['Romantic jungle cliff villas', 'Private waterfall pools', 'Couples spa rituals', 'Sunset at Tanah Lot', 'Private beach dinners'],
      friends: ['Famous party scene in Seminyak', 'Group villa rentals with pool', 'Surfing lessons', 'Affordable massages everywhere', 'Sunset beach clubs'],
      family:  ['Very safe and family-friendly', 'Warm calm waters in the south', 'Waterbom Bali (Asia\'s best waterpark)', 'Cultural performances for kids', 'Monkeys! Rice terraces! Temples!'],
    },
    negatives: {
      solo:    ['Can be lonely in off-peak season', 'Traffic in Kuta/Seminyak', 'Some areas heavily touristed'],
      couple:  ['Some areas rowdy (Kuta)', 'Rainy season Oct-April', 'Dress codes at temples everywhere'],
      friends: ['Party scene can overwhelm non-partiers', 'Touts at beaches', 'Traffic jams'],
      family:  ['Temple rules strict with children', 'Mosquitoes', 'Jellyfish at certain beaches'],
    },
    hotels: [
      { id: 'h1', name: 'Four Seasons Sayan', image: 'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=600&q=80', rating: 5.0, price: '$900/night', priceLevel: 'luxury', address: 'Ayung River Valley, Ubud', amenities: ['Infinity Pool', 'Jungle Spa', 'Yoga Pavilion', 'Cooking Class'], description: 'Suspended above the Ayung River gorge. Voted World\'s Best Resort. The jungle views are beyond words.', squadTags: ['couple', 'solo'] },
      { id: 'h2', name: 'Seminyak Villa Ohana', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80', rating: 4.7, price: '$250/night', priceLevel: 'luxury', address: 'Seminyak, Bali', amenities: ['Private Pool', '4 Bedrooms', 'Chef Included', 'Beach Access'], description: 'Private 4-bedroom villa with infinity pool, personal chef, and a 5-minute walk to Seminyak Beach.', squadTags: ['friends', 'family'] },
      { id: 'h3', name: 'Kabak Bali Ubud Hostel', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.5, price: '$18/night', priceLevel: 'budget', address: 'Ubud, Bali', amenities: ['Rice Field Views', 'Yoga Classes', 'Café', 'Scooter Rental'], description: 'The ultimate solo traveler retreat overlooking emerald rice paddies in Ubud.', squadTags: ['solo', 'friends'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Mozaic Ubud', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.9, cuisine: 'French-Balinese', description: 'Garden fine dining by James Beard-nominated chef Chris Salans. Firefly-lit tropical garden setting.', price: '$120/person', priceLevel: 'luxury', address: 'Ubud, Bali', tags: ['romantic', 'garden', 'fine-dining'], squadTags: ['couple', 'solo'] },
      { id: 'r2', name: 'Warung Babi Guling Ibu Oka', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.8, cuisine: 'Balinese', description: 'The legendary suckling pig warung made famous by Anthony Bourdain. Queue early — it sells out by noon.', price: '$8/person', priceLevel: 'budget', address: 'Ubud, Bali', tags: ['iconic', 'authentic', 'street-food'], squadTags: ['friends', 'solo', 'family'] },
    ],
    activities: [
      { id: 'a1', name: 'Tegalalang Rice Terrace', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', description: 'Walk through ancient UNESCO-listed rice terraces that cascade down the hillside in perfect emerald layers.', duration: '2 hours', rating: 4.8, price: '$3 donation', category: 'Nature', accentColor: 'from-green-500 to-emerald-600', squadTags: ['solo', 'couple', 'family', 'friends'] },
      { id: 'a2', name: 'Ubud Yoga Retreat', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80', description: 'Join a morning yoga class overlooking the jungle at one of Ubud\'s world-famous studios.', duration: '2 hours', rating: 4.9, price: '$20', category: 'Wellness', accentColor: 'from-purple-500 to-violet-600', squadTags: ['solo', 'couple', 'friends'] },
      { id: 'a3', name: 'Waterbom Bali', image: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&q=80', description: 'Voted Asia\'s best waterpark. 16 thrilling slides in a tropical garden setting.', duration: 'Full day', rating: 4.8, price: '$40', category: 'Adventure', accentColor: 'from-blue-500 to-cyan-600', squadTags: ['family', 'friends'] },
      { id: 'a4', name: 'Uluwatu Surf Lessons', image: 'https://images.unsplash.com/photo-1504680177321-2e6a879d3e91?w=600&q=80', description: 'Learn to surf at Bali\'s most iconic break. Lessons for beginners on the white sand beach.', duration: '3 hours', rating: 4.7, price: '$35', category: 'Sport', accentColor: 'from-orange-500 to-amber-600', squadTags: ['friends', 'solo', 'couple'] },
      { id: 'a5', name: 'Tanah Lot Sunset Temple', image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80', description: 'Watch the sun set behind the sea temple perched on a dramatic rock formation. Possibly Bali\'s most iconic view.', duration: '2 hours', rating: 4.9, price: '$5', category: 'Culture', accentColor: 'from-orange-500 to-red-600', squadTags: ['couple', 'solo', 'family', 'friends'] },
    ],
    events: [
      { id: 'e1', name: 'Nyepi Day of Silence', category: 'Cultural', date: 'Mar (varies)', matchPercentage: 90, description: 'Bali\'s most unique event — the entire island goes completely silent and dark for 24 hours.', squadTags: ['solo', 'couple'] },
      { id: 'e2', name: 'Kuta Carnival', category: 'Festival', date: 'Sep', matchPercentage: 82, description: 'Beach festival with international music, watersports, and food. Vibrant and social.', squadTags: ['friends', 'family'] },
      { id: 'e3', name: 'Bali Spirit Festival', category: 'Wellness', date: 'Apr', matchPercentage: 88, description: 'World\'s premier yoga and wellness festival in Ubud. 100+ classes over 5 days.', squadTags: ['solo', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Ubud Soul', morning: 'Dawn yoga overlooking rice terraces', afternoon: 'Tegalalang Rice Terrace walk', evening: 'Solo dinner at Mozaic garden restaurant', icon: '🧘' },
        { day: 2, theme: 'Temple Hopping', morning: 'Tirta Empul holy spring purification ceremony', afternoon: 'Goa Gajah Elephant Cave temple', evening: 'Kecak fire dance performance at Uluwatu', icon: '🛕' },
        { day: 3, theme: 'Wellness Day', morning: ' 2-hour traditional Balinese massage', afternoon: 'Cooking class — learn tempeh and sambal', evening: 'Warung Babi Guling dinner, then stargazing', icon: '🌿' },
      ],
      couple: [
        { day: 1, theme: 'Jungle Romance', morning: 'Private waterfall hike to Sekumpul Falls', afternoon: 'Check into cliff jungle villa (Four Seasons)', evening: 'Private candlelit dinner on the villa terrace', icon: '💚' },
        { day: 2, theme: 'Ubud Intimacy', morning: 'Couples balinese massage at a spa', afternoon: 'Tegalalang rice terraces, then cooking class', evening: 'Sunset at Tanah Lot temple', icon: '🌅' },
        { day: 3, theme: 'Beach Escape', morning: 'Drive to Seminyak or Jimbaran beach', afternoon: 'Private beachside lunch', evening: 'Seafood BBQ dinner on the Jimbaran beach at sunset', icon: '🏖️' },
      ],
      friends: [
        { day: 1, theme: 'Arrival Vibes', morning: 'Villa check-in, pool day in Seminyak', afternoon: 'Explore Seminyak boutiques and beach', evening: 'Potato Head Beach Club sunset party', icon: '🎉' },
        { day: 2, theme: 'Adventure Day', morning: 'Group surf lessons in Uluwatu', afternoon: 'Cliff-top lunch at Single Fin', evening: 'Tegalalang swing at golden hour + dinner', icon: '🏄' },
        { day: 3, theme: 'Culture & Party', morning: 'Ubud Monkey Forest + rice terraces', afternoon: 'Balinese cooking class at the villa', evening: 'Ku De Ta beach club — drinks, music, vibes', icon: '🐒' },
      ],
      family: [
        { day: 1, theme: 'Waterbom Day', morning: 'Waterbom Bali — Asia\'s best waterpark', afternoon: 'More slides and the lazy river', evening: 'Casual family warungs dinner', icon: '💦' },
        { day: 2, theme: 'Temple & Nature', morning: 'Tanah Lot sunset temple visit', afternoon: 'Tegalalang rice terraces — kids love the Instagram swings', evening: 'Family dance show at a Ubud stage', icon: '🌾' },
        { day: 3, theme: 'Animal Magic', morning: 'Bali Safari & Marine Park', afternoon: 'Monkey Forest in Ubud (supervised!)', evening: 'Farewell feast of Babi Guling and sate lilit', icon: '🦁' },
      ],
    },
    aiInsight: {
      solo:    'Bali has built an entire economy around the solo traveler\'s soul search. The yoga retreats of Ubud, the spiritual ceremonies, the motorcycle roads through rice paddies — all of it conspires to give you exactly the quiet adventure and internal reset that solo travel is for.',
      couple:  'Bali\'s private cliff villas, jungle waterfalls, and endless spa offerings create a deeply intimate setting. The island\'s spiritual culture adds depth — the Balinese belief that love is sacred makes every romantic gesture feel meaningful here.',
      friends: 'Bali for friends is the group trip benchmark. Private villa with pool and chef? $250/night split four ways. Surfing lessons in the morning, sunset beach clubs in the evening, cooking class at the villa — it\'s impossible to have a bad day.',
      family:  'Bali is one of Asia\'s best family destinations. The people genuinely love children, the waterpark is world-class, the temples are dramatic and fascinating, the beaches safe, and the rice terraces are unlike anything kids have ever seen. The magic is real.',
    },
    mapCenter: { lat: -8.3405, lng: 115.0920 },
  },

  // Maldives
  {
    id: 'maldives',
    name: 'Maldives',
    flag: '🇲🇻',
    heroImage: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80',
    taglines: {
      solo:    'Your private ocean sanctuary',
      couple:  'The world\'s most romantic overwater escape',
      friends: 'Luxury diving paradise',
      family:  'Pristine beaches, perfect family serenity',
    },
    weather: { temp: '30°C', condition: 'Sunny & warm', icon: '☀️' },
    matchPercentage: 96,
    description: 'The Maldives is a dreamscape of 1,200 coral islands scattered across the Indian Ocean. Overwater bungalows, bioluminescent beaches, house reefs teeming with marine life, and crystal-clear lagoons make this the definitive luxury beach escape.',
    currency: 'MVR (Maldivian Rufiyaa)',
    language: 'Dhivehi, English',
    timezone: 'UTC+5',
    positives: {
      solo:    ['Absolute seclusion and reflection', 'World-class snorkeling solo', 'Luxury at your own pace', 'Stunning sunrise meditations'],
      couple:  ['Most romantic destination on Earth', 'Overwater villa with glass floor', 'Private sunset cruises', 'Couple spa rituals', 'Total privacy'],
      friends: ['Elite diving experiences', 'Water sports paradise', 'Incredible marine biodiversity', 'Remote island hopping'],
      family:  ['Safe shallow lagoons for kids', 'Marine biology experiences', 'All-inclusive resorts', 'Snorkeling for all ages'],
    },
    negatives: {
      solo:    ['Expensive for solo travel', 'Resort-island isolation', 'Limited cultural immersion', 'Difficult to meet other travelers'],
      couple:  ['Very expensive', 'Long flight connections', 'Limited nightlife', 'Remote from other destinations'],
      friends: ['Budget-unfriendly', 'Limited party/nightlife scene', 'Few options outside resorts', 'Mostly couples-focused'],
      family:  ['Very high cost', 'Water safety vigilance needed', 'Limited activities beyond beach', 'Remote emergency services'],
    },
    hotels: [
      { id: 'soneva-fushi', name: 'Soneva Fushi', image: 'https://images.unsplash.com/photo-1602002418082-dd4a3f5f1e4e?w=600&q=80', rating: 4.9, price: '$1,800/night', priceLevel: 'luxury', address: 'Kunfunadhoo Island, Baa Atoll', amenities: ['Private pool', 'Overwater observatory', 'Barefoot dining', 'House reef', 'Private beach'], description: 'Barefoot luxury redefined — castaway chic with Michelin-star dining and a private house reef.', squadTags: ['couple', 'solo'] },
      { id: 'gili-lankanfushi', name: 'Gili Lankanfushi', image: 'https://images.unsplash.com/photo-1540202404-d0c7fe46a087?w=600&q=80', rating: 4.8, price: '$1,400/night', priceLevel: 'luxury', address: 'North Malé Atoll', amenities: ['Overwater villa', 'Spa', 'Yoga pavilion', 'No news, no shoes policy'], description: 'The ultimate no-shoes, no-news policy resort with stunning overwater villas.', squadTags: ['couple', 'friends'] },
      { id: 'four-seasons-landaa', name: 'Four Seasons Landaa Giraavaru', image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80', rating: 4.8, price: '$1,600/night', priceLevel: 'luxury', address: 'Baa Atoll UNESCO Biosphere', amenities: ['Marine biology team', 'Overwater bungalows', 'Kids club', 'Multiple pools'], description: 'Set in a UNESCO Biosphere Reserve with world-class marine conservation and family programs.', squadTags: ['family', 'couple'] },
      { id: 'kandima', name: 'Kandima Maldives', image: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=600&q=80', rating: 4.5, price: '$520/night', priceLevel: 'mid-range', address: 'Dhaalu Atoll', amenities: ['Multiple pools', 'Water sports', 'Artist studio', 'Dive center'], description: 'A lifestyle smart resort with a playful vibe — the most accessible luxury in the Maldives.', squadTags: ['friends', 'family'] },
    ],
    restaurants: [
      { id: 'ithaa', name: 'Ithaa Undersea Restaurant', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.8, cuisine: 'Contemporary', description: 'Dine 5 meters below sea level surrounded by a 270-degree panoramic view of the coral garden.', price: '$$$$$', priceLevel: 'luxury', address: 'Conrad Maldives Rangali Island', tags: ['underwater', 'romantic', 'iconic'], squadTags: ['couple', 'solo'] },
      { id: 'you-and-me', name: 'You & Me Restaurant', image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=600&q=80', rating: 4.7, cuisine: 'International', description: 'Adults-only dining on a private sandbank with butler service as the sun sets over the Indian Ocean.', price: '$$$$', priceLevel: 'luxury', address: 'Hudhuranfushi, North Malé Atoll', tags: ['sunset', 'couples', 'private'], squadTags: ['couple'] },
      { id: 'seagull-cafe', name: 'Seagull Café House', image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&q=80', rating: 4.3, cuisine: 'Maldivian', description: 'The best local Maldivian food in Malé — mas huni, rihaakuru, and fresh tuna curries.', price: '$', priceLevel: 'budget', address: 'Malé City', tags: ['local', 'authentic', 'budget'], squadTags: ['solo', 'friends', 'family'] },
    ],
    activities: [
      { id: 'snorkeling-biosphere', name: 'Baa Atoll Snorkeling', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80', description: 'Snorkel with manta rays and whale sharks in the UNESCO Baa Atoll Biosphere Reserve.', duration: '3-4 hours', rating: 4.9, price: '$80', category: 'Water Sports', accentColor: '#0EA5E9', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'overwater-sunset', name: 'Sunset Dolphin Cruise', image: 'https://images.unsplash.com/photo-1540202404-d0c7fe46a087?w=600&q=80', description: 'Traditional dhoni cruise at sunset with spinner dolphins playing in the bow wave.', duration: '2 hours', rating: 4.8, price: '$60', category: 'Nature', accentColor: '#F97316', squadTags: ['couple', 'family', 'friends'] },
      { id: 'scuba-diving', name: 'PADI Scuba Diving', image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=600&q=80', description: 'Dive through cathedral caves, shark nurseries, and technicolor coral walls.', duration: 'Half day', rating: 4.9, price: '$120', category: 'Adventure', accentColor: '#0EA5E9', squadTags: ['solo', 'friends', 'couple'] },
      { id: 'bioluminescence', name: 'Bioluminescent Beach Walk', image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80', description: 'Walk Vaadhoo Island\'s glowing beach at night as phytoplankton light up with each footstep.', duration: '1.5 hours', rating: 4.9, price: '$40', category: 'Nature', accentColor: '#6366F1', squadTags: ['couple', 'solo', 'friends'] },
      { id: 'fishing-trip', name: 'Traditional Night Fishing', image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&q=80', description: 'Join local fishermen for a traditional line fishing trip under a canopy of stars.', duration: '2-3 hours', rating: 4.6, price: '$50', category: 'Culture', accentColor: '#10B981', squadTags: ['family', 'solo', 'friends'] },
    ],
    events: [
      { id: 'maldives-whale-shark', name: 'Whale Shark Season', category: 'Nature', date: 'Oct–Nov', matchPercentage: 97, description: 'South Ari Atoll becomes a congregation point for whale sharks — encounter up to 20 in a single dive.', squadTags: ['solo', 'friends', 'couple'] },
      { id: 'maldives-new-year', name: 'New Year\'s at the Overwater Villa', category: 'Celebration', date: 'Dec 31', matchPercentage: 90, description: 'Ring in the New Year with private villa fireworks and a champagne dinner above the lagoon.', squadTags: ['couple', 'friends'] },
      { id: 'ramadan-maldives', name: 'Ramadan Night Markets', category: 'Culture', date: 'Mar–Apr', matchPercentage: 75, description: 'Experience Malé\'s vibrant street food culture during the Ramadan iftar evening markets.', squadTags: ['solo', 'family'] },
      { id: 'maldives-surfing', name: 'Sultans Surf Season', category: 'Sport', date: 'Mar–Sep', matchPercentage: 88, description: 'The Maldives has world-class reef breaks — Sultans and Honky\'s are legendary on the surf circuit.', squadTags: ['solo', 'friends'] },
      { id: 'maldives-underwater-fest', name: 'Underwater Photography Festival', category: 'Art', date: 'Nov', matchPercentage: 85, description: 'Annual gathering of the world\'s best underwater photographers competing across Maldivian atolls.', squadTags: ['solo', 'couple'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Arrival & Reef Immersion', morning: 'Seaplane to private island resort', afternoon: 'Snorkel the house reef solo at your own pace', evening: 'Sunset from your overwater deck', icon: '🌊' },
        { day: 2, theme: 'Dive Day', morning: 'PADI dive briefing and two-tank morning dive', afternoon: 'Free afternoon — hammock and ocean reading', evening: 'Solo dinner at the beach restaurant', icon: '🤿' },
        { day: 3, theme: 'Island Escape', morning: 'Kayak to a sandbank and meditate alone', afternoon: 'Manta ray snorkeling in Baa Atoll', evening: 'Bioluminescent beach walk at Vaadhoo', icon: '✨' },
      ],
      couple: [
        { day: 1, theme: 'Overwater Welcome', morning: 'Seaplane arrival to overwater villa', afternoon: 'Private plunge pool and in-room dining', evening: 'Sunset dhoni cruise with champagne', icon: '🥂' },
        { day: 2, theme: 'Underwater World', morning: 'Guided snorkeling with manta rays', afternoon: 'Couple\'s spa with ocean view treatment rooms', evening: 'Private sandbank dinner under the stars', icon: '💆' },
        { day: 3, theme: 'Seclusion & Bliss', morning: 'Yoga on the deck at sunrise', afternoon: 'Final reef swim from the overwater ladder', evening: 'Farewell candlelit dinner at Ithaa', icon: '🕯️' },
      ],
      friends: [
        { day: 1, theme: 'Resort Base Camp', morning: 'Fast boat to Kandima for friends\' check-in', afternoon: 'Jet ski rental and wakeboarding session', evening: 'Rooftop bar sunset session', icon: '🏄' },
        { day: 2, theme: 'Dive Expedition', morning: 'Full-day dive trip to outer atolls', afternoon: 'Shark Point and coral wall highlights', evening: 'Live DJ night at the beach club', icon: '🎵' },
        { day: 3, theme: 'Island Hop', morning: 'Speed boat to local inhabited island', afternoon: 'Explore Malé fish market and tea houses', evening: 'Night fishing with local crew', icon: '🐟' },
      ],
      family: [
        { day: 1, theme: 'Paradise Landing', morning: 'Speedboat to family resort on North Malé Atoll', afternoon: 'Kids discover the lagoon and shallow reef', evening: 'Family barbeque on the beach', icon: '🌴' },
        { day: 2, theme: 'Marine Discovery', morning: 'Family snorkeling with marine biologist guide', afternoon: 'Kids\' glass-bottom boat to coral garden', evening: 'Stargazing session from the jetty', icon: '🐠' },
        { day: 3, theme: 'Culture & Sand', morning: 'Dolphin watching sunrise cruise', afternoon: 'Visit inhabited island and local school', evening: 'Farewell feast on private sandbank', icon: '🐬' },
      ],
    },
    aiInsight: {
      solo:    'The Maldives rewards the solo traveler willing to pay for solitude. You get the reef to yourself at dawn, your own deck at sunset, and a silence so total it resets something deep. The luxury wraps around you without requiring anyone else.',
      couple:  'No destination on Earth matches the Maldives for pure romantic impact. The overwater villa, the glass floor above a coral garden, the private sandbank dinner — it\'s not just travel, it\'s the setting for life\'s most significant moments.',
      friends: 'For a group that wants world-class diving, water sports, and a resort base that feels like a private island — the Maldives delivers. Split the cost of a villa and it becomes surprisingly doable. The diving alone justifies the flight.',
      family:  'The Maldives gives families something rare: absolute beauty with complete safety. The shallow lagoons are natural paddling pools, the marine life is educational magic, and the all-inclusive resorts mean no logistics stress.',
    },
    mapCenter: { lat: 3.2028, lng: 73.2207 },
  },

  // Switzerland
  {
    id: 'switzerland',
    name: 'Switzerland',
    flag: '🇨🇭',
    heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80',
    taglines: {
      solo:    'Alpine trails, cheese trains, and ultimate precision',
      couple:  'Europe\'s most stunning mountain romance',
      friends: 'Ski season and scenic rail adventures',
      family:  'A living storybook of mountains and lakes',
    },
    weather: { temp: '12°C', condition: 'Alpine & crisp', icon: '🏔️' },
    matchPercentage: 91,
    description: 'Switzerland is where the Alps reach their most dramatic — Matterhorn, Jungfrau, the Eiger — flanked by pristine lakes and precision-engineered train networks that make every journey a scenic event. The country is expensive but delivers flawlessly.',
    currency: 'CHF (Swiss Franc)',
    language: 'German, French, Italian, Romansh',
    timezone: 'UTC+1 (CET)',
    positives: {
      solo:    ['Exceptional hiking trails', 'Ultra-safe and efficient', 'Swiss Pass unlocks everything', 'World-class museums in Zurich/Basel', 'Self-reliant travel made easy'],
      couple:  ['Fairytale mountain villages', 'Gondola rides above the clouds', 'Intimate lakeside restaurants', 'Chocolate and fondue romance', 'Luxury spa hotels'],
      friends: ['World-class ski resorts: Verbier, Zermatt, St. Moritz', 'Glacier Express rail adventure', 'Swiss craft beer scene', 'Active outdoor adventures'],
      family:  ['Child-friendly on every level', 'Cogwheel trains kids adore', 'Chocolate factory tours', 'Safe and clean everywhere', 'Excellent hiking for all abilities'],
    },
    negatives: {
      solo:    ['One of Europe\'s most expensive countries', 'Limited nightlife', 'Very quiet after 10pm in villages', 'Language changes by region'],
      couple:  ['High cost for dining and hotels', 'Weather unreliable in spring', 'Less beach/warmth', 'Quiet atmosphere may feel slow'],
      friends: ['Extremely expensive nightlife', 'Ski season requires significant budget', 'Not a party destination', 'Limited budget options'],
      family:  ['Very expensive overall', 'Young children may tire of train travel', 'Summer crowds at top peaks', 'Currency conversion confusion'],
    },
    hotels: [
      { id: 'badrutt-palace', name: 'Badrutt\'s Palace Hotel', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80', rating: 4.9, price: '$900/night', priceLevel: 'luxury', address: 'Via Serlas 27, St. Moritz', amenities: ['Ski-in/ski-out', 'Ice rink', 'Spa', 'Multiple restaurants', 'Palace bar'], description: 'The St. Moritz icon — 147 years of alpine royalty with ski-in access and a legendary ice bar.', squadTags: ['couple', 'friends'] },
      { id: 'hotel-victoria-jungfrau', name: 'Victoria-Jungfrau Grand Hotel', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.8, price: '$700/night', priceLevel: 'luxury', address: 'Höheweg 41, Interlaken', amenities: ['Direct Jungfrau view', 'Spa', 'Heated outdoor pool', 'Classic Swiss dining'], description: 'Grande dame of alpine hotels — Jungfrau views from the terrace, Michelin dining, legendary spa.', squadTags: ['couple', 'family'] },
      { id: 'airolo-hostel', name: 'Youthhostel Zermatt', image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80', rating: 4.3, price: '$60/night', priceLevel: 'budget', address: 'Winkelmatten 5, Zermatt', amenities: ['Matterhorn views', 'Shared kitchen', 'Locker storage', 'Hiking maps'], description: 'Budget base under the Matterhorn — dorms and privates with the same epic view at a fraction of the price.', squadTags: ['solo', 'friends'] },
      { id: 'the-chedi-andermatt', name: 'The Chedi Andermatt', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', rating: 4.8, price: '$650/night', priceLevel: 'luxury', address: 'Gotthardstrasse 4, Andermatt', amenities: ['Ski resort access', 'Japanese-Swiss spa', 'Pool', 'Wine cellar'], description: 'Alpine Japan meets Switzerland — an architectural masterpiece with the longest ski season in the Alps.', squadTags: ['couple', 'solo'] },
    ],
    restaurants: [
      { id: 'restaurant-zur-hinterst', name: 'Restaurant Schuh', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.6, cuisine: 'Swiss', description: 'Classic Swiss fondue and raclette in a historic Interlaken setting since 1818.', price: '$$', priceLevel: 'mid-range', address: 'Höheweg 56, Interlaken', tags: ['fondue', 'traditional', 'historic'], squadTags: ['couple', 'family', 'friends'] },
      { id: 'zum-see-zermatt', name: 'Zum See', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', rating: 4.9, cuisine: 'Alpine', description: 'Legendary summer restaurant in a 400-year-old mountain hut above Zermatt — book months ahead.', price: '$$$', priceLevel: 'luxury', address: 'Zum See 74, Zermatt', tags: ['mountain-hut', 'legendary', 'seasonal'], squadTags: ['couple', 'solo', 'friends'] },
      { id: 'tibits-zurich', name: 'Tibits Zurich', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', rating: 4.5, cuisine: 'Vegetarian Swiss', description: 'Swiss vegetarian buffet institution — fresh, local, and pay by weight.', price: '$', priceLevel: 'budget', address: 'Seefeldstrasse 2, Zurich', tags: ['vegetarian', 'local', 'buffet'], squadTags: ['solo', 'family', 'friends'] },
    ],
    activities: [
      { id: 'matterhorn-hike', name: 'Matterhorn Glacier Paradise', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', description: 'Europe\'s highest cable car to 3,883m — 360° views of 14 four-thousanders.', duration: 'Half day', rating: 4.9, price: 'CHF 99', category: 'Nature', accentColor: '#60A5FA', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'glacier-express', name: 'Glacier Express Train', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80', description: 'The world\'s slowest express train — 8 hours through 291 bridges and 91 tunnels across the Alps.', duration: '8 hours', rating: 4.8, price: 'CHF 145', category: 'Adventure', accentColor: '#EF4444', squadTags: ['solo', 'couple', 'family', 'friends'] },
      { id: 'jungfraujoch', name: 'Jungfraujoch — Top of Europe', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80', description: 'Cogwheel train to Europe\'s highest railway station at 3,454m — Aletsch Glacier views.', duration: 'Full day', rating: 4.8, price: 'CHF 228', category: 'Adventure', accentColor: '#60A5FA', squadTags: ['family', 'couple', 'friends', 'solo'] },
      { id: 'swiss-chocolate', name: 'Cailler Chocolate Factory', image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&q=80', description: 'Tour Switzerland\'s oldest chocolate factory with immersive tasting rooms.', duration: '2 hours', rating: 4.7, price: 'CHF 15', category: 'Culture', accentColor: '#92400E', squadTags: ['family', 'couple', 'solo'] },
      { id: 'skiing-verbier', name: 'Skiing in Verbier', image: 'https://images.unsplash.com/photo-1548777123-e216912df7d8?w=600&q=80', description: 'Part of the 4 Vallées ski area — 400km of runs from beginner bowls to legendary off-piste couloirs.', duration: 'Full day', rating: 4.9, price: 'CHF 70/day lift', category: 'Adventure', accentColor: '#93C5FD', squadTags: ['friends', 'couple', 'solo', 'family'] },
    ],
    events: [
      { id: 'montreux-jazz', name: 'Montreux Jazz Festival', category: 'Music', date: 'Early July', matchPercentage: 90, description: 'World-famous jazz festival on Lake Geneva with free outdoor stages and ticketed shows.', squadTags: ['solo', 'couple', 'friends'] },
      { id: 'davos-classic', name: 'Davos Spengler Cup', category: 'Sport', date: 'Dec 26–31', matchPercentage: 82, description: 'World\'s oldest international ice hockey tournament in the dramatic Davos alpine setting.', squadTags: ['friends', 'family'] },
      { id: 'zurich-street-parade', name: 'Zurich Street Parade', category: 'Festival', date: 'Aug', matchPercentage: 78, description: 'Europe\'s largest techno parade with 1M+ attendees dancing through Zurich\'s streets.', squadTags: ['friends', 'solo'] },
      { id: 'swiss-national-day', name: 'Swiss National Day', category: 'Culture', date: 'Aug 1', matchPercentage: 85, description: 'Mountain bonfires, fireworks over every lake, and the most spectacular patriotic celebration in Europe.', squadTags: ['family', 'couple', 'solo'] },
      { id: 'lucerne-carnival', name: 'Lucerne Carnival', category: 'Culture', date: 'Feb', matchPercentage: 80, description: 'One of Switzerland\'s wildest carnivals — costumed parades, brass bands, and fondue in the streets.', squadTags: ['friends', 'couple', 'family'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Zermatt Arrival', morning: 'Car-free Zermatt arrival by train', afternoon: 'Hike the 5-Seenweg (Five Lakes Trail)', evening: 'Raclette dinner in a mountain hut', icon: '🏔️' },
        { day: 2, theme: 'High Alps', morning: 'Matterhorn Glacier Paradise cable car at dawn', afternoon: 'Train to Interlaken via Visp', evening: 'Solo dinner in Interlaken old town', icon: '🚞' },
        { day: 3, theme: 'Jungfrau', morning: 'Cogwheel train to Jungfraujoch', afternoon: 'Hike Eiger Trail back to Grindelwald', evening: 'Train to Zurich — rooftop bar farewell', icon: '🎿' },
      ],
      couple: [
        { day: 1, theme: 'Lakeside Arrival', morning: 'Train to Lucerne — Chapel Bridge stroll', afternoon: 'Lake Lucerne paddle steamer cruise', evening: 'Fondue dinner at a lakeside restaurant', icon: '💕' },
        { day: 2, theme: 'Scenic Rails', morning: 'Glacier Express from St. Moritz to Zermatt', afternoon: 'Settle in to mountain hotel', evening: 'Dinner with Matterhorn views', icon: '🚞' },
        { day: 3, theme: 'Alpine Heights', morning: 'Sunrise at Riffelalp — Matterhorn reflection', afternoon: 'Spa afternoon at Zermatt hotel', evening: 'Farewell Zum See mountain restaurant dinner', icon: '🌅' },
      ],
      friends: [
        { day: 1, theme: 'Ski Day 1', morning: 'Arrive Verbier — rent gear and lift passes', afternoon: 'Warm-up runs across La Chaux', evening: 'Après ski at Farinet Bar', icon: '🎿' },
        { day: 2, theme: 'Off-Piste', morning: 'Full day powder skiing with instructor', afternoon: 'Extreme terrain guided tour', evening: 'Fondue party at the chalet', icon: '🏔️' },
        { day: 3, theme: 'Zurich Finale', morning: 'Train to Zurich via Lausanne', afternoon: 'Lake Zurich swim and city exploration', evening: 'Langstrasse nightlife district', icon: '🌃' },
      ],
      family: [
        { day: 1, theme: 'Chocolate & Trains', morning: 'Cailler Chocolate Factory tour', afternoon: 'Lake Geneva scenic train to Interlaken', evening: 'Hotel check-in and playground time', icon: '🍫' },
        { day: 2, theme: 'Top of Europe', morning: 'Jungfraujoch cogwheel train — kids love it', afternoon: 'Snow activities at 3,454m', evening: 'Grindelwald village dinner', icon: '❄️' },
        { day: 3, theme: 'Lake Day', morning: 'Lake Brienz turquoise kayaking', afternoon: 'Trümmelbach Falls — thundering glacier water', evening: 'Final dinner with Eiger view', icon: '💧' },
      ],
    },
    aiInsight: {
      solo:    'Switzerland\'s rail network means total freedom without a car. Wake up in Zurich, have lunch in the Alps, and dinner by a lake — all in one day. The solo traveler who values efficiency, safety, and transcendent natural beauty will find Switzerland pays off every franc.',
      couple:  'Switzerland delivers the alpine romance that European mountain escapes promise but rarely deliver. The Glacier Express, a private mountain hut dinner, the Matterhorn at sunrise — these experiences are genuinely life-altering for two people.',
      friends:'Verbier\'s ski circuit is arguably Europe\'s best for a group of experienced skiers — vast terrain, incredible off-piste, and après ski bars that run until 2am. Add the Glacier Express and Zurich nightlife and you have an iconic Swiss itinerary.',
      family:  'Switzerland is one of Europe\'s most family-friendly countries. The trains fascinate children, the mountains are safe and accessible, and the chocolate factory visit is unforgettable. Switzerland proves that luxury and family travel can coexist perfectly.',
    },
    mapCenter: { lat: 46.8182, lng: 8.2275 },
  },

  // New Zealand
  {
    id: 'newzealand',
    name: 'New Zealand',
    flag: '🇳🇿',
    heroImage: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1469521669194-babb45599def?w=600&q=80',
    taglines: {
      solo:    'Epic wilderness on the edge of the world',
      couple:  'Dramatic landscapes for your greatest adventure',
      friends: 'The world\'s adventure sports capital',
      family:  'Middle Earth made real',
    },
    weather: { temp: '15°C', condition: 'Variable & scenic', icon: '🌿' },
    matchPercentage: 89,
    description: 'New Zealand packs extraordinary natural diversity into two islands — fiords, volcanoes, glaciers, beaches, and rolling green hills straight from a Tolkien novel. Queenstown is the adventure sports capital of the world, and the Māori culture adds depth you won\'t find elsewhere.',
    currency: 'NZD (New Zealand Dollar)',
    language: 'English, Māori',
    timezone: 'UTC+12 (NZST)',
    positives: {
      solo:    ['Multi-day Great Walks for solo hikers', 'Extremely safe and welcoming', 'Strong solo traveler community', 'Campervan culture is ideal solo', 'World-class national parks'],
      couple:  ['Breathtaking scenery for every mood', 'Milford Sound is unforgettable', 'Luxury lodges in remote wilderness', 'Romantic Queenstown', 'Wine trails in Marlborough'],
      friends: ['Bungee, skydive, jet boat in Queenstown', 'Campervan road trips for groups', 'Hobbiton and film tourism', 'Vibrant city bases (Auckland, Wellington)', 'White water rafting'],
      family:  ['Clean, safe, family-friendly', 'Hobbiton film set', 'Rotorua geothermal for all ages', 'Whale watching in Kaikōura', 'Excellent DOC campgrounds'],
    },
    negatives: {
      solo:    ['Very long flights from most origins', 'Campervans require driving on left', 'Remote areas have no cell coverage', 'Expensive for accommodation'],
      couple:  ['Distance from Europe/Americas is major', 'Weather highly changeable', 'Limited urban luxury scene', 'Some scenic areas require car'],
      friends: ['Adventure sports costs add up', 'Long travel times between islands', 'Limited nightlife outside Auckland', 'Car hire splits necessary'],
      family:  ['Extremely long flight for young children', 'Jet lag significant', 'Remote areas far apart', 'High accommodation costs'],
    },
    hotels: [
      { id: 'blanket-bay', name: 'Blanket Bay Lodge', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', rating: 4.9, price: '$1,200/night', priceLevel: 'luxury', address: 'Glenorchy, Otago', amenities: ['Lake Wakatipu views', 'Heli-hiking', 'Private chef', 'Fly fishing', 'Spa'], description: 'Architecturally stunning lodge on Lake Wakatipu in Glenorchy — the ultimate South Island wilderness base.', squadTags: ['couple', 'solo'] },
      { id: 'eichardt-private', name: 'Eichardt\'s Private Hotel', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.8, price: '$650/night', priceLevel: 'luxury', address: 'Marine Parade, Queenstown', amenities: ['Lake Wakatipu views', 'Fine dining', 'Concierge adventure booking'], description: 'Boutique luxury on Queenstown\'s waterfront — the adventure capital\'s most prestigious address.', squadTags: ['couple', 'friends'] },
      { id: 'nomads-queenstown', name: 'Nomads Queenstown', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.4, price: '$45/night', priceLevel: 'budget', address: '5 Church St, Queenstown', amenities: ['Bar', 'Adventure booking desk', 'Common kitchen', 'Bungy discounts'], description: 'Queenstown\'s best-known social hostel — great for meeting adventure travel companions.', squadTags: ['solo', 'friends'] },
      { id: 'cape-kidnappers', name: 'The Farm at Cape Kidnappers', image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80', rating: 4.9, price: '$1,100/night', priceLevel: 'luxury', address: 'Hawke\'s Bay, North Island', amenities: ['18-hole cliff-top golf', 'Gannet colony', 'Spa', 'Farm experiences', 'Helicopter access'], description: 'A working sheep and cattle station perched above the Pacific — world-class golf, gannet colony, helicopter arrivals.', squadTags: ['couple', 'family'] },
    ],
    restaurants: [
      { id: 'fleur-place', name: 'Fleur\'s Place', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.8, cuisine: 'NZ Seafood', description: 'A shack by the sea in Moeraki — the most celebrated seafood restaurant in New Zealand.', price: '$$$', priceLevel: 'luxury', address: 'Haven St, Moeraki', tags: ['seafood', 'fresh', 'iconic'], squadTags: ['couple', 'solo', 'friends'] },
      { id: 'clooney-auckland', name: 'Clooney', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.7, cuisine: 'NZ Contemporary', description: 'Auckland\'s most awarded fine dining — a love letter to New Zealand\'s spectacular produce.', price: '$$$$', priceLevel: 'luxury', address: '33 Sale St, Auckland', tags: ['fine-dining', 'NZ-produce', 'tasting-menu'], squadTags: ['couple', 'solo'] },
      { id: 'fergburger', name: 'Fergburger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80', rating: 4.8, cuisine: 'New Zealand Burgers', description: 'Queenstown legend — burgers so good people queue for an hour. Worth every minute.', price: '$', priceLevel: 'budget', address: '42 Shotover St, Queenstown', tags: ['legendary', 'burgers', 'must-do'], squadTags: ['solo', 'friends', 'family'] },
    ],
    activities: [
      { id: 'bungy-queenstown', name: 'AJ Hackett Bungy', image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&q=80', description: 'The original bungy jump at Kawarau Bridge — 43m over the Kawarau River, birthplace of the sport.', duration: '3 hours', rating: 4.9, price: 'NZ$265', category: 'Adventure', accentColor: '#EF4444', squadTags: ['solo', 'friends', 'couple'] },
      { id: 'milford-sound', name: 'Milford Sound Cruise', image: 'https://images.unsplash.com/photo-1469521669194-babb45599def?w=600&q=80', description: 'The 8th wonder of the world — sail through towering fiord walls to the Tasman Sea.', duration: '2 hours', rating: 4.9, price: 'NZ$85', category: 'Nature', accentColor: '#10B981', squadTags: ['solo', 'couple', 'family', 'friends'] },
      { id: 'hobbiton', name: 'Hobbiton Movie Set', image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600&q=80', description: 'Walk through the Shire from Lord of the Rings — a fully maintained Hobbit village in the Waikato.', duration: '2.5 hours', rating: 4.9, price: 'NZ$89', category: 'Culture', accentColor: '#84CC16', squadTags: ['family', 'friends', 'couple', 'solo'] },
      { id: 'rotorua-geothermal', name: 'Rotorua Geothermal Parks', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', description: 'Boiling mud pools, erupting geysers, and vibrant Māori cultural performances.', duration: 'Full day', rating: 4.7, price: 'NZ$45', category: 'Nature', accentColor: '#F97316', squadTags: ['family', 'friends', 'solo', 'couple'] },
      { id: 'abel-tasman-kayak', name: 'Abel Tasman Sea Kayaking', image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&q=80', description: 'Multi-day kayak along golden-sand beaches and forest-fringed coves in Abel Tasman National Park.', duration: 'Multi-day', rating: 4.8, price: 'NZ$200', category: 'Adventure', accentColor: '#0EA5E9', squadTags: ['solo', 'friends', 'couple'] },
    ],
    events: [
      { id: 'nz-international-film', name: 'NZ International Film Festival', category: 'Culture', date: 'Jul–Aug', matchPercentage: 80, description: 'Annual film festival touring Auckland, Wellington, and Christchurch with world premieres.', squadTags: ['solo', 'couple', 'friends'] },
      { id: 'warbirds-wanaka', name: 'Warbirds Over Wanaka', category: 'Sport', date: 'Easter (biennial)', matchPercentage: 82, description: 'One of the world\'s great airshows at Lake Wanaka — vintage aircraft against mountain backdrop.', squadTags: ['family', 'friends'] },
      { id: 'matariki', name: 'Matariki — Māori New Year', category: 'Culture', date: 'Jun–Jul', matchPercentage: 88, description: 'New Zealand\'s Māori New Year celebration — stargazing, cultural performances, and winter feasts.', squadTags: ['solo', 'couple', 'family', 'friends'] },
      { id: 'queenstown-winter-fest', name: 'Queenstown Winter Festival', category: 'Festival', date: 'Late Jun', matchPercentage: 87, description: 'Six days of winter sports, live music, and street parties at the adventure capital.', squadTags: ['friends', 'couple', 'solo'] },
      { id: 'coast-to-coast', name: 'Coast to Coast Race', category: 'Sport', date: 'Feb', matchPercentage: 83, description: 'World-famous multisport race across the Southern Alps — run, kayak, and cycle from coast to coast.', squadTags: ['solo', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Queenstown Base', morning: 'Arrive Queenstown — Skyline Gondola views', afternoon: 'Original AJ Hackett Bungy Jump at Kawarau', evening: 'Fergburger and lakeside sunset', icon: '🏔️' },
        { day: 2, theme: 'Fiordland', morning: 'Drive to Te Anau — Milford Sound cruise', afternoon: 'Walk the start of the Milford Track', evening: 'Te Anau DOC campsite under the stars', icon: '🛶' },
        { day: 3, theme: 'Glenorchy', morning: 'Drive to Glenorchy for Lord of the Rings locations', afternoon: 'Paradise horseback ride through Middle Earth', evening: 'Solo sunset wine on Lake Wakatipu shore', icon: '🧙' },
      ],
      couple: [
        { day: 1, theme: 'Romantic Queenstown', morning: 'Cable car to Skyline breakfast with views', afternoon: 'Vineyard wine tasting in Gibbston Valley', evening: 'Lakeside fine dining at Eichardt\'s', icon: '🍷' },
        { day: 2, theme: 'The Fiord', morning: 'Milford Sound — morning fiord cruise', afternoon: 'Kayaking into hidden coves together', evening: 'Glamping accommodation near Te Anau', icon: '🌊' },
        { day: 3, theme: 'Luxury Retreat', morning: 'Helicopter to remote glacial valley picnic', afternoon: 'Couple\'s spa at a Queenstown luxury lodge', evening: 'Farewell tasting menu dinner', icon: '🚁' },
      ],
      friends: [
        { day: 1, theme: 'Adrenaline Day', morning: 'Bungy jump at Kawarau Bridge', afternoon: 'Shotover Jet boat followed by whitewater rafting', evening: 'Skyline luge races and dinner with views', icon: '🎢' },
        { day: 2, theme: 'Skydive Day', morning: 'NZONE Skydive over Queenstown', afternoon: 'Recovery at Queenstown Beach and paddleboarding', evening: 'Queenstown bar crawl', icon: '🪂' },
        { day: 3, theme: 'Hobbiton', morning: 'Drive to Matamata — Hobbiton Movie Set tour', afternoon: 'Green Dragon Inn ales in the Shire', evening: 'Auckland city final evening', icon: '🧙' },
      ],
      family: [
        { day: 1, theme: 'Hobbiton & Rotorua', morning: 'Hobbiton Movie Set — kids lose their minds', afternoon: 'Rotorua geothermal park — mud pools and geysers', evening: 'Māori hangi feast and cultural show', icon: '🌋' },
        { day: 2, theme: 'Kaikōura', morning: 'Whale watching from Kaikōura boat', afternoon: 'Seal colony walk and rock pools', evening: 'Fish & chips on the Kaikōura wharf', icon: '🐋' },
        { day: 3, theme: 'Abel Tasman', morning: 'Water taxi into Abel Tasman national park', afternoon: 'Short golden-sand beach hike for all ages', evening: 'Nelson family dinner and final night', icon: '🏖️' },
      ],
    },
    aiInsight: {
      solo:    'New Zealand is built for the solo adventurer. The DOC huts on the Great Walks, the campervan freedom, the Queenstown hostel scene, and a culture that welcomes independent travelers make it one of the world\'s great solo destinations.',
      couple:  'New Zealand\'s landscapes create a shared sense of wonder that bonds couples deeply. Milford Sound, a glacial helicopter picnic, watching sunrise over the Remarkables — these are experiences that feel like belonging to each other.',
      friends:'Queenstown alone makes New Zealand worth it for a group of friends. Bungy, skydive, jet boat, whitewater raft — all in two days. Add Hobbiton, the wine trail, and Auckland and you have the ultimate adventurous group itinerary.',
      family:  'New Zealand is one of the great family destinations: Hobbiton for the movie fans, whale watching for the marine lovers, geysers for the curious, and hiking for the energetic. The Māori culture adds an educational dimension you won\'t find anywhere else.',
    },
    mapCenter: { lat: -40.9006, lng: 174.8860 },
  },

  // Jordan
  {
    id: 'jordan',
    name: 'Jordan',
    flag: '🇯🇴',
    heroImage: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
    taglines: {
      solo:    'Ancient wonders of the rose-red desert',
      couple:  'Petra by candlelight and Wadi Rum at dawn',
      friends: 'Desert adventures and ancient cities',
      family:  'Indiana Jones and history come alive',
    },
    weather: { temp: '28°C', condition: 'Sunny & dry', icon: '☀️' },
    matchPercentage: 86,
    description: 'Jordan holds some of the world\'s most dramatic ancient wonders. Petra — the rose-red city carved into sandstone cliffs — defies imagination. Wadi Rum is a Mars-like red desert of impossible rock formations. The Dead Sea offers the world\'s most buoyant float. All within a safe, welcoming country.',
    currency: 'JOD (Jordanian Dinar)',
    language: 'Arabic, English',
    timezone: 'UTC+3 (AST)',
    positives: {
      solo:    ['Incredibly welcoming culture', 'Budget-friendly by Middle East standards', 'Safe for solo travelers', 'Biblical and Nabataean history depth', 'Jordan Pass covers all major sites'],
      couple:  ['Petra by Night — romantic candlelit wonder', 'Wadi Rum luxury desert camp', 'Dead Sea at sunrise together', 'Dana Biosphere Reserve trekking', 'Authentic cuisine'],
      friends: ['Wadi Rum jeep and camping adventures', 'Aqaba Red Sea diving', 'Shared desert sunrise experiences', 'Affordable group tours', 'Strong food culture'],
      family:  ['Jordan Pass covers kids\' entrance fees', 'Petra is genuinely awe-inspiring for children', 'Dead Sea floating is a unique fun experience', 'Safe country for families'],
    },
    negatives: {
      solo:    ['Limited nightlife', 'Heavy touts at Petra entrance', 'Hot summers over 40°C', 'Limited transport between sites without car'],
      couple:  ['Not a beach destination primarily', 'Tourist prices inflated at Petra', 'Conservative culture — dress modestly', 'Limited fine dining outside Amman'],
      friends: ['Alcohol limited in many areas', 'Petrol and rental costs', 'Extreme heat May–Sep', 'Limited options for nightlife'],
      family:  ['Heat may be difficult for young children', 'Petra walk is very long', 'Limited Western-style kids\' amenities', 'Distance between major sites'],
    },
    hotels: [
      { id: 'petra-marriott', name: 'Petra Marriott Hotel', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80', rating: 4.6, price: '$280/night', priceLevel: 'mid-range', address: 'Tourism St, Wadi Musa, Petra', amenities: ['Panoramic Petra valley view', 'Pool', 'Jordan specialties restaurant', 'Free shuttle to Petra entrance'], description: 'The closest luxury option to the Petra entrance with sweeping valley views from every room.', squadTags: ['couple', 'family'] },
      { id: 'wadi-rum-night-luxury', name: 'Wadi Rum Night Luxury Camp', image: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=600&q=80', rating: 4.8, price: '$380/night', priceLevel: 'luxury', address: 'Wadi Rum Desert, Aqaba Governorate', amenities: ['Private bubble tents', 'Stargazing deck', 'Bedouin dinner', 'Jeep tour included'], description: 'Sleep in transparent bubble tents under an ocean of stars — the Wadi Rum experience perfected.', squadTags: ['couple', 'solo'] },
      { id: 'caravan-hostel-petra', name: 'Petra Gate Hotel', image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80', rating: 4.3, price: '$55/night', priceLevel: 'budget', address: 'Main St, Wadi Musa', amenities: ['Rooftop terrace', 'Free breakfast', 'Jordan Pass advice', 'Social common area'], description: 'Friendly budget base steps from the Petra entrance with a great rooftop for meeting fellow travelers.', squadTags: ['solo', 'friends'] },
      { id: 'kempinski-aqaba', name: 'Kempinski Hotel Aqaba', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.7, price: '$320/night', priceLevel: 'luxury', address: 'King Hussein St, Aqaba', amenities: ['Private beach', 'Infinity pool', 'Red Sea diving center', 'Spa', 'Four restaurants'], description: 'The Red Sea\'s best luxury resort base — private beach, world-class dive center, and sunset views into Saudi Arabia.', squadTags: ['friends', 'family', 'couple'] },
    ],
    restaurants: [
      { id: 'sufra-amman', name: 'Sufra Restaurant', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.8, cuisine: 'Jordanian Traditional', description: 'Amman\'s most celebrated traditional restaurant — mansaf, maqluba, and mezze in a restored 1940s villa.', price: '$$', priceLevel: 'mid-range', address: '26 Rainbow St, Amman', tags: ['traditional', 'mansaf', 'iconic'], squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'petra-kitchen', name: 'Petra Kitchen', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', rating: 4.7, cuisine: 'Jordanian Cooking Class', description: 'Cook a full Jordanian dinner with a local family — the best cultural experience in Petra.', price: '$$', priceLevel: 'mid-range', address: 'Tourism St, Wadi Musa', tags: ['cooking-class', 'cultural', 'hands-on'], squadTags: ['couple', 'friends', 'family', 'solo'] },
      { id: 'hashem-amman', name: 'Hashem Restaurant', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', rating: 4.7, cuisine: 'Jordanian Street Food', description: 'Open since 1952, Hashem is Amman\'s most famous falafel institution — kings and kings\' children have eaten here.', price: '$', priceLevel: 'budget', address: 'Downtown Amman', tags: ['legendary', 'falafel', 'street-food'], squadTags: ['solo', 'friends', 'family'] },
    ],
    activities: [
      { id: 'petra-full-day', name: 'Petra Full Day Exploration', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=600&q=80', description: 'Walk the Siq to the Treasury, climb to the Monastery, and explore the vast ancient Nabataean city.', duration: 'Full day (8+ hours)', rating: 4.9, price: 'JD 50 (Jordan Pass)', category: 'History', accentColor: '#D97706', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'wadi-rum-jeep', name: 'Wadi Rum Jeep Safari', image: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=600&q=80', description: 'Explore the Mars-like red desert in a Bedouin jeep — natural arches, sand dunes, and petroglyphs.', duration: '4-6 hours', rating: 4.8, price: 'JD 25', category: 'Adventure', accentColor: '#DC2626', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'dead-sea-float', name: 'Dead Sea Floating', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80', description: 'Float effortlessly in the world\'s saltiest body of water at 430m below sea level.', duration: '3-4 hours', rating: 4.7, price: 'JD 20', category: 'Nature', accentColor: '#0EA5E9', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'petra-by-night', name: 'Petra by Night', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=600&q=80', description: 'The Siq and Treasury lit by 1,500 candles — a silent, magical walk through ancient history.', duration: '2 hours', rating: 4.8, price: 'JD 17', category: 'Culture', accentColor: '#F59E0B', squadTags: ['couple', 'solo', 'friends'] },
      { id: 'aqaba-diving', name: 'Red Sea Diving in Aqaba', image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=600&q=80', description: 'Dive the Red Sea\'s legendary coral walls and deliberately sunk warships at one of the world\'s top sites.', duration: 'Half day', rating: 4.8, price: 'JD 45', category: 'Adventure', accentColor: '#0EA5E9', squadTags: ['solo', 'friends', 'couple'] },
    ],
    events: [
      { id: 'petra-desert-marathon', name: 'Petra Desert Marathon', category: 'Sport', date: 'Sep', matchPercentage: 85, description: 'Run through Petra and Wadi Rum in the annual desert marathon — an unforgettable route through history.', squadTags: ['solo', 'friends'] },
      { id: 'jerash-festival', name: 'Jerash Festival of Culture', category: 'Culture', date: 'Jul', matchPercentage: 88, description: 'Annual arts festival at the remarkably preserved Roman city of Jerash — performances in ancient amphitheaters.', squadTags: ['solo', 'couple', 'family'] },
      { id: 'jordan-food-festival', name: 'Amman Food Festival', category: 'Food', date: 'Oct', matchPercentage: 82, description: 'Three days of Jordanian cuisine, street food, and cooking demonstrations in the heart of Amman.', squadTags: ['solo', 'friends', 'family'] },
      { id: 'eid-celebrations', name: 'Eid al-Fitr Celebrations', category: 'Culture', date: 'Variable', matchPercentage: 78, description: 'Jordan\'s biggest celebrations — streets lit up, generous hospitality, and traditional Eid sweets everywhere.', squadTags: ['family', 'couple', 'solo'] },
      { id: 'wadi-rum-hot-air', name: 'Wadi Rum Hot Air Balloon Festival', category: 'Adventure', date: 'Apr', matchPercentage: 90, description: 'Colorful balloons rise over the red desert at dawn — one of the Middle East\'s most spectacular sights.', squadTags: ['couple', 'solo', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Petra Depths', morning: 'Enter Petra at opening — beat the crowds to the Treasury', afternoon: 'Climb to the Monastery (850 steps) for sunset views', evening: 'Petra Kitchen cooking class dinner', icon: '🏛️' },
        { day: 2, theme: 'Wadi Rum', morning: 'Drive south to Wadi Rum — jeep safari into red desert', afternoon: 'Sandboard on red dunes and petroglyphs', evening: 'Solo star camping in bubble tent', icon: '🌌' },
        { day: 3, theme: 'Dead Sea & Amman', morning: 'Float in the Dead Sea at sunrise', afternoon: 'Drive to Amman — Rainbow St exploration', evening: 'Mansaf dinner at Sufra and night views from the Citadel', icon: '🏺' },
      ],
      couple: [
        { day: 1, theme: 'Petra Romance', morning: 'Petra at opening — Treasury and Siq together', afternoon: 'High Place of Sacrifice viewpoint at sunset', evening: 'Petra by Night — 1,500 candles in the Siq', icon: '🕯️' },
        { day: 2, theme: 'Desert Wilderness', morning: 'Wadi Rum dawn — silence and Mars landscape', afternoon: 'Private jeep tour of arches and dunes', evening: 'Bubble tent under 3 billion stars', icon: '⭐' },
        { day: 3, theme: 'Dead Sea Bliss', morning: 'Dead Sea sunrise float in golden light', afternoon: 'Luxury resort spa and mud treatment', evening: 'Final dinner in Amman\'s Abdali Boulevard', icon: '💆' },
      ],
      friends: [
        { day: 1, theme: 'Aqaba Water', morning: 'Red Sea dive — coral walls and WWII shipwreck', afternoon: 'Kayak and snorkel the Saudi border reef', evening: 'Aqaba seafood at a harbor restaurant', icon: '🤿' },
        { day: 2, theme: 'Wadi Rum Rally', morning: 'Jeep convoy through Wadi Rum desert', afternoon: 'Rock climbing the Jebel Rum face', evening: 'Bedouin camp dinner and music', icon: '🏜️' },
        { day: 3, theme: 'Petra Epic', morning: 'Early entry to Petra — full day of exploration', afternoon: 'Hike to the Little Petra Siq canyon', evening: 'Hashem falafel feast in Amman', icon: '🏛️' },
      ],
      family: [
        { day: 1, theme: 'Petra Discovery', morning: 'Petra entrance — horses and carriages through the Siq', afternoon: 'The Treasury — let kids climb on the rose-red rocks', evening: 'Wadi Musa town dinner', icon: '🐴' },
        { day: 2, theme: 'Wadi Rum', morning: 'Jeep safari for the whole family', afternoon: 'Sandboarding the red dunes', evening: 'Traditional Bedouin dinner and storytelling', icon: '🌅' },
        { day: 3, theme: 'Dead Sea Fun', morning: 'Dead Sea floating — kids will never forget it', afternoon: 'Resort pool and spa afternoon', evening: 'Amman Citadel and final family dinner', icon: '🏊' },
      ],
    },
    aiInsight: {
      solo:    'Jordan punches far above its weight for solo travelers. The Jordan Pass makes it financially accessible, the culture is extraordinarily welcoming, and Petra and Wadi Rum deliver the kind of wonder that solo travel exists for. You\'ll feel the history in your bones.',
      couple:  'Petra by candlelight and Wadi Rum bubble tents under the Milky Way are two of the world\'s most romantic travel experiences. Jordan offers the rare combination of epic ancient wonder and desert intimacy that most destinations can only approximate.',
      friends: 'Jordan is an underrated group destination. Wadi Rum jeep convoys, Red Sea diving, and a Bedouin dinner under the stars give a group trip an adventure narrative that beach and city trips simply can\'t match. The price-to-experience ratio is exceptional.',
      family:  'Jordan is an unbeatable history destination for families. No child who walks through the Siq and sees the Treasury will ever forget it. The floating Dead Sea is pure fun, the Wadi Rum jeep ride thrills all ages, and Jordan\'s culture is deeply family-oriented.',
    },
    mapCenter: { lat: 30.5852, lng: 36.2384 },
  },

  // Iceland
  {
    id: 'iceland',
    name: 'Iceland',
    flag: '🇮🇸',
    heroImage: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&q=80',
    taglines: {
      solo:    'Chase the northern lights on your own terms',
      couple:  'Hot springs and aurora in wild landscapes',
      friends: 'Epic road trip through fire and ice',
      family:  'Where geology comes alive',
    },
    weather: { temp: '5°C', condition: 'Arctic & dramatic', icon: '🌌' },
    matchPercentage: 90,
    description: 'Iceland is nature in its most theatrical form — aurora borealis blazing across the sky, geysers erupting every few minutes, waterfalls thundering into black sand beaches, and lava fields stretching to the horizon. The entire country feels like another planet.',
    currency: 'ISK (Icelandic Króna)',
    language: 'Icelandic, English',
    timezone: 'UTC+0 (GMT)',
    positives: {
      solo:    ['Aurora hunting completely solo', 'Ring Road self-drive freedom', 'Strong solo travel culture', 'English spoken everywhere', 'Incredibly safe country'],
      couple:  ['Northern lights are deeply romantic', 'Blue Lagoon geothermal spa', 'Private hot pots in the wilderness', 'Dramatic proposal locations', 'Iceland elopements are iconic'],
      friends: ['Ring Road road trip for groups', 'Glacier hiking and ice caves', 'Whale watching in Húsavík', 'Lively Reykjavík bar scene', 'Super Jeep expeditions'],
      family:  ['Safe and family-friendly', 'Geysers and volcanoes are educational magic', 'Whale watching for all ages', 'Midnight sun in summer', 'Puffin colonies'],
    },
    negatives: {
      solo:    ['Very expensive', 'Weather deeply unpredictable', 'Aurora not guaranteed', 'Darkness 20hrs/day in winter'],
      couple:  ['High costs for everything', 'Weather can ruin plans entirely', 'Limited warm-weather beach', 'Flights are often layovers'],
      friends: ['Car rental split needed for cost', 'No party scene outside Reykjavík', 'Limited fresh food options', 'Long driving distances'],
      family:  ['Very expensive for families', 'Cold and wet often', 'Young children struggle with long drives', 'Limited family-friendly eating'],
    },
    hotels: [
      { id: 'ion-adventure', name: 'Ion Adventure Hotel', image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&q=80', rating: 4.8, price: '$450/night', priceLevel: 'luxury', address: 'Nesjavellir, South Iceland', amenities: ['Northern lights bar', 'Geothermal pool', 'Aurora wake-up call', 'Glass walls', 'Hiking access'], description: 'Perched above a geothermal lake with floor-to-ceiling glass walls — the ultimate aurora viewing hotel.', squadTags: ['couple', 'solo'] },
      { id: 'fosshotel-glacier', name: 'Fosshotel Glacier Lagoon', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80', rating: 4.6, price: '$320/night', priceLevel: 'luxury', address: 'Glacier Lagoon, SE Iceland', amenities: ['Glacier views', 'Restaurant', 'Guided glacier tours', 'Cozy fire lounge'], description: 'The closest hotel to the Jökulsárlón Glacier Lagoon — icebergs visible from your room.', squadTags: ['couple', 'family'] },
      { id: 'kex-hostel', name: 'KEX Hostel', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.5, price: '$50/night', priceLevel: 'budget', address: 'Skúlagata 28, Reykjavík', amenities: ['Bar', 'Restaurant', 'Gym', 'Social lounge', 'Fast WiFi'], description: 'Reykjavík\'s most vibrant hostel — a converted biscuit factory with a legendary bar and great community.', squadTags: ['solo', 'friends'] },
      { id: 'deplar-farm', name: 'Deplar Farm', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', rating: 4.9, price: '$2,000/night', priceLevel: 'luxury', address: 'Fljót Valley, North Iceland', amenities: ['Heli-skiing', 'Geothermal pool', 'Spa', 'Fitness center', 'Aurora viewing'], description: 'Remote luxury lodge in the North Icelandic fjords — the helicopter skiing and aurora combination is unmatched.', squadTags: ['friends', 'couple'] },
    ],
    restaurants: [
      { id: 'dill-reykjavik', name: 'Dill Restaurant', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.8, cuisine: 'New Nordic', description: 'Iceland\'s Michelin-starred restaurant — seasonal, foraged, and fermented Icelandic cuisine in its purest form.', price: '$$$$', priceLevel: 'luxury', address: 'Hverfisgata 12, Reykjavík', tags: ['michelin', 'nordic', 'tasting-menu'], squadTags: ['couple', 'solo'] },
      { id: 'sea-baron', name: 'The Sea Baron', image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&q=80', rating: 4.7, cuisine: 'Icelandic Seafood', description: 'Harbor-front lobster soup and grilled langoustine — the most iconic casual dining in Reykjavík.', price: '$$', priceLevel: 'mid-range', address: 'Geirsgata 8, Reykjavík', tags: ['lobster-soup', 'harbor', 'iconic'], squadTags: ['solo', 'friends', 'family', 'couple'] },
      { id: 'skaffinn-vik', name: 'Skaftín', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', rating: 4.4, cuisine: 'Icelandic', description: 'The best restaurant on the South Coast — lamb soup, skyr desserts, and volcanic valley views.', price: '$$', priceLevel: 'mid-range', address: 'Víkurbraut 28, Vík', tags: ['south-coast', 'lamb', 'local'], squadTags: ['family', 'friends', 'solo'] },
    ],
    activities: [
      { id: 'aurora-hunting', name: 'Northern Lights Hunt', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80', description: 'Expert-guided minibus to the darkest skies — chasing the aurora borealis with real-time forecasting.', duration: '4-5 hours', rating: 4.8, price: '$75', category: 'Nature', accentColor: '#6366F1', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'blue-lagoon', name: 'Blue Lagoon Geothermal Spa', image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&q=80', description: 'Soak in 38°C silica-rich mineral waters surrounded by black lava fields — one of the world\'s great spa experiences.', duration: '3-4 hours', rating: 4.7, price: '$55-110', category: 'Wellness', accentColor: '#0EA5E9', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'glacier-hike', name: 'Vatnajökull Glacier Hike', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', description: 'Crampons on as you walk across Europe\'s largest ice cap with a certified glacier guide.', duration: '4-5 hours', rating: 4.9, price: '$95', category: 'Adventure', accentColor: '#60A5FA', squadTags: ['solo', 'friends', 'couple'] },
      { id: 'golden-circle', name: 'Golden Circle Self-Drive', image: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=600&q=80', description: 'Þingvellir National Park, Geysir hot spring, and Gullfoss waterfall — Iceland\'s classic driving route.', duration: 'Full day', rating: 4.8, price: '$50 (car fuel)', category: 'Nature', accentColor: '#10B981', squadTags: ['family', 'solo', 'friends', 'couple'] },
      { id: 'snorkeling-silfra', name: 'Snorkeling in Silfra Fissure', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80', description: 'Float between the North American and Eurasian tectonic plates in glacial crystal water.', duration: '3 hours', rating: 4.9, price: '$120', category: 'Adventure', accentColor: '#0EA5E9', squadTags: ['solo', 'friends', 'couple'] },
    ],
    events: [
      { id: 'aurora-season', name: 'Aurora Borealis Season', category: 'Nature', date: 'Sep–Mar', matchPercentage: 97, description: 'The prime window for northern lights — dark nights, clear skies, and the highest KP activity.', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'iceland-airwaves', name: 'Iceland Airwaves Music Festival', category: 'Music', date: 'Nov', matchPercentage: 88, description: 'Reykjavík\'s celebrated indie/alternative music festival in venues across the city.', squadTags: ['solo', 'friends', 'couple'] },
      { id: 'secret-solstice', name: 'Secret Solstice Festival', category: 'Festival', date: 'Jun', matchPercentage: 86, description: 'Music festival during the midnight sun — concerts inside a glacier, in lava tubes, and under 24-hour daylight.', squadTags: ['friends', 'solo'] },
      { id: 'reykjavik-marathon', name: 'Reykjavík Marathon', category: 'Sport', date: 'Aug', matchPercentage: 80, description: 'Run through Reykjavík under the midnight sun in one of the world\'s most scenic marathons.', squadTags: ['solo', 'friends'] },
      { id: 'christmas-lights', name: 'Reykjavík Christmas Season', category: 'Culture', date: 'Nov–Dec', matchPercentage: 83, description: 'Iceland\'s most magical season — cozy cafés, Christmas markets, and the highest aurora probability.', squadTags: ['couple', 'family', 'solo'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Reykjavík Base', morning: 'Hallgrímskirkja church and city walk', afternoon: 'Blue Lagoon geothermal soak', evening: 'Aurora forecast check and solo night hunt', icon: '🌌' },
        { day: 2, theme: 'South Coast', morning: 'Seljalandsfoss and Skógafoss waterfalls', afternoon: 'Black sand Reynisfjara beach', evening: 'Vík dinner — sleep under aurora-lit skies', icon: '🌊' },
        { day: 3, theme: 'Glacier Day', morning: 'Vatnajökull glacier hike with guide', afternoon: 'Jökulsárlón Glacier Lagoon — blue icebergs', evening: 'Diamond Beach sunset — ice on black sand', icon: '🧊' },
      ],
      couple: [
        { day: 1, theme: 'Romantic Reykjavík', morning: 'Old town walk and Dill tasting menu reservation', afternoon: 'Blue Lagoon premium couple\'s spa', evening: 'Michelin dinner at Dill', icon: '💕' },
        { day: 2, theme: 'Glacial Romance', morning: 'Snorkeling in Silfra tectonic fissure', afternoon: 'Jökulsárlón Glacier Lagoon boat tour', evening: 'Fosshotel Glacier Lagoon — icebergs from the room', icon: '🧊' },
        { day: 3, theme: 'Aurora Night', morning: 'Geysir and Gullfoss Golden Circle', afternoon: 'Hot pot soak at Fontana geothermal baths', evening: 'Private aurora hunt in the wilderness', icon: '✨' },
      ],
      friends: [
        { day: 1, theme: 'Reykjavík', morning: 'Arrive, settle in KEX Hostel', afternoon: 'Silfra snorkeling between continents', evening: 'Reykjavík bar crawl — Laugavegur street', icon: '🍺' },
        { day: 2, theme: 'South Coast Drive', morning: 'South Coast road trip — waterfalls and black beaches', afternoon: 'Glacier hike on Vatnajökull', evening: 'Vík — group cooking Icelandic lamb', icon: '🚗' },
        { day: 3, theme: 'Super Jeep', morning: 'Super Jeep expedition into the highlands', afternoon: 'Geothermal hot river bath', evening: 'Aurora chase — last night in the dark', icon: '🌌' },
      ],
      family: [
        { day: 1, theme: 'Geyser & Waterfall', morning: 'Geysir hot spring area — Strokkur erupts every 5 min', afternoon: 'Gullfoss — the golden waterfall', evening: 'Þingvellir rift valley — UNESCO World Heritage', icon: '💥' },
        { day: 2, theme: 'Glacier & Lagoon', morning: 'Jökulsárlón Glacier Lagoon boat tour', afternoon: 'Glacier walk for older kids', evening: 'Hotel on the South Coast', icon: '🧊' },
        { day: 3, theme: 'Whale & Puffin', morning: 'Whale watching from Reykjavík harbor', afternoon: 'Puffin colony boat trip', evening: 'Blue Lagoon family soak farewell', icon: '🐋' },
      ],
    },
    aiInsight: {
      solo:    'Iceland rewards the solo traveler who embraces uncertainty. The aurora may or may not appear, the weather will change three times in an hour, and every road leads to something extraordinary. That unpredictability is the point — Iceland keeps you present.',
      couple:  'No destination creates aurora moments like Iceland. Lying in a geothermal hot pot as the green lights ripple overhead, or waking at 3am to a private lightshow over the glacier lagoon — these experiences bond people permanently.',
      friends: 'Iceland\'s Ring Road is one of the world\'s great group road trips. Split a Dacia Duster four ways, chase waterfalls, sleep under the aurora, and hike a glacier — then end in Reykjavík\'s surprisingly lively bar scene. Epic and surprisingly affordable per person.',
      family:  'Iceland makes geology tactile and unforgettable for children. A geyser erupting on schedule, whale flukes from a boat deck, puffins waddling on clifftops — these are experiences that shape how kids understand the natural world.',
    },
    mapCenter: { lat: 64.9631, lng: -19.0208 },
  },

  // Norway
  {
    id: 'norway',
    name: 'Norway',
    flag: '🇳🇴',
    heroImage: 'https://images.unsplash.com/photo-1601439678777-b2b3c56fa627?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1553521041-c29c4e8e8b3c?w=600&q=80',
    taglines: {
      solo:    'Fjords, silence, and northern sky drama',
      couple:  'The world\'s most dramatic romantic landscapes',
      friends: 'Fjord hiking and arctic adventures',
      family:  'Trolls, fjords, and the midnight sun',
    },
    weather: { temp: '8°C', condition: 'Cool & scenic', icon: '🏔️' },
    matchPercentage: 89,
    description: 'Norway\'s landscape is almost irresponsible in its beauty — fjords that cut 200km inland, mountains that drop sheer into glassy water, and northern skies that stage aurora displays of breathtaking scale. Add world-class hiking, Viking history, and Scandinavian design and you have one of Earth\'s greatest destinations.',
    currency: 'NOK (Norwegian Krone)',
    language: 'Norwegian, English',
    timezone: 'UTC+1 (CET)',
    positives: {
      solo:    ['Trolltunga and Preikestolen solo hiking', 'Incredibly safe country', 'English everywhere', 'Coastal Hurtigruten voyage', 'Strong outdoor culture'],
      couple:  ['Fjord village overnight stays', 'Aurora borealis in Tromsø', 'Dramatic proposal settings', 'Coastal ferry cruises', 'Intimate village restaurants'],
      friends: ['Via Ferrata extreme hiking', 'Lofoten Islands camping', 'Fjord kayaking', 'Viking history deep dives', 'Cabin culture (hytte)'],
      family:  ['Flåm Railway — the world\'s most scenic', 'Viking Ship Museum', 'Midnight sun in summer', 'Trolltunga junior trails', 'Safe and welcoming'],
    },
    negatives: {
      solo:    ['Among Europe\'s most expensive', 'Limited budget accommodation', 'Heavy rain and changeable weather', 'Aurora not guaranteed'],
      couple:  ['Very high cost for dining', 'Weather unreliable', 'Busy tourist trails in summer', 'Fjord towns can feel crowded'],
      friends: ['Expensive alcohol and food', 'Limited nightlife outside Oslo', 'Long distances between highlights', 'Car rental essential in most areas'],
      family:  ['High cost', 'Some hikes too strenuous for young children', 'Long travel between sites', 'Limited child-menu variety'],
    },
    hotels: [
      { id: 'juvet-landscape', name: 'Juvet Landscape Hotel', image: 'https://images.unsplash.com/photo-1601439678777-b2b3c56fa627?w=600&q=80', rating: 4.9, price: '$650/night', priceLevel: 'luxury', address: 'Alstad, Norddal, Norway', amenities: ['Floor-to-ceiling glass rooms', 'River views', 'Spa', 'Forest walks', 'Used in Ex Machina film'], description: 'The world\'s most photographed hotel — individual glass rooms suspended in the Juvet valley forest.', squadTags: ['couple', 'solo'] },
      { id: 'bergen-bors', name: 'Hotel Norge by Scandic', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.6, price: '$220/night', priceLevel: 'mid-range', address: 'Ole Bulls plass 4, Bergen', amenities: ['Central Bergen location', 'Rooftop bar', 'Fjord views', 'Breakfast buffet'], description: 'Bergen\'s best central hotel — steps from the Bryggen wharf and the Fløibanen funicular.', squadTags: ['family', 'couple', 'friends', 'solo'] },
      { id: 'lofoten-cabins', name: 'Lofoten Cabins', image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80', rating: 4.7, price: '$180/night', priceLevel: 'mid-range', address: 'Reine, Lofoten Islands', amenities: ['Traditional Norwegian rorbu', 'Mountain & fjord views', 'Fishing', 'Hiking access'], description: 'Traditional red fishermen\'s cabins (rorbu) in the most photographed village in Norway.', squadTags: ['couple', 'friends', 'family'] },
      { id: 'aurora-norte', name: 'Tromsø Arctic Lodge', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', rating: 4.8, price: '$280/night', priceLevel: 'luxury', address: 'Tromsø, Northern Norway', amenities: ['Aurora alert service', 'Snowmobile access', 'Dog sledding packages', 'Arctic spa'], description: 'Tromsø\'s premium aurora base — expert guides, real-time KP alerts, and snowmobile expeditions into the wilderness.', squadTags: ['couple', 'friends', 'solo'] },
    ],
    restaurants: [
      { id: 'maaemo-oslo', name: 'Maaemo', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.9, cuisine: 'New Nordic', description: 'Three Michelin stars — Norway\'s greatest restaurant, celebrating the pure beauty of Nordic ingredients.', price: '$$$$$', priceLevel: 'luxury', address: 'Schweigaards gate 15, Oslo', tags: ['michelin', '3-stars', 'tasting-menu'], squadTags: ['couple', 'solo'] },
      { id: 'bryggeloftet-bergen', name: 'Bryggeloftet & Stuene', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', rating: 4.6, cuisine: 'Norwegian Traditional', description: 'Classic Norwegian seafood and reindeer in a 14th-century Bryggen wharf building in Bergen.', price: '$$$', priceLevel: 'luxury', address: 'Bryggen 11, Bergen', tags: ['historic', 'seafood', 'reindeer'], squadTags: ['couple', 'family', 'friends'] },
      { id: 'mathallen-oslo', name: 'Mathallen Oslo Food Hall', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', rating: 4.5, cuisine: 'Nordic Market', description: 'Oslo\'s vibrant food hall with 30+ vendors — the best way to taste Norwegian food culture on any budget.', price: '$$', priceLevel: 'mid-range', address: 'Vulkan 5, Oslo', tags: ['food-hall', 'variety', 'local'], squadTags: ['solo', 'friends', 'family'] },
    ],
    activities: [
      { id: 'trolltunga', name: 'Trolltunga Hike', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', description: 'Norway\'s most iconic hike — 22km to the rock tongue suspended 700m above Lake Ringedalsvatnet.', duration: '10-12 hours', rating: 4.9, price: 'Free ($45 guide)', category: 'Adventure', accentColor: '#0EA5E9', squadTags: ['solo', 'friends', 'couple'] },
      { id: 'flam-railway', name: 'Flåm Railway', image: 'https://images.unsplash.com/photo-1553521041-c29c4e8e8b3c?w=600&q=80', description: 'The world\'s most scenic train — a 20km descent through 20 tunnels into the Aurlandsfjord.', duration: '1 hour', rating: 4.9, price: 'NOK 385', category: 'Nature', accentColor: '#10B981', squadTags: ['family', 'solo', 'couple', 'friends'] },
      { id: 'fjord-cruise', name: 'Nærøyfjord UNESCO Cruise', image: 'https://images.unsplash.com/photo-1601439678777-b2b3c56fa627?w=600&q=80', description: 'Sail through the Nærøyfjord — the narrowest and most dramatic UNESCO fjord in the world.', duration: '2 hours', rating: 4.9, price: 'NOK 370', category: 'Nature', accentColor: '#0EA5E9', squadTags: ['solo', 'couple', 'family', 'friends'] },
      { id: 'aurora-tromso', name: 'Aurora Borealis in Tromsø', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80', description: 'Norway\'s aurora capital — expert chases into the wilderness with KP 4+ success rates.', duration: '4-6 hours', rating: 4.8, price: '$90', category: 'Nature', accentColor: '#6366F1', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'lofoten-hike', name: 'Lofoten Islands Hiking', image: 'https://images.unsplash.com/photo-1469521669194-babb45599def?w=600&q=80', description: 'Dramatic peaks rise straight from the Arctic Sea — Europe\'s most spectacular hiking scenery.', duration: 'Full day', rating: 4.9, price: 'Free', category: 'Adventure', accentColor: '#EF4444', squadTags: ['solo', 'friends', 'couple'] },
    ],
    events: [
      { id: 'bergen-international-fest', name: 'Bergen International Festival', category: 'Music', date: 'May–Jun', matchPercentage: 87, description: 'Norway\'s largest cultural festival — classical music, opera, and dance across Bergen\'s historic venues.', squadTags: ['solo', 'couple', 'friends'] },
      { id: 'tromsoe-aurora-marathon', name: 'Tromsø Midnight Sun Marathon', category: 'Sport', date: 'Jun', matchPercentage: 83, description: 'Run the Tromsø half or full marathon at midnight under the continuous Arctic sun.', squadTags: ['solo', 'friends'] },
      { id: 'norway-national-day', name: 'Norwegian Constitution Day', category: 'Culture', date: 'May 17', matchPercentage: 88, description: 'Norway\'s national day — the world\'s largest constitutional parade, bunad traditional dress, and nationwide celebration.', squadTags: ['family', 'couple', 'solo', 'friends'] },
      { id: 'oslo-jazz', name: 'Oslo Jazz Festival', category: 'Music', date: 'Aug', matchPercentage: 81, description: 'Eight days of free and ticketed jazz concerts across Oslo\'s most beautiful venues.', squadTags: ['solo', 'couple', 'friends'] },
      { id: 'polar-night-jazz', name: 'Polar Night Jazz Festival', category: 'Music', date: 'Jan', matchPercentage: 85, description: 'Jazz concerts in Tromsø during the polar night — music warming the darkest months of the Arctic winter.', squadTags: ['couple', 'solo', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Bergen Gateway', morning: 'Bryggen wharf, historic Hanseatic district', afternoon: 'Fløibanen funicular — panoramic city and fjord views', evening: 'Solo dinner at Bryggeloftet, craft beer at Kode', icon: '🏙️' },
        { day: 2, theme: 'Flåm & Nærøyfjord', morning: 'Myrdal–Flåm scenic railway descent', afternoon: 'Nærøyfjord boat cruise — walls 1,000m high', evening: 'Flåm village night in a hytte cabin', icon: '🚞' },
        { day: 3, theme: 'Epic Hike', morning: 'Preikestolen (Pulpit Rock) sunrise start', afternoon: 'Summit photography and meditation', evening: 'Stavanger old town dinner', icon: '🧗' },
      ],
      couple: [
        { day: 1, theme: 'Fjord Arrival', morning: 'Bergen — Bryggen walk and fish market', afternoon: 'Fjord cruise on the Nærøyfjord', evening: 'Candlelit dinner in Flåm village', icon: '💕' },
        { day: 2, theme: 'Juvet Stay', morning: 'Drive to Juvet Landscape Hotel', afternoon: 'Juvet river spa and forest walk', evening: 'Private dinner in the glass room', icon: '🌲' },
        { day: 3, theme: 'Aurora Tromsø', morning: 'Fly to Tromsø', afternoon: 'Arctic cathedral and reindeer feeding', evening: 'Private aurora hunt under the Tromsø wilderness', icon: '🌌' },
      ],
      friends: [
        { day: 1, theme: 'Lofoten Arrival', morning: 'Fly to Bodø, ferry to Lofoten Islands', afternoon: 'Reine fishing village — iconic rorbu check-in', evening: 'Fresh Arctic cod dinner at the harbor', icon: '🐟' },
        { day: 2, theme: 'Hike Lofoten', morning: 'Reinebringen summit — 360° dramatic peaks', afternoon: 'Kayak through Lofoten sea channels', evening: 'Bonfire at the beach — midnight sun', icon: '🏔️' },
        { day: 3, theme: 'Via Ferrata', morning: 'Via Ferrata climbing on Lofoten rock faces', afternoon: 'Wild camp at a remote mountain lake', evening: 'Celebration dinner in Svolvær', icon: '🧗' },
      ],
      family: [
        { day: 1, theme: 'Bergen & Flåm', morning: 'Bergen Aquarium and fish market', afternoon: 'Flåm Railway descent — kids love every turn', evening: 'Flåm village — explore the old steam train', icon: '🚞' },
        { day: 2, theme: 'Fjord Day', morning: 'Nærøyfjord family boat cruise', afternoon: 'Stalheim Hotel — most dramatic viewpoint in Norway', evening: 'Voss for family cabin night', icon: '🚢' },
        { day: 3, theme: 'Oslo History', morning: 'Viking Ship Museum — actual Viking longships', afternoon: 'Vigeland Sculpture Park — giants and humans', evening: 'Oslo waterfront and opera house kids\' walk', icon: '⚔️' },
      ],
    },
    aiInsight: {
      solo:    'Norway gives the solo traveler the hardest thing to find: genuine silence in a genuinely beautiful place. The Trolltunga trail alone on an autumn morning, the Lofoten peaks above the Arctic Sea, the fjord at dawn — Norway rewards those who slow down and pay attention.',
      couple:  'Norway\'s fjords are inherently romantic in the most elemental way — the scale forces two people together, makes the world feel wide, and creates shared silence more intimate than any conversation. Add the aurora and you have one of the world\'s premier romantic destinations.',
      friends: 'The Lofoten Islands are one of Earth\'s great group adventures. Camp under the midnight sun, kayak between islands, hike to impossible summits, and eat fresh cod straight from the sea. It\'s the kind of trip that becomes a story for 30 years.',
      family:  'Norway teaches children that the world is vast and alive. The Flåm Railway, the Viking ships, the fjords, the midnight sun — each experience is educational and thrilling in a way that no classroom can replicate. Norway is where geography becomes adventure.',
    },
    mapCenter: { lat: 60.4720, lng: 8.4689 },
  },

  // South Africa
  {
    id: 'southafrica',
    name: 'South Africa',
    flag: '🇿🇦',
    heroImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80',
    taglines: {
      solo:    'Safari, Cape Coast, and cultural richness',
      couple:  'Big Five and Cape winelands romance',
      friends: 'Safari, surf, and incredible food',
      family:  'The ultimate Big Five family adventure',
    },
    weather: { temp: '22°C', condition: 'Sunny & warm', icon: '🌞' },
    matchPercentage: 88,
    description: 'South Africa offers remarkable diversity in one country — Cape Town\'s world-class city and Table Mountain, the Cape Winelands, the Garden Route\'s dramatic coastline, and the Kruger National Park\'s legendary Big Five safaris. The Rainbow Nation\'s culture and food scene add a unique dimension.',
    currency: 'ZAR (South African Rand)',
    language: '11 official languages (English widely spoken)',
    timezone: 'UTC+2 (SAST)',
    positives: {
      solo:    ['Excellent value for strong-currency visitors', 'Extremely diverse experiences', 'Cape Town\'s world-class city vibes', 'Strong backpacker culture', 'Epic road trips (Garden Route)'],
      couple:  ['Cape Winelands are deeply romantic', 'Private safari lodges', 'Whale watching Hermanus', 'Dramatic coastline drives', 'Award-winning restaurants'],
      friends: ['Kruger self-drive safari', 'Cape Town nightlife', 'Boulders Beach penguins', 'Excellent wine and food culture', 'Adventure sports (shark diving, skydiving)'],
      family:  ['Child-friendly safari lodges', 'Penguin beach at Boulders', 'Table Mountain cable car', 'Two Oceans Aquarium', 'Excellent family wildlife documentaries made real'],
    },
    negatives: {
      solo:    ['Safety vigilance required in cities', 'Car essential for most areas', 'Power outages (load shedding)', 'Health precautions for Kruger region'],
      couple:  ['Safety awareness needed', 'Malaria precautions required in Kruger', 'Wildlife driving requires patience', 'Flight transit lengthy from Europe/Americas'],
      friends: ['Safety awareness in Cape Town', 'Car hire essential', 'Malaria zone near Kruger', 'Some areas very remote'],
      family:  ['Malaria precautions for young children in Kruger', 'Safety vigilance required', 'Long drives between highlights', 'Sun protection critical'],
    },
    hotels: [
      { id: 'londolozi', name: 'Londolozi Private Game Reserve', image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80', rating: 4.9, price: '$1,400/night', priceLevel: 'luxury', address: 'Sabi Sand Game Reserve, Mpumalanga', amenities: ['Twice-daily game drives', 'Plunge pool', 'Conservation program', 'Sundowner drinks', 'Spa'], description: 'The gold standard of private game lodges — legendary leopard sightings and conservation heritage spanning 40 years.', squadTags: ['couple', 'solo'] },
      { id: 'belmond-mount-nelson', name: 'Belmond Mount Nelson Hotel', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', rating: 4.8, price: '$480/night', priceLevel: 'luxury', address: '76 Orange Street, Cape Town', amenities: ['Gardens', 'Afternoon tea', 'Pool', 'Table Mountain views', 'Legendary Sunday brunch'], description: 'Cape Town\'s grande dame — the Pink Hotel has hosted Churchill, Mandela, and the Dalai Lama.', squadTags: ['couple', 'family'] },
      { id: 'long-street-backpackers', name: 'Ashanti Lodge', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.5, price: '$30/night', priceLevel: 'budget', address: '11 Hof St, Cape Town', amenities: ['Pool', 'Bar', 'Travel desk', 'Dorm and private rooms', 'Safe storage'], description: 'Cape Town\'s most beloved backpacker lodge — social, safe, and steps from Long Street nightlife.', squadTags: ['solo', 'friends'] },
      { id: 'singita-lebombo', name: 'Singita Lebombo Lodge', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80', rating: 4.9, price: '$2,200/night', priceLevel: 'luxury', address: 'Kruger National Park, Mpumalanga', amenities: ['Infinity pool over Kruger', 'All-inclusive safari', 'Conservation research access', 'Spa', 'Plunge pool per suite'], description: 'Suspended above the N\'wanetsi River in Kruger — arguably the most dramatic game lodge position in Africa.', squadTags: ['couple', 'friends', 'family'] },
    ],
    restaurants: [
      { id: 'test-kitchen-ct', name: 'The Test Kitchen', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.9, cuisine: 'Contemporary SA', description: 'Consistently ranked Africa\'s best restaurant — a 20-course journey through South African flavors.', price: '$$$$', priceLevel: 'luxury', address: 'The Old Biscuit Mill, Cape Town', tags: ['best-in-africa', 'tasting-menu', 'innovative'], squadTags: ['couple', 'solo'] },
      { id: 'la-colombe', name: 'La Colombe', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', rating: 4.8, cuisine: 'Franco-Asian', description: 'Stunning mountain valley setting with the finest Franco-Asian tasting menu in the Cape.', price: '$$$', priceLevel: 'luxury', address: 'Silvermist Estate, Constantia Nek', tags: ['winelands', 'mountain', 'tasting-menu'], squadTags: ['couple', 'friends'] },
      { id: 'bo-kaap-kombuis', name: 'Bo-Kaap Kombuis', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', rating: 4.6, cuisine: 'Cape Malay', description: 'Authentic Cape Malay curry in the colorful Bo-Kaap neighborhood — koeksisters for dessert.', price: '$', priceLevel: 'budget', address: 'Bo-Kaap, Cape Town', tags: ['cape-malay', 'local', 'colorful'], squadTags: ['solo', 'friends', 'family'] },
    ],
    activities: [
      { id: 'big-five-safari', name: 'Kruger Big Five Game Drive', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80', description: 'Open vehicle game drive at dawn in the world\'s greatest game reserve — lion, leopard, elephant, rhino, buffalo.', duration: '4-6 hours', rating: 4.9, price: '$85', category: 'Nature', accentColor: '#D97706', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'table-mountain', name: 'Table Mountain Cable Car', image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80', description: 'Rotating cable car to the 1,086m flat summit — 360° views over Cape Town, both oceans, and beyond.', duration: '2-3 hours', rating: 4.9, price: 'R390', category: 'Nature', accentColor: '#10B981', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'cage-shark-diving', name: 'Great White Shark Cage Diving', image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=600&q=80', description: 'Gansbaai — the Great White Shark capital of the world. Face them through a steel cage in their natural habitat.', duration: '5-6 hours', rating: 4.8, price: 'R1,850', category: 'Adventure', accentColor: '#EF4444', squadTags: ['solo', 'friends', 'couple'] },
      { id: 'winelands-tour', name: 'Cape Winelands Tour', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', description: 'Stellenbosch and Franschhoek wine estates — world-class Pinotage and Chenin Blanc in a mountain vineyard setting.', duration: 'Full day', rating: 4.8, price: 'R600', category: 'Culture', accentColor: '#7C3AED', squadTags: ['couple', 'friends', 'solo'] },
      { id: 'boulders-penguins', name: 'African Penguin Colony at Boulders', image: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=600&q=80', description: 'Walk among 3,000 African penguins on the beach at Boulders — one of the world\'s most accessible penguin colonies.', duration: '1-2 hours', rating: 4.7, price: 'R152', category: 'Nature', accentColor: '#1D4ED8', squadTags: ['family', 'couple', 'solo', 'friends'] },
    ],
    events: [
      { id: 'cape-town-jazz', name: 'Cape Town International Jazz Festival', category: 'Music', date: 'Mar', matchPercentage: 88, description: 'Africa\'s largest jazz festival with 40+ international and local artists over two nights.', squadTags: ['solo', 'couple', 'friends'] },
      { id: 'wine-harvest', name: 'Cape Winelands Harvest Festival', category: 'Food', date: 'Feb–Apr', matchPercentage: 90, description: 'Harvest season in Stellenbosch and Franschhoek — grape stomping, barrel tastings, and harvest lunches.', squadTags: ['couple', 'friends', 'solo'] },
      { id: 'hermanus-whale', name: 'Hermanus Whale Festival', category: 'Nature', date: 'Sep', matchPercentage: 93, description: 'World\'s greatest land-based whale watching — southern right whales breach and calve in Walker Bay below the cliffs.', squadTags: ['family', 'couple', 'solo', 'friends'] },
      { id: 'sa-national-arts', name: 'National Arts Festival', category: 'Culture', date: 'Jul', matchPercentage: 82, description: 'Africa\'s largest arts festival in Makhanda — theatre, music, and visual arts from across the continent.', squadTags: ['solo', 'couple', 'friends'] },
      { id: 'cape-epic', name: 'Cape Epic Mountain Bike Race', category: 'Sport', date: 'Mar', matchPercentage: 84, description: 'The world\'s most prestigious mountain bike stage race — 8 days through the Cape Winelands and mountains.', squadTags: ['friends', 'solo'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Cape Town Discovery', morning: 'Table Mountain cable car at opening', afternoon: 'Bo-Kaap neighborhood and Cape Malay lunch', evening: 'Long Street night scene and live music', icon: '🏔️' },
        { day: 2, theme: 'Cape Peninsula', morning: 'Boulders Beach penguin colony', afternoon: 'Cape of Good Hope — southernmost point', evening: 'Hout Bay harbor seafood at Mariner\'s Wharf', icon: '🐧' },
        { day: 3, theme: 'Winelands Solo', morning: 'Franschhoek wine tram and tastings', afternoon: 'Stellenbosch university town walk', evening: 'Solo sunset at Jordan Winery', icon: '🍷' },
      ],
      couple: [
        { day: 1, theme: 'Cape Town Romance', morning: 'Table Mountain sunrise hike', afternoon: 'V&A Waterfront and seal watching', evening: 'Test Kitchen tasting menu dinner', icon: '❤️' },
        { day: 2, theme: 'Winelands Day', morning: 'Franschhoek couple\'s hot air balloon over vines', afternoon: 'La Colombe lunch in the mountains', evening: 'Vineyard hotel dinner at sunset', icon: '🎈' },
        { day: 3, theme: 'Safari Escape', morning: 'Drive north to private safari lodge', afternoon: 'Sunset game drive — Big Five search', evening: 'Bush dinner under the stars', icon: '🦁' },
      ],
      friends: [
        { day: 1, theme: 'Shark Day', morning: 'Pre-dawn drive to Gansbaai shark cage', afternoon: 'Shark cage dive with Great Whites', evening: 'Craft beer at Cape Brewing Company', icon: '🦈' },
        { day: 2, theme: 'Cape Adventure', morning: 'Abseil Table Mountain face (highest commercial abseil)', afternoon: 'Kitesurfing or surfing at Muizenberg', evening: 'Long Street bar crawl and live music', icon: '🪂' },
        { day: 3, theme: 'Safari Day Trip', morning: 'Aquila Private Game Reserve day safari', afternoon: 'Big Five sightings on open vehicle', evening: 'Cape Town final dinner at the Old Biscuit Mill', icon: '🦒' },
      ],
      family: [
        { day: 1, theme: 'Table Mountain & Penguins', morning: 'Table Mountain cable car — kids\' favorite', afternoon: 'Boulders Beach penguin colony walk', evening: 'Two Oceans Aquarium evening visit', icon: '🐧' },
        { day: 2, theme: 'Whale Watching', morning: 'Hermanus whale watching from cliff paths', afternoon: 'Rotary Way scenic drive — southern right whales', evening: 'Fresh seafood in Hermanus village', icon: '🐋' },
        { day: 3, theme: 'Kruger Safari', morning: 'Fly to Kruger — family-friendly lodge', afternoon: 'Afternoon game drive — elephant and giraffe', evening: 'Bonfire bush dinner and ranger talk', icon: '🐘' },
      ],
    },
    aiInsight: {
      solo:    'South Africa is exceptional value for the solo traveler — the rand makes it one of the world\'s best budget-luxury destinations. Cape Town is unambiguously one of the world\'s great cities, the Garden Route is one of its great road trips, and Kruger is simply the world\'s greatest wildlife experience.',
      couple:  'South Africa combines the world\'s two most romantic travel paradigms: the Big Five safari and the vineyard escape. A private game lodge at Londolozi followed by Franschhoek wine estates creates a diversity of intimate settings that few destinations can match.',
      friends: 'South Africa for friends is a highlight reel. Shark cage diving, Table Mountain abseil, Kruger open-vehicle game drives, Cape Town nightlife, and a wine region that rivals Bordeaux — all at a price that makes splitting costs easy. It\'s a serious group trip.',
      family:  'South Africa is where children\'s wildlife knowledge becomes real. The Boulders Beach penguins, the Hermanus whale, the Kruger elephant family — these experiences create a generation of wildlife stewards. Cape Town is the world\'s most family-friendly major city.',
    },
    mapCenter: { lat: -30.5595, lng: 22.9375 },
  },

  // Finland
  {
    id: 'finland',
    name: 'Finland',
    flag: '🇫🇮',
    heroImage: 'https://images.unsplash.com/photo-1551524358-f34c9c5f3a36?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80',
    taglines: {
      solo:    'Sauna, silence, and the northern lights',
      couple:  'Arctic romance under the aurora',
      friends: 'Husky sleds and ice fishing adventures',
      family:  'Santa Claus, reindeer, and magic snow',
    },
    weather: { temp: '-5°C', condition: 'Snowy & arctic', icon: '❄️' },
    matchPercentage: 88,
    description: 'Finland is the authentic arctic experience — aurora borealis blazing over frozen lakes, silence so complete you can hear snowflakes land, and the world\'s most serious sauna culture. Lapland in winter is where Santa Claus supposedly lives. In summer, the midnight sun turns the landscape golden for weeks.',
    currency: 'EUR (Euro)',
    language: 'Finnish, Swedish, English',
    timezone: 'UTC+2 (EET)',
    positives: {
      solo:    ['Complete wilderness solitude', 'World\'s best sauna culture', 'Aurora in pristine dark skies', 'Incredibly safe', 'Well-marked hiking trails'],
      couple:  ['Glass igloo aurora viewing', 'Reindeer sleigh rides', 'Private sauna with lake views', 'Arctic spa retreats', 'Cozy hytte romance'],
      friends: ['Husky sled expeditions', 'Ice fishing on frozen lakes', 'Snowmobile safaris', 'Lapland wilderness camps', 'Santa Village fun'],
      family:  ['Santa Claus Village in Rovaniemi', 'Reindeer farm visits', 'Elf Academy for kids', 'Husky rides', 'Magical snow experiences'],
    },
    negatives: {
      solo:    ['Expensive', 'Very cold and dark in winter', 'Isolated if not winter sports inclined', 'Limited English menus in rural areas'],
      couple:  ['Extreme cold requires full gear', 'Very expensive', 'Aurora not guaranteed every night', 'Remote areas hard to reach'],
      friends: ['High costs for winter activities', 'Limited nightlife in Lapland', 'Arctic conditions require preparation', 'Short daylight in winter'],
      family:  ['Very expensive family packages', 'Young children may find cold challenging', 'Santa packages heavily commercialized', 'Limited dining variety in remote areas'],
    },
    hotels: [
      { id: 'arctic-treehouse', name: 'Arctic TreeHouse Hotel', image: 'https://images.unsplash.com/photo-1551524358-f34c9c5f3a36?w=600&q=80', rating: 4.8, price: '$580/night', priceLevel: 'luxury', address: 'Tähtitie 2, Rovaniemi', amenities: ['Glass-ceiling aurora suites', 'Treehouse units', 'Arctic restaurant', 'Sauna', 'Activities desk'], description: 'Architectural masterpiece in the Arctic Circle — glass-ceiling rooms designed for aurora watching from bed.', squadTags: ['couple', 'solo'] },
      { id: 'kakslauttanen', name: 'Kakslauttanen Arctic Resort', image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&q=80', rating: 4.9, price: '$750/night', priceLevel: 'luxury', address: 'Saariselkä, Finnish Lapland', amenities: ['Glass igloos', 'Log cabins', 'Reindeer safaris', 'Husky rides', 'Private sauna'], description: 'The world\'s most famous glass igloos — sleep under the aurora in thermal glass bubbles in the Lapland wilderness.', squadTags: ['couple', 'family', 'friends'] },
      { id: 'lapland-hotels-sky', name: 'Lapland Hotels Sky Ounasvaara', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', rating: 4.5, price: '$280/night', priceLevel: 'mid-range', address: 'Joutsenlammintie 8, Rovaniemi', amenities: ['Hill views', 'Wellness spa', 'Ski slopes adjacent', 'Restaurant'], description: 'Comfortable mid-range base in Rovaniemi with great spa and direct access to Ounasvaara ski hill.', squadTags: ['family', 'friends'] },
      { id: 'hotel-fabian', name: 'Hotel Fabian', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.7, price: '$180/night', priceLevel: 'mid-range', address: 'Fabianinkatu 7, Helsinki', amenities: ['Central Helsinki', 'Design aesthetic', 'Rooftop sauna', 'City views'], description: 'Helsinki\'s most stylish boutique hotel — Finnish design, rooftop sauna, and market square views.', squadTags: ['solo', 'couple', 'friends'] },
    ],
    restaurants: [
      { id: 'ask-helsinki', name: 'Restaurant Ask', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.8, cuisine: 'Nordic Finnish', description: 'Helsinki\'s finest tasting menu — foraged mushrooms, lake fish, and reindeer prepared with Nordic precision.', price: '$$$$', priceLevel: 'luxury', address: 'Vironkatu 8, Helsinki', tags: ['tasting-menu', 'nordic', 'foraged'], squadTags: ['couple', 'solo'] },
      { id: 'kokkeli-rovaniemi', name: 'Arctic Restaurant Kokkeli', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', rating: 4.6, cuisine: 'Lapland', description: 'Reindeer stew, smoked salmon, and lingonberry desserts in a traditional Lapland log restaurant.', price: '$$', priceLevel: 'mid-range', address: 'Rovaniemi, Finnish Lapland', tags: ['reindeer', 'lapland', 'traditional'], squadTags: ['family', 'couple', 'friends', 'solo'] },
      { id: 'story-helsinki', name: 'Story', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', rating: 4.5, cuisine: 'Finnish Contemporary', description: 'Modern Finnish cuisine in a Helsinki design hotel — fresh local ingredients with creative Nordic presentation.', price: '$$', priceLevel: 'mid-range', address: 'Bulevardi 12, Helsinki', tags: ['modern-finnish', 'design', 'local'], squadTags: ['solo', 'friends', 'couple'] },
    ],
    activities: [
      { id: 'aurora-lapland', name: 'Northern Lights Aurora Hunt', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80', description: 'Snowmobile into the wilderness for expert-guided aurora viewing far from any light pollution.', duration: '4-5 hours', rating: 4.9, price: '€95', category: 'Nature', accentColor: '#6366F1', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'husky-safari', name: 'Husky Dog Sled Safari', image: 'https://images.unsplash.com/photo-1551524358-f34c9c5f3a36?w=600&q=80', description: 'Mush a team of huskies through silent snow forests — an utterly unforgettable Arctic experience.', duration: '2-4 hours', rating: 4.9, price: '€130', category: 'Adventure', accentColor: '#F97316', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'santa-village', name: 'Santa Claus Village', image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&q=80', description: 'Meet Santa at the official village on the Arctic Circle — reindeer, elves, and genuine winter magic.', duration: 'Full day', rating: 4.7, price: '€30-200', category: 'Culture', accentColor: '#EF4444', squadTags: ['family'] },
      { id: 'ice-fishing', name: 'Ice Fishing on a Frozen Lake', image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&q=80', description: 'Drill through 60cm of ice and fish for perch in the silence of a Lapland frozen lake.', duration: '3 hours', rating: 4.6, price: '€75', category: 'Nature', accentColor: '#0EA5E9', squadTags: ['solo', 'friends', 'family', 'couple'] },
      { id: 'finnish-sauna', name: 'Traditional Finnish Sauna Experience', image: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=600&q=80', description: 'Heat to 80°C, then plunge into a frozen lake — the most authentically Finnish experience possible.', duration: '2-3 hours', rating: 4.9, price: '€40', category: 'Wellness', accentColor: '#92400E', squadTags: ['solo', 'couple', 'friends', 'family'] },
    ],
    events: [
      { id: 'rovaniemi-reindeer-races', name: 'Rovaniemi Reindeer Races', category: 'Sport', date: 'Mar', matchPercentage: 88, description: 'Sámi herders race their reindeer on the Ounasjoki River ice — the most authentic Lapland cultural event.', squadTags: ['family', 'friends', 'solo'] },
      { id: 'slush-helsinki', name: 'SLUSH Startup Conference', category: 'Tech', date: 'Nov', matchPercentage: 75, description: 'Europe\'s leading startup event in Helsinki — 25,000 attendees and the world\'s tech innovators.', squadTags: ['solo', 'friends'] },
      { id: 'midsummer-finland', name: 'Midsummer (Juhannus)', category: 'Culture', date: 'Jun 21', matchPercentage: 87, description: 'Finland\'s most celebrated holiday — bonfires by the lake, sauna, and the midnight sun at its peak.', squadTags: ['couple', 'friends', 'family', 'solo'] },
      { id: 'aurora-borealis-season', name: 'Aurora Season Peak', category: 'Nature', date: 'Sep–Mar', matchPercentage: 96, description: 'Finnish Lapland is one of Earth\'s best aurora locations — 200+ nights per year with visible displays.', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'sauna-world-championship', name: 'World Sauna Championships (Informal)', category: 'Culture', date: 'Jul–Aug', matchPercentage: 78, description: 'Finland takes sauna seriously enough to celebrate it — national sauna day and public bathhouse culture year-round.', squadTags: ['solo', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Helsinki Nordic Day', morning: 'Helsinki Market Square and cathedral', afternoon: 'Löyly Helsinki — lakeside public sauna', evening: 'Solo aurora forecast check — flight to Rovaniemi', icon: '🏙️' },
        { day: 2, theme: 'Arctic Arrival', morning: 'Rovaniemi — Arctic Circle crossing ceremony', afternoon: 'Reindeer farm visit and sled ride', evening: 'Glass igloo night — aurora watch until dawn', icon: '🌌' },
        { day: 3, theme: 'Wilderness', morning: 'Solo husky sled through silent snow forest', afternoon: 'Ice fishing on a frozen lake', evening: 'Private lakeside sauna at sunset', icon: '🛷' },
      ],
      couple: [
        { day: 1, theme: 'Lapland Romance', morning: 'Fly to Rovaniemi — Arctic TreeHouse check-in', afternoon: 'Couple\'s reindeer sled through forest', evening: 'Glass-ceiling room — wait for the aurora together', icon: '💕' },
        { day: 2, theme: 'Aurora Night', morning: 'Snowmobile expedition into wilderness', afternoon: 'Couple\'s lakeside sauna experience', evening: 'Private aurora photography tour', icon: '✨' },
        { day: 3, theme: 'Cozy Departure', morning: 'Ice fishing on frozen lake', afternoon: 'Farewell reindeer stew lunch', evening: 'Helsinki overnight — design district dinner', icon: '❄️' },
      ],
      friends: [
        { day: 1, theme: 'Arrive Rovaniemi', morning: 'Group husky sled race', afternoon: 'Snowmobile safari in the wilderness', evening: 'Lapland cabin dinner and sauna', icon: '🛷' },
        { day: 2, theme: 'Ice Adventures', morning: 'Ice fishing competition on the lake', afternoon: 'Reindeer herding activity', evening: 'Aurora hunt by snowmobile', icon: '🎣' },
        { day: 3, theme: 'Helsinki City', morning: 'Flight to Helsinki — design district', afternoon: 'Finnish food market at Hakaniemi', evening: 'Helsinki nightlife — cocktail bars and sauna bars', icon: '🍸' },
      ],
      family: [
        { day: 1, theme: 'Santa Day', morning: 'Santa Claus Village — meet Santa personally', afternoon: 'Elf Academy and letter writing', evening: 'Reindeer stew dinner and early lights-out for aurora', icon: '🎅' },
        { day: 2, theme: 'Snow Magic', morning: 'Family husky sled ride', afternoon: 'Snowshoe hike in the forest', evening: 'Kakslauttanen glass igloo — aurora for the whole family', icon: '🌌' },
        { day: 3, theme: 'Ice Fun', morning: 'Ice fishing and snowball games on the lake', afternoon: 'Reindeer farm — feed and pet the reindeer', evening: 'Farewell family sauna by the lake', icon: '🦌' },
      ],
    },
    aiInsight: {
      solo:    'Finland offers the solo traveler something increasingly rare: genuine, uninterrupted silence. The Lapland wilderness in winter is as far as you can get from the noise of modern life. Add the aurora, the sauna, and the lake plunge, and you have a reset that goes deeper than a holiday.',
      couple:  'Watching the aurora from a glass igloo together, mushing huskies in silence through a snow-covered forest, heating in a lakeside sauna before plunging into ice — Finland creates arctic intimacy that is completely unlike anywhere else on Earth.',
      friends: 'Finland is the wildcard group trip that everyone remembers. Husky racing, snowmobile expeditions, ice fishing, and sauna competitions — the activities are unique, the landscape is otherworldly, and the aurora as a backdrop makes every moment feel cinematic.',
      family:  'Finland is the only place where Santa Claus is genuinely real. The entire Lapland infrastructure exists to create childhood magic — and it works completely. Beyond Santa, the husky rides, the reindeer, the ice fishing, and the aurora are experiences that children carry for life.',
    },
    mapCenter: { lat: 61.9241, lng: 25.7482 },
  },

  // Sweden
  {
    id: 'sweden',
    name: 'Sweden',
    flag: '🇸🇪',
    heroImage: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=600&q=80',
    taglines: {
      solo:    'Design, wilderness, and northern sky spectacles',
      couple:  'Stockholm romance and aurora in Abisko',
      friends: 'Arctic adventures and Scandinavian cool',
      family:  'Vikings, aurora, and a fairytale capital',
    },
    weather: { temp: '7°C', condition: 'Nordic & crisp', icon: '🌿' },
    matchPercentage: 87,
    description: 'Sweden combines one of the world\'s most beautiful capital cities with vast Arctic wilderness. Stockholm\'s design culture, culinary scene, and archipelago are world-class. Travel north and you reach Abisko — where clear skies make it Europe\'s top aurora spot — plus Kiruna\'s Ice Hotel and the midnight sun above the Arctic Circle.',
    currency: 'SEK (Swedish Krona)',
    language: 'Swedish, English',
    timezone: 'UTC+1 (CET)',
    positives: {
      solo:    ['Stockholm is supremely solo-friendly', 'Excellent design and culture scene', 'Abisko has the clearest skies for aurora', 'Right to roam (allemansrätten) enables wilderness freedom', 'Safe and English-speaking'],
      couple:  ['Stockholm archipelago romantic boat trips', 'Abisko aurora watching', 'Ice Hotel couple\'s suites', 'Cozy Nordic fika culture', 'World-class spa resorts'],
      friends: ['Stockholm nightlife is excellent', 'ICEHOTEL group adventure', 'Northern Sweden wilderness hiking', 'Swedish craft beer scene', 'Midsummer celebrations legendary'],
      family:  ['ABBA Museum for all ages', 'Vasa Museum — preserved 1628 warship', 'Junibacken Astrid Lindgren Museum', 'Aurora for children', 'Family-friendly public transport'],
    },
    negatives: {
      solo:    ['Expensive', 'Arctic north requires planning', 'Limited budget options in Stockholm', 'Winter very cold and dark'],
      couple:  ['Very expensive city', 'Ice Hotel extremely cold at night', 'Aurora not guaranteed', 'Limited warm-weather beach'],
      friends: ['High alcohol and food costs', 'Limited budget nightlife', 'Arctic north requires proper gear', 'Long distances to reach Abisko'],
      family:  ['Very expensive for families', 'Long journey to reach Lapland', 'Winter conditions challenging for young children', 'Museum crowds in peak season'],
    },
    hotels: [
      { id: 'icehotel-sweden', name: 'ICEHOTEL', image: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=600&q=80', rating: 4.9, price: '$650/night', priceLevel: 'luxury', address: 'Marknadsvägen 63, Jukkasjärvi', amenities: ['Hand-sculpted ice suites', 'Aurora wake-up service', 'Northern lights tours', 'Snowmobile access', 'Art suites'], description: 'The world\'s original ice hotel — rebuilt each winter from Torne River ice, with unique artist-designed suites.', squadTags: ['couple', 'friends'] },
      { id: 'grand-hotel-stockholm', name: 'Grand Hôtel Stockholm', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80', rating: 4.8, price: '$540/night', priceLevel: 'luxury', address: 'Södra Blasieholmshamnen 8, Stockholm', amenities: ['Royal Palace views', 'Veranda restaurant', 'Spa', 'Bar', 'Waterfront terrace'], description: 'Stockholm\'s legendary grand hotel opposite the Royal Palace — Nobel Prize guests stay here every December.', squadTags: ['couple', 'solo'] },
      { id: 'stf-chapman', name: 'STF af Chapman Hostel', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.4, price: '$50/night', priceLevel: 'budget', address: 'Flaggmansvägen 8, Stockholm', amenities: ['Sleeping on a tall ship', 'Gamla Stan views', 'Social common areas', 'Affordable private rooms'], description: 'Sleep aboard an historic sailing ship in Stockholm harbor with Old Town views — one of Europe\'s most unique hostels.', squadTags: ['solo', 'friends'] },
      { id: 'abisko-mountain-station', name: 'Abisko Mountain Station', image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&q=80', rating: 4.6, price: '$180/night', priceLevel: 'mid-range', address: 'Abisko, Swedish Lapland', amenities: ['Aurora Sky Station access', 'Guided wilderness tours', 'Lake Torneträsk views', 'Restaurant', 'Sauna'], description: 'The gateway to Aurora Sky Station — the world\'s best aurora viewing platform, accessible only by chairlift.', squadTags: ['solo', 'couple', 'friends', 'family'] },
    ],
    restaurants: [
      { id: 'frantzen-stockholm', name: 'Frantzén', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.9, cuisine: 'Nordic Contemporary', description: 'Three Michelin stars — Sweden\'s most celebrated restaurant and consistently among the world\'s top 10.', price: '$$$$$', priceLevel: 'luxury', address: 'Klara Norra kyrkogata 26, Stockholm', tags: ['michelin', '3-stars', 'nordic'], squadTags: ['couple', 'solo'] },
      { id: 'pelikan-stockholm', name: 'Pelikan', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', rating: 4.6, cuisine: 'Swedish Traditional', description: 'Classic 1904 beer hall serving the best Swedish meatballs in Stockholm — husmanskost at its finest.', price: '$$', priceLevel: 'mid-range', address: 'Blekingegatan 40, Stockholm', tags: ['meatballs', 'traditional', 'beer-hall'], squadTags: ['solo', 'friends', 'family', 'couple'] },
      { id: 'icehotel-365', name: 'ICEHOTEL 365 Ice Bar', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', rating: 4.5, cuisine: 'Arctic', description: 'Cocktails in ice glasses in a bar maintained at -5°C year-round — the most unique drinking experience in Sweden.', price: '$$$', priceLevel: 'luxury', address: 'Jukkasjärvi, Swedish Lapland', tags: ['ice-bar', 'unique', 'arctic'], squadTags: ['friends', 'couple', 'solo'] },
    ],
    activities: [
      { id: 'abisko-aurora', name: 'Aurora Sky Station — Abisko', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80', description: 'Chairlift to Europe\'s best aurora viewing platform — a microclimate above the clouds in Swedish Lapland.', duration: '4-6 hours', rating: 4.9, price: 'SEK 1,250', category: 'Nature', accentColor: '#6366F1', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'stockholm-archipelago', name: 'Stockholm Archipelago Boat Tour', image: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=600&q=80', description: 'Cruise the 30,000-island archipelago — pine forests, red cottages, and swimming in crystal Baltic water.', duration: 'Full day', rating: 4.8, price: 'SEK 450', category: 'Nature', accentColor: '#0EA5E9', squadTags: ['family', 'couple', 'solo', 'friends'] },
      { id: 'vasa-museum', name: 'Vasa Museum', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80', description: 'The world\'s best-preserved 17th-century warship — raised from Stockholm harbor after 333 years underwater.', duration: '2 hours', rating: 4.9, price: 'SEK 190', category: 'History', accentColor: '#92400E', squadTags: ['family', 'couple', 'solo', 'friends'] },
      { id: 'husky-sweden', name: 'Husky Sledding in Swedish Lapland', image: 'https://images.unsplash.com/photo-1551524358-f34c9c5f3a36?w=600&q=80', description: 'Drive your own dog sled team through the silent Lapland forest — an unforgettable Arctic experience.', duration: '2-4 hours', rating: 4.9, price: 'SEK 1,400', category: 'Adventure', accentColor: '#F97316', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'gamla-stan', name: 'Gamla Stan (Old Town) Walking Tour', image: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=600&q=80', description: 'Explore Stockholm\'s medieval island city — cobblestones, Nobel Museum, and the Royal Palace changing of the guard.', duration: '2-3 hours', rating: 4.7, price: 'Free (guided: SEK 200)', category: 'Culture', accentColor: '#EF4444', squadTags: ['solo', 'family', 'couple', 'friends'] },
    ],
    events: [
      { id: 'midsommar', name: 'Midsommar (Midsummer)', category: 'Culture', date: 'Jun (last Fri)', matchPercentage: 93, description: 'Sweden\'s most beloved celebration — maypole dancing, flower crowns, schnapps, and the midnight sun.', squadTags: ['friends', 'couple', 'family', 'solo'] },
      { id: 'nobel-prize-week', name: 'Nobel Prize Ceremony Week', category: 'Culture', date: 'Dec 10', matchPercentage: 82, description: 'Stockholm transforms for Nobel Week — public lectures, the prestigious ceremony, and the Nobel Banquet.', squadTags: ['solo', 'couple'] },
      { id: 'abba-voyage', name: 'ABBA Voyage Concert (Stockholm)', category: 'Music', date: 'Year-round', matchPercentage: 86, description: 'ABBA\'s revolutionary digital concert experience in Stockholm — holographic ABBA performing their greatest hits.', squadTags: ['friends', 'family', 'couple', 'solo'] },
      { id: 'stockholm-design-week', name: 'Stockholm Design Week', category: 'Art', date: 'Feb', matchPercentage: 80, description: 'The world\'s leading Scandinavian design event — showrooms, talks, and installations across Stockholm.', squadTags: ['solo', 'couple', 'friends'] },
      { id: 'aurora-season-sweden', name: 'Aurora Season — Swedish Lapland', category: 'Nature', date: 'Sep–Mar', matchPercentage: 95, description: 'Abisko\'s unique microclimate gives it the highest aurora visibility rate in all of Scandinavia.', squadTags: ['solo', 'couple', 'friends', 'family'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Stockholm Design City', morning: 'Gamla Stan medieval Old Town walk', afternoon: 'Vasa Museum — 17th-century warship', evening: 'Södermalm design district and solo dinner at Pelikan', icon: '⚓' },
        { day: 2, theme: 'Archipelago Escape', morning: 'Day boat to outer archipelago islands', afternoon: 'Swimming and forest hiking on a car-free island', evening: 'Return to Stockholm — rooftop bar sunset', icon: '🛥️' },
        { day: 3, theme: 'Abisko Aurora', morning: 'Night train to Swedish Lapland (sleeper)', afternoon: 'Arrive Abisko — husky walk preparation', evening: 'Aurora Sky Station chairlift — aurora hunt', icon: '🌌' },
      ],
      couple: [
        { day: 1, theme: 'Stockholm Romance', morning: 'Grand Hôtel breakfast with Royal Palace view', afternoon: 'Archipelago boat cruise together', evening: 'Frantzén tasting menu dinner', icon: '💕' },
        { day: 2, theme: 'ICEHOTEL Journey', morning: 'Fly to Kiruna — ICEHOTEL check-in', afternoon: 'Reindeer sled couple\'s tour', evening: 'Art Ice Suite under — aurora wake-up service', icon: '🧊' },
        { day: 3, theme: 'Aurora Peak', morning: 'Abisko Aurora Sky Station — best view in Europe', afternoon: 'Hot spring outdoor pool with mountain views', evening: 'Final Arctic dinner by candlelight', icon: '✨' },
      ],
      friends: [
        { day: 1, theme: 'Stockholm Party Base', morning: 'ABBA Museum group visit', afternoon: 'Skansen open-air museum', evening: 'Stockholm nightlife — Stureplan area', icon: '🎵' },
        { day: 2, theme: 'Midsummer Traditions', morning: 'Archipelago boat trip', afternoon: 'Midsummer celebration at island farmhouse', evening: 'Schnapps, herrings, and dancing around the maypole', icon: '🌸' },
        { day: 3, theme: 'Arctic Adventure', morning: 'Fly to Kiruna — husky sled group race', afternoon: 'ICEHOTEL tour and ice bar cocktails', evening: 'Aurora hunt from Abisko', icon: '🛷' },
      ],
      family: [
        { day: 1, theme: 'Stockholm Kids\' Favorites', morning: 'Junibacken — Pippi Longstocking museum', afternoon: 'Vasa Museum — kids love the warship', evening: 'Djurgården island evening walk', icon: '⚓' },
        { day: 2, theme: 'Archipelago Discovery', morning: 'Family boat to island — swim and explore', afternoon: 'Rock crab fishing and rockpool games', evening: 'Outdoor summer dinner on the island', icon: '🦀' },
        { day: 3, theme: 'Aurora Magic', morning: 'Fly to Kiruna — Santa track', afternoon: 'Reindeer farm and feeding', evening: 'Family aurora viewing from Abisko station', icon: '🌌' },
      ],
    },
    aiInsight: {
      solo:    'Sweden gives the solo traveler two completely different worlds in one trip: Stockholm\'s design-forward urban culture and Abisko\'s total Arctic wilderness. The combination is rare and rewards travelers who like both depth and contrast.',
      couple:  'From a Grand Hôtel Stockholm breakfast opposite the Royal Palace to an ICEHOTEL art suite with an aurora wake-up call, Sweden delivers the full spectrum of Nordic romance — sophisticated city, wilderness drama, and the northern sky\'s most spectacular lightshow.',
      friends: 'Midsommar in Sweden is the quintessential group travel experience — flower crowns, schnapps, herring, dancing, midnight sun, and the warmest celebration in Scandinavia. Add the ICEHOTEL and Abisko aurora and you have a group trip unlike any other.',
      family:  'Sweden is a children\'s wonderland. Stockholm has Pippi Longstocking and the 400-year-old warship. Lapland has reindeer, huskies, and the aurora. The culture is child-friendly at every level, and Sweden\'s public transport makes family navigation completely stress-free.',
    },
    mapCenter: { lat: 60.1282, lng: 18.6435 },
  },

  // Canada
  {
    id: 'canada',
    name: 'Canada',
    flag: '🇨🇦',
    heroImage: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80',
    taglines: {
      solo:    'Wilderness at the edge of the infinite',
      couple:  'Banff, aurora, and the Rockies together',
      friends: 'Epic adventures from coast to coast',
      family:  'The world\'s greatest outdoor playground',
    },
    weather: { temp: '12°C', condition: 'Variable & vast', icon: '🍁' },
    matchPercentage: 92,
    description: 'Canada\'s scale is almost incomprehensible — the Rocky Mountains of Banff and Jasper, the aurora borealis of Yukon, the whale-filled Pacific, the dramatic Atlantic coastline, and world-class cities like Vancouver and Montreal. The country rewards explorers with experiences that feel genuinely untouched.',
    currency: 'CAD (Canadian Dollar)',
    language: 'English, French',
    timezone: 'UTC-3.5 to UTC-8 (multiple zones)',
    positives: {
      solo:    ['Incredible wilderness for solo hiking', 'Aurora in Yukon with minimal light pollution', 'Very safe country', 'Trans-Canada rail journey', 'Cosmopolitan cities (Vancouver, Toronto, Montreal)'],
      couple:  ['Banff\'s Fairmont hotel and mountain lakes', 'Northern lights in Yukon', 'Whale watching Pacific and Atlantic', 'Quebec City winter romance', 'National park camping'],
      friends: ['Whistler skiing — North America\'s best', 'Vancouver food scene', 'White water rafting Kicking Horse', 'Coast to coast road trips', 'Montreal nightlife'],
      family:  ['Niagara Falls family wonder', 'Banff cable car and glacier walks', 'Vancouver Island whale watching', 'Quebec City winter carnival', 'Unparalleled outdoor education'],
    },
    negatives: {
      solo:    ['Vast distances require expensive flights', 'Car essential for most wilderness', 'Bears require awareness in backcountry', 'Expensive accommodation in peak season'],
      couple:  ['Great distances between highlights', 'Peak season Banff very crowded', 'Expensive for non-USD currencies', 'Aurora requires Yukon detour from Rockies'],
      friends: ['Whistler is very expensive', 'Long drives between cities', 'Group accommodation hard to find', 'Cost can be high for large groups'],
      family:  ['Very large country — pick a region', 'Wildlife safety education needed', 'Expensive activities', 'Jet lag from European travel'],
    },
    hotels: [
      { id: 'fairmont-banff-springs', name: 'Fairmont Banff Springs', image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=600&q=80', rating: 4.8, price: '$650/night', priceLevel: 'luxury', address: '405 Spray Ave, Banff, AB', amenities: ['Castle hotel in the Rockies', 'Rockies golf course', 'Willow Stream Spa', 'Multiple restaurants', 'Ski access'], description: 'The Castle in the Rockies — Fairmont\'s Banff Springs is the most iconic hotel in Canada, surrounded by three mountain ranges.', squadTags: ['couple', 'family'] },
      { id: 'auberge-saint-antoine', name: 'Auberge Saint-Antoine', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.8, price: '$380/night', priceLevel: 'luxury', address: '8 Rue Saint-Antoine, Quebec City', amenities: ['Historic artifacts displayed', 'Panache restaurant', 'Spa', 'Old Quebec views'], description: 'Quebec City\'s finest boutique hotel — built over a historic merchant wharf with 16th-century artifacts embedded in the walls.', squadTags: ['couple', 'solo'] },
      { id: 'hi-banff', name: 'HI Banff Alpine Centre', image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80', rating: 4.5, price: '$40/night', priceLevel: 'budget', address: '801 Hidden Ridge Way, Banff, AB', amenities: ['Mountain views', 'Cafe', 'Outdoor terrace', 'Hiking maps', 'Gear storage'], description: 'The best budget base in Banff — mountain views, a great café, and the heart of the Canadian Rockies hiking community.', squadTags: ['solo', 'friends'] },
      { id: 'fogo-island-inn', name: 'Fogo Island Inn', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', rating: 4.9, price: '$1,800/night', priceLevel: 'luxury', address: 'Joe Batt\'s Arm, Fogo Island, NL', amenities: ['Ocean platform suites', 'Local cuisine', 'Artisan program', 'Iceberg viewing', 'Snowshoe access'], description: 'Canada\'s most extraordinary hotel — a gravity-defying architectural marvel on a remote Newfoundland island with iceberg views.', squadTags: ['couple', 'solo'] },
    ],
    restaurants: [
      { id: 'toqué-montreal', name: 'Toqué!', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.9, cuisine: 'Québécois Contemporary', description: 'The restaurant that defined modern Québécois cuisine — 30 years of seasonal perfection in Montreal.', price: '$$$$', priceLevel: 'luxury', address: '900 Place Jean-Paul-Riopelle, Montreal', tags: ['quebecois', 'seasonal', 'tasting-menu'], squadTags: ['couple', 'solo'] },
      { id: 'bear-street-tavern', name: 'Bear Street Tavern', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', rating: 4.6, cuisine: 'Canadian', description: 'The best après-ski and casual dining in Banff — wood-fired pizzas and craft beers with Rocky Mountain views.', price: '$$', priceLevel: 'mid-range', address: '211 Bear St, Banff, AB', tags: ['apres-ski', 'craft-beer', 'casual'], squadTags: ['friends', 'family', 'couple', 'solo'] },
      { id: 'au-pied-de-cochon', name: 'Au Pied de Cochon', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', rating: 4.8, cuisine: 'Québécois', description: 'Martin Picard\'s legendary temple to pork and foie gras — the most indulgent and celebrated casual restaurant in Canada.', price: '$$', priceLevel: 'mid-range', address: '536 Avenue Duluth Est, Montreal', tags: ['legendary', 'pork', 'foie-gras'], squadTags: ['friends', 'solo', 'couple'] },
    ],
    activities: [
      { id: 'banff-lake-louise', name: 'Lake Louise & Moraine Lake', image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80', description: 'Canoe the impossibly turquoise glacial lakes of the Canadian Rockies — two of the world\'s most photographed places.', duration: '4-6 hours', rating: 4.9, price: 'CAD $30/hour canoe', category: 'Nature', accentColor: '#0EA5E9', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'yukon-aurora', name: 'Yukon Northern Lights', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80', description: 'Whitehorse is the aurora capital of Canada — dark skies, high activity, and guided wilderness hunts.', duration: '4-5 hours', rating: 4.9, price: 'CAD $120', category: 'Nature', accentColor: '#6366F1', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'whistler-skiing', name: 'Whistler Blackcomb Skiing', image: 'https://images.unsplash.com/photo-1548777123-e216912df7d8?w=600&q=80', description: 'North America\'s greatest ski resort — 8,100 acres of terrain, two mountains, and world-class bowls.', duration: 'Full day', rating: 4.9, price: 'CAD $230/day lift', category: 'Adventure', accentColor: '#60A5FA', squadTags: ['friends', 'couple', 'solo', 'family'] },
      { id: 'whale-watching-pacific', name: 'Whale Watching — Vancouver Island', image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&q=80', description: 'Orca pods hunting salmon in the Johnstone Strait — the world\'s densest orca population.', duration: '3-4 hours', rating: 4.9, price: 'CAD $130', category: 'Nature', accentColor: '#0EA5E9', squadTags: ['family', 'couple', 'solo', 'friends'] },
      { id: 'niagara-falls', name: 'Niagara Falls Boat Tour', image: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=600&q=80', description: 'Hornblower Niagara Cruises through the mist of the world\'s most powerful waterfall — 168,000m³/s thundering overhead.', duration: '20 minutes', rating: 4.8, price: 'CAD $35', category: 'Nature', accentColor: '#0EA5E9', squadTags: ['family', 'couple', 'friends', 'solo'] },
    ],
    events: [
      { id: 'montreal-jazz-fest', name: 'Montreal International Jazz Festival', category: 'Music', date: 'Late Jun–Jul', matchPercentage: 91, description: 'The world\'s largest jazz festival — free outdoor concerts and ticketed shows filling Montreal\'s downtown.', squadTags: ['solo', 'couple', 'friends'] },
      { id: 'quebec-winter-carnival', name: 'Québec Winter Carnival', category: 'Culture', date: 'Feb', matchPercentage: 88, description: 'The world\'s largest winter carnival — ice sculptures, snow slides, the Bonhomme mascot, and winter revelry.', squadTags: ['family', 'couple', 'friends', 'solo'] },
      { id: 'aurora-season-yukon', name: 'Yukon Aurora Season', category: 'Nature', date: 'Sep–Apr', matchPercentage: 96, description: 'Whitehorse has one of Earth\'s highest aurora visibility rates — long dark winters and minimal light pollution.', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'tiff', name: 'Toronto International Film Festival', category: 'Culture', date: 'Sep', matchPercentage: 84, description: 'The world\'s most important film festival — world premieres, celebrity sightings, and public screenings.', squadTags: ['solo', 'couple', 'friends'] },
      { id: 'calgary-stampede', name: 'Calgary Stampede', category: 'Culture', date: 'Jul', matchPercentage: 86, description: 'The Greatest Outdoor Show on Earth — rodeo, chuckwagon racing, and 1.2 million visitors in 10 days.', squadTags: ['family', 'friends', 'couple', 'solo'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Banff Arrival', morning: 'Banff townsite walk and Bow River trail', afternoon: 'Lake Louise canoe — turquoise glacial water', evening: 'Craft beer at Bear Street Tavern', icon: '🏔️' },
        { day: 2, theme: 'Rocky Mountains', morning: 'Sunrise at Moraine Lake (arrive pre-dawn)', afternoon: 'Icefields Parkway drive — glaciers and elk', evening: 'Athabasca Falls — wild camp in Jasper', icon: '🦌' },
        { day: 3, theme: 'Yukon Aurora', morning: 'Fly Whitehorse — Yukon River walk', afternoon: 'Dogsledding in Miles Canyon', evening: 'Expert aurora hunt in frozen wilderness', icon: '🌌' },
      ],
      couple: [
        { day: 1, theme: 'Fairmont Romance', morning: 'Fairmont Banff Springs arrival — castle in the Rockies', afternoon: 'Lake Louise canoe together', evening: 'Castello fine dining at the Fairmont', icon: '🏰' },
        { day: 2, theme: 'Glacier Drive', morning: 'Icefields Parkway — most scenic drive in North America', afternoon: 'Athabasca Glacier walk and ice exploration', evening: 'Jasper hot tub under the Milky Way', icon: '🧊' },
        { day: 3, theme: 'Aurora Night', morning: 'Fly to Whitehorse, Yukon', afternoon: 'Aurora forecasting briefing', evening: 'Private aurora hunt — wilderness cabin night', icon: '✨' },
      ],
      friends: [
        { day: 1, theme: 'Whistler Day 1', morning: 'Arrive Whistler — Village check-in', afternoon: 'First runs on Blackcomb — warm-up bowls', evening: 'Après ski and Whistler nightlife', icon: '🎿' },
        { day: 2, theme: 'Whistler Epic', morning: 'Full day — Whistler Peak to Peak gondola', afternoon: 'Off-piste and mountain bike park', evening: 'Group fondue dinner in the Village', icon: '🏔️' },
        { day: 3, theme: 'Vancouver', morning: 'Drive to Vancouver — Stanley Park seawall', afternoon: 'Vancouver food market and craft brewery tour', evening: 'Gastown nightlife and cocktail bars', icon: '🍺' },
      ],
      family: [
        { day: 1, theme: 'Banff Family Base', morning: 'Banff Gondola to Sulphur Mountain — kids\' trail', afternoon: 'Cave and Basin hot springs', evening: 'Rocky Mountain family dinner', icon: '⛰️' },
        { day: 2, theme: 'Glacier & Wildlife', morning: 'Icefields Parkway — watching for bears and elk', afternoon: 'Athabasca Glacier walk on the ice', evening: 'Jasper Dark Sky Festival viewing (seasonal)', icon: '🐻' },
        { day: 3, theme: 'Pacific Coast', morning: 'Vancouver Island — whale watching for orcas', afternoon: 'Tofino beach and rainforest walk', evening: 'Fresh Pacific salmon dinner', icon: '🐋' },
      ],
    },
    aiInsight: {
      solo:    'Canada rewards the solo traveler who seeks genuine wilderness. The Icefields Parkway is one of Earth\'s great solo drives, the Yukon aurora hunt is transformative, and cities like Montreal and Vancouver provide world-class urban culture as counterpoint. Canada is enormous — pick a region and go deep.',
      couple:  'The combination of Banff\'s Fairmont castle, the turquoise lakes, and the Yukon aurora creates a Canadian couple\'s itinerary that is simply unmatched in North America. The scale of the Rockies puts everything in perspective and brings two people together in the most elemental way.',
      friends: 'Whistler-Blackcomb is the non-negotiable North American ski experience for a group of skiers — the terrain, the après ski, and the village make it the complete package. Combine with Vancouver\'s food and nightlife and you have the best friends\' trip in the hemisphere.',
      family:  'Canada is the world\'s greatest outdoor classroom. The Banff wildlife, the Athabasca Glacier, the Pacific orcas, the Niagara thunder — children experience the natural world at a scale that creates lifelong environmental stewardship. Canada makes the world feel infinite and alive.',
    },
    mapCenter: { lat: 56.1304, lng: -106.3468 },
  },

  // Kenya
  {
    id: 'kenya',
    name: 'Kenya',
    flag: '🇰🇪',
    heroImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80',
    taglines: {
      solo:    'Safari, Kilimanjaro sunrise, and Swahili Coast',
      couple:  'Private camp in the Great Migration',
      friends: 'The Big Five and a Great Rift Valley adventure',
      family:  'Wildlife documentaries made real',
    },
    weather: { temp: '24°C', condition: 'Warm & sunny', icon: '🌅' },
    matchPercentage: 90,
    description: 'Kenya is East Africa\'s iconic safari destination — the Masai Mara hosts the Great Migration, one of nature\'s most spectacular events. Amboseli offers elephants with Kilimanjaro backdrop. The Swahili Coast has white-sand beaches and coral reefs. And Nairobi is East Africa\'s most cosmopolitan city.',
    currency: 'KES (Kenyan Shilling)',
    language: 'Swahili, English',
    timezone: 'UTC+3 (EAT)',
    positives: {
      solo:    ['Excellent solo safari culture', 'Adventurous overland routes', 'World-class wildlife photography', 'Authentic Maasai cultural immersion', 'Lamu Island hidden gem'],
      couple:  ['Great Migration private camps', 'Kilimanjaro backdrop at Amboseli', 'Lamu dhow sailing', 'Luxury tented camp dinners', 'Sundowner game drives'],
      friends: ['Self-drive Masai Mara safaris', 'Hell\'s Gate rock climbing', 'Great Rift Valley scenery', 'Nairobi food scene', 'Budget-friendly group safaris'],
      family:  ['David Sheldrick Elephant Orphanage', 'Giraffe Centre Nairobi', 'Child-friendly lodge safaris', 'Educational wildlife programs', 'Safe lodge environments'],
    },
    negatives: {
      solo:    ['Malaria precautions required', 'Safety vigilance needed in Nairobi', 'Some parks require 4WD vehicle', 'Wildlife viewing unpredictable'],
      couple:  ['Peak Migration season expensive', 'Remote camps require small aircraft', 'Malaria medication needed', 'Rough roads to many lodges'],
      friends: ['Self-drive requires confident driver', 'Budget camps less comfortable', 'National park fees add up', 'Limited nightlife outside Nairobi'],
      family:  ['Malaria serious concern for young children', 'Rough roads in parks', 'Heat for young children', 'Remote locations if emergency arises'],
    },
    hotels: [
      { id: 'angama-mara', name: 'Angama Mara', image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80', rating: 4.9, price: '$1,600/night', priceLevel: 'luxury', address: 'Above Masai Mara, Great Rift Valley Escarpment', amenities: ['Suspended above Mara', 'Photography lessons', 'Twice-daily game drives', 'Helicopter access', 'Spa'], description: 'Suspended on the edge of the Great Rift Valley — two camps floating above the Masai Mara with the world\'s most dramatic game drive views.', squadTags: ['couple', 'solo'] },
      { id: 'mahali-mzuri', name: 'Mahali Mzuri', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80', rating: 4.8, price: '$1,200/night', priceLevel: 'luxury', address: 'Ol Kinyei Conservancy, Masai Mara', amenities: ['Migration corridor location', 'Private conservancy', 'Tent plunge pools', 'Cultural Maasai visits'], description: 'Richard Branson\'s safari camp in the migration corridor — tented suites with plunge pools and no fence between you and the Mara.', squadTags: ['couple', 'friends'] },
      { id: 'ole-sereni', name: 'Ole-Sereni Hotel', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80', rating: 4.5, price: '$180/night', priceLevel: 'mid-range', address: 'Magadi Road, Nairobi', amenities: ['Nairobi National Park views', 'Pool', 'Multiple restaurants', 'Rooftop bar'], description: 'Nairobi\'s most unique hotel — lions and rhinos visible from the pool fence (Nairobi National Park borders the property).', squadTags: ['family', 'friends', 'couple'] },
      { id: 'giraffe-manor', name: 'The Giraffe Manor', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', rating: 4.9, price: '$850/night', priceLevel: 'luxury', address: 'Karen, Nairobi', amenities: ['Rothschild giraffes at breakfast', 'Boutique manor house', 'Garden', 'Conservation center'], description: 'The world\'s most famous boutique hotel — endangered Rothschild giraffes poke their heads through your window at breakfast.', squadTags: ['couple', 'family', 'solo'] },
    ],
    restaurants: [
      { id: 'carnivore-nairobi', name: 'Carnivore Restaurant', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.7, cuisine: 'Kenyan Grill', description: 'Africa\'s most famous restaurant — whole animals rotating on Maasai swords over charcoal, eaten until you raise the white flag.', price: '$$', priceLevel: 'mid-range', address: 'Langata Road, Nairobi', tags: ['iconic', 'grill', 'must-do'], squadTags: ['solo', 'friends', 'family', 'couple'] },
      { id: 'harvest-lodge', name: 'Harvest Restaurant — Angama', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', rating: 4.9, cuisine: 'East African', description: 'Bush breakfast on a private kopje with giraffes feeding below — the most cinematic meal in Africa.', price: '$$$$', priceLevel: 'luxury', address: 'Angama Mara, Masai Mara', tags: ['bush-dining', 'cinematic', 'luxury'], squadTags: ['couple', 'solo'] },
      { id: 'lord-erroll', name: 'Lord Erroll', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', rating: 4.6, cuisine: 'Continental Kenyan', description: 'Nairobi\'s most elegant dining room in a beautiful colonial house in Runda — Kenyan-French cuisine excellence.', price: '$$$', priceLevel: 'luxury', address: 'Runda, Nairobi', tags: ['elegant', 'colonial', 'continental'], squadTags: ['couple', 'solo', 'friends'] },
    ],
    activities: [
      { id: 'great-migration', name: 'Great Migration Safari', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80', description: 'Witness 1.5 million wildebeest crossing the Mara River — nature\'s most spectacular wildlife event.', duration: 'Multi-day', rating: 4.9, price: '$200/day (budget)', category: 'Nature', accentColor: '#D97706', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'masai-mara-drive', name: 'Masai Mara Dawn Game Drive', image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80', description: 'Pre-dawn open vehicle drive when lions return from hunting and leopards stalk the long grass.', duration: '3-4 hours', rating: 4.9, price: '$80', category: 'Nature', accentColor: '#D97706', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'giraffe-centre-nairobi', name: 'Giraffe Centre Nairobi', image: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=600&q=80', description: 'Hand-feed endangered Rothschild giraffes and learn about conservation at this Nairobi landmark.', duration: '1-2 hours', rating: 4.8, price: 'KES 1,400', category: 'Nature', accentColor: '#F97316', squadTags: ['family', 'couple', 'friends', 'solo'] },
      { id: 'amboseli-kilimanjaro', name: 'Amboseli — Elephants & Kilimanjaro', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80', description: 'Giant elephant herds crossing the dusty plains with Kilimanjaro\'s snowy summit as backdrop — Africa\'s most iconic image.', duration: 'Full day', rating: 4.9, price: '$100/day', category: 'Nature', accentColor: '#10B981', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'elephant-orphanage', name: 'David Sheldrick Elephant Orphanage', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80', description: 'Watch baby orphaned elephants at their mud bath — the world\'s most successful elephant rescue and rehabilitation program.', duration: '1 hour', rating: 4.9, price: '$8', category: 'Nature', accentColor: '#92400E', squadTags: ['family', 'couple', 'solo', 'friends'] },
    ],
    events: [
      { id: 'wildebeest-crossing', name: 'Great Migration River Crossings', category: 'Nature', date: 'Jul–Oct', matchPercentage: 97, description: 'The peak of wildebeest Mara River crossings — crocodiles, chaos, and hundreds of thousands of animals.', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'safari-rally-kenya', name: 'WRC Safari Rally Kenya', category: 'Sport', date: 'Jun', matchPercentage: 83, description: 'World Rally Championship through the Kenyan savanna — the world\'s most charismatic rally stage.', squadTags: ['friends', 'solo'] },
      { id: 'lamu-cultural-festival', name: 'Lamu Cultural Festival', category: 'Culture', date: 'Nov', matchPercentage: 86, description: 'Four days of dhow racing, donkey races, Swahili music, and cultural celebration on Lamu Island.', squadTags: ['solo', 'couple', 'friends'] },
      { id: 'nairobi-fashion-week', name: 'Nairobi Fashion Week', category: 'Art', date: 'Oct', matchPercentage: 75, description: 'East Africa\'s premier fashion event — celebrating African designers and contemporary Kenyan style.', squadTags: ['solo', 'friends', 'couple'] },
      { id: 'maasai-mara-balloon', name: 'Hot Air Balloon Safari', category: 'Adventure', date: 'Year-round', matchPercentage: 95, description: 'Float above the Mara at dawn in a hot air balloon — the Great Migration beneath you, Kilimanjaro on the horizon.', squadTags: ['couple', 'solo', 'friends', 'family'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Nairobi Wild City', morning: 'Nairobi National Park dawn drive (lions and city skyline)', afternoon: 'David Sheldrick Elephant Orphanage', evening: 'Carnivore Restaurant and Nairobi night jazz', icon: '🦁' },
        { day: 2, theme: 'Masai Mara Arrival', morning: 'Fly Masai Mara — afternoon game drive', afternoon: 'Sundowners on a kopje with Mara views', evening: 'Bush dinner under the stars', icon: '🌅' },
        { day: 3, theme: 'Migration Dawn', morning: 'Pre-dawn drive to river crossing lookout', afternoon: 'Witness the wildebeest crossing', evening: 'Maasai village cultural visit', icon: '🦓' },
      ],
      couple: [
        { day: 1, theme: 'Nairobi Romance', morning: 'Giraffe Manor breakfast — giraffes at the window', afternoon: 'Karen Blixen Museum — Out of Africa', evening: 'Lord Erroll elegant Nairobi dinner', icon: '🦒' },
        { day: 2, theme: 'Private Mara', morning: 'Fly to Angama Mara — arrival over the escarpment', afternoon: 'Afternoon game drive on private conservancy', evening: 'Bush dinner on the escarpment edge', icon: '🍷' },
        { day: 3, theme: 'Balloon Safari', morning: 'Pre-dawn hot air balloon over the migration', afternoon: 'Champagne breakfast in the bush', evening: 'Final sundowner on the Mara plain', icon: '🎈' },
      ],
      friends: [
        { day: 1, theme: 'Nairobi & Giraffe', morning: 'Giraffe Centre and Elephant Orphanage', afternoon: 'Nairobi National Park self-drive', evening: 'Carnivore feast with the group', icon: '🍖' },
        { day: 2, theme: 'Mara Safari', morning: 'Group fly-in to the Mara', afternoon: 'Open vehicle Big Five game drive', evening: 'Group camp — stories around the fire', icon: '🔥' },
        { day: 3, theme: 'Rift Valley', morning: 'Hell\'s Gate National Park — cycle and rock climb', afternoon: 'Geothermal spa at Lake Naivasha', evening: 'Group sundowner on the crater rim', icon: '🧗' },
      ],
      family: [
        { day: 1, theme: 'Nairobi Wildlife', morning: 'Elephant Orphanage — baby elephants mud bath', afternoon: 'Giraffe Centre — kids hand-feed giraffes', evening: 'Family dinner at Carnivore', icon: '🐘' },
        { day: 2, theme: 'Amboseli', morning: 'Fly to Amboseli — elephant herds and Kilimanjaro', afternoon: 'Afternoon drive — elephants at close range', evening: 'Family camp dinner with volcano backdrop', icon: '🏔️' },
        { day: 3, theme: 'Masai Mara', morning: 'Family game drive — spotting the Big Five', afternoon: 'Maasai village visit — jumping dance for kids', evening: 'Farewell bush dinner', icon: '🦁' },
      ],
    },
    aiInsight: {
      solo:    'Kenya is one of the world\'s great solo adventure destinations. The safari culture is built for individual discovery — the dawn game drive alone in an open vehicle, the migration crossing, the Maasai conversation at sunset. Kenya rewards the traveler who pays attention.',
      couple:  'The Masai Mara private conservancy is one of the world\'s great romantic settings — no fences between your tented camp and the lion pride, no crowds at the crossing point, no agenda beyond this moment. Kenya is where couples fall silent and simply watch.',
      friends: 'Kenya for a group delivers the safari experience at every budget level — from private conservancy luxury to self-drive camping in the Mara. Add Hell\'s Gate cycling, the Rift Valley lakes, and Nairobi\'s surprisingly vibrant food scene and you have a complete adventure.',
      family:  'The David Sheldrick Elephant Orphanage alone is worth the trip for a family. But Kenya offers layer after layer of wildlife education — the elephants and Kilimanjaro, the wildebeest crossing, the Maasai jumping dance. Children return from Kenya fundamentally changed.',
    },
    mapCenter: { lat: -0.0236, lng: 37.9062 },
  },

  // Tanzania
  {
    id: 'tanzania',
    name: 'Tanzania',
    flag: '🇹🇿',
    heroImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80',
    taglines: {
      solo:    'Serengeti, Kilimanjaro, and Zanzibar beyond',
      couple:  'Private Serengeti camp and Zanzibar beaches',
      friends: 'Greatest safari on Earth plus spice island magic',
      family:  'Ngorongoro Crater and Zanzibar for all ages',
    },
    weather: { temp: '26°C', condition: 'Warm & sunny', icon: '☀️' },
    matchPercentage: 91,
    description: 'Tanzania holds Africa\'s greatest wildlife treasures: the Serengeti\'s endless plains and Great Migration, the Ngorongoro Crater\'s wildlife-packed caldera, and Kilimanjaro — the continent\'s highest peak. Add Zanzibar\'s white beaches and spice heritage, and Tanzania becomes one of the world\'s most complete travel destinations.',
    currency: 'TZS (Tanzanian Shilling)',
    language: 'Swahili, English',
    timezone: 'UTC+3 (EAT)',
    positives: {
      solo:    ['Serengeti is larger and wilder than Masai Mara', 'Kilimanjaro summit challenge', 'Zanzibar authentic culture', 'World-class wildlife photography', 'Adventurous solo hiking routes'],
      couple:  ['Ngorongoro Crater lodge romance', 'Serengeti private camp dining under stars', 'Zanzibar beach honeymoon', 'Migration calving season private', 'Luxury tented camp intimacy'],
      friends: ['Serengeti self-drive epic', 'Group Kilimanjaro climb', 'Zanzibar spice tour and Freddie Mercury\'s birthplace', 'Snorkeling Zanzibar coral reefs', 'Great safari photography'],
      family:  ['Ngorongoro Crater — wildlife density unmatched', 'Child-friendly lodges', 'Zanzibar beach holiday', 'Educational ranger programs', 'Gentle wildlife encounters'],
    },
    negatives: {
      solo:    ['Malaria prevention required', 'Tanzania parks more expensive than Kenya', 'Kilimanjaro requires fitness preparation', 'Long-haul flight for most origins'],
      couple:  ['Very expensive private lodges', 'Malaria medication essential', 'Rough roads in parks', 'Remote medical care limitations'],
      friends: ['High park entrance fees', 'Group size limits in some conservancies', 'Kilimanjaro requires guide booking far ahead', 'Budget vs luxury gap is wide'],
      family:  ['Malaria risk significant for young children', 'Long drives in the parks', 'Limited pediatric medical care', 'Heat and sun management'],
    },
    hotels: [
      { id: 'four-seasons-serengeti', name: 'Four Seasons Safari Lodge Serengeti', image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80', rating: 4.9, price: '$1,400/night', priceLevel: 'luxury', address: 'Central Serengeti National Park', amenities: ['Watering hole infinity pool', 'Twice-daily drives', 'Spa', 'Multiple restaurants', 'Balloon safaris'], description: 'The most dramatic hotel in the Serengeti — an infinity pool overlooking a hippo-filled watering hole at the heart of the national park.', squadTags: ['couple', 'family'] },
      { id: 'ngorongoro-crater-lodge', name: 'Ngorongoro Crater Lodge', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80', rating: 4.9, price: '$1,800/night', priceLevel: 'luxury', address: 'Ngorongoro Crater Rim, Arusha Region', amenities: ['Crater-edge position', 'Butler service', 'Masai-inspired décor', 'Private game drives'], description: 'Perched on the rim of the Ngorongoro Crater — the world\'s most biologically significant wildlife caldera directly below.', squadTags: ['couple', 'solo'] },
      { id: 'zanzibar-serena-inn', name: 'Zanzibar Serena Inn', image: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=600&q=80', rating: 4.7, price: '$280/night', priceLevel: 'luxury', address: 'Kelele Square, Stone Town, Zanzibar', amenities: ['Historic Stone Town', 'Dhow harbour views', 'Swahili cuisine', 'Pool', 'Spa'], description: 'Stone Town\'s finest hotel — a restored merchant\'s house with Arab-Portuguese architecture overlooking the dhow harbour.', squadTags: ['couple', 'solo', 'friends'] },
      { id: 'zanzibar-white-sand', name: 'White Sand Luxury Villas', image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80', rating: 4.8, price: '$650/night', priceLevel: 'luxury', address: 'Pwani Mchangani, Zanzibar', amenities: ['Private beach', 'Infinity pool', 'Coral reef diving', 'Villa butler', 'Swahili dining'], description: 'Zanzibar\'s leading beach villa resort — private white-sand beach, house reef diving, and butler service in Indian Ocean paradise.', squadTags: ['couple', 'friends', 'family'] },
    ],
    restaurants: [
      { id: 'emerson-spice-zanzibar', name: 'Emerson Spice Rooftop', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.8, cuisine: 'Swahili', description: 'Rooftop restaurant in a restored 19th-century tower in Stone Town — the best Swahili cuisine with views over the old city.', price: '$$', priceLevel: 'mid-range', address: 'Hurumzi, Stone Town, Zanzibar', tags: ['swahili', 'rooftop', 'stone-town'], squadTags: ['couple', 'solo', 'friends'] },
      { id: 'forodhani-gardens', name: 'Forodhani Gardens Night Market', image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&q=80', rating: 4.7, cuisine: 'Zanzibar Street Food', description: 'Zanzibar\'s famous nightly street food market — Urojo soup, grilled lobster, chapati wraps, and Zanzibar pizza.', price: '$', priceLevel: 'budget', address: 'Forodhani Gardens, Stone Town', tags: ['street-food', 'night-market', 'local'], squadTags: ['solo', 'friends', 'family', 'couple'] },
      { id: 'arusha-coffee-lodge', name: 'Arusha Coffee Lodge Restaurant', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', rating: 4.6, cuisine: 'East African', description: 'Dinner amid the working coffee plantation at Arusha Coffee Lodge — the best safari gateway meal in Tanzania.', price: '$$$', priceLevel: 'luxury', address: 'Arusha, Tanzania', tags: ['coffee-estate', 'elegant', 'pre-safari'], squadTags: ['couple', 'solo', 'friends'] },
    ],
    activities: [
      { id: 'serengeti-balloon', name: 'Serengeti Hot Air Balloon Safari', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80', description: 'Float above the endless Serengeti plain at dawn — lion prides below, Kilimanjaro on the horizon.', duration: '3-4 hours', rating: 4.9, price: '$600', category: 'Adventure', accentColor: '#F97316', squadTags: ['couple', 'solo', 'friends'] },
      { id: 'ngorongoro-descent', name: 'Ngorongoro Crater Descent', image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80', description: 'Drive into the world\'s largest intact volcanic caldera — 25,000 animals including the rarest black rhino.', duration: 'Full day', rating: 4.9, price: '$60 + park fees', category: 'Nature', accentColor: '#10B981', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'kilimanjaro-climb', name: 'Mount Kilimanjaro Summit', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', description: 'Summit Africa\'s highest peak (5,895m) via the Marangu or Lemosho route — Roof of Africa certificate earned.', duration: '6-8 days', rating: 4.8, price: '$2,000+', category: 'Adventure', accentColor: '#60A5FA', squadTags: ['solo', 'friends', 'couple'] },
      { id: 'zanzibar-snorkel', name: 'Zanzibar Coral Reef Snorkeling', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80', description: 'Mnemba Atoll — pristine coral reef with turtles, octopus, and dense tropical fish around a private island.', duration: '3-4 hours', rating: 4.8, price: '$50', category: 'Water Sports', accentColor: '#0EA5E9', squadTags: ['family', 'couple', 'friends', 'solo'] },
      { id: 'spice-tour-zanzibar', name: 'Zanzibar Spice Tour', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', description: 'Walk through spice plantations — taste cinnamon, cloves, vanilla, and nutmeg on the island that spiced the world.', duration: '3 hours', rating: 4.6, price: '$30', category: 'Culture', accentColor: '#D97706', squadTags: ['solo', 'family', 'couple', 'friends'] },
    ],
    events: [
      { id: 'serengeti-calving', name: 'Serengeti Calving Season', category: 'Nature', date: 'Jan–Feb', matchPercentage: 96, description: 'Half a million wildebeest calves born in three weeks — predators converge and the drama reaches peak intensity.', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'zanzibar-film-fest', name: 'Zanzibar International Film Festival', category: 'Culture', date: 'Jul', matchPercentage: 82, description: 'East Africa\'s most celebrated film festival — world cinema and African films screened in Stone Town\'s historic square.', squadTags: ['solo', 'couple', 'friends'] },
      { id: 'serengeti-migration-north', name: 'Northern Migration River Crossings', category: 'Nature', date: 'Jun–Oct', matchPercentage: 95, description: 'Mara River crossings from Serengeti into Kenya — the most dramatic wildlife spectacle on the planet.', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'eid-zanzibar', name: 'Eid Celebrations — Zanzibar', category: 'Culture', date: 'Variable', matchPercentage: 80, description: 'Zanzibar\'s deeply Islamic culture produces the most vibrant Eid celebrations in East Africa — street feasts and music.', squadTags: ['solo', 'family', 'couple'] },
      { id: 'kilimanjaro-marathon', name: 'Kilimanjaro Marathon', category: 'Sport', date: 'Feb/Mar', matchPercentage: 84, description: 'Run the slopes of Africa\'s highest mountain in the annual international marathon from Moshi.', squadTags: ['solo', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Serengeti Arrival', morning: 'Fly to Serengeti — arrival over endless plains', afternoon: 'First afternoon game drive — lion pride', evening: 'Bush dinner under the Milky Way', icon: '🦁' },
        { day: 2, theme: 'Ngorongoro Crater', morning: 'Descent into the crater at dawn — rhino tracking', afternoon: 'Hippo pools and flamingo lake', evening: 'Crater lodge dinner on the rim', icon: '🌋' },
        { day: 3, theme: 'Zanzibar Escape', morning: 'Fly to Zanzibar Stone Town', afternoon: 'Spice tour and Freddie Mercury birthplace', evening: 'Forodhani night market feast', icon: '🌶️' },
      ],
      couple: [
        { day: 1, theme: 'Ngorongoro Rim', morning: 'Ngorongoro Crater Lodge arrival — rim views', afternoon: 'Private crater descent — black rhino sighting', evening: 'Butler-served dinner on the crater rim', icon: '🦏' },
        { day: 2, theme: 'Serengeti Balloon', morning: 'Pre-dawn hot air balloon over the Serengeti', afternoon: 'Bush champagne breakfast — migration around you', evening: 'Private tented camp night under the stars', icon: '🎈' },
        { day: 3, theme: 'Zanzibar Honeymoon', morning: 'Fly to Zanzibar — White Sand villa check-in', afternoon: 'Mnemba Atoll snorkeling with turtles', evening: 'Emerson Spice rooftop dinner, Stone Town', icon: '🐢' },
      ],
      friends: [
        { day: 1, theme: 'Serengeti Epic', morning: 'Fly in to central Serengeti', afternoon: 'Big Five game drive in open vehicle', evening: 'Group camp dinner — predator sounds in the dark', icon: '🦒' },
        { day: 2, theme: 'Crater Day', morning: 'Ngorongoro Crater full day descent', afternoon: 'All Big Five in one day possible', evening: 'Arusha — coffee lodge dinner', icon: '🌋' },
        { day: 3, theme: 'Zanzibar', morning: 'Fly to Zanzibar — Stone Town exploration', afternoon: 'Mnemba Atoll diving or snorkeling', evening: 'Beach party at Nungwi — legendary Zanzibar sunset', icon: '🏖️' },
      ],
      family: [
        { day: 1, theme: 'Ngorongoro', morning: 'Ngorongoro Crater descent — unbelievable wildlife density', afternoon: 'Hippos and flamingos on the crater floor', evening: 'Family lodge on the rim', icon: '🦛' },
        { day: 2, theme: 'Serengeti', morning: 'Game drive — elephant, giraffe, cheetah', afternoon: 'Night drive (special permit) — nocturnal species', evening: 'Family bush dinner and ranger stories', icon: '🐆' },
        { day: 3, theme: 'Zanzibar Beach', morning: 'Fly to Zanzibar — beach resort check-in', afternoon: 'Snorkeling and glass-bottom boat for kids', evening: 'Forodhani night market — kids love the Zanzibar pizza', icon: '🌊' },
      ],
    },
    aiInsight: {
      solo:    'Tanzania is where solo travelers discover that nature at its grandest can feel profoundly personal. The Serengeti\'s scale, the Ngorongoro Crater\'s concentration, and Zanzibar\'s Stone Town labyrinth give the solo explorer three completely different worlds in one country.',
      couple:  'Tanzania has arguably the world\'s most complete couples\' safari-and-beach combination. A Ngorongoro Crater rim lodge followed by a Serengeti balloon followed by a Zanzibar private villa — this is the East Africa honeymoon blueprint that no other destination can replicate.',
      friends: 'Tanzania is serious safari in a way that surprises even people who\'ve been on safari before. The Serengeti\'s vastness, the Ngorongoro\'s concentration, and Kilimanjaro\'s summit challenge provide a group adventure across completely different dimensions of the African experience.',
      family:  'Tanzania turns children into wildlife experts in three days. The Ngorongoro Crater guarantees every species; the Serengeti shows the migration in context; and Zanzibar provides the perfect beach wind-down. It\'s the complete East African family experience.',
    },
    mapCenter: { lat: -6.3690, lng: 34.8888 },
  },

  // Seychelles
  {
    id: 'seychelles',
    name: 'Seychelles',
    flag: '🇸🇨',
    heroImage: 'https://images.unsplash.com/photo-1560179304-6fc1d8749b23?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80',
    taglines: {
      solo:    'Nature perfected on a granite island paradise',
      couple:  'The world\'s most beautiful honeymoon',
      friends: 'Private island luxury and ocean adventures',
      family:  'Pristine nature meets perfect beaches',
    },
    weather: { temp: '29°C', condition: 'Tropical & warm', icon: '🌴' },
    matchPercentage: 96,
    description: 'The Seychelles are unlike anywhere else on Earth — 115 islands in the Indian Ocean with ancient granite boulders, cotton-white beaches, and some of the world\'s clearest water. The island of Praslin holds the Vallée de Mai where the rare Coco de Mer palm produces the world\'s largest nut. La Digue is possibly the most beautiful island on the planet.',
    currency: 'SCR (Seychellois Rupee)',
    language: 'Seychellois Creole, English, French',
    timezone: 'UTC+4 (SCT)',
    positives: {
      solo:    ['Anse Source d\'Argent — world\'s most photographed beach', 'Vallee de Mai UNESCO forest', 'Complete safety', 'Island hopping by ferry', 'Nature at its most pristine'],
      couple:  ['World\'s #1 honeymoon destination', 'Private island resorts', 'Bioluminescent night swimming', 'Complete privacy on secluded beaches', 'Luxury villa suites'],
      friends: ['Private island villa rentals', 'Deep sea fishing', 'Diving with whale sharks', 'Island hopping adventure', 'Seychellois cuisine culture'],
      family:  ['Some of the world\'s safest beaches', 'Marine turtle nesting', 'Giant tortoise encounters', 'Accessible reef snorkeling', 'Nature reserve walks'],
    },
    negatives: {
      solo:    ['Extremely expensive', 'Couples-centric — can feel isolating', 'Limited nightlife', 'Not a backpacker destination'],
      couple:  ['Among the world\'s most expensive destinations', 'Limited budget options', 'Long flights required from most origins', 'Very isolated for emergencies'],
      friends: ['Very expensive for groups', 'Limited nightlife scene', 'Few urban attractions', 'Limited variety beyond beach and nature'],
      family:  ['Very high cost for families', 'Strong currents on some beaches', 'Very remote', 'Limited pediatric facilities'],
    },
    hotels: [
      { id: 'north-island-seychelles', name: 'North Island', image: 'https://images.unsplash.com/photo-1560179304-6fc1d8749b23?w=600&q=80', rating: 5.0, price: '$4,500/night', priceLevel: 'luxury', address: 'North Island, Seychelles', amenities: ['Private island', '11 villas only', 'Beach butler', 'Conservation focus', 'Dive center'], description: 'The world\'s most exclusive private island — 11 villas on a pristine conservation island. Where Prince William and Kate honeymooned.', squadTags: ['couple', 'solo'] },
      { id: 'fregate-island', name: 'Frégate Island Private', image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80', rating: 4.9, price: '$3,200/night', priceLevel: 'luxury', address: 'Frégate Island, Seychelles', amenities: ['16 villas on private island', '7 beaches', 'Turtle conservation', 'Spa', 'Organic farm'], description: 'A 22-acre private island sanctuary with seven beaches, giant tortoise colonies, and some of the world\'s rarest birds.', squadTags: ['couple', 'family'] },
      { id: 'constance-lemuria', name: 'Constance Lémuria', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80', rating: 4.8, price: '$1,200/night', priceLevel: 'luxury', address: 'Anse Kerlan, Praslin', amenities: ['Three beaches', 'Golf course', 'Spa', 'Multiple pools', 'Kids club'], description: 'Praslin\'s most complete resort — three private beaches, 18-hole golf, and the Vallée de Mai UNESCO forest at the doorstep.', squadTags: ['family', 'couple', 'friends'] },
      { id: 'la-reserve-seychelles', name: 'La Réserve Boutique Hotel', image: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=600&q=80', rating: 4.5, price: '$350/night', priceLevel: 'mid-range', address: 'Anse Petite Cour, Praslin', amenities: ['Beach access', 'Pool', 'Garden bungalows', 'Restaurant'], description: 'The most accessible luxury on Praslin — boutique bungalows with beach access at a price that won\'t require a second mortgage.', squadTags: ['couple', 'friends', 'solo'] },
    ],
    restaurants: [
      { id: 'lazare-picault', name: 'Lazare Picault', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.8, cuisine: 'Seychellois', description: 'Mahé\'s most celebrated restaurant — fresh Seychellois red snapper, octopus curry, and the best Creole desserts on the island.', price: '$$$', priceLevel: 'luxury', address: 'Mahé, Seychelles', tags: ['creole', 'seafood', 'local'], squadTags: ['couple', 'solo', 'friends'] },
      { id: 'chez-jules-la-digue', name: 'Chez Jules', image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&q=80', rating: 4.7, cuisine: 'Creole', description: 'La Digue\'s beloved beachside Creole restaurant — whole grilled fish on an open terrace above the Indian Ocean.', price: '$$', priceLevel: 'mid-range', address: 'La Digue Island, Seychelles', tags: ['beachside', 'creole', 'fresh-fish'], squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'takamaka-rum-bar', name: 'Takamaka Rum Distillery Bar', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', rating: 4.5, cuisine: 'Seychellois', description: 'Cocktails made with Takamaka rum at the distillery bar — sunset rum punch with coconut, the quintessential Seychelles experience.', price: '$$', priceLevel: 'mid-range', address: 'Mahé, Seychelles', tags: ['rum', 'distillery', 'cocktails'], squadTags: ['friends', 'couple', 'solo'] },
    ],
    activities: [
      { id: 'anse-source-argent', name: 'Anse Source d\'Argent Beach', image: 'https://images.unsplash.com/photo-1560179304-6fc1d8749b23?w=600&q=80', description: 'The world\'s most photographed beach — ancient pink granite boulders framing the clearest turquoise water.', duration: 'Half to full day', rating: 5.0, price: 'SCR 50 entry', category: 'Nature', accentColor: '#F97316', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'vallee-de-mai', name: 'Vallée de Mai UNESCO Forest', image: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=600&q=80', description: 'Primeval palm forest on Praslin where the Coco de Mer — the world\'s largest nut — grows wild.', duration: '2-3 hours', rating: 4.9, price: 'SCR 500', category: 'Nature', accentColor: '#10B981', squadTags: ['solo', 'family', 'couple', 'friends'] },
      { id: 'whale-shark-seychelles', name: 'Whale Shark Snorkeling', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80', description: 'Snorkel alongside whale sharks in the blue waters off Mahé — the world\'s largest fish in its natural habitat.', duration: '4 hours', rating: 4.9, price: 'SCR 2,400', category: 'Adventure', accentColor: '#0EA5E9', squadTags: ['solo', 'friends', 'couple'] },
      { id: 'giant-tortoise-encounter', name: 'Giant Aldabra Tortoise Encounter', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80', description: 'Walk among hundreds of 150-year-old Aldabra giant tortoises on their protected reserve islands.', duration: '2-3 hours', rating: 4.8, price: 'SCR 350', category: 'Nature', accentColor: '#84CC16', squadTags: ['family', 'couple', 'solo', 'friends'] },
      { id: 'la-digue-cycling', name: 'La Digue Cycling Tour', image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80', description: 'Cycle the car-free island of La Digue between hidden beaches — the most beautiful island in the Indian Ocean.', duration: 'Full day', rating: 4.8, price: 'SCR 150 bike rental', category: 'Nature', accentColor: '#10B981', squadTags: ['solo', 'couple', 'friends', 'family'] },
    ],
    events: [
      { id: 'festival-kreol', name: 'Festival Kreol', category: 'Culture', date: 'Oct', matchPercentage: 88, description: 'Week-long celebration of Creole culture — music, dance, food, and the deeply mixed Seychellois cultural identity.', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'seychelles-carnival', name: 'Seychelles Carnival', category: 'Festival', date: 'Apr', matchPercentage: 85, description: 'International carnival in Victoria — costumed processions, Creole music, and the most colorful street festival in the Indian Ocean.', squadTags: ['friends', 'couple', 'family'] },
      { id: 'whale-shark-season', name: 'Whale Shark Season', category: 'Nature', date: 'Oct–Nov', matchPercentage: 95, description: 'Whale sharks aggregate around the outer islands for plankton blooms — the most reliable encounter window in the world.', squadTags: ['solo', 'friends', 'couple'] },
      { id: 'turtle-nesting', name: 'Sea Turtle Nesting Season', category: 'Nature', date: 'Sep–Feb', matchPercentage: 90, description: 'Hawksbill and green turtles nest on pristine Seychellois beaches — witness hatching on a guided moonlit walk.', squadTags: ['family', 'couple', 'solo'] },
      { id: 'new-year-seychelles', name: 'Seychelles New Year', category: 'Celebration', date: 'Dec 31', matchPercentage: 88, description: 'Ring in the New Year on a private beach with a private villa fireworks display over the Indian Ocean.', squadTags: ['couple', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Mahé Arrival', morning: 'Victoria town market and Beau Vallon beach', afternoon: 'Snorkeling at Beau Vallon coral reef', evening: 'Lazare Picault Creole dinner and rum punch', icon: '🐠' },
        { day: 2, theme: 'La Digue', morning: 'Ferry to La Digue — Anse Source d\'Argent', afternoon: 'Cycle to hidden beaches — Anse Cocos', evening: 'Solo sunset at Anse Sévère', icon: '🚲' },
        { day: 3, theme: 'Praslin & Vallée', morning: 'Ferry to Praslin — Vallée de Mai UNESCO forest', afternoon: 'Anse Lazio — possibly the most beautiful beach', evening: 'Sunset from Constance Lémuria terrace', icon: '🌴' },
      ],
      couple: [
        { day: 1, theme: 'Private Island Arrival', morning: 'Seaplane to North Island or Frégate', afternoon: 'Villa butler introduction — private beach afternoon', evening: 'Sunset champagne on your private terrace', icon: '🥂' },
        { day: 2, theme: 'Ocean Romance', morning: 'Guided snorkeling with whale sharks', afternoon: 'Couple\'s spa — coconut oil and sea salt rituals', evening: 'Private beach candlelit dinner', icon: '🕯️' },
        { day: 3, theme: 'La Digue Escape', morning: 'Helicopter to La Digue — Anse Source d\'Argent', afternoon: 'Cycle together to hidden coves', evening: 'Farewell sunset dinner at Chez Jules', icon: '🌅' },
      ],
      friends: [
        { day: 1, theme: 'Mahé Adventures', morning: 'Deep sea fishing for marlin and tuna', afternoon: 'Morne Seychellois National Park hike', evening: 'Takamaka Rum Distillery cocktails', icon: '🐟' },
        { day: 2, theme: 'La Digue', morning: 'Ferry and cycling tour of the island', afternoon: 'Anse Source d\'Argent group photos', evening: 'Chez Jules beachside group dinner', icon: '📸' },
        { day: 3, theme: 'Praslin Diving', morning: 'PADI dive at Shark Bank — nurse sharks', afternoon: 'Vallée de Mai forest walk', evening: 'Anse Lazio sunset and farewell', icon: '🤿' },
      ],
      family: [
        { day: 1, theme: 'Mahé Family Base', morning: 'Giant tortoise encounter at La Vanille Reserve', afternoon: 'Beau Vallon beach — safe swimming for all ages', evening: 'Creole family dinner and firefly watch', icon: '🐢' },
        { day: 2, theme: 'La Digue', morning: 'Ferry to La Digue — bikes for the whole family', afternoon: 'Anse Source d\'Argent — kids play among boulders', evening: 'Island fish braai on the beach', icon: '🚲' },
        { day: 3, theme: 'Turtle Discovery', morning: 'Turtle nesting beach guided walk (seasonal)', afternoon: 'Glass-bottom boat reef discovery', evening: 'Farewell Seychelles sunset from Praslin', icon: '🐠' },
      ],
    },
    aiInsight: {
      solo:    'The Seychelles rewards the solo traveler who seeks natural beauty at its absolute peak. Anse Source d\'Argent, the Vallée de Mai, and the car-free cycling of La Digue give total immersion in a natural world that feels genuinely untouched. It is expensive, but nothing else looks like this.',
      couple:  'No destination on Earth matches the Seychelles for pure romantic impact. The private island lodges, the bioluminescent nights, the granite boulders and turquoise water, the complete privacy — the Seychelles is the answer to "where do we go for the most important trip of our lives?"',
      friends: 'The Seychelles surprises friend groups with its depth beyond the beach. Whale shark snorkeling, deep sea fishing, hiking Morne Seychellois, rum distillery tours, and island hopping — plus private villa rentals that can make the cost manageable when split.',
      family:  'The Seychelles offers families something rare: wildlife encounters and world-class beaches in the same destination. Giant tortoises your children can touch, turtles nesting on moonlit beaches, and some of the world\'s most protected — and safest — marine environments.',
    },
    mapCenter: { lat: -4.6796, lng: 55.4920 },
  },
];

// Lookup helpers
export function getDestination(id: string): DestinationEntry | undefined {
  return DESTINATIONS.find(d => d.id === id);
}

export function getSquadHotels(destination: DestinationEntry, squad: SquadType): Hotel[] {
  return destination.hotels.filter(h => h.squadTags.includes(squad));
}

export function getSquadRestaurants(destination: DestinationEntry, squad: SquadType): Restaurant[] {
  return destination.restaurants.filter(r => r.squadTags.includes(squad));
}

export function getSquadActivities(destination: DestinationEntry, squad: SquadType): Activity[] {
  return destination.activities.filter(a => a.squadTags.includes(squad));
}

export function getSquadEvents(destination: DestinationEntry, squad: SquadType): TravelEvent[] {
  return destination.events.filter(e => e.squadTags.includes(squad));
}

export const SQUAD_LABELS: Record<SquadType, string> = {
  solo:    'Solo',
  couple:  'Couple',
  friends: 'Friends',
  family:  'Family',
};

export const SQUAD_EMOJI: Record<SquadType, string> = {
  solo:    '👤',
  couple:  '💑',
  friends: '👥',
  family:  '👨‍👩‍👧',
};
