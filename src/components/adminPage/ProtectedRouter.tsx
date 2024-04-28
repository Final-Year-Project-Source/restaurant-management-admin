import React, { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
// import { options } from '@/app/api/auth/[...nextauth]/option';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import Unauthorized from '@/components/adminPage/Unauthorized';
import jwt from 'jsonwebtoken';
interface Props {
  children: ReactNode;
}
interface decoded_token {
  email: string;
  is_change_default_password?: boolean;
  is_verified_otp: boolean;
  iat: number;
  exp: number;
}
async function ProtectedRouter({ children }: Props) {
  // const session = await getServerSession(options);
  const session = await getServerSession();

  const headersList = headers();
  const header_url = headersList.get('x-url') || '';
  const pathWithoutHost = header_url.replace(/^https?:\/\/[^\/]+(\/[^\/?#]+).*/, '$1');

  const authenticatedRoutes = ['/login', '/force-change-default-password', '/2fa'];
  const standardRoutes = [
    '/products',
    '/force-change-default-password',
    '/2fa',
    '/bills',
    '/kitchen-display',
    '/bills',
    '/account',
    '/change-password',
  ];
  const managerRoutes = [
    '/sales-summary',
    '/sales-by-item',
    '/groups',
    '/menu-categories',
    '/modifiers',
    '/discounts',
    '/tables',
  ];
  const adminProtectedRoutes = ['/employees'];
  const cookieStore = cookies();
  if (pathWithoutHost === '/2fa' && !session) {
    const token = cookieStore.get('verify_token');
    const verify_token = token?.value || '';
    try {
      const decoded = jwt.verify(verify_token, process.env.TOKEN_SECRET!) as decoded_token;
      if (!decoded.email) return redirect('/login');
    } catch (e) {
      redirect('/login');
    }
  }
  // if (pathWithoutHost.includes('/api'))
  if (pathWithoutHost === '/force-change-default-password' && !session) {
    const token = cookieStore.get('verify_token');
    const verify_token = token?.value || '';
    try {
      const decoded = jwt.verify(verify_token, process.env.TOKEN_SECRET!) as decoded_token;
      if (!decoded.is_verified_otp) return redirect('/2fa');
      if (decoded.is_change_default_password) return redirect('/login');
    } catch (e) {
      redirect('/login');
    }
  }

  if (authenticatedRoutes.includes(pathWithoutHost)) {
    if (!session) {
      return <div>{children}</div>;
    } else {
      if (session?.user?.role === 'Administrator') {
        return redirect('/employees');
      } else {
        return redirect('/bills');
      }
    }
  } else {
    if (!session) {
      return redirect('/login');
    }
  }
  // block Standard from accessing routes manager or admin
  if (
    session?.user?.role === 'Standard' &&
    (managerRoutes.includes(pathWithoutHost) || adminProtectedRoutes.includes(pathWithoutHost))
  ) {
    return (
      <div className="flex items-center justify-center h-full">
        <Unauthorized />
      </div>
    );
  }
  // block Manager from accessing routes Admin
  if (session?.user?.role === 'Manager' && adminProtectedRoutes.includes(pathWithoutHost)) {
    return (
      <div className="flex items-center justify-center h-full">
        <Unauthorized />
      </div>
    );
  }
  // if (authenticatedRoutes.includes(pathWithoutHost) && !session) return <div>{children}</div>;
  // if (!authenticatedRoutes.includes(pathWithoutHost) && !session) return redirect('/login');
  // if (authenticatedRoutes.includes(pathWithoutHost) && session) {
  //   if (session?.user.role === 'Administrator') {
  //     return redirect('/employees');
  //   } else {
  //     return redirect('/orders');
  //   }
  // }

  return <div>{children}</div>;
}
export default ProtectedRouter;
