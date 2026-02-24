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
        url: "/repairs/my",
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

    // =============================
    // ✅ DOWNLOAD QUOTATION/BILL PDF
    // URL: /quotationAndBill/pdf/:id
    // =============================
    downloadQuotationBillPdf: builder.query({
      query: (id) => ({
        url: `/quotationAndBill/pdf/${id}`,
        method: "GET",
        // ✅ IMPORTANT for PDF
        responseHandler: (response) => response.blob(),
      }),
      // don't cache blob results too aggressively
      keepUnusedDataFor: 0,

      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          toast.error("Failed to download PDF!");
        }
      },
    }),

  }),
});

export const {
  useStoreRepairMutation,
  useGetMyRepairsQuery,

  // ✅ export hook
  useLazyDownloadQuotationBillPdfQuery,
  useDownloadQuotationBillPdfQuery,
} = repairApi;