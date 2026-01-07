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

    getOfferProducts: builder.query({
      query: (type) => `https://shofy-backend-dlt.vercel.app/api/product/offer?type=${type}`,
      providesTags: ['OfferProducts']
    }),
    getPopularProductByType: builder.query({
      query: (type) => `https://shofy-backend-dlt.vercel.app/api/product/popular/${type}`,
      providesTags: ['PopularProducts']
    }),
    getTopRatedProducts: builder.query({
      query: () => `https://shofy-backend-dlt.vercel.app/api/product/top-rated`,
      providesTags: ['TopRatedProducts']
    }),
    // get single product
    getProduct: builder.query({
      query: (id) => `https://shofy-backend-dlt.vercel.app/api/product/single-product/${id}`,
      providesTags: (result, error, arg) => [{ type: "Product", id: arg }],
      invalidatesTags: (result, error, arg) => [
        { type: "RelatedProducts", id: arg },
      ],
    }),
    // get related products
    getRelatedProducts: builder.query({
      query: (id) => `https://shofy-backend-dlt.vercel.app/api/product/related-product/${id}`,
      providesTags: (result, error, arg) => [
        { type: "RelatedProducts", id: arg },
      ],
    }),
  }),
});
export const {
  useGetAllProductsQuery,
  useGetLatestProductsQuery,
  useGetProductTypeQuery,
  useGetOfferProductsQuery,
  useGetPopularProductByTypeQuery,
  useLazySearchProductsQuery,
  useGetTopRatedProductsQuery,
  useGetProductQuery,
  useGetRelatedProductsQuery,
} = productApi;
