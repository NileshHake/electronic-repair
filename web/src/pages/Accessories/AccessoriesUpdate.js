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
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import {
  updateAccessory,
  resetUpdateAccessoryResponse,
} from "../../store/Accessories/index";

const AccessoriesUpdate = ({ isOpen, toggle, accessoryData }) => {
  const dispatch = useDispatch();
  const { updateAccessoryResponse } = useSelector(
    (state) => state.AccessoriesReducer
  );

  const [accessoryForm, setAccessoryForm] = useState({
    accessory_id: "",
    accessories_name: "",
  });

  const [accessoryNameError, setAccessoryNameError] = useState("");
  const submitButtonRef = useRef();

  useEffect(() => {
    if (accessoryData) {
      setAccessoryForm({
        accessories_id: accessoryData.accessories_id,
        accessories_name: accessoryData.accessories_name || "",
      });
    }
  }, [accessoryData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAccessoryForm((prev) => ({ ...prev, [name]: value }));
    if (name === "accessories_name") setAccessoryNameError("");
  };

  const handleUpdateAccessory = () => {
    if (!accessoryForm.accessories_name.trim()) {
      setAccessoryNameError("Accessory Name is required");
      return;
    }

    dispatch(updateAccessory(accessoryForm));
  };

  useEffect(() => {
    if (updateAccessoryResponse) {
      toggle();
      dispatch(resetUpdateAccessoryResponse());
    }
  }, [updateAccessoryResponse, dispatch, toggle]);

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
          <h4>Update Accessory</h4>
        </ModalHeader>

        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            <Row>
              <Col lg={12}>
                <Label className="form-label fw-bold d-flex justify-content-between">
                  <div>
                    Accessory Name <span className="text-danger">*</span>
                  </div>
                  <div className="text-danger">{accessoryNameError}</div>
                </Label>
                <Input
                  name="accessories_name"
                  placeholder="Enter accessory name"
                  type="text"
                  value={accessoryForm.accessories_name}
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
            onClick={handleUpdateAccessory}
          >
            Update
          </Button>
          <Button color="danger" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default AccessoriesUpdate;
