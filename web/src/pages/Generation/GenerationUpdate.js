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
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

import {
  updateGeneration,
  resetUpdateGenerationResponse,
} from "../../store/Generation/index"; // ✅ change path if needed

const GenerationUpdate = ({ isOpen, toggle, generationData }) => {
  const dispatch = useDispatch();
  const { updateGenerationResponse } = useSelector(
    (state) => state.GenerationReducer
  );

  const brandOptions = [
    { value: 1, label: "Intel" },
    { value: 2, label: "AMD" },
  ];

  const [generation, setGeneration] = useState({
    generations_id: "",
    generations_name: "",
    generations_brand: "", // 1 or 2
  });

  const [errors, setErrors] = useState({
    generations_name: "",
    generations_brand: "",
  });

  const submitButtonRef = useRef();

  // set default data in modal
  useEffect(() => {
    if (generationData) {
      setGeneration({
        generations_id: generationData.generations_id,
        generations_name: generationData.generations_name || "",
        generations_brand: generationData.generations_brand || "",
      });
      setErrors({ generations_name: "", generations_brand: "" });
    }
  }, [generationData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGeneration((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBrandChange = (opt) => {
    setGeneration((prev) => ({
      ...prev,
      generations_brand: opt?.value || "",
    }));
    setErrors((prev) => ({ ...prev, generations_brand: "" }));
  };

  const validate = () => {
    let ok = true;
    const next = { generations_name: "", generations_brand: "" };

    if (!generation.generations_name.trim()) {
      next.generations_name = "Generation Name is required";
      ok = false;
    }
    if (!generation.generations_brand) {
      next.generations_brand = "Brand is required";
      ok = false;
    }

    setErrors(next);
    return ok;
  };

  const handleUpdateGeneration = () => {
    if (!validate()) return;
    dispatch(updateGeneration(generation));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdateGeneration();
  };

  // close on success
  useEffect(() => {
    if (updateGenerationResponse) {
      toggle();
      dispatch(resetUpdateGenerationResponse());
    }
  }, [updateGenerationResponse, dispatch, toggle]);

  // Keyboard shortcuts
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

  const selectedBrand =
    brandOptions.find(
      (b) => Number(b.value) === Number(generation.generations_brand)
    ) || null;

  return (
    <>
      <Modal size="md" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle} className="bg-light">
          <h4>Update Generation</h4>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row className="g-3">
                {/* Brand */}
                <Col lg={12}>
                  <Label className="form-label fw-bold d-flex justify-content-between">
                    <div>
                      Brand <span className="text-danger">*</span>
                    </div>
                    <div className="text-danger">
                      {errors.generations_brand}
                    </div>
                  </Label>

                  <Select
                    placeholder="Select Brand"
                    options={brandOptions}
                    value={selectedBrand}
                    onChange={handleBrandChange}
                  />
                </Col>

                {/* Generation Name */}
                <Col lg={12}>
                  <Label className="form-label fw-bold d-flex justify-content-between">
                    <div>
                      Generation Name <span className="text-danger">*</span>
                    </div>
                    <div className="text-danger">{errors.generations_name}</div>
                  </Label>

                  <Input
                    name="generations_name"
                    placeholder="Enter generation name"
                    type="text"
                    value={generation.generations_name}
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

export default GenerationUpdate;
