import Image from 'next/image';
import Link from 'next/link';
import { BedDouble, Bath, Ruler, MapPin } from 'lucide-react';
import type { PropertyCard as PropertyCardType, RecommendedProperty } from '@/types/api';
import { formatShortPrice } from '@/utils/format';
import { LISTING_TYPE_LABELS } from '@/utils/constants';
import FavoriteButton from './FavoriteButton';
import MatchScoreBadge from './MatchScoreBadge';
import ReasonChips from './ReasonChips';

export default function PropertyCard({ property }: { property: PropertyCardType | RecommendedProperty }) {
  const rec = 'matchScore' in property ? (property as RecommendedProperty) : null;

  return (
    <Link
      href={`/properties/${property.propertyId}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {property.primaryImage ? (
          <Image
            src={property.primaryImage}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">No image</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow">
          {LISTING_TYPE_LABELS[property.listingType]}
        </span>
        <div className="absolute right-3 top-3">
          <FavoriteButton propertyId={property.propertyId} initialIsFavorite={property.isFavorite} size="sm" />
        </div>
        {rec && (
          <div className="absolute bottom-3 left-3">
            <MatchScoreBadge score={rec.matchScore} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="line-clamp-1 font-semibold text-slate-900">{property.title}</p>
        <p className="flex items-center gap-1 text-sm text-slate-500">
          <MapPin size={14} /> {property.locality}, {property.city}
        </p>
        <p className="text-lg font-bold text-emerald-700">{formatShortPrice(property.price, property.listingType)}</p>
        <div className="mt-1 flex items-center gap-4 text-sm text-slate-600">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble size={15} /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath size={15} /> {property.bathrooms}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Ruler size={15} /> {property.areaSqft} sqft
          </span>
        </div>
        {rec && <ReasonChips reasons={rec.reasons} />}
      </div>
    </Link>
  );
}
