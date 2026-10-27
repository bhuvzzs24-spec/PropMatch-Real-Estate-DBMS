'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Home, Heart, Sparkles, LayoutDashboard, ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const buyerLinks = [
  { href: '/recommendations', label: 'For you', icon: Sparkles },
  { href: '/favorites', label: 'Favourites', icon: Heart },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setOpen(false);
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-emerald-700">
          <Home size={20} />
          PropMatch
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/properties" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Browse
          </Link>
          {user?.role === 'BUYER' &&
            buyerLinks.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                {l.label}
              </Link>
            ))}
          {user?.role === 'AGENT' && (
            <>
              <Link
                href="/agent/properties"
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                My Properties
              </Link>
              <Link
                href="/agent/dashboard"
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin/dashboard" className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              <ShieldCheck size={16} /> Admin
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link href="/profile" className="text-sm text-slate-600 hover:text-slate-900">
                {user.fullName.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
                Log in
              </Link>
              <Link href="/register" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button className="p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="space-y-1 border-t border-slate-200 px-4 py-3 md:hidden">
          <Link href="/properties" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
            Browse
          </Link>
          {user?.role === 'BUYER' &&
            buyerLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
                {l.label}
              </Link>
            ))}
          {user?.role === 'AGENT' && (
            <Link href="/agent/dashboard" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
              Dashboard
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin/dashboard" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
              Admin
            </Link>
          )}
          <div className="mt-2 flex gap-2 pt-2">
            {user ? (
              <button onClick={handleLogout} className="w-full rounded-lg border border-slate-300 py-2 text-sm text-slate-600">
                Log out
              </button>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="w-full rounded-lg border border-slate-300 py-2 text-center text-sm text-slate-600">
                  Log in
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="w-full rounded-lg bg-emerald-600 py-2 text-center text-sm text-white">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
