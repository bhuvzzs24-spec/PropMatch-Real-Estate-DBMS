import type { Furnishing, ListingType, PropertyFilters, SortOption } from '@/types/api';

const numList = (v: string | null): number[] | undefined => {
  if (!v) return undefined;
  const list = v.split(',').map(Number).filter((n) => Number.isFinite(n) && n > 0);
  return list.length ? list : undefined;
};
const num = (v: string | null): number | undefined => {
  if (v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export function parseFilters(sp: URLSearchParams): PropertyFilters {
  const listingType = sp.get('listingType');
  const furnishing = sp.get('furnishing');
  const sort = sp.get('sort');
  return {
    q: sp.get('q') || undefined,
    city: sp.get('city') || undefined,
    locality: sp.get('locality') || undefined,
    listingType: listingType === 'SALE' || listingType === 'RENT' ? (listingType as ListingType) : undefined,
    typeId: numList(sp.get('typeId')),
    minPrice: num(sp.get('minPrice')),
    maxPrice: num(sp.get('maxPrice')),
    minBedrooms: num(sp.get('minBedrooms')),
    furnishing:
      furnishing === 'UNFURNISHED' || furnishing === 'SEMI_FURNISHED' || furnishing === 'FURNISHED'
        ? (furnishing as Furnishing)
        : undefined,
    amenityIds: numList(sp.get('amenityIds')),
    sort:
      sort === 'newest' || sort === 'price_asc' || sort === 'price_desc' || sort === 'area_desc'
        ? (sort as SortOption)
        : undefined,
    page: num(sp.get('page')) ?? 1,
  };
}

export function filtersToParams(f: PropertyFilters): URLSearchParams {
  const sp = new URLSearchParams();
  (Object.entries(f) as [string, unknown][]).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      if (value.length) sp.set(key, value.join(','));
      return;
    }
    if (key === 'page' && value === 1) return;
    sp.set(key, String(value));
  });
  return sp;
}
