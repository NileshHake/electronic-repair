import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  Row,
  Col,
  Label,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Input,
  CardBody,
} from "reactstrap";
import classnames from "classnames";
import Select from "react-select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Dropzone from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";

import { toast } from "react-toastify";
import { api } from "../../config";
import { resetAddProductResponse, resetUpdateProductResponse, updateProduct } from "../../store/product";
import { resetAddCategoryResponse } from "../../store/category";
import { resetAddTaxResponse } from "../../store/Tax";
import CategoryAdd from "../category/CategoryAdd";
import TaxAdd from "../Tax/TaxAdd";
import BrandAdd from "../Brand/BrandAdd";

const ProductUpdate = ({ isOpen, toggle, isProductData }) => {
  const [activeTab, setActiveTab] = useState("1");
  const dispatch = useDispatch();
  const { brands } = useSelector((state) => state.BrandReducer);
  const { taxes } = useSelector((state) => state.TaxReducer);
  const { categories } = useSelector((state) => state.CategoryReducer);
  const { addCategoryResponse } = useSelector(
    (state) => state.CategoryReducer
  );
  const { addTaxResponse } = useSelector((state) => state.TaxReducer);
  const [productData, setProductData] = useState(isProductData);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isTaxOpen, setIsTaxOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({});

  const [selectedFiles, setSelectedFiles] = useState([]);
  useEffect(() => {
    if (isProductData) {
      setProductData(isProductData);

      // ✅ Convert product_image JSON to usable preview data
      try {
        const imageArray = JSON.parse(isProductData.product_image || "[]");
        const mappedExistingImages = imageArray.map((imgName) => ({
          preview: api.IMG_URL + "product_images/" + imgName,
          name: imgName,
          formattedSize: "Existing Image",
          isExisting: true, // flag to differentiate old vs new
        }));
        setSelectedFiles(mappedExistingImages);
      } catch (error) {
        console.error("Error parsing product_image:", error);
        setSelectedFiles([]);
      }
    }
  }, [isProductData]);
  const handleInputChange = (key, value) => {
    setProductData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const AddHandler = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!productData.product_name.trim()) {
      errors.product_name = "Product Name is required";
    }

    if (Object.keys(errors).length > 0) {
      setErrorMessage(errors);
      return;
    }

    setErrorMessage({});

    const formData = new FormData();

    // Append normal fields (excluding images)
    Object.entries(productData).forEach(([key, value]) => {
      if (key !== "product_image") {
        formData.append(key, value);
      }
    });

    // Handle both existing + new images
    for (const file of selectedFiles) {
      if (file.isExisting) {
        // Convert URL to actual File object
        const response = await fetch(file.preview);
        const blob = await response.blob();
        const existingFile = new File([blob], file.name, { type: blob.type });
        formData.append("product_image[]", existingFile);
      } else {
        // Directly append new File object
        formData.append("product_image[]", file);
      }
    }

    // ✅ Now dispatch with FormData
    dispatch(updateProduct(formData));
  };

  const updateProductResponse = useSelector(
    (state) => state.ProductReducer.updateProductResponse
  );
  useEffect(() => {
    if (updateProductResponse === true) {
      toggle();
      dispatch(resetUpdateProductResponse());
    }
  }, [updateProductResponse, dispatch]);

  const handleAcceptedFiles = (files) => {
    const mappedFiles = files.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        formattedSize: formatBytes(file.size),
        isExisting: false,
      })
    );

    setSelectedFiles((prev) => [...prev, ...mappedFiles]);
    setProductData((prev) => ({
      ...prev,
      product_image: [...(prev.product_image || []), ...files],
    }));
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const removeFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);

    // Update both states in sync
    setSelectedFiles(updatedFiles);
    setProductData((prev) => ({
      ...prev,
      product_image: updatedFiles, // maintain same structure
    }));
  };

  useEffect(() => {
    if (addCategoryResponse) {
      setIsCategoryModalOpen(false)

      dispatch(resetAddCategoryResponse());
    }
    if (addTaxResponse) {
      setIsTaxOpen(false)

      dispatch(resetAddTaxResponse());
    }
  }, [addCategoryResponse, addTaxResponse, dispatch, toggle]);
  return (
    <Modal size="xl" isOpen={isOpen} centered toggle={() => toggle()}>
      <ModalHeader toggle={() => toggle()} className="modal-title ms-2">
        Update Product
      </ModalHeader>

      <form onSubmit={AddHandler}>
        <div className="p-4">
          <Card className="border card-border-success shadow-lg">
            <Nav className="nav-tabs nav-tabs-custom nav-success p-2 pb-0 bg-light">
              <NavItem>
                <NavLink
                  href="#"
                  className={classnames({ active: activeTab === "1" })}
                  onClick={() => toggleTab("1")}
                >
                  Primary Information
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  href="#"
                  className={classnames({ active: activeTab === "2" })}
                  onClick={() => toggleTab("2")}
                >
                  Product Gallery
                </NavLink>
              </NavItem>
            </Nav>

            <ModalBody>
              <TabContent activeTab={activeTab}>
                {/* TAB 1 */}
                <TabPane tabId="1">
                  <Row>
                    <Col lg={4} className="mt-2">
                      <Label className="form-label fw-bold">
                        Product Name<span className="text-danger"> *</span>
                      </Label>
                      <Input
                        type="text"
                        placeholder="Enter Product Name"
                        value={productData.product_name}
                        onChange={(e) =>
                          handleInputChange("product_name", e.target.value)
                        }
                      />
                      {errorMessage.product_name && (
                        <div className="text-danger small">
                          {errorMessage.product_name}
                        </div>
                      )}
                    </Col>

                    {/* Category */}
                    <Col lg={4}>

                      <div className="d-flex justify-content-between align-items-center">
                        <Label className=" fw-bold mb-0">
                          Select Category
                        </Label>
                        <span
                          role="button"
                          onClick={() => setIsCategoryModalOpen(true)}
                          className="text-success fw-bold me-2"
                          style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
                        >
                          +
                        </span>
                      </div>
                      <Select
                        placeholder="Select Category"
                        options={categories.map((c) => ({
                          value: c.category_id,
                          label: c.category_name,
                        }))}
                        value={
                          categories
                            .map((c) => ({ value: c.category_id, label: c.category_name }))
                            .find((opt) => opt.value == productData.product_category) || null
                        }
                        onChange={(selected) =>
                          handleInputChange("product_category", selected.value)
                        }
                      />

                    </Col>



                    {/* Brand */}
                    <Col lg={4} >
                      <div className="d-flex justify-content-between align-items-center">
                        <Label className=" fw-bold mb-0">
                          Select  Brand
                        </Label>
                        <span
                          role="button"
                          onClick={() => setIsBrandOpen(true)}
                          className="text-success fw-bold me-2"
                          style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
                        >
                          +
                        </span>
                      </div>
                      <Select
                        placeholder="Select Brand"
                        options={brands.map((b) => ({
                          value: b.brand_id,
                          label: b.brand_name,
                        }))}
                        value={
                          brands
                            .map((b) => ({ value: b.brand_id, label: b.brand_name }))
                            .find((opt) => opt.value == productData.product_brand) || null
                        }
                        onChange={(selected) =>
                          handleInputChange("product_brand", selected.value)
                        }
                      />

                    </Col>
                    <Col lg={4} className="mt-2 ">
                      <div className="d-flex justify-content-between align-items-center">
                        <Label className=" fw-bold mb-0">
                          Select Tax %
                        </Label>
                        <span
                          role="button"
                          onClick={() => setIsTaxOpen(true)}
                          className="text-success fw-bold me-2"
                          style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
                        >
                          +
                        </span>
                      </div>
                      <Select
                        placeholder="Select Tax %"
                        options={taxes.map((t) => ({
                          value: t.tax_id,
                          label: t.tax_name,
                        }))}
                        value={
                          taxes
                            .map((t) => ({ value: t.tax_id, label: t.tax_name }))
                            .find((opt) => opt.value == productData.product_tax) || null
                        }
                        onChange={(selected) =>
                          handleInputChange("product_tax", selected.value)
                        }
                      />

                    </Col>
                    <Col lg={4} className="mt-3 ">
                      <Label className="form-label fw-bold">
                        Product Usage
                      </Label>

                      <Select
                        value={[
                          { value: "sale", label: "Only Sale" },
                          { value: "repair", label: "Only Repair" },
                          { value: "both", label: "Sale & Repair Both" }
                        ].find((type) => type.value == productData.product_usage_type)}
                        placeholder="Select Usage"
                        options={[
                          { value: "sale", label: "Only Sale" },
                          { value: "repair", label: "Only Repair" },
                          { value: "both", label: "Sale & Repair Both" }
                        ]}
                        onChange={(selected) =>
                          handleInputChange("product_usage_type", selected.value)
                        }
                      />

                      {errorMessage.product_usage_type && (
                        <div className="text-danger small">
                          {errorMessage.product_usage_type}
                        </div>
                      )}
                    </Col>
                    <Col lg={12}>
                      <div className="table-responsive table-card mt-4 p-3">
                        <table className="table text-center align-middle">
                          <thead className="bg-light">
                            <tr>
                              <th>MRP</th>
                              <th>Sale</th>
                              <th>Purchase Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {[
                                "product_mrp",
                                "product_sale_price",
                                "product_purchase_price",
                              ].map((field) => (
                                <td key={field}>
                                  <input
                                    type="number"
                                    className="form-control text-end fw-bold"
                                    value={productData[field]}
                                    onChange={(e) =>
                                      handleInputChange(field, e.target.value)
                                    }
                                  />
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </Col>

                    <Col lg={12}>
                      <Label className="form-label fw-bold">Description</Label>
                      <CKEditor
                        editor={ClassicEditor}
                        data={productData.product_description}
                        onChange={(event, editor) =>
                          handleInputChange(
                            "product_description",
                            editor.getData()
                          )
                        }
                      />
                    </Col>
                  </Row>
                </TabPane>

                {/* TAB 2 */}
                <TabPane tabId="2">
                  <Row>
                    <Col lg={12}>
                      <Card className="mb-4">
                        <CardBody>
                          <h5 className="fs-15 mb-1">Product Gallery</h5>
                          <p className="text-muted">
                            Add Product Gallery Images.
                          </p>

                          <Dropzone onDrop={handleAcceptedFiles}>
                            {({ getRootProps, getInputProps }) => (
                              <div
                                className="dropzone dz-clickable"
                                {...getRootProps()}
                              >
                                <div className="dz-message needsclick">
                                  <div className="mb-3">
                                    <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                                  </div>
                                  <h5>Drop files here or click to upload.</h5>
                                </div>
                                <input {...getInputProps()} />
                              </div>
                            )}
                          </Dropzone>

                          <div className="mt-4">
                            <h6 className="text-muted mb-3">Preview Gallery</h6>
                            <Row className="g-3">
                              {selectedFiles.map((file, i) => (
                                <Col key={i} xs="6" sm="4" md="3" lg="2">
                                  <Card className="shadow-sm border-0 h-100">
                                    <div className="position-relative">
                                      <img
                                        src={file.preview}
                                        alt={file.name}
                                        className="img-fluid rounded-top"
                                        style={{
                                          width: "100%",
                                          height: "150px",
                                          objectFit: "cover",
                                          opacity: file.isExisting ? 0.9 : 1,
                                        }}
                                      />
                                      <div
                                        className="position-absolute top-0 end-0 m-1 bg-white rounded-circle shadow-sm"
                                        style={{
                                          width: "25px",
                                          height: "25px",
                                          cursor: "pointer",
                                        }}
                                        title="Remove Image"
                                        onClick={() => removeFile(i)}
                                      >
                                        <i
                                          className="ri-close-line text-danger d-flex justify-content-center align-items-center"
                                          style={{
                                            fontSize: "16px",
                                            height: "100%",
                                          }}
                                        ></i>
                                      </div>
                                    </div>
                                    <div className="p-2 text-center">
                                      <p
                                        className="mb-0 fw-semibold text-truncate"
                                        title={file.name}
                                      >
                                        {file.name}
                                      </p>
                                      <small className="text-muted">
                                        {file.formattedSize}
                                      </small>
                                    </div>
                                  </Card>
                                </Col>
                              ))}
                            </Row>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
              </TabContent>
            </ModalBody>

            <ModalFooter>
              <div className="hstack gap-2 justify-content-center mt-2">
                <Button color="danger" type="button" onClick={() => toggle()}>
                  <i className="ri-close-line me-1 align-middle" />
                  Close
                </Button>
                <Button color="primary" type="submit">
                  <i className="ri-save-3-line align-bottom me-1"></i>
                  Save
                </Button>
              </div>
            </ModalFooter>
          </Card>
        </div>
      </form>

      {isCategoryModalOpen && (
        <CategoryAdd
          isOpen={isCategoryModalOpen}
          toggle={() => setIsCategoryModalOpen(false)}
        />
      )}
      {isBrandOpen && (
        <BrandAdd
          isOpen={isBrandOpen}
          toggle={() => setIsBrandOpen(false)}
        />
      )}
      {isTaxOpen && (
        <TaxAdd
          isOpen={isTaxOpen}
          toggle={() => setIsTaxOpen(false)}
        />
      )}
    </Modal>
  );
};

export default ProductUpdate;
