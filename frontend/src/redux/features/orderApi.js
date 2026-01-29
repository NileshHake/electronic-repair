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
      invalidatesTags: ["Order"],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          toast.error("❌ Failed to place order!");
        }
      },
    }),

    // 🔵 GET SINGLE ORDER
    getSingleOrder: builder.query({
      query: (id) => `/order/single/${id}`,
      providesTags: ["Order"],
    }),

    // 🔵 GET USER ORDER LIST
    getUserOrderList: builder.query({
      query: () => "/orders/user-list",
      providesTags: ["Order"],
    }),

    // 🔵 GET ORDER CHILD LIST (POST but still QUERY)
    getOrderChildList: builder.query({
      query: (payload) => ({
        url: "/order/child-list",
        method: "POST",
        body: payload, // { order_id }
      }),
      providesTags: ["Order"],
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
  useGetUserOrderListQuery,
  useGetSingleOrderQuery,
  useGetOrderChildListQuery,   // ✅ query hook
  useDeleteOrderMutation,
} = orderApi;
