import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    Card,
    ModalFooter,
    Button
} from "reactstrap";

import AmcProductTable from "./AmcProductTable";
import DeviceCheckoutAddressList from "../RentalDevice/DeviceCheckoutAddressList";

import {
    useUpdateAmcRequestMutation,
    useGetChildAmcRequestsQuery
} from "@/redux/features/amcRequestApi";

const AmcUpdateModal = ({ isOpen, toggle, data }) => {

    // Fetch child items
    const { data: amcList = [], isLoading } =
        useGetChildAmcRequestsQuery(data.request_id);
    console.log(amcList);

    const [products, setProducts] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const [updateAmcRequest, { isLoading: updating }] =
        useUpdateAmcRequestMutation();

    // Load products from API
    useEffect(() => {
        if (amcList.length) {
            setProducts(amcList);
        }
    }, [amcList]);

    // Load default address
    useEffect(() => {
        if (data?.customer_address_id) {
            setSelectedAddress(data.customer_address_id);
        }
    }, [data]);

    const onSubmit = async () => {
        if (!products.length) {
            alert("Please add at least one product");
            return;
        }

        if (!selectedAddress) {
            alert("Please select address");
            return;
        }

        const items = products.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            qty: item.qty,
            problem_note: item.problem_note
        }));

        const payload = {
            request_id: data.request_id, // ✅ make same everywhere
            customer_address_id: selectedAddress,
            items
        };

        try {
            await updateAmcRequest(payload).unwrap();
            toggle();
        } catch (error) {
            console.error("AMC Update Error:", error);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size="xl">

            <ModalHeader toggle={toggle} className="bg-light">
                Update AMC Request
            </ModalHeader>

            <ModalBody>

                {isLoading ? (
                    <div className="text-center py-4">
                        Loading products...
                    </div>
                ) : (

                    <div className="row">

                        <div className="col-lg-8">

                            <Card className="border card-border-success p-3 shadow-lg">

                                <AmcProductTable
                                    products={products}
                                    setProducts={setProducts}
                                />

                            </Card>

                        </div>

                        <div className="col-lg-4">

                            <DeviceCheckoutAddressList
                                selectedAddress={selectedAddress}
                                setSelectedAddress={setSelectedAddress}
                            />

                        </div>

                    </div>

                )}

            </ModalBody>

            <ModalFooter>

                <Button
                    color="primary"
                    onClick={onSubmit}
                    disabled={updating}
                >
                    {updating ? "Updating..." : "Update Request"}
                </Button>

                <Button
                    color="danger"
                    className="ms-2"
                    onClick={toggle}
                >
                    Close
                </Button>

            </ModalFooter>

        </Modal>
    );
};

export default AmcUpdateModal;  