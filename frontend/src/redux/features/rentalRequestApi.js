// src/redux/features/rentalRequestApi.js
import { apiSlice } from "../api/apiSlice";
import { toast } from "react-toastify";

export const rentalRequestApi = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({

        // ✅ STORE
        createRentalRequest: builder.mutation({
            query: (data) => ({
                url: "/rental-request/store",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "RentalRequest", id: "LIST" }],
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;

                } catch (err) {
                    toast.error(
                        err?.error?.data?.message || "❌ Failed to create rental request!"
                    );
                }
            },
        }),
        // ✅ DOWNLOAD INVOICE
        downloadRentalInvoice: builder.mutation({
            query: (id) => ({
                url: `/rental/invoice/${id}`,
                method: "GET",
                responseHandler: (response) => response.blob(), // important for PDF
            }),
            async onQueryStarted(id, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;

                    const blob = new Blob([data], { type: "application/pdf" });
                    const url = window.URL.createObjectURL(blob);

                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `Rental-Invoice-${id}.pdf`;
                    document.body.appendChild(link);
                    link.click();

                    link.remove();
                    window.URL.revokeObjectURL(url);
                } catch (err) {
                    toast.error("❌ Failed to download invoice!");
                }
            },
        }),
        // ✅ LIST
        getRentalRequestList: builder.query({
            query: () => "/rental-web/list",
            providesTags: (result) =>
                Array.isArray(result) && result.length
                    ? [
                        { type: "RentalRequest", id: "LIST" },
                        ...result.map((item) => ({
                            type: "RentalRequest",
                            id: item.rental_request_id,
                        })),
                    ]
                    : [{ type: "RentalRequest", id: "LIST" }],
        }),

        // ✅ SINGLE
        getRentalRequestSingle: builder.query({
            query: (id) => `/rental-request/single/${id}`,
            providesTags: (result, error, id) => [
                { type: "RentalRequest", id },
            ],
        }),

        // ✅ UPDATE
        updateRentalRequest: builder.mutation({
            query: (data) => ({
                url: "/rental-request/update",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, payload) => [
                { type: "RentalRequest", id: "LIST" },
                { type: "RentalRequest", id: payload?.rental_request_id },
            ],
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("✅ Rental request updated!");
                } catch (err) {
                    toast.error(
                        err?.error?.data?.message || "❌ Failed to update rental request!"
                    );
                }
            },
        }),

        // ✅ DELETE
        deleteRentalRequest: builder.mutation({
            query: (id) => ({
                url: `/rental-request/delete/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "RentalRequest", id: "LIST" },
                { type: "RentalRequest", id },
            ],
            async onQueryStarted(id, { dispatch, queryFulfilled }) {

                // optimistic update
                const patch = dispatch(
                    rentalRequestApi.util.updateQueryData(
                        "getRentalRequestList",
                        undefined,
                        (draft) => {
                            if (!Array.isArray(draft)) return;

                            const index = draft.findIndex(
                                (x) => Number(x?.rental_request_id) === Number(id)
                            );

                            if (index !== -1) draft.splice(index, 1);
                        }
                    )
                );

                try {
                    await queryFulfilled;
                    toast.success("✅ Rental request deleted!");
                } catch (err) {
                    patch.undo();
                    toast.error(
                        err?.error?.data?.message || "❌ Failed to delete rental request!"
                    );
                }
            },
        }),

    }),
});

export const {
    useCreateRentalRequestMutation,
    useGetRentalRequestListQuery,
    useGetRentalRequestSingleQuery,
    useUpdateRentalRequestMutation,
    useDeleteRentalRequestMutation,
    useDownloadRentalInvoiceMutation,
} = rentalRequestApi;