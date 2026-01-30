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

import {
    updateRequest,
    resetUpdateRequestResponse,
    statusUpdateRequest,
} from "../../store/Requests";
import AuthUser from "../../helpers/AuthType/AuthUser";

const ReqToSupplierUpdate = ({ isOpen, toggle, requestData }) => {
    const dispatch = useDispatch();
    const { user } = AuthUser();

    const { updateRequestResponse } = useSelector(
        (state) => state.RequestsReducer
    );

    const { suppliers, loading } = useSelector((state) => state.SupplierReducer);

    const [reqDetails, setReqDetails] = useState({
        requests_created_supplier_id: null,
        request_message: "",
        request_reply: "",
        request_status: 0,
    });

    const [selectedSupplier, setSelectedSupplier] = useState(null);

    const [supplierError, setSupplierError] = useState("");
    const [messageError, setMessageError] = useState("");

    const submitButtonRef = useRef();

    // ✅ Prevent repeat API call for same record
    // stores: { [requests_id]: true }
    const statusCalledRef = useRef({});

    const supplierOptions = useMemo(() => {
        return (suppliers || []).map((s) => ({
            label: s?.user_name || "Unnamed",
            value: s?.user_id,
        }));
    }, [suppliers]);

    // ✅ Prefill when modal opens
    useEffect(() => {
        if (requestData) {
            const supplierId = requestData.requests_created_supplier_id ?? null;

            setReqDetails({
                requests_created_supplier_id: supplierId,
                request_message: requestData.request_message || "",
                request_reply: requestData.request_reply || "",

            });

            const preSelected = supplierOptions.find((o) => o.value === supplierId);
            setSelectedSupplier(preSelected || null);

            setSupplierError("");
            setMessageError("");
        }
    }, [requestData, supplierOptions]);

    // ✅ When modal opens + user_type 7 => call status-update ONCE (and not repeat if already seen)
    useEffect(() => {
        if (!isOpen) return;

        // only supplier
        if (Number(user?.user_type) !== 7) return;

        const rid = requestData?.requests_id;
        if (!rid) return;

        // ✅ if already seen/updated, don't call again
        // change `is_seen` to your field name if different
        if (Number(requestData?.is_seen) === 1) return;

        // ✅ if already called once for this id, don't call again
        if (statusCalledRef.current[rid]) return;

        statusCalledRef.current[rid] = true;

        dispatch(statusUpdateRequest({ requests_id: rid }));
    }, [isOpen, user?.user_type, requestData?.requests_id, requestData?.is_seen, dispatch]);

    const handleSupplierChange = (opt) => {
        setSelectedSupplier(opt);
        setReqDetails((prev) => ({
            ...prev,
            requests_created_supplier_id: opt ? opt.value : null,
        }));
        setSupplierError("");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setReqDetails((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "request_message") setMessageError("");
    };

    const validateAndUpdate = () => {
        let hasError = false;

        if (!reqDetails.requests_created_supplier_id) {
            setSupplierError("Supplier is required");
            hasError = true;
        }

        if (!reqDetails.request_message.trim()) {
            setMessageError("Message is required");
            hasError = true;
        }

        if (hasError) return;

        const updatedData = {
            requests_id: requestData.requests_id,
            ...reqDetails,
        };

        dispatch(updateRequest(updatedData));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        validateAndUpdate();
    };

    useEffect(() => {
        if (updateRequestResponse) {
            toggle();
            dispatch(resetUpdateRequestResponse());
        }
    }, [updateRequestResponse, dispatch, toggle]);

    // Alt + S = Save | Alt + Esc = Close
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
            <Modal id="updateReqSupplierModal" size="md" isOpen={isOpen} centered>
                <Form onSubmit={handleSubmit}>
                    <ModalHeader toggle={toggle} className="bg-light">
                        <h4>Update Supplier Request</h4>
                    </ModalHeader>

                    <ModalBody>
                        <Card className="border card-border-success p-3 shadow-lg">
                            <Row>
                                {/* ✅ Supplier */}
                                {Number(user?.user_type) !== 7 ? (
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
                                ) : (
                                    <Col lg={12}>
                                        <Label className="form-label fw-bold">
                                            Vendor
                                        </Label>

                                        <Input
                                            type="text"
                                            value={requestData?.business_name || "N/A"}
                                            readOnly
                                            className="bg-light"
                                        />
                                    </Col>
                                )}


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
                                        value={reqDetails.request_message}
                                        onChange={handleInputChange}
                                        rows={3}
                                        disabled={Number(user?.user_type) === 7}
                                    />
                                </Col>

                                {/* ✅ Reply (only user_type 7) */}
                                {Number(user?.user_type) === 7 && (
                                    <Col lg={12} className="mt-3">
                                        <Label className="form-label fw-bold">
                                            Reply <span className="text-muted ms-2">(optional)</span>
                                        </Label>

                                        <Input
                                            type="textarea"
                                            name="request_reply"
                                            placeholder="Enter supplier reply"
                                            value={reqDetails.request_reply}
                                            onChange={handleInputChange}
                                            rows={3}
                                        />
                                    </Col>
                                )}

                                {/* ✅ Optional: status dropdown if you want (uncomment) */}
                                {/* <Col lg={12} className="mt-3">
                  <Label className="form-label fw-bold">Status</Label>
                  <Input
                    type="select"
                    name="request_status"
                    value={reqDetails.request_status}
                    onChange={handleInputChange}
                  >
                    <option value={0}>Pending</option>
                    <option value={1}>Accepted</option>
                    <option value={2}>Rejected</option>
                    <option value={3}>Completed</option>
                  </Input>
                </Col> */}
                            </Row>
                        </Card>
                    </ModalBody>

                    <ModalFooter>
                        <Button ref={submitButtonRef} color="primary" type="submit">
                            Update
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

export default ReqToSupplierUpdate;
