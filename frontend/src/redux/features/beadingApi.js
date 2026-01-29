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
          toast.success(" Request accepted!");
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
  
  useDeleteBeadingMutation,
  useVendorAcceptBeadingMutation,
} = beadingApi;
