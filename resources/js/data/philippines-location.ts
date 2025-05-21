// Philippines regions, provinces and cities data

export interface Province {
  name: string;
  region: string;
}

export interface City {
  name: string;
  province: string;
}

// List of regions in the Philippines
export const regions = [
  'National Capital Region (NCR)',
  'Cordillera Administrative Region (CAR)',
  'Ilocos Region (Region I)', 
  'Cagayan Valley (Region II)',
  'Central Luzon (Region III)',
  'CALABARZON (Region IV-A)',
  'MIMAROPA (Region IV-B)',
  'Bicol Region (Region V)',
  'Western Visayas (Region VI)',
  'Central Visayas (Region VII)',
  'Eastern Visayas (Region VIII)',
  'Zamboanga Peninsula (Region IX)',
  'Northern Mindanao (Region X)',
  'Davao Region (Region XI)',
  'SOCCSKSARGEN (Region XII)',
  'Caraga (Region XIII)',
  'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)'
];

// List of provinces by region
export const provinces: Province[] = [
  // NCR
  { name: 'Metro Manila', region: 'National Capital Region (NCR)' },
  
  // CAR
  { name: 'Abra', region: 'Cordillera Administrative Region (CAR)' },
  { name: 'Apayao', region: 'Cordillera Administrative Region (CAR)' },
  { name: 'Benguet', region: 'Cordillera Administrative Region (CAR)' },
  { name: 'Ifugao', region: 'Cordillera Administrative Region (CAR)' },
  { name: 'Kalinga', region: 'Cordillera Administrative Region (CAR)' },
  { name: 'Mountain Province', region: 'Cordillera Administrative Region (CAR)' },
  
  // Region I
  { name: 'Ilocos Norte', region: 'Ilocos Region (Region I)' },
  { name: 'Ilocos Sur', region: 'Ilocos Region (Region I)' },
  { name: 'La Union', region: 'Ilocos Region (Region I)' },
  { name: 'Pangasinan', region: 'Ilocos Region (Region I)' },
  
  // Region II
  { name: 'Batanes', region: 'Cagayan Valley (Region II)' },
  { name: 'Cagayan', region: 'Cagayan Valley (Region II)' },
  { name: 'Isabela', region: 'Cagayan Valley (Region II)' },
  { name: 'Nueva Vizcaya', region: 'Cagayan Valley (Region II)' },
  { name: 'Quirino', region: 'Cagayan Valley (Region II)' },
  
  // Region III
  { name: 'Aurora', region: 'Central Luzon (Region III)' },
  { name: 'Bataan', region: 'Central Luzon (Region III)' },
  { name: 'Bulacan', region: 'Central Luzon (Region III)' },
  { name: 'Nueva Ecija', region: 'Central Luzon (Region III)' },
  { name: 'Pampanga', region: 'Central Luzon (Region III)' },
  { name: 'Tarlac', region: 'Central Luzon (Region III)' },
  { name: 'Zambales', region: 'Central Luzon (Region III)' },
  
  // Region IV-A
  { name: 'Batangas', region: 'CALABARZON (Region IV-A)' },
  { name: 'Cavite', region: 'CALABARZON (Region IV-A)' },
  { name: 'Laguna', region: 'CALABARZON (Region IV-A)' },
  { name: 'Quezon', region: 'CALABARZON (Region IV-A)' },
  { name: 'Rizal', region: 'CALABARZON (Region IV-A)' },
  
  // Region IV-B
  { name: 'Marinduque', region: 'MIMAROPA (Region IV-B)' },
  { name: 'Occidental Mindoro', region: 'MIMAROPA (Region IV-B)' },
  { name: 'Oriental Mindoro', region: 'MIMAROPA (Region IV-B)' },
  { name: 'Palawan', region: 'MIMAROPA (Region IV-B)' },
  { name: 'Romblon', region: 'MIMAROPA (Region IV-B)' },
  
  // Additional provinces from other regions
  { name: 'Cebu', region: 'Central Visayas (Region VII)' },
  { name: 'Bohol', region: 'Central Visayas (Region VII)' },
  { name: 'Davao del Sur', region: 'Davao Region (Region XI)' },
  { name: 'Davao del Norte', region: 'Davao Region (Region XI)' },
  { name: 'Davao Oriental', region: 'Davao Region (Region XI)' },
  { name: 'Davao Occidental', region: 'Davao Region (Region XI)' },
  { name: 'Davao de Oro', region: 'Davao Region (Region XI)' },
];

