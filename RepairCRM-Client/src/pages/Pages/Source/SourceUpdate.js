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
  resetUpdateSourceResponse,
  updateSource,
} from "../../../store/Source";

const SourceUpdate = ({ isOpen, toggle, sourceData }) => {
  const dispatch = useDispatch();
  const { updateSourceResponse } = useSelector(
    (state) => state.SourceReducer
  );

  const [data, setData] = useState({ source_id: "", source_name: "" });
  const [sourceError, setSourceError] = useState("");
  const submitButtonRef = useRef();

  useEffect(() => {
    if (sourceData) {
      setData({
        source_id: sourceData.source_id,
        source_name: sourceData.source_name || "",
      });
      setSourceError("");
    }
  }, [sourceData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    if (name === "source_name") setSourceError("");
  };

  const handleUpdateSource = () => {
    if (!data.source_name.trim()) {
      setSourceError("Source name is required");
      return;
    }
    dispatch(updateSource(data));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdateSource();
  };

  useEffect(() => {
    if (updateSourceResponse) {
      toggle();
      dispatch(resetUpdateSourceResponse());
    }
  }, [updateSourceResponse, dispatch, toggle]);

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

  // 👇 extra: trigger update when pressing Enter in the input
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUpdateSource();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} centered>
        <Form onSubmit={handleSubmit}>
          <ModalHeader toggle={toggle} className="bg-light">
            Update Source
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
                    value={data.source_name}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}   // 👈 here
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

export default SourceUpdate;
