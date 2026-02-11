import { apiSlice } from "../api/apiSlice";
import { toast } from "react-toastify";

export const quotationApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    /* 🟢 CREATE QUOTATION */
    createQuotation: builder.mutation({
      query: (payload) => ({
        url: "/quotation/store",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Quotation", id: "LIST" }],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("✅ Quotation created successfully!");
        } catch (err) {
          toast.error("❌ Failed to create quotation!");
        }
      },
    }),

    /* 🔵 CUSTOMER QUOTATION LIST */
    getCustomerQuotations: builder.query({
      query: () => "/quotation/customer-list",
      providesTags: [{ type: "Quotation", id: "LIST" }],
    }),

    /* 🧾 DOWNLOAD PDF (Blob) */
    downloadQuotationInvoice: builder.query({
      async queryFn(quotationId, api, extraOptions, baseQuery) {
        try {
          const result = await baseQuery(
            {
              url: `/quotation/${quotationId}/invoice`,
              method: "GET",
              // ✅ IMPORTANT: return Blob, not JSON
              responseHandler: (response) => response.blob(),
            },
            api,
            extraOptions
          );

          if (result.error) return { error: result.error };
          return { data: result.data }; // ✅ Blob
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
});

export const {
  useCreateQuotationMutation,
  useGetCustomerQuotationsQuery,
  useLazyDownloadQuotationInvoiceQuery,
} = quotationApi;
