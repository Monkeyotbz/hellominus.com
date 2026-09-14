// Tipos para el sistema de precios dinámico
export interface PricingRule {
  basePrice: number;
  seasonalPrices: {
    low: { multiplier: number; months: number[] };
    medium: { multiplier: number; months: number[] };
    high: { multiplier: number; months: number[] };
    peak: { multiplier: number; months: number[] };
  };
  groupDiscounts: {
    [key: string]: number;
  };
  stayDiscounts: {
    [key: string]: number;
  };
  additionalServices: {
    [key: string]: { price: number; label: string };
  };
}

export interface PriceBreakdown {
  baseNightlyPrice: number;
  adjustedNightlyPrice: number;
  nights: number;
  baseTotal: number;
  servicesTotal: number;
  totalPrice: number;
  services: Array<{ name: string; price: number }>;
  breakdown: {
    season: string;
    seasonDiscount: string;
    groupDiscount: string;
    stayDiscount: string;
  };
}

// Función para calcular la temporada
export function getSeason(date: Date): string {
  const month = date.getMonth() + 1;
  
  // Pico: 31 Dic - 2 Enero
  if (month === 12 || month === 1) {
    const day = date.getDate();
    if ((month === 12 && day >= 20) || (month === 1 && day <= 7)) {
      return 'peak';
    }
  }
  
  // Alta temporada: Junio-Agosto, Diciembre
  if ([6, 7, 8, 12].includes(month)) return 'high';
  
  // Media temporada: Abril-Mayo, Septiembre
  if ([4, 5, 9].includes(month)) return 'medium';
  
  // Baja temporada: Enero-Marzo, Octubre-Noviembre
  return 'low';
}

// Función para calcular el rango de grupo
export function getGroupRange(guests: number): string {
  if (guests === 1) return '1';
  if (guests === 2) return '2';
  if (guests >= 3 && guests <= 4) return '3-4';
  if (guests >= 5 && guests <= 6) return '5-6';
  if (guests >= 7 && guests <= 8) return '7-8';
  return '9+';
}

// Función para calcular el rango de duración
export function getStayRange(nights: number): string {
  if (nights === 1) return '1';
  if (nights === 2) return '2';
  if (nights >= 3 && nights <= 5) return '3-5';
  if (nights >= 6 && nights <= 7) return '6-7';
  if (nights >= 8 && nights <= 14) return '8-14';
  return '15+';
}

// Función principal para calcular precio
export function calculatePrice(
  pricingRule: PricingRule,
  checkIn: string,
  checkOut: string,
  guests: number,
  selectedServices: string[] = []
): PriceBreakdown {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  // Calcular noches
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (nights <= 0) {
    throw new Error('Las fechas no son válidas');
  }
  
  // Precio base
  let basePrice = pricingRule.basePrice * nights;
  
  // Aplicar multiplicador de temporada
  const season = getSeason(checkInDate);
  const seasonRule = Object.values(pricingRule.seasonalPrices).find(rule =>
    season === 'peak' ? rule.multiplier > 1.2 : rule.multiplier > 0.9
  );
  const seasonMultiplier = seasonRule?.multiplier || 1.0;
  basePrice *= seasonMultiplier;
  
  // Aplicar descuento por grupo
  const groupRange = getGroupRange(guests);
  const groupDiscount = pricingRule.groupDiscounts[groupRange] || 0;
  basePrice *= (1 - groupDiscount);
  
  // Aplicar descuento por duración
  const stayRange = getStayRange(nights);
  const stayDiscount = pricingRule.stayDiscounts[stayRange] || 0;
  basePrice *= (1 - stayDiscount);
  
  // Calcular servicios adicionales
  let servicesTotal = 0;
  const services: Array<{ name: string; price: number }> = [];
  
  selectedServices.forEach(serviceKey => {
    const service = pricingRule.additionalServices[serviceKey];
    if (service) {
      servicesTotal += service.price;
      services.push({ name: service.label, price: service.price });
    }
  });
  
  const totalPrice = Math.round(basePrice) + servicesTotal;
  
  return {
    baseNightlyPrice: pricingRule.basePrice,
    adjustedNightlyPrice: Math.round(basePrice / nights),
    nights,
    baseTotal: Math.round(basePrice),
    servicesTotal,
    totalPrice,
    services,
    breakdown: {
      season,
      seasonDiscount: `${Math.round((1 - seasonMultiplier) * 100)}%`,
      groupDiscount: `${Math.round(groupDiscount * 100)}%`,
      stayDiscount: `${Math.round(stayDiscount * 100)}%`
    }
  };
}

