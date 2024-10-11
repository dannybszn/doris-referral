import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
      <RegisterForm />
    </div>
  );
}