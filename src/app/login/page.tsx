'use client';
import AdminLoginForm from '@/components/adminPage/AdminLoginForm';
import AuthLayout from '@/components/adminPage/AuthLayout';

export default function LoginPage() {
  return (
    <AuthLayout>
      <AdminLoginForm />
    </AuthLayout>
  );
}
