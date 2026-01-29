// Educational Content for Lindol.ph
// Comprehensive earthquake education and safety information

// ============================================================================
// EMERGENCY CONTACTS - Philippines
// ============================================================================
export const NATIONAL_EMERGENCY_CONTACTS = {
  national: [
    { name: "National Emergency Hotline", number: "911", description: "Primary emergency number for police, fire, and medical" },
    { name: "Philippine Red Cross", number: "143", description: "24/7 emergency assistance and disaster response" },
    { name: "NDRRMC Operations Center", number: "(02) 8911-5061", description: "National Disaster Risk Reduction Management Council" },
    { name: "PHIVOLCS", number: "(02) 8426-1468", description: "Philippine Institute of Volcanology and Seismology" },
    { name: "PHIVOLCS 24/7", number: "(02) 8929-9254", description: "Round-the-clock seismic monitoring" },
    { name: "Philippine Coast Guard", number: "(02) 8527-3877", description: "For maritime emergencies and tsunamis" },
    { name: "Bureau of Fire Protection", number: "(02) 8426-0219", description: "Fire and rescue services" },
    { name: "DOH Emergency", number: "(02) 8651-7800", description: "Department of Health emergency line" },
  ],
  utilities: [
    { name: "Meralco Hotline", number: "16211", description: "Electrical emergency (Luzon)" },
    { name: "Manila Water", number: "1627", description: "Water service emergency" },
    { name: "Maynilad", number: "1626", description: "Water service emergency (West Zone)" },
    { name: "PLDT Repair", number: "171", description: "Telephone/internet issues" },
  ],
};

// Regional emergency contacts
export const REGIONAL_EMERGENCY_CONTACTS: Record<string, Array<{name: string, number: string, description: string}>> = {
  "NCR": [
    { name: "MMDA Hotline", number: "136", description: "Metro Manila Development Authority" },
    { name: "Manila DRRM", number: "(02) 8527-0218", description: "Manila City disaster response" },
    { name: "QC DRRM", number: "(02) 8988-9595", description: "Quezon City disaster response" },
  ],
  "III": [
    { name: "Central Luzon RDRRMC", number: "(045) 455-1526", description: "Regional disaster management" },
    { name: "Pampanga PDRRMO", number: "(045) 963-5284", description: "Provincial disaster office" },
  ],
  "IV-A": [
    { name: "CALABARZON RDRRMC", number: "(049) 531-7825", description: "Regional disaster management" },
    { name: "Batangas PDRRMO", number: "(043) 723-2055", description: "Provincial disaster office" },
  ],
  "V": [
    { name: "Bicol RDRRMC", number: "(052) 481-1380", description: "Regional disaster management" },
    { name: "Albay PDRRMO", number: "(052) 742-1234", description: "Provincial disaster office" },
  ],
  "VII": [
    { name: "Central Visayas RDRRMC", number: "(032) 254-6851", description: "Regional disaster management" },
    { name: "Cebu PDRRMO", number: "(032) 255-1234", description: "Provincial disaster office" },
  ],
  "XI": [
    { name: "Davao RDRRMC", number: "(082) 227-3718", description: "Regional disaster management" },
    { name: "Davao City 911", number: "911", description: "Local emergency services" },
  ],
};

