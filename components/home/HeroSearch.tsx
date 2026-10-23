'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';
import type { ListingType } from '@/types/api';

export default function HeroSearch() {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingType>('SALE');
  const [city, setCity] = useState('Bengaluru');
  const [q, setQ] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams({ listingType, city });
    if (q.trim()) sp.set('q', q.trim());
    router.push(`/properties?${sp.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-2xl flex-col gap-3 rounded-2xl bg-white p-4 shadow-lg sm:flex-row sm:items-center">
      <div className="flex rounded-lg border border-slate-200 p-1">
        {(['SALE', 'RENT'] as ListingType[]).map((lt) => (
          <button
            key={lt}
            type="button"
            onClick={() => setListingType(lt)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              listingType === lt ? 'bg-emerald-600 text-white' : 'text-slate-500'
            }`}
          >
            {lt === 'SALE' ? 'Buy' : 'Rent'}
          </button>
        ))}
      </div>
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-32"
      />
      <div className="flex w-full items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
        <Search size={16} className="text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Locality, project or keyword"
          className="w-full text-sm outline-none placeholder:text-slate-400"
        />
      </div>
      <button type="submit" className="w-full shrink-0 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 sm:w-auto">
        Search
      </button>
    </form>
  );
}
