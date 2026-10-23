'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar({
  initialValue = '',
  onSearch,
  placeholder = 'Search by title or description...',
}: {
  initialValue?: string;
  onSearch: (q: string) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value.trim());
      }}
      className="flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500"
    >
      <Search size={18} className="text-slate-400" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm outline-none placeholder:text-slate-400"
      />
      <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">
        Search
      </button>
    </form>
  );
}
