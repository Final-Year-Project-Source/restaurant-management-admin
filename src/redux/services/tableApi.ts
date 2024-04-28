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
    getDiningTables: builder.query<any, void>({
      query: () => ({
        url: 'diningTable?isAll=true',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      providesTags: ['Dining Table'],
    }),
    getDiningTablesWithPagination: builder.query<any, { page: number; limit: number }>({
      query: (arg) => ({
        url: `diningTable?page=${arg.page}&limit=${arg.limit}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      providesTags: ['Dining Table'],
    }),
    getSingleDiningTable: builder.query<any, { id: string }>({
      query: ({ id }) => `diningTable?id=${id}`,
      providesTags: ['Dining Table'],
    }),
    addDiningTable: builder.mutation<any, { access_token: string; data: any }>({
      query: ({ access_token, data }) => ({
        url: 'diningTable',
        method: 'POST',
        body: {
          data,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Dining Table'],
    }),
    updateDiningTable: builder.mutation<any, { access_token: string; data: any }>({
      query: ({ access_token, data }) => ({
        url: `diningTable?id=${data.id}`,
        method: 'PUT',
        body: {
          data,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Dining Table'],
    }),
    deleteDiningTable: builder.mutation<any, { data: any; access_token: string }>({
      query: ({ data, access_token }) => ({
        url: `diningTable?id=${data.id}`,
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
