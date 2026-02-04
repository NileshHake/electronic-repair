import { apiSlice } from "../api/apiSlice";
import { toast } from "react-toastify";

export const repairApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

    // ✅ REPAIR STORE
    storeRepair: builder.mutation({
      query: (payload) => ({
        url: "/repair/store",
        method: "POST",
        body: payload, // JSON or FormData
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success(" Repair stored successfully!");
        } catch (err) {
          toast.error("❌ Failed to store repair!");
        }
      },
    }),

  }),
});

export const { useStoreRepairMutation } = repairApi;
