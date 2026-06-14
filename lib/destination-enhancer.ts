// Enhanced destination details helper functions

export interface CitySuggestion {
  cityName: string;
}

export interface Hotel {
  name: string;
  priceLevel: 'low' | 'medium' | 'high';
  rating?: number;
}

export interface Restaurant {
  name: string;
  cuisine?: string;
  priceLevel: 'low' | 'medium' | 'high';
}

export interface Holiday {
  date: string;
  name: string;
  localName?: string;
}

export interface EnhancedDestinationDetails {
  city: CitySuggestion;
  hotels: Hotel[];
  restaurants: Restaurant[];
  events: Holiday[];
}

// City suggestions based on country, profile, and budget
export function getBestCity(countryCode: string, profile: any, budget: string): CitySuggestion {
  const cityDatabase: Record<string, { cities: string[]; budgetMapping: Record<string, string[]> }> = {
    'US': {
      cities: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Las Vegas'],
      budgetMapping: {
        'low': ['Chicago', 'Miami'],
        'medium': ['Los Angeles', 'San Francisco'],
        'high': ['New York', 'Las Vegas']
      }
    },
    'FR': {
      cities: ['Paris', 'Lyon', 'Marseille', 'Nice', 'Bordeaux', 'Strasbourg'],
      budgetMapping: {
        'low': ['Lyon', 'Marseille'],
        'medium': ['Nice', 'Bordeaux'],
        'high': ['Paris', 'Strasbourg']
      }
    },
    'IT': {
      cities: ['Rome', 'Milan', 'Venice', 'Florence', 'Naples', 'Turin'],
      budgetMapping: {
        'low': ['Naples', 'Turin'],
        'medium': ['Florence', 'Venice'],
        'high': ['Rome', 'Milan']
      }
    },
    'JP': {
      cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo'],
      budgetMapping: {
        'low': ['Nagoya', 'Sapporo'],
        'medium': ['Osaka', 'Yokohama'],
        'high': ['Tokyo', 'Kyoto']
      }
    },
    'ES': {
      cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao', 'Granada'],
      budgetMapping: {
        'low': ['Seville', 'Granada'],
        'medium': ['Valencia', 'Bilbao'],
        'high': ['Madrid', 'Barcelona']
      }
    },
    'UK': {
      cities: ['London', 'Manchester', 'Edinburgh', 'Glasgow', 'Birmingham', 'Liverpool'],
      budgetMapping: {
        'low': ['Glasgow', 'Liverpool'],
        'medium': ['Manchester', 'Birmingham'],
        'high': ['London', 'Edinburgh']
      }
    },
    // Asia-Pacific
    'TH': {
      cities: ['Bangkok', 'Chiang Mai', 'Phuket', 'Koh Samui', 'Pai'],
      budgetMapping: {
        'low': ['Bangkok', 'Pai'],
        'medium': ['Chiang Mai', 'Bangkok'],
        'high': ['Phuket', 'Koh Samui']
      }
    },
    'ID': {
      cities: ['Ubud', 'Seminyak', 'Canggu', 'Nusa Dua', 'Lombok'],
      budgetMapping: {
        'low': ['Canggu', 'Ubud'],
        'medium': ['Seminyak', 'Ubud'],
        'high': ['Nusa Dua', 'Seminyak']
      }
    },
    'IN': {
      cities: ['Jaipur', 'Goa', 'Delhi', 'Mumbai', 'Varanasi', 'Kerala'],
      budgetMapping: {
        'low': ['Varanasi', 'Delhi'],
        'medium': ['Jaipur', 'Goa'],
        'high': ['Kerala', 'Mumbai']
      }
    },
    'VN': {
      cities: ['Hội An', 'Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Phú Quốc'],
      budgetMapping: {
        'low': ['Hanoi', 'Ho Chi Minh City'],
        'medium': ['Hội An', 'Da Nang'],
        'high': ['Phú Quốc', 'Hội An']
      }
    },
    'SG': {
      cities: ['Singapore'],
      budgetMapping: {
        'low': ['Singapore'],
        'medium': ['Singapore'],
        'high': ['Singapore']
      }
    },
    'AU': {
      cities: ['Sydney', 'Melbourne', 'Brisbane', 'Cairns', 'Gold Coast'],
      budgetMapping: {
        'low': ['Brisbane', 'Melbourne'],
        'medium': ['Melbourne', 'Sydney'],
        'high': ['Sydney', 'Cairns']
      }
    },
    'NZ': {
      cities: ['Queenstown', 'Auckland', 'Christchurch', 'Rotorua', 'Wellington'],
      budgetMapping: {
        'low': ['Auckland', 'Wellington'],
        'medium': ['Christchurch', 'Rotorua'],
        'high': ['Queenstown', 'Auckland']
      }
    },
    // Middle East / Africa
    'AE': {
      cities: ['Dubai', 'Abu Dhabi'],
      budgetMapping: {
        'low': ['Abu Dhabi', 'Dubai'],
        'medium': ['Dubai', 'Abu Dhabi'],
        'high': ['Dubai', 'Abu Dhabi']
      }
    },
    'MA': {
      cities: ['Marrakech', 'Fez', 'Chefchaouen', 'Essaouira', 'Casablanca'],
      budgetMapping: {
        'low': ['Fez', 'Chefchaouen'],
        'medium': ['Marrakech', 'Essaouira'],
        'high': ['Marrakech', 'Casablanca']
      }
    },
    'ZA': {
      cities: ['Cape Town', 'Johannesburg', 'Kruger National Park', 'Durban'],
      budgetMapping: {
        'low': ['Johannesburg', 'Durban'],
        'medium': ['Cape Town', 'Johannesburg'],
        'high': ['Cape Town', 'Kruger National Park']
      }
    },
    'KE': {
      cities: ['Nairobi', 'Masai Mara', 'Mombasa', 'Amboseli'],
      budgetMapping: {
        'low': ['Nairobi', 'Mombasa'],
        'medium': ['Nairobi', 'Amboseli'],
        'high': ['Masai Mara', 'Amboseli']
      }
    },
    // Europe
    'GR': {
      cities: ['Athens', 'Santorini', 'Mykonos', 'Thessaloniki', 'Crete'],
      budgetMapping: {
        'low': ['Athens', 'Thessaloniki'],
        'medium': ['Crete', 'Athens'],
        'high': ['Santorini', 'Mykonos']
      }
    },
    'PT': {
      cities: ['Lisbon', 'Porto', 'Algarve', 'Sintra', 'Évora'],
      budgetMapping: {
        'low': ['Porto', 'Évora'],
        'medium': ['Lisbon', 'Porto'],
        'high': ['Lisbon', 'Algarve']
      }
    },
    'CH': {
      cities: ['Zurich', 'Geneva', 'Lucerne', 'Zermatt', 'Interlaken'],
      budgetMapping: {
        'low': ['Zurich', 'Geneva'],
        'medium': ['Lucerne', 'Interlaken'],
        'high': ['Zermatt', 'Lucerne']
      }
    },
    'HR': {
      cities: ['Dubrovnik', 'Split', 'Hvar', 'Plitvice Lakes', 'Zadar'],
      budgetMapping: {
        'low': ['Zadar', 'Split'],
        'medium': ['Split', 'Hvar'],
        'high': ['Dubrovnik', 'Hvar']
      }
    },
    'TR': {
      cities: ['Istanbul', 'Cappadocia', 'Antalya', 'Bodrum', 'Pamukkale'],
      budgetMapping: {
        'low': ['Istanbul', 'Pamukkale'],
        'medium': ['Antalya', 'Istanbul'],
        'high': ['Cappadocia', 'Bodrum']
      }
    },
    // Americas
    'BR': {
      cities: ['Rio de Janeiro', 'São Paulo', 'Florianópolis', 'Salvador', 'Manaus'],
      budgetMapping: {
        'low': ['Salvador', 'São Paulo'],
        'medium': ['Florianópolis', 'Rio de Janeiro'],
        'high': ['Rio de Janeiro', 'Florianópolis']
      }
    },
    'MX': {
      cities: ['Mexico City', 'Cancún', 'Oaxaca', 'San Miguel de Allende', 'Tulum'],
      budgetMapping: {
        'low': ['Oaxaca', 'Mexico City'],
        'medium': ['Mexico City', 'Cancún'],
        'high': ['Tulum', 'San Miguel de Allende']
      }
    },
    'PE': {
      cities: ['Cusco', 'Lima', 'Machu Picchu', 'Arequipa', 'Puno'],
      budgetMapping: {
        'low': ['Lima', 'Arequipa'],
        'medium': ['Cusco', 'Lima'],
        'high': ['Machu Picchu', 'Cusco']
      }
    },
  };

  const countryData = cityDatabase[countryCode];
  if (!countryData) {
    // Fallback to generic city
    return { cityName: 'Capital City' };
  }

  const budgetLevel = budget.toLowerCase();
  const budgetCities = countryData.budgetMapping[budgetLevel] || countryData.cities.slice(0, 2);
  
  const URBAN_CITIES    = new Set(['New York', 'Tokyo', 'London', 'Bangkok', 'Singapore', 'Dubai', 'Mexico City', 'São Paulo', 'Mumbai', 'Ho Chi Minh City', 'Istanbul', 'Nairobi', 'Johannesburg'])
  const BEACH_CITIES    = new Set(['Miami', 'Phuket', 'Koh Samui', 'Bali', 'Seminyak', 'Canggu', 'Nusa Dua', 'Cancún', 'Tulum', 'Mombasa', 'Hvar', 'Mykonos', 'Santorini', 'Algarve', 'Antalya', 'Bodrum', 'Florianópolis', 'Gold Coast', 'Phú Quốc'])
  const CULTURAL_CITIES = new Set(['Paris', 'Rome', 'Kyoto', 'Athens', 'Marrakech', 'Fez', 'Varanasi', 'Jaipur', 'Cusco', 'Oaxaca', 'Istanbul', 'Chefchaouen', 'Hội An', 'Évora', 'Dubrovnik'])
  const NATURE_CITIES   = new Set(['Queenstown', 'Interlaken', 'Zermatt', 'Cappadocia', 'Plitvice Lakes', 'Masai Mara', 'Amboseli', 'Kruger National Park', 'Machu Picchu', 'Manaus', 'Cairns', 'Pai', 'Ubud', 'Rotorua'])

  const profileBasedCity = budgetCities.find(city => {
    const env = profile.preferredEnvironment
    if (env === 'urban'   && URBAN_CITIES.has(city))    return true
    if (env === 'beach'   && BEACH_CITIES.has(city))    return true
    if (env === 'cultural'&& CULTURAL_CITIES.has(city)) return true
    if (env === 'nature'  && NATURE_CITIES.has(city))   return true
    if (env === 'mountain'&& NATURE_CITIES.has(city))   return true
    return false
  });

  return { cityName: profileBasedCity || budgetCities[0] };
}

