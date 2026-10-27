'use client';

import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarCheck2,
  Check,
  Compass,
  Database,
  Heart,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from 'lucide-react';

import type { PropertyCard } from '@/types/api';

import HeroSearch from '@/components/home/HeroSearch';
import ScrollReveal from '@/components/home/ScrollReveal';
import PremiumPropertyCard from '@/components/home/PremiumPropertyCard';

const locations = [
  'Whitefield',
  'HSR Layout',
  'JP Nagar',
  'Koramangala',
  'Indiranagar',
  'Marathahalli',
  'Electronic City',
  'Yelahanka',
];

const matchReasons = [
  'Within your budget',
  'Preferred locality',
  'Preferred property type',
  'Meets your bedroom needs',
  'Has your must-have amenities',
  'Similar to homes you viewed',
];

function priceLabel(property: PropertyCard) {
  const price = Number(property.price);

  if (property.listingType === 'RENT') {
    return `₹${price.toLocaleString('en-IN')}/mo`;
  }

  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }

  return `₹${(price / 100000).toFixed(0)} L`;
}

function FloatingHouse() {
  return (
    <div className="relative mx-auto h-[530px] max-w-[560px]">
      <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/20 blur-3xl pm-pulse" />

      <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 [perspective:1200px]">
        <div className="pm-house relative h-full w-full [transform-style:preserve-3d]">
          <div className="absolute left-[14%] top-[28%] h-[52%] w-[72%] rounded-[34px] border border-white/60 bg-white/80 shadow-[0_50px_100px_rgba(15,23,42,.18)] backdrop-blur-xl [transform:translateZ(65px)]" />

          <div className="absolute left-[25%] top-[8%] h-[42%] w-[50%] rounded-t-[34px] bg-gradient-to-br from-emerald-200 to-emerald-500 shadow-2xl [transform:rotateX(58deg) translateZ(20px)]" />

          <div className="absolute bottom-[8%] left-[40%] h-[27%] w-[20%] rounded-t-[17px] bg-slate-950/85 [transform:translateZ(92px)]" />

          <div className="absolute left-[22%] top-[44%] h-[14%] w-[17%] rounded-lg bg-emerald-400/80 [transform:translateZ(96px)]" />

          <div className="absolute right-[22%] top-[44%] h-[14%] w-[17%] rounded-lg bg-emerald-400/80 [transform:translateZ(96px)]" />
        </div>
      </div>

      <div className="absolute left-0 top-20 rounded-[26px] border border-white/70 bg-white/80 p-4 shadow-xl backdrop-blur-xl pm-float">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
            <Target size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">
              Match
            </p>
            <p className="text-xl font-black">97.9%</p>
          </div>
        </div>
      </div>

      <div className="absolute right-0 top-1/2 rounded-[26px] border border-white/10 bg-slate-950 p-5 text-white shadow-2xl pm-float-reverse">
        <p className="text-[10px] uppercase tracking-[.2em] text-white/40">
          Preferred locality
        </p>
        <p className="mt-2 text-xl font-black">Whitefield</p>
      </div>

      <div className="absolute bottom-16 left-16 rounded-[26px] border border-white/70 bg-white/80 p-4 shadow-xl backdrop-blur-xl pm-float-reverse">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-emerald-500 p-2 text-white">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-sm font-bold">Verified agent</p>
            <p className="text-xs text-slate-500">PropMatch checked</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Marquee() {
  return (
    <div className="overflow-hidden border-y border-white/10 bg-slate-950 py-5">
      <div className="pm-marquee flex w-max gap-12 whitespace-nowrap text-xs font-bold uppercase tracking-[.3em] text-white/45">
        {Array.from({ length: 2 }).map((_, row) => (
          <div key={row} className="flex gap-12">
            {[
              'BENGALURU',
              'WHITEFIELD',
              'HSR LAYOUT',
              'JP NAGAR',
              'KORAMANGALA',
              'INDIRANAGAR',
              'MARATHAHALLI',
              'ELECTRONIC CITY',
            ].map((name) => (
              <span key={`${row}-${name}`} className="flex items-center gap-12">
                {name}
                <span className="text-emerald-400">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ModernHome({
  properties,
}: {
  properties: PropertyCard[];
}) {
  const featured = properties.slice(0, 3);
  const more = properties.slice(3, 9);

  return (
    <main className="overflow-hidden bg-[#f6faf8] text-slate-950">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        .pm-reveal {
          opacity: 0;
          transform: translateY(44px);
          transition:
            opacity 900ms cubic-bezier(.22,1,.36,1),
            transform 900ms cubic-bezier(.22,1,.36,1);
        }

        .pm-reveal.pm-show {
          opacity: 1;
          transform: translateY(0);
        }

        .pm-float {
          animation: pmFloat 6s ease-in-out infinite;
        }

        .pm-float-reverse {
          animation: pmFloatReverse 7s ease-in-out infinite;
        }

        .pm-pulse {
          animation: pmPulse 5s ease-in-out infinite;
        }

        .pm-house {
          animation: pmHouse 8s ease-in-out infinite;
        }

        .pm-marquee {
          animation: pmMarquee 28s linear infinite;
        }

        @keyframes pmFloat {
          0%, 100% {
            transform: translate3d(0,0,0);
          }
          50% {
            transform: translate3d(0,-14px,0);
          }
        }

        @keyframes pmFloatReverse {
          0%, 100% {
            transform: translate3d(0,0,0);
          }
          50% {
            transform: translate3d(0,12px,0);
          }
        }

        @keyframes pmPulse {
          0%, 100% {
            opacity: .35;
            transform: scale(.9);
          }
          50% {
            opacity: .8;
            transform: scale(1.1);
          }
        }

        @keyframes pmHouse {
          0%, 100% {
            transform: rotateX(0deg) rotateY(-8deg) rotateZ(-1deg);
          }
          50% {
            transform: rotateX(5deg) rotateY(8deg) rotateZ(1deg) translateY(-12px);
          }
        }

        @keyframes pmMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>

      {/* 01 */}
      <section className="relative min-h-[145vh] bg-[radial-gradient(circle_at_80%_20%,rgba(52,211,153,.28),transparent_28%),linear-gradient(180deg,#ecfdf5,#f6faf8)]">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(15,23,42,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.04)_1px,transparent_1px)] [background-size:72px_72px]" />

        <div className="relative mx-auto grid min-h-[135vh] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_.95fr]">
          <ScrollReveal>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[.22em] text-emerald-700 shadow-sm backdrop-blur">
                <Sparkles size={14} />
                AI-powered property discovery
              </div>

              <h1 className="mt-8 max-w-4xl text-6xl font-black leading-[.92] tracking-[-.06em] sm:text-7xl lg:text-8xl">
                Find a place that
                <span className="block bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
                  feels like yours.
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Discover real homes across Bengaluru with recommendations shaped by
                your budget, location, preferences and behaviour.
              </p>

              <div className="mt-10">
                <HeroSearch />
              </div>

              <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-600" />
                  Database-backed listings
                </span>
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-600" />
                  Explainable matches
                </span>
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-600" />
                  Verified agents
                </span>
              </div>

              <a
                href="#discover"
                className="mt-10 inline-flex items-center gap-2 font-bold text-slate-900 transition hover:gap-4"
              >
                Explore the experience
                <ArrowDown size={18} />
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal className="[transition-delay:150ms]">
            <FloatingHouse />
          </ScrollReveal>
        </div>
      </section>

      {/* 02 */}
      <Marquee />

      {/* 03 */}
      <section id="discover" className="min-h-[150vh] bg-white px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-600">
              03 / Newest listings
            </p>

            <h2 className="mt-6 max-w-4xl text-5xl font-black tracking-[-.05em] sm:text-7xl">
              Real homes.
              <span className="block text-emerald-600">Real database records.</span>
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-500">
              These property cards are populated through your real PropMatch API.
            </p>
          </ScrollReveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {featured.map((property, index) => (
              <ScrollReveal
                key={property.propertyId}
                className={`[transition-delay:${index * 120}ms]`}
              >
                <PremiumPropertyCard property={property} large />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 04 */}
      <section className="min-h-[145vh] bg-slate-950 px-6 py-28 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[.9fr_1.1fr]">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-300">
              04 / Your match
            </p>

            <h2 className="mt-6 text-5xl font-black tracking-[-.06em] sm:text-7xl">
              Not just search.
              <span className="block text-emerald-300">A reason to choose.</span>
            </h2>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
              PropMatch scores properties using the same signals defined by your
              project: budget, location, type, bedrooms, amenities and behaviour.
            </p>
          </ScrollReveal>

          <ScrollReveal className="[transition-delay:150ms]">
            <div className="rounded-[38px] border border-white/10 bg-white/[.04] p-8 shadow-[0_40px_120px_rgba(0,0,0,.4)]">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[.2em] text-white/40">
                    Match score
                  </p>
                  <p className="mt-2 text-6xl font-black text-emerald-300">97.9</p>
                </div>

                <div className="h-28 w-28 rounded-full border-[14px] border-emerald-400/20 border-t-emerald-300 border-r-emerald-300" />
              </div>

              <div className="mt-10 space-y-5">
                {[
                  ['Budget', 30],
                  ['Location', 25],
                  ['Property type', 15],
                  ['Bedrooms', 10],
                  ['Amenities', 10],
                  ['Behaviour', 10],
                ].map(([label, weight]) => (
                  <div key={String(label)}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-300">{label}</span>
                      <span className="text-emerald-300">{weight}%</span>
                    </div>

                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300"
                        style={{ width: `${Number(weight) * 3.2}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 05 */}
      <section className="min-h-[145vh] bg-[#effaf5] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-600">
              05 / Why this match
            </p>

            <h2 className="mt-6 text-5xl font-black tracking-[-.05em] sm:text-7xl">
              Every recommendation
              <span className="block text-emerald-600">should explain itself.</span>
            </h2>
          </ScrollReveal>

          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matchReasons.map((reason, index) => (
              <ScrollReveal key={reason}>
                <div className="group h-full rounded-[30px] border border-emerald-100 bg-white p-7 shadow-sm transition duration-500 hover:-translate-y-3 hover:shadow-[0_30px_80px_rgba(15,23,42,.10)]">
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-600">
                    0{index + 1}
                  </p>

                  <div className="mt-12 rounded-2xl bg-emerald-50 p-4 w-fit text-emerald-600 transition group-hover:rotate-6">
                    <Sparkles size={22} />
                  </div>

                  <h3 className="mt-7 text-xl font-black">
                    {reason}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    A transparent signal that helps the buyer understand the
                    recommendation instead of receiving a black-box result.
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 06 */}
      <section className="min-h-[150vh] bg-white px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-600">
              06 / Explore Bengaluru
            </p>

            <h2 className="mt-6 max-w-4xl text-5xl font-black tracking-[-.06em] sm:text-7xl">
              Start with the place.
              <span className="block text-emerald-600">Then find the home.</span>
            </h2>
          </ScrollReveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {locations.map((location, index) => {
              const property = properties[index % Math.max(properties.length, 1)];

              return (
                <ScrollReveal key={location}>
                  <Link
                    href={`/properties?city=Bengaluru&locality=${encodeURIComponent(location)}`}
                    className="group relative block overflow-hidden rounded-[28px]"
                  >
                    <div
                      className="aspect-[.85] bg-cover bg-center transition duration-700 group-hover:scale-110"
                      style={{
                        backgroundImage: `url(${property?.primaryImage || 'https://picsum.photos/800/1000'})`,
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <p className="text-xs uppercase tracking-[.2em] text-white/60">
                        Bengaluru
                      </p>

                      <h3 className="mt-1 text-2xl font-black">{location}</h3>

                      <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                        Explore locality
                        <ArrowUpRight size={16} />
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 07 */}
      <section className="min-h-[140vh] bg-[#f6faf8] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-600">
              07 / Search
            </p>

            <h2 className="mt-6 text-5xl font-black tracking-[-.05em] sm:text-7xl">
              Search the way
              <span className="block text-emerald-600">you actually think.</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal className="mt-16">
            <div className="grid gap-4 rounded-[38px] border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
              {[
                'Bengaluru',
                'Whitefield',
                '2+ bedrooms',
                'Apartment',
                '₹30K–₹60K',
                'Parking',
                'Lift',
                'Furnished',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      {item}
                    </span>
                    <Check size={16} className="text-emerald-600" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {[
              ['Budget', 'Choose the range that actually works for you.'],
              ['Location', 'Move from Bengaluru to a specific locality.'],
              ['Amenities', 'Only show homes that include what matters.'],
            ].map(([title, text]) => (
              <ScrollReveal key={title}>
                <div className="rounded-[30px] bg-slate-950 p-7 text-white">
                  <Search className="text-emerald-300" />
                  <h3 className="mt-10 text-2xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 08 */}
      <section className="min-h-[135vh] bg-slate-950 px-6 py-28 text-white">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-300">
              08 / Property rail
            </p>

            <h2 className="mt-6 max-w-4xl text-5xl font-black tracking-[-.05em] sm:text-7xl">
              Keep exploring.
              <span className="block text-emerald-300">There is always another possibility.</span>
            </h2>
          </ScrollReveal>
        </div>

        <div className="mt-16 overflow-x-auto px-6 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto flex w-max gap-6">
            {properties.map((property) => (
              <Link
                key={property.propertyId}
                href={`/properties/${property.propertyId}`}
                className="group block w-[320px] overflow-hidden rounded-[30px] border border-white/10 bg-white/[.04]"
              >
                <div
                  className="aspect-[1.25] bg-cover bg-center transition duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${property.primaryImage || 'https://picsum.photos/900/700'})`,
                  }}
                />

                <div className="p-5">
                  <p className="text-xs uppercase tracking-[.18em] text-emerald-300">
                    {property.locality}
                  </p>

                  <h3 className="mt-2 text-lg font-black">
                    {property.title}
                  </h3>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold text-white">
                      {priceLabel(property)}
                    </span>
                    <ArrowRight size={18} className="text-emerald-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 09 */}
      <section className="min-h-[135vh] bg-white px-6 py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-600">
              09 / Favourites
            </p>

            <h2 className="mt-6 text-5xl font-black tracking-[-.05em] sm:text-7xl">
              Build a shortlist
              <span className="block text-emerald-600">worth returning to.</span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500">
              Save properties that catch your attention and come back when you are
              ready to decide.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="rounded-[38px] border border-slate-200 bg-slate-50 p-6">
              <div className="rounded-[30px] bg-white p-7 shadow-sm">
                <Heart className="fill-emerald-500 text-emerald-500" size={28} />

                <h3 className="mt-10 text-3xl font-black">
                  Your favourite homes
                </h3>

                <div className="mt-7 space-y-3">
                  {[
                    'HSR Rental Apartment',
                    'JP Nagar Rental Apartment',
                    'Luxury Villa Whitefield',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
                    >
                      <span className="font-semibold">{item}</span>
                      <ArrowUpRight size={17} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 10 */}
      <section className="min-h-[135vh] bg-[#eaf8f2] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-600">
              10 / Enquiries
            </p>

            <h2 className="mt-6 text-5xl font-black tracking-[-.05em] sm:text-7xl">
              Turn interest into
              <span className="block text-emerald-600">a conversation.</span>
            </h2>
          </ScrollReveal>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {[
              ['Ask', 'Ask about the property, pricing or availability.', MessageCircle],
              ['Connect', 'Reach the agent attached to the actual listing.', Users],
              ['Continue', 'Track the enquiry as it moves through the workflow.', ArrowRight],
            ].map(([title, text, Icon]) => (
              <ScrollReveal key={String(title)}>
                <div className="rounded-[30px] border border-emerald-100 bg-white p-7 shadow-sm">
                  {typeof Icon !== 'string' && <Icon size={25} className="text-emerald-600" />}
                  <h3 className="mt-10 text-2xl font-black">{String(title)}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{String(text)}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 11 */}
      <section className="min-h-[145vh] bg-white px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-600">
              11 / Site visits
            </p>

            <h2 className="mt-6 max-w-4xl text-5xl font-black tracking-[-.05em] sm:text-7xl">
              See it in person.
              <span className="block text-emerald-600">Without the chaos.</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal className="mt-16">
            <div className="overflow-hidden rounded-[38px] border border-slate-200 bg-white shadow-sm">
              <div className="grid lg:grid-cols-[.38fr_1fr]">
                <div className="bg-slate-950 p-8 text-white">
                  <CalendarCheck2 className="text-emerald-300" size={28} />
                  <p className="mt-10 text-4xl font-black">Choose a slot.</p>
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    Your site visit request is handled through the database booking
                    workflow and conflict checking.
                  </p>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-3">
                  {['10:30 AM', '2:00 PM', '4:30 PM'].map((time, index) => (
                    <div
                      key={time}
                      className={`rounded-2xl border p-6 ${
                        index === 1
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <p className="text-xs uppercase tracking-[.15em] text-slate-400">
                        Saturday
                      </p>

                      <p className="mt-4 text-2xl font-black">
                        {time}
                      </p>

                      <p className="mt-2 text-xs text-emerald-600">
                        {index === 1 ? 'Selected' : 'Available'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 12 */}
      <section className="min-h-[135vh] bg-slate-950 px-6 py-28 text-white">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-300">
              12 / Verified agents
            </p>

            <h2 className="mt-6 text-5xl font-black tracking-[-.05em] sm:text-7xl">
              Trust the listing.
              <span className="block text-emerald-300">Know who is behind it.</span>
            </h2>
          </ScrollReveal>

          <div className="mt-16 grid gap-5 md:grid-cols-2">
            {[
              ['Agent profile', 'Agency identity and profile information.', BadgeCheck],
              ['Verification', 'Verification status managed through admin tools.', ShieldCheck],
            ].map(([title, text, Icon]) => (
              <ScrollReveal key={String(title)}>
                <div className="rounded-[30px] border border-white/10 bg-white/[.04] p-7">
                  {typeof Icon !== 'string' && <Icon size={28} className="text-emerald-300" />}
                  <h3 className="mt-10 text-2xl font-black">{String(title)}</h3>
                  <p className="mt-3 text-slate-400">{String(text)}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 13 */}
      <section className="min-h-[140vh] bg-[#f2faf6] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-600">
              13 / Data architecture
            </p>

            <h2 className="mt-6 text-5xl font-black tracking-[-.05em] sm:text-7xl">
              Beautiful on the outside.
              <span className="block text-emerald-600">Structured underneath.</span>
            </h2>
          </ScrollReveal>

          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            <ScrollReveal>
              <div className="rounded-[34px] bg-slate-950 p-8 text-white">
                <Database size={28} className="text-emerald-300" />
                <h3 className="mt-10 text-3xl font-black">MySQL</h3>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  {[
                    'Users',
                    'Properties',
                    'Locations',
                    'Amenities',
                    'Favorites',
                    'Inquiries',
                    'Visits',
                    'Price history',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/[.04] p-4 text-sm text-slate-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="rounded-[34px] bg-white p-8 shadow-sm">
                <Sparkles size={28} className="text-emerald-600" />
                <h3 className="mt-10 text-3xl font-black">MongoDB</h3>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  {[
                    'Preferences',
                    'Activity',
                    'Search signals',
                    'Favourite events',
                    'Visit requests',
                    'Recommendation cache',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 14 */}
      <section className="min-h-[140vh] bg-white px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-600">
              14 / Behaviour
            </p>

            <h2 className="mt-6 text-5xl font-black tracking-[-.05em] sm:text-7xl">
              Your behaviour
              <span className="block text-emerald-600">becomes a signal.</span>
            </h2>
          </ScrollReveal>

          <div className="mt-16 grid gap-4 md:grid-cols-2">
            {[
              ['VIEW', '1×', 'You looked at it'],
              ['FAVORITE', '3×', 'You saved it'],
              ['INQUIRY', '5×', 'You asked about it'],
              ['VISIT_REQUEST', '5×', 'You requested a visit'],
            ].map(([event, weight, description]) => (
              <ScrollReveal key={event}>
                <div className="flex items-center justify-between rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-2">
                  <div>
                    <p className="font-black">{event}</p>
                    <p className="mt-2 text-sm text-slate-500">{description}</p>
                  </div>

                  <span className="text-4xl font-black text-emerald-600">
                    {weight}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 15 */}
      <section className="min-h-[145vh] bg-[#effaf5] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-600">
              15 / Recommendations
            </p>

            <h2 className="mt-6 text-5xl font-black tracking-[-.05em] sm:text-7xl">
              Your homepage should
              <span className="block text-emerald-600">know what matters.</span>
            </h2>
          </ScrollReveal>

          <div className="mt-16 rounded-[40px] bg-white p-7 shadow-[0_30px_90px_rgba(15,23,42,.10)]">
            <div className="grid gap-5 md:grid-cols-3">
              {[
                ['97.9', 'HSR Rental Apartment'],
                ['88.8', 'JP Nagar Rental Apartment'],
                ['65.0', 'Koramangala Rental Home'],
              ].map(([score, title]) => (
                <div
                  key={title}
                  className="rounded-[28px] border border-slate-200 p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500">
                      Match
                    </span>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">
                      {score}
                    </span>
                  </div>

                  <h3 className="mt-8 text-xl font-black">{title}</h3>

                  <div className="mt-6 space-y-2">
                    {matchReasons.slice(0, 3).map((reason) => (
                      <div
                        key={reason}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <Check size={15} className="text-emerald-600" />
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 16 */}
      <section className="min-h-[145vh] bg-white px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-600">
              16 / More properties
            </p>

            <h2 className="mt-6 text-5xl font-black tracking-[-.05em] sm:text-7xl">
              Different homes.
              <span className="block text-emerald-600">Different stories.</span>
            </h2>
          </ScrollReveal>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {more.map((property) => (
              <ScrollReveal key={property.propertyId}>
                <PremiumPropertyCard property={property} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 17 */}
      <section className="min-h-[140vh] bg-slate-950 px-6 py-28 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-300">
              17 / Buyer journey
            </p>

            <h2 className="mt-6 text-5xl font-black tracking-[-.05em] sm:text-7xl">
              Search.
              <span className="block text-emerald-300">Save.</span>
              <span className="block text-emerald-300">Enquire.</span>
              <span className="block text-emerald-300">Visit.</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal>
            <div className="space-y-4">
              {[
                ['01', 'Search', Search],
                ['02', 'Discover', Compass],
                ['03', 'Save', Heart],
                ['04', 'Enquire', MessageCircle],
                ['05', 'Visit', CalendarCheck2],
              ].map(([number, title, Icon]) => (
                <div
                  key={String(number)}
                  className="group flex items-center gap-5 rounded-[25px] border border-white/10 bg-white/[.04] p-5 transition duration-500 hover:-translate-y-1 hover:bg-white/[.07]"
                >
                  <span className="text-sm font-black text-emerald-300">
                    {String(number)}
                  </span>

                  {typeof Icon !== 'string' && (
                    <Icon size={21} className="text-white/50 transition group-hover:text-emerald-300" />
                  )}

                  <span className="text-lg font-black">{String(title)}</span>

                  <ArrowRight
                    size={18}
                    className="ml-auto text-white/30 transition group-hover:translate-x-2 group-hover:text-emerald-300"
                  />
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 18 */}
      <section className="min-h-[135vh] bg-[#f4fbf7] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-600">
              18 / For agents
            </p>

            <h2 className="mt-6 text-5xl font-black tracking-[-.05em] sm:text-7xl">
              Better listings.
              <span className="block text-emerald-600">Better visibility.</span>
            </h2>
          </ScrollReveal>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {[
              ['Manage listings', Building2],
              ['Handle enquiries', MessageCircle],
              ['Track visits', CalendarCheck2],
            ].map(([title, Icon]) => (
              <ScrollReveal key={String(title)}>
                <div className="rounded-[30px] border border-slate-200 bg-white p-7 transition duration-500 hover:-translate-y-2 hover:shadow-xl">
                  {typeof Icon !== 'string' && (
                    <Icon size={28} className="text-emerald-600" />
                  )}

                  <h3 className="mt-10 text-2xl font-black">
                    {String(title)}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    A structured workflow connected to the real database and API.
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 19 */}
      <section className="min-h-[140vh] bg-white px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-600">
              19 / Trust
            </p>

            <h2 className="mt-6 text-5xl font-black tracking-[-.05em] sm:text-7xl">
              Designed to make
              <span className="block text-emerald-600">property discovery calmer.</span>
            </h2>
          </ScrollReveal>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {[
              ['Verified', 'Know which agents are approved.'],
              ['Explainable', 'Know why a home is recommended.'],
              ['Connected', 'Search, save, enquire and visit in one flow.'],
            ].map(([title, text]) => (
              <ScrollReveal key={title}>
                <div className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm">
                  <ShieldCheck className="text-emerald-600" size={27} />
                  <h3 className="mt-10 text-2xl font-black">{title}</h3>
                  <p className="mt-3 text-slate-500">{text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 20 */}
      <section className="relative min-h-[155vh] overflow-hidden bg-[radial-gradient(circle_at_25%_20%,rgba(52,211,153,.30),transparent_25%),radial-gradient(circle_at_80%_75%,rgba(20,184,166,.18),transparent_25%),#ecfdf5] px-6 py-28">
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/20 pm-pulse" />

        <div className="relative mx-auto flex min-h-[125vh] max-w-6xl flex-col items-center justify-center text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[.22em] text-emerald-700">
              <Zap size={14} />
              PropMatch
            </div>

            <h2 className="mt-9 text-6xl font-black leading-[.9] tracking-[-.065em] sm:text-8xl">
              Stop endlessly scrolling.
              <span className="block text-emerald-600">
                Start finding.
              </span>
            </h2>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-600">
              Explore real listings, understand your matches, save your favourites,
              ask questions and schedule visits.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/properties"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-4 font-bold text-white shadow-xl transition hover:-translate-y-1"
              >
                Explore homes
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/recommendations"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-4 font-bold text-slate-900 transition hover:-translate-y-1"
              >
                See my matches
                <Sparkles size={17} />
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ['32+', 'property records'],
                ['8', 'Bengaluru localities'],
                ['3', 'agents'],
                ['6', 'matching signals'],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-[25px] border border-white/80 bg-white/70 p-5 backdrop-blur"
                >
                  <p className="text-3xl font-black">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[.15em] text-slate-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