// ============================================================================
// EARTHQUAKE SCIENCE EDUCATION
// ============================================================================
export const EARTHQUAKE_SCIENCE = {
  whatCausesEarthquakes: {
    title: "What Causes Earthquakes?",
    content: `Earthquakes occur when rocks under the Earth's surface suddenly break along a fault. This sudden release of energy causes seismic waves that make the ground shake. The Philippines experiences frequent earthquakes because it sits on the Pacific Ring of Fire, where several tectonic plates meet and interact.`,
    keyPoints: [
      "Tectonic plates constantly move at 2-10 cm per year",
      "Stress builds up where plates meet",
      "When stress exceeds rock strength, sudden rupture occurs",
      "Energy travels as seismic waves through the Earth",
    ],
  },
  
  philippineTectonics: {
    title: "Why the Philippines Has So Many Earthquakes",
    content: `The Philippines sits at the junction of the Philippine Sea Plate and the Eurasian Plate. This location, part of the Pacific Ring of Fire, makes it one of the most seismically active countries in the world. The Philippine Mobile Belt is a complex zone where multiple microplates interact.`,
    plates: [
      { name: "Philippine Sea Plate", direction: "Moving westward", rate: "6-8 cm/year" },
      { name: "Eurasian Plate", direction: "Relatively stationary", rate: "1-2 cm/year" },
      { name: "Philippine Mobile Belt", direction: "Complex deformation", rate: "Variable" },
    ],
    majorZones: [
      "Manila Trench - Western Luzon subduction zone",
      "Philippine Trench - Eastern Philippine subduction zone",
      "Philippine Fault Zone - Major strike-slip fault",
      "Cotabato Trench - Southern Mindanao subduction zone",
    ],
  },

  magnitudeVsIntensity: {
    title: "Magnitude vs. Intensity: What's the Difference?",
    magnitude: {
      definition: "Magnitude measures the ENERGY released at the earthquake's source (hypocenter)",
      scale: "Moment Magnitude Scale (Mw) - each whole number increase = 32x more energy",
      examples: [
        { mag: "2.0", description: "Barely felt", tntEquivalent: "1 ton of TNT" },
        { mag: "4.0", description: "Minor, felt by many", tntEquivalent: "1,000 tons of TNT" },
        { mag: "5.0", description: "Moderate, some damage", tntEquivalent: "32,000 tons of TNT" },
        { mag: "6.0", description: "Strong, significant damage", tntEquivalent: "1 million tons of TNT" },
        { mag: "7.0", description: "Major, widespread damage", tntEquivalent: "32 million tons of TNT" },
        { mag: "8.0", description: "Great, catastrophic damage", tntEquivalent: "1 billion tons of TNT" },
      ],
    },
    intensity: {
      definition: "Intensity measures the EFFECTS at a specific location",
      scale: "PHIVOLCS Earthquake Intensity Scale (PEIS) - based on human perception and damage",
      levels: [
        { level: "I", name: "Scarcely Perceptible", description: "Felt only by sensitive instruments" },
        { level: "II", name: "Slightly Felt", description: "Felt by few people at rest indoors" },
        { level: "III", name: "Weak", description: "Felt by many, hanging objects swing" },
        { level: "IV", name: "Moderately Strong", description: "Felt generally, many awakened" },
        { level: "V", name: "Strong", description: "Generally felt, some run outdoors" },
        { level: "VI", name: "Very Strong", description: "Many frightened, heavy objects move" },
        { level: "VII", name: "Destructive", description: "Cracks in walls, chimneys damaged" },
        { level: "VIII", name: "Very Destructive", description: "Serious damage to buildings" },
        { level: "IX", name: "Devastating", description: "Buildings collapse" },
        { level: "X", name: "Completely Devastating", description: "Massive destruction" },
      ],
    },
  },

  depthMatters: {
    title: "Earthquake Depth: Why It Matters",
    content: `The depth of an earthquake significantly affects how strongly it's felt at the surface. Shallow earthquakes typically cause more damage than deep ones of the same magnitude.`,
    categories: [
      { 
        name: "Shallow", 
        depth: "0-70 km", 
        effects: "Most destructive. Seismic waves travel short distance to surface.",
        philippineExamples: "Most Philippine Fault Zone earthquakes"
      },
      { 
        name: "Intermediate", 
        depth: "70-300 km", 
        effects: "Felt over wider area but less intense at any single point.",
        philippineExamples: "Some Philippine Trench events"
      },
      { 
        name: "Deep", 
        depth: "300-700 km", 
        effects: "Rarely cause surface damage but felt over very large areas.",
        philippineExamples: "Deep events in Mindanao-Celebes region"
      },
    ],
  },
};

