import { BedDouble, Bath, Ruler, Building2, Sofa } from 'lucide-react';
import type { PropertyDetail } from '@/types/api';
import { FURNISHING_LABELS } from '@/utils/constants';
import { formatArea } from '@/utils/format';

export default function SpecTable({ property }: { property: PropertyDetail }) {
  const specs = [
    property.bedrooms > 0 && { icon: BedDouble, label: 'Bedrooms', value: property.bedrooms },
    property.bathrooms > 0 && { icon: Bath, label: 'Bathrooms', value: property.bathrooms },
    { icon: Ruler, label: 'Area', value: formatArea(property.areaSqft) },
    { icon: Building2, label: 'Type', value: property.typeName },
    { icon: Sofa, label: 'Furnishing', value: FURNISHING_LABELS[property.furnishing] },
  ].filter(Boolean) as { icon: typeof BedDouble; label: string; value: string | number }[];

  return (
    <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
      {specs.map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <s.icon size={18} className="text-emerald-600" />
          <div>
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-sm font-medium text-slate-900">{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
