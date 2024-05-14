import { NextResponse, NextMiddleware } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextAuthMiddlewareOptions, withAuth } from 'next-auth/middleware';
import { verify } from 'jsonwebtoken';
import { getSession } from 'next-auth/react';

// middleware API
const protectedRoutes = ['/employees', '/orders', '/categories', '/products', '/modifiers', '/tables', '/discounts'];

export default async function middleware(request: NextRequest) {
  const requestForNextAuth = {
    headers: {
      cookie: request.headers.get('cookie') ?? undefined,
    },
  };
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);

  // const session = await getSession({ req: requestForNextAuth });
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
