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

import { updateCustomer } from "../../store/Customer";
import { api } from "../../config";

const CustomerUpdate = ({ isOpen, toggle, customerDataToEdit }) => {
  const dispatch = useDispatch();
  const submitButtonRef = useRef(); 

  // ✅ Local state (safe defaults)
  const [userData, setUserData] = useState({
    user_name: "",
    user_email: "",
    user_password: "",
    user_phone_number: "",
    user_role_id: 3,
    user_address_pincode: "",
    user_address_city: "",
    user_address_block: "",
    user_address_district: "",
    user_address_state: "",
    user_address_description: "",
    user_profile: null,
  });

  const [errors, setErrors] = useState({});
  const [profilePreview, setProfilePreview] = useState(null);

  // ✅ Pre-fill when modal opens
  useEffect(() => {
    if (isOpen && customerDataToEdit) {
      setUserData((prev) => ({
        ...prev,
        user_name: customerDataToEdit?.user_name || "",
        user_email: customerDataToEdit?.user_email || "",
        user_password: customerDataToEdit?.user_password || "", // blank on edit
        user_phone_number: customerDataToEdit?.user_phone_number || "",
        user_role_id: customerDataToEdit?.user_role_id || 3,
        user_address_pincode: customerDataToEdit?.user_address_pincode || "",
        user_address_city: customerDataToEdit?.user_address_city || "",
        user_address_block: customerDataToEdit?.user_address_block || "",
        user_address_district: customerDataToEdit?.user_address_district || "",
        user_address_state: customerDataToEdit?.user_address_state || "",
        user_address_description:
          customerDataToEdit?.user_address_description || "",
        user_profile: null, // file nahi bhej rahe initial me
      }));

      // ✅ Existing profile image path set
      if (customerDataToEdit?.user_profile) {
        const imageUrl = customerDataToEdit?.user_profile.startsWith("http")
          ? customerDataToEdit?.user_profile
          : `${api.IMG_URL}user_profile/${customerDataToEdit?.user_profile}`;
        setProfilePreview(imageUrl);
      } else {
        setProfilePreview(null);
      }
    }

    // ✅ har baar open pe error reset
    setErrors({});
  }, [isOpen, customerDataToEdit]);

  // ✅ Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Handle profile change
  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData((prev) => ({ ...prev, user_profile: file }));
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};
    if (!userData.user_name) newErrors.user_name = "Name is required";
    if (!userData.user_phone_number)
      newErrors.user_phone_number = "Phone Number is required";
    if (!userData.user_email) newErrors.user_email = "Email is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit update 
  const handleSubmit = () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("user_id", customerDataToEdit.user_id); // important: id bhejna
    formData.append("user_name", userData.user_name);
    formData.append("user_email", userData.user_email);
    formData.append("user_phone_number", userData.user_phone_number);
    formData.append("user_role_id", userData.user_role_id || 3);
    formData.append(
      "user_address_pincode",
      userData.user_address_pincode || ""
    );
    formData.append("user_address_city", userData.user_address_city || "");
    formData.append("user_address_block", userData.user_address_block || "");
    formData.append(
      "user_address_district",
      userData.user_address_district || ""
    );
    formData.append("user_address_state", userData.user_address_state || "");
    formData.append(
      "user_address_description",
      userData.user_address_description || ""
    );

    // Password only if user entered something
    if (userData.user_password && userData.user_password.trim() !== "") {
      formData.append("user_password", userData.user_password);
    }

    // New file only if selected
    if (userData.user_profile) {
      formData.append("user_profile", userData.user_profile);
    }

    dispatch(updateCustomer(formData));
    toast.success("User updated successfully!");
    toggle();
  };

  // ✅ Keyboard shortcuts
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
          Update Customer
        </ModalHeader>

        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            <Row className="gy-3">
              {/* Name */}
              <Col lg={4}>
                <Label className="form-label fw-bold d-flex justify-content-between">
                  <span>
                    Name <span className="text-danger"> *</span>
                  </span>
                </Label>
                <Input
                  name="user_name"
                  type="text"
                  value={userData.user_name}
                  onChange={handleInputChange}
                  placeholder="Enter Name"
                />
                <span className="text-danger">{errors.user_name}</span>
              </Col>

              {/* Phone */}
              <Col lg={4}>
                <Label className="form-label fw-bold">
                  Phone Number<span className="text-danger"> *</span>
                </Label>
                <Input
                  name="user_phone_number"
                  type="text"
                  value={userData.user_phone_number}
                  onChange={handleInputChange}
                  maxLength={10}
                  placeholder="Enter Phone Number"
                />
                <span className="text-danger">
                  {errors.user_phone_number}
                </span>
              </Col>

              {/* Email */}
              <Col lg={4}>
                <Label className="form-label fw-bold">
                  Email<span className="text-danger"> *</span>
                </Label>
                <Input
                  name="user_email"
                  type="email"
                  placeholder="Enter Email Address"
                  value={userData.user_email}
                  onChange={handleInputChange}
                />
                <span className="text-danger">{errors.user_email}</span>
              </Col>

              {/* Password (optional) */}
              <Col lg={4}>
                <Label className="form-label fw-bold">Password</Label>
                <Input
                  name="user_password"
                  type="password"
                  placeholder="Enter new password (optional)"
                  value={userData.user_password}
                  onChange={handleInputChange}
                />
                <span className="text-danger">{errors.user_password}</span>
              </Col>

              {/* Pincode */}
              <Col lg={4}>
                <Label className="form-label fw-bold">Pincode</Label>
                <Input
                  name="user_address_pincode"
                  type="text"
                  value={userData.user_address_pincode}
                  onChange={handleInputChange}
                  maxLength={6}
                  placeholder="Enter Pincode"
                />
              </Col>

              {/* City */}
              <Col lg={4}>
                <Label className="form-label fw-bold">City</Label>
                <Input
                  name="user_address_city"
                  type="text"
                  value={userData.user_address_city}
                  onChange={handleInputChange}
                  placeholder="Enter City"
                />
              </Col>

              {/* State */}
              <Col lg={4}>
                <Label className="form-label fw-bold">State</Label>
                <Input
                  name="user_address_state"
                  type="text"
                  value={userData.user_address_state}
                  onChange={handleInputChange}
                  placeholder="Enter State"
                />
              </Col>

              {/* District */}
              <Col lg={4}>
                <Label className="form-label fw-bold">District</Label>
                <Input
                  name="user_address_district"
                  type="text"
                  value={userData.user_address_district}
                  onChange={handleInputChange}
                  placeholder="Enter District"
                />
              </Col>

              {/* Block */}
              <Col lg={4}>
                <Label className="form-label fw-bold">Block</Label>
                <Input
                  name="user_address_block"
                  type="text"
                  value={userData.user_address_block}
                  onChange={handleInputChange}
                  placeholder="Enter Block"
                />
              </Col>

              {/* Profile Photo */}
              <Col lg={6} className="mt-3">
                <h5 className="fs-15 mb-1">Profile Photo</h5>
                <div className="text-center">
                  <div className="position-relative d-inline-block">
                    <div className="position-absolute top-100 start-100 translate-middle">
                      <label
                        htmlFor="userProfile"
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
                        id="userProfile"
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="avatar-lg">
                      <div className="avatar-title bg-light rounded">
                        {profilePreview ? (
                          <img
                            src={profilePreview}
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

              {/* Address Description */}
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
          <Button
            color="primary"
            ref={submitButtonRef}
            onClick={handleSubmit}
            style={{ minWidth: "120px" }}
          >
            Update
          </Button>
          <Button color="danger" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <ToastContainer closeButton={false} limit={1} autoClose={800} />
    </>
  );
};

export default CustomerUpdate;
