import { RecommendedPlace } from '../types';

// Gulf Road Trip: Oman → Qatar → Saudi Arabia → Kuwait → Saudi Arabia → Oman
export const recommendedPlaces: RecommendedPlace[] = [
  // QATAR - DOHA (Days 2-3)
  {
    name: "The Pearl-Qatar",
    type: "attraction",
    category: ["Shopping", "Attractions"],
    description: "Luxury artificial island with upscale shopping, dining, and waterfront living. Explore marina walkways, boutiques, and cafes with stunning views.",
    images: [
      "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&auto=format&fit=crop"
    ],
    timeToReach: 30,
    price: 0,
    currency: "QAR",
    location: "Doha, Qatar",
    distanceFromUser: 5.2,
    dateRange: "Dec 16 - Dec 18",
    featured: true,
    timeCategory: "visit"
  },
  {
    name: "Museum of Islamic Art",
    type: "attraction",
    category: ["Attractions", "Museums"],
    description: "Stunning architectural masterpiece by I.M. Pei housing one of the world's finest Islamic art collections spanning 1,400 years.",
    images: [
      "https://images.unsplash.com/photo-1566127444979-b3d2b654e1d7?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595435742656-5272d0bd9a21?w=800&auto=format&fit=crop"
    ],
    timeToReach: 25,
    price: 15,
    currency: "QAR",
    location: "Doha, Qatar",
    distanceFromUser: 6.8,
    dateRange: "Dec 16 - Dec 18",
    timeCategory: "visit"
  },
  {
    name: "Souq Waqif",
    type: "attraction",
    category: ["Shopping", "Lifestyle"],
    description: "Traditional marketplace offering spices, textiles, handicrafts, and authentic Qatari cuisine. Experience the vibrant culture and haggle with friendly vendors.",
    images: [
      "https://images.unsplash.com/photo-1567447350272-a11b9a50d7ec?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&auto=format&fit=crop"
    ],
    timeToReach: 20,
    price: 0,
    currency: "QAR",
    location: "Doha, Qatar",
    distanceFromUser: 3.5,
    dateRange: "Dec 16 - Dec 18",
    timeCategory: "visit"
  },
  {
    name: "Katara Cultural Village",
    type: "attraction",
    category: ["Attractions", "Entertainment"],
    description: "Cultural hub featuring art galleries, theaters, restaurants, and beautiful Mediterranean-style architecture along the waterfront.",
    images: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop"
    ],
    timeToReach: 35,
    price: 0,
    currency: "QAR",
    location: "Doha, Qatar",
    distanceFromUser: 8.0,
    dateRange: "Dec 16 - Dec 18",
    timeCategory: "visit"
  },

  // SAUDI ARABIA - AL-AHSA (Days 4-5)
  {
    name: "Al-Ahsa Oasis",
    type: "attraction",
    category: ["Attractions", "Activities"],
    description: "UNESCO World Heritage site and the world's largest oasis. Explore date palm gardens, ancient irrigation systems, and traditional villages.",
    images: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&auto=format&fit=crop"
    ],
    timeToReach: 45,
    price: 20,
    currency: "SAR",
    location: "Al-Ahsa, Saudi Arabia",
    distanceFromUser: 12.0,
    dateRange: "Dec 18 - Dec 20",
    timeCategory: "visit"
  },
  {
    name: "Qasr Ibrahim (Ibrahim Palace)",
    type: "attraction",
    category: ["Attractions"],
    description: "Historic Ottoman fort and palace complex built in 1571. Features impressive domes, courtyards, and a fascinating military museum.",
    images: [
      "https://images.unsplash.com/photo-1591611892737-a2b0c680f128?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1577717775347-cc90b798dca8?w=800&auto=format&fit=crop"
    ],
    timeToReach: 30,
    price: 15,
    currency: "SAR",
    location: "Al-Ahsa, Saudi Arabia",
    distanceFromUser: 8.5,
    dateRange: "Dec 18 - Dec 20",
    timeCategory: "visit"
  },

  // KUWAIT - KUWAIT CITY (Day 7)
  {
    name: "Kuwait Towers",
    type: "attraction",
    category: ["Attractions"],
    description: "Iconic landmark featuring three slender towers. Visit the observation deck for panoramic city views and dine at the revolving restaurant.",
    images: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop"
    ],
    timeToReach: 25,
    price: 8,
    currency: "KWD",
    location: "Kuwait City, Kuwait",
    distanceFromUser: 4.5,
    dateRange: "Dec 20 - Dec 21",
    timeCategory: "visit"
  },
  {
    name: "The Avenues Mall",
    type: "shopping",
    category: ["Shopping"],
    description: "One of the largest malls in the Middle East with over 800 stores, entertainment venues, and diverse dining options across themed districts.",
    images: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800&auto=format&fit=crop"
    ],
    timeToReach: 35,
    price: 0,
    currency: "KWD",
    location: "Kuwait City, Kuwait",
    distanceFromUser: 7.2,
    dateRange: "Dec 20 - Dec 21",
    timeCategory: "visit"
  },

  // SAUDI ARABIA - HAIL (Day 9)
  {
    name: "Jubbah Rock Art",
    type: "attraction",
    category: ["Attractions"],
    description: "UNESCO World Heritage site featuring ancient rock carvings and inscriptions dating back 10,000 years. Witness prehistoric art in the desert.",
    images: [
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&auto=format&fit=crop"
    ],
    timeToReach: 90,
    price: 10,
    currency: "SAR",
    location: "Hail, Saudi Arabia",
    distanceFromUser: 65.0,
    dateRange: "Dec 22 - Dec 23",
    timeCategory: "visit"
  },
  {
    name: "Qishlah Palace",
    type: "attraction",
    category: ["Attractions"],
    description: "Historic mud-brick palace in the heart of Hail. Beautiful traditional architecture with courtyards, towers, and cultural exhibitions.",
    images: [
      "https://images.unsplash.com/photo-1591611892737-a2b0c680f128?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1577717775347-cc90b798dca8?w=800&auto=format&fit=crop"
    ],
    timeToReach: 20,
    price: 5,
    currency: "SAR",
    location: "Hail, Saudi Arabia",
    distanceFromUser: 3.8,
    dateRange: "Dec 22 - Dec 23",
    timeCategory: "visit"
  },

  // SAUDI ARABIA - RIYADH (Day 10)
  {
    name: "Masmak Fortress",
    type: "attraction",
    category: ["Attractions"],
    description: "Historic clay and mud-brick fort that played a pivotal role in Saudi Arabia's history. Now a museum showcasing the country's unification.",
    images: [
      "https://images.unsplash.com/photo-1591611892737-a2b0c680f128?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1577717775347-cc90b798dca8?w=800&auto=format&fit=crop"
    ],
    timeToReach: 30,
    price: 10,
    currency: "SAR",
    location: "Riyadh, Saudi Arabia",
    distanceFromUser: 8.0,
    dateRange: "Dec 23 - Dec 24",
    timeCategory: "visit"
  },
  {
    name: "Kingdom Centre Tower",
    type: "attraction",
    category: ["Attractions", "Shopping"],
    description: "Iconic 99-floor skyscraper with sky bridge observation deck offering breathtaking 360° views of Riyadh. Luxury shopping mall at base.",
    images: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop"
    ],
    timeToReach: 40,
    price: 25,
    currency: "SAR",
    location: "Riyadh, Saudi Arabia",
    distanceFromUser: 12.5,
    dateRange: "Dec 23 - Dec 24",
    timeCategory: "visit"
  },
  {
    name: "Diriyah Historic District",
    type: "attraction",
    category: ["Attractions"],
    description: "UNESCO World Heritage site and birthplace of the first Saudi state. Explore mud-brick architecture, museums, and traditional Najdi culture.",
    images: [
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&auto=format&fit=crop"
    ],
    timeToReach: 50,
    price: 15,
    currency: "SAR",
    location: "Riyadh, Saudi Arabia",
    distanceFromUser: 18.0,
    dateRange: "Dec 23 - Dec 24",
    timeCategory: "visit"
  },

  // BREAKFAST OPTIONS
  {
    name: "Al Mourjan Restaurant",
    type: "meal",
    category: ["Restaurants"],
    description: "Traditional Qatari breakfast buffet with stunning sea views. Fresh Arabic pastries, mezze, and local specialties.",
    images: [
      "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&auto=format&fit=crop"
    ],
    timeToReach: 20,
    price: 80,
    currency: "QAR",
    location: "Doha, Qatar",
    distanceFromUser: 4.0,
    timeCategory: "breakfast"
  },
  {
    name: "Shawarma House",
    type: "meal",
    category: ["Restaurants"],
    description: "Popular local spot for traditional Saudi breakfast. Foul, falafel, fresh bread, and mint tea.",
    images: [
      "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1485963631004-f2f00b1d6606?w=800&auto=format&fit=crop"
    ],
    timeToReach: 15,
    price: 40,
    currency: "SAR",
    location: "Al-Ahsa, Saudi Arabia",
    distanceFromUser: 2.5,
    timeCategory: "breakfast"
  },

  // LUNCH OPTIONS
  {
    name: "Damasca One Restaurant",
    type: "meal",
    category: ["Restaurants"],
    description: "Authentic Middle Eastern cuisine with fresh mezze, grilled meats, and traditional dishes. Perfect lunch spot.",
    images: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop"
    ],
    timeToReach: 25,
    price: 120,
    currency: "QAR",
    location: "Doha, Qatar",
    distanceFromUser: 5.5,
    timeCategory: "lunch"
  },
  {
    name: "Freej Swaileh Restaurant",
    type: "meal",
    category: ["Restaurants"],
    description: "Traditional Kuwaiti cuisine in a heritage setting. Famous for machboos, harees, and fresh seafood.",
    images: [
      "https://images.unsplash.com/photo-1562007908-17c67e878c88?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596649183105-cfdd4f0d5b37?w=800&auto=format&fit=crop"
    ],
    timeToReach: 30,
    price: 15,
    currency: "KWD",
    location: "Kuwait City, Kuwait",
    distanceFromUser: 6.0,
    timeCategory: "lunch"
  },

  // DINNER OPTIONS
  {
    name: "Parisa Souq Waqif",
    type: "meal",
    category: ["Restaurants"],
    description: "Upscale Persian restaurant in Souq Waqif. Elegant ambiance with traditional decor and delicious kebabs.",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&auto=format&fit=crop"
    ],
    timeToReach: 20,
    price: 200,
    currency: "QAR",
    location: "Doha, Qatar",
    distanceFromUser: 3.5,
    timeCategory: "dinner"
  },
  {
    name: "Najd Village Restaurant",
    type: "meal",
    category: ["Restaurants"],
    description: "Traditional Saudi dining experience with authentic Najdi cuisine. Floor seating and cultural atmosphere.",
    images: [
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&auto=format&fit=crop"
    ],
    timeToReach: 25,
    price: 100,
    currency: "SAR",
    location: "Riyadh, Saudi Arabia",
    distanceFromUser: 7.0,
    timeCategory: "dinner"
  },

  // HOTEL OPTIONS
  {
    name: "The St. Regis Doha",
    type: "hotel",
    category: ["Hotels"],
    description: "Luxury 5-star hotel with elegant rooms, world-class spa, and stunning views of West Bay.",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop"
    ],
    timeToReach: 30,
    price: 1200,
    currency: "QAR",
    location: "Doha, Qatar",
    distanceFromUser: 8.0,
    timeCategory: "hotel",
    accommodationType: "5-star Luxury Hotel"
  },
  {
    name: "Intercontinental Al Ahsa",
    type: "hotel",
    category: ["Hotels"],
    description: "Modern comfort in the heart of Al-Ahsa oasis. Pool, fitness center, and excellent breakfast buffet.",
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop"
    ],
    timeToReach: 20,
    price: 450,
    currency: "SAR",
    location: "Al-Ahsa, Saudi Arabia",
    distanceFromUser: 4.5,
    timeCategory: "hotel",
    accommodationType: "4-star Hotel"
  },
  {
    name: "Jumeirah Messilah Beach Hotel",
    type: "hotel",
    category: ["Hotels"],
    description: "Beachfront luxury resort with private beach, multiple pools, and extensive facilities for relaxation.",
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop"
    ],
    timeToReach: 35,
    price: 180,
    currency: "KWD",
    location: "Kuwait City, Kuwait",
    distanceFromUser: 12.0,
    timeCategory: "hotel",
    accommodationType: "5-star Beach Resort"
  },

  // PRAYER LOCATIONS
  {
    name: "Imam Muhammad ibn Abd al-Wahhab Mosque",
    type: "prayer",
    category: ["Prayer"],
    description: "Qatar's national mosque with stunning architecture. Peaceful prayer halls and beautiful courtyard.",
    images: [
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop"
    ],
    timeToReach: 25,
    price: 0,
    currency: "QAR",
    location: "Doha, Qatar",
    distanceFromUser: 5.0,
    timeCategory: "prayer"
  },
  {
    name: "Grand Mosque Kuwait",
    type: "prayer",
    category: ["Prayer"],
    description: "Kuwait's largest and official mosque. Beautiful Islamic architecture with intricate decorations.",
    images: [
      "https://images.unsplash.com/photo-1590075865807-8b5e6c9dec10?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584655448923-e27e64b44149?w=800&auto=format&fit=crop"
    ],
    timeToReach: 20,
    price: 0,
    currency: "KWD",
    location: "Kuwait City, Kuwait",
    distanceFromUser: 4.0,
    timeCategory: "prayer"
  }
];

// Trip route summary:
// Day 1: Sohar, Oman → Doha, Qatar (8hr drive)
// Days 2-3: Doha exploration
// Day 4: Doha → Al-Ahsa, Saudi Arabia (3hr drive)
// Day 5: Al-Ahsa exploration
// Day 6: Al-Ahsa → Kuwait City, Kuwait (drive)
// Day 7: Kuwait City exploration
// Day 8: Kuwait → Hail, Saudi Arabia (drive)
// Day 9: Hail exploration
// Day 10: Hail → Riyadh → back to Sohar, Oman
