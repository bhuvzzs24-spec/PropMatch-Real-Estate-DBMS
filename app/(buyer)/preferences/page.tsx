'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Amenity, Furnishing, ListingType, Preferences, PropertyType } from '@/types/api';
import { getAmenities, getLocations, getPropertyTypes } from '@/services/reference';
import * as preferencesService from '@/services/preferences';
import { FURNISHING_LABELS, BEDROOM_OPTIONS } from '@/utils/constants';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';

const EMPTY: Preferences = {
  listingType: 'SALE',
  budgetMin: null,
  budgetMax: null,
  preferredCities: [],
  preferredLocalities: [],
  preferredTypeIds: [],
  minBedrooms: null,
  furnishing: null,
  mustHaveAmenityIds: [],
};

export default function PreferencesPage() {
  const { user, loading: authLoading } = useAuth();
  const showToast = useToast();

  const [types, setTypes] = useState<PropertyType[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [form, setForm] = useState<Preferences>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'BUYER') return;
    Promise.all([getPropertyTypes(), getAmenities(), getLocations(), preferencesService.getPreferences()]).then(
      ([t, a, locs, prefs]) => {
        setTypes(t);
        setAmenities(a);
        setCities(Array.from(new Set(locs.map((l) => l.city))));
        setForm(prefs ?? EMPTY);
        setLoading(false);
      },
    );
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await preferencesService.savePreferences(form);
      showToast('Preferences saved. Recommendations updated.', 'success');
    } catch {
      showToast('Could not save preferences. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) return <div className="mx-auto max-w-2xl px-4 py-8"><LoadingState /></div>;

  if (!user || user.role !== 'BUYER') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <EmptyState
          title="Log in as a buyer to set preferences"
          action={
            <Link href="/login?next=/preferences" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Log in
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-8"><LoadingState /></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Your preferences</h1>
      <p className="mb-6 text-sm text-slate-500">Used to compute your match score and personalise recommendations.</p>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">I&apos;m looking to</p>
          <div className="flex gap-2">
            {(['SALE', 'RENT'] as ListingType[]).map((lt) => (
              <button
                type="button"
                key={lt}
                onClick={() => setForm((f) => ({ ...f, listingType: lt }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                  form.listingType === lt ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-600'
                }`}
              >
                {lt === 'SALE' ? 'Buy' : 'Rent'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">Budget (₹)</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={form.budgetMin ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, budgetMin: e.target.value ? Number(e.target.value) : null }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="text-slate-400">–</span>
            <input
              type="number"
              placeholder="Max"
              value={form.budgetMax ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, budgetMax: e.target.value ? Number(e.target.value) : null }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">Preferred cities</p>
          <div className="flex flex-wrap gap-2">
            {cities.map((c) => {
              const checked = form.preferredCities.includes(c);
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      preferredCities: checked ? f.preferredCities.filter((x) => x !== c) : [...f.preferredCities, c],
                    }))
                  }
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    checked ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-600'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">Minimum bedrooms</p>
          <div className="flex gap-2">
            {BEDROOM_OPTIONS.map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setForm((f) => ({ ...f, minBedrooms: f.minBedrooms === n ? null : n }))}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  form.minBedrooms === n ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-600'
                }`}
              >
                {n}+
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">Property type</p>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => {
              const checked = form.preferredTypeIds.includes(t.typeId);
              return (
                <button
                  type="button"
                  key={t.typeId}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      preferredTypeIds: checked
                        ? f.preferredTypeIds.filter((id) => id !== t.typeId)
                        : [...f.preferredTypeIds, t.typeId],
                    }))
                  }
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    checked ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-600'
                  }`}
                >
                  {t.typeName}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">Furnishing</p>
          <select
            value={form.furnishing ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, furnishing: (e.target.value || null) as Furnishing | null }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">No preference</option>
            {Object.entries(FURNISHING_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">Must-have amenities</p>
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => {
              const checked = form.mustHaveAmenityIds.includes(a.amenityId);
              return (
                <button
                  type="button"
                  key={a.amenityId}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      mustHaveAmenityIds: checked
                        ? f.mustHaveAmenityIds.filter((id) => id !== a.amenityId)
                        : [...f.mustHaveAmenityIds, a.amenityId],
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

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save preferences'}
        </button>
      </form>
    </div>
  );
}
