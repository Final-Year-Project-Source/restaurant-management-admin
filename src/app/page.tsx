import React from 'react';
import '@/styles/globals.css';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { USER_ROLE } from '@/enums';
import { options } from './api/auth/[...nextauth]/option';
export default async function AdminOrdersPage() {
  const session = await getServerSession(options);

  if (!session?.user || session?.user?.role === USER_ROLE.USER) {
    redirect('/login');
  }
  if (session?.user?.role !== 'Administrator') {
    redirect('/bills');
  } else {
    redirect('/employees');
  }
}
