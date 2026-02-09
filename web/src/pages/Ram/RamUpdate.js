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
import { updateRam, resetUpdateRamResponse } from "../../store/Ram/index";

const RamUpdate = ({ isOpen, toggle, ramData }) => {
  const dispatch = useDispatch();
  const { updateRamResponse } = useSelector((state) => state.RamReducer);

  const [ram, setRam] = useState({ ram_id: "", ram_name: "" });
  const [ramError, setRamError] = useState("");
  const submitButtonRef = useRef();

  useEffect(() => {
    if (ramData) {
      setRam({
        ram_id: ramData.ram_id,
        ram_name: ramData.ram_name || "",
      });
      setRamError("");
    }
  }, [ramData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRam((prev) => ({ ...prev, [name]: value }));
    if (name === "ram_name") setRamError("");
  };

  const handleUpdateRam = () => {
    if (!ram.ram_name.trim()) {
      setRamError("RAM Name is required");
      return;
    }
    dispatch(updateRam(ram));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdateRam();
  };

  useEffect(() => {
    if (updateRamResponse) {
      toggle();
      dispatch(resetUpdateRamResponse());
    }
  }, [updateRamResponse, dispatch, toggle]);

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
      <Modal size="md" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle} className="bg-light">
          <h4>Update RAM</h4>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
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
                    placeholder="Enter RAM name"
                    type="text"
                    value={ram.ram_name}
                    onChange={handleInputChange}
                  />
                </Col>
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
        </form>
      </Modal>

      <ToastContainer />
    </>
  );
};

export default RamUpdate;