// ============================================================================
// COMPREHENSIVE EMERGENCY KIT CHECKLIST
// ============================================================================
export const EMERGENCY_KIT = {
  title: "72-Hour Emergency Kit Checklist",
  description: "This kit should sustain you and your family for at least 72 hours after a disaster",
  
  categories: [
    {
      name: "Water & Food",
      icon: "💧",
      items: [
        { item: "Water", quantity: "1 gallon per person per day", essential: true, notes: "Minimum 3-day supply" },
        { item: "Non-perishable food", quantity: "3-day supply per person", essential: true, notes: "Canned goods, dried food, energy bars" },
        { item: "Manual can opener", quantity: "1", essential: true, notes: "Don't rely on electric openers" },
        { item: "Disposable plates/utensils", quantity: "1 set per person", essential: false, notes: "Conserves water" },
        { item: "Water purification tablets", quantity: "1 pack", essential: false, notes: "Backup water treatment" },
      ],
    },
    {
      name: "First Aid & Medical",
      icon: "🏥",
      items: [
        { item: "First aid kit", quantity: "1 comprehensive kit", essential: true, notes: "Bandages, antiseptic, gauze, tape" },
        { item: "Prescription medications", quantity: "7-day supply", essential: true, notes: "Keep updated regularly" },
        { item: "Dust masks (N95)", quantity: "2 per person", essential: true, notes: "Protection from debris" },
        { item: "Hand sanitizer", quantity: "2 bottles", essential: true, notes: "When water unavailable" },
        { item: "Prescription glasses/contacts", quantity: "Extra pair", essential: true, notes: "If applicable" },
        { item: "Over-the-counter meds", quantity: "Pain relievers, antacids", essential: false, notes: "Basic medications" },
        { item: "Sunscreen", quantity: "1 bottle", essential: false, notes: "SPF 30 or higher" },
        { item: "Insect repellent", quantity: "1 bottle", essential: false, notes: "Prevents disease from mosquitoes" },
      ],
    },
    {
      name: "Tools & Safety",
      icon: "🔧",
      items: [
        { item: "Flashlight", quantity: "1 per person", essential: true, notes: "LED preferred for battery life" },
        { item: "Extra batteries", quantity: "Multiple sets", essential: true, notes: "Match your devices" },
        { item: "Portable radio", quantity: "1 battery/crank powered", essential: true, notes: "For emergency broadcasts" },
        { item: "Whistle", quantity: "1 per person", essential: true, notes: "Signal for help" },
        { item: "Multi-tool or wrench", quantity: "1", essential: true, notes: "Turn off utilities" },
        { item: "Local maps", quantity: "1 set", essential: true, notes: "Don't rely on phone GPS" },
        { item: "Duct tape", quantity: "1 roll", essential: false, notes: "Multiple emergency uses" },
        { item: "Plastic sheeting", quantity: "1 roll", essential: false, notes: "Temporary shelter/waterproofing" },
        { item: "Fire extinguisher", quantity: "1 small", essential: false, notes: "Type ABC recommended" },
      ],
    },
    {
      name: "Communication",
      icon: "📱",
      items: [
        { item: "Cell phone with charger", quantity: "1 per adult", essential: true, notes: "Keep charged" },
        { item: "Portable power bank", quantity: "1-2", essential: true, notes: "10,000+ mAh recommended" },
        { item: "Emergency contact list", quantity: "Written copies", essential: true, notes: "Don't rely on phone" },
        { item: "Family meeting point plan", quantity: "Written document", essential: true, notes: "Agreed locations" },
        { item: "Out-of-area contact", quantity: "Designated person", essential: true, notes: "Someone outside disaster zone" },
      ],
    },
    {
      name: "Important Documents",
      icon: "📄",
      items: [
        { item: "ID copies", quantity: "All family members", essential: true, notes: "Waterproof container" },
        { item: "Insurance documents", quantity: "Copies", essential: true, notes: "Home, health, vehicle" },
        { item: "Bank information", quantity: "Account numbers", essential: true, notes: "Secure storage" },
        { item: "Medical records", quantity: "Copies", essential: true, notes: "Allergies, conditions, medications" },
        { item: "Property documents", quantity: "Copies", essential: false, notes: "Land titles, deeds" },
        { item: "Cash", quantity: "₱5,000-10,000", essential: true, notes: "Small bills, ATMs may not work" },
      ],
    },
    {
      name: "Clothing & Shelter",
      icon: "🧥",
      items: [
        { item: "Change of clothes", quantity: "1 per person", essential: true, notes: "Weather-appropriate" },
        { item: "Sturdy shoes", quantity: "1 pair per person", essential: true, notes: "For walking through debris" },
        { item: "Rain gear", quantity: "1 per person", essential: true, notes: "Poncho or jacket" },
        { item: "Blankets/sleeping bags", quantity: "1 per person", essential: true, notes: "Emergency warmth" },
        { item: "Tent/tarp", quantity: "1", essential: false, notes: "Emergency shelter" },
      ],
    },
    {
      name: "Sanitation",
      icon: "🧴",
      items: [
        { item: "Toilet paper", quantity: "1 roll per person", essential: true, notes: "Basic sanitation" },
        { item: "Garbage bags", quantity: "10-20 bags", essential: true, notes: "Waste disposal" },
        { item: "Personal hygiene items", quantity: "Travel sizes", essential: true, notes: "Toothbrush, soap, feminine supplies" },
        { item: "Disinfecting wipes", quantity: "2 containers", essential: true, notes: "Cleaning surfaces" },
        { item: "Portable toilet supplies", quantity: "Basic kit", essential: false, notes: "If utilities unavailable" },
      ],
    },
    {
      name: "Special Needs",
      icon: "👶",
      items: [
        { item: "Baby formula/food", quantity: "1-week supply", essential: true, notes: "If applicable" },
        { item: "Diapers", quantity: "1-week supply", essential: true, notes: "If applicable" },
        { item: "Pet food/supplies", quantity: "1-week supply", essential: true, notes: "If applicable" },
        { item: "Special medical equipment", quantity: "As needed", essential: true, notes: "If applicable" },
        { item: "Games/activities", quantity: "Few items", essential: false, notes: "For children's stress relief" },
      ],
    },
  ],
};