// List of cities by province (sample - not exhaustive)
export const cities: City[] = [
  // Metro Manila cities
  { name: 'Manila', province: 'Metro Manila' },
  { name: 'Quezon City', province: 'Metro Manila' },
  { name: 'Makati', province: 'Metro Manila' },
  { name: 'Pasig', province: 'Metro Manila' },
  { name: 'Taguig', province: 'Metro Manila' },
  { name: 'Pasay', province: 'Metro Manila' },
  { name: 'Parañaque', province: 'Metro Manila' },
  { name: 'Mandaluyong', province: 'Metro Manila' },
  { name: 'Marikina', province: 'Metro Manila' },
  { name: 'San Juan', province: 'Metro Manila' },
  { name: 'Caloocan', province: 'Metro Manila' },
  { name: 'Muntinlupa', province: 'Metro Manila' },
  { name: 'Las Piñas', province: 'Metro Manila' },
  { name: 'Valenzuela', province: 'Metro Manila' },
  { name: 'Navotas', province: 'Metro Manila' },
  { name: 'Malabon', province: 'Metro Manila' },
  
  // Cebu cities
  { name: 'Cebu City', province: 'Cebu' },
  { name: 'Mandaue', province: 'Cebu' },
  { name: 'Lapu-Lapu', province: 'Cebu' },
  { name: 'Talisay', province: 'Cebu' },
  { name: 'Danao', province: 'Cebu' },
  { name: 'Toledo', province: 'Cebu' },
  
  // Davao cities
  { name: 'Davao City', province: 'Davao del Sur' },
  { name: 'Digos', province: 'Davao del Sur' },
  { name: 'Tagum', province: 'Davao del Norte' },
  { name: 'Panabo', province: 'Davao del Norte' },
  { name: 'Mati', province: 'Davao Oriental' },
  
  // CALABARZON cities
  { name: 'Batangas City', province: 'Batangas' },
  { name: 'Lipa', province: 'Batangas' },
  { name: 'Tanauan', province: 'Batangas' },
  { name: 'Cavite City', province: 'Cavite' },
  { name: 'Tagaytay', province: 'Cavite' },
  { name: 'Trece Martires', province: 'Cavite' },
  { name: 'Dasmariñas', province: 'Cavite' },
  { name: 'General Trias', province: 'Cavite' },
  { name: 'Biñan', province: 'Laguna' },
  { name: 'Santa Rosa', province: 'Laguna' },
  { name: 'San Pablo', province: 'Laguna' },
  { name: 'Calamba', province: 'Laguna' },
  { name: 'Antipolo', province: 'Rizal' },
  
  // Add more cities as needed
];

// Helper function to get cities by province
export const getCitiesByProvince = (provinceName: string): City[] => {
  return cities.filter(city => city.province === provinceName);
};

// Helper function to search provinces
export const searchProvinces = (searchTerm: string): Province[] => {
  if (!searchTerm) return provinces;
  const lowerCaseSearch = searchTerm.toLowerCase();
  return provinces.filter(province => 
    province.name.toLowerCase().includes(lowerCaseSearch)
  );
};

// Helper function to search cities
export const searchCities = (searchTerm: string, provinceName?: string): City[] => {
  if (!searchTerm && !provinceName) return cities;
  
  let filteredCities = cities;
  if (provinceName) {
    filteredCities = filteredCities.filter(city => city.province === provinceName);
  }
  
  if (!searchTerm) return filteredCities;
  
  const lowerCaseSearch = searchTerm.toLowerCase();
  return filteredCities.filter(city => 
    city.name.toLowerCase().includes(lowerCaseSearch)
  );
};