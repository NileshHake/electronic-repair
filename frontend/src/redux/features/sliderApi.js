import { apiSlice } from "../api/apiSlice";

export const sliderApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Get all sliders
    GetSliders: builder.query({
      query: () => {
     
        return "/slider/home-list";
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