// ============================================================================
// COMPREHENSIVE DURING/AFTER EARTHQUAKE GUIDE
// ============================================================================
export const EARTHQUAKE_RESPONSE = {
  during: {
    indoors: {
      title: "If You're INDOORS",
      steps: [
        { action: "DROP", description: "Get down on your hands and knees. This position protects you from being knocked down and allows you to still move if needed.", icon: "⬇️" },
        { action: "COVER", description: "Take cover under a sturdy desk or table. Cover your head and neck with your arms. If no table is nearby, get against an interior wall and protect your head and neck.", icon: "🛡️" },
        { action: "HOLD ON", description: "If under shelter, hold on with one hand and be ready to move with it until the shaking stops. If not under shelter, cover your head and neck with both arms.", icon: "✊" },
      ],
      doNots: [
        "DO NOT run outside during shaking - falling debris is the biggest danger",
        "DO NOT stand in doorways - this is a myth and doorways offer no special protection",
        "DO NOT use elevators - you could be trapped if power fails",
        "DO NOT light matches or candles - there could be gas leaks",
        "DO NOT use the phone except for emergencies - keep lines clear for rescue",
      ],
      locationSpecific: [
        { location: "In bed", action: "Stay there. Protect your head with a pillow. Only move if there's heavy light fixture above." },
        { location: "In kitchen", action: "Move away from refrigerator, stove, and overhead cabinets immediately." },
        { location: "In wheelchair", action: "Lock wheels, remain seated, and cover your head and neck with your arms." },
        { location: "In high-rise building", action: "Expect sprinklers and alarms. Stay away from windows. Do not evacuate until shaking stops." },
      ],
    },
    outdoors: {
      title: "If You're OUTDOORS",
      steps: [
        { action: "MOVE TO OPEN AREA", description: "If possible, move to an open area away from buildings, trees, streetlights, and utility wires.", icon: "🏃" },
        { action: "DROP AND COVER", description: "Drop to the ground and cover your head and neck with your arms.", icon: "⬇️" },
        { action: "STAY AWAY FROM BUILDINGS", description: "The danger zone is directly outside buildings where falling debris is most likely.", icon: "🏢" },
      ],
      doNots: [
        "DO NOT run into buildings - they may collapse or have falling debris",
        "DO NOT stand near buildings, walls, or fences",
        "DO NOT touch downed power lines",
      ],
    },
    driving: {
      title: "If You're DRIVING",
      steps: [
        { action: "PULL OVER SAFELY", description: "Slow down and pull to the side of the road, away from bridges, overpasses, buildings, trees, and power lines.", icon: "🚗" },
        { action: "STAY IN VEHICLE", description: "Your car will protect you from falling debris. Stay inside with your seatbelt on until shaking stops.", icon: "🛡️" },
        { action: "PROCEED CAREFULLY AFTER", description: "After shaking stops, proceed carefully watching for road damage, fallen debris, and downed wires.", icon: "⚠️" },
      ],
      doNots: [
        "DO NOT stop on or under bridges or overpasses",
        "DO NOT stop under trees, light posts, or signs",
        "DO NOT get out of your car if wires fall on it",
      ],
    },
    nearCoast: {
      title: "If You're NEAR THE COAST",
      steps: [
        { action: "PROTECT YOURSELF FIRST", description: "Drop, cover, and hold on until shaking stops.", icon: "⬇️" },
        { action: "MOVE TO HIGH GROUND IMMEDIATELY", description: "After shaking stops, if you're in a tsunami zone, move inland or to higher ground immediately.", icon: "⛰️" },
        { action: "STAY AWAY FROM BEACH", description: "Do not return to the coast until authorities give the all-clear. Tsunamis can come in multiple waves.", icon: "🌊" },
      ],
      tsunamiWarning: "If the shaking lasts MORE than 20 seconds, or you see the ocean receding unusually, MOVE TO HIGH GROUND IMMEDIATELY without waiting for official warning.",
    },
  },
  
  after: {
    immediate: {
      title: "Immediately After Shaking Stops",
      steps: [
        { action: "Check yourself for injuries", priority: 1, description: "You can help others only if you're okay. Check for cuts, bruises, or trapped limbs." },
        { action: "Check others nearby", priority: 2, description: "Help injured people if you can do so safely. Do not move seriously injured people unless they're in immediate danger." },
        { action: "Get out if building is damaged", priority: 3, description: "If the building shows significant damage, evacuate carefully. Use stairs, never elevators." },
        { action: "Watch for hazards", priority: 4, description: "Look out for broken glass, downed power lines, gas leaks, and unstable structures." },
        { action: "Check for gas leaks", priority: 5, description: "If you smell gas or hear hissing, open a window, leave immediately, and call the gas company from outside." },
      ],
    },
    firstHours: {
      title: "First Few Hours",
      steps: [
        { action: "Account for family members", priority: 1, description: "Use your family meeting point plan. Send one text message then limit phone use." },
        { action: "Listen to emergency broadcasts", priority: 2, description: "Use your battery-powered radio to get official information and instructions." },
        { action: "Document damage", priority: 3, description: "Take photos of any damage for insurance purposes before cleaning up." },
        { action: "Expect aftershocks", priority: 4, description: "Aftershocks can occur minutes to months after the main quake. Be ready to Drop, Cover, Hold On again." },
        { action: "Help neighbors if safe", priority: 5, description: "Check on elderly, disabled, or trapped neighbors if you can do so safely." },
      ],
    },
    returning: {
      title: "Before Returning Home",
      checks: [
        { item: "Building exterior", signs: "Cracks in walls, shifted foundation, broken chimney, sagging roof" },
        { item: "Utilities", signs: "Gas smell, sparks, frayed wires, broken pipes" },
        { item: "Entry points", signs: "Can doors/windows open? Is the structure sound?" },
        { item: "Inside carefully", signs: "Check ceilings for damage, look for fallen objects, check for glass" },
      ],
      warning: "If you see significant structural damage, DO NOT ENTER. Contact local authorities or a structural engineer.",
    },
  },
};

