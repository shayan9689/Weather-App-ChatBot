/**
 * Local Weather RAG Knowledge Base for Pakistan Cities
 * Contains weather patterns, seasonal information, and safety tips
 */

const pakistanCitiesWeather = {
  lahore: {
    city: "Lahore",
    climate: "Semi-arid with hot summers and mild winters",
    seasons: {
      summer: "Extremely hot (May-June), temperatures can reach 45-48°C. Heatwaves are common.",
      monsoon: "Heavy rainfall during July-August, occasional flooding in low-lying areas.",
      winter: "Mild and pleasant (Dec-Feb), but severe smog pollution from November to January.",
      spring: "Moderate temperatures (March-April), pleasant weather.",
    },
    notableFeatures: [
      "Severe smog during winter months (Nov-Jan)",
      "High humidity during monsoon season",
      "Dust storms possible in summer",
    ],
    safetyTips: [
      "During smog: Wear N95 masks, limit outdoor activities, use air purifiers indoors",
      "During heatwaves: Stay hydrated, avoid sun exposure 11 AM - 4 PM, wear light clothing",
      "During monsoon: Avoid low-lying areas, be cautious of flash floods",
    ],
  },
  karachi: {
    city: "Karachi",
    climate: "Hot desert climate with high humidity due to Arabian Sea",
    seasons: {
      summer: "Very hot and humid (April-September), temperatures 35-40°C with high humidity.",
      monsoon: "Moderate rainfall (July-August), sea breeze provides relief in evenings.",
      winter: "Mild and pleasant (Nov-Feb), temperatures 15-25°C, best time to visit.",
      spring: "Warm and dry (March), pleasant before summer heat sets in.",
    },
    notableFeatures: [
      "Sea breeze (Breeze) in evenings provides natural cooling",
      "High humidity year-round",
      "Occasional cyclones from Arabian Sea",
    ],
    safetyTips: [
      "Stay hydrated due to high humidity",
      "Use sunscreen and protective clothing",
      "Be aware of cyclone warnings during monsoon",
      "Enjoy evening sea breeze for natural cooling",
    ],
  },
  islamabad: {
    city: "Islamabad",
    climate: "Humid subtropical with cooler temperatures than other major cities",
    seasons: {
      summer: "Warm but not extreme (May-August), temperatures 30-35°C, occasional thunderstorms.",
      monsoon: "Heavy rainfall (July-August), beautiful green landscapes, occasional landslides in Margalla Hills.",
      winter: "Cool with foggy mornings (Dec-Feb), temperatures 5-15°C, occasional light frost.",
      spring: "Pleasant and mild (March-April), blooming flowers, ideal weather.",
    },
    notableFeatures: [
      "Cooler nights compared to other cities",
      "Foggy winter mornings",
      "Beautiful spring season",
      "Landslide risk in Margalla Hills during heavy rain",
    ],
    safetyTips: [
      "During fog: Drive carefully, use fog lights, allow extra travel time",
      "During monsoon: Avoid hiking in Margalla Hills, beware of landslides",
      "Layer clothing in winter for temperature variations",
    ],
  },
  peshawar: {
    city: "Peshawar",
    climate: "Hot semi-arid with continental influences",
    seasons: {
      summer: "Very hot and dry (May-August), temperatures can exceed 40°C.",
      monsoon: "Moderate rainfall (July-August), less than other regions.",
      winter: "Cool and dry (Dec-Feb), temperatures 5-20°C, occasional cold spells.",
      spring: "Pleasant (March-April), moderate temperatures.",
    },
    notableFeatures: [
      "Dry heat in summer",
      "Less humidity than coastal areas",
      "Dust storms possible",
    ],
    safetyTips: [
      "Stay hydrated during hot summers",
      "Protect from dust storms",
      "Layer clothing for winter temperature drops",
    ],
  },
  quetta: {
    city: "Quetta",
    climate: "Cold semi-arid with significant temperature variations",
    seasons: {
      summer: "Warm days, cool nights (May-August), temperatures 25-35°C.",
      monsoon: "Light rainfall (July-August), less than other regions.",
      winter: "Cold and dry (Dec-Feb), temperatures can drop below freezing, occasional snowfall.",
      spring: "Mild and pleasant (March-April), ideal weather.",
    },
    notableFeatures: [
      "Significant day-night temperature differences",
      "Coldest winters among major cities",
      "Occasional snowfall in winter",
    ],
    safetyTips: [
      "Bundle up in winter, temperatures can be very cold",
      "Prepare for snowfall and icy conditions",
      "Layer clothing for temperature variations",
    ],
  },
  multan: {
    city: "Multan",
    climate: "Hot desert with extreme summer temperatures",
    seasons: {
      summer: "Extremely hot (May-August), temperatures can reach 48-50°C, one of the hottest cities.",
      monsoon: "Moderate rainfall (July-August), provides some relief.",
      winter: "Mild and pleasant (Dec-Feb), temperatures 10-25°C.",
      spring: "Warm (March-April), temperatures rising.",
    },
    notableFeatures: [
      "One of the hottest cities in Pakistan",
      "Dry heat",
      "Dust storms common",
    ],
    safetyTips: [
      "Extreme heat precautions essential in summer",
      "Stay indoors during peak heat hours",
      "Hydrate constantly",
      "Protect from dust storms",
    ],
  },
  "northern-areas": {
    city: "Northern Areas (Gilgit-Baltistan, Khyber Pakhtunkhwa mountains)",
    climate: "Alpine and highland climate with cold winters",
    seasons: {
      summer: "Mild and pleasant (June-August), ideal for tourism, temperatures 15-25°C.",
      monsoon: "Heavy rainfall and risk of landslides (July-August), some areas inaccessible.",
      winter: "Cold with heavy snowfall (Dec-Feb), temperatures below freezing, many areas snowbound.",
      spring: "Cool with melting snow (March-May), beautiful landscapes.",
    },
    notableFeatures: [
      "Heavy snowfall in winter (Dec-Feb)",
      "Landslide risk during monsoon season",
      "Avalanche risk in high-altitude areas",
      "Beautiful summer weather for tourism",
    ],
    safetyTips: [
      "Winter: Prepare for extreme cold, snow, and potential road closures",
      "Monsoon: Avoid travel, high landslide risk",
      "Check weather forecasts and road conditions before travel",
      "Carry appropriate gear for cold weather",
      "Be aware of avalanche warnings in high-altitude areas",
    ],
  },
};

