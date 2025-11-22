import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  TabContent,
  TabPane,
  UncontrolledCollapse,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSingleStageRemark } from "../../../store/StageRemarkData";
import { api } from "../../../config";
import { formatRemarkDateTime } from "../../../helpers/date_and_time_format";
import avatar2 from "../../../assets/images/users/avatar-2.jpg";
import { video } from "../../../common/data";

const RecentStatus = ({ activityTab }) => {
  const dispatch = useDispatch();
  const { repair_id } = useParams();
  const { singleStageRemark = [] } = useSelector(
    (state) => state.StageRemarkReducer || {}
  );

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    type: "",
    urls: [],
    videoname: "",
  });

  const openModal = (type, urls, videoname) => {
    console.log(urls);

    setModalContent({ type, urls, videoname });
    setModalOpen(true);
  };

  useEffect(() => {
    if (repair_id) dispatch(getSingleStageRemark(repair_id));
  }, [dispatch, repair_id]);
const [openIndex, setOpenIndex] = useState(0); // first item open by default

// Toggle function
const toggleAccordion = (index) => {
  setOpenIndex((prevIndex) => (prevIndex === index ? -1 : index));
};

  return (
    <Row>
      <Col lg={12}>
        <Card>
          <CardHeader className="d-flex align-items-center">
            <h4 className="card-title mb-0">Recent Status</h4>
          </CardHeader>
          <CardBody>
            <TabContent activeTab={activityTab} className="text-muted">
              <TabPane tabId="1">
                <div className="accordion accordion-flush" id="todayExample">
                  {singleStageRemark?.map((item, index) => {
                    const togglerId = `stageRemarkToggler_${index}`;

                    // Convert comma-separated images string to array
                    // Convert stringified JSON array to actual array
                    let images = [];
                    try {
                      images = item.stage_remark_img
                        ? JSON.parse(item.stage_remark_img)
                        : [];
                    } catch (err) {
                      console.error("Error parsing stage_remark_img:", err);
                      images = [];
                    }

                    return (
                      <div
                        className="accordion-item border-0  bg-white"
                        key={item.stage_remark_id || index}
                      >
                        <div className="accordion-header">
                          <button
                            className="accordion-button p-2 shadow-none "
                            type="button"
                            id={togglerId}
                          >
                            <div className="d-flex">
                              <div className="flex-shrink-0">
                                <img
                                  src={
                                    item?.changed_by_user_profile
                                      ? `${
                                          api.IMG_URL
                                        }user_profile/${encodeURIComponent(
                                          item.changed_by_user_profile
                                        )}`
                                      : avatar2
                                  }
                                  alt=""
                                  className="avatar-xs rounded-circle shadow"
                                />
                              </div>
                              <div className="flex-grow-1 ms-3">
                                <h6 className="fs-14 mb-1">
                                  {item.changed_by_user_name || "Unknown User"}
                                </h6>
                                <small className="text-muted">
                                  {item.current_workflow_stage_name || "N/A"}{" "}
                                  <span className="mx-1">→</span>
                                  {item.next_workflow_stage_name || "N/A"}{" "}
                                  {item.stage_remark_date && (
                                    <>
                                      on{" "}
                                      {formatRemarkDateTime(
                                        item.stage_remark_date
                                      )}
                                    </>
                                  )}
                                </small>
                              </div>
                            </div>
                          </button>
                        </div>

                        <UncontrolledCollapse
                          className="accordion-collapse"
                          toggler={`#${togglerId}`}
                          onClick={() => toggleAccordion(index)}
                          defaultOpen={index ===  openIndex}
                        >
                          <div className="accordion-body ms-2 ps-5">
                            {item.stage_remark ? (
                              <span>{item.stage_remark}</span>
                            ) : (
                              <span className="text-muted">
                                No remark added.
                              </span>
                            )}

                            <div className="row mt-2">
                              {/* Image card */}
                              {images.length > 0 && (
                                <div className="col-3">
                                  <div
                                    className="d-flex border border-dashed p-2 rounded position-relative shadow cursor-pointer"
                                    onClick={() => openModal("image", images)}
                                  >
                                    <div className="flex-shrink-0">
                                      <i className="ri-image-2-line fs-17 text-danger"></i>
                                    </div>
                                    <div className="flex-grow-1 ms-2">
                                      <h6>
                                        <Link to="#" className="stretched-link">
                                          Images
                                        </Link>
                                      </h6>
                                      <small>{images.length} file(s)</small>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Video card */}
                              {item.stage_remark_video && (
                                <div className="col-3">
                                  <div
                                    className="d-flex border border-dashed p-2 rounded position-relative shadow cursor-pointer"
                                    onClick={() =>
                                      openModal(
                                        "video",
                                        [],
                                        item.stage_remark_video
                                      )
                                    }
                                  >
                                    <div className="flex-shrink-0">
                                      <i className="ri-file-zip-line fs-17 text-info"></i>
                                    </div>
                                    <div className="flex-grow-1 ms-2">
                                      <h6>
                                        <Link to="#" className="stretched-link">
                                          Video
                                        </Link>
                                      </h6>
                                      <small>1 file</small>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </UncontrolledCollapse>
                      </div>
                    );
                  })}
                </div>

                {/* Modal */}
                <Modal
                  isOpen={modalOpen}
                  toggle={() => setModalOpen(false)}
                  size="lg"
                >
                  <ModalHeader toggle={() => setModalOpen(false)}>
                    <h5>
                      {modalContent.type === "image" ? "Images" : "Video"}
                    </h5>
                  </ModalHeader>
                  <ModalBody className="text-center">
                    <Card className="border card-border-success p-3 shadow-lg">
                      <Row>
                        {modalContent.type === "image" &&
                          modalContent.urls.map((imgUrl, idx) => (
                            <Col key={idx} lg={4}>
                              <img
                                src={`${
                                  api.IMG_URL
                                }stage_remark_img/${encodeURIComponent(
                                  imgUrl.replace(/"/g, "")
                                )}`}
                                alt="remark"
                                className="img-fluid mb-2"
                              />
                            </Col>
                          ))}
                      </Row>
                      {modalContent.type === "video" && (
                        <video
                          src={`${
                            api.VID_URL
                          }stage_remark_video/${encodeURIComponent(
                            modalContent.videoname
                          )}`}
                          controls
                          className="w-100 mb-2"
                        />
                      )}
                    </Card>
                  </ModalBody>
                </Modal>
              </TabPane>
            </TabContent>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default RecentStatus;
