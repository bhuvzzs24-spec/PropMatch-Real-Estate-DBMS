import { Suspense } from 'react';
import PropertiesPageClient from './PropertiesPageClient';
import { CardGridSkeleton } from '@/components/ui/LoadingState';

export const metadata = { title: 'Browse properties — PropMatch' };

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-8"><CardGridSkeleton /></div>}>
      <PropertiesPageClient />
    </Suspense>
  );
}
