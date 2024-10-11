import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <h1 className="text-2xl font-bold text-center mb-6">Log in to your account</h1>
      <LoginForm />
    </div>
  );
}