// ============================================================================
// BUILDING SAFETY INFORMATION
// ============================================================================
export const BUILDING_SAFETY = {
  title: "Building Safety Assessment",
  safeSpots: {
    title: "Safest Spots in a Building",
    good: [
      "Under a sturdy desk or table",
      "Against an interior wall, away from windows",
      "In a corner, away from heavy furniture that could fall",
      "Under a strong doorframe ONLY if it's constructed with solid wood (rare in modern buildings)",
    ],
    avoid: [
      "Near windows, mirrors, or glass",
      "Near heavy hanging objects or ceiling fixtures",
      "Near tall furniture that could topple (bookcases, cabinets)",
      "In doorways (modern frames are not stronger than walls)",
      "Near fireplaces or chimneys",
      "Elevators and escalators",
    ],
  },
  buildingTypes: {
    title: "Building Type Risk Assessment",
    types: [
      {
        type: "Reinforced Concrete",
        risk: "LOW",
        notes: "Best earthquake resistance if properly designed. Look for buildings built after 1992 when Philippine building codes improved.",
      },
      {
        type: "Steel Frame",
        risk: "LOW-MODERATE",
        notes: "Generally good performance. Flexibility allows building to sway rather than crack.",
      },
      {
        type: "Wood Frame",
        risk: "MODERATE",
        notes: "Lightweight and flexible, performs reasonably well. Watch for poor connections and rot.",
      },
      {
        type: "Unreinforced Masonry (Hollow Blocks)",
        risk: "HIGH",
        notes: "Common in Philippines. Very vulnerable to shaking. Look for cracks in walls.",
      },
      {
        type: "Adobe/Brick",
        risk: "VERY HIGH",
        notes: "Extremely vulnerable to earthquake damage. Prone to complete collapse.",
      },
      {
        type: "Mixed/Informal Construction",
        risk: "VERY HIGH",
        notes: "Common in informal settlements. Inconsistent quality makes performance unpredictable.",
      },
    ],
  },
  retrofitting: {
    title: "Strengthening Your Home",
    tips: [
      "Secure tall furniture and appliances to walls using L-brackets or straps",
      "Use safety latches on cabinet doors",
      "Hang heavy pictures away from beds and seating areas using closed hooks",
      "Store heavy items on lower shelves",
      "Replace glass near doors with tempered or safety glass",
      "Know how to turn off gas, electricity, and water",
      "Have emergency supplies easily accessible near exits",
    ],
  },
};