// Hotels based on budget and city
export function getHotelsForBudget(city: string, budget: string): Hotel[] {
  const hotelDatabase: Record<string, Record<string, Hotel[]>> = {
    'New York': {
      'low': [
        { name: 'Pod Times Square', priceLevel: 'low', rating: 4.0 },
        { name: 'The Jane Hotel', priceLevel: 'low', rating: 3.5 }
      ],
      'medium': [
        { name: 'The Moxy NYC', priceLevel: 'medium', rating: 4.2 },
        { name: 'CitizenM Times Square', priceLevel: 'medium', rating: 4.3 }
      ],
      'high': [
        { name: 'The Plaza', priceLevel: 'high', rating: 4.7 },
        { name: 'The St. Regis', priceLevel: 'high', rating: 4.8 }
      ]
    },
    'Paris': {
      'low': [
        { name: 'Hotel Adèle & Jules', priceLevel: 'low', rating: 4.1 },
        { name: 'Hotel des Grands Boulevards', priceLevel: 'low', rating: 4.0 }
      ],
      'medium': [
        { name: 'Pullman Paris Tour Eiffel', priceLevel: 'medium', rating: 4.3 },
        { name: 'Novotel Paris Centre', priceLevel: 'medium', rating: 4.2 }
      ],
      'high': [
        { name: 'Le Meurice', priceLevel: 'high', rating: 4.8 },
        { name: 'The Ritz Paris', priceLevel: 'high', rating: 4.9 }
      ]
    },
    'Tokyo': {
      'low': [
        { name: 'Hotel Sunroute Plaza', priceLevel: 'low', rating: 4.0 },
        { name: 'APA Hotel', priceLevel: 'low', rating: 3.8 }
      ],
      'medium': [
        { name: 'Hotel Gracery Shinjuku', priceLevel: 'medium', rating: 4.2 },
        { name: 'Shibuya Excel Hotel', priceLevel: 'medium', rating: 4.1 }
      ],
      'high': [
        { name: 'The Ritz Carlton Tokyo', priceLevel: 'high', rating: 4.7 },
        { name: 'Mandarin Oriental Tokyo', priceLevel: 'high', rating: 4.8 }
      ]
    }
  };

  const cityHotels = hotelDatabase[city];
  if (!cityHotels) {
    // Fallback hotels
    return [
      { name: 'City Center Hotel', priceLevel: 'medium', rating: 4.0 },
      { name: 'Budget Inn', priceLevel: 'low', rating: 3.5 },
      { name: 'Luxury Resort', priceLevel: 'high', rating: 4.5 }
    ];
  }

  const budgetLevel = budget.toLowerCase();
  return cityHotels[budgetLevel] || cityHotels['medium'];
}

