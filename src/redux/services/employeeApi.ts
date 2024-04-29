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
      }
    >({
      query: (arg) => ({
        url: `user?role_filter=${arg.role_filter}&page=${arg.page}&limit=${arg.limit}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      providesTags: ['User'],
    }),
    getSingleUser: builder.query<any, { id: string }>({
      query: ({ id }) => ({
        url: `user?id=${id}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      providesTags: ['User'],
    }),
    createNewUser: builder.mutation<any, { data: object }>({
      query: ({ data }) => ({
        url: `user`,
        method: 'POST',
        body: { data },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `user?id=${id}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<any, { email: string; passwordCurrent: string; passwordNew: string }>({
      query: ({ email, passwordCurrent, passwordNew }) => ({
        url: `auth/change-password`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { email, passwordCurrent, passwordNew },
      }),
    }),
    reset2FA: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `user?id=${id}`,
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
    resetPassword: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `user?id=${id}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          data: { password: `${process.env.STAFF_DEFAULT_PASSWORD}`, is_change_default_password: false },
        },
      }),
      invalidatesTags: ['User'],
    }),
    updateEmployee: builder.mutation<any, { id: string; data: object }>({
      query: ({ id, data }) => ({
        url: `user?id=${id}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { data },
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
