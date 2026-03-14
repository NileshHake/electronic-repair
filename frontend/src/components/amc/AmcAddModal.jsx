import React, { useState } from "react";
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
import CheckoutBillingArea from "../checkout/checkout-billing-area";

import { useForm } from "react-hook-form";
import { useCreateAmcRequestMutation } from "@/redux/features/amcRequestApi";

const AmcAddModal = ({ isOpen, toggle }) => {

    const [products, setProducts] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);

    //   const {
    //     register,
    //     handleSubmit,
    //     formState: { errors },
    //     reset
    //   } = useForm({
    //     shouldUnregister: true
    //   });

    const [createAmcRequest, { isLoading }] = useCreateAmcRequestMutation();

    const onSubmit = async (formData) => {


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
            customer_address_id: selectedAddress,
            items
        };


        try {

            await createAmcRequest(payload).unwrap();

            // reset state
            setProducts([]);
            setSelectedAddress(null);

            // close modal
            toggle();

        } catch (error) {
            console.error("AMC Request Error:", error);
        }
    };

    const onError = (errors) => {
        console.log("FORM ERRORS:", errors);
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size="xl">

            <ModalHeader toggle={toggle} className="bg-light">
                Create AMC Request
            </ModalHeader>


            <ModalBody>

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

                        {/* <Card className="p-3 shadow-sm mt-2">
                <CheckoutBillingArea
                  register={register}
                  errors={errors}
                />
              </Card> */}

                    </div>

                </div>

            </ModalBody>

            <ModalFooter>

                <Button
                    color="primary"
                    type="button"
                    onClick={onSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : "Save Request"}
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

export default AmcAddModal;