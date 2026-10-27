'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Role } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';

export default function RoleGate({
  allow,
  loginNext,
  children,
}: {
  allow: Role[];
  loginNext: string;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingState />;

  if (!user || !allow.includes(user.role)) {
    return (
      <EmptyState
        title={!user ? 'Log in to continue' : "You don't have access to this page"}
        description={!user ? undefined : 'This page is only available to ' + allow.join(' or ').toLowerCase() + ' accounts.'}
        action={
          !user ? (
            <Link href={`/login?next=${loginNext}`} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Log in
            </Link>
          ) : (
            <Link href="/" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Back to home
            </Link>
          )
        }
      />
    );
  }

  return <>{children}</>;
}
