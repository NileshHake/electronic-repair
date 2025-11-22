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
import { resetUpdateDeliveryBoyResponse, updateDeliveryBoy } from "../../store/DeliveryAndPickUpBoy";
import { getRole } from "../../store/Role";

const DeliveryBoyUpdate = ({ isOpen, toggle, deliveryBoyDataToEdit }) => {
  const dispatch = useDispatch();
  const { updateDeliveryBoyResponse } = useSelector((state) => state.DeliveryBoyReducer);
  const submitButtonRef = useRef();

  const [deliveryBoyData, setDeliveryBoyData] = useState({
    user_id: "",
    user_name: "",
    user_email: "",
    user_password: "",
    user_phone_number: "",
    user_role_id: null,
    user_profile: null,
    user_type: 5, // Fixed for Delivery/Pickup Boys
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
    if (deliveryBoyDataToEdit) {
      setDeliveryBoyData({
        user_id: deliveryBoyDataToEdit.user_id || "",
        user_name: deliveryBoyDataToEdit.user_name || "",
        user_email: deliveryBoyDataToEdit.user_email || "",
        user_password: deliveryBoyDataToEdit.user_password || "",
        user_phone_number: deliveryBoyDataToEdit.user_phone_number || "",
        user_role_id: deliveryBoyDataToEdit.user_role_id || null,
        user_profile: null,
        user_type: 5,
      });

      if (deliveryBoyDataToEdit?.user_profile) {
        const imageUrl = deliveryBoyDataToEdit.user_profile.startsWith("http")
          ? deliveryBoyDataToEdit.user_profile
          : `${api.IMG_URL}user_profile/${deliveryBoyDataToEdit.user_profile}`;
        setProfilePreview(imageUrl);
      } else {
        setProfilePreview(null);
      }
    }
  }, [deliveryBoyDataToEdit]);

  // ✅ Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryBoyData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Role dropdown
  const handleRoleChange = (selectedOption) => {
    setDeliveryBoyData((prev) => ({
      ...prev,
      user_role_id: selectedOption ? selectedOption.value : null,
    }));
  };

  // ✅ Profile upload
  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDeliveryBoyData((prev) => ({ ...prev, user_profile: file }));
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};
    if (!deliveryBoyData.user_name.trim()) newErrors.user_name = "Name is required";
    if (!deliveryBoyData.user_email.trim()) newErrors.user_email = "Email is required";
    if (!deliveryBoyData.user_password.trim())
      newErrors.user_password = "Password is required";
    if (!deliveryBoyData.user_role_id) newErrors.user_role_id = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit form
  const handleUpdateDeliveryBoy = () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", deliveryBoyData.user_id);
    formData.append("user_name", deliveryBoyData.user_name);
    formData.append("user_email", deliveryBoyData.user_email);
    formData.append("user_password", deliveryBoyData.user_password);
    formData.append("user_phone_number", deliveryBoyData.user_phone_number);
    formData.append("user_role_id", deliveryBoyData.user_role_id);
    formData.append("user_type", 5);
    if (deliveryBoyData.user_profile) {
      formData.append("user_profile", deliveryBoyData.user_profile);
    }

    dispatch(updateDeliveryBoy(formData));
  };

  // ✅ Reset form on success
  useEffect(() => {
    if (updateDeliveryBoyResponse) {
      toast.success("Delivery Boy updated successfully!");
      toggle();
      setDeliveryBoyData({
        user_id: "",
        user_name: "",
        user_email: "",
        user_password: "",
        user_phone_number: "",
        user_role_id: null,
        user_profile: null,
        user_type: 5,
      });
      setProfilePreview(null);
      dispatch(resetUpdateDeliveryBoyResponse());
    }
  }, [updateDeliveryBoyResponse, dispatch, toggle]);

  return (
    <>
      <Modal id="showModal" size="lg" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle} className="bg-light">
          <h4>Update Delivery / Pickup Boy</h4>
        </ModalHeader>

        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            <Row className="gy-3">
              <Col lg={6}>
                <Label className="form-label fw-bold">Name</Label>
                <Input
                  name="user_name"
                  type="text"
                  value={deliveryBoyData.user_name}
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
                  value={deliveryBoyData.user_email}
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
                  value={deliveryBoyData.user_password}
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
                  value={deliveryBoyData.user_phone_number}
                  onChange={handleInputChange}
                />
              </Col>

              <Col lg={6}>
                <Label className="form-label fw-bold">Role</Label>
                <Select
                  name="user_role_id"
                  placeholder="Select Role"
                  value={roleOptions.find(
                    (r) => r.value === deliveryBoyData.user_role_id
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
                    id="deliveryBoyProfile"
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleProfileChange}
                  />
                  <label htmlFor="deliveryBoyProfile" style={{ cursor: "pointer" }}>
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
          <Button color="primary" onClick={handleUpdateDeliveryBoy}>
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

export default DeliveryBoyUpdate;
