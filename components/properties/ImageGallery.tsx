'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { PropertyImage } from '@/types/api';

export default function ImageGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const sorted = [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  const [active, setActive] = useState(0);

  if (sorted.length === 0) {
    return <div className="flex h-72 items-center justify-center rounded-xl bg-slate-100 text-slate-400 sm:h-96">No images</div>;
  }

  return (
    <div>
      <div className="relative h-72 w-full overflow-hidden rounded-xl bg-slate-100 sm:h-96">
        <Image src={sorted[active].imageUrl} alt={title} fill sizes="100vw" className="object-cover" unoptimized priority />
      </div>
      {sorted.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img.imageId}
              onClick={() => setActive(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 ${
                i === active ? 'ring-emerald-600' : 'ring-transparent'
              }`}
            >
              <Image src={img.imageUrl} alt="" fill sizes="96px" className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
