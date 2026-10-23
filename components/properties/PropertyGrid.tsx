import type { PropertyCard as PropertyCardType, RecommendedProperty } from '@/types/api';
import PropertyCard from './PropertyCard';
import EmptyState from '@/components/ui/EmptyState';

export default function PropertyGrid({
  properties,
  emptyTitle = 'No properties found',
  emptyDescription = 'Try adjusting your filters or search terms.',
}: {
  properties: (PropertyCardType | RecommendedProperty)[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (properties.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((p) => (
        <PropertyCard key={p.propertyId} property={p} />
      ))}
    </div>
  );
}
