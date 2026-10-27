'use client';

import Link from 'next/link';
import { useApi } from '@/hooks/useApi';
import * as favoritesService from '@/services/favorites';
import PropertyGrid from '@/components/properties/PropertyGrid';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, reload } = useApi(() => favoritesService.listFavorites(), 'favorites', {
    keepPrevious: false,
  });

  useEffect(() => {
    const handleFavoriteRemoved = () => {
      reload();
    };

    window.addEventListener('propmatch:favorite-removed', handleFavoriteRemoved);

    return () => {
      window.removeEventListener('propmatch:favorite-removed', handleFavoriteRemoved);
    };
  }, [reload]);

  if (authLoading) return <div className="mx-auto max-w-6xl px-4 py-8"><LoadingState /></div>;

  if (!user || user.role !== 'BUYER') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <EmptyState
          title="Log in as a buyer to see your favourites"
          action={
            <Link href="/login?next=/favorites" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Log in
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Saved homes</h1>
      {loading && <LoadingState />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && !error && (
        <PropertyGrid
          properties={data}
          emptyTitle="No favourites yet"
          emptyDescription="Tap the heart icon on any listing to save it here."
        />
      )}
    </div>
  );
}
