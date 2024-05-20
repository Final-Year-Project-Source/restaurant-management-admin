import { GroupType } from '@/types/groups.types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const groupApi = createApi({
  reducerPath: 'groupApi',
  refetchOnFocus: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
  }),
  tagTypes: ['Group'],
  endpoints: (builder) => ({
    getGroups: builder.query<any, void>({
      query: () => {
        return {
          url: 'group',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      providesTags: ['Group'],
    }),

    updateGroups: builder.mutation<any, { access_token: string; data: GroupType[] }>({
      query: ({ access_token, data }) => ({
        url: `group`,
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Group'],
    }),
  }),
});

export const { useGetGroupsQuery, useUpdateGroupsMutation } = groupApi;
