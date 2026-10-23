import type { PropertyCard, PropertyDetail, RecommendedProperty } from '@/types/api';
import { mockAmenities } from './reference';

// Deterministic placeholder photos so the same property always shows the same image.
function img(seed: number): string {
  return `https://picsum.photos/seed/propmatch-${seed}/800/600`;
}

const base: Omit<PropertyCard, 'propertyId' | 'title' | 'city' | 'locality' | 'typeId' | 'typeName' | 'primaryImage'>[] = [];
void base;

interface Seed {
  id: number;
  title: string;
  listingType: 'SALE' | 'RENT';
  price: number;
  areaSqft: number;
  bedrooms: number;
  bathrooms: number;
  furnishing: PropertyCard['furnishing'];
  typeId: number;
  typeName: string;
  city: string;
  locality: string;
  agentName: string;
  createdAt: string;
  amenityIds: number[];
}

const seeds: Seed[] = [
  { id: 1, title: 'Sunny 3BHK near Whitefield Metro', listingType: 'SALE', price: 8500000, areaSqft: 1300, bedrooms: 3, bathrooms: 2, furnishing: 'SEMI_FURNISHED', typeId: 1, typeName: 'Apartment', city: 'Bengaluru', locality: 'Whitefield', agentName: 'Ravi Kumar', createdAt: '2026-09-20T08:00:00.000Z', amenityIds: [1, 3, 5, 6] },
  { id: 2, title: 'Compact 2BHK, walk to HSR tech parks', listingType: 'RENT', price: 32000, areaSqft: 950, bedrooms: 2, bathrooms: 2, furnishing: 'FURNISHED', typeId: 1, typeName: 'Apartment', city: 'Bengaluru', locality: 'HSR Layout', agentName: 'Meera Iyer', createdAt: '2026-09-22T08:00:00.000Z', amenityIds: [1, 2, 6] },
  { id: 3, title: 'Independent villa with private garden', listingType: 'SALE', price: 21000000, areaSqft: 2800, bedrooms: 4, bathrooms: 4, furnishing: 'UNFURNISHED', typeId: 3, typeName: 'Villa', city: 'Bengaluru', locality: 'Indiranagar', agentName: 'Ravi Kumar', createdAt: '2026-09-10T08:00:00.000Z', amenityIds: [1, 5, 6, 7] },
  { id: 4, title: 'Cozy 1BHK for young professionals', listingType: 'RENT', price: 18000, areaSqft: 600, bedrooms: 1, bathrooms: 1, furnishing: 'SEMI_FURNISHED', typeId: 1, typeName: 'Apartment', city: 'Bengaluru', locality: 'Koramangala', agentName: 'Meera Iyer', createdAt: '2026-09-25T08:00:00.000Z', amenityIds: [2, 6] },
  { id: 5, title: 'Spacious 4BHK duplex with clubhouse access', listingType: 'SALE', price: 15500000, areaSqft: 2400, bedrooms: 4, bathrooms: 3, furnishing: 'SEMI_FURNISHED', typeId: 1, typeName: 'Apartment', city: 'Bengaluru', locality: 'Electronic City', agentName: 'Farhan Sheikh', createdAt: '2026-09-05T08:00:00.000Z', amenityIds: [1, 3, 4, 8] },
  { id: 6, title: 'Charming independent house, Jayanagar 4th block', listingType: 'SALE', price: 12500000, areaSqft: 1800, bedrooms: 3, bathrooms: 3, furnishing: 'UNFURNISHED', typeId: 2, typeName: 'Independent House', city: 'Bengaluru', locality: 'Jayanagar', agentName: 'Ravi Kumar', createdAt: '2026-08-28T08:00:00.000Z', amenityIds: [1, 6, 7] },
  { id: 7, title: 'Modern 2BHK, Marathahalli ORR facing', listingType: 'RENT', price: 27000, areaSqft: 1050, bedrooms: 2, bathrooms: 2, furnishing: 'FURNISHED', typeId: 1, typeName: 'Apartment', city: 'Bengaluru', locality: 'Marathahalli', agentName: 'Farhan Sheikh', createdAt: '2026-09-18T08:00:00.000Z', amenityIds: [1, 2, 3, 5, 6] },
  { id: 8, title: 'Premium 3BHK with lake view, Hebbal', listingType: 'SALE', price: 13800000, areaSqft: 1650, bedrooms: 3, bathrooms: 3, furnishing: 'SEMI_FURNISHED', typeId: 1, typeName: 'Apartment', city: 'Bengaluru', locality: 'Hebbal', agentName: 'Meera Iyer', createdAt: '2026-09-27T08:00:00.000Z', amenityIds: [1, 3, 4, 6, 8] },
  { id: 9, title: 'Residential plot, ready to build', listingType: 'SALE', price: 6500000, areaSqft: 2400, bedrooms: 0, bathrooms: 0, furnishing: 'UNFURNISHED', typeId: 4, typeName: 'Plot', city: 'Bengaluru', locality: 'Electronic City', agentName: 'Farhan Sheikh', createdAt: '2026-08-15T08:00:00.000Z', amenityIds: [] },
  { id: 10, title: 'Elegant 3BHK apartment near tech park', listingType: 'RENT', price: 45000, areaSqft: 1500, bedrooms: 3, bathrooms: 3, furnishing: 'FURNISHED', typeId: 1, typeName: 'Apartment', city: 'Bengaluru', locality: 'Whitefield', agentName: 'Ravi Kumar', createdAt: '2026-09-24T08:00:00.000Z', amenityIds: [1, 2, 3, 5, 6, 8] },
  { id: 11, title: 'Budget 2BHK close to bus depot', listingType: 'SALE', price: 5200000, areaSqft: 850, bedrooms: 2, bathrooms: 1, furnishing: 'UNFURNISHED', typeId: 1, typeName: 'Apartment', city: 'Bengaluru', locality: 'Electronic City', agentName: 'Meera Iyer', createdAt: '2026-09-02T08:00:00.000Z', amenityIds: [6] },
  { id: 12, title: 'Commercial shop space, Koramangala main road', listingType: 'RENT', price: 60000, areaSqft: 700, bedrooms: 0, bathrooms: 1, furnishing: 'UNFURNISHED', typeId: 5, typeName: 'Commercial', city: 'Bengaluru', locality: 'Koramangala', agentName: 'Farhan Sheikh', createdAt: '2026-09-12T08:00:00.000Z', amenityIds: [1, 5] },
];

