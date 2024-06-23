import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const feedbackApi = createApi({
  reducerPath: 'feedbackApi',
  refetchOnFocus: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
  }),
  tagTypes: ['Feedback'],
  endpoints: (builder) => ({
    getFeedbacks: builder.query<
      any,
      {
        page: number;
        limit: number;
        end_time?: string;
        start_time?: string;
        labelSentiment?: string;
        sort_by_date?: string;
      }
    >({
      query: (arg) =>
        `feedback?page=${arg.page}&limit=${arg.limit}&labelSentiment=${arg.labelSentiment}&sortBy=createdAt:${arg.sort_by_date}&endDate=${arg.end_time}&startDate=${arg.start_time}`,
      providesTags: ['Feedback'],
    }),
    getLabelCount: builder.query<any, { start_time?: string; end_time?: string }>({
      query: (arg) => `overview?startDate=${arg.start_time}&endDate=${arg.end_time}`,
      providesTags: ['Feedback'],
    }),
    getSingleFeedback: builder.query<any, { id: string }>({
      query: ({ id }) => `feedback?id=${id}`,
      providesTags: ['Feedback'],
    }),
    createFeedback: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: 'feedback',
        method: 'POST',
        body: {
          data,
        },
      }),
      invalidatesTags: ['Feedback'],
    }),
    updateFeedback: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: 'feedback',
        method: 'PUT',
        body: {
          data,
        },
      }),
      invalidatesTags: ['Feedback'],
    }),
  }),
});
export const {
  useGetFeedbacksQuery,
  useGetSingleFeedbackQuery,
  useCreateFeedbackMutation,
  useUpdateFeedbackMutation,
  useGetLabelCountQuery,
} = feedbackApi;
