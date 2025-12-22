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
  addCategory,
  resetAddCategoryResponse,
} from "../../store/category/index";

const CategoryAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const { addCategoryResponse } = useSelector(
    (state) => state.CategoryReducer
  );

  const submitButtonRef = useRef();

  const [categoryDetails, setCategoryDetails] = useState({
    category_name: "",
    category_img: null,
  });

  const [previewCategoryImg, setPreviewCategoryImg] = useState(null);
  const [nameError, setNameError] = useState("");
  const [imageError, setImageError] = useState("");

  // -----------------------------
  // Input change
  // -----------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryDetails((prev) => ({ ...prev, [name]: value }));
    if (name === "category_name") setNameError("");
  };

  // -----------------------------
  // Category Image handler
  // -----------------------------
  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setImageError("Only PNG, JPG, JPEG allowed");
      return;
    }

    setImageError("");

    setCategoryDetails((prev) => ({
      ...prev,
      category_img: file,
    }));

    setPreviewCategoryImg(URL.createObjectURL(file));
  };

  // -----------------------------
  // Submit
  // -----------------------------
  const handleAddCategory = (e) => {
    e.preventDefault();

    if (!categoryDetails.category_name.trim()) {
      setNameError("Category name is required");
      return;
    }

    const formData = new FormData();
    formData.append("category_name", categoryDetails.category_name);

    if (categoryDetails.category_img) {
      formData.append("category_img", categoryDetails.category_img);
    }

    dispatch(addCategory(formData));
  };

  // -----------------------------
  // Auto-close on success
  // -----------------------------
  useEffect(() => {
    if (addCategoryResponse) {
      toggle();
      setCategoryDetails({
        category_name: "",
        category_img: null,
      });
      setPreviewCategoryImg(null);
      setNameError("");
      setImageError("");
      dispatch(resetAddCategoryResponse());
    }
  }, [addCategoryResponse, dispatch, toggle]);

  // -----------------------------
  // Keyboard shortcuts
  // -----------------------------
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
      <Modal id="categoryAddModal" size="md" isOpen={isOpen} centered>
        <Form onSubmit={handleAddCategory}>
          <ModalHeader toggle={toggle} className="bg-light">
            <h4>Create Category</h4>
          </ModalHeader>

          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row>
                {/* Category Name */}
                <Col lg={12}>
                  <Label className="form-label fw-bold d-flex justify-content-between">
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

                {/* Category Image */}
                <Col lg={6} className="mt-3">
                  <h5 className="fs-15 mb-1">Category Image</h5>

                  <div className="text-center">
                    <div className="position-relative d-inline-block">
                      <div className="position-absolute top-100 start-100 translate-middle">
                        <label htmlFor="categoryImg" className="mb-0">
                          <div className="avatar-xs">
                            <div className="avatar-title bg-light border rounded-circle cursor-pointer">
                              <i
                                className="ri-image-fill"
                                style={{
                                  color: "#009CA4",
                                  fontSize: "20px",
                                }}
                              ></i>
                            </div>
                          </div>
                        </label>

                        <input
                          id="categoryImg"
                          type="file"
                          className="d-none"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={handleCategoryImageChange}
                        />
                      </div>

                      <div className="avatar-lg">
                        <div className="avatar-title bg-light rounded">
                          {previewCategoryImg && (
                            <img
                              src={previewCategoryImg}
                              alt="Category"
                              height="100"
                              width="100"
                              className="rounded"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {imageError && (
                      <div className="text-danger mt-1">{imageError}</div>
                    )}
                  </div>
                </Col>
              </Row>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button ref={submitButtonRef} color="primary" type="submit">
              Save
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

export default CategoryAdd;
