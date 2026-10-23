// SHARED CONTRACT - mirrors PROPMATCH_PROJECT_SPEC.md Section 10.
// Changes here need BOTH teammates' approval (spec Section 18.1).

export type Role = 'BUYER' | 'AGENT' | 'ADMIN';
export type ListingType = 'SALE' | 'RENT';
export type PropertyStatus = 'ACTIVE' | 'SOLD' | 'RENTED' | 'INACTIVE';
export type Furnishing = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FURNISHED';
export type InquiryStatus = 'NEW' | 'CONTACTED' | 'CLOSED';
export type VisitStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'area_desc';

// ---------- Envelope ----------
export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface ApiFieldError {
  field: string;
  message: string;
}
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}
export interface ApiFailure {
  success: false;
  error: { code: string; message: string; details?: ApiFieldError[] };
}
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

// ---------- Users / auth ----------
export interface AgentProfile {
  agencyName: string;
  licenseNo: string;
  isVerified: boolean;
}
export interface User {
  userId: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  agentProfile?: AgentProfile;
}
export interface LoginInput {
  email: string;
  password: string;
}
export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'BUYER' | 'AGENT';
  agencyName?: string;
  licenseNo?: string;
}

// ---------- Reference data ----------
export interface PropertyType {
  typeId: number;
  typeName: string;
}
export interface Amenity {
  amenityId: number;
  amenityName: string;
}
export interface LocationItem {
  locationId: number;
  city: string;
  locality: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
}

// ---------- Properties ----------
export interface PropertyCard {
  propertyId: number;
  title: string;
  listingType: ListingType;
  price: number;
  pricePerSqft: number;
  areaSqft: number;
  bedrooms: number;
  bathrooms: number;
  furnishing: Furnishing;
  status: PropertyStatus;
  typeId: number;
  typeName: string;
  city: string;
  locality: string;
  primaryImage: string | null;
  agentName: string;
  createdAt: string;
  isFavorite: boolean;
}
export interface RecommendedProperty extends PropertyCard {
  matchScore: number;
  reasons: string[];
}
export interface PropertyImage {
  imageId: number;
  imageUrl: string;
  isPrimary: boolean;
}
export interface PropertyAgent {
  agentId: number;
  fullName: string;
  agencyName: string;
  phone: string | null;
  isVerified: boolean;
}
export interface PriceChange {
  oldPrice: number;
  newPrice: number;
  changedAt: string;
}
export interface PropertyDetail extends PropertyCard {
  locationId: number;
  description: string;
  addressLine: string | null;
  pincode: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  images: PropertyImage[];
  amenities: Amenity[];
  agent: PropertyAgent;
  priceHistory: PriceChange[];
}

// GET /api/properties query params (spec 10.3)
export interface PropertyFilters {
  q?: string;
  city?: string;
  locality?: string;
  listingType?: ListingType;
  typeId?: number[];
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  furnishing?: Furnishing;
  amenityIds?: number[];
  sort?: SortOption;
  page?: number;
  limit?: number;
}

// ---------- Buyer features ----------
export interface Preferences {
  listingType: ListingType;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredCities: string[];
  preferredLocalities: string[];
  preferredTypeIds: number[];
  minBedrooms: number | null;
  furnishing: Furnishing | null;
  mustHaveAmenityIds: number[];
}
export interface Inquiry {
  inquiryId: number;
  propertyId: number;
  propertyTitle: string;
  buyerId: number;
  buyerName: string;
  buyerEmail: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}
export interface Visit {
  visitId: number;
  propertyId: number;
  propertyTitle: string;
  buyerId: number;
  buyerName: string;
  scheduledAt: string;
  status: VisitStatus;
}
export interface CreateInquiryInput {
  propertyId: number;
  message: string;
}
export interface CreateVisitInput {
  propertyId: number;
  scheduledAt: string;
}

// ---------- Agent ----------
export interface AgentStats {
  totalListings: number;
  activeListings: number;
  closedListings: number;
  totalInquiries: number;
  totalVisits: number;
  avgListingPrice: number;
  inquiriesByStatus: Record<InquiryStatus, number>;
  visitsByStatus: Record<VisitStatus, number>;
}

// Agent's own listings need every status, not just ACTIVE (spec 9.3 /api/agent/properties)
export interface AgentPropertyCard extends Omit<PropertyCard, 'isFavorite'> {
  status: PropertyStatus;
}

export interface PropertyImageInput {
  imageUrl: string;
  isPrimary: boolean;
}

export interface CreatePropertyInput {
  title: string;
  description: string;
  listingType: ListingType;
  price: number;
  areaSqft: number;
  bedrooms: number;
  bathrooms: number;
  furnishing: Furnishing;
  typeId: number;
  locationId: number;
  addressLine?: string;
  amenityIds: number[];
  images: PropertyImageInput[];
}
export type UpdatePropertyInput = CreatePropertyInput;

// ---------- Admin ----------
export interface AdminUserRow {
  userId: number;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface AdminAgentRow {
  agentId: number;
  fullName: string;
  email: string;
  agencyName: string;
  licenseNo: string;
  isVerified: boolean;
  totalListings: number;
}

export interface AdminAnalytics {
  totals: { users: number; agents: number; activeListings: number; inquiries: number; visits: number };
  avgPricePerSqftByLocality: { city: string; locality: string; listings: number; avgPricePerSqft: number }[];
  topAgents: { agentId: number; agentName: string; totalListings: number; totalInquiries: number }[];
  trendingProperties: { propertyId: number; title: string; views: number; uniqueViewers: number }[];
  topSearchedCities: { city: string; searches: number }[];
  inquiryStatusBreakdown: Record<InquiryStatus, number>;
}
