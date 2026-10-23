import type { PropertyCard as PropertyCardType } from '@/types/api';
import PropertyCard from './PropertyCard';

export default function SimilarProperties({ properties }: { properties: PropertyCardType[] }) {
  if (properties.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Similar properties</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <PropertyCard key={p.propertyId} property={p} />
        ))}
      </div>
    </section>
  );
}
