import {  createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({
        url: '/products',
        params: {
          page: params?.page,
          keyword: params?.keyword,
          "price[gte]": params.min,
          "price[lte]": params.max,
          "ratings[gte]": params.ratings,
          category: params.category,
        },
      }),
      keepUnusedDataFor: 300, // cache for 1 minute
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
    }),
  }),
});


export const { useGetProductsQuery, useGetProductByIdQuery } = productApi;