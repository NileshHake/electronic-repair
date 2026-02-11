import { apiSlice } from "../api/apiSlice";

export const productApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: (body) => ({
        url: "/filter-products",
        method: "POST",
        body,
      }),
      providesTags: ["Products"],
    }),
    getLatestProducts: builder.query({
      query: () => `product/latest-list`,
      providesTags: ['Products']
    }),
    searchProducts: builder.query({
      query: (search) => ({
        url: "/search-products",
        method: "POST",
        body: { search },
      }),
    }),
    getProductType: builder.query({
      query: ({ type, query }) => ({
        url: "/trending-product-filter",
        method: "POST",
        body: {
          type,
          query,
        },
      }),
      providesTags: ["ProductType"],
    }),
    getProductsForQuotation: builder.query({
      query: (body) => ({
        url: "/product/quotation/filter",   // ✅ your new route
        method: "POST",
        body,
      }),
      providesTags: ["Products"],
    }),
  }),
});
export const {
  useGetAllProductsQuery,
  useGetLatestProductsQuery,
  useGetProductTypeQuery,
useGetProductsForQuotationQuery,
  useLazySearchProductsQuery,

} = productApi;
