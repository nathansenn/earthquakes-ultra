// Comprehensive Philippine Cities Database
// All 146 cities + major municipalities organized by region

export interface City {
  name: string;
  slug: string;
  region: string;
  regionCode: string;
  province: string;
  latitude: number;
  longitude: number;
  population: number;
  isCapital?: boolean;
  isHCC?: boolean; // Highly Urbanized City
}

export const philippineCities: City[] = [
  // NCR - National Capital Region
  { name: "Manila", slug: "manila", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.5995, longitude: 120.9842, population: 1846513, isCapital: true, isHCC: true },
  { name: "Quezon City", slug: "quezon-city", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.6760, longitude: 121.0437, population: 2960048, isHCC: true },
  { name: "Makati", slug: "makati", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.5547, longitude: 121.0244, population: 629616, isHCC: true },
  { name: "Pasig", slug: "pasig", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.5764, longitude: 121.0851, population: 803159, isHCC: true },
  { name: "Taguig", slug: "taguig", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.5176, longitude: 121.0509, population: 886722, isHCC: true },
  { name: "Pasay", slug: "pasay", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.5378, longitude: 121.0014, population: 440656, isHCC: true },
  { name: "Parañaque", slug: "paranaque", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.4793, longitude: 121.0198, population: 689992, isHCC: true },
  { name: "Las Piñas", slug: "las-pinas", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.4445, longitude: 120.9939, population: 606293, isHCC: true },
  { name: "Muntinlupa", slug: "muntinlupa", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.4081, longitude: 121.0415, population: 543445, isHCC: true },
  { name: "Marikina", slug: "marikina", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.6507, longitude: 121.1029, population: 456059, isHCC: true },
  { name: "Mandaluyong", slug: "mandaluyong", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.5794, longitude: 121.0359, population: 425758, isHCC: true },
  { name: "San Juan", slug: "san-juan-metro-manila", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.6019, longitude: 121.0355, population: 126347, isHCC: true },
  { name: "Valenzuela", slug: "valenzuela", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.7011, longitude: 120.9830, population: 714978, isHCC: true },
  { name: "Navotas", slug: "navotas", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.6667, longitude: 120.9417, population: 249463, isHCC: true },
  { name: "Malabon", slug: "malabon", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.6625, longitude: 120.9567, population: 380522, isHCC: true },
  { name: "Caloocan", slug: "caloocan", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.6488, longitude: 120.9839, population: 1661584, isHCC: true },
  { name: "Pateros", slug: "pateros", region: "National Capital Region", regionCode: "NCR", province: "Metro Manila", latitude: 14.5446, longitude: 121.0686, population: 63840 },

  // Region I - Ilocos Region
  { name: "Laoag", slug: "laoag", region: "Ilocos Region", regionCode: "I", province: "Ilocos Norte", latitude: 18.1980, longitude: 120.5940, population: 111651 },
  { name: "Batac", slug: "batac", region: "Ilocos Region", regionCode: "I", province: "Ilocos Norte", latitude: 18.0551, longitude: 120.5649, population: 55201 },
  { name: "Vigan", slug: "vigan", region: "Ilocos Region", regionCode: "I", province: "Ilocos Sur", latitude: 17.5747, longitude: 120.3869, population: 53879 },
  { name: "Candon", slug: "candon", region: "Ilocos Region", regionCode: "I", province: "Ilocos Sur", latitude: 17.1943, longitude: 120.4467, population: 58729 },
  { name: "San Fernando", slug: "san-fernando-la-union", region: "Ilocos Region", regionCode: "I", province: "La Union", latitude: 16.6159, longitude: 120.3173, population: 132842 },
  { name: "Dagupan", slug: "dagupan", region: "Ilocos Region", regionCode: "I", province: "Pangasinan", latitude: 16.0433, longitude: 120.3336, population: 174302, isHCC: true },
  { name: "San Carlos", slug: "san-carlos-pangasinan", region: "Ilocos Region", regionCode: "I", province: "Pangasinan", latitude: 15.9256, longitude: 120.3467, population: 196004 },
  { name: "Urdaneta", slug: "urdaneta", region: "Ilocos Region", regionCode: "I", province: "Pangasinan", latitude: 15.9761, longitude: 120.5711, population: 144577 },
  { name: "Alaminos", slug: "alaminos-pangasinan", region: "Ilocos Region", regionCode: "I", province: "Pangasinan", latitude: 16.1551, longitude: 119.9807, population: 89708 },

  // Region II - Cagayan Valley
  { name: "Tuguegarao", slug: "tuguegarao", region: "Cagayan Valley", regionCode: "II", province: "Cagayan", latitude: 17.6132, longitude: 121.7270, population: 166334 },
  { name: "Cauayan", slug: "cauayan", region: "Cagayan Valley", regionCode: "II", province: "Isabela", latitude: 16.9319, longitude: 121.7731, population: 137386 },
  { name: "Ilagan", slug: "ilagan", region: "Cagayan Valley", regionCode: "II", province: "Isabela", latitude: 17.1485, longitude: 121.8890, population: 156210 },
  { name: "Santiago", slug: "santiago-isabela", region: "Cagayan Valley", regionCode: "II", province: "Isabela", latitude: 16.6891, longitude: 121.5487, population: 134830, isHCC: true },

  // Region III - Central Luzon
  { name: "Balanga", slug: "balanga", region: "Central Luzon", regionCode: "III", province: "Bataan", latitude: 14.6764, longitude: 120.5367, population: 96061 },
  { name: "Malolos", slug: "malolos", region: "Central Luzon", regionCode: "III", province: "Bulacan", latitude: 14.8433, longitude: 120.8114, population: 252074 },
  { name: "Meycauayan", slug: "meycauayan", region: "Central Luzon", regionCode: "III", province: "Bulacan", latitude: 14.7372, longitude: 120.9608, population: 260143 },
  { name: "San Jose del Monte", slug: "san-jose-del-monte", region: "Central Luzon", regionCode: "III", province: "Bulacan", latitude: 14.8139, longitude: 121.0453, population: 651813 },
  { name: "Cabanatuan", slug: "cabanatuan", region: "Central Luzon", regionCode: "III", province: "Nueva Ecija", latitude: 15.4866, longitude: 120.9676, population: 302231 },
  { name: "Gapan", slug: "gapan", region: "Central Luzon", regionCode: "III", province: "Nueva Ecija", latitude: 15.3067, longitude: 120.9467, population: 118836 },
  { name: "Muñoz", slug: "munoz", region: "Central Luzon", regionCode: "III", province: "Nueva Ecija", latitude: 15.7167, longitude: 120.9000, population: 62073 },
  { name: "Palayan", slug: "palayan", region: "Central Luzon", regionCode: "III", province: "Nueva Ecija", latitude: 15.5333, longitude: 121.0833, population: 47544 },
  { name: "San Jose", slug: "san-jose-nueva-ecija", region: "Central Luzon", regionCode: "III", province: "Nueva Ecija", latitude: 15.7833, longitude: 121.0000, population: 141170 },
  { name: "San Fernando", slug: "san-fernando-pampanga", region: "Central Luzon", regionCode: "III", province: "Pampanga", latitude: 15.0287, longitude: 120.6870, population: 340622 },
  { name: "Angeles", slug: "angeles", region: "Central Luzon", regionCode: "III", province: "Pampanga", latitude: 15.1450, longitude: 120.5887, population: 462831, isHCC: true },
  { name: "Mabalacat", slug: "mabalacat", region: "Central Luzon", regionCode: "III", province: "Pampanga", latitude: 15.2167, longitude: 120.5667, population: 250799 },
  { name: "Tarlac City", slug: "tarlac-city", region: "Central Luzon", regionCode: "III", province: "Tarlac", latitude: 15.4863, longitude: 120.5900, population: 352852 },
  { name: "Olongapo", slug: "olongapo", region: "Central Luzon", regionCode: "III", province: "Zambales", latitude: 14.8292, longitude: 120.2828, population: 260317, isHCC: true },

  // Region IV-A - CALABARZON
  { name: "Batangas City", slug: "batangas-city", region: "CALABARZON", regionCode: "IV-A", province: "Batangas", latitude: 13.7565, longitude: 121.0583, population: 351437 },
  { name: "Lipa", slug: "lipa", region: "CALABARZON", regionCode: "IV-A", province: "Batangas", latitude: 13.9411, longitude: 121.1625, population: 372931 },
  { name: "Tanauan", slug: "tanauan-batangas", region: "CALABARZON", regionCode: "IV-A", province: "Batangas", latitude: 14.0833, longitude: 121.1500, population: 193936 },
  { name: "Santo Tomas", slug: "santo-tomas-batangas", region: "CALABARZON", regionCode: "IV-A", province: "Batangas", latitude: 14.1053, longitude: 121.1414, population: 218500 },
  { name: "Cavite City", slug: "cavite-city", region: "CALABARZON", regionCode: "IV-A", province: "Cavite", latitude: 14.4833, longitude: 120.9000, population: 102806 },
  { name: "Tagaytay", slug: "tagaytay", region: "CALABARZON", regionCode: "IV-A", province: "Cavite", latitude: 14.1000, longitude: 120.9333, population: 85330 },
  { name: "Trece Martires", slug: "trece-martires", region: "CALABARZON", regionCode: "IV-A", province: "Cavite", latitude: 14.2833, longitude: 120.8667, population: 172367 },
  { name: "Dasmariñas", slug: "dasmarinas", region: "CALABARZON", regionCode: "IV-A", province: "Cavite", latitude: 14.3294, longitude: 120.9367, population: 703141 },
  { name: "Imus", slug: "imus", region: "CALABARZON", regionCode: "IV-A", province: "Cavite", latitude: 14.4297, longitude: 120.9367, population: 496794 },
  { name: "Bacoor", slug: "bacoor", region: "CALABARZON", regionCode: "IV-A", province: "Cavite", latitude: 14.4624, longitude: 120.9645, population: 664625 },
  { name: "General Trias", slug: "general-trias", region: "CALABARZON", regionCode: "IV-A", province: "Cavite", latitude: 14.3833, longitude: 120.8833, population: 450583 },
  { name: "Biñan", slug: "binan", region: "CALABARZON", regionCode: "IV-A", province: "Laguna", latitude: 14.3333, longitude: 121.0833, population: 407437 },
  { name: "Cabuyao", slug: "cabuyao", region: "CALABARZON", regionCode: "IV-A", province: "Laguna", latitude: 14.2667, longitude: 121.1167, population: 355330 },
  { name: "Calamba", slug: "calamba", region: "CALABARZON", regionCode: "IV-A", province: "Laguna", latitude: 14.2117, longitude: 121.1653, population: 539671 },
  { name: "San Pablo", slug: "san-pablo-laguna", region: "CALABARZON", regionCode: "IV-A", province: "Laguna", latitude: 14.0686, longitude: 121.3256, population: 285348 },
  { name: "San Pedro", slug: "san-pedro-laguna", region: "CALABARZON", regionCode: "IV-A", province: "Laguna", latitude: 14.3500, longitude: 121.0500, population: 326001 },
  { name: "Santa Rosa", slug: "santa-rosa-laguna", region: "CALABARZON", regionCode: "IV-A", province: "Laguna", latitude: 14.3167, longitude: 121.1167, population: 414812 },
  { name: "Lucena", slug: "lucena", region: "CALABARZON", regionCode: "IV-A", province: "Quezon", latitude: 13.9333, longitude: 121.6167, population: 275968, isHCC: true },
  { name: "Tayabas", slug: "tayabas", region: "CALABARZON", regionCode: "IV-A", province: "Quezon", latitude: 14.0167, longitude: 121.5833, population: 103727 },
  { name: "Antipolo", slug: "antipolo", region: "CALABARZON", regionCode: "IV-A", province: "Rizal", latitude: 14.6256, longitude: 121.1761, population: 887399 },

  // Region IV-B - MIMAROPA
  { name: "Calapan", slug: "calapan", region: "MIMAROPA", regionCode: "IV-B", province: "Oriental Mindoro", latitude: 13.4117, longitude: 121.1803, population: 133893 },
  { name: "Puerto Princesa", slug: "puerto-princesa", region: "MIMAROPA", regionCode: "IV-B", province: "Palawan", latitude: 9.7489, longitude: 118.7553, population: 307079, isHCC: true },

  // Region V - Bicol Region
  { name: "Legazpi", slug: "legazpi", region: "Bicol Region", regionCode: "V", province: "Albay", latitude: 13.1391, longitude: 123.7438, population: 210206 },
  { name: "Ligao", slug: "ligao", region: "Bicol Region", regionCode: "V", province: "Albay", latitude: 13.2167, longitude: 123.5167, population: 117973 },
  { name: "Tabaco", slug: "tabaco", region: "Bicol Region", regionCode: "V", province: "Albay", latitude: 13.3583, longitude: 123.7353, population: 136280 },
  { name: "Iriga", slug: "iriga", region: "Bicol Region", regionCode: "V", province: "Camarines Sur", latitude: 13.4228, longitude: 123.4122, population: 111757 },
  { name: "Naga", slug: "naga-camarines-sur", region: "Bicol Region", regionCode: "V", province: "Camarines Sur", latitude: 13.6192, longitude: 123.1814, population: 215954 },
  { name: "Masbate City", slug: "masbate-city", region: "Bicol Region", regionCode: "V", province: "Masbate", latitude: 12.3667, longitude: 123.6167, population: 95389 },
  { name: "Sorsogon City", slug: "sorsogon-city", region: "Bicol Region", regionCode: "V", province: "Sorsogon", latitude: 12.9742, longitude: 124.0047, population: 180000 },

  // Region VI - Western Visayas
  { name: "Roxas", slug: "roxas-city", region: "Western Visayas", regionCode: "VI", province: "Capiz", latitude: 11.5850, longitude: 122.7511, population: 179292 },
  { name: "Iloilo City", slug: "iloilo-city", region: "Western Visayas", regionCode: "VI", province: "Iloilo", latitude: 10.7202, longitude: 122.5621, population: 457626, isHCC: true },
  { name: "Passi", slug: "passi", region: "Western Visayas", regionCode: "VI", province: "Iloilo", latitude: 11.1000, longitude: 122.6333, population: 80544 },
  { name: "Bacolod", slug: "bacolod", region: "Western Visayas", regionCode: "VI", province: "Negros Occidental", latitude: 10.6765, longitude: 122.9509, population: 600783, isHCC: true },
  { name: "Bago", slug: "bago", region: "Western Visayas", regionCode: "VI", province: "Negros Occidental", latitude: 10.5333, longitude: 122.8333, population: 182459 },
  { name: "Cadiz", slug: "cadiz", region: "Western Visayas", regionCode: "VI", province: "Negros Occidental", latitude: 10.9500, longitude: 123.3000, population: 166818 },
  { name: "Escalante", slug: "escalante", region: "Western Visayas", regionCode: "VI", province: "Negros Occidental", latitude: 10.8333, longitude: 123.5000, population: 97843 },
  { name: "Himamaylan", slug: "himamaylan", region: "Western Visayas", regionCode: "VI", province: "Negros Occidental", latitude: 10.1000, longitude: 122.8667, population: 109671 },
  { name: "Kabankalan", slug: "kabankalan", region: "Western Visayas", regionCode: "VI", province: "Negros Occidental", latitude: 9.9833, longitude: 122.8167, population: 186323 },
  { name: "La Carlota", slug: "la-carlota", region: "Western Visayas", regionCode: "VI", province: "Negros Occidental", latitude: 10.4167, longitude: 122.9167, population: 67180 },
  { name: "Sagay", slug: "sagay", region: "Western Visayas", regionCode: "VI", province: "Negros Occidental", latitude: 10.9000, longitude: 123.4167, population: 153606 },
  { name: "San Carlos", slug: "san-carlos-negros-occidental", region: "Western Visayas", regionCode: "VI", province: "Negros Occidental", latitude: 10.4833, longitude: 123.4167, population: 133000 },
  { name: "Silay", slug: "silay", region: "Western Visayas", regionCode: "VI", province: "Negros Occidental", latitude: 10.8000, longitude: 122.9667, population: 133040 },
  { name: "Sipalay", slug: "sipalay", region: "Western Visayas", regionCode: "VI", province: "Negros Occidental", latitude: 9.7500, longitude: 122.4000, population: 71033 },
  { name: "Talisay", slug: "talisay-negros-occidental", region: "Western Visayas", regionCode: "VI", province: "Negros Occidental", latitude: 10.7333, longitude: 122.9667, population: 126919 },
  { name: "Victorias", slug: "victorias", region: "Western Visayas", regionCode: "VI", province: "Negros Occidental", latitude: 10.9000, longitude: 123.0833, population: 94879 },

  // Region VII - Central Visayas
  { name: "Tagbilaran", slug: "tagbilaran", region: "Central Visayas", regionCode: "VII", province: "Bohol", latitude: 9.6500, longitude: 123.8500, population: 105051 },
  { name: "Bogo", slug: "bogo", region: "Central Visayas", regionCode: "VII", province: "Cebu", latitude: 11.0500, longitude: 124.0000, population: 86000 },
  { name: "Carcar", slug: "carcar", region: "Central Visayas", regionCode: "VII", province: "Cebu", latitude: 10.1000, longitude: 123.6333, population: 128900 },
  { name: "Cebu City", slug: "cebu-city", region: "Central Visayas", regionCode: "VII", province: "Cebu", latitude: 10.3157, longitude: 123.8854, population: 964169, isHCC: true },
  { name: "Danao", slug: "danao", region: "Central Visayas", regionCode: "VII", province: "Cebu", latitude: 10.5167, longitude: 124.0167, population: 136471 },
  { name: "Lapu-Lapu", slug: "lapu-lapu", region: "Central Visayas", regionCode: "VII", province: "Cebu", latitude: 10.3103, longitude: 123.9494, population: 497604, isHCC: true },
  { name: "Mandaue", slug: "mandaue", region: "Central Visayas", regionCode: "VII", province: "Cebu", latitude: 10.3236, longitude: 123.9223, population: 364116, isHCC: true },
  { name: "Naga", slug: "naga-cebu", region: "Central Visayas", regionCode: "VII", province: "Cebu", latitude: 10.2167, longitude: 123.7500, population: 137934 },
  { name: "Talisay", slug: "talisay-cebu", region: "Central Visayas", regionCode: "VII", province: "Cebu", latitude: 10.2500, longitude: 123.8333, population: 227645 },
  { name: "Toledo", slug: "toledo", region: "Central Visayas", regionCode: "VII", province: "Cebu", latitude: 10.3667, longitude: 123.6333, population: 183104 },
  { name: "Bayawan", slug: "bayawan", region: "Central Visayas", regionCode: "VII", province: "Negros Oriental", latitude: 9.3667, longitude: 122.8000, population: 117900 },
  { name: "Bais", slug: "bais", region: "Central Visayas", regionCode: "VII", province: "Negros Oriental", latitude: 9.5833, longitude: 123.1167, population: 84300 },
  { name: "Canlaon", slug: "canlaon", region: "Central Visayas", regionCode: "VII", province: "Negros Oriental", latitude: 10.3833, longitude: 123.2000, population: 51000 },
  { name: "Dumaguete", slug: "dumaguete", region: "Central Visayas", regionCode: "VII", province: "Negros Oriental", latitude: 9.3103, longitude: 123.3081, population: 134103 },
  { name: "Guihulngan", slug: "guihulngan", region: "Central Visayas", regionCode: "VII", province: "Negros Oriental", latitude: 10.1167, longitude: 123.2667, population: 109864 },
  { name: "Tanjay", slug: "tanjay", region: "Central Visayas", regionCode: "VII", province: "Negros Oriental", latitude: 9.5167, longitude: 123.1500, population: 83000 },

  // Region VIII - Eastern Visayas
  { name: "Tacloban", slug: "tacloban", region: "Eastern Visayas", regionCode: "VIII", province: "Leyte", latitude: 11.2543, longitude: 124.9617, population: 251881, isHCC: true },
  { name: "Ormoc", slug: "ormoc", region: "Eastern Visayas", regionCode: "VIII", province: "Leyte", latitude: 11.0064, longitude: 124.6075, population: 215031, isHCC: true },
  { name: "Baybay", slug: "baybay", region: "Eastern Visayas", regionCode: "VIII", province: "Leyte", latitude: 10.6833, longitude: 124.8000, population: 109432 },
  { name: "Catbalogan", slug: "catbalogan", region: "Eastern Visayas", regionCode: "VIII", province: "Samar", latitude: 11.7756, longitude: 124.8861, population: 103879 },
  { name: "Calbayog", slug: "calbayog", region: "Eastern Visayas", regionCode: "VIII", province: "Samar", latitude: 12.0672, longitude: 124.5978, population: 183851 },
  { name: "Maasin", slug: "maasin", region: "Eastern Visayas", regionCode: "VIII", province: "Southern Leyte", latitude: 10.1333, longitude: 124.8500, population: 90000 },

  // Region IX - Zamboanga Peninsula
  { name: "Dapitan", slug: "dapitan", region: "Zamboanga Peninsula", regionCode: "IX", province: "Zamboanga del Norte", latitude: 8.6556, longitude: 123.4236, population: 83220 },
  { name: "Dipolog", slug: "dipolog", region: "Zamboanga Peninsula", regionCode: "IX", province: "Zamboanga del Norte", latitude: 8.5872, longitude: 123.3408, population: 130759 },
  { name: "Pagadian", slug: "pagadian", region: "Zamboanga Peninsula", regionCode: "IX", province: "Zamboanga del Sur", latitude: 7.8261, longitude: 123.4372, population: 214159 },
  { name: "Zamboanga City", slug: "zamboanga-city", region: "Zamboanga Peninsula", regionCode: "IX", province: "Zamboanga del Sur", latitude: 6.9214, longitude: 122.0790, population: 977234, isHCC: true },
  { name: "Isabela City", slug: "isabela-city-basilan", region: "Zamboanga Peninsula", regionCode: "IX", province: "Basilan", latitude: 6.7000, longitude: 121.9667, population: 130379 },

  // Region X - Northern Mindanao
  { name: "Malaybalay", slug: "malaybalay", region: "Northern Mindanao", regionCode: "X", province: "Bukidnon", latitude: 8.1575, longitude: 125.1275, population: 174625 },
  { name: "Valencia", slug: "valencia-bukidnon", region: "Northern Mindanao", regionCode: "X", province: "Bukidnon", latitude: 7.9000, longitude: 125.0833, population: 192813 },
  { name: "Cagayan de Oro", slug: "cagayan-de-oro", region: "Northern Mindanao", regionCode: "X", province: "Misamis Oriental", latitude: 8.4542, longitude: 124.6319, population: 728402, isHCC: true },
  { name: "Gingoog", slug: "gingoog", region: "Northern Mindanao", regionCode: "X", province: "Misamis Oriental", latitude: 8.8167, longitude: 125.1000, population: 136698 },
  { name: "El Salvador", slug: "el-salvador-misamis-oriental", region: "Northern Mindanao", regionCode: "X", province: "Misamis Oriental", latitude: 8.5667, longitude: 124.5167, population: 69817 },
  { name: "Ozamiz", slug: "ozamiz", region: "Northern Mindanao", regionCode: "X", province: "Misamis Occidental", latitude: 8.1500, longitude: 123.8500, population: 141828 },
  { name: "Oroquieta", slug: "oroquieta", region: "Northern Mindanao", regionCode: "X", province: "Misamis Occidental", latitude: 8.4833, longitude: 123.8000, population: 73002 },
  { name: "Tangub", slug: "tangub", region: "Northern Mindanao", regionCode: "X", province: "Misamis Occidental", latitude: 8.0667, longitude: 123.7500, population: 68956 },
  { name: "Iligan", slug: "iligan", region: "Northern Mindanao", regionCode: "X", province: "Lanao del Norte", latitude: 8.2280, longitude: 124.2452, population: 363115, isHCC: true },

  // Region XI - Davao Region
  { name: "Panabo", slug: "panabo", region: "Davao Region", regionCode: "XI", province: "Davao del Norte", latitude: 7.3078, longitude: 125.6844, population: 184599 },
  { name: "Tagum", slug: "tagum", region: "Davao Region", regionCode: "XI", province: "Davao del Norte", latitude: 7.4478, longitude: 125.8078, population: 296195 },
  { name: "Samal", slug: "samal", region: "Davao Region", regionCode: "XI", province: "Davao del Norte", latitude: 7.0833, longitude: 125.7333, population: 119057 },
  { name: "Davao City", slug: "davao-city", region: "Davao Region", regionCode: "XI", province: "Davao del Sur", latitude: 7.1907, longitude: 125.4553, population: 1776949, isHCC: true },
  { name: "Digos", slug: "digos", region: "Davao Region", regionCode: "XI", province: "Davao del Sur", latitude: 6.7500, longitude: 125.3500, population: 179186 },
  { name: "Mati", slug: "mati", region: "Davao Region", regionCode: "XI", province: "Davao Oriental", latitude: 6.9500, longitude: 126.2167, population: 141141 },

  // Region XII - SOCCSKSARGEN
  { name: "Kidapawan", slug: "kidapawan", region: "SOCCSKSARGEN", regionCode: "XII", province: "Cotabato", latitude: 7.0083, longitude: 125.0894, population: 140195 },
  { name: "Koronadal", slug: "koronadal", region: "SOCCSKSARGEN", regionCode: "XII", province: "South Cotabato", latitude: 6.5000, longitude: 124.8500, population: 198815 },
  { name: "General Santos", slug: "general-santos", region: "SOCCSKSARGEN", regionCode: "XII", province: "South Cotabato", latitude: 6.1108, longitude: 125.1717, population: 697315, isHCC: true },
  { name: "Tacurong", slug: "tacurong", region: "SOCCSKSARGEN", regionCode: "XII", province: "Sultan Kudarat", latitude: 6.6833, longitude: 124.6833, population: 89278 },

  // Region XIII - Caraga
  { name: "Butuan", slug: "butuan", region: "Caraga", regionCode: "XIII", province: "Agusan del Norte", latitude: 8.9492, longitude: 125.5436, population: 372910, isHCC: true },
  { name: "Cabadbaran", slug: "cabadbaran", region: "Caraga", regionCode: "XIII", province: "Agusan del Norte", latitude: 9.1233, longitude: 125.5358, population: 73639 },
  { name: "Bayugan", slug: "bayugan", region: "Caraga", regionCode: "XIII", province: "Agusan del Sur", latitude: 8.7167, longitude: 125.7500, population: 103202 },
  { name: "Bislig", slug: "bislig", region: "Caraga", regionCode: "XIII", province: "Surigao del Sur", latitude: 8.2000, longitude: 126.3500, population: 97860 },
  { name: "Tandag", slug: "tandag", region: "Caraga", regionCode: "XIII", province: "Surigao del Sur", latitude: 9.0667, longitude: 126.2000, population: 58030 },
  { name: "Surigao City", slug: "surigao-city", region: "Caraga", regionCode: "XIII", province: "Surigao del Norte", latitude: 9.7844, longitude: 125.4961, population: 166145 },

  // BARMM - Bangsamoro Autonomous Region
  { name: "Cotabato City", slug: "cotabato-city", region: "BARMM", regionCode: "BARMM", province: "Maguindanao", latitude: 7.2047, longitude: 124.2310, population: 325079, isHCC: true },
  { name: "Marawi", slug: "marawi", region: "BARMM", regionCode: "BARMM", province: "Lanao del Sur", latitude: 7.9986, longitude: 124.2928, population: 201785 },
  { name: "Lamitan", slug: "lamitan", region: "BARMM", regionCode: "BARMM", province: "Basilan", latitude: 6.6500, longitude: 122.1333, population: 104473 },

  // CAR - Cordillera Administrative Region
  { name: "Baguio", slug: "baguio", region: "Cordillera Administrative Region", regionCode: "CAR", province: "Benguet", latitude: 16.4023, longitude: 120.5960, population: 366358, isHCC: true },
  { name: "Tabuk", slug: "tabuk", region: "Cordillera Administrative Region", regionCode: "CAR", province: "Kalinga", latitude: 17.4167, longitude: 121.4500, population: 115237 },
];

