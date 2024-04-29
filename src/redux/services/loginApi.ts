import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const loginApi = createApi({
  reducerPath: 'loginApi',
  refetchOnFocus: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
  }),
  tagTypes: ['Login'],
  endpoints: (builder) => ({
    loginFirstStep: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: 'auth/login-1-step',
        method: 'POST',
        body: {
          data,
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
  }),
});

export const { useLoginFirstStepMutation, useLoginSecondStepMutation, useChangeDefaultPasswordMutation } = loginApi;
