
'use client';

import { useState, useTransition, type MouseEvent } from 'react';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

import * as favoritesService from '@/services/favorites';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function FavoriteButton({
  propertyId,
  initialIsFavorite,
  size = 'md',
}: {
  propertyId: number;
  initialIsFavorite: boolean;
  size?: 'sm' | 'md';
}) {
  const { user } = useAuth();
  const showToast = useToast();
  const router = useRouter();

  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [pending, startTransition] = useTransition();
  const [pressed, setPressed] = useState(false);

  const dims = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const iconSize = size === 'sm' ? 16 : 18;

  function toggle(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'BUYER') {
      showToast('Only buyers can save favourites', 'info');
      return;
    }

    if (pending) return;

    const previous = isFavorite;
    const next = !previous;

    setIsFavorite(next);
    setPressed(true);
    window.setTimeout(() => setPressed(false), 180);

    startTransition(async () => {
      try {
        if (next) {
          await favoritesService.addFavorite(propertyId);
        } else {
          await favoritesService.removeFavorite(propertyId);

          window.dispatchEvent(
            new CustomEvent('propmatch:favorite-removed', {
              detail: { propertyId },
            })
          );
        }
      } catch (error) {
        console.error('Favourite update failed:', error);
        setIsFavorite(previous);

        showToast(
          next
            ? 'Could not save favourite. Try again.'
            : 'Could not remove favourite. Try again.',
          'error'
        );
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={isFavorite}
      aria-label={
        isFavorite
          ? 'Remove from favourites'
          : 'Save to favourites'
      }
      className={`
        ${dims}
        flex items-center justify-center
        rounded-full
        bg-white/90
        shadow
        ring-1 ring-black/5
        transition-all duration-200 ease-out
        hover:scale-105
        hover:bg-white
        active:scale-90
        disabled:cursor-wait
        disabled:opacity-60
      `}
    >
      <Heart
        size={iconSize}
        strokeWidth={2}
        className={`
          transition-all duration-200 ease-out
          ${
            isFavorite
              ? 'fill-emerald-500 text-emerald-500'
              : 'text-slate-500'
          }
          ${pressed ? 'scale-125' : 'scale-100'}
        `}
      />
    </button>
  );
}
