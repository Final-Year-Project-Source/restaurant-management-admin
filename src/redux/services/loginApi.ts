import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const loginApi = createApi({
  reducerPath: 'loginApi',
  refetchOnFocus: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
  }),
  tagTypes: ['Login'],
  endpoints: (builder) => ({
    login: builder.mutation<any, { data: { email: string; password: string } }>({
      query: ({ data }) => ({
        url: 'auth/login',
        method: 'POST',
        body: {
          email: data.email,
          password: data.password,
        },

        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Login'],
    }),
    LoginSecondStep: builder.mutation<any, { token: any; verifyToken: string }>({
      query: ({ token, verifyToken }) => ({
        url: 'auth/otp/verify',
        method: 'POST',
        body: {
          token,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${verifyToken}`,
        },
      }),
      invalidatesTags: ['Login'],
    }),
    ChangeDefaultPassword: builder.mutation<any, { newPassword: string; verifyToken: string }>({
      query: ({ newPassword, verifyToken }) => ({
        url: 'auth/change-default-password',
        method: 'POST',
        body: {
          newPassword,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${verifyToken}`,
        },
      }),
      invalidatesTags: ['Login'],
    }),
    SendMailResetPassword: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: 'auth/forgot-password',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      // invalidatesTags: ['Login'],
    }),
    ResetForgotPassword: builder.mutation<any, { data: any; token: string }>({
      query: ({ data, token }) => ({
        url: `auth/reset-password?token=${token}`,
        method: 'POST',
        body: data,

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }),
      // invalidatesTags: ['Login'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLoginSecondStepMutation,
  useChangeDefaultPasswordMutation,
  useSendMailResetPasswordMutation,
  useResetForgotPasswordMutation,
} = loginApi;
