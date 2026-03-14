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
      providesTags: ["Products"],
    }),

    searchProducts: builder.query({
      query: ({ search, type = "search" }) => ({
        url: "/search-products",
        method: "POST",
        body: { search, type },
      }),
    }),

    getProductType: builder.query({
      query: ({ type, query }) => ({
        url: "/trending-product-filter",
        method: "POST",
        body: { type, query },
      }),
      providesTags: ["ProductType"],
    }),

    getProductsForQuotation: builder.query({
      query: (body) => ({
        url: "/product/quotation/filter",
        method: "POST",
        body,
      }),
      providesTags: ["Products"],
    }),

    /* ✅ CCTV Quotation Products (Main + Sub both) */
    getCctvProductsForQuotation: builder.query({
      query: ({ category_id, main_category_id }) => ({
        url: "/products/cctv-quotation",
        method: "POST",
        body: {
          category_id: Number(category_id),
          main_category_id: Number(main_category_id || category_id),
        },
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

  // ✅ CCTV hooks
  useGetCctvProductsForQuotationQuery,
  useLazyGetCctvProductsForQuotationQuery,
} = productApi;
