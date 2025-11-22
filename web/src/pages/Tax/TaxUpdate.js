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
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { updateTax, resetUpdateTaxResponse } from "../../store/Tax";

const TaxUpdate = ({ isOpen, toggle, taxData }) => {
  const dispatch = useDispatch();
  const { updateTaxResponse } = useSelector((state) => state.TaxReducer);

  const [taxDetails, setTaxDetails] = useState({
    tax_name: "",
    tax_percentage: "",
  });

  const [taxNameError, setTaxNameError] = useState("");
  const [taxPercentageError, setTaxPercentageError] = useState("");
  const submitButtonRef = useRef();

  // Prefill form when modal opens
  useEffect(() => {
    if (taxData) {
      setTaxDetails({
        tax_name: taxData.tax_name || "",
        tax_percentage: taxData.tax_percentage || "",
      });
      setTaxNameError("");
      setTaxPercentageError("");
    }
  }, [taxData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaxDetails((prev) => ({ ...prev, [name]: value }));

    if (name === "tax_name") setTaxNameError("");
    if (name === "tax_percentage") setTaxPercentageError("");
  };

  const validateAndUpdate = () => {
    let hasError = false;

    // Tax name validation
    if (!taxDetails.tax_name.trim()) {
      setTaxNameError("Tax name is required");
      hasError = true;
    }

    // Tax percentage validation
    if (taxDetails.tax_percentage === "") {
      setTaxPercentageError("Tax percentage is required");
      hasError = true;
    } else {
      const percentage = Number(taxDetails.tax_percentage);
      if (isNaN(percentage)) {
        setTaxPercentageError("Tax percentage must be a number");
        hasError = true;
      } else if (percentage < 0 || percentage > 100) {
        setTaxPercentageError("Tax percentage must be between 0 and 100");
        hasError = true;
      }
    }

    if (hasError) return;

    const updatedData = {
      tax_id: taxData.tax_id,
      ...taxDetails,
    };

    dispatch(updateTax(updatedData));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateAndUpdate();
  };

  // Auto-close modal when updated successfully
  useEffect(() => {
    if (updateTaxResponse) {
      toggle();
      dispatch(resetUpdateTaxResponse());
    }
  }, [updateTaxResponse, dispatch, toggle]);

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
      <Modal id="updateModal" size="md" isOpen={isOpen} centered>
        <Form onSubmit={handleSubmit}>
          <ModalHeader toggle={toggle} className="bg-light">
            <h4>Update Tax</h4>
          </ModalHeader>

          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row>
                <Col lg={12}>
                  <Label className="form-label fw-bold d-flex justify-content-between  ">
                    <div>
                      Tax Name <span className="text-danger">*</span>
                    </div>
                    <div className="text-danger">{taxNameError}</div>
                  </Label>
                  <Input
                    name="tax_name"
                    placeholder="Enter tax name"
                    type="text"
                    value={taxDetails.tax_name}
                    onChange={handleInputChange}
                  />
                </Col>

                <Col lg={12} className="mt-3">
                  <Label className="form-label fw-bold d-flex justify-content-between">
                    <div>
                      Tax Percentage <span className="text-danger">*</span>
                    </div>
                    <div className="text-danger">{taxPercentageError}</div>
                  </Label>
                  <Input
                    type="number"
                    name="tax_percentage"
                    placeholder="Enter tax percentage"
                    value={taxDetails.tax_percentage}
                    onChange={handleInputChange}
                  />
                </Col>
              </Row>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button
              ref={submitButtonRef}
              color="primary"
              type="submit" // Enter will submit
            >
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

export default TaxUpdate;
