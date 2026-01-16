import { apiSlice } from "../api/apiSlice";
import { toast } from "react-toastify";

export const orderApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

    // 🟢 CREATE ORDER
    createOrder: builder.mutation({
      query: (payload) => ({
        url: "/order/store",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Cart", "Order"],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("✅ Order placed successfully!");
        } catch (err) {
          toast.error("❌ Failed to place order!");
        }
      },
    }),

    // 🟡 GET ALL ORDERS
    getOrderList: builder.query({
      query: () => "/order/list",
      providesTags: ["Order"],
    }),

    // 🔵 GET SINGLE ORDER
    getSingleOrder: builder.query({
      query: (id) => `/order/single/${id}`,
      providesTags: ["Order"],
    }),

    // 🟠 UPDATE ORDER
    updateOrder: builder.mutation({
      query: (payload) => ({
        url: "/order/update",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Order"],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("✏️ Order updated successfully!");
        } catch (err) {
          toast.error("❌ Failed to update order!");
        }
      },
    }),

    // 🔴 DELETE ORDER
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/order/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Order"],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("🗑️ Order deleted successfully!");
        } catch (err) {
          toast.error("❌ Failed to delete order!");
        }
      },
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderListQuery,
  useGetSingleOrderQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = orderApi;
