import { apiSlice } from "../api/apiSlice";

export const categoryApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Add category
    addCategory: builder.mutation({
      query: (data) => ({
        url: "/category/add",
        method: "POST",
        body: data,
      }),
    }),

    // Get main categories with subcategories
    getCategoriesWithSub: builder.query({
      query: () => {
        console.log("Query called!");
        return "/categories-with-sub"; // endpoint path
      },
    }),


    // Optional: Get categories by type (if needed)
    getProductTypeCategory: builder.query({
      query: (type) => `/category/show/${type}`,
    }),
  }),
});

export const {
  useAddCategoryMutation,
  useGetCategoriesWithSubQuery,
  useGetProductTypeCategoryQuery,
} = categoryApi;
