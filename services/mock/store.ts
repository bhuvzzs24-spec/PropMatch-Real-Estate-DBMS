// In-memory mock backend for NEXT_PUBLIC_USE_MOCKS=true.
// Lets every page work before Bhuvana's real API exists (spec Section 18.7).
// State lives only for the browser tab's lifetime - it is not persisted.

import type {
  AdminAgentRow,
  AdminAnalytics,
  AdminUserRow,
  AgentPropertyCard,
  AgentStats,
  CreateInquiryInput,
  CreatePropertyInput,
  CreateVisitInput,
  Inquiry,
  InquiryStatus,
  Preferences,
  PropertyFilters,
  RegisterInput,
  UpdatePropertyInput,
  User,
  Visit,
  VisitStatus,
} from '@/types/api';
import { getMockCards, getMockDetail, getMockRecommendations, getMockSimilar } from '@/mocks/properties';
import { mockLocations, mockPropertyTypes } from '@/mocks/reference';

const MOCK_USER_BUYER: User = {
  userId: 12,
  fullName: 'Asha N',
  email: 'buyer1@propmatch.test',
  phone: '9876543210',
  role: 'BUYER',
  isActive: true,
  createdAt: '2026-08-01T08:00:00.000Z',
};

const MOCK_USER_AGENT: User = {
  userId: 7,
  fullName: 'Ravi Kumar',
  email: 'agent1@propmatch.test',
  phone: '9876500001',
  role: 'AGENT',
  isActive: true,
  createdAt: '2026-07-01T08:00:00.000Z',
  agentProfile: { agencyName: 'Urban Nest Realty', licenseNo: 'KA-REA-1023', isVerified: true },
};

const MOCK_USER_ADMIN: User = {
  userId: 1,
  fullName: 'Platform Admin',
  email: 'admin@propmatch.test',
  phone: null,
  role: 'ADMIN',
  isActive: true,
  createdAt: '2026-01-01T08:00:00.000Z',
};

// A believable mock needs a real accounts table - not just a "does the email
// contain the word agent" trick. Seeded with the test accounts from spec
// Section 18.6 so those documented credentials work without signing up first.
// Passwords are stored in plain text here ONLY because this is a throwaway
// in-memory mock; the real backend must bcrypt-hash them (spec Section 12.1).
interface RegisteredAccount {
  password: string;
  user: User;
}

const registeredAccounts = new Map<string, RegisteredAccount>([
  ['admin@propmatch.test', { password: 'Test@1234', user: MOCK_USER_ADMIN }],
  ['agent1@propmatch.test', { password: 'Test@1234', user: MOCK_USER_AGENT }],
  [
    'agent2@propmatch.test',
    {
      password: 'Test@1234',
      user: {
        userId: 8,
        fullName: 'Meera Iyer',
        email: 'agent2@propmatch.test',
        phone: '9876500002',
        role: 'AGENT',
        isActive: true,
        createdAt: '2026-07-05T08:00:00.000Z',
        agentProfile: { agencyName: 'City Homes', licenseNo: 'KA-REA-1044', isVerified: true },
      },
    },
  ],
  [
    'agent3@propmatch.test',
    {
      password: 'Test@1234',
      user: {
        userId: 9,
        fullName: 'Farhan Sheikh',
        email: 'agent3@propmatch.test',
        phone: '9876500003',
        role: 'AGENT',
        isActive: true,
        createdAt: '2026-09-01T08:00:00.000Z',
        agentProfile: { agencyName: 'Sheikh Properties', licenseNo: 'KA-REA-1099', isVerified: false },
      },
    },
  ],
  ['buyer1@propmatch.test', { password: 'Test@1234', user: MOCK_USER_BUYER }],
  [
    'buyer2@propmatch.test',
    {
      password: 'Test@1234',
      user: {
        userId: 13,
        fullName: 'Kiran Rao',
        email: 'buyer2@propmatch.test',
        phone: '9876500013',
        role: 'BUYER',
        isActive: true,
        createdAt: '2026-09-15T08:00:00.000Z',
      },
    },
  ],
]);

let nextMockUserId = 100;


// display-only seeds in mocks/properties.ts so create/edit/status-change can mutate it.
type MutableAgentProperty = CreatePropertyInput & { propertyId: number; status: import('@/types/api').PropertyStatus; createdAt: string };

