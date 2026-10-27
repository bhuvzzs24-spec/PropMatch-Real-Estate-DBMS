import { CheckCircle2 } from 'lucide-react';
import type { Amenity } from '@/types/api';

export default function AmenityChips({ amenities }: { amenities: Amenity[] }) {
  if (amenities.length === 0) return <p className="text-sm text-slate-500">No amenities listed.</p>;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {amenities.map((a) => (
        <span key={a.amenityId} className="flex items-center gap-1.5 text-sm text-slate-700">
          <CheckCircle2 size={15} className="text-emerald-600" />
          {a.amenityName}
        </span>
      ))}
    </div>
  );
}