function toCard(s: Seed, favoriteIds: Set<number>): PropertyCard {
  return {
    propertyId: s.id,
    title: s.title,
    listingType: s.listingType,
    price: s.price,
    pricePerSqft: Math.round((s.price / s.areaSqft) * 100) / 100,
    areaSqft: s.areaSqft,
    bedrooms: s.bedrooms,
    bathrooms: s.bathrooms,
    furnishing: s.furnishing,
    status: 'ACTIVE',
    typeId: s.typeId,
    typeName: s.typeName,
    city: s.city,
    locality: s.locality,
    primaryImage: img(s.id),
    agentName: s.agentName,
    createdAt: s.createdAt,
    isFavorite: favoriteIds.has(s.id),
  };
}

export function getMockCards(favoriteIds: Set<number> = new Set()): PropertyCard[] {
  return seeds.map((s) => toCard(s, favoriteIds));
}

export function getMockDetail(id: number, favoriteIds: Set<number> = new Set()): PropertyDetail | null {
  const s = seeds.find((x) => x.id === id);
  if (!s) return null;
  const card = toCard(s, favoriteIds);
  return {
    ...card,
    locationId: s.id,
    description:
      `A well-maintained ${s.typeName.toLowerCase()} in ${s.locality}, ${s.city}, offering ${s.bedrooms} bedroom(s) ` +
      `across ${s.areaSqft} sqft. Close to schools, hospitals and daily conveniences, with easy access to major roads.`,
    addressLine: `${100 + s.id}, ${s.locality} Main Road`,
    pincode: '560' + String(100 + s.id).padStart(3, '0'),
    state: 'Karnataka',
    latitude: 12.9 + s.id * 0.01,
    longitude: 77.6 + s.id * 0.01,
    images: [1, 2, 3].map((n) => ({ imageId: s.id * 10 + n, imageUrl: img(s.id * 10 + n), isPrimary: n === 1 })),
    amenities: mockAmenities.filter((a) => s.amenityIds.includes(a.amenityId)),
    agent: {
      agentId: 100 + (s.id % 3),
      fullName: s.agentName,
      agencyName: 'Urban Nest Realty',
      phone: '+9198765432' + String(10 + (s.id % 9)),
      isVerified: true,
    },
    priceHistory:
      s.id % 3 === 0
        ? [{ oldPrice: Math.round(s.price * 1.06), newPrice: s.price, changedAt: '2026-09-15T10:00:00.000Z' }]
        : [],
  };
}

export function getMockSimilar(id: number, favoriteIds: Set<number> = new Set()): PropertyCard[] {
  const s = seeds.find((x) => x.id === id);
  if (!s) return [];
  return seeds
    .filter((x) => x.id !== id && x.typeId === s.typeId && x.city === s.city)
    .slice(0, 6)
    .map((x) => toCard(x, favoriteIds));
}

export function getMockRecommendations(favoriteIds: Set<number> = new Set()): RecommendedProperty[] {
  return seeds.slice(0, 8).map((s, i) => ({
    ...toCard(s, favoriteIds),
    matchScore: Math.max(60, 95 - i * 4),
    reasons: i % 2 === 0 ? ['Within your budget', 'Preferred locality'] : ['Preferred property type', 'Meets your bedroom needs'],
  }));
}
