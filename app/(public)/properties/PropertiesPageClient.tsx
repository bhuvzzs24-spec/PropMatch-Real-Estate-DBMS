'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { PropertyFilters } from '@/types/api';
import { parseFilters, filtersToParams } from '@/utils/filters';
import { listProperties } from '@/services/properties';
import { useApi } from '@/hooks/useApi';
import FilterSidebar from '@/components/properties/FilterSidebar';
import SearchBar from '@/components/properties/SearchBar';
import SortSelect from '@/components/properties/SortSelect';
import PropertyGrid from '@/components/properties/PropertyGrid';
import Pagination from '@/components/ui/Pagination';
import { CardGridSkeleton } from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';

export default function PropertiesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const applyFilters = useCallback(
    (next: PropertyFilters) => {
      router.push(`/properties?${filtersToParams(next).toString()}`);
    },
    [router],
  );

  const { data, loading, error, reload } = useApi(() => listProperties(filters), JSON.stringify(filters));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <SearchBar initialValue={filters.q ?? ''} onSearch={(q) => applyFilters({ ...filters, q: q || undefined, page: 1 })} />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <FilterSidebar filters={filters} onChange={applyFilters} />

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {data ? `${data.meta.total} propert${data.meta.total === 1 ? 'y' : 'ies'} found` : 'Searching...'}
            </p>
            <SortSelect value={filters.sort ?? 'newest'} onChange={(sort) => applyFilters({ ...filters, sort })} />
          </div>

          {loading && !data && <CardGridSkeleton />}
          {error && <ErrorState message={error.message} onRetry={reload} />}
          {data && !error && (
            <>
              <PropertyGrid properties={data.items} />
              <Pagination meta={data.meta} onChange={(page) => applyFilters({ ...filters, page })} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
