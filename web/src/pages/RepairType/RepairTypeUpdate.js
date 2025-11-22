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
  FormFeedback,
} from "reactstrap";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  updateRepairType,
  resetUpdateRepairTypeResponse,
} from "../../store/RepairType/index";

const RepairTypeUpdate = ({ isOpen, toggle, repairTypeData }) => {
  const dispatch = useDispatch();
  const { updateRepairTypeResponse } = useSelector(
    (state) => state.RepairTypeReducer
  );

  const [repairData, setRepairData] = useState({
    repair_type_id: "",
    repair_type_name: "",
  });

  const [repairTypeError, setRepairTypeError] = useState("");
  const submitButtonRef = useRef();

  useEffect(() => {
    if (repairTypeData) {
      setRepairData({
        repair_type_id: repairTypeData.repair_type_id,
        repair_type_name: repairTypeData.repair_type_name || "",
      });
    }
  }, [repairTypeData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRepairData((prev) => ({ ...prev, [name]: value }));
    if (name === "repair_type_name") setRepairTypeError("");
  };

  const handleUpdateRepairType = (e) => {
    e.preventDefault();
    if (!repairData.repair_type_name.trim()) {
      setRepairTypeError("Repair Type is required");
      return;
    }
    dispatch(updateRepairType(repairData));
  };

  useEffect(() => {
    if (updateRepairTypeResponse) {
      toggle();
      dispatch(resetUpdateRepairTypeResponse());
    }
  }, [updateRepairTypeResponse, dispatch, toggle]);

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
        <ModalHeader toggle={toggle} className="bg-light">
          <h4>Update Repair Type</h4>
        </ModalHeader>

        <Form onSubmit={handleUpdateRepairType}>
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row>
                <Col lg={12}>
                  <Label className="form-label fw-bold">
                    Repair Type <span className="text-danger">*</span>
                  </Label>
                  <Input
                    name="repair_type_name"
                    placeholder="Enter repair type"
                    type="text"
                    value={repairData.repair_type_name}
                    onChange={handleInputChange}
                    invalid={!!repairTypeError}
                  />
                  {repairTypeError && (
                    <FormFeedback className="d-block">
                      {repairTypeError}
                    </FormFeedback>
                  )}
                </Col>
              </Row>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button innerRef={submitButtonRef} color="primary" type="submit">
              Update
            </Button>
            <Button color="danger" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default RepairTypeUpdate;