// ============================================================================
// HISTORICAL EARTHQUAKES - Philippines
// ============================================================================
export const HISTORICAL_EARTHQUAKES = [
  {
    date: "1990-07-16",
    magnitude: 7.8,
    location: "Luzon (Baguio City)",
    casualties: 1621,
    damage: "Over 3,000 buildings destroyed in Baguio. Hyatt Terraces Hotel collapsed.",
    tsunamiGenerated: false,
    faultInvolved: "Philippine Fault Zone (Digdig Fault)",
    lessons: "Led to improved building codes in the Philippines. Highlighted liquefaction hazards.",
  },
  {
    date: "2013-10-15",
    magnitude: 7.2,
    location: "Bohol",
    casualties: 222,
    damage: "Historic churches destroyed. 73,000 structures damaged. ₱2.25 billion in damages.",
    tsunamiGenerated: false,
    faultInvolved: "Bohol Fault (previously unmapped)",
    lessons: "Revealed previously unknown active faults. Heritage structures especially vulnerable.",
  },
  {
    date: "2019-04-22",
    magnitude: 6.1,
    location: "Pampanga",
    casualties: 18,
    damage: "Chuzon Supermarket in Porac collapsed. Significant damage in Central Luzon.",
    tsunamiGenerated: false,
    faultInvolved: "Central Luzon Fault System",
    lessons: "Building code compliance critical. Older structures remain at risk.",
  },
  {
    date: "2019-10-29",
    magnitude: 6.6,
    location: "Cotabato",
    casualties: 13,
    damage: "Part of Mindanao earthquake sequence. Several buildings collapsed.",
    tsunamiGenerated: false,
    faultInvolved: "Cotabato Trench System",
    lessons: "Earthquake sequences can include multiple damaging events.",
  },
  {
    date: "2012-02-06",
    magnitude: 6.7,
    location: "Negros Oriental",
    casualties: 113,
    damage: "Massive landslides in Guihulngan. La Libertad town devastated.",
    tsunamiGenerated: true,
    faultInvolved: "Negros Oriental Fault",
    lessons: "Secondary hazards (landslides) can be more deadly than shaking.",
  },
  {
    date: "1976-08-16",
    magnitude: 7.9,
    location: "Moro Gulf",
    casualties: 8000,
    damage: "Deadliest Philippine earthquake. Massive tsunami destroyed coastal communities.",
    tsunamiGenerated: true,
    faultInvolved: "Cotabato Trench",
    lessons: "Tsunamis from local earthquakes can arrive within minutes. Immediate evacuation essential.",
  },
  {
    date: "1968-08-02",
    magnitude: 7.3,
    location: "Casiguran, Aurora",
    casualties: 270,
    damage: "Ruby Tower in Manila collapsed (6-story building). Felt across Luzon.",
    tsunamiGenerated: false,
    faultInvolved: "Casiguran Fault",
    lessons: "Distant earthquakes can cause damage in Metro Manila. Building quality matters.",
  },
];

