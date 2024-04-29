'use client';
import AdminRegisterForm from '@/components/adminPage/AdminRegisterForm';
import AuthLayout from '@/components/adminPage/AuthLayout';

export default function RegisterPage() {
  return (
    <AuthLayout>
      <AdminRegisterForm />
    </AuthLayout>
  );
}
