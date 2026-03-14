// src/redux/features/amcRequestApi.js
import { apiSlice } from "../api/apiSlice";
import { toast } from "react-toastify";

export const amcRequestApi = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        //  STORE
        createAmcRequest: builder.mutation({
            query: (data) => ({
                url: "/amc-request/store",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "AmcRequest", id: "LIST" }],
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success(" AMC request created!");
                } catch (err) {
                    toast.error(err?.error?.data?.message || "❌ Failed to create AMC request!");
                }
            },
        }),

        //  LIST
        getAmcRequestList: builder.query({
            query: () => "/amc-request/list",
            providesTags: (result) =>
                Array.isArray(result) && result.length
                    ? [
                        { type: "AmcRequest", id: "LIST" },
                        ...result.map((item) => ({
                            type: "AmcRequest",
                            id: item.request_id, // adjust if pk differs
                        })),
                    ]
                    : [{ type: "AmcRequest", id: "LIST" }],
        }),

        //  SINGLE
        getAmcRequestSingle: builder.query({
            query: (id) => `/amc-request/single/${id}`,
            providesTags: (result, error, id) => [{ type: "AmcRequest", id }],
        }),

        //  UPDATE

        updateAmcQuotationStatus: builder.mutation({
            query: (data) => ({
                url: "/amc-quotation-status/update",
                method: "PUT",   // change to POST if your backend uses POST
                body: data,
            }),

            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Quotation status updated!");
                } catch (err) {
                    toast.error(
                        err?.error?.data?.message || "❌ Failed to update quotation status!"
                    );
                }
            },
        }),
        updateAmcRequest: builder.mutation({
            query: (data) => ({
                url: "/amc-request/update",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, payload) => [
                { type: "AmcRequest", id: "LIST" },
                { type: "AmcRequest", id: payload?.request_id },
            ],
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success(" AMC request updated!");
                } catch (err) {
                    toast.error(err?.error?.data?.message || "❌ Failed to update AMC request!");
                }
            },
        }),
        getChildAmcRequests: builder.query({
            query: (id) => `/amc-request/child-list/${id}`,

            providesTags: (result, error, id) => {

                if (!Array.isArray(result)) {
                    return [{ type: "AmcRequest", id: `CHILD_LIST_${id}` }];
                }

                return [
                    ...result.map((item) => ({
                        type: "AmcRequest",
                        id: item.request_id
                    })),
                    { type: "AmcRequest", id: `CHILD_LIST_${id}` }
                ];
            },
        }),
        // AMC QUOTATION DETAILS
        getAmcQuotationDetails: builder.query({
            query: (id) => `/amc-quotation/details/${id}`,

            providesTags: (result, error, id) => [
                { type: "AmcQuotation", id }
            ],
        }),
        //  DELETE
        deleteAmcRequest: builder.mutation({
            query: (id) => ({
                url: `/amc-request/delete/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "AmcRequest", id: "LIST" },
                { type: "AmcRequest", id },
            ],
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patch = dispatch(
                    amcRequestApi.util.updateQueryData(
                        "getAmcRequestList",
                        undefined,
                        (draft) => {
                            if (!Array.isArray(draft)) return;
                            const index = draft.findIndex(
                                (x) => Number(x?.request_id) === Number(id)
                            );
                            if (index !== -1) draft.splice(index, 1);
                        }
                    )
                );

                try {
                    await queryFulfilled;
                    toast.success(" AMC request deleted!");
                } catch (err) {
                    patch.undo();
                    toast.error(err?.error?.data?.message || "❌ Failed to delete AMC request!");
                }
            },
        }),
    }),
});

export const {
    useCreateAmcRequestMutation,
    useUpdateAmcQuotationStatusMutation,
    useGetAmcRequestListQuery,
    useGetAmcRequestSingleQuery,
    useUpdateAmcRequestMutation,
    useGetChildAmcRequestsQuery,
    useDeleteAmcRequestMutation,
    useGetAmcQuotationDetailsQuery,
} = amcRequestApi;