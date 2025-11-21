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
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  addAccessory,
  resetAddAccessoryResponse,
} from "../../store/Accessories/index";

const AccessoriesAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();

  const { addAccessoryResponse } = useSelector(
    (state) => state.AccessoriesReducer
  );

  const [accessoryData, setAccessoryData] = useState({
    accessories_name: "",
  });

  const [accessoryNameError, setAccessoryNameError] = useState("");
  const submitButtonRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAccessoryData((prev) => ({ ...prev, [name]: value }));

    if (name === "accessories_name") setAccessoryNameError("");
  };

  const handleAddAccessory = (e) => {
    e.preventDefault(); // ✅ Prevent default form submission
    if (!accessoryData.accessories_name.trim()) {
      setAccessoryNameError("Accessory Name is required");
      return;
    }
    dispatch(addAccessory(accessoryData));
  };

  useEffect(() => {
    if (addAccessoryResponse) {
      toggle();
      setAccessoryData({ accessories_name: "" });
      dispatch(resetAddAccessoryResponse());
    }
  }, [addAccessoryResponse, dispatch, toggle]);

  // ✅ Alt+S and Alt+Esc shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        submitButtonRef.current?.click();
      }
      if (event.altKey && event.key === "Escape") {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [toggle]);

  return (
    <>
      <Modal id="showModal" size="md" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle} className="bg-light">
          <h4>Create Accessory</h4>
        </ModalHeader>

        <ModalBody>
          <form onSubmit={handleAddAccessory}>
            <Card className="border card-border-success p-3 shadow-lg">
              {/* Accessory Name Field */}
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
                    value={accessoryData.accessories_name}
                    onChange={handleInputChange}
                    autoFocus
                  />
                </Col>
              </Row>
            </Card>

            <ModalFooter>
              <Button
                ref={submitButtonRef}
                color="primary"
                type="submit" // ✅ Now handled by form submit
              >
                Save
              </Button>
              <Button color="danger" type="button" onClick={toggle}>
                Close
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      <ToastContainer />
    </>
  );
};

export default AccessoriesAdd;
