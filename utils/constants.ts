import type { Furnishing, InquiryStatus, ListingType, PropertyStatus, SortOption, VisitStatus } from '@/types/api';

export const LISTING_TYPE_LABELS: Record<ListingType, string> = { SALE: 'For Sale', RENT: 'For Rent' };

export const FURNISHING_LABELS: Record<Furnishing, string> = {
  UNFURNISHED: 'Unfurnished',
  SEMI_FURNISHED: 'Semi-furnished',
  FURNISHED: 'Furnished',
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'area_desc', label: 'Largest area' },
];

export const BEDROOM_OPTIONS = [1, 2, 3, 4];

// Colour map for every status enum in spec Section 18.2
export const STATUS_STYLES: Record<PropertyStatus | InquiryStatus | VisitStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  SOLD: 'bg-rose-100 text-rose-800',
  RENTED: 'bg-rose-100 text-rose-800',
  INACTIVE: 'bg-slate-200 text-slate-700',
  NEW: 'bg-sky-100 text-sky-800',
  CONTACTED: 'bg-amber-100 text-amber-800',
  CLOSED: 'bg-slate-200 text-slate-700',
  REQUESTED: 'bg-sky-100 text-sky-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-teal-100 text-teal-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
};

export const SESSION_COOKIE = 'propmatch_token';
