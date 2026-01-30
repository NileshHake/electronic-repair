import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Card,
  Row,
  Col,
  Input,
  Form,
} from "reactstrap";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import { addRequest, resetAddRequestResponse } from "../../store/Requests/index"; // ✅ change path if needed

const ReqToSupplierAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();

  // ✅ Request state
  const { addRequestResponse } = useSelector((state) => state.RequestsReducer);

  // ✅ Supplier list from reducer
  const { suppliers, loading } = useSelector((state) => state.SupplierReducer);

  const [requestDetails, setRequestDetails] = useState({
    requests_created_supplier_id: null, // supplier user_id
    request_message: "",
    // optional: requests_created_business_id: ... (if you need)
  });

  // ✅ react-select value
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // errors
  const [supplierError, setSupplierError] = useState("");
  const [messageError, setMessageError] = useState("");

  const submitButtonRef = useRef();

  // ✅ Supplier options: label=user_name, value=user_id
  const supplierOptions = useMemo(() => {
    return (suppliers || []).map((s) => ({
      label: s?.user_name || "Unnamed",
      value: s?.user_id,
    }));
  }, [suppliers]);

  const handleSupplierChange = (opt) => {
    setSelectedSupplier(opt);
    setRequestDetails((prev) => ({
      ...prev,
      requests_created_supplier_id: opt ? opt.value : null,
    }));
    setSupplierError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestDetails((prev) => ({ ...prev, [name]: value }));

    if (name === "request_message") setMessageError("");
  };

  const validateAndSubmit = () => {
    let hasError = false;

    if (!requestDetails.requests_created_supplier_id) {
      setSupplierError("Supplier is required");
      hasError = true;
    }

    if (!requestDetails.request_message.trim()) {
      setMessageError("Message is required");
      hasError = true;
    }

    if (hasError) return;

    dispatch(addRequest(requestDetails));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateAndSubmit();
  };

  // ✅ Auto-close modal on success
  useEffect(() => {
    if (addRequestResponse) {
      toggle();

      setRequestDetails({
        requests_created_supplier_id: null,
        request_message: "",
      });
    
      setSupplierError("");
      setMessageError("");

      dispatch(resetAddRequestResponse());
    }
  }, [addRequestResponse, dispatch, toggle]);

  // ✅ Alt + S = Save, Alt + Esc = Close
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        submitButtonRef.current?.click();
      }
      if (event.altKey && event.key === "Escape") {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <>
      <Modal id="reqSupplierModal" size="md" isOpen={isOpen} centered>
        <Form onSubmit={handleSubmit}>
          <ModalHeader toggle={toggle} className="bg-light">
            <h4>Create Supplier Request</h4>
          </ModalHeader>

          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row>
                {/* ✅ Supplier Select */}
                <Col lg={12}>
                  <Label className="form-label fw-bold d-flex justify-content-between">
                    <div>
                      Supplier <span className="text-danger">*</span>
                    </div>
                    <div className="text-danger">{supplierError}</div>
                  </Label>

                  <Select
                    isClearable
                    isLoading={loading}
                    options={supplierOptions}
                    value={selectedSupplier}
                    onChange={handleSupplierChange}
                    placeholder="Select supplier"
                  />
                </Col>

                {/* ✅ Message */}
                <Col lg={12} className="mt-3">
                  <Label className="form-label fw-bold d-flex justify-content-between">
                    <div>
                      Message <span className="text-danger">*</span>
                    </div>
                    <div className="text-danger">{messageError}</div>
                  </Label>

                  <Input
                    type="textarea"
                    name="request_message"
                    placeholder="Enter request message"
                    value={requestDetails.request_message}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </Col>
              </Row>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button ref={submitButtonRef} color="primary" type="submit">
              Save
            </Button>
            <Button type="button" color="danger" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ToastContainer />
    </>
  );
};

export default ReqToSupplierAdd;
