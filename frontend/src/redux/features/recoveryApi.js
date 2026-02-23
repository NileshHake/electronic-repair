import { apiSlice } from "../api/apiSlice";
import { toast } from "react-toastify";

export const recoveryApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

    // =============================
    // ✅ STORE RECOVERY
    // =============================
    storeRecovery: builder.mutation({
      query: (payload) => ({
        url: "/recovery/store",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Recovery"],  

      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Recovery stored successfully!");
        } catch (err) {
          toast.error("Failed to store recovery!");
        }
      },
    }),

    // =============================
    // ✅ GET CURRENT USER RECOVERIES
    // =============================
    getMyRecoveries: builder.query({
      query: () => ({
        url: "/recovery/my",
        method: "GET",
      }),
      providesTags: ["Recovery"],

      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          toast.error("Failed to fetch recoveries!");
        }
      },
    }),

  }),
});

export const {
  useStoreRecoveryMutation,
  useGetMyRecoveriesQuery,
} = recoveryApi;