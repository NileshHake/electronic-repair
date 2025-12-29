import { apiSlice } from "../api/apiSlice";

export const sliderApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Get all sliders
    getSliders: builder.query({
      query: () => "/slider/web/list", // GET request
    }),

    // Add slider
    addSlider: builder.mutation({
      query: (formData) => ({
        url: "/slider/store",
        method: "POST",
        body: formData, // formData for file upload
      }),
    }),

    // Update slider
    updateSlider: builder.mutation({
      query: (formData) => ({
        url: "/slider/update",
        method: "PUT",
        body: formData,
      }),
    }),

    // Delete slider
    deleteSlider: builder.mutation({
      query: (id) => ({
        url: `/slider/delete/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetSlidersQuery,
  useAddSliderMutation,
  useUpdateSliderMutation,
  useDeleteSliderMutation,
} = sliderApi;
