import React from 'react';
import '@/styles/globals.css';
import { getServerSession } from 'next-auth';
// import { options } from '@/app/api/auth/[...nextauth]/option';
import { redirect } from 'next/navigation';
export default async function AdminOrdersPage() {
  // const session = await getServerSession(options);
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }
  if (session?.user?.role !== 'Administrator') {
    redirect('/bills');
  } else {
    redirect('/employees');
  }
}
