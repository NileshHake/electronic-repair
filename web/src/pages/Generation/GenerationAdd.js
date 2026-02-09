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
  addGeneration,
  resetAddGenerationResponse,
} from "../../store/Generation/index"; // ✅ change path if needed

const GenerationAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const { addGenerationResponse } = useSelector(
    (state) => state.GenerationReducer
  );

  // ✅ static brand options
  const brandOptions = [
    { value: 1, label: "Intel" },
    { value: 2, label: "AMD" },
  ];

  const [generationData, setGenerationData] = useState({
    generations_name: "",
    generations_brand: "", // will store 1 or 2
  });

  const [errors, setErrors] = useState({
    generations_name: "",
    generations_brand: "",
  });

  const submitButtonRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGenerationData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBrandChange = (opt) => {
    setGenerationData((prev) => ({
      ...prev,
      generations_brand: opt?.value || "",
    }));
    setErrors((prev) => ({ ...prev, generations_brand: "" }));
  };

  const validate = () => {
    let ok = true;
    const next = { generations_name: "", generations_brand: "" };

    if (!generationData.generations_name.trim()) {
      next.generations_name = "Generation Name is required";
      ok = false;
    }
    if (!generationData.generations_brand) {
      next.generations_brand = "Brand is required";
      ok = false;
    }

    setErrors(next);
    return ok;
  };

  const handleAddGeneration = () => {
    if (!validate()) return;
    dispatch(addGeneration(generationData));
  };

  // 👉 Enter key (from input)
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddGeneration();
    }
  };

  // Close modal on success
  useEffect(() => {
    if (addGenerationResponse) {
      toggle();
      setGenerationData({ generations_name: "", generations_brand: "" });
      setErrors({ generations_name: "", generations_brand: "" });
      dispatch(resetAddGenerationResponse());
    }
  }, [addGenerationResponse, dispatch, toggle]);

  // Keyboard shortcuts
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

  const selectedBrand =
    brandOptions.find(
      (b) => Number(b.value) === Number(generationData.generations_brand)
    ) || null;

  return (
    <>
      <Modal size="md" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle} className="bg-light">
          <h4>Create Generation</h4>
        </ModalHeader>

        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            <Row className="g-3">
              {/* Brand Select */}
              <Col lg={12}>
                <Label className="form-label fw-bold d-flex justify-content-between">
                  <div>
                    Brand <span className="text-danger">*</span>
                  </div>
                  <div className="text-danger">{errors.generations_brand}</div>
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
                  value={generationData.generations_name}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                />
              </Col>
            </Row>
          </Card>
        </ModalBody>

        <ModalFooter>
          <Button
            ref={submitButtonRef}
            color="primary"
            onClick={handleAddGeneration}
          >
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

export default GenerationAdd;
