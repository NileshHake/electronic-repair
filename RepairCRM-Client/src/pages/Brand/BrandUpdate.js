import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  Label,
  Input,
  Button,
  Card,
  ModalFooter,
} from "reactstrap";
import { useDispatch } from "react-redux";
import { updateBrand } from "../../store/Brand";

const BrandUpdate = ({ isOpen, toggle, brandData }) => {
  const dispatch = useDispatch();
  const [brand_name, setBrandName] = useState("");
  const [brandNameError, setBrandNameError] = useState("");

  useEffect(() => {
    if (brandData) {
      setBrandName(brandData.brand_name || "");
      setBrandNameError(""); // reset error when data changes
    }
  }, [brandData]);

  const handleInputChange = (e) => {
    setBrandName(e.target.value);
    setBrandNameError(""); // clear error while typing
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!brand_name.trim()) {
      setBrandNameError("Brand Name is required");
      return;
    }

    dispatch(updateBrand({ brand_id: brandData.brand_id, brand_name }));
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <Form onSubmit={handleSubmit}>
        <ModalHeader toggle={toggle} className="bg-light">
          <h4>Update Brand</h4>
        </ModalHeader>

        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            <div className="mb-3">
              <Label className="form-label fw-bold d-flex justify-content-between">
                <div>
                  Brand Name <span className="text-danger">*</span>
                </div>
                <div className="text-danger">{brandNameError}</div>
              </Label>

              <Input
                type="text"
                placeholder="Enter brand name"
                value={brand_name}
                onChange={handleInputChange}
                autoFocus
              />
            </div>
          </Card>
        </ModalBody>

        <ModalFooter>
          <Button color="primary" type="submit">
            Save
          </Button>
          <Button color="danger" type="button" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default BrandUpdate;
