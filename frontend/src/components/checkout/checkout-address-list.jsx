// components/checkout/CheckoutAddressList.jsx
import { useGetCustomerAddressListQuery, useDeleteCustomerAddressMutation } from "@/redux/features/customerAddressApi";
import React from "react";

const CheckoutAddressList = ({ selectedAddress, setSelectedAddress }) => {
    const { data, isLoading } = useGetCustomerAddressListQuery();
    const [deleteAddress] = useDeleteCustomerAddressMutation();

    if (isLoading) return <p>Loading addresses...</p>;

    const addresses = data || [];

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this address?")) return;
        try {
             
            
            await deleteAddress(id).unwrap();
            // Address list will auto-refresh because of invalidatesTags in API slice
        } catch (err) {
            console.error("Failed to delete address:", err);
        }
    };

    return (
        <div className="tp-checkout-address-wrapper mb-4">
            <h3 className="tp-checkout-title mb-3">Select Delivery Address</h3>

            {addresses.length === 0 && (
                <p className="text-muted">No address found. Please add one.</p>
            )}

            {addresses.map((address) => {
                const isSelected = selectedAddress === address.customer_address_id;

                return (
                    <div
                        key={address.customer_address_id}
                        className={`tp-checkout-address-box mb-3 p-3 rounded border d-block cursor-pointer position-relative ${isSelected ? "border-primary bg-light" : ""}`}
                        style={{ transition: "0.2s ease" }}
                    >
                        <div className="d-flex gap-3 align-items-start">
                            {/* RADIO */}
                            <input
                                type="radio"
                                name="customer_address"
                                checked={isSelected}
                                onChange={() =>
                                    setSelectedAddress(address.customer_address_id)
                                }
                                style={{ marginTop: "6px" }}
                            />

                            {/* ADDRESS DETAILS */}
                            <div className="w-100">
                                <p className="fw-bold mb-2">{address.customer_address_name}</p>

                                <div className="row text-muted">
                                    <div className="col-md-6 mb-1">
                                        <strong>Address:</strong> {address.customer_address_description}
                                    </div>
                                    <div className="col-md-6 mb-1">
                                        <strong>Taluka:</strong> {address.customer_address_taluka}
                                    </div>
                                    <div className="col-md-6 mb-1">
                                        <strong>City:</strong> {address.customer_address_city}
                                    </div>
                                    <div className="col-md-6 mb-1">
                                        <strong>State:</strong> {address.customer_address_state}
                                    </div>
                                    <div className="col-md-6 mb-1">
                                        <strong>Pincode:</strong> {address.customer_address_pincode}
                                    </div>
                                    <div className="col-md-6 mb-1">
                                        <strong>Mobile:</strong> {address.customer_address_mobile}
                                    </div>
                                </div>
                            </div>

                            {/* DELETE BUTTON */}
                            <button
                                onClick={() => handleDelete(address. customer_address_id)}
                                className="btn btn-sm btn-danger position-absolute"
                                style={{ top: "10px", right: "10px" }}
                                title="Delete Address"
                            >
                                <i className="fas fa-trash"></i>
                            </button>

                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CheckoutAddressList;
