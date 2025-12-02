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
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// 🔁 Yaha apna correct action import karo (customer nahi, user wala hoga to uska)
import { addCustomer } from "../../store/Customer";

const CustomerAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const submitButtonRef = useRef();

  // ✅ State for user data
  const [userData, setUserData] = useState({
    user_name: "",
    user_email: "",
    user_password: "",
    user_type: 6,
    user_phone_number: "",
    user_role_id: 3, // static 3
    user_address_pincode: "",
    user_address_state: "",
    user_address_district: "",
    user_address_block: "",
    user_address_city: "",
    user_address_description: "",
    user_profile: null, // file
  });

  const [errors, setErrors] = useState({});

  // ✅ Profile image state
  const [previewProfile, setPreviewProfile] = useState(null);

  // ✅ Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Handle profile change
  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // optional: file type / size validation
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      toast.error("Only PNG, JPG, JPEG allowed");
      return;
    }

    setUserData((prev) => ({
      ...prev,
      user_profile: file,
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewProfile(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};

    if (!userData.user_name) newErrors.user_name = "Name is required";
    if (!userData.user_email) newErrors.user_email = "Email is required";
    if (!userData.user_password) newErrors.user_password = "Password is required";
    if (!userData.user_phone_number)
      newErrors.user_phone_number = "Phone Number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // 👉 Agar backend ko multipart chahiye to FormData use karo
    const formData = new FormData();
    formData.append("user_name", userData.user_name);
    formData.append("user_type", userData.user_type);
    formData.append("user_email", userData.user_email);
    formData.append("user_password", userData.user_password);
    formData.append("user_phone_number", userData.user_phone_number);
    formData.append("user_role_id", userData.user_role_id);
    formData.append("user_address_pincode", userData.user_address_pincode || "");
    formData.append("user_address_state", userData.user_address_state || "");
    formData.append("user_address_district", userData.user_address_district || "");
    formData.append("user_address_block", userData.user_address_block || "");
    formData.append("user_address_city", userData.user_address_city || "");
    formData.append(
      "user_address_description",
      userData.user_address_description || ""
    );
    if (userData.user_profile) {
      formData.append("user_profile", userData.user_profile);
    }

    // 🔁 Yaha action ko update karo: addCustomer ki jagah addUser ho sakta hai
    dispatch(addCustomer(formData));
    
    toggle();

    // Reset form
    setUserData({
      user_name: "",
      user_email: "",
      user_type: 6,
      user_password: "",
      user_phone_number: "",
      user_role_id: 3,
      user_address_pincode: "",
      user_address_state: "",
      user_address_district: "",
      user_address_block: "",
      user_address_city: "",
      user_address_description: "",
      user_profile: null,
    });
    setPreviewProfile(null);
  };

  // ✅ Keyboard shortcuts (Alt+S = Save, Alt+Esc = Close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        submitButtonRef.current?.click();
      }
      if (e.altKey && e.key === "Escape") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
        <ModalHeader toggle={toggle} className="bg-light fw-bold p-3">
          Add Customer
        </ModalHeader>
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        >
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row className="gy-3">
                {/* Name */}
                <Col lg={4}>
                  <Label className="form-label fw-bold d-flex justify-content-between">
                    <span>
                      Name <span className="text-danger">*</span>
                    </span>
                  </Label>
                  <Input
                    name="user_name"
                    type="text"
                    placeholder="Enter Name"
                    value={userData.user_name}
                    onChange={handleInputChange}
                  />
                  <span className="text-danger text-sm">
                    {errors.user_name}
                  </span>
                </Col>

                {/* Phone */}
                <Col lg={4}>
                  <Label className="form-label fw-bold">
                    Phone Number <span className="text-danger">*</span>
                  </Label>
                  <Input
                    name="user_phone_number"
                    type="text"
                    placeholder="Enter Phone Number"
                    value={userData.user_phone_number}
                    maxLength={10}
                    onChange={handleInputChange}
                  />
                  <span className="text-danger text-sm">
                    {errors.user_phone_number}
                  </span>
                </Col>

                {/* Email */}
                <Col lg={4}>
                  <Label className="form-label fw-bold">
                    Email <span className="text-danger">*</span>
                  </Label>
                  <Input
                    name="user_email"
                    type="email"
                    placeholder="Enter Email Address"
                    value={userData.user_email}
                    onChange={handleInputChange}
                  />
                  <span className="text-danger text-sm">
                    {errors.user_email}
                  </span>
                </Col>

                {/* Password */}
                <Col lg={4}>
                  <Label className="form-label fw-bold">
                    Password <span className="text-danger">*</span>
                  </Label>
                  <Input
                    name="user_password"
                    type="password"
                    placeholder="Enter Password"
                    value={userData.user_password}
                    onChange={handleInputChange}
                  />
                  <span className="text-danger text-sm">
                    {errors.user_password}
                  </span>
                </Col>

                {/* Pincode */}
                <Col lg={4}>
                  <Label className="form-label fw-bold d-flex justify-content-between">
                    <span>Pincode</span>
                  </Label>
                  <Input
                    name="user_address_pincode"
                    type="text"
                    placeholder="Enter Pincode"
                    value={userData.user_address_pincode}
                    onChange={handleInputChange}
                    maxLength={6}
                  />
                </Col>

                {/* City */}
                <Col lg={4}>
                  <Label className="form-label fw-bold">City</Label>
                  <Input
                    name="user_address_city"
                    type="text"
                    placeholder="Enter City"
                    value={userData.user_address_city}
                    onChange={handleInputChange}
                  />
                </Col>

                {/* State */}
                <Col lg={4}>
                  <Label className="form-label fw-bold">State</Label>
                  <Input
                    name="user_address_state"
                    type="text"
                    placeholder="Enter State"
                    value={userData.user_address_state}
                    onChange={handleInputChange}
                  />
                </Col>

                {/* District */}
                <Col lg={4}>
                  <Label className="form-label fw-bold">District</Label>
                  <Input
                    name="user_address_district"
                    type="text"
                    placeholder="Enter District"
                    value={userData.user_address_district}
                    onChange={handleInputChange}
                  />
                </Col>

                {/* Block */}
                <Col lg={4}>
                  <Label className="form-label fw-bold">Block</Label>
                  <Input
                    name="user_address_block"
                    type="text"
                    placeholder="Enter Block"
                    value={userData.user_address_block}
                    onChange={handleInputChange}
                  />
                </Col>

                {/* Profile Photo */}
                <Col lg={6} className="mt-3">
                  <h5 className="fs-15 mb-1">Profile Photo</h5>
                  <div className="text-center">
                    <div className="position-relative d-inline-block">
                      <div className="position-absolute top-100 start-100 translate-middle">
                        <label
                          htmlFor="technicianProfile"
                          className="mb-0"
                          title="Select Image"
                        >
                          <div className="avatar-xs">
                            <div className="avatar-title bg-light border rounded-circle text-muted cursor-pointer">
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
                          className="form-control d-none"
                          id="technicianProfile"
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="avatar-lg">
                        <div className="avatar-title bg-light rounded">
                          {previewProfile ? (
                            <img
                              src={previewProfile}
                              alt="Profile Preview"
                              height={"100px"}
                              width={"100px"}
                              className="rounded"
                            />
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Description */}
                <Col lg={12} className="mt-3">
                  <Label className="form-label fw-bold">
                    Address Description
                  </Label>
                  <div className="border rounded-3 p-2">
                    <CKEditor
                      editor={ClassicEditor}
                      data={userData.user_address_description}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setUserData((prev) => ({
                          ...prev,
                          user_address_description: data,
                        }));
                      }}
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit" innerRef={submitButtonRef}>
              Save
            </Button>
            <Button color="danger" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <ToastContainer closeButton={false} limit={1} autoClose={800} />
    </>
  );
};

export default CustomerAdd;
