import { DEFAULT_PASSWORD } from '@/utils/constants';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const employeeApi = createApi({
  reducerPath: 'employeeApi',
  refetchOnFocus: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<
      any,
      {
        role_filter: string[];
        page?: number;
        limit?: number;
        access_token?: string;
      }
    >({
      query: (arg) => ({
        url: `user?role_filter=${arg.role_filter}&page=${arg.page}&limit=${arg.limit}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${arg.access_token}`,
        },
      }),
      providesTags: ['User'],
    }),
    getSingleUser: builder.query<any, { access_token: string; id: string }>({
      query: ({ access_token, id }) => ({
        url: `user/${id}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      providesTags: ['User'],
    }),
    createNewUser: builder.mutation<any, { access_token: string; data: object }>({
      query: ({ data, access_token }) => ({
        url: `user`,
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<any, { access_token: string; id: string }>({
      query: ({ id, access_token }) => ({
        url: `user/${id}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<
      any,
      { currentPassword: string; newPassword: string; id: string; access_token: string }
    >({
      query: ({ currentPassword, newPassword, id, access_token }) => ({
        url: `user/${id}/change-password`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: { currentPassword, newPassword },
      }),
    }),
    reset2FA: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `user/${id}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          data: { otp_enabled: false },
        },
      }),
      invalidatesTags: ['User'],
    }),
    resetPassword: builder.mutation<any, { access_token: string; id: string }>({
      query: ({ access_token, id }) => ({
        url: `user/${id}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: { password: `${DEFAULT_PASSWORD}`, is_change_default_password: false },
      }),
      invalidatesTags: ['User'],
    }),
    updateEmployee: builder.mutation<any, { access_token: string; id: string; data: object }>({
      query: ({ id, data, access_token }) => ({
        url: `user/${id}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    verifyRefreshToken: builder.mutation<any, void>({
      query: () => ({
        url: `auth/verify-token`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      // invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetSingleUserQuery,
  useGetUsersQuery,
  useCreateNewUserMutation,
  useDeleteUserMutation,
  useReset2FAMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useUpdateEmployeeMutation,
  useVerifyRefreshTokenMutation,
} = employeeApi;
