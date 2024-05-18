import React from 'react';
import '@/styles/globals.css';
import ChangeDefaultPasswordForm from '@/components/adminPage/ChangeDefaultPasswordForm';
import { cookies } from 'next/headers';

export default async function AdminForceChangeDefaultPasswordPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('verify_token');
  const verify_token = token?.value || '';
  return (
    <div className="flex h-full items-center justify-center">
      <ChangeDefaultPasswordForm verifyToken={verify_token} />
    </div>
  );
}
