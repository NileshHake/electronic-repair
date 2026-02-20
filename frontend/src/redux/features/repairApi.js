import { apiSlice } from "../api/apiSlice";
import { toast } from "react-toastify";

export const repairApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

    // =============================
    // ✅ STORE REPAIR
    // =============================
    storeRepair: builder.mutation({
      query: (payload) => ({
        url: "/repair/store",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Repair"],

      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Repair stored successfully!");
        } catch (err) {
          toast.error("Failed to store repair!");
        }
      },
    }),

    // =============================
    // ✅ GET CURRENT USER REPAIRS
    // =============================
    getMyRepairs: builder.query({
      query: () => ({
        url: "/repairs/my",   // <-- your GET route
        method: "GET",
      }),
      providesTags: ["Repair"],

      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          toast.error("Failed to fetch repairs!");
        }
      },
    }),

  }),
});

export const {
  useStoreRepairMutation,
  useGetMyRepairsQuery,
} = repairApi;
