'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Amenity, CreatePropertyInput, Furnishing, ListingType, LocationItem, PropertyType } from '@/types/api';
import { getAmenities, getLocations, getPropertyTypes } from '@/services/reference';
import { FURNISHING_LABELS } from '@/utils/constants';
import { useToast } from '@/components/ui/Toast';

const EMPTY: CreatePropertyInput = {
  title: '',
  description: '',
  listingType: 'SALE',
  price: 0,
  areaSqft: 0,
  bedrooms: 1,
  bathrooms: 1,
  furnishing: 'UNFURNISHED',
  typeId: 0,
  locationId: 0,
  addressLine: '',
  amenityIds: [],
  images: [],
};

export default function PropertyForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: CreatePropertyInput;
  onSubmit: (input: CreatePropertyInput) => Promise<void>;
  submitLabel: string;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [form, setForm] = useState<CreatePropertyInput>(initial ?? EMPTY);
  const [imageUrl, setImageUrl] = useState('');
  const [types, setTypes] = useState<PropertyType[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getPropertyTypes(), getAmenities(), getLocations()]).then(([t, a, l]) => {
      setTypes(t);
      setAmenities(a);
      setLocations(l);
      setForm((f) => (f.typeId ? f : { ...f, typeId: t[0]?.typeId ?? 0, locationId: l[0]?.locationId ?? 0 }));
    });
  }, []);

  function addImage() {
    if (!imageUrl.trim()) return;
    setForm((f) => ({
      ...f,
      images: [...f.images, { imageUrl: imageUrl.trim(), isPrimary: f.images.length === 0 }],
    }));
    setImageUrl('');
  }

  function removeImage(idx: number) {
    setForm((f) => {
      const images = f.images.filter((_, i) => i !== idx);
      if (images.length && !images.some((i) => i.isPrimary)) images[0].isPrimary = true;
      return { ...f, images };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || form.description.trim().length < 10) {
      setError('Add a title and a description of at least 10 characters.');
      return;
    }
    if (form.price <= 0 || form.areaSqft <= 0) {
      setError('Price and area must be greater than 0.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
      showToast('Listing saved', 'success');
      router.push('/agent/properties');
    } catch {
      setError('Could not save the listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Sunny 3BHK near Whitefield Metro"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Listing type</label>
          <div className="flex gap-2">
            {(['SALE', 'RENT'] as ListingType[]).map((lt) => (
              <button
                key={lt}
                type="button"
                onClick={() => setForm((f) => ({ ...f, listingType: lt }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                  form.listingType === lt ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-600'
                }`}
              >
                {lt === 'SALE' ? 'Sale' : 'Rent'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Price (₹{form.listingType === 'RENT' ? '/month' : ''})</label>
          <input
            type="number"
            min={0}
            value={form.price || ''}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Area (sqft)</label>
          <input
            type="number"
            min={0}
            value={form.areaSqft || ''}
            onChange={(e) => setForm((f) => ({ ...f, areaSqft: Number(e.target.value) }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Bedrooms</label>
          <input
            type="number"
            min={0}
            value={form.bedrooms}
            onChange={(e) => setForm((f) => ({ ...f, bedrooms: Number(e.target.value) }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Bathrooms</label>
          <input
            type="number"
            min={0}
            value={form.bathrooms}
            onChange={(e) => setForm((f) => ({ ...f, bathrooms: Number(e.target.value) }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Property type</label>
          <select
            value={form.typeId}
            onChange={(e) => setForm((f) => ({ ...f, typeId: Number(e.target.value) }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {types.map((t, index) => (
              <option key={`type-${t.typeId ?? 'unknown'}-${index}`} value={t.typeId}>
                {t.typeName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Furnishing</label>
          <select
            value={form.furnishing}
            onChange={(e) => setForm((f) => ({ ...f, furnishing: e.target.value as Furnishing }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {Object.entries(FURNISHING_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
        <select
          value={form.locationId}
          onChange={(e) => setForm((f) => ({ ...f, locationId: Number(e.target.value) }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {locations.map((l) => (
            <option key={l.locationId} value={l.locationId}>
              {l.locality}, {l.city}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Address line (optional)</label>
        <input
          value={form.addressLine}
          onChange={(e) => setForm((f) => ({ ...f, addressLine: e.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Amenities</p>
        <div className="flex flex-wrap gap-2">
          {amenities.map((a) => {
            const checked = form.amenityIds.includes(a.amenityId);
            return (
              <button
                type="button"
                key={a.amenityId}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    amenityIds: checked ? f.amenityIds.filter((id) => id !== a.amenityId) : [...f.amenityIds, a.amenityId],
                  }))
                }
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  checked ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-600'
                }`}
              >
                {a.amenityName}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Images (paste a URL)</p>
        <div className="flex gap-2">
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="button" onClick={addImage} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Add
          </button>
        </div>
        {form.images.length > 0 && (
          <ul className="mt-2 space-y-1">
            {form.images.map((img, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                <span className="truncate">{img.isPrimary ? '★ ' : ''}{img.imageUrl}</span>
                <button type="button" onClick={() => removeImage(i)} className="ml-2 text-rose-600 hover:underline">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
