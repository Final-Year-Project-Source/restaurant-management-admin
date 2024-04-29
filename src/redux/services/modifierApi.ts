import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const modifierApi = createApi({
  reducerPath: 'modifierApi',
  refetchOnFocus: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
  }),
  tagTypes: ['Modifier'],
  endpoints: (builder) => ({
    getModifiers: builder.query<any, { search: string }>({
      query: ({ search }) => ({
        url: `modifier?search=${search}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      providesTags: ['Modifier'],
    }),
    getSingleModifier: builder.query<any, { id: string }>({
      query: ({ id }) => `modifier?id=${id}`,
      providesTags: ['Modifier'],
    }),
    addModifier: builder.mutation<any, { access_token: string; data: any }>({
      query: ({ access_token, data }) => ({
        url: 'modifier',
        method: 'POST',
        body: {
          data,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Modifier'],
    }),
    updateModifier: builder.mutation<any, { access_token: string; id: string; data: any }>({
      query: ({ access_token, data, id }) => ({
        url: `modifier?id=${id}`,
        method: 'PATCH',
        body: {
          data,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Modifier'],
    }),
    dragModifier: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: 'modifier',
        method: 'PUT',
        body: {
          data,
        },
      }),
      // invalidatesTags: ['Modifier'],
    }),
    deleteModifier: builder.mutation<any, { data: any; access_token: string }>({
      query: ({ data, access_token }) => ({
        url: `modifier?id=${data.id}`,
        method: 'DELETE',
        body: { data },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Modifier'],
    }),
  }),
});

export const {
  useGetModifiersQuery,
  useGetSingleModifierQuery,
  useUpdateModifierMutation,
  useDeleteModifierMutation,
  useAddModifierMutation,
  useDragModifierMutation,
} = modifierApi;
