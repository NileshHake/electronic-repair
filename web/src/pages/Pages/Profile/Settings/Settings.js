import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import progileBg from "../../../../assets/images/profile-bg.jpg";
import avatar1 from "../../../../assets/images/users/avatar-1.jpg";
import AuthUser from "../../../../helpers/AuthType/AuthUser";
import { useDispatch, useSelector } from "react-redux";
import {
  getSingleUser,
  resetUpdateUserResponse,
  updatePassword,
  updateUser,
} from "../../../../store/User";
import { api } from "../../../../config";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("1");
  const { user } = AuthUser();
  const dispatch = useDispatch();

  const { singleUser, updateUserResponse, loading } = useSelector(
    (state) => state.UserReducer
  );
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [formData, setFormData] = useState({
    user_id: "",
    user_name: "",
    user_email: "",
    user_phone_number: "",
    user_password: "",
    user_role_id: "",
    user_type: "",
    user_profile: "",

    // address 👇
    user_address_state: "",
    user_address_district: "",
    user_address_block: "",
    user_address_city: "",
    user_address_pincode: "",
    user_address_description: "",

    // Bank Fields 👇
    user_ifsc_code: "",
    user_bank_name: "",
    user_branch_name: "",
    user_bank_code: "",
    user_bank_contact: "",
    user_bank_account_number: "",
    user_branch_name: "",
    user_upi_id: "",
    user_bank_address: "",
    user_terms_and_conditions: "",
  });
    const navigate = useNavigate  ();
  useEffect(() => {
    if (updateUserResponse) {
      dispatch(getSingleUser(user.user_id));

      dispatch(resetUpdateUserResponse());
      navigate("/dashboard")
      window.location.reload();
    }
  }, [updateUserResponse]);
  useEffect(() => {
    if (formData.user_ifsc_code?.length === 11) {
      fetch(`https://ifsc.razorpay.com/${formData.user_ifsc_code}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData((prev) => ({
            ...prev,
            user_bank_name: data.BANK || "",
            user_branch_name: data.BRANCH || "",
            user_bank_code: data?.IFSC ? data.IFSC.slice(-6) : "",
            user_bank_contact: data.CONTACT || "",
            user_bank_address: data.ADDRESS || "",
          }));
        })
        .catch((err) => console.error("Error fetching IFSC details:", err));
    } else {
      setFormData((prev) => ({
        ...prev,
        user_bank_name: "",
        user_branch_name: "",
        user_bank_code: "",
        user_bank_contact: "",
        user_bank_address: "",
      }));
    }
  }, [formData.user_ifsc_code, setFormData]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (user?.user_id) {
      dispatch(getSingleUser(user.user_id));
    }
  }, [user?.user_id]);

  useEffect(() => {
    if (singleUser) {
      setFormData(singleUser);
    }
  }, [singleUser]);

  const tabChange = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    const updateData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      updateData.append(key, value);
    });

    if (imageFile) {
      updateData.append("user_profile", imageFile);
    }

    dispatch(updateUser(updateData)); // redux action
  };
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New password and confirm password do not match");

      return;
    }



    dispatch(updatePassword({
      user_id: user.user_id,
      old_password: passwordData.old_password,
      new_password: passwordData.new_password,
    }));

  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="position-relative mx-n4 mt-n4">
            <div className="profile-wid-bg profile-setting-img">
              <img
                src={progileBg}
                className="profile-wid-img"
                alt="Profile background"
              />
              <div className="overlay-content">
                <div className="text-end p-3">
                  <div className="p-0 ms-auto rounded-circle profile-photo-edit">
                    <Input
                      id="profile-foreground-img-file-input"
                      type="file"
                      className="profile-foreground-img-file-input"
                    />
                    <Label
                      htmlFor="profile-foreground-img-file-input"
                      className="profile-photo-edit btn btn-light"
                    >
                      <i className="ri-image-edit-line align-bottom me-1"></i>{" "}
                      Change Cover
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Row>
            {/* Left Profile Card */}
            <Col xxl={3}>
              <Card className="mt-n5">
                <CardBody className="p-4 text-center">
                  <div className="profile-user position-relative d-inline-block mx-auto mb-4">
                    <img
                      src={
                        selectedImage
                          ? selectedImage
                          : singleUser?.user_profile
                            ? `${api.IMG_URL}user_profile/${singleUser.user_profile}`
                            : avatar1
                      }
                      className="rounded-circle avatar-xl img-thumbnail user-profile-image"
                      alt="user-profile"
                    />
                    <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                      <Input
                        id="profile-img-file-input"
                        type="file"
                        className="profile-img-file-input"
                        onChange={handleImageChange}
                      />
                      <Label
                        htmlFor="profile-img-file-input"
                        className="profile-photo-edit avatar-xs"
                      >
                        <span className="avatar-title rounded-circle bg-light text-body">
                          <i className="ri-camera-fill"></i>
                        </span>
                      </Label>
                    </div>
                  </div>

                  <h5 className="fs-16 mb-1">
                    {formData.user_name || "User Name"}
                  </h5>
                  <p className="text-muted mb-0">{formData.user_email}</p>
                </CardBody>
              </Card>
            </Col>

            {/* Right Details Card */}
            <Col xxl={9}>
              <Card className="mt-xxl-n5">
                <CardHeader>
                  <Nav
                    className="nav-tabs-custom rounded card-header-tabs border-bottom-0"
                    role="tablist"
                  >
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "1" })}
                        onClick={() => tabChange("1")}
                      >
                        <i className="fas fa-home"></i> Personal Details
                      </NavLink>
                    </NavItem>

                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "2" })}
                        onClick={() => tabChange("2")}
                        type="button"
                      >
                        <i className="far fa-user"></i> Change Password
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "3" })}
                        onClick={() => tabChange("3")}
                        type="button"
                      >
                        <i className="far fa-user"></i> Address
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "4" })}
                        onClick={() => tabChange("4")}
                        type="button"
                      >
                        <i className="far fa-user"></i> Bank Details
                      </NavLink>
                    </NavItem>
                    {(user.user_type == 1 || user.user_type == 2) && (
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "5" })}
                          onClick={() => tabChange("5")}
                          type="button"
                        >
                          <i className="far fa-user"></i> Terms & Conditions
                        </NavLink>
                      </NavItem>
                    )}

                  </Nav>
                </CardHeader>

                <Form onSubmit={handleUpdate}>
                  <CardBody className="p-4">
                    <TabContent activeTab={activeTab}>
                      {/* Personal Details Tab */}
                      <TabPane tabId="1">
                        <Row>
                          <Col lg={6}>
                            <div className="mb-3">
                              <Label>Full Name</Label>
                              <Input
                                name="user_name"
                                type="text"
                                value={formData.user_name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                              />
                            </div>
                          </Col>

                          <Col lg={6}>
                            <div className="mb-3">
                              <Label>Phone Number</Label>
                              <Input
                                name="user_phone_number"
                                value={formData.user_phone_number}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                              />
                            </div>
                          </Col>

                          <Col lg={12}>
                            <div className="mb-3">
                              <Label>Email Address</Label>
                              <Input
                                type="email"
                                name="user_email"
                                value={formData.user_email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                              />
                            </div>
                          </Col>

                          <Col lg={12}>
                            <div className="hstack gap-2 justify-content-end">
                              <button type="submit" className="btn btn-primary">
                                Update
                              </button>
                              <button
                                type="button"
                                className="btn btn-soft-success"
                              >
                                Cancel
                              </button>
                            </div>
                          </Col>
                        </Row>

                      </TabPane>

                      <TabPane tabId="2">
                        <Form onSubmit={handlePasswordUpdate}>
                          <Row>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Old Password</Label>
                                <Input
                                  type="password"
                                  name="old_password"
                                  value={passwordData.old_password}
                                  onChange={handlePasswordChange}
                                  placeholder="Enter old password"
                                />
                              </div>
                            </Col>

                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>New Password</Label>
                                <Input
                                  type="password"
                                  name="new_password"
                                  value={passwordData.new_password}
                                  onChange={handlePasswordChange}
                                  placeholder="Enter new password"
                                />
                              </div>
                            </Col>

                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Confirm Password</Label>
                                <Input
                                  type="password"
                                  name="confirm_password"
                                  value={passwordData.confirm_password}
                                  onChange={handlePasswordChange}
                                  placeholder="Confirm new password"
                                />
                              </div>
                            </Col>

                            <Col lg={12}>
                              <div className="hstack gap-2 justify-content-end">
                                <button type="submit" className="btn btn-primary">
                                  Change Password
                                </button>
                                <button type="button" className="btn btn-soft-success">
                                  Cancel
                                </button>
                              </div>
                            </Col>
                          </Row>
                        </Form>
                      </TabPane>
                      <TabPane tabId="3">

                        <Row className="gy-3">

                          <Col lg={4}>
                            <Label>Pincode</Label>
                            <Input
                              name="user_address_pincode"
                              value={formData.user_address_pincode || ""}
                              onChange={handleChange}
                              placeholder="Enter Pincode"
                            />
                          </Col>

                          <Col lg={4}>
                            <Label>City / Village</Label>
                            <Input
                              name="user_address_city"
                              value={formData.user_address_city || ""}
                              onChange={handleChange}
                              placeholder="Enter City / Village"
                            />
                          </Col>

                          <Col lg={4}>
                            <Label>State</Label>
                            <Input
                              name="user_address_state"
                              value={formData.user_address_state || ""}
                              onChange={handleChange}
                              placeholder="Enter State"
                            />
                          </Col>

                          <Col lg={4}>
                            <Label>District</Label>
                            <Input
                              name="user_address_district"
                              value={formData.user_address_district || ""}
                              onChange={handleChange}
                              placeholder="Enter District"
                            />
                          </Col>

                          <Col lg={4}>
                            <Label>Block</Label>
                            <Input
                              name="user_address_block"
                              value={formData.user_address_block || ""}
                              onChange={handleChange}
                              placeholder="Enter Block"
                            />
                          </Col>




                          <Col lg={12}>
                            <Label>Address Description</Label>
                            <Input
                              name="user_address_description"
                              type="textarea"
                              rows={4}
                              value={formData.user_address_description || ""}
                              onChange={handleChange}
                              placeholder="Write your full address..."
                            />
                          </Col>
                          <Col lg={12}>
                            <div className="hstack gap-2 justify-content-end">
                              <button type="submit" className="btn btn-primary">
                                Update
                              </button>
                              <button
                                type="button"
                                className="btn btn-soft-success"
                              >
                                Cancel
                              </button>
                            </div>
                          </Col>
                        </Row>
                      </TabPane>
                      <TabPane tabId="4">

                        <Row className="gy-3 ">
                          <Col lg={4}>
                            <Label>Bank IFSC Code</Label>
                            <Input
                              name="user_ifsc_code"
                              type="text"
                              value={formData?.user_ifsc_code || ""}
                              onChange={handleChange}
                              placeholder="Enter IFSC code (e.g., HDFC0001234)"
                            />
                          </Col>

                          <Col lg={4}>
                            <Label>Bank Name</Label>
                            <Input
                              name="user_bank_name"
                              type="text"
                              value={formData?.user_bank_name || ""}
                              onChange={handleChange}
                              placeholder="Auto-filled or manually enter bank name"
                            />
                          </Col>

                          <Col lg={4}>
                            <Label>Branch Name</Label>
                            <Input
                              name="user_branch_name"
                              type="text"
                              value={formData?.user_branch_name || ""}
                              onChange={handleChange}
                              placeholder="Auto-filled or manually enter branch name"
                            />
                          </Col>

                          <Col lg={4}>
                            <Label>Bank Code</Label>
                            <Input
                              name="user_bank_code"
                              type="text"
                              value={formData?.user_bank_code || ""}
                              onChange={handleChange}
                              placeholder="Auto-filled or manually enter bank code"
                            />
                          </Col>

                          <Col lg={4}>
                            <Label>Bank Contact Number</Label>
                            <Input
                              name="user_bank_contact"
                              type="text"
                              value={formData?.user_bank_contact || ""}
                              onChange={handleChange}
                              placeholder="Auto-filled or manually enter contact number"
                            />
                          </Col>

                          <Col lg={4}>
                            <Label>Account Number</Label>
                            <Input
                              name="user_bank_account_number"
                              type="text"
                              value={formData?.user_bank_account_number || ""}
                              onChange={handleChange}
                              placeholder="Enter bank account number"
                            />
                          </Col>

                          <Col lg={4}>
                            <Label>UPI ID</Label>
                            <Input
                              name="user_upi_id"
                              type="text"
                              value={formData?.user_upi_id || ""}
                              onChange={handleChange}
                              placeholder="Enter UPI ID (e.g., name@bank)"
                            />
                          </Col>
                          <Col lg={12}>
                            <Label>Bank Address</Label>
                            <CKEditor
                              editor={ClassicEditor}
                              data={formData.user_bank_address || ""}
                              onChange={(event, editor) => {
                                const data = editor.getData();
                                setFormData((prev) => ({
                                  ...prev,
                                  user_bank_address: data,
                                }));
                              }}
                            />

                          </Col>
                          <Col lg={12}>
                            <div className="hstack gap-2 justify-content-end">
                              <button type="submit" className="btn btn-primary">
                                Update
                              </button>
                              <button
                                type="button"
                                className="btn btn-soft-success"
                              >
                                Cancel
                              </button>
                            </div>
                          </Col>
                        </Row>
                      </TabPane>
                      <TabPane tabId="5">
                        {ClassicEditor && (
                          <CKEditor
                            editor={ClassicEditor}
                            data={formData.user_terms_and_conditions || ""}
                            onChange={(event, editor) => {
                              const data = editor.getData();
                              setFormData(prev => ({
                                ...prev,
                                user_terms_and_conditions: data,
                              }));
                            }}
                          />
                        )}

                        <Col lg={12}>
                          <div className="hstack gap-2 justify-content-end">
                            <button type="submit" className="btn btn-primary">
                              Update
                            </button>
                            <button
                              type="button"
                              className="btn btn-soft-success"
                            >
                              Cancel
                            </button>
                          </div>
                        </Col>
                      </TabPane>
                    </TabContent>
                  </CardBody>
                </Form>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Settings;
