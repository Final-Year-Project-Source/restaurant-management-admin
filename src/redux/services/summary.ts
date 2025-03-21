import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const summaryApi = createApi({
  reducerPath: 'summaryApi',
  refetchOnFocus: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
  }),
  tagTypes: ['Summary'],
  endpoints: (builder) => ({
    getSalesSummary: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        start_time?: string;
        end_time?: string;
        end_hour?: number;
        start_hour?: number;
      }
    >({
      query: (arg) => {
        return {
          url: `salesSummary?page=${arg.page}&limit=${arg.limit}&start_time=${arg.start_time}&end_time=${arg.end_time}&start_hour=${arg.start_hour}&end_hour=${arg.end_hour}`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      providesTags: ['Summary'],
    }),
    getSalesByItem: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        start_time?: string;
        end_time?: string;
        category_filter?: string;
        search?: string;
        sort_by_net_sales?: string;
        sort_by_est_profit?: string;
        sort_by_no_sold?: string;
      }
    >({
      query: (arg) => ({
        url: `salesByItem?page=${arg.page}&limit=${arg.limit}&category_filter=${arg.category_filter}${
          arg.sort_by_no_sold ? `&sort_by_no_sold=${arg.sort_by_no_sold}` : ''
        }${arg.sort_by_net_sales ? `&sort_by_net_sales=${arg.sort_by_net_sales}` : ''}${
          arg.sort_by_est_profit ? `&sort_by_est_profit=${arg.sort_by_est_profit}` : ''
        }&search=${arg.search}&start_time=${arg.start_time}&end_time=${arg.end_time}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      providesTags: ['Summary'],
    }),
  }),
});

export const { useGetSalesByItemQuery, useGetSalesSummaryQuery } = summaryApi;
