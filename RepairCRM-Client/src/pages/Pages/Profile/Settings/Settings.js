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
  updateUser,
} from "../../../../store/User";
import { api } from "../../../../config";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("1");
  const { user } = AuthUser();
  const dispatch = useDispatch();

  const { singleUser, updateUserResponse, loading } = useSelector(
    (state) => state.UserReducer
  );

  const [formData, setFormData] = useState({
    user_id: "",
    user_name: "",
    user_email: "",
    user_phone_number: "",
    user_password: "",
    user_role_id: "",
    user_type: "",
    user_profile: "",
  });
  useEffect(() => {
    if (updateUserResponse) {
      dispatch(getSingleUser(user.user_id));
      dispatch(resetUpdateUserResponse());
    }
  }, [updateUserResponse]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (user?.user_id) {
       dispatch(getSingleUser(user.user_id));
    }
  }, [user?.user_id]);

  useEffect(() => {
    if (singleUser) {
      setFormData({
        user_id: singleUser.user_id || "",
        user_name: singleUser.user_name || "",
        user_email: singleUser.user_email || "",
        user_password: singleUser.user_password || "",
        user_phone_number: singleUser.user_phone_number || "",
        user_role_id: singleUser.user_role_id || "",
        user_type: singleUser.user_type || "",
        user_profile: singleUser.user_profile || "",
      });
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

                    {/* <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "2" })}
                        onClick={() => tabChange("2")}
                        type="button"
                      >
                        <i className="far fa-user"></i> Change Password
                      </NavLink>
                    </NavItem> */}
                  </Nav>
                </CardHeader>

                <CardBody className="p-4">
                  <TabContent activeTab={activeTab}>
                    {/* Personal Details Tab */}
                    <TabPane tabId="1">
                      <Form onSubmit={handleUpdate}>
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
                      </Form>
                    </TabPane>
 
                    <TabPane tabId="2">
                      <p className="text-muted">
                        Change Password section here.
                      </p>
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Settings;
