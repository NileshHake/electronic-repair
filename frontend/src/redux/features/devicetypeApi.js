import { apiSlice } from "../api/apiSlice";

export const deviceApi = apiSlice.injectEndpoints({
  overrideExisting:true,
  endpoints: (builder) => ({
    getActiveBrands: builder.query({
      query: () => `https://shofy-backend-dlt.vercel.app/api/brand/active`
    }),
    GetallDeviceType: builder.query({
      query: () => `/device-type/list`
    }),
  }),
});

export const {
  useGetActiveBrandsQuery,
  useGetallDeviceTypeQuery,
} = deviceApi;
