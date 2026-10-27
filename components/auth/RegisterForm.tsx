'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { registerSchema, type RegisterFormValues } from '@/utils/schemas';
import { ApiError } from '@/services/http';

export default function RegisterForm() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema), defaultValues: { role: 'BUYER' } });

  const role = watch('role');

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);
    try {
      await registerUser(values);
      router.push(values.role === 'AGENT' ? '/agent/dashboard' : '/');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'ALREADY_EXISTS') {
        setFormError('An account with this email already exists.');
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">I am a</label>
        <div className="flex gap-2">
          {(['BUYER', 'AGENT'] as const).map((r) => (
            <label
              key={r}
              className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm ${
                role === r ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-600'
              }`}
            >
              <input type="radio" value={r} {...register('role')} className="sr-only" />
              {r === 'BUYER' ? 'Buyer / Renter' : 'Agent'}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
        <input {...register('fullName')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        {errors.fullName && <p className="mt-1 text-xs text-rose-600">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input type="email" {...register('email')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Phone (optional)</label>
        <input {...register('phone')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
        <input type="password" {...register('password')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
      </div>

      {role === 'AGENT' && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Agency name</label>
            <input {...register('agencyName')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            {errors.agencyName && <p className="mt-1 text-xs text-rose-600">{errors.agencyName.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Licence number</label>
            <input {...register('licenseNo')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            {errors.licenseNo && <p className="mt-1 text-xs text-rose-600">{errors.licenseNo.message}</p>}
          </div>
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            New agent accounts need admin verification before listings go public.
          </p>
        </>
      )}

      {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-emerald-700 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