function toAgentCard(p: MutableAgentProperty): AgentPropertyCard {
  const type = mockPropertyTypes.find((t) => t.typeId === p.typeId);
  const location = mockLocations.find((l) => l.locationId === p.locationId);
  return {
    propertyId: p.propertyId,
    title: p.title,
    listingType: p.listingType,
    price: p.price,
    pricePerSqft: Math.round((p.price / p.areaSqft) * 100) / 100,
    areaSqft: p.areaSqft,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    furnishing: p.furnishing,
    status: p.status,
    typeId: p.typeId,
    typeName: type?.typeName ?? 'Unknown',
    city: location?.city ?? 'Unknown',
    locality: location?.locality ?? 'Unknown',
    primaryImage: p.images.find((i) => i.isPrimary)?.imageUrl ?? p.images[0]?.imageUrl ?? null,
    agentName: MOCK_USER_AGENT.fullName,
    createdAt: p.createdAt,
  };
}

interface MockDb {
  currentUser: User | null;
  favoriteIds: Set<number>;
  preferences: Preferences | null;
  inquiries: Inquiry[];
  visits: Visit[];
  nextInquiryId: number;
  nextVisitId: number;
  agentProperties: MutableAgentProperty[];
  nextAgentPropertyId: number;
  adminUsers: AdminUserRow[];
  adminAgents: AdminAgentRow[];
}

const db: MockDb = {
  currentUser: null,
  favoriteIds: new Set([1, 5]),
  preferences: null,
  inquiries: [
    {
      inquiryId: 1,
      propertyId: 1,
      propertyTitle: 'Sunny 3BHK near Whitefield Metro',
      buyerId: 12,
      buyerName: 'Asha N',
      buyerEmail: 'buyer1@propmatch.test',
      message: 'Is the price negotiable?',
      status: 'NEW',
      createdAt: '2026-09-24T09:00:00.000Z',
    },
  ],
  visits: [
    {
      visitId: 1,
      propertyId: 1,
      propertyTitle: 'Sunny 3BHK near Whitefield Metro',
      buyerId: 12,
      buyerName: 'Asha N',
      scheduledAt: '2026-10-05T10:30:00.000Z',
      status: 'REQUESTED',
    },
  ],
  nextInquiryId: 2,
  nextVisitId: 2,
  agentProperties: [
    {
      propertyId: 1,
      title: 'Sunny 3BHK near Whitefield Metro',
      description: 'A well-maintained apartment in Whitefield, close to tech parks and schools.',
      listingType: 'SALE',
      price: 8500000,
      areaSqft: 1300,
      bedrooms: 3,
      bathrooms: 2,
      furnishing: 'SEMI_FURNISHED',
      typeId: 1,
      locationId: 1,
      addressLine: '101, Whitefield Main Road',
      amenityIds: [1, 3, 5, 6],
      images: [{ imageUrl: 'https://picsum.photos/seed/propmatch-10/800/600', isPrimary: true }],
      status: 'ACTIVE',
      createdAt: '2026-09-20T08:00:00.000Z',
    },
    {
      propertyId: 3,
      title: 'Independent villa with private garden',
      description: 'Spacious villa with a private garden in Indiranagar.',
      listingType: 'SALE',
      price: 21000000,
      areaSqft: 2800,
      bedrooms: 4,
      bathrooms: 4,
      furnishing: 'UNFURNISHED',
      typeId: 3,
      locationId: 3,
      addressLine: '103, Indiranagar Main Road',
      amenityIds: [1, 5, 6, 7],
      images: [{ imageUrl: 'https://picsum.photos/seed/propmatch-30/800/600', isPrimary: true }],
      status: 'ACTIVE',
      createdAt: '2026-09-10T08:00:00.000Z',
    },
    {
      propertyId: 6,
      title: 'Charming independent house, Jayanagar 4th block',
      description: 'Independent house with a garden, close to Jayanagar market.',
      listingType: 'SALE',
      price: 12500000,
      areaSqft: 1800,
      bedrooms: 3,
      bathrooms: 3,
      furnishing: 'UNFURNISHED',
      typeId: 2,
      locationId: 6,
      addressLine: '106, Jayanagar 4th Block',
      amenityIds: [1, 6, 7],
      images: [{ imageUrl: 'https://picsum.photos/seed/propmatch-60/800/600', isPrimary: true }],
      status: 'SOLD',
      createdAt: '2026-08-28T08:00:00.000Z',
    },
  ],
  nextAgentPropertyId: 13,
  adminUsers: [
    { userId: 1, fullName: 'Platform Admin', email: 'admin@propmatch.test', role: 'ADMIN', isActive: true, createdAt: '2026-01-01T08:00:00.000Z' },
    { userId: 7, fullName: 'Ravi Kumar', email: 'agent1@propmatch.test', role: 'AGENT', isActive: true, createdAt: '2026-07-01T08:00:00.000Z' },
    { userId: 8, fullName: 'Meera Iyer', email: 'agent2@propmatch.test', role: 'AGENT', isActive: true, createdAt: '2026-07-05T08:00:00.000Z' },
    { userId: 9, fullName: 'Farhan Sheikh', email: 'agent3@propmatch.test', role: 'AGENT', isActive: true, createdAt: '2026-09-01T08:00:00.000Z' },
    { userId: 12, fullName: 'Asha N', email: 'buyer1@propmatch.test', role: 'BUYER', isActive: true, createdAt: '2026-08-01T08:00:00.000Z' },
    { userId: 13, fullName: 'Kiran Rao', email: 'buyer2@propmatch.test', role: 'BUYER', isActive: true, createdAt: '2026-09-15T08:00:00.000Z' },
  ],
  adminAgents: [
    { agentId: 7, fullName: 'Ravi Kumar', email: 'agent1@propmatch.test', agencyName: 'Urban Nest Realty', licenseNo: 'KA-REA-1023', isVerified: true, totalListings: 4 },
    { agentId: 8, fullName: 'Meera Iyer', email: 'agent2@propmatch.test', agencyName: 'City Homes', licenseNo: 'KA-REA-1044', isVerified: true, totalListings: 4 },
    { agentId: 9, fullName: 'Farhan Sheikh', email: 'agent3@propmatch.test', agencyName: 'Sheikh Properties', licenseNo: 'KA-REA-1099', isVerified: false, totalListings: 4 },
  ],
};

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

