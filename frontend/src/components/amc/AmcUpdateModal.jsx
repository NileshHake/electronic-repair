import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    Card,
    CardBody,
    ModalFooter,
    Button
} from "reactstrap";

import Select from "react-select";
import AmcProductTable from "./AmcProductTable";
import DeviceCheckoutAddressList from "../RentalDevice/DeviceCheckoutAddressList";

import {
    useUpdateAmcRequestMutation,
    useGetChildAmcRequestsQuery
} from "@/redux/features/amcRequestApi";

const serviceOptions = [
    { value: "carry_in", label: "Carry In Service" },
    { value: "on_site", label: "On Site Service" }
];

const billingOptions = [
    { value: "monthly", label: "Monthly Billing" },
    { value: "annual", label: "Annual Billing" }
];

const autoPayOptions = [
    { value: "on", label: "Enabled" },
    { value: "off", label: "Disabled" }
];

const AmcUpdateModal = ({ isOpen, toggle, data }) => {

    const { data: amcList = [], isLoading } =
        useGetChildAmcRequestsQuery(data?.request_id);

    const [products, setProducts] = useState([]);

    const [amcRequest, setAmcRequest] = useState({
        address: null,
        service_type: serviceOptions[0],
        billing_type: billingOptions[0],
        autopay: autoPayOptions[1]
    });

    const [updateAmcRequest, { isLoading: updating }] =
        useUpdateAmcRequestMutation();

    /* Load products */
    useEffect(() => {
        if (amcList.length) {
            setProducts(amcList);
        }
    }, [amcList]);

    /* Load request data */
    useEffect(() => {

        if (data) {

            setAmcRequest({
                address: data.customer_address_id,
                service_type:
                    serviceOptions.find(i => i.value === data.service_type) ||
                    serviceOptions[0],

                billing_type:
                    billingOptions.find(i => i.value === data.billing_type) ||
                    billingOptions[0],

                autopay:
                    autoPayOptions.find(i => i.value === data.autopay) ||
                    autoPayOptions[1]
            });

        }

    }, [data]);

    const onSubmit = async () => {

        if (!products.length) {
            alert("Please add at least one product");
            return;
        }

        if (!amcRequest.address) {
            alert("Please select address");
            return;
        }

        const items = products.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            qty: item.qty
        }));

        const payload = {
            request_id: data.request_id,
            customer_address_id: amcRequest.address,
            service_type: amcRequest.service_type?.value,
            billing_type: amcRequest.billing_type?.value,
            autopay: amcRequest.autopay?.value || null,
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

            <ModalHeader toggle={toggle}>
                <h5 className="fw-bold mb-0">Update AMC Request</h5>
            </ModalHeader>

            <ModalBody>

                {/* ===== Service Settings ===== */}

                <Card className="shadow-sm border-0 mb-4">

                    <CardBody>

                        <div className="row g-3">

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">
                                    Service Type
                                </label>

                                <Select
                                    options={serviceOptions}
                                    value={amcRequest.service_type}
                                    onChange={(val) =>
                                        setAmcRequest({ ...amcRequest, service_type: val })
                                    }
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">
                                    Billing Type
                                </label>

                                <Select
                                    options={billingOptions}
                                    value={amcRequest.billing_type}
                                    onChange={(val) =>
                                        setAmcRequest({
                                            ...amcRequest,
                                            billing_type: val,
                                            autopay: val.value === "monthly" ? autoPayOptions[1] : null
                                        })
                                    }
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">
                                    AutoPay
                                </label>

                                <Select
                                    options={autoPayOptions}
                                    value={amcRequest.autopay}
                                    onChange={(val) =>
                                        setAmcRequest({ ...amcRequest, autopay: val })
                                    }
                                    isDisabled={amcRequest.billing_type?.value !== "monthly"}
                                />
                            </div>

                        </div>

                    </CardBody>

                </Card>


                {isLoading ? (

                    <div className="text-center py-4">
                        Loading products...
                    </div>

                ) : (

                    <div className="row g-4">

                        {/* Products */}

                        <div className="col-lg-8">

                            <Card className="shadow-sm border-0">

                                <CardBody>

                                    <AmcProductTable
                                        products={products}
                                        setProducts={setProducts}
                                    />

                                </CardBody>

                            </Card>

                        </div>


                        {/* Address */}

                        <div className="col-lg-4">

                            <Card className="shadow-sm border-0">

                                <CardBody>

                                    <h6 className="fw-bold mb-3">
                                        Service Address
                                    </h6>

                                    <DeviceCheckoutAddressList
                                        selectedAddress={amcRequest.address}
                                        setSelectedAddress={(addr) =>
                                            setAmcRequest({
                                                ...amcRequest,
                                                address: addr
                                            })
                                        }
                                    />

                                </CardBody>

                            </Card>

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
                    color="secondary"
                    onClick={toggle}
                >
                    Cancel
                </Button>

            </ModalFooter>

        </Modal>
    );
};

export default AmcUpdateModal;