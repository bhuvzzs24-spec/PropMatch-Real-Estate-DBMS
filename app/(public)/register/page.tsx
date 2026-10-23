import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = { title: 'Sign up — PropMatch' };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">Create your account</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
