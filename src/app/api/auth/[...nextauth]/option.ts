import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions } from 'next-auth';
import { connectMongoDB } from '@/libs/mongodb';
import jwt from 'jsonwebtoken';
import User from '@/models/user';
import { cookies } from 'next/headers';

export const options: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'email', type: 'text', placeholder: 'email' },
        access_token: { label: 'access_token', type: 'text', placeholder: 'access_token' },
        access_expires: { label: 'access_expires', type: 'text', placeholder: 'access_expires' },
        refresh_token: { label: 'refresh_token', type: 'text', placeholder: 'refresh_token' },
        refresh_expires: { label: 'refresh_expires', type: 'text', placeholder: 'refresh_expires' },
      },
      async authorize(credentials, req) {
        if (!credentials) throw new Error('Missing credentials');

        const { email, access_token, access_expires, refresh_expires, refresh_token } = credentials;

        try {
          await connectMongoDB();
          const user = await User.findOne({ email });
          if (!user || user.is_deleted) {
            return null;
          }
          //check if password is correct

          cookies().delete('verify_token');

          //create token
          const accessExpires = new Date(access_expires);
          const refreshExpires = new Date(refresh_expires);

          cookies().set('access_token', access_token, { expires: accessExpires });
          cookies().set('refresh_token', refresh_token, { expires: refreshExpires });
          user.access_token = access_token;

          const userData = {
            email: user.email,
            name: user.name,
            id: user._id,
            role: user.role,
            access_token: user.access_token,
          };
          return userData;
        } catch (error: any) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token = { user };
      }
      return token;
    },
    async session({ session, token, user }) {
      session.user = token.user as any;

      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
