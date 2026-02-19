import { apiSlice } from "../api/apiSlice";

export const categoryApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

    // ✅ Add category
    addCategory: builder.mutation({
      query: (data) => ({
        url: "/category/add",
        method: "POST",
        body: data,
      }),
    }),

    // ✅ Get main categories with subcategories
    getCategoriesWithSub: builder.query({
      query: () => "/categories-with-sub",
    }),

    // ✅ Get categories by type
    getProductTypeCategory: builder.query({
      query: (type) => `/category/show/${type}`,
    }),

    // ✅ NEW: Get all categories list
    getCategoryList: builder.query({
      query: () => "/category/list",
    }),

  }),
});

export const {
  useAddCategoryMutation,
  useGetCategoriesWithSubQuery,
  useGetProductTypeCategoryQuery,
  useGetCategoryListQuery, // ✅ export hook
} = categoryApi;
