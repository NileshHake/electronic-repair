import { apiSlice } from "../api/apiSlice";
import { toast } from "react-toastify";

export const customerAddressApi = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({

        // STORE CUSTOMER ADDRESS
        storeCustomerAddress: builder.mutation({
            query: (payload) => ({
                url: "/customer-address/store",
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["CustomerAddress"],
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success(" Address added successfully!");
                } catch (error) {
                    toast.error("❌ Failed to add address!");
                }
            },
        }),

        // GET CUSTOMER ADDRESS LIST
        getCustomerAddressList: builder.query({
            query: () => "/customer-address/list",
            providesTags: ["CustomerAddress"],
        }),

        // GET SINGLE CUSTOMER ADDRESS
        getCustomerAddressById: builder.query({
            query: (id) => `/customer-address/single/${id}`,
            providesTags: ["CustomerAddress"],
        }),

        // UPDATE CUSTOMER ADDRESS
        updateCustomerAddress: builder.mutation({
            query: (payload) => ({
                url: "/customer-address/update",
                method: "PUT",
                body: payload,
            }),
            invalidatesTags: ["CustomerAddress"],
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.info("Address updated successfully!");
                } catch (error) {
                    toast.error("❌ Failed to update address!");
                }
            },
        }),

        // DELETE CUSTOMER ADDRESS
        deleteCustomerAddress: builder.mutation({
            query: (id) => {

                return {
                    url: `/customer-address/delete/${id}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: ["CustomerAddress"],
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Address deleted successfully!");
                } catch (error) {
                    toast.error("Failed to delete address!");
                }
            },
        }),


    }),
});

export const {
    useStoreCustomerAddressMutation,
    useGetCustomerAddressListQuery,
    useGetCustomerAddressByIdQuery,
    useUpdateCustomerAddressMutation,
    useDeleteCustomerAddressMutation,
} = customerAddressApi;
