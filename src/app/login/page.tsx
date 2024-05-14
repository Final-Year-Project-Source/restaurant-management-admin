import AdminLoginForm from '@/components/adminPage/AdminLoginForm';
import AuthLayout from '@/components/adminPage/AuthLayout';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { options } from '../api/auth/[...nextauth]/option';

export default async function LoginPage() {
  const session = await getServerSession(options);

  if (!session) {
    return (
      <AuthLayout>
        <AdminLoginForm />
      </AuthLayout>
    );
  }

  // if (session.user.role === 'User') {
  //   await redirect('/login');
  //   return;
  // }

  // if (session.user.role === 'Administrator') {
  //   await redirect('/employees');
  //   return;
  // }
  else {
    session.user.role === 'User'
      ? redirect('/login')
      : session.user.role === 'Administrator'
        ? redirect('/employees')
        : redirect('/bills');
  }
}
