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
  updateCategory,
  resetUpdateCategoryResponse,
} from "../../store/category/index";

const CategoryUpdate = ({ isOpen, toggle, categoryData }) => {
  const dispatch = useDispatch();
  const { updateCategoryResponse } = useSelector(
    (state) => state.CategoryReducer
  );

  const [categoryDetails, setCategoryDetails] = useState({
    category_name: "",
  });

  const [nameError, setNameError] = useState("");
  const submitButtonRef = useRef();

  // ✅ Prefill data when modal opens
  useEffect(() => {
    if (categoryData) {
      setCategoryDetails({
        category_name: categoryData.category_name || "",
      });
      setNameError("");
    }
  }, [categoryData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryDetails((prev) => ({ ...prev, [name]: value }));
    if (name === "category_name") setNameError("");
  };

  const handleUpdateCategory = (e) => {
    e.preventDefault();

    if (!categoryDetails.category_name.trim()) {
      setNameError("Category name is required");
      return;
    }

    const payload = {
      category_id: categoryData.category_id,
      ...categoryDetails,
    };

    dispatch(updateCategory(payload));
  };

  // ✅ Close modal on successful update
  useEffect(() => {
    if (updateCategoryResponse) {
      toggle();
      setNameError("");
      dispatch(resetUpdateCategoryResponse());
    }
  }, [updateCategoryResponse, dispatch, toggle]);

  // ✅ Keyboard Shortcuts (Alt+S for Save, Alt+Esc for Close)
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
      <Modal id="categoryUpdateModal" size="md" isOpen={isOpen} centered>
        <Form onSubmit={handleUpdateCategory}>
          <ModalHeader toggle={toggle} className="bg-light">
            <h4>Update Category</h4>
          </ModalHeader>

          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row>
                <Col lg={12}>
                  <Label className="form-label fw-bold d-flex justify-content-between mt-3">
                    <div>
                      Category Name <span className="text-danger">*</span>
                    </div>
                    <div className="text-danger">{nameError}</div>
                  </Label>
                  <Input
                    name="category_name"
                    placeholder="Enter category name"
                    type="text"
                    value={categoryDetails.category_name}
                    onChange={handleInputChange}
                    autoFocus
                  />
                </Col>
              </Row>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button ref={submitButtonRef} color="primary" type="submit">
              Update
            </Button>
            <Button color="danger" type="button" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default CategoryUpdate;
