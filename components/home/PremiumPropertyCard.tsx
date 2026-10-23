
'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  BedDouble,
  Bath,
  Ruler,
  MapPin,
} from 'lucide-react';

import type { PropertyCard as PropertyCardType } from '@/types/api';
import FavoriteButton from '@/components/properties/FavoriteButton';

export default function PremiumPropertyCard({
  property,
  large = false,
}: {
  property: PropertyCardType;
  large?: boolean;
}) {
  const price = Number(property.price);

  const displayPrice =
    property.listingType === 'RENT'
      ? `₹${price.toLocaleString('en-IN')}/mo`
      : price >= 10000000
        ? `₹${(price / 10000000).toFixed(2)} Cr`
        : `₹${(price / 100000).toFixed(0)} L`;

  return (
    <article
      className={[
        'group relative overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_20px_70px_rgba(15,23,42,.10)]',
        'transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_35px_100px_rgba(15,23,42,.18)]',
        large ? 'lg:min-h-[620px]' : '',
      ].join(' ')}
    >
      <Link
        href={`/properties/${property.propertyId}`}
        className="block"
      >
        <div
          className={[
            'relative overflow-hidden',
            large ? 'aspect-[1.35]' : 'aspect-[1.25]',
          ].join(' ')}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{
              backgroundImage: `url(${
                property.primaryImage ||
                'https://picsum.photos/1200/900'
              })`,
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/5" />

          <div className="absolute left-5 top-5">
            <span className="rounded-full border border-white/40 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-lg backdrop-blur">
              {property.listingType === 'RENT'
                ? 'For Rent'
                : 'For Sale'}
            </span>
          </div>

          <div className="absolute bottom-5 left-5 right-5 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">
              {property.locality}
            </p>

            <p className="mt-1 text-3xl font-black tracking-tight">
              {displayPrice}
            </p>
          </div>
        </div>
      </Link>

      <div className="absolute right-4 top-4 z-10">
        <FavoriteButton
          propertyId={property.propertyId}
          initialIsFavorite={Boolean(property.isFavorite)}
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-lg font-black text-slate-950">
              {property.title}
            </h3>

            <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin size={15} />
              <span>
                {property.locality}, {property.city}
              </span>
            </div>
          </div>

          <span className="shrink-0 rounded-full bg-emerald-50 p-2 text-emerald-600 transition duration-300 group-hover:rotate-45">
            <ArrowUpRight size={17} />
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <BedDouble size={16} />
            {property.bedrooms}
          </span>

          <span className="flex items-center gap-1.5">
            <Bath size={16} />
            {property.bathrooms}
          </span>

          <span className="flex items-center gap-1.5">
            <Ruler size={16} />
            {property.areaSqft} sqft
          </span>
        </div>
      </div>
    </article>
  );
}
