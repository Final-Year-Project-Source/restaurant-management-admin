import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify';

export const productApi = createApi({
  reducerPath: 'api',
  refetchOnFocus: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
  }),
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    getProducts: builder.query<
      any,
      {
        is_be: boolean;
        page: number;
        limit: number;
        search?: string;
        category_filter?: string;
        group_filter?: string;
        stock_filter?: string;
      }
    >({
      query: (arg) => ({
        url: `product?is_be=${arg.is_be}&page=${arg.page}&limit=${arg.limit}&search=${arg.search}&category_filter=${arg.category_filter}&group_filter=${arg.group_filter}&stock_filter=${arg.stock_filter}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      providesTags: ['Product'],
    }),
    getQuantityInStock: builder.query<
      any,
      {
        quantity_in_stock: boolean;
      }
    >({
      query: ({ quantity_in_stock }) => ({
        url: `product?quantity_in_stock=${quantity_in_stock}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      providesTags: ['Product'],
    }),
    getSingleProduct: builder.query<any, { id: string }>({
      query: (arg) => `product?id=${arg.id}`,
      providesTags: ['Product'],
    }),
    addProduct: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: 'product',
        method: 'POST',
        body: {
          data,
        },
      }),
      invalidatesTags: ['Product'],
      async onQueryStarted(args, { queryFulfilled }) {
        try {
          const { data: createdProduct } = await queryFulfilled;
          if (!createdProduct.success) {
            toast.error(createdProduct.message);
          }
        } catch (error) {
          if (error instanceof Response) {
            const responseData = await error.json();
            toast.error(responseData?.data.message);
          } else {
            console.error(error);
            // toast.error('An error occurred');
          }
        }
      },
    }),

    updateProduct: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: `product?id=${data.id}`,
        method: 'POST',
        body: {
          data,
        },
        // headers: {
        //   'Content-Type': 'application/json',
        //   Authorization: `Bearer ${access_token}`,
        // },
      }),
      invalidatesTags: ['Product'],

      async onQueryStarted(args: { access_token: string; data: any; id: string }, { queryFulfilled, dispatch }) {
        try {
          const { data: updatedProduct } = await queryFulfilled;
          if (!updatedProduct.success) {
            toast.error(updatedProduct.message);
          }
        } catch (error) {
          if (error instanceof Response) {
            const responseData = await error.json();
            toast.error(responseData?.data.message);
          } else {
            console.error(error);
            // toast.error('An error occurred');
          }
        }
      },
    }),
    deleteProduct: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `product?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],

      async onQueryStarted(data, { queryFulfilled }) {
        try {
          const deletedProduct = await queryFulfilled;

          if (!deletedProduct.data.message) {
            toast.error(deletedProduct.data.message);
          }
        } catch (error) {
          if (error instanceof Response) {
            const responseData = await error.json();
            toast.error(responseData?.data.message);
          } else {
            console.error(error);
            toast.error('An error occurred');
          }
        }
      },
    }),
    updateProductStatus: builder.mutation<any, { id: string; data: any; access_token: string }>({
      query: ({ data, access_token, id }) => ({
        url: `product?id=${id}`,
        method: 'PATCH',
        body: {
          data,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Product'],

      async onQueryStarted(data, { queryFulfilled }) {
        try {
          const updatedProductStatus = await queryFulfilled;

          if (!updatedProductStatus.data.message) {
            toast.error(updatedProductStatus.data.message);
          }
        } catch (error) {
          if (error instanceof Response) {
            const responseData = await error.json();
            toast.error(responseData?.data.message);
          } else {
            console.error(error);
            toast.error('An error occurred');
          }
        }
      },
    }),
    uploadImage: builder.mutation<any, { id: string; image_file: any }>({
      query: ({ id, image_file }) => {
        let formData = new FormData();
        formData.append('image_file', image_file);
        return {
          url: `uploadImageProduct?id=${id}`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Product'],
      async onQueryStarted(args, { queryFulfilled }) {
        try {
          const { data: uploadedImage } = await queryFulfilled;
          if (!uploadedImage.success) {
            toast.error(uploadedImage.message);
          }
        } catch (error) {
          if (error instanceof Response) {
            const responseData = await error.json();
            toast.error(responseData?.data.message);
          } else {
            console.error(error);
            // toast.error('An error occurred');
          }
        }
      },
    }),
    deleteImageProduct: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `uploadImageProduct?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    getFilteredProducts: builder.query<any, { search?: string; dietary_restrictions?: string[]; proteins?: string[] }>({
      query: ({ search, dietary_restrictions, proteins }) => {
        let queryString = 'product?';
        if (search) queryString += `&search=${encodeURIComponent(search)}`;
        if (dietary_restrictions && dietary_restrictions?.length > 0)
          queryString += `&dietary_restrictions=${encodeURIComponent(
            JSON.stringify(dietary_restrictions.map((r) => r.toLowerCase())),
          )}`;
        if (proteins && proteins?.length > 0)
          queryString += `&proteins=${encodeURIComponent(JSON.stringify(proteins.map((p) => p.toLowerCase())))}`;
        return queryString;
      },
      providesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetSingleProductQuery,
  useUpdateProductMutation,
  useAddProductMutation,
  useDeleteProductMutation,
  useUpdateProductStatusMutation,
  useUploadImageMutation,
  useGetFilteredProductsQuery,
  useGetQuantityInStockQuery,
  useDeleteImageProductMutation,
} = productApi;
