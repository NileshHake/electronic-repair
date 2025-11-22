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
import {
  addRepairType,
  resetAddRepairTypeResponse,
} from "../../store/RepairType/index";

const RepairTypeAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const { addRepairTypeResponse } = useSelector(
    (state) => state.RepairTypeReducer
  );

  const [repairData, setRepairData] = useState({
    repair_type_name: "",
  });

  const [errors, setErrors] = useState({});
  const submitButtonRef = useRef();

  // ✅ Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRepairData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!repairData.repair_type_name.trim()) {
      newErrors.repair_type_name = "Repair Type is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(addRepairType(repairData));
  };

  // ✅ Reset after successful add
  useEffect(() => {
    if (addRepairTypeResponse) {
      toggle();
      setRepairData({ repair_type_name: "" });
      dispatch(resetAddRepairTypeResponse());
    }
  }, [addRepairTypeResponse, dispatch, toggle]);

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
      <Modal id="showModal" size="md" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle} className="bg-light fw-bold">
          Create Repair Type
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row>
                <Col lg={12}>
                  <Label className="form-label d-flex justify-content-between">
                    <span>
                      Repair Type <span className="text-danger">*</span>
                    </span>
                    <span className="text-danger">
                      {errors.repair_type_name}
                    </span>
                  </Label>
                  <Input
                    type="text"
                    name="repair_type_name"
                    placeholder="Enter repair type"
                    value={repairData.repair_type_name}
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
              Save
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

export default RepairTypeAdd;
