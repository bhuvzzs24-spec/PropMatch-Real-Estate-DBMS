// Flip with NEXT_PUBLIC_USE_MOCKS in .env.local while the real API is being built.
// Spec Section 18.7: switching this is the only change needed to go live - no page edits.
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