function requireAuth(): User {
  if (!db.currentUser) {
    const e: Error & { status?: number; code?: string } = new Error('You must be logged in.');
    e.status = 401;
    e.code = 'UNAUTHENTICATED';
    throw e;
  }
  return db.currentUser;
}

function requireRole(...roles: Array<User['role']>): User {
  const user = requireAuth();
  if (!roles.includes(user.role)) {
    const e: Error & { status?: number; code?: string } = new Error("You don't have access to do that.");
    e.status = 403;
    e.code = 'FORBIDDEN';
    throw e;
  }
  return user;
}

function applyFilters(cards: ReturnType<typeof getMockCards>, filters: PropertyFilters) {
  let result = cards;
  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter((c) => c.title.toLowerCase().includes(q));
  }
  if (filters.city) result = result.filter((c) => c.city === filters.city);
  if (filters.locality) result = result.filter((c) => c.locality === filters.locality);
  if (filters.listingType) result = result.filter((c) => c.listingType === filters.listingType);
  if (filters.typeId?.length) result = result.filter((c) => filters.typeId!.includes(c.typeId));
  if (filters.minPrice !== undefined) result = result.filter((c) => c.price >= filters.minPrice!);
  if (filters.maxPrice !== undefined) result = result.filter((c) => c.price <= filters.maxPrice!);
  if (filters.minBedrooms !== undefined) result = result.filter((c) => c.bedrooms >= filters.minBedrooms!);
  if (filters.furnishing) result = result.filter((c) => c.furnishing === filters.furnishing);

  switch (filters.sort) {
    case 'price_asc':
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      result = [...result].sort((a, b) => b.price - a.price);
      break;
    case 'area_desc':
      result = [...result].sort((a, b) => b.areaSqft - a.areaSqft);
      break;
    default:
      result = [...result].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  return result;
}

