
'use client';

import { useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import type { PropertyDetail } from '@/types/api';
import { useApi } from '@/hooks/useApi';
import { getProperty, getSimilarProperties } from '@/services/properties';
import { formatShortPrice, formatDate } from '@/utils/format';
import { LISTING_TYPE_LABELS } from '@/utils/constants';
import ImageGallery from '@/components/properties/ImageGallery';
import SpecTable from '@/components/properties/SpecTable';
import AmenityChips from '@/components/properties/AmenityChips';
import AgentCard from '@/components/properties/AgentCard';
import PriceHistoryChart from '@/components/properties/PriceHistoryChart';
import SimilarProperties from '@/components/properties/SimilarProperties';
import FavoriteButton from '@/components/properties/FavoriteButton';
import InquiryForm from '@/components/properties/InquiryForm';
import VisitBookingForm from '@/components/properties/VisitBookingForm';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function PropertyDetailClient({
  propertyId,
}: {
  propertyId: number;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const showToast = useToast();

  const [showInquiry, setShowInquiry] = useState(false);
  const [showVisit, setShowVisit] = useState(false);

  const {
    data: property,
    loading,
    error,
    reload,
  } = useApi<PropertyDetail | null>(
    () => getProperty(propertyId),
    `property-${propertyId}`,
  );

  const { data: similar } = useApi(
    () => getSimilarProperties(propertyId),
    `similar-${propertyId}`,
  );

  function guardBuyerAction(open: () => void) {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'BUYER') {
      showToast('Only buyers can do this', 'info');
      return;
    }

    open();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <LoadingState label="Loading property..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ErrorState message={error.message} onRetry={reload} />
      </div>
    );
  }

  if (!property) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ImageGallery
            images={property.images}
            title={property.title}
          />

          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {property.title}
                </h1>

                <p className="mt-1 text-slate-500">
                  {property.addressLine
                    ? `${property.addressLine}, `
                    : ''}
                  {property.locality}, {property.city}
                </p>
              </div>

              <FavoriteButton
                propertyId={property.propertyId}
                initialIsFavorite={property.isFavorite}
              />
            </div>

            <div className="mt-3 flex items-center gap-3">
              <p className="text-2xl font-bold text-emerald-700">
                {formatShortPrice(
                  property.price,
                  property.listingType,
                )}
              </p>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {LISTING_TYPE_LABELS[property.listingType]}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Listed {formatDate(property.createdAt)}
            </p>
          </div>

          <SpecTable property={property} />

          <div>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              About this property
            </h2>

            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {property.description}
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              Amenities
            </h2>

            <AmenityChips amenities={property.amenities} />
          </div>

          <PriceHistoryChart
            priceHistory={property.priceHistory}
            currentPrice={property.price}
          />
        </div>

        <div>
          <div className="sticky top-20">
            <AgentCard
              agent={property.agent}
              onEnquire={() =>
                guardBuyerAction(() => setShowInquiry(true))
              }
              onBookVisit={() =>
                guardBuyerAction(() => setShowVisit(true))
              }
            />
          </div>
        </div>
      </div>

      {similar && similar.length > 0 && (
        <div className="mt-12">
          <SimilarProperties properties={similar} />
        </div>
      )}

      {showInquiry && (
        <InquiryForm
          propertyId={property.propertyId}
          onClose={() => setShowInquiry(false)}
        />
      )}

      {showVisit && (
        <VisitBookingForm
          propertyId={property.propertyId}
          onClose={() => setShowVisit(false)}
        />
      )}
    </div>
  );
}

