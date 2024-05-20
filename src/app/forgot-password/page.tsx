import React from 'react';
import '@/styles/globals.css';
import AuthLayout from '@/components/adminPage/AuthLayout';
import ForgotPasswordForm from '@/components/adminPage/ForgotPasswordForm';

export default async function AdminForgotPasswordPage() {
  return (
    <AuthLayout isHiddenTabs>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
