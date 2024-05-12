import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const kdsApi = createApi({
  reducerPath: 'kdsApi',
  refetchOnFocus: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
  }),
  tagTypes: ['Kds'],
  endpoints: (builder) => ({
    getOrders: builder.query<
      any,
      {
        search?: string;
        order_statuses?: string[];
        group_filter?: string[];
        end_time?: string;
        start_time?: string;
        access_token: string;
      }
    >({
      query: (arg) => ({
        url: `kds?search=${arg.search}&group_filter=${arg.group_filter}&order_statuses=${arg.order_statuses}&end_time=${arg.end_time}&start_time=${arg.start_time}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${arg.access_token}`,
        },
      }),
      providesTags: ['Kds'],
    }),
    changeStatusItem: builder.mutation<any, { data: object }>({
      query: ({ data }) => ({
        url: 'item',
        method: 'POST',
        body: {
          data,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Kds'],
    }),
    getGroups: builder.query<any, void>({
      query: () => ({
        url: 'group',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      // invalidatesTags: ['Kds'],
    }),
  }),
});

export const { useGetOrdersQuery, useChangeStatusItemMutation, useGetGroupsQuery } = kdsApi;
