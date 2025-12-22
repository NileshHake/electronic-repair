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
import { api } from "../../config";
const CategoryUpdate = ({ isOpen, toggle, categoryData }) => {
  const dispatch = useDispatch();
  const { updateCategoryResponse } = useSelector(
    (state) => state.CategoryReducer
  );

  const submitButtonRef = useRef();

  const [categoryDetails, setCategoryDetails] = useState({
    category_name: "",
    category_img: null, // IMPORTANT
  });

  const [previewImg, setPreviewImg] = useState(null);
  const [nameError, setNameError] = useState("");

  // ----------------------------------
  // Prefill category data
  // ----------------------------------
  useEffect(() => {
    if (categoryData) {
      setCategoryDetails({
        category_name: categoryData.category_name || "",
        category_img: null, // keep null unless user changes image
      });

      // existing image preview
      if (categoryData.category_img) {
        const imageUrl = categoryData.category_img.startsWith("http")
          ? categoryData.category_img
          : `${api.IMG_URL}category_img/${categoryData.category_img}`;

        setPreviewImg(imageUrl);
      }

      setNameError("");
    }
  }, [categoryData]);

  // ----------------------------------
  // Input change
  // ----------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryDetails((prev) => ({ ...prev, [name]: value }));
    if (name === "category_name") setNameError("");
  };

  // ----------------------------------
  // Image change (ONLY when user selects)
  // ----------------------------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCategoryDetails((prev) => ({
      ...prev,
      category_img: file,
    }));

    setPreviewImg(URL.createObjectURL(file));
  };

  // ----------------------------------
  // Submit update
  // ----------------------------------
  const handleUpdateCategory = (e) => {
    e.preventDefault();

    if (!categoryDetails.category_name.trim()) {
      setNameError("Category name is required");
      return;
    }

    const formData = new FormData();
    formData.append("category_id", categoryData.category_id);
    formData.append("category_name", categoryDetails.category_name);

    // 🔥 KEY LOGIC
    // append image ONLY if user selected new image
    if (categoryDetails.category_img instanceof File) {
      formData.append("category_img", categoryDetails.category_img);
    }

    dispatch(updateCategory(formData));
  };

  // ----------------------------------
  // Close modal on success
  // ----------------------------------
  useEffect(() => {
    if (updateCategoryResponse) {
      toggle();
      dispatch(resetUpdateCategoryResponse());
    }
  }, [updateCategoryResponse, dispatch, toggle]);

  // ----------------------------------
  // Keyboard shortcuts
  // ----------------------------------
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
                                style={{ color: "#009CA4", fontSize: "20px" }}
                              ></i>
                            </div>
                          </div>
                        </label>

                        <input
                          id="categoryImg"
                          type="file"
                          className="d-none"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={handleImageChange}
                        />
                      </div>

                      <div className="avatar-lg">
                        <div className="avatar-title bg-light rounded">
                          {previewImg && (
                            <img
                              src={previewImg}
                              alt="Category"
                              height="100"
                              width="100"
                              className="rounded"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
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