// Restaurants based on budget and city
export function getRestaurantsForBudget(city: string, budget: string): Restaurant[] {
  const restaurantDatabase: Record<string, Record<string, Restaurant[]>> = {
    'New York': {
      'low': [
        { name: 'Joe\'s Pizza', cuisine: 'American', priceLevel: 'low' },
        { name: 'Katz\'s Delicatessen', cuisine: 'Jewish', priceLevel: 'low' }
      ],
      'medium': [
        { name: 'Gramercy Tavern', cuisine: 'American', priceLevel: 'medium' },
        { name: 'Xi\'an Famous Foods', cuisine: 'Chinese', priceLevel: 'medium' }
      ],
      'high': [
        { name: 'Le Bernardin', cuisine: 'French', priceLevel: 'high' },
        { name: 'Per Se', cuisine: 'American', priceLevel: 'high' }
      ]
    },
    'Paris': {
      'low': [
        { name: 'L\'As du Fallafel', cuisine: 'Middle Eastern', priceLevel: 'low' },
        { name: 'Breizh Café', cuisine: 'Crêperie', priceLevel: 'low' }
      ],
      'medium': [
        { name: 'Le Bouillon Chartier', cuisine: 'French', priceLevel: 'medium' },
        { name: 'Chez Janou', cuisine: 'French', priceLevel: 'medium' }
      ],
      'high': [
        { name: 'L\'Astrance', cuisine: 'French', priceLevel: 'high' },
        { name: 'Pierre Gagnaire', cuisine: 'French', priceLevel: 'high' }
      ]
    },
    'Tokyo': {
      'low': [
        { name: 'Ichiran Ramen', cuisine: 'Japanese', priceLevel: 'low' },
        { name: 'Konbini Stores', cuisine: 'Japanese', priceLevel: 'low' }
      ],
      'medium': [
        { name: 'Sushi Zanmai', cuisine: 'Japanese', priceLevel: 'medium' },
        { name: 'Tonki', cuisine: 'Japanese', priceLevel: 'medium' }
      ],
      'high': [
        { name: 'Sukiyabashi Jiro', cuisine: 'Japanese', priceLevel: 'high' },
        { name: 'Narisawa', cuisine: 'Japanese', priceLevel: 'high' }
      ]
    }
  };

  const cityRestaurants = restaurantDatabase[city];
  if (!cityRestaurants) {
    // Fallback restaurants
    return [
      { name: 'Local Bistro', cuisine: 'Local', priceLevel: 'medium' },
      { name: 'Street Food Corner', cuisine: 'International', priceLevel: 'low' },
      { name: 'Fine Dining Restaurant', cuisine: 'International', priceLevel: 'high' }
    ];
  }

  const budgetLevel = budget.toLowerCase();
  return cityRestaurants[budgetLevel] || cityRestaurants['medium'];
}

