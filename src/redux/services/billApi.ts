import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const billApi = createApi({
  reducerPath: 'billApi',
  refetchOnFocus: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
  }),
  tagTypes: ['Bill'],
  endpoints: (builder) => ({
    getBills: builder.query<
      any,
      {
        page: number;
        limit: number;
        search?: string;
        order_statuses?: string;
        payment_statuses?: string;
        end_time?: string;
        start_time?: string;
        access_token: string;
      }
    >({
      query: (arg) => ({
        url: `bill?page=${arg.page}&limit=${arg.limit}&search=${arg.search}&payment_statuses=${arg.payment_statuses}&order_statuses=${arg.order_statuses}&end_time=${arg.end_time}&start_time=${arg.start_time}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${arg.access_token}`,
        },
      }),
      providesTags: ['Bill'],
    }),
    getSingleBill: builder.query<any, { id: string }>({
      query: (arg) => `bill/${arg.id}`,
      providesTags: ['Bill'],
    }),
    addBill: builder.mutation<any, { data: object }>({
      query: ({ data }) => ({
        url: 'bill',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      // invalidatesTags: ['Bill'],
    }),
    updateBill: builder.mutation<any, { data: object }>({
      query: ({ data }) => ({
        url: 'bill',
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Bill'],
    }),
    refundBill: builder.mutation<any, { data: object; access_token: string }>({
      query: ({ data, access_token }) => ({
        url: 'refund',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Bill'],
    }),
    cancelBill: builder.mutation<any, { id: string; access_token: string }>({
      query: ({ id, access_token }) => ({
        url: `bill/${id}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Bill'],
    }),
    changeTableBill: builder.mutation<any, { data: object; id: string; access_token: string }>({
      query: ({ data, id, access_token }) => ({
        url: `diningTable/${id}`,
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Bill'],
    }),
    changeDiscount: builder.mutation<any, { data: object; id: string; access_token: string }>({
      query: ({ data, id, access_token }) => ({
        url: `discount/${id}`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Bill'],
    }),
    changeCustomerName: builder.mutation<any, { data: object }>({
      query: ({ data }) => ({
        url: `customer`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Bill'],
    }),
    createPayment: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: 'payment',
        method: 'POST',
        body: data,
      }),
      // invalidatesTags: ['Bill'],
    }),
    createCashPaymentReceipt: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `receipt/${id}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Bill'],
    }),
    reopenBill: builder.mutation<any, { id: string; access_token: string }>({
      query: ({ id, access_token }) => ({
        url: `reopenBill/${id}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Bill'],
    }),
    changeItemQuantity: builder.mutation<any, { data: object; access_token: string }>({
      query: ({ data, access_token }) => ({
        url: `item`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: data,
      }),
      invalidatesTags: ['Bill'],
    }),
    deleteBill: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: `bill${data.id}`,
        method: 'DELETE',
        body: {
          data,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Bill'],
    }),
    createTaxInvoice: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: 'taxinvoice',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Bill'],
    }),
  }),
});

export const {
  useGetBillsQuery,
  useGetSingleBillQuery,
  useChangeTableBillMutation,
  useChangeDiscountMutation,
  useReopenBillMutation,
  useChangeCustomerNameMutation,
  useRefundBillMutation,
  useAddBillMutation,
  useCancelBillMutation,
  useCreatePaymentMutation,
  useCreateCashPaymentReceiptMutation,
  useChangeItemQuantityMutation,
  useDeleteBillMutation,
  useUpdateBillMutation,
  useCreateTaxInvoiceMutation,
} = billApi;