// Reglas de precios para cada propiedad
export const propertyPricingRules: { [key: string]: PricingRule } = {
  'jardin-aguilas': {
    basePrice: 180000,
    seasonalPrices: {
      low: { multiplier: 0.9, months: [1, 2, 3, 10, 11] },
      medium: { multiplier: 1.0, months: [4, 5, 9] },
      high: { multiplier: 1.2, months: [6, 7, 8] },
      peak: { multiplier: 1.4, months: [12] }
    },
    groupDiscounts: {
      '1': 0,
      '2': 0,
      '3-4': 0.05,
      '5-6': 0.10,
      '7-8': 0.15,
      '9+': 0.20
    },
    stayDiscounts: {
      '1': 0,
      '2': 0,
      '3-5': 0.05,
      '6-7': 0.10,
      '8-14': 0.15,
      '15+': 0.20
    },
    additionalServices: {
      desayuno: { price: 25000, label: '🍳 Desayuno incluído' },
      'traslado-aeropuerto': { price: 50000, label: '🚗 Traslado al aeropuerto' },
      'tour-guiado': { price: 120000, label: '🥾 Tour guiado - Cascadas' },
      'cena-privada': { price: 150000, label: '🍽️ Cena privada' }
    }
  },
  'medellin-opera': {
    basePrice: 280000,
    seasonalPrices: {
      low: { multiplier: 0.85, months: [1, 2, 3, 10, 11] },
      medium: { multiplier: 1.0, months: [4, 5, 9] },
      high: { multiplier: 1.15, months: [6, 7, 8] },
      peak: { multiplier: 1.35, months: [12] }
    },
    groupDiscounts: {
      '1': 0,
      '2': 0,
      '3-4': 0.05,
      '5-6': 0.10,
      '7-8': 0.12,
      '9+': 0.15
    },
    stayDiscounts: {
      '1': 0,
      '2': 0,
      '3-5': 0.05,
      '6-7': 0.10,
      '8-14': 0.15,
      '15+': 0.25
    },
    additionalServices: {
      desayuno: { price: 35000, label: '🍳 Desayuno buffet' },
      'tour-ciudad': { price: 100000, label: '🏙️ Tour por Medellín' },
      'spa': { price: 200000, label: '💆 Sesión spa (pareja)' },
      'cena-restaurante': { price: 180000, label: '🍽️ Cena en restaurante 5⭐' }
    }
  },
  'medellin-opera-jacuzzi': {
    basePrice: 320000,
    seasonalPrices: {
      low: { multiplier: 0.85, months: [1, 2, 3, 10, 11] },
      medium: { multiplier: 1.0, months: [4, 5, 9] },
      high: { multiplier: 1.2, months: [6, 7, 8] },
      peak: { multiplier: 1.35, months: [12] }
    },
    groupDiscounts: {
      '1': 0,
      '2': 0,
      '3-4': 0,
      '5-6': 0,
      '7-8': 0,
      '9+': 0
    },
    stayDiscounts: {
      '1': 0,
      '2': 0,
      '3-5': 0.05,
      '6-7': 0.10,
      '8-14': 0.15,
      '15+': 0.22
    },
    additionalServices: {
      desayuno: { price: 40000, label: '🍳 Desayuno en la habitación' },
      'champagne': { price: 120000, label: '🍾 Champagne y fresas' },
      'masaje-pareja': { price: 250000, label: '💆 Masaje en pareja' },
      'cena-romantica': { price: 200000, label: '🕯️ Cena romántica' }
    }
  },
  'medellin-opera-semi-suite': {
    basePrice: 300000,
    seasonalPrices: {
      low: { multiplier: 0.85, months: [1, 2, 3, 10, 11] },
      medium: { multiplier: 1.0, months: [4, 5, 9] },
      high: { multiplier: 1.2, months: [6, 7, 8] },
      peak: { multiplier: 1.35, months: [12] }
    },
    groupDiscounts: {
      '1': 0,
      '2': 0,
      '3-4': 0,
      '5-6': 0,
      '7-8': 0,
      '9+': 0
    },
    stayDiscounts: {
      '1': 0,
      '2': 0,
      '3-5': 0.05,
      '6-7': 0.10,
      '8-14': 0.15,
      '15+': 0.20
    },
    additionalServices: {
      desayuno: { price: 35000, label: '🍳 Desayuno continental' },
      'bebidas': { price: 80000, label: '🍹 Bebidas premium' },
      'tour-ciudad': { price: 100000, label: '🏙️ Tour por Medellín' },
      'late-checkout': { price: 50000, label: '🕐 Late checkout' }
    }
  },
  'medellin-opera-doble-clasica': {
    basePrice: 250000,
    seasonalPrices: {
      low: { multiplier: 0.85, months: [1, 2, 3, 10, 11] },
      medium: { multiplier: 1.0, months: [4, 5, 9] },
      high: { multiplier: 1.15, months: [6, 7, 8] },
      peak: { multiplier: 1.3, months: [12] }
    },
    groupDiscounts: {
      '1': 0,
      '2': 0,
      '3-4': 0,
      '5-6': 0,
      '7-8': 0,
      '9+': 0
    },
    stayDiscounts: {
      '1': 0,
      '2': 0,
      '3-5': 0.05,
      '6-7': 0.08,
      '8-14': 0.12,
      '15+': 0.18
    },
    additionalServices: {
      desayuno: { price: 30000, label: '🍳 Desayuno básico' },
      'limpieza-extra': { price: 40000, label: '🧹 Limpieza adicional' },
      'tour-ciudad': { price: 100000, label: '🏙️ Tour por Medellín' },
      'late-checkout': { price: 40000, label: '🕐 Late checkout' }
    }
  },
  'medellin-penthouse': {
    basePrice: 520000,
    seasonalPrices: {
      low: { multiplier: 0.9, months: [1, 2, 3, 10, 11] },
      medium: { multiplier: 1.0, months: [4, 5, 9] },
      high: { multiplier: 1.15, months: [6, 7, 8] },
      peak: { multiplier: 1.3, months: [12] }
    },
    groupDiscounts: {
      '1': 0.05,
      '2': 0,
      '3-4': 0.05,
      '5-6': 0.10,
      '7-8': 0.15,
      '9+': 0.20
    },
    stayDiscounts: {
      '1': 0,
      '2': 0,
      '3-5': 0.08,
      '6-7': 0.12,
      '8-14': 0.18,
      '15+': 0.25
    },
    additionalServices: {
      desayuno: { price: 50000, label: '🍳 Desayuno gourmet' },
      'chef-privado': { price: 400000, label: '👨‍🍳 Chef privado (4 horas)' },
      'mucama': { price: 150000, label: '🧹 Servicio de mucama' },
      'vino': { price: 80000, label: '🍷 Botellas de vino premium' }
    }
  },
  'jerico-rural': {
    basePrice: 190000,
    seasonalPrices: {
      low: { multiplier: 0.85, months: [1, 2, 3, 10, 11] },
      medium: { multiplier: 1.0, months: [4, 5, 9] },
      high: { multiplier: 1.2, months: [6, 7, 8] },
      peak: { multiplier: 1.35, months: [12] }
    },
    groupDiscounts: {
      '1': 0,
      '2': 0,
      '3-4': 0.08,
      '5-6': 0.12,
      '7-8': 0.16,
      '9+': 0.22
    },
    stayDiscounts: {
      '1': 0,
      '2': 0,
      '3-5': 0.06,
      '6-7': 0.12,
      '8-14': 0.18,
      '15+': 0.25
    },
    additionalServices: {
      desayuno: { price: 20000, label: '🍳 Desayuno incluído' },
      'alquiler-bicicleta': { price: 30000, label: '🚴 Alquiler de bicicleta' },
      'tour-cafe': { price: 100000, label: '☕ Tour por finca de café' },
      'cena-casera': { price: 80000, label: '🍽️ Cena típica colombiana' }
    }
  },
  'san-jeronimo-rural': {
    basePrice: 350000,
    seasonalPrices: {
      low: { multiplier: 0.85, months: [1, 2, 3, 10, 11] },
      medium: { multiplier: 1.0, months: [4, 5, 9] },
      high: { multiplier: 1.25, months: [6, 7, 8] },
      peak: { multiplier: 1.4, months: [12] }
    },
    groupDiscounts: {
      '1': 0,
      '2': 0,
      '3-4': 0.05,
      '5-6': 0.10,
      '7-8': 0.15,
      '9+': 0.20
    },
    stayDiscounts: {
      '1': 0,
      '2': 0,
      '3-5': 0.08,
      '6-7': 0.12,
      '8-14': 0.18,
      '15+': 0.25
    },
    additionalServices: {
      desayuno: { price: 30000, label: '🍳 Desayuno completo (por persona)' },
      'asado': { price: 250000, label: '🔥 Asado familiar completo' },
      'guia-turistico': { price: 120000, label: '🗺️ Guía turístico local' },
      'transporte-local': { price: 80000, label: '🚗 Transporte local (día completo)' }
    }
  },
  'pitalito-rancho-california': {
    basePrice: 280000,
    seasonalPrices: {
      low: { multiplier: 0.85, months: [1, 2, 3, 10, 11] },
      medium: { multiplier: 1.0, months: [4, 5, 9] },
      high: { multiplier: 1.2, months: [6, 7, 8] },
      peak: { multiplier: 1.35, months: [12] }
    },
    groupDiscounts: {
      '1': 0,
      '2': 0,
      '3-4': 0.05,
      '5-6': 0.10,
      '7-8': 0.15,
      '9+': 0.18
    },
    stayDiscounts: {
      '1': 0,
      '2': 0,
      '3-5': 0.06,
      '6-7': 0.10,
      '8-14': 0.15,
      '15+': 0.22
    },
    additionalServices: {
      desayuno: { price: 25000, label: '🍳 Desayuno campestre (por persona)' },
      'parrillada': { price: 200000, label: '🔥 Parrillada completa' },
      'cabalgata': { price: 150000, label: '🐴 Cabalgata por la zona' },
      'tour-cafe': { price: 90000, label: '☕ Tour por cafetal local' }
    }
  }
};
