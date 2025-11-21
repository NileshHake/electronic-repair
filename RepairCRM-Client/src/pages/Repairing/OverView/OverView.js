import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Pagination,
  PaginationItem,
  PaginationLink,
  Progress,
  Row,
  TabContent,
  Table,
  TabPane,
  UncontrolledCollapse,
  UncontrolledDropdown,
} from "reactstrap";
import classnames from "classnames";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Autoplay } from "swiper";

//Images
import profileBg from "../../../assets/images/profile-bg.jpg";
import avatar1 from "../../../assets/images/users/avatar-1.jpg";
import avatar2 from "../../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../../assets/images/users/avatar-4.jpg";
import avatar5 from "../../../assets/images/users/avatar-5.jpg";
import avatar6 from "../../../assets/images/users/avatar-6.jpg";
import avatar7 from "../../../assets/images/users/avatar-7.jpg";
import avatar8 from "../../../assets/images/users/avatar-8.jpg";

import smallImage2 from "../../../assets/images/small/img-2.jpg";
import smallImage3 from "../../../assets/images/small/img-3.jpg";
import smallImage4 from "../../../assets/images/small/img-4.jpg";
import smallImage5 from "../../../assets/images/small/img-5.jpg";
import smallImage6 from "../../../assets/images/small/img-6.jpg";
import smallImage7 from "../../../assets/images/small/img-7.jpg";
import smallImage9 from "../../../assets/images/small/img-9.jpg";

import { projects, document } from "../../../common/data";
import { useDispatch, useSelector } from "react-redux";
import { getSingleRepair } from "../../../store/Repairing";
import { formatDateTime } from "../../../helpers/date_and_time_format";
import { getServicesList } from "../../../store/Service";
import RecentStatus from "./RecentStatus";
import RepairDetailsLayout from "./RepairDetailsLayout";
import { api } from "../../../config";

const OverView = () => {
  SwiperCore.use([Autoplay]);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("1");
  const [activityTab, setActivityTab] = useState("1");

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const toggleActivityTab = (tab) => {
    if (activityTab !== tab) {
      setActivityTab(tab);
    }
  };
  const { repair_id } = useParams();
  useEffect(() => {
    if (repair_id) {
      dispatch(getSingleRepair(repair_id));
      dispatch(getServicesList());
    }
  }, [dispatch, repair_id]);
  document.title = "Repairing | Over View";
  const { services } = useSelector((state) => state.ServiceReducer);
  const { singleRepair } = useSelector((state) => state.RepairReducer) || {};

  const [selectedFiles, setSelectedFiles] = useState([]);
  useEffect(() => {
    if (singleRepair?.repair_image) {
      let existingImages = [];
      try {
        existingImages = JSON.parse(singleRepair.repair_image);
      } catch {
        existingImages = [];
      }

      const existingPreviews = existingImages.map((imgName) => ({
        name: imgName,
        preview: `${api.IMG_URL}repair_images/${imgName}`,
        isExisting: true,
      }));

      setSelectedFiles(existingPreviews);
    }
  }, [singleRepair]);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="profile-foreground position-relative mx-n4 mt-n4">
            <div className="profile-wid-bg">
              <img src={profileBg} alt="" className="profile-wid-img" />
            </div>
          </div>
          <div className="pt-4 mb-4 mb-lg-3 pb-lg-4 profile-wrapper">
            <Row className="g-4">
              <div className="col-auto">
                <div className="avatar-lg">
                  <img
                    src={avatar1}
                    alt="user-img"
                    className="img-thumbnail rounded-circle"
                  />
                </div>
              </div>

              <Col>
                <div className="p-2">
                  <h3 className="text-white mb-1">
                    {" "}
                    {singleRepair?.customer_name || ""}
                  </h3>
                  <p className="text-white text-opacity-75">Customer</p>
                  <div className="hstack text-white-50 gap-1">
                    <div className="me-2">
                      <i className="ri-map-pin-user-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
                      {singleRepair?.customer_address_state}
                    </div>
                    <div>
                      <i className="ri-building-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
                      {singleRepair?.customer_address_city}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          <Row>
            <Col lg={12}>
              <div>
                <div className="d-flex profile-wrapper">
                  <Nav
                    pills
                    className="animation-nav profile-nav gap-2 gap-lg-3 mb-4"
                  >
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "1" })}
                        onClick={() => toggleTab("1")}
                      >
                        Overview
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "2" })}
                        onClick={() => toggleTab("2")}
                      >
                        Gallery
                      </NavLink>
                    </NavItem>
                  </Nav>
                </div>

                <TabContent activeTab={activeTab} className="pt-4">
                  <TabPane tabId="1">
                    <RepairDetailsLayout
                      singleRepair={singleRepair}
                      services={services}
                      activityTab={activityTab}
                    />
                  </TabPane>
                  <TabPane tabId="2">
                    <Row className="g-3">
                      {selectedFiles.length > 0 ? (
                        selectedFiles.map((file, idx) => (
                          <Col key={idx} xs="6" sm="4" md="3" lg="2">
                            <Card className="shadow-sm border-0 h-100">
                              <img
                                src={file.preview}
                                alt={file.name}
                                className="img-fluid rounded-top"
                                style={{ height: "150px", objectFit: "cover" }}
                              />
                              <div className="p-2 text-center">
                                <p
                                  className="mb-0 fw-semibold text-truncate"
                                  title={file.name}
                                >
                                  {file.name}
                                </p>
                              </div>
                            </Card>
                          </Col>
                        ))
                      ) : (
                        <Col>
                          <p className="text-muted">No images available.</p>
                        </Col>
                      )}
                    </Row>
                  </TabPane>
                </TabContent>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default OverView;
