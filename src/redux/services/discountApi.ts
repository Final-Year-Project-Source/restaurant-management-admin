import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const discountApi = createApi({
  reducerPath: 'discountApi',
  refetchOnFocus: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
  }),
  tagTypes: ['Discount'],
  endpoints: (builder) => ({
    getDiscounts: builder.query<any, void>({
      query: () => 'discount',
      providesTags: ['Discount'],
    }),
    getSingleDiscount: builder.query<any, { id: string }>({
      query: ({ id }) => `discount/${id}`,
      providesTags: ['Discount'],
    }),
    addDiscount: builder.mutation<any, { data: any; access_token: string }>({
      query: ({ data, access_token }) => ({
        url: 'discount',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Discount'],
    }),
    updateDiscount: builder.mutation<any, { access_token: string; id: string; body: any }>({
      query: ({ id, body, access_token }) => ({
        url: `discount/${id}`,
        method: 'PATCH',
        body: body,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Discount'],
    }),
    updateRestrictedAccess: builder.mutation<any, { access_token: string; data: any }>({
      query: ({ access_token, data }) => ({
        url: `discount/${data.id}`,
        method: 'PUT',
        body: {
          data,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Discount'],
    }),
    deleteDiscount: builder.mutation<any, { access_token: string; id: string }>({
      query: ({ id, access_token }) => ({
        url: `discount/${id}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Discount'],
    }),
  }),
});

export const {
  useGetDiscountsQuery,
  useGetSingleDiscountQuery,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  useAddDiscountMutation,
  useUpdateRestrictedAccessMutation,
} = discountApi;
