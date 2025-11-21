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
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../config";
import { resetUpdateUserResponse, updateUser } from "../../store/User";
import { getRole } from "../../store/Role";

const UserUpdate = ({ isOpen, toggle, userDataToEdit }) => {
  const dispatch = useDispatch();
  const { updateUserResponse } = useSelector((state) => state.UserReducer);
  const submitButtonRef = useRef();

  const [userData, setUserData] = useState({
    user_id: "",
    user_name: "",
    user_email: "",
    user_password: "",
    user_phone_number: "",
    user_role_id: null,
    user_profile: null,
  });

  const [profilePreview, setProfilePreview] = useState(null);
  const [errors, setErrors] = useState({});

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
  useEffect(() => {
    if (userDataToEdit) {
      setUserData({
        user_id: userDataToEdit.user_id || "",
        user_name: userDataToEdit.user_name || "",
        user_email: userDataToEdit.user_email || "",
        user_password: userDataToEdit.user_password || "",
        user_phone_number: userDataToEdit.user_phone_number || "",
        user_role_id: userDataToEdit.user_role_id || null,
        user_profile: null,
      });

      if (userDataToEdit?.user_profile) {
        const imageUrl = userDataToEdit.user_profile.startsWith("http")
          ? userDataToEdit.user_profile
          : `${api.IMG_URL}user_profile/${userDataToEdit.user_profile}`;
        setProfilePreview(imageUrl);
      } else {
        setProfilePreview(null);
      }
    }
  }, [userDataToEdit]);

  // ✅ Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Role dropdown
  const handleRoleChange = (selectedOption) => {
    setUserData((prev) => ({
      ...prev,
      user_role_id: selectedOption ? selectedOption.value : null,
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
    if (!userData.user_password.trim())
      newErrors.user_password = "Password is required";
    if (!userData.user_role_id) newErrors.user_role_id = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit form (convert to FormData)
  const handleUpdateUser = () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userData.user_id);
    formData.append("user_name", userData.user_name);
    formData.append("user_email", userData.user_email);
    formData.append("user_password", userData.user_password);
    formData.append("user_phone_number", userData.user_phone_number);
    formData.append("user_role_id", userData.user_role_id);
    if (userData.user_profile) {
      formData.append("user_profile", userData.user_profile);
    }

    dispatch(updateUser(formData));
  };

  // ✅ Reset form on success
  useEffect(() => {
    if (updateUserResponse) {
      toast.success("User updated successfully!");
      toggle();
      setUserData({
        user_id: "",
        user_name: "",
        user_email: "",
        user_password: "",
        user_phone_number: "",
        user_role_id: null,
        user_profile: null,
      });
      setProfilePreview(null);
      dispatch(resetUpdateUserResponse());
    }
  }, [updateUserResponse, dispatch, toggle]);

  return (
    <>
      <Modal id="showModal" size="lg" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle} className="bg-light">
          <h4>Update User</h4>
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
                  onChange={handleInputChange}
                  invalid={!!errors.user_password}
                />
                {errors.user_password && (
                  <div className="text-danger">{errors.user_password}</div>
                )}
              </Col>

              <Col lg={6}>
                <Label className="form-label fw-bold">Phone</Label>
                <Input
                  name="user_phone_number"
                  type="text"
                  value={userData.user_phone_number}
                  onChange={handleInputChange}
                />
              </Col>

              <Col lg={6}>
                <Label className="form-label fw-bold">Role</Label>
                <Select
                  name="user_role_id"
                  placeholder="Select Role"
                  value={roleOptions.find(
                    (r) => r.value === userData.user_role_id
                  )}
                  onChange={handleRoleChange}
                  options={roleOptions}
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
          <Button color="primary" onClick={handleUpdateUser}>
            Update
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

export default UserUpdate;
