import NextAuth from 'next-auth/next';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      password: string;
      role: string;
      access_token: string;
      refresh_token: string;
      otp_enabled: Boolean;
      otp_auth_url: String;
      otp_base32: String;
      errorRefreshToken: string;
    };
  }
}
