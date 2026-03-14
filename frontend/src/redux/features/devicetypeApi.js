import { apiSlice } from "../api/apiSlice";

export const deviceTypeApi = apiSlice.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({

    getDeviceTypes: builder.query({
      query: () => `/device-type/list`,
    }),

    searchDeviceType: builder.query({
      query: (search) => `/device-type/search?search=${search}`,
    }),

  }),
});

export const {
  useGetDeviceTypesQuery,
  useLazySearchDeviceTypeQuery, // ✅ lazy search
} = deviceTypeApi;