// ============================================================================
// AFTERSHOCK INFORMATION
// ============================================================================
export const AFTERSHOCK_INFO = {
  title: "Understanding Aftershocks",
  definition: "Aftershocks are smaller earthquakes that occur in the same general area after a larger earthquake (mainshock). They're caused by the crust adjusting to changes from the mainshock.",
  keyFacts: [
    "Aftershocks can continue for weeks, months, or even years",
    "The largest aftershock is typically 1-1.2 magnitude units smaller than the mainshock",
    "Aftershocks decrease in frequency over time but can still be dangerous",
    "A strong aftershock can sometimes be stronger than the original mainshock (reclassified)",
  ],
  bathLaw: {
    title: "Båth's Law",
    description: "The largest aftershock is typically about 1.2 magnitude units smaller than the mainshock.",
    example: "After a M7.0 earthquake, expect the largest aftershock to be around M5.8.",
  },
  omorisLaw: {
    title: "Omori's Law",
    description: "Aftershock frequency decays over time following a predictable pattern: rate = K/(t+c)^p",
    simplified: "Aftershocks are most frequent immediately after the mainshock and become less frequent as time passes.",
  },
  safety: [
    "Be prepared for aftershocks - they can collapse already-weakened structures",
    "Do not re-enter damaged buildings between aftershocks",
    "Keep your emergency kit accessible",
    "Stay away from damaged areas",
    "Each strong aftershock is a chance to practice Drop, Cover, Hold On",
  ],
};

// ============================================================================
// TSUNAMI INFORMATION
// ============================================================================
export const TSUNAMI_INFO = {
  title: "Tsunami Safety for the Philippines",
  definition: "A tsunami is a series of ocean waves caused by large-scale disturbances of the ocean floor, usually earthquakes. The Philippines is at risk from both local and distant tsunamis.",
  naturalWarnings: [
    "Strong earthquake shaking lasting more than 20 seconds near the coast",
    "Unusual ocean behavior - rapid rise or fall of water level",
    "Ocean receding far from shore (exposing sea floor)",
    "Loud roaring sound from the ocean",
  ],
  immediateActions: [
    "If you experience strong shaking near the coast, move to high ground IMMEDIATELY",
    "Do not wait for official warning - you may only have minutes",
    "Go as high and as far inland as possible",
    "If you cannot escape inland, go to the upper floor (3rd or higher) of a reinforced concrete building",
    "Stay away from the coast until authorities give the all-clear",
  ],
  philippineHighRiskAreas: [
    "Eastern coastline facing Philippine Trench",
    "Western Luzon facing Manila Trench",
    "Southern Mindanao facing Cotabato Trench",
    "Low-lying coastal barangays",
    "Areas with no natural high ground nearby",
  ],
  waves: {
    title: "Understanding Tsunami Waves",
    facts: [
      "Tsunamis come in multiple waves - the first is often not the largest",
      "Waves can arrive minutes apart or up to an hour apart",
      "A tsunami can continue for many hours",
      "Each wave can last 10-30 minutes with dangerous currents between waves",
      "The ocean may look deceptively calm between waves",
    ],
  },
};

// ============================================================================
// LIQUEFACTION INFORMATION
// ============================================================================
export const LIQUEFACTION_INFO = {
  title: "Understanding Liquefaction",
  definition: "Liquefaction occurs when saturated soil loses strength during earthquake shaking and behaves like a liquid. This can cause buildings to sink, tilt, or collapse.",
  riskFactors: [
    "Loose, sandy soil",
    "High water table (groundwater close to surface)",
    "Reclaimed land or filled areas",
    "Coastal and riverside areas",
    "Areas with history of liquefaction",
  ],
  philippineHighRiskAreas: [
    "Manila Bay reclaimed areas (Pasay, Parañaque, Manila)",
    "Coastal areas of Metro Manila",
    "Areas near Pasig River",
    "Laguna Lake shoreline",
    "Coastal cities on loose alluvial soil",
  ],
  signs: [
    "Sand or water bubbling up from the ground (sand boils)",
    "Ground cracking and settling",
    "Buildings tilting or sinking",
    "Pavement buckling",
    "Utility pipes breaking",
  ],
  protection: [
    "Know if your area is in a liquefaction zone (check PHIVOLCS hazard maps)",
    "Buildings on deep foundations are more resistant",
    "Consider soil improvement if building in risk areas",
    "Have an evacuation plan for liquefaction-prone areas",
  ],
};
