import { apiSlice } from "../api/apiSlice";
import { toast } from "react-toastify";

export const gstApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ✅ SAVE GST in your DB (upsert per user)
    storeGst: builder.mutation({
      query: (payload) => ({
        url: "/gst/store",
        method: "POST",
        body: payload,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success(data?.message || "GST saved successfully!");
        } catch (err) {
          toast.error(err?.data?.message || err?.error || "Failed to save GST!");
        }
      },
    }),
  }),
});

export const { useStoreGstMutation } = gstApi;