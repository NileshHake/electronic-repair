import React, { useEffect, useState, useRef } from "react";
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
import { ToastContainer, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../config";
import { resetUpdateUserResponse, updateUser } from "../../store/User";
import Select from "react-select";
import { getRole } from "../../store/Role";

const TechnicianUpdate = ({ isOpen, toggle, technicianDataToEdit }) => {
  

  const dispatch = useDispatch();
  const { updateUserResponse } = useSelector((state) => state.UserReducer);
  const submitButtonRef = useRef();

  const [userData, setUserData] = useState({
    user_id: "",
    user_name: "",
    user_email: "",
    user_password: "",
    user_phone_number: "",
    user_profile: null,
    user_type: 4, // ✅ Technician
    user_role_id: "",
  });

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
  const [profilePreview, setProfilePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // ✅ Pre-fill technician data
  useEffect(() => {
    if (technicianDataToEdit) {
      setUserData({
        user_id: technicianDataToEdit.user_id || "",
        user_name: technicianDataToEdit.user_name || "",
        user_email: technicianDataToEdit.user_email || "",
        user_password: technicianDataToEdit.user_password  || "",
        user_phone_number: technicianDataToEdit.user_phone_number || "",
        user_profile: null,
        user_type: 4,
        user_role_id: technicianDataToEdit.user_role_id || "",
      });

      if (technicianDataToEdit?.user_profile) {
        const imageUrl = technicianDataToEdit.user_profile.startsWith("http")
          ? technicianDataToEdit.user_profile
          : `${api.IMG_URL}user_profile/${technicianDataToEdit.user_profile}`;
        setProfilePreview(imageUrl);
      } else {
        setProfilePreview(null);
      }
    }
  }, [technicianDataToEdit]);

  // ✅ Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Role change handler
  const handleRoleChange = (selectedOption) => {
    setUserData((prev) => ({
      ...prev,
      user_role_id: selectedOption ? selectedOption.value : "",
    }));
  };

  // ✅ Profile image upload
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
    if (!userData.user_name.trim()) newErrors.user_name = "Name is required";
    if (!userData.user_email.trim()) newErrors.user_email = "Email is required";
    if (!userData.user_phone_number.trim())
      newErrors.user_phone_number = "Phone number is required";
    if (!userData.user_role_id)
      newErrors.user_role_id = "Role selection is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit form
  const handleUpdateTechnician = () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userData.user_id);
    formData.append("user_name", userData.user_name);
    formData.append("user_email", userData.user_email);
    formData.append("user_phone_number", userData.user_phone_number);
    formData.append("user_type", 4);
    formData.append("user_role_id", userData.user_role_id);

    if (userData.user_password.trim()) {
      formData.append("user_password", userData.user_password);
    }
    if (userData.user_profile) {
      formData.append("user_profile", userData.user_profile);
    }

    dispatch(updateUser(formData));
  };

  // ✅ Reset form on success
  useEffect(() => {
    if (updateUserResponse) {
      toast.success("Technician updated successfully!");
      toggle();
      setUserData({
        user_id: "",
        user_name: "",
        user_email: "",
        user_password: "",
        user_phone_number: "",
        user_profile: null,
        user_type: 4,
        user_role_id: "",
      });
      setProfilePreview(null);
      dispatch(resetUpdateUserResponse());
    }
  }, [updateUserResponse, dispatch, toggle]);

  return (
    <>
      <Modal id="showModal" size="lg" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle} className="bg-light">
          <h4>Update Technician</h4>
        </ModalHeader>

        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            <Row className="gy-3">
              <Col lg={6}>
                <Label className="form-label fw-bold">Name</Label>
                <Input
                  name="user_name"
                  type="text"
                  value={userData.user_name}
                  onChange={handleInputChange}
                  invalid={!!errors.user_name}
                />
                {errors.user_name && (
                  <div className="text-danger">{errors.user_name}</div>
                )}
              </Col>

              <Col lg={6}>
                <Label className="form-label fw-bold">Email</Label>
                <Input
                  name="user_email"
                  type="email"
                  value={userData.user_email}
                  onChange={handleInputChange}
                  invalid={!!errors.user_email}
                />
                {errors.user_email && (
                  <div className="text-danger">{errors.user_email}</div>
                )}
              </Col>

              <Col lg={6}>
                <Label className="form-label fw-bold">Password</Label>
                <Input
                  name="user_password"
                  type="password"
                  value={userData.user_password}
                  placeholder="Leave blank to keep old password"
                  onChange={handleInputChange}
                />
              </Col>

              <Col lg={6}>
                <Label className="form-label fw-bold">Phone</Label>
                <Input
                  name="user_phone_number"
                  type="text"
                  value={userData.user_phone_number}
                  onChange={handleInputChange}
                  invalid={!!errors.user_phone_number}
                />
                {errors.user_phone_number && (
                  <div className="text-danger">{errors.user_phone_number}</div>
                )}
              </Col>

              {/* ✅ Role Field */}
              <Col lg={6}>
                <Label className="form-label fw-bold">Role</Label>
                <Select
                  name="user_role_id"
                  placeholder="Select Role"
                  value={roleOptions.find(
                    (role) => role.value === userData.user_role_id
                  )}
                  onChange={handleRoleChange}
                  options={roleOptions}
                  classNamePrefix="select"
                />
                {errors.user_role_id && (
                  <div className="text-danger">{errors.user_role_id}</div>
                )}
              </Col>

              <Col lg={6}>
                <Label className="form-label fw-bold">Profile</Label>
                <div className="text-center">
                  <input
                    id="userProfile"
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleProfileChange}
                  />
                  <label htmlFor="userProfile" style={{ cursor: "pointer" }}>
                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt="Preview"
                        height="100"
                        width="100"
                        style={{ borderRadius: "10px" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100px",
                          height: "100px",
                          border: "1px dashed gray",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "10px",
                        }}
                      >
                        Upload
                      </div>
                    )}
                  </label>
                </div>
              </Col>
            </Row>
          </Card>
        </ModalBody>

        <ModalFooter>
          <Button color="primary" onClick={handleUpdateTechnician}>
            Update Technician
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

export default TechnicianUpdate;
