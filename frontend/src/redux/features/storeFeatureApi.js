import { apiSlice } from "../api/apiSlice";

export const storeFeatureApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // 🔹 Get store feature list
    getStoreFeatureList: builder.query({
      query: () => "/store-feature/list",
    }),
  }),
});

export const {
  useGetStoreFeatureListQuery,
} = storeFeatureApi;
