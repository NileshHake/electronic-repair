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
import { addSource, resetAddSourceResponse } from "../../../store/Source";

const SourceAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const { addSourceResponse } = useSelector((state) => state.SourceReducer);

  const [sourceData, setSourceData] = useState({ source_name: "" });
  const [sourceError, setSourceError] = useState("");
  const submitButtonRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSourceData((prev) => ({ ...prev, [name]: value }));
    if (name === "source_name") setSourceError("");
  };

  const handleAddSource = () => {
    if (!sourceData.source_name.trim()) {
      setSourceError("Source name is required");
      return;
    }
    dispatch(addSource(sourceData));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddSource();
  };

  useEffect(() => {
    if (addSourceResponse) {
      toggle();
      setSourceData({ source_name: "" });
      dispatch(resetAddSourceResponse());
    }
  }, [addSourceResponse, dispatch, toggle]);

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
      <Modal isOpen={isOpen} centered>
        <Form onSubmit={handleSubmit}>
          <ModalHeader toggle={toggle} className="bg-light">
            Create Source
          </ModalHeader>

          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row>
                <Col lg={12}>
                  <Label className="form-label fw-bold d-flex justify-content-between">
                    <div>
                      Source Name <span className="text-danger">*</span>
                    </div>
                    <div className="text-danger">{sourceError}</div>
                  </Label>
                  <Input
                    name="source_name"
                    placeholder="Enter source name"
                    value={sourceData.source_name}
                    onChange={handleInputChange}
                  />
                </Col>
              </Row>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button
              color="primary"
              type="submit"
              ref={submitButtonRef}
            >
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

export default SourceAdd;
