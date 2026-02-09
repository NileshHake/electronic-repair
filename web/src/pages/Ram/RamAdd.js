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
import { addRam, resetAddRamResponse } from "../../store/Ram/index";

const RamAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const { addRamResponse } = useSelector((state) => state.RamReducer);

  const [ramData, setRamData] = useState({ ram_name: "" });
  const [ramError, setRamError] = useState("");
  const submitButtonRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRamData((prev) => ({ ...prev, [name]: value }));
    if (name === "ram_name") setRamError("");
  };

  const handleAddRam = () => {
    if (!ramData.ram_name.trim()) {
      setRamError("RAM Name is required");
      return;
    }
    dispatch(addRam(ramData));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddRam();
    }
  };

  useEffect(() => {
    if (addRamResponse) {
      toggle();
      setRamData({ ram_name: "" });
      dispatch(resetAddRamResponse());
    }
  }, [addRamResponse, dispatch, toggle]);

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
      <Modal size="md" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle} className="bg-light">
          <h4>Create RAM</h4>
        </ModalHeader>

        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            <Row>
              <Col lg={12}>
                <Label className="form-label fw-bold d-flex justify-content-between">
                  <div>
                    RAM Name <span className="text-danger">*</span>
                  </div>
                  <div className="text-danger">{ramError}</div>
                </Label>

                <Input
                  name="ram_name"
                  placeholder="Enter RAM name (DDR3 / DDR4 / DDR5)"
                  type="text"
                  value={ramData.ram_name}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                />
              </Col>
            </Row>
          </Card>
        </ModalBody>

        <ModalFooter>
          <Button ref={submitButtonRef} color="primary" onClick={handleAddRam}>
            Save
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

export default RamAdd;
