import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

// Redux actions (YOU MUST CREATE SAME AS CATEGORY) 

// Components
import SliderAdd from "./SliderAdd";
import SliderUpdate from "./SliderUpdate";
import DeleteModal from "../../Components/Common/DeleteModal";
import D_img from "../../helpers/Default/D_img";
import { api } from "../../config";
import { deleteSlider, getSlidersList } from "../../store/slider";

const SliderList = () => {
  document.title = "Slider List";

  const dispatch = useDispatch();

  const { sliders } = useSelector((state) => state.SliderReducer);
 

  const [isOpen, setIsOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [sliderData, setSliderData] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState(null);

  // ----------------------------------
  // Fetch sliders
  // ----------------------------------
  useEffect(() => {
    dispatch(getSlidersList());
  }, [dispatch]);

  // ----------------------------------
  // Delete handlers
  // ----------------------------------
  const onClickDelete = (slider) => {
    setSelectedSlider(slider);
    setDeleteModal(true);
  };

  const handleDeleteSlider = () => {
    if (selectedSlider) {
      dispatch(deleteSlider(selectedSlider.slider_id));
    }
    setDeleteModal(false);
  };

  return (
    <div className="page-content">
      <Container fluid>
        
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <Col>
                    <h5 className="mb-0 fw-bold">Slider List</h5>
                  </Col>
                  <Col className="text-end">
                    <Button color="success" onClick={() => setIsOpen(true)}>
                      + Add Slider
                    </Button>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody className="pt-0">
                <div className="table-responsive">
                  <table className="table align-middle table-hover mb-0">
                    <thead className="table-light text-uppercase text-muted">
                      <tr>
                        <th>#</th>
                        <th className="text-center">Image</th>
                        <th>Pre Title</th>
                        <th>Price</th>
                        <th>Title</th>
                        <th>Sub Text 1</th>
                        <th>%</th>
                        <th>Sub Text 2</th>
                        <th className="text-center">Green BG</th>
                        <th className="text-center">Light</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {sliders.data && sliders.data.length > 0 ? (
                        sliders.data.map((slider, index) => (
                          <tr key={slider.slider_id}>
                            <td>{index + 1}</td>

                            {/* Image */}
                            <td className="text-center">
                              {slider.slider_image ? (
                                <img
                                  src={`${api.IMG_URL}slider_image/${slider.slider_image}`}
                                  alt="slider"
                                  width="120"
                                  height="70"
                                  className="rounded"
                                />
                              ) : (
                                <D_img width="80px" height="50px" />
                              )}
                            </td>

                            <td>{slider.pre_title_text}</td>
                            <td>₹ {slider.pre_title_price}</td>
                            <td className="fw-semibold">{slider.title}</td>
                            <td>{slider.subtitle_text_1}</td>
                            <td>{slider.subtitle_percent}%</td>
                            <td>{slider.subtitle_text_2}</td>

                            {/* Green BG */}
                            <td className="text-center">
                              {slider.green_bg === 1 ? (
                                <span className="badge bg-success">Yes</span>
                              ) : (
                                <span className="badge bg-secondary">No</span>
                              )}
                            </td>

                            {/* Light */}
                            <td className="text-center">
                              {slider.is_light === 1 ? (
                                <span className="badge bg-info">Yes</span>
                              ) : (
                                <span className="badge bg-secondary">No</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="text-center">
                              {slider.slider_status === 1 ? (
                                <span className="badge bg-success">Active</span>
                              ) : (
                                <span className="badge bg-danger">Inactive</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="text-center">
                              <ul className="list-inline hstack gap-2 mb-0 justify-content-center">
                                <li className="list-inline-item">
                                  <button
                                    className="text-primary border-0 bg-transparent"
                                    onClick={() => {
                                      setSliderData(slider);
                                      setIsUpdateOpen(true);
                                    }}
                                  >
                                    <i className="ri-pencil-fill fs-16"></i>
                                  </button>
                                </li>

                                <li className="list-inline-item">
                                  <button
                                    onClick={() => onClickDelete(slider)}
                                    className="text-danger border-0 bg-transparent"
                                  >
                                    <i className="ri-delete-bin-5-fill fs-16"></i>
                                  </button>
                                </li>
                              </ul>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="12" className="text-center py-5">
                            <h5>No Slider Found</h5>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Add Slider Modal */}
      {isOpen && <SliderAdd isOpen={isOpen} toggle={() => setIsOpen(false)} />}

      {/* Update Slider Modal */}
      {isUpdateOpen && (
        <SliderUpdate
          isOpen={isUpdateOpen}
          toggle={() => setIsUpdateOpen(false)}
          sliderData={sliderData}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteSlider}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default SliderList;
