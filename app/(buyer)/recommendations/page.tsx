'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { getRecommendations } from '@/services/recommendations';
import PropertyGrid from '@/components/properties/PropertyGrid';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';

export default function RecommendationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, reload } = useApi(() => getRecommendations(12), 'recommendations', { keepPrevious: false });

  if (authLoading) return <div className="mx-auto max-w-6xl px-4 py-8"><LoadingState /></div>;

  if (!user || user.role !== 'BUYER') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <EmptyState
          title="Log in as a buyer to see recommendations"
          action={
            <Link href="/login?next=/recommendations" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Log in
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="text-emerald-600" size={22} />
        <h1 className="text-2xl font-bold text-slate-900">For you</h1>
      </div>
      <p className="mb-6 text-sm text-slate-500">
        Ranked using your saved preferences and recent activity.{' '}
        <Link href="/preferences" className="font-medium text-emerald-700 hover:underline">
          Update preferences
        </Link>
      </p>
      {loading && <LoadingState label="Finding your matches..." />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && !error && (
        <PropertyGrid
          properties={data}
          emptyTitle="No recommendations yet"
          emptyDescription="Set your preferences so we can find homes that match you."
        />
      )}
    </div>
  );
}