/**
 * Get weather information for a specific city
 */
function getCityWeatherInfo(cityName) {
  const normalizedCity = cityName.toLowerCase().trim();
  
  // Direct match
  if (pakistanCitiesWeather[normalizedCity]) {
    return pakistanCitiesWeather[normalizedCity];
  }
  
  // Partial match
  for (const [key, info] of Object.entries(pakistanCitiesWeather)) {
    if (normalizedCity.includes(key) || key.includes(normalizedCity)) {
      return info;
    }
  }
  
  return null;
}

/**
 * Format weather knowledge as a string for RAG context
 */
function getWeatherKnowledgeContext() {
  let context = "PAKISTAN WEATHER KNOWLEDGE BASE:\n\n";
  
  for (const [key, info] of Object.entries(pakistanCitiesWeather)) {
    context += `CITY: ${info.city}\n`;
    context += `Climate: ${info.climate}\n`;
    context += `Seasons:\n`;
    context += `  Summer: ${info.seasons.summer}\n`;
    context += `  Monsoon: ${info.seasons.monsoon}\n`;
    context += `  Winter: ${info.seasons.winter}\n`;
    context += `  Spring: ${info.seasons.spring}\n`;
    context += `Notable Features: ${info.notableFeatures.join(", ")}\n`;
    context += `Safety Tips: ${info.safetyTips.join(" | ")}\n\n`;
  }
  
  return context;
}

module.exports = {
  pakistanCitiesWeather,
  getCityWeatherInfo,
  getWeatherKnowledgeContext,
};
