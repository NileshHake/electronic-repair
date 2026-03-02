import React, { useEffect, useRef, useState, useMemo } from "react";
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
  CardBody,
} from "reactstrap";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import Dropzone from "react-dropzone";

// ✅ rental device actions
import { addRentalDevice, resetAddRentalDeviceResponse } from "../../store/RentalDevice";

// ✅ category / subcategory / brand actions
import { getBrandsList } from "../../store/Brand";
import { getCategoriesList, getSubCategoriesList } from "../../store/category";

/* ---------------- helpers ---------------- */
const fmtBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const selectPortal = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const RentalDeviceAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const submitRef = useRef();

  const { addRentalDeviceResponse } = useSelector((state) => state.RentalDeviceReducer);

  const { categories = [], subCategories = [] } = useSelector((state) => state.CategoryReducer);
  const { brands = [] } = useSelector((state) => state.BrandReducer);

  // ✅ form
  const [form, setForm] = useState({
    device_category: "",
    device_sub_category_id: "",
    device_brand: "",
    device_name: "",
    device_model: "",
    stock_qty: 0,
    base_rent_per_day: "",
    base_rent_per_week: "",
    base_rent_per_month: "",
    security_deposit: "",
    min_rental_days: 1,
    delivery_available: 0,
    delivery_fee: "",
    status: "active",
  });

  // ✅ gallery files (new uploads)
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [error, setError] = useState({});

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ open modal -> load dropdowns
  useEffect(() => {
    if (isOpen) {
      dispatch(getCategoriesList());
      dispatch(getBrandsList());
    }
  }, [dispatch, isOpen]);

  // ✅ category change -> load subcategories
  useEffect(() => {
    if (form.device_category) {
      dispatch(getSubCategoriesList(form.device_category));
    }
  }, [dispatch, form.device_category]);

  // ✅ react-select options
  const categoryOptions = useMemo(
    () => (categories || []).map((c) => ({ value: c.category_id, label: c.category_name })),
    [categories]
  );

  const subCategoryOptions = useMemo(
    () =>
      (subCategories || []).map((s) => ({
        value: s.category_id, // if your subcategory id key is different, change here
        label: s.category_name,
      })),
    [subCategories]
  );

  const brandOptions = useMemo(
    () => (brands || []).map((b) => ({ value: b.brand_id, label: b.brand_name })),
    [brands]
  );

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const deliveryOptions = [
    { value: 0, label: "No" },
    { value: 1, label: "Yes" },
  ];

  // ✅ selected
  const selectedCategory =
    categoryOptions.find((o) => String(o.value) === String(form.device_category)) || null;

  const selectedSubCategory =
    subCategoryOptions.find((o) => String(o.value) === String(form.device_sub_category_id)) || null;

  const selectedBrand =
    brandOptions.find((o) => String(o.value) === String(form.device_brand)) || null;

  const selectedStatus = statusOptions.find((o) => o.value === form.status) || null;

  const selectedDelivery =
    deliveryOptions.find((o) => Number(o.value) === Number(form.delivery_available)) || null;

  // ✅ Dropzone handler
  const handleAcceptedFiles = (files) => {
    const onlyImages = (files || []).filter((f) => f.type?.startsWith("image/"));

    const mapped = onlyImages.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      formattedSize: fmtBytes(file.size),
    }));

    setGalleryFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (index) => {
    setGalleryFiles((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1)[0];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return next;
    });
  };

  const validate = () => {
    const e = {};
    if (!String(form.device_category).trim()) e.device_category = "Category is required";
    if (!String(form.device_brand).trim()) e.device_brand = "Brand is required";
    if (!String(form.device_name).trim()) e.device_name = "Device name is required";
    if (!String(form.device_model).trim()) e.device_model = "Model is required";

    const day = Number(form.base_rent_per_day || 0);
    const week = Number(form.base_rent_per_week || 0);
    const month = Number(form.base_rent_per_month || 0);
    if (day <= 0 && week <= 0 && month <= 0) e.base_rent_per_day = "Add rent (day/week/month)";

    if (Number(form.min_rental_days || 0) <= 0) e.min_rental_days = "Min rental days must be 1+";

    setError(e);
    return Object.keys(e).length === 0;
  };

  const buildFormData = () => {
    const fd = new FormData();

    fd.append("device_category", String(form.device_category));
    fd.append("device_sub_category_id", String(form.device_sub_category_id));
    fd.append("device_brand", String(form.device_brand)); // ✅ FIXED (NO SPACE)

    fd.append("device_name", String(form.device_name));
    fd.append("device_model", String(form.device_model));

    fd.append("stock_qty", String(Number(form.stock_qty || 0)));

    if (form.base_rent_per_day !== "") fd.append("base_rent_per_day", String(form.base_rent_per_day));
    if (form.base_rent_per_week !== "") fd.append("base_rent_per_week", String(form.base_rent_per_week));
    if (form.base_rent_per_month !== "") fd.append("base_rent_per_month", String(form.base_rent_per_month));

    if (form.security_deposit !== "") fd.append("security_deposit", String(form.security_deposit));

    fd.append("min_rental_days", String(Number(form.min_rental_days || 1)));
    fd.append("delivery_available", String(Number(form.delivery_available || 0)));
    fd.append(
      "delivery_fee",
      String(Number(form.delivery_available) === 1 ? Number(form.delivery_fee || 0) : 0)
    );
    fd.append("status", String(form.status));

    galleryFiles.forEach((x) => fd.append("images", x.file)); // req.files.images

    return fd;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch(addRentalDevice(buildFormData()));
  };

  // ✅ success reset
  useEffect(() => {
    if (addRentalDeviceResponse) {
      toggle();

      galleryFiles.forEach((x) => x.preview && URL.revokeObjectURL(x.preview));
      setGalleryFiles([]);

      setForm({
        device_category: "",
        device_sub_category_id: "",
        device_brand: "",
        device_name: "",
        device_model: "",
        stock_qty: 0,
        base_rent_per_day: "",
        base_rent_per_week: "",
        base_rent_per_month: "",
        security_deposit: "",
        min_rental_days: 1,
        delivery_available: 0,
        delivery_fee: "",
        status: "active",
      });

      setError({});
      dispatch(resetAddRentalDeviceResponse());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addRentalDeviceResponse]);

  return (
    <>
      <Modal size="xl" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle}>Create Rental Device</ModalHeader>

        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row className="g-3">
                {/* Category */}
                <Col md="4">
                  <Label className="d-flex justify-content-between">
                    <div>
                      Category <span className="text-danger">*</span>
                    </div>
                    {error.device_category && <div className="text-danger text-sm">{error.device_category}</div>}
                  </Label>

                  <Select
                    value={selectedCategory}
                    onChange={(opt) => {
                      const v = opt ? opt.value : "";
                      setField("device_category", v);
                      setField("device_sub_category_id", "");
                      if (v) dispatch(getSubCategoriesList(v));
                    }}
                    options={categoryOptions}
                    placeholder="Select Category"
                    menuPortalTarget={document.body}
                    styles={selectPortal}
                  />
                </Col>

                {/* SubCategory */}
                <Col md="4">
                  <Label>Sub Category</Label>
                  <Select
                    value={selectedSubCategory}
                    onChange={(opt) => setField("device_sub_category_id", opt ? opt.value : "")}
                    options={subCategoryOptions}
                    placeholder={form.device_category ? "Select Sub Category" : "Select Category First"}
                    isDisabled={!form.device_category}
                    menuPortalTarget={document.body}
                    styles={selectPortal}
                  />
                </Col>

                {/* Brand */}
                <Col md="4">
                  <Label className="d-flex justify-content-between">
                    <div>
                      Brand <span className="text-danger">*</span>
                    </div>
                    {error.device_brand && <div className="text-danger text-sm">{error.device_brand}</div>}
                  </Label>
                  <Select
                    value={selectedBrand}
                    onChange={(opt) => setField("device_brand", opt ? opt.value : "")} // ✅ FIXED
                    options={brandOptions}
                    placeholder="Select Brand"
                    menuPortalTarget={document.body}
                    styles={selectPortal}
                  />
                </Col>

                {/* Device Name */}
                <Col md="6">
                  <Label className="d-flex justify-content-between">
                    <div>
                      Device Name <span className="text-danger">*</span>
                    </div>
                    {error.device_name && <div className="text-danger text-sm">{error.device_name}</div>}
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter device name"
                    value={form.device_name}
                    onChange={(e) => setField("device_name", e.target.value)}
                  />
                </Col>

                {/* Model */}
                <Col md="6">
                  <Label className="d-flex justify-content-between">
                    <div>
                      Model <span className="text-danger">*</span>
                    </div>
                    {error.device_model && <div className="text-danger text-sm">{error.device_model}</div>}
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter model"
                    value={form.device_model}
                    onChange={(e) => setField("device_model", e.target.value)}
                  />
                </Col>

                {/* Stock */}
                <Col md="3">
                  <Label>Stock Qty</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.stock_qty}
                    onChange={(e) => setField("stock_qty", e.target.value)}
                  />
                </Col>

                {/* Rent Day */}
                <Col md="3">
                  <Label className="d-flex justify-content-between">
                    <div>Rent / Day</div>
                    {error.base_rent_per_day && <div className="text-danger text-sm">{error.base_rent_per_day}</div>}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.base_rent_per_day}
                    onChange={(e) => setField("base_rent_per_day", e.target.value)}
                  />
                </Col>

                {/* Rent Week */}
                <Col md="3">
                  <Label>Rent / Week</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.base_rent_per_week}
                    onChange={(e) => setField("base_rent_per_week", e.target.value)}
                  />
                </Col>

                {/* Rent Month */}
                <Col md="3">
                  <Label>Rent / Month</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.base_rent_per_month}
                    onChange={(e) => setField("base_rent_per_month", e.target.value)}
                  />
                </Col>

                {/* Deposit */}
                <Col md="3">
                  <Label>Security Deposit</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.security_deposit}
                    onChange={(e) => setField("security_deposit", e.target.value)}
                  />
                </Col>

                {/* Min days */}
                <Col md="3">
                  <Label className="d-flex justify-content-between">
                    <div>Min Rental Days</div>
                    {error.min_rental_days && <div className="text-danger text-sm">{error.min_rental_days}</div>}
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.min_rental_days}
                    onChange={(e) => setField("min_rental_days", e.target.value)}
                  />
                </Col>

                {/* Delivery */}
                <Col md="3">
                  <Label>Delivery Available</Label>
                  <Select
                    options={deliveryOptions}
                    value={selectedDelivery}
                    onChange={(opt) => setField("delivery_available", opt ? opt.value : 0)}
                    placeholder="Select Delivery"
                    menuPortalTarget={document.body}
                    styles={selectPortal}
                  />
                </Col>

                {/* Delivery Fee */}
                <Col md="3">
                  <Label>Delivery Fee</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.delivery_fee}
                    onChange={(e) => setField("delivery_fee", e.target.value)}
                    disabled={Number(form.delivery_available) !== 1}
                  />
                </Col>

                {/* Status */}
                <Col md="3">
                  <Label>Status</Label>
                  <Select
                    options={statusOptions}
                    value={selectedStatus}
                    onChange={(opt) => setField("status", opt ? opt.value : "active")}
                    placeholder="Select Status"
                    menuPortalTarget={document.body}
                    styles={selectPortal}
                  />
                </Col>
              </Row>

              {/* Gallery UI */}
              <Card className="mt-3 border-0 shadow-sm">
                <CardBody>
                  <h5 className="fs-15 mb-1">Product Gallery</h5>
                  <p className="text-muted">Add Product Gallery Images.</p>

                  <Dropzone onDrop={handleAcceptedFiles} accept={{ "image/*": [] }} multiple>
                    {({ getRootProps, getInputProps }) => (
                      <div className="dropzone dz-clickable" {...getRootProps()}>
                        <div className="dz-message needsclick">
                          <div className="mb-3">
                            <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                          </div>
                          <h5>Drop images here or click to upload.</h5>
                        </div>
                        <input {...getInputProps()} />
                      </div>
                    )}
                  </Dropzone>

                  <div className="mt-4">
                    <h6 className="text-muted mb-3">Preview Gallery</h6>
                    <Row className="g-3">
                      {(galleryFiles || []).map((file, i) => (
                        <Col key={i} xs="6" sm="4" md="3" lg="2">
                          <Card className="shadow-sm border-0 h-100">
                            <div className="position-relative">
                              <img
                                src={file.preview}
                                alt={file.name}
                                className="img-fluid rounded-top"
                                style={{ width: "100%", height: "150px", objectFit: "cover" }}
                              />
                              <div
                                className="position-absolute top-0 end-0 m-1 bg-white rounded-circle shadow-sm"
                                style={{ width: "25px", height: "25px", cursor: "pointer" }}
                                title="Remove Image"
                                onClick={() => removeFile(i)}
                              >
                                <i
                                  className="ri-close-line text-danger d-flex justify-content-center align-items-center"
                                  style={{ fontSize: "16px", height: "100%" }}
                                />
                              </div>
                            </div>

                            <div className="p-2 text-center">
                              <p className="mb-0 fw-semibold text-truncate" title={file.name}>
                                {file.name}
                              </p>
                              <small className="text-muted">{file.formattedSize}</small>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </CardBody>
              </Card>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button color="primary" type="submit" ref={submitRef}>
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

export default RentalDeviceAdd;