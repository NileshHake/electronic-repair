import { apiSlice } from "../api/apiSlice";
import { toast } from "react-toastify"; // make sure react-toastify is installed

export const cartApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

    // ADD TO CART
    addToCart: builder.mutation({
      query: (payload) => ({
        url: "/add-to-cart/store",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Cart"], // invalidate Cartp    
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("  Product added to cart!");
        } catch (err) {
          toast.error("❌ Failed to add product to cart!");
        }
      },
    }),

    // GET CART LIST
    getCartList: builder.query({
      query: () => "/add-to-cart/list",
      providesTags: ["Cart"], // provide Cart tag
    }),

    // UPDATE CART
    updateCart: builder.mutation({
      query: (payload) => ({
        url: "/add-to-cart/update",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Cart"], // invalidate Cart
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.info("✏️ Cart updated successfully!");
        } catch (err) {
          toast.error("❌ Failed to update cart!");
        }
      },
    }),

    // DELETE CART ITEM
    deleteCartItem: builder.mutation({
      query: (id) => ({
        url: `/add-to-cart/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"], 
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success(" Product removed from cart!");
        } catch (err) {
          toast.error("❌ Failed to remove product!");
        }
      },
    }),
  }),
});

export const {
  useAddToCartMutation,
  useGetCartListQuery,
  useUpdateCartMutation,
  useDeleteCartItemMutation,
} = cartApi;
