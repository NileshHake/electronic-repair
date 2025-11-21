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
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  addTechnician,
  resetAddTechnicianResponse,
} from "../../store/Technician";
import { getRole } from "../../store/Role";

const TechnicianAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const { addTechnicianResponse } = useSelector(
    (state) => state.TechnicianReducer
  );

  // 🔹 Form data
  const [technicianData, setTechnicianData] = useState({
    user_name: "",
    user_email: "",
    user_password: "",
    user_phone_number: "",
    user_role_id: null,
    user_type: 4, // Fixed for technicians
    user_profile: null,
  });

  // 🔹 Local states
  const [errors, setErrors] = useState({});
  const [previewProfile, setPreviewProfile] = useState(null);
  const submitButtonRef = useRef();
  const {
    roles = [],
    loading = false,
    addRoleResponse = false,
    updateRoleResponse = false,
  } = useSelector((state) => state.roleReducer || {});
  useEffect(() => {
    dispatch(getRole());
  }, [dispatch]);
  // 🔹 Role options
  const roleOptions = roles.map((role) => ({
    label: role.role_name,
    value: role.role_id,
  }));
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTechnicianData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // 🔹 Role change
  const handleRoleChange = (selectedOption) => {
    setTechnicianData((prev) => ({
      ...prev,
      user_role_id: selectedOption ? selectedOption.value : null,
    }));
  };

  // 🔹 Profile change
  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTechnicianData({ ...technicianData, user_profile: file });
      setPreviewProfile(URL.createObjectURL(file));
    }
  };

  // 🔹 Validation
  const validateForm = () => {
    const newErrors = {};
    if (!technicianData.user_name.trim())
      newErrors.user_name = "Name is required";
    if (!technicianData.user_email.trim())
      newErrors.user_email = "Email is required";
    if (!technicianData.user_password.trim())
      newErrors.user_password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔹 Submit
  const handleAddTechnician = () => {
    if (!validateForm()) return;
    dispatch(addTechnician(technicianData));
  };

  // 🔹 On success
  useEffect(() => {
    if (addTechnicianResponse) {
      toggle();
      setTechnicianData({
        user_name: "",
        user_email: "",
        user_password: "",
        user_phone_number: "",
        user_role_id: null,
        user_profile: null,
        user_type: 4,
      });
      setPreviewProfile(null);
      dispatch(resetAddTechnicianResponse());
    }
  }, [addTechnicianResponse, dispatch, toggle]);

  // 🔹 Keyboard shortcuts
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
      <Modal id="showModal" size="lg" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle} className="bg-light">
          <h4>Create Technician</h4>
        </ModalHeader>

        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            <Row className="gy-3">
              {/* Name */}
              <Col lg={6}>
                <Label className="form-label fw-bold d-flex justify-content-between">
                  <div>
                    Technician Name <span className="text-danger">*</span>
                  </div>
                  <div className="text-danger">{errors.user_name}</div>
                </Label>
                <Input
                  name="user_name"
                  placeholder="Enter full name"
                  type="text"
                  value={technicianData.user_name}
                  onChange={handleInputChange}
                />
              </Col>

              {/* Email */}
              <Col lg={6}>
                <Label className="form-label fw-bold d-flex justify-content-between">
                  <div>
                    Email <span className="text-danger">*</span>
                  </div>
                  <div className="text-danger">{errors.user_email}</div>
                </Label>
                <Input
                  name="user_email"
                  placeholder="Enter email"
                  type="email"
                  value={technicianData.user_email}
                  onChange={handleInputChange}
                />
              </Col>

              {/* Password */}
              <Col lg={6}>
                <Label className="form-label fw-bold d-flex justify-content-between">
                  <div>
                    Password <span className="text-danger">*</span>
                  </div>
                  <div className="text-danger">{errors.user_password}</div>
                </Label>
                <Input
                  name="user_password"
                  placeholder="Enter password"
                  type="password"
                  value={technicianData.user_password}
                  onChange={handleInputChange}
                />
              </Col>

              {/* Phone */}
              <Col lg={6}>
                <Label className="form-label fw-bold">Phone Number</Label>
                <Input
                  name="user_phone_number"
                  placeholder="Enter phone number"
                  type="text"
                  value={technicianData.user_phone_number}
                  onChange={handleInputChange}
                />
              </Col>

              {/* Role */}
              <Col lg={6}>
                <Label className="form-label fw-bold">Role</Label>
                <Select
                  name="user_role_id"
                  placeholder="Select Role"
                  value={roleOptions.find(
                    (role) => role.value === technicianData.user_role_id
                  )}
                  onChange={handleRoleChange}
                  options={roleOptions}
                  classNamePrefix="select"
                />
              </Col>

              {/* Profile */}
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
            </Row>
          </Card>
        </ModalBody>

        <ModalFooter>
          <Button
            ref={submitButtonRef}
            color="primary"
            onClick={handleAddTechnician}
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

export default TechnicianAdd;
