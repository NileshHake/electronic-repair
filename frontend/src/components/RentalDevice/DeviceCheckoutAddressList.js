import React, { useMemo } from "react";
import Select from "react-select";
import {
    useGetCustomerAddressListQuery,
    useDeleteCustomerAddressMutation,
} from "@/redux/features/customerAddressApi";

const DeviceCheckoutAddressList = ({ selectedAddress, setSelectedAddress }) => {
    const { data, isLoading, isError } = useGetCustomerAddressListQuery();
    const [deleteAddress, { isLoading: isDeleting }] =
        useDeleteCustomerAddressMutation(); 

    const addresses = Array.isArray(data) ? data : [];

    // ✅ react-select options
    const options = useMemo(() => {
        return addresses.map((a) => ({
            value: a.customer_address_id, // ✅ value = id
            label: `${a.customer_address_city || "-"} - ${a.customer_address_pincode || "-"}`, // ✅ label
            meta: a, // keep full object if needed
        }));
    }, [addresses]);

    // ✅ selected option find
    const selectedOption = useMemo(() => {
        return options.find((o) => Number(o.value) === Number(selectedAddress)) || null;
    }, [options, selectedAddress]);

    const handleDelete = async () => {
        if (!selectedAddress) {
            alert("Please select an address first");
            return;
        }
        if (!confirm("Are you sure you want to delete this address?")) return;

        try {
            await deleteAddress(selectedAddress).unwrap();
            setSelectedAddress(null); // ✅ clear selection
        } catch (err) {
            console.error("Failed to delete address:", err);
        }
    };

    if (isLoading) return <p>Loading addresses...</p>;
    if (isError) return <p className="text-danger">Failed to load addresses</p>;

    return (
        <div className="card shadow-sm p-3">
            <div className=" mb-2">
                <h4 className=" text-center">  Delivery Address</h4>

            </div>

            {addresses.length === 0 ? (
                <div className="alert alert-light border mb-0">
                    No address found. Please add one.
                </div>
            ) : (
                <>
                    {/* ✅ REACT SELECT */}
                    <Select
                        options={options}
                        value={selectedOption}
                        placeholder="Select address (City - Pincode)"
                        onChange={(opt) => setSelectedAddress(opt?.value || null)}
                        isClearable
                        classNamePrefix="rentalAddressSelect"
                    />

                    {/* ✅ SHOW SELECTED ADDRESS DETAILS */}
                    {selectedOption?.meta && (
                        <div className="border rounded bg-white p-3 mt-3">
                            <div className="fw-bold mb-1">
                                {selectedOption.meta.customer_address_name || "Address"}
                            </div>
                            <div className="text-muted small mb-2">
                                {selectedOption.meta.customer_address_description}
                            </div>

                            <div className="row g-2 small">
                                <div className="col-6">
                                    <div className="text-muted">City</div>
                                    <div className="fw-semibold">
                                        {selectedOption.meta.customer_address_city || "-"}
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-muted">Pincode</div>
                                    <div className="fw-semibold">
                                        {selectedOption.meta.customer_address_pincode || "-"}
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-muted">State</div>
                                    <div className="fw-semibold">
                                        {selectedOption.meta.customer_address_state || "-"}
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-muted">Mobile</div>
                                    <div className="fw-semibold">
                                        {selectedOption.meta.customer_address_mobile || "-"}
                                    </div>
                                </div>
                            </div>

                            {/* ✅ DELETE BUTTON */}
                            <div className="text-end mt-3">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    <i className="fa-solid fa-trash me-1"></i>
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DeviceCheckoutAddressList;