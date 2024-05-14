import { CategoryType } from '@/types/categories.types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  refetchOnFocus: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
  }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategories: builder.query<any, void>({
      query: () => {
        return {
          url: 'category',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      providesTags: ['Category'],
    }),
    //get all categories including deleted
    getAllCategories: builder.query<any, void>({
      query: () => {
        return {
          url: 'category',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      providesTags: ['Category'],
    }),
    getCategoriesById: builder.query<any, { id: string }>({
      query: ({ id }) => ({
        url: `category/${id}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      providesTags: ['Category'],
    }),
    createNewCategory: builder.mutation<any, { access_token: string; data: object }>({
      query: ({ access_token, data }) => ({
        url: `category`,
        method: 'POST',
        body: data,

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<any, { access_token: string; data: CategoryType[] }>({
      query: ({ access_token, data }) => ({
        url: `category`,
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<any, { access_token: string; data: object }>({
      query: ({ access_token, data }) => ({
        url: `category`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: { data },
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetAllCategoriesQuery,
  useGetCategoriesByIdQuery,
  useCreateNewCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
