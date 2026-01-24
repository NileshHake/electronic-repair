import { apiSlice } from "../api/apiSlice";
import { toast } from "react-toastify";

export const beadingApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ✅ STORE (multipart form-data, multiple images)
    createBeadingRequest: builder.mutation({
      query: (formData) => ({
        url: "/beading/store",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Beading", id: "LIST" }],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("✅ Beading request created!");
        } catch (err) {
          toast.error("❌ Failed to create request!");
        }
      },
    }),

    // ✅ LIST
    getBeadingList: builder.query({
      query: () => "/beading/list",
      providesTags: (result) =>
        Array.isArray(result) && result.length
          ? [
              { type: "Beading", id: "LIST" },
              ...result.map((item) => ({ type: "Beading", id: item.beading_request_id })),
            ]
          : [{ type: "Beading", id: "LIST" }],
    }),

    // ✅ SINGLE
    getBeadingSingle: builder.query({
      query: (id) => `/beading/single/${id}`,
      providesTags: (result, error, id) => [{ type: "Beading", id }],
    }),

    // ✅ UPDATE (multipart optional)
    updateBeadingRequest: builder.mutation({
      query: (payload) => {
        const fd = new FormData();
        fd.append("beading_request_id", payload.beading_request_id);

        if (payload.beading_request_title) fd.append("beading_request_title", payload.beading_request_title);
        if (payload.beading_request_description) fd.append("beading_request_description", payload.beading_request_description);
        if (payload.beading_budget_min) fd.append("beading_budget_min", payload.beading_budget_min);
        if (payload.beading_budget_max) fd.append("beading_budget_max", payload.beading_budget_max);
        if (payload.beading_location) fd.append("beading_location", payload.beading_location);
        if (payload.beading_request_status !== undefined) fd.append("beading_request_status", payload.beading_request_status);
        if (payload.expires_at) fd.append("expires_at", payload.expires_at);

        if (payload.beading_images && payload.beading_images.length > 0) {
          payload.beading_images.forEach((file) => fd.append("beading_images", file));
        }

        return {
          url: "/beading/update",
          method: "PUT",
          body: fd,
        };
      },
      invalidatesTags: (result, error, payload) => [
        { type: "Beading", id: "LIST" },
        { type: "Beading", id: payload?.beading_request_id },
      ],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.info("✏️ Beading request updated!");
        } catch (err) {
          toast.error("❌ Failed to update beading request!");
        }
      },
    }),

    // ✅ DELETE (proper + optimistic remove)
    deleteBeading: builder.mutation({
      query: (id) => ({
        url: `/beading/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Beading", id: "LIST" },
        { type: "Beading", id },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // ✅ optimistic remove from list cache
        const patch = dispatch(
          beadingApi.util.updateQueryData("getBeadingList", undefined, (draft) => {
            if (!Array.isArray(draft)) return;
            const index = draft.findIndex((x) => x.beading_request_id === id);
            if (index !== -1) draft.splice(index, 1);
          })
        );

        try {
          await queryFulfilled;
          toast.success("✅ Beading request deleted!");
        } catch (err) {
          patch.undo();
          toast.error("❌ Failed to delete request!");
        }
      },
    }),

    // ✅ VENDOR ACCEPT
    vendorAcceptBeading: builder.mutation({
      query: (payload) => ({
        url: "/beading/vendor-accept",
        method: "PUT",
        body: payload, // { beading_request_id }
      }),
      invalidatesTags: (result, error, payload) => [
        { type: "Beading", id: "LIST" },
        { type: "Beading", id: payload?.beading_request_id },
      ],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("✅ Request accepted!");
        } catch (err) {
          toast.error("❌ Failed to accept request!");
        }
      },
    }),
  }),
});

export const {
  useCreateBeadingRequestMutation,
  useGetBeadingListQuery,
  useGetBeadingSingleQuery,
  useUpdateBeadingRequestMutation,
  useDeleteBeadingMutation,
  useVendorAcceptBeadingMutation,
} = beadingApi;
