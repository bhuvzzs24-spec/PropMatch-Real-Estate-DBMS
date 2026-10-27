'use client';

import { useEffect, useState } from 'react';
import type { Amenity, Furnishing, ListingType, PropertyFilters, PropertyType } from '@/types/api';
import { getAmenities, getPropertyTypes } from '@/services/reference';
import { FURNISHING_LABELS, BEDROOM_OPTIONS } from '@/utils/constants';

export default function FilterSidebar({
  filters,
  onChange,
}: {
  filters: PropertyFilters;
  onChange: (next: PropertyFilters) => void;
}) {
  const [types, setTypes] = useState<PropertyType[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  useEffect(() => {
    getPropertyTypes().then(setTypes).catch(() => setTypes([]));
    getAmenities().then(setAmenities).catch(() => setAmenities([]));
  }, []);

  const set = (patch: Partial<PropertyFilters>) => onChange({ ...filters, ...patch, page: 1 });

  return (
    <aside className="w-full shrink-0 space-y-6 rounded-xl border border-slate-200 bg-white p-4 lg:w-64">
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-900">Listing type</p>
        <div className="flex gap-2">
          {(['SALE', 'RENT'] as ListingType[]).map((lt) => (
            <button
              key={lt}
              onClick={() => set({ listingType: filters.listingType === lt ? undefined : lt })}
              className={`flex-1 rounded-lg border px-3 py-1.5 text-sm ${
                filters.listingType === lt
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {lt === 'SALE' ? 'Buy' : 'Rent'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-900">Price range (₹)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) => set({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-900">Bedrooms</p>
        <div className="flex flex-wrap gap-2">
          {BEDROOM_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => set({ minBedrooms: filters.minBedrooms === n ? undefined : n })}
              className={`rounded-lg border px-3 py-1 text-sm ${
                filters.minBedrooms === n
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {n}+
            </button>
          ))}
        </div>
      </div>

      {types.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">Property type</p>
          <div className="space-y-1.5">
            {types.map((t, index) => (
             <label key={`${t.typeId}-${index}`} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="radio"
                  name="typeId"
                  checked={filters.typeId?.[0] === t.typeId}
                  onChange={() => set({ typeId: [t.typeId] })}
                  className="accent-emerald-600"
                />
                {t.typeName}
              </label>
            ))}
            {filters.typeId?.length ? (
              <button onClick={() => set({ typeId: undefined })} className="text-xs text-emerald-700 underline">
                Clear
              </button>
            ) : null}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-900">Furnishing</p>
        <select
          value={filters.furnishing ?? ''}
          onChange={(e) => set({ furnishing: (e.target.value || undefined) as Furnishing | undefined })}
          className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">Any</option>
          {Object.entries(FURNISHING_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {amenities.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">Amenities</p>
          <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
            {amenities.map((a) => {
              const checked = filters.amenityIds?.includes(a.amenityId) ?? false;
              return (
                <label key={a.amenityId} className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const current = filters.amenityIds ?? [];
                      const next = checked ? current.filter((id) => id !== a.amenityId) : [...current, a.amenityId];
                      set({ amenityIds: next.length ? next : undefined });
                    }}
                    className="accent-emerald-600"
                  />
                  {a.amenityName}
                </label>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => onChange({ page: 1 })}
        className="w-full rounded-lg border border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50"
      >
        Clear all filters
      </button>
    </aside>
  );
}
