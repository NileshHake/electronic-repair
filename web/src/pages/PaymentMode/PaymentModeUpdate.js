import React, { useEffect, useRef, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import {
  updatePaymentType,
  resetUpdatePaymentTypeResponse,
} from "../../store/PaymentMode";

const PaymentTypeUpdate = ({ isOpen, toggle, paymentTypeData }) => {
  const dispatch = useDispatch();
  const { updatePaymentTypeResponse } = useSelector(
    (state) => state.PaymentTypeReducer
  );

  const [paymentData, setPaymentData] = useState({
    payment_type_id: "",
    payment_type: "",
    payment_status: 1,
  });

  const [errors, setErrors] = useState({});
  const submitButtonRef = useRef();

  // ✅ Pre-fill form data
  useEffect(() => {
    if (paymentTypeData) {
      setPaymentData({
        payment_type_id: paymentTypeData.payment_type_id,
        payment_type: paymentTypeData.payment_type || "",
        payment_status: paymentTypeData.payment_status ?? 1,
      });
    }
  }, [paymentTypeData]);

  // ✅ Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!paymentData.payment_type.trim()) {
      newErrors.payment_type = "Payment Type is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(updatePaymentType(paymentData));
  };

  // ✅ Handle success response
  useEffect(() => {
    if (updatePaymentTypeResponse) {
      toggle();
      dispatch(resetUpdatePaymentTypeResponse());
    }
  }, [updatePaymentTypeResponse, dispatch, toggle]);

  // ✅ Keyboard shortcuts
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
      <Modal id="updateModal" size="md" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle} className="bg-light fw-bold">
          Update Payment Type
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row>
                <Col lg={12}>
                  <Label className="form-label d-flex justify-content-between">
                    <span>
                      Payment Type <span className="text-danger">*</span>
                    </span>
                    <span className="text-danger">{errors.payment_type}</span>
                  </Label>
                  <Input
                    type="text"
                    name="payment_type"
                    placeholder="Enter payment type"
                    value={paymentData.payment_type}
                    onChange={handleInputChange}
                  />
                </Col>
              </Row>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              color="primary"
              ref={submitButtonRef}
            >
              Update
            </Button>
            <Button color="danger" type="button" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ToastContainer closeButton={false} limit={1} autoClose={800} />
    </>
  );
};

export default PaymentTypeUpdate;
