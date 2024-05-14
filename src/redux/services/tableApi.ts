import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify';

export const diningTableApi = createApi({
  reducerPath: 'diningTableApi',
  refetchOnFocus: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
  }),
  tagTypes: ['Dining Table'],
  endpoints: (builder) => ({
    getDiningTables: builder.query<any, { access_token: string }>({
      query: ({ access_token }) => ({
        url: 'diningTable',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      providesTags: ['Dining Table'],
    }),
    getDiningTablesWithPagination: builder.query<any, { access_token: string; page: number; limit: number }>({
      query: (arg) => ({
        url: `diningTable?page=${arg.page}&limit=${arg.limit}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${arg.access_token}`,
        },
      }),
      providesTags: ['Dining Table'],
    }),
    getSingleDiningTable: builder.query<any, { id: string }>({
      query: ({ id }) => `diningTable/${id}`,
      providesTags: ['Dining Table'],
    }),
    addDiningTable: builder.mutation<any, { access_token: string; data: any }>({
      query: ({ access_token, data }) => ({
        url: 'diningTable',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Dining Table'],
    }),
    updateDiningTable: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: `diningTable/${data.id}`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Dining Table'],
    }),
    deleteDiningTable: builder.mutation<any, { data: any; access_token: string }>({
      query: ({ data, access_token }) => ({
        url: `diningTable/${data.id}`,
        method: 'DELETE',
        body: { data },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Dining Table'],
    }),
    updateDiningTableStatus: builder.mutation<any, { access_token: string; data: any }>({
      query: ({ access_token, data }) => ({
        url: 'diningTable',
        method: 'OPTIONS',
        body: {
          data,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Dining Table'],
      async onQueryStarted(data, { queryFulfilled }) {
        try {
          const updatedProductStatus = await queryFulfilled;

          if (updatedProductStatus.data.message) {
            // toast.success(updatedProductStatus.data.message);
          } else {
            toast.error(updatedProductStatus.data.message);
          }
        } catch (error) {
          if (error instanceof Response) {
            const responseData = await error.json();
            toast.error(responseData?.data.message);
          } else {
            toast.error('An error occurred');
          }
        }
      },
    }),
  }),
});

export const {
  useGetDiningTablesQuery,
  useGetSingleDiningTableQuery,
  useGetDiningTablesWithPaginationQuery,
  useUpdateDiningTableMutation,
  useDeleteDiningTableMutation,
  useAddDiningTableMutation,
  useUpdateDiningTableStatusMutation,
} = diningTableApi;