export const mockApi = {
  // ---- auth ----
  async login(email: string, password: string): Promise<User> {
    await delay();
    const account = registeredAccounts.get(email.trim().toLowerCase());
    if (!account || account.password !== password) {
      // Same message whether the email or password is wrong (spec Section 12.9).
      const e: Error & { status?: number; code?: string } = new Error('Incorrect email or password.');
      e.status = 401;
      e.code = 'INVALID_CREDENTIALS';
      throw e;
    }
    if (!account.user.isActive) {
      const e: Error & { status?: number; code?: string } = new Error('This account has been deactivated.');
      e.status = 403;
      e.code = 'ACCOUNT_DEACTIVATED';
      throw e;
    }
    db.currentUser = account.user;
    return db.currentUser;
  },
  async register(input: RegisterInput): Promise<User> {
    await delay();
    const email = input.email.trim().toLowerCase();
    if (registeredAccounts.has(email)) {
      const e: Error & { status?: number; code?: string } = new Error('An account with this email already exists.');
      e.status = 409;
      e.code = 'ALREADY_EXISTS';
      throw e;
    }
    const user: User = {
      userId: nextMockUserId++,
      fullName: input.fullName,
      email,
      phone: input.phone ?? null,
      role: input.role,
      isActive: true,
      createdAt: new Date().toISOString(),
      ...(input.role === 'AGENT'
        ? { agentProfile: { agencyName: input.agencyName ?? '', licenseNo: input.licenseNo ?? '', isVerified: false } }
        : {}),
    };
    registeredAccounts.set(email, { password: input.password, user });
    db.currentUser = user;
    return user;
  },
  async logout(): Promise<void> {
    await delay(100);
    db.currentUser = null;
  },
  async me(): Promise<User | null> {
    await delay(100);
    return db.currentUser;
  },

  // ---- properties ----
  async listProperties(filters: PropertyFilters) {
    await delay();
    const cards = applyFilters(getMockCards(db.favoriteIds), filters);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 12;
    const start = (page - 1) * limit;
    const items = cards.slice(start, start + limit);
    return { items, meta: { page, limit, total: cards.length, totalPages: Math.max(1, Math.ceil(cards.length / limit)) } };
  },
  async getProperty(id: number) {
    await delay();
    return getMockDetail(id, db.favoriteIds);
  },
  async getSimilar(id: number) {
    await delay();
    return getMockSimilar(id, db.favoriteIds);
  },

  // ---- favorites ----
  async listFavorites() {
    await delay();
    requireAuth();
    return getMockCards(db.favoriteIds).filter((c) => db.favoriteIds.has(c.propertyId));
  },
  async addFavorite(propertyId: number) {
    await delay(150);
    requireAuth();
    db.favoriteIds.add(propertyId);
    return { propertyId, isFavorite: true };
  },
  async removeFavorite(propertyId: number) {
    await delay(150);
    requireAuth();
    db.favoriteIds.delete(propertyId);
  },

  // ---- preferences & recommendations ----
  async getPreferences() {
    await delay();
    requireAuth();
    return db.preferences;
  },
  async savePreferences(prefs: Preferences) {
    await delay();
    requireAuth();
    db.preferences = prefs;
    return prefs;
  },
  async getRecommendations() {
    await delay();
    requireAuth();
    return getMockRecommendations(db.favoriteIds);
  },

  // ---- inquiries & visits ----
  async listInquiries() {
    await delay();
    requireAuth();
    return db.inquiries;
  },
  async createInquiry(input: CreateInquiryInput) {
    await delay();
    const user = requireAuth();
    const property = getMockDetail(input.propertyId);
    const inquiry: Inquiry = {
      inquiryId: db.nextInquiryId++,
      propertyId: input.propertyId,
      propertyTitle: property?.title ?? 'Property',
      buyerId: user.userId,
      buyerName: user.fullName,
      buyerEmail: user.email,
      message: input.message,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };
    db.inquiries = [inquiry, ...db.inquiries];
    return inquiry;
  },
  async listVisits() {
    await delay();
    requireAuth();
    return db.visits;
  },
  async createVisit(input: CreateVisitInput) {
    await delay();
    const user = requireAuth();
    const conflict = db.visits.some(
      (v) =>
        v.propertyId === input.propertyId &&
        v.status !== 'CANCELLED' &&
        Math.abs(+new Date(v.scheduledAt) - +new Date(input.scheduledAt)) < 59 * 60 * 1000,
    );
    if (conflict) {
      const e: Error & { status?: number; code?: string } = new Error('That slot is already booked. Please choose another time.');
      e.status = 409;
      e.code = 'SLOT_ALREADY_BOOKED';
      throw e;
    }
    if (new Date(input.scheduledAt).getTime() <= Date.now()) {
      const e: Error & { status?: number; code?: string } = new Error('Please choose a time in the future.');
      e.status = 400;
      e.code = 'VISIT_MUST_BE_IN_FUTURE';
      throw e;
    }
    const property = getMockDetail(input.propertyId);
    const visit: Visit = {
      visitId: db.nextVisitId++,
      propertyId: input.propertyId,
      propertyTitle: property?.title ?? 'Property',
      buyerId: user.userId,
      buyerName: user.fullName,
      scheduledAt: input.scheduledAt,
      status: 'REQUESTED',
    };
    db.visits = [visit, ...db.visits];
    return visit;
  },
  async cancelVisit(visitId: number) {
    await delay(150);
    requireAuth();
    db.visits = db.visits.map((v) => (v.visitId === visitId ? { ...v, status: 'CANCELLED' as const } : v));
  },

  // ---- agent: listings ----
  async listAgentProperties(): Promise<AgentPropertyCard[]> {
    await delay();
    requireRole('AGENT');
    return db.agentProperties.map(toAgentCard).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },
  async getAgentProperty(id: number): Promise<MutableAgentProperty | null> {
    await delay();
    requireRole('AGENT');
    return db.agentProperties.find((p) => p.propertyId === id) ?? null;
  },
  async createAgentProperty(input: CreatePropertyInput): Promise<AgentPropertyCard> {
    await delay();
    requireRole('AGENT');
    const property: MutableAgentProperty = { ...input, propertyId: db.nextAgentPropertyId++, status: 'ACTIVE', createdAt: new Date().toISOString() };
    db.agentProperties = [property, ...db.agentProperties];
    return toAgentCard(property);
  },
  async updateAgentProperty(id: number, input: UpdatePropertyInput): Promise<AgentPropertyCard> {
    await delay();
    requireRole('AGENT');
    let updated: MutableAgentProperty | undefined;
    db.agentProperties = db.agentProperties.map((p) => {
      if (p.propertyId !== id) return p;
      updated = { ...p, ...input };
      return updated;
    });
    if (!updated) {
      const e: Error & { status?: number; code?: string } = new Error('Property not found.');
      e.status = 404;
      e.code = 'NOT_FOUND';
      throw e;
    }
    return toAgentCard(updated);
  },
  async setPropertyStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<void> {
    await delay(150);
    requireRole('AGENT', 'ADMIN');
    db.agentProperties = db.agentProperties.map((p) => (p.propertyId === id ? { ...p, status } : p));
  },
  async closeProperty(id: number): Promise<void> {
    await delay(150);
    requireRole('AGENT', 'ADMIN');
    db.agentProperties = db.agentProperties.map((p) =>
      p.propertyId === id ? { ...p, status: p.listingType === 'SALE' ? 'SOLD' : 'RENTED' } : p,
    );
    db.visits = db.visits.map((v) => (v.propertyId === id && v.status !== 'CANCELLED' ? { ...v, status: 'CANCELLED' as const } : v));
    db.inquiries = db.inquiries.map((i) => (i.propertyId === id ? { ...i, status: 'CLOSED' as const } : i));
  },

  // ---- agent: stats, inquiries & visits on own listings ----
  async getAgentStats(): Promise<AgentStats> {
    await delay();
    requireRole('AGENT');
    const ownIds = new Set(db.agentProperties.map((p) => p.propertyId));
    const ownInquiries = db.inquiries.filter((i) => ownIds.has(i.propertyId));
    const ownVisits = db.visits.filter((v) => ownIds.has(v.propertyId));
    const inquiriesByStatus = { NEW: 0, CONTACTED: 0, CLOSED: 0 } as Record<InquiryStatus, number>;
    ownInquiries.forEach((i) => inquiriesByStatus[i.status]++);
    const visitsByStatus = { REQUESTED: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 } as Record<VisitStatus, number>;
    ownVisits.forEach((v) => visitsByStatus[v.status]++);
    const activeListings = db.agentProperties.filter((p) => p.status === 'ACTIVE').length;
    const closedListings = db.agentProperties.filter((p) => p.status === 'SOLD' || p.status === 'RENTED').length;
    const avgListingPrice = db.agentProperties.length
      ? Math.round(db.agentProperties.reduce((sum, p) => sum + p.price, 0) / db.agentProperties.length)
      : 0;
    return {
      totalListings: db.agentProperties.length,
      activeListings,
      closedListings,
      totalInquiries: ownInquiries.length,
      totalVisits: ownVisits.length,
      avgListingPrice,
      inquiriesByStatus,
      visitsByStatus,
    };
  },
  async listAgentInquiries(): Promise<Inquiry[]> {
    await delay();
    requireRole('AGENT');
    const ownIds = new Set(db.agentProperties.map((p) => p.propertyId));
    return db.inquiries.filter((i) => ownIds.has(i.propertyId));
  },
  async updateInquiryStatus(id: number, status: InquiryStatus): Promise<void> {
    await delay(150);
    requireRole('AGENT', 'ADMIN');
    db.inquiries = db.inquiries.map((i) => (i.inquiryId === id ? { ...i, status } : i));
  },
  async listAgentVisits(): Promise<Visit[]> {
    await delay();
    requireRole('AGENT');
    const ownIds = new Set(db.agentProperties.map((p) => p.propertyId));
    return db.visits.filter((v) => ownIds.has(v.propertyId));
  },
  async updateVisitStatus(id: number, status: VisitStatus): Promise<void> {
    await delay(150);
    requireRole('AGENT', 'ADMIN');
    db.visits = db.visits.map((v) => (v.visitId === id ? { ...v, status } : v));
  },

  // ---- admin ----
  async listAdminUsers(): Promise<AdminUserRow[]> {
    await delay();
    requireRole('ADMIN');
    return db.adminUsers;
  },
  async setUserActive(userId: number, isActive: boolean): Promise<void> {
    await delay(150);
    requireRole('ADMIN');
    db.adminUsers = db.adminUsers.map((u) => (u.userId === userId ? { ...u, isActive } : u));
  },
  async listAdminAgents(): Promise<AdminAgentRow[]> {
    await delay();
    requireRole('ADMIN');
    return db.adminAgents;
  },
  async setAgentVerified(agentId: number, isVerified: boolean): Promise<void> {
    await delay(150);
    requireRole('ADMIN');
    db.adminAgents = db.adminAgents.map((a) => (a.agentId === agentId ? { ...a, isVerified } : a));
  },
  async listAdminProperties(): Promise<AgentPropertyCard[]> {
    await delay();
    requireRole('ADMIN');
    // Demo scope: admin moderation view shows the mock agent's editable listings.
    // The real API returns every property from every agent, any status.
    return db.agentProperties.map(toAgentCard);
  },
  async getAdminAnalytics(): Promise<AdminAnalytics> {
    await delay();
    requireRole('ADMIN');
    const allCards = getMockCards();
    const byLocality = new Map<string, { city: string; locality: string; listings: number; totalPricePerSqft: number }>();
    allCards.forEach((c) => {
      const key = `${c.city}|${c.locality}`;
      const entry = byLocality.get(key) ?? { city: c.city, locality: c.locality, listings: 0, totalPricePerSqft: 0 };
      entry.listings += 1;
      entry.totalPricePerSqft += c.pricePerSqft;
      byLocality.set(key, entry);
    });
    return {
      totals: {
        users: db.adminUsers.length,
        agents: db.adminAgents.length,
        activeListings: allCards.filter((c) => c.status === 'ACTIVE').length,
        inquiries: db.inquiries.length,
        visits: db.visits.length,
      },
      avgPricePerSqftByLocality: Array.from(byLocality.values())
        .map((e) => ({ city: e.city, locality: e.locality, listings: e.listings, avgPricePerSqft: Math.round(e.totalPricePerSqft / e.listings) }))
        .sort((a, b) => b.avgPricePerSqft - a.avgPricePerSqft),
      topAgents: db.adminAgents
        .map((a) => ({ agentId: a.agentId, agentName: a.fullName, totalListings: a.totalListings, totalInquiries: db.inquiries.filter((i) => i.propertyId <= 4).length }))
        .sort((a, b) => b.totalListings - a.totalListings),
      trendingProperties: allCards.slice(0, 5).map((c, i) => ({ propertyId: c.propertyId, title: c.title, views: 120 - i * 15, uniqueViewers: 60 - i * 7 })),
      topSearchedCities: [{ city: 'Bengaluru', searches: 210 }],
      inquiryStatusBreakdown: (() => {
        const r = { NEW: 0, CONTACTED: 0, CLOSED: 0 } as Record<InquiryStatus, number>;
        db.inquiries.forEach((i) => r[i.status]++);
        return r;
      })(),
    };
  },
};
