import { apiSlice } from "../api/apiSlice";

export const sliderApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Get all sliders
    GetSliders: builder.query({
      query: () => {
        console.log("🔥 GetSliders API called");
        return "/slider/home-list";
      },

      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("✅ Slider API response:", data);
        } catch (err) {
          console.error("❌ Slider API error:", err);
        }
      },
    }),


    GetProductSliders: builder.query({
      query: () => "/slider/product-list", // GET request
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
  useGetProductSlidersQuery,
  useAddSliderMutation,
  useUpdateSliderMutation,
  useDeleteSliderMutation,
} = sliderApi;
