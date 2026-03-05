// src/redux/features/rentalDeviceApi.js
import { apiSlice } from "../api/apiSlice";
import { toast } from "react-toastify";

export const rentalDeviceApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ✅ STORE
    createRentalDevice: builder.mutation({
      query: (data) => ({
        url: "/rental-device/store",
        method: "POST",
        body: data, // normal JSON OR formData if you use images
      }),
      invalidatesTags: [{ type: "RentalDevice", id: "LIST" }],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("✅ Rental device created!");
        } catch (err) {
          toast.error(err?.error?.data?.message || "❌ Failed to create rental device!");
        }
      },
    }),

    // ✅ LIST
    getRentalDeviceList: builder.query({
      query: () => "/rental-device/list-index",
      providesTags: (result) =>
        Array.isArray(result) && result.length
          ? [
              { type: "RentalDevice", id: "LIST" },
              ...result.map((item) => ({
                type: "RentalDevice",
                id: item.rental_device_id, // ✅ adjust if your pk name differs
              })),
            ]
          : [{ type: "RentalDevice", id: "LIST" }],
    }),

    // ✅ SINGLE
    getRentalDeviceSingle: builder.query({
      query: (id) => `/rental-device/single/${id}`,
      providesTags: (result, error, id) => [{ type: "RentalDevice", id }],
    }),

    // ✅ UPDATE
    updateRentalDevice: builder.mutation({
      query: (data) => ({
        url: "/rental-device/update",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, payload) => [
        { type: "RentalDevice", id: "LIST" },
        { type: "RentalDevice", id: payload?.rental_device_id },
      ],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("✅ Rental device updated!");
        } catch (err) {
          toast.error(err?.error?.data?.message || "❌ Failed to update rental device!");
        }
      },
    }),

    // ✅ DELETE (optimistic remove like Beading)
    deleteRentalDevice: builder.mutation({
      query: (id) => ({
        url: `/rental-device/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "RentalDevice", id: "LIST" },
        { type: "RentalDevice", id },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // ✅ optimistic remove from list cache
        const patch = dispatch(
          rentalDeviceApi.util.updateQueryData(
            "getRentalDeviceList",
            undefined,
            (draft) => {
              if (!Array.isArray(draft)) return;
              const index = draft.findIndex(
                (x) => Number(x?.rental_device_id) === Number(id)
              );
              if (index !== -1) draft.splice(index, 1);
            }
          )
        );

        try {
          await queryFulfilled;
          toast.success("✅ Rental device deleted!");
        } catch (err) {
          patch.undo();
          toast.error(err?.error?.data?.message || "❌ Failed to delete rental device!");
        }
      },
    }),
  }),
});

export const {
  useCreateRentalDeviceMutation,
  useGetRentalDeviceListQuery,
  useGetRentalDeviceSingleQuery,
  useUpdateRentalDeviceMutation,
  useDeleteRentalDeviceMutation,
} = rentalDeviceApi;