// Fix the typo in Bogo population
const bogoIndex = philippineCities.findIndex(c => c.slug === 'bogo');
if (bogoIndex !== -1) {
  philippineCities[bogoIndex].population = 86695;
}

// Get cities by region
export function getCitiesByRegion(regionCode: string): City[] {
  return philippineCities.filter(city => city.regionCode === regionCode);
}

// Get city by slug
export function getCityBySlug(slug: string): City | undefined {
  return philippineCities.find(city => city.slug === slug);
}

// Get all city slugs for static generation
export function getAllCitySlugs(): string[] {
  return philippineCities.map(city => city.slug);
}

// Get nearby cities within radius (in km)
export function getNearbyCities(lat: number, lng: number, radiusKm: number): City[] {
  return philippineCities.filter(city => {
    const distance = getDistanceFromLatLonInKm(lat, lng, city.latitude, city.longitude);
    return distance <= radiusKm;
  });
}

// Haversine formula for distance calculation
export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Philippine regions for navigation
export const philippineRegions = [
  { code: "NCR", name: "National Capital Region", slug: "ncr" },
  { code: "CAR", name: "Cordillera Administrative Region", slug: "car" },
  { code: "I", name: "Ilocos Region", slug: "region-1" },
  { code: "II", name: "Cagayan Valley", slug: "region-2" },
  { code: "III", name: "Central Luzon", slug: "region-3" },
  { code: "IV-A", name: "CALABARZON", slug: "calabarzon" },
  { code: "IV-B", name: "MIMAROPA", slug: "mimaropa" },
  { code: "V", name: "Bicol Region", slug: "bicol" },
  { code: "VI", name: "Western Visayas", slug: "western-visayas" },
  { code: "VII", name: "Central Visayas", slug: "central-visayas" },
  { code: "VIII", name: "Eastern Visayas", slug: "eastern-visayas" },
  { code: "IX", name: "Zamboanga Peninsula", slug: "zamboanga" },
  { code: "X", name: "Northern Mindanao", slug: "northern-mindanao" },
  { code: "XI", name: "Davao Region", slug: "davao" },
  { code: "XII", name: "SOCCSKSARGEN", slug: "soccsksargen" },
  { code: "XIII", name: "Caraga", slug: "caraga" },
  { code: "BARMM", name: "Bangsamoro Autonomous Region", slug: "barmm" },
];
