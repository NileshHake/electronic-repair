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
import { addCategory, resetAddCategoryResponse } from "../../../store/category";

 

const SubCategoryAdd = ({ isOpen, toggle, category_id, category_name }) => {
  const dispatch = useDispatch();
  const { addCategoryResponse } = useSelector(
    (state) => state.CategoryReducer
  );

  const submitButtonRef = useRef();

  const [categoryDetails, setCategoryDetails] = useState({
    category_name: category_name || "",
  });
  const [nameError, setNameError] = useState("");

  // -----------------------------
  // Input change
  // -----------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryDetails({ ...categoryDetails, [name]: value });
    setNameError("");
  };

  // -----------------------------
  // Submit
  // -----------------------------
  const handleAddCategory = (e) => {
    e.preventDefault();

    if (!categoryDetails.category_name.trim()) {
      setNameError("Name is required");
      return;
    }

    const payload = {
      category_name: categoryDetails.category_name,
      category_main_id: category_id, // send parent ID
    };

    dispatch(addCategory(payload));
  };

  // -----------------------------
  // Auto-close on success
  // -----------------------------
  useEffect(() => {
    if (addCategoryResponse) {
      toggle();
      setCategoryDetails({ category_name: "" });
      setNameError("");
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
      <Modal size="md" isOpen={isOpen} centered>
        <Form onSubmit={handleAddCategory}>
          <ModalHeader toggle={toggle} className="bg-light">
            <h4>Add Sub Category</h4>
          </ModalHeader>

          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row>
                <Col lg={12}>
                  <Label className="form-label fw-bold d-flex justify-content-between">
                    <div>
                      Name <span className="text-danger">*</span>
                    </div>
                    <div className="text-danger">{nameError}</div>
                  </Label>
                  <Input
                    name="category_name"
                    placeholder="Enter name"
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

export default SubCategoryAdd;