// Fetch holidays from external API
export async function getHolidaysForCountry(countryCode: string, year: number): Promise<Holiday[]> {
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch holidays for ${countryCode}`);
      return [];
    }

    const holidays: Holiday[] = await response.json();
    return holidays.map(holiday => ({
      date: holiday.date,
      name: holiday.name,
      localName: holiday.localName
    }));
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
}

// Filter holidays within travel date range
export function filterHolidaysByDateRange(holidays: Holiday[], startDate: string, endDate: string): Holiday[] {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return holidays.filter(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate >= start && holidayDate <= end;
  });
}

// Main function to get enhanced destination details
// Hotels and restaurants are intentionally empty here — real data comes from
// /api/destination which calls HotelBeds and Google Places.
// Only city suggestion and public holidays are returned from this function.
export async function getEnhancedDestinationDetails(
  countryCode: string,
  profile: any,
  budget: string,
  travelDates?: { start: string; end: string }
): Promise<EnhancedDestinationDetails> {
  const city = getBestCity(countryCode, profile, budget)

  // Public holidays from the free Nager.Date API (no API key required)
  let events: Holiday[] = []
  if (travelDates?.start && travelDates?.end) {
    const year = new Date(travelDates.start).getFullYear()
    const allHolidays = await getHolidaysForCountry(countryCode, year)
    events = filterHolidaysByDateRange(allHolidays, travelDates.start, travelDates.end)
  }

  // Return empty arrays — never return "City Center Hotel" or "Budget Inn" etc.
  // The destination guide page calls /api/destination for real hotel/restaurant data.
  return { city, hotels: [], restaurants: [], events }
}
