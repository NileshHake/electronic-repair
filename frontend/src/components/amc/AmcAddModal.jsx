import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody
} from "reactstrap";

import Select from "react-select";
import AmcProductTable from "./AmcProductTable";
import DeviceCheckoutAddressList from "../RentalDevice/DeviceCheckoutAddressList";
import { useCreateAmcRequestMutation } from "@/redux/features/amcRequestApi";

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

const AmcAddModal = ({ isOpen, toggle }) => {

  const [products, setProducts] = useState([]);

  const [amcRequest, setAmcRequest] = useState({
    address: null,
    service_type: serviceOptions[0],   // default carry_in
    billing_type: billingOptions[0],   // default monthly
    autopay: autoPayOptions[1]         // default off
  });

  const [createAmcRequest, { isLoading }] = useCreateAmcRequestMutation();

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
      customer_address_id: amcRequest.address,
      service_type: amcRequest.service_type.value,
      billing_type: amcRequest.billing_type.value,
      autopay: amcRequest.autopay.value,
      items
    };

    try {

      await createAmcRequest(payload).unwrap();

      setProducts([]);

      setAmcRequest({
        address: null,
        service_type: serviceOptions[0],
        billing_type: billingOptions[0],
        autopay: autoPayOptions[1]
      });

      toggle();

    } catch (error) {
      console.error("AMC Request Error:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" centered>

      <ModalHeader toggle={toggle}>
        <h5 className="fw-bold mb-0">Create AMC Request</h5>
      </ModalHeader>

      <ModalBody>

        {/* Service Settings */}
        <Card className="shadow-sm mb-4 border-0">
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
                      autopay: val.value !== "monthly" ? null : amcRequest.autopay
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
                  isDisabled={amcRequest.billing_type.value !== "monthly"}
                />
              </div>

            </div>

          </CardBody>
        </Card>

        <div className="row g-4">

          {/* Product Table */}
          <div className="col-lg-8">
            <Card className="shadow-sm border-0">
              <CardBody>

                <div className="d-flex justify-content-between mb-3">

                  <h6 className="fw-bold mb-0">
                    Products
                  </h6>

                  <span className="badge bg-primary">
                    {products.length} Items
                  </span>

                </div>

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
                    setAmcRequest({ ...amcRequest, address: addr })
                  }
                />

              </CardBody>
            </Card>
          </div>

        </div>

      </ModalBody>

      <ModalFooter>

        <Button
          color="primary"
          onClick={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Request"}
        </Button>

        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>

      </ModalFooter>

    </Modal>
  );
};

export default AmcAddModal;