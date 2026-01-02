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
  Form,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  updateSlider,
  resetUpdateSliderResponse,
} from "../../store/slider";
import { api } from "../../config";

const SliderUpdate = ({ isOpen, toggle, sliderData }) => {
  const dispatch = useDispatch();
  const { updateSliderResponse } = useSelector(
    (state) => state.SliderReducer
  );

  const submitButtonRef = useRef();

  const [sliderDetails, setSliderDetails] = useState({
    pre_title_text: "",
    pre_title_price: "",
    title: "",
    subtitle_text_1: "",
    subtitle_percent: "",
    subtitle_text_2: "",
    slider_for_product: "0",
    slider_old_price: "",
    slider_bg_text: "",
    green_bg: 0,
    is_light: 0,
    slider_image: null,
  });

  const [previewImg, setPreviewImg] = useState(null);
  const [errors, setErrors] = useState({});

  // ------------------ Prefill data ------------------
  useEffect(() => {
    if (sliderData) {
      setSliderDetails({
        pre_title_text: sliderData.pre_title_text || "",
        pre_title_price: sliderData.pre_title_price || "",
        title: sliderData.title || "",
        subtitle_text_1: sliderData.subtitle_text_1 || "",
        subtitle_percent: sliderData.subtitle_percent || "",
        subtitle_text_2: sliderData.subtitle_text_2 || "",
        slider_for_product: sliderData.slider_for_product || "0",
        slider_old_price: sliderData.slider_old_price || "",
        slider_bg_text: sliderData.slider_bg_text || "",
        green_bg: sliderData.green_bg || 0,
        is_light: sliderData.is_light || 0,
        slider_image: null,
      });

      // existing image preview
      if (sliderData.slider_image) {
        const imageUrl = sliderData.slider_image.startsWith("http")
          ? sliderData.slider_image
          : `${api.IMG_URL}slider_image/${sliderData.slider_image}`;
        setPreviewImg(imageUrl);
      }

      setErrors({});
    }
  }, [sliderData]);

  // ------------------ Input change ------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSliderDetails((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ------------------ Single checkbox ------------------
  const handleCheckbox = (name) => {
    setSliderDetails((prev) => ({
      ...prev,
      green_bg: name === "green_bg" ? 1 : 0,
      is_light: name === "is_light" ? 1 : 0,
    }));
  };

  // ------------------ Image change ------------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "image/png") {
      setErrors((prev) => ({
        ...prev,
        slider_image: "Only PNG images allowed",
      }));
      return;
    }

    setSliderDetails((prev) => ({ ...prev, slider_image: file }));
    setPreviewImg(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, slider_image: "" }));
  };

  // ------------------ Validation ------------------
  const validate = () => {
    const newErrors = {};

    if (sliderDetails.slider_for_product === "0") {
      if (!sliderDetails.pre_title_text) newErrors.pre_title_text = "Required";
      if (!sliderDetails.pre_title_price) newErrors.pre_title_price = "Required";
      if (!sliderDetails.title) newErrors.title = "Required";
      if (!sliderDetails.subtitle_text_1) newErrors.subtitle_text_1 = "Required";
      if (!sliderDetails.subtitle_percent) newErrors.subtitle_percent = "Required";
      if (!sliderDetails.subtitle_text_2) newErrors.subtitle_text_2 = "Required";
    }

    if (sliderDetails.slider_for_product === "1") {
      if (!sliderDetails.title) newErrors.title = "Required";
      if (!sliderDetails.subtitle_text_1) newErrors.subtitle_text_1 = "Required";
      if (!sliderDetails.slider_old_price) newErrors.slider_old_price = "Required";
      if (!sliderDetails.pre_title_price) newErrors.pre_title_price = "Required";

      if (!sliderDetails.slider_bg_text) newErrors.slider_bg_text = "Required";

    }

    // ✅ Correct image validation for UPDATE
    if (!sliderDetails.slider_image && !sliderData?.slider_image) {
      newErrors.slider_image = "Image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  // ------------------ Submit update ------------------
  const handleUpdate = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("slider_id", sliderData.slider_id); // assuming id is sliderData.id
    Object.entries(sliderDetails).forEach(([key, value]) => {
      // append image only if user selected new file
      if (key === "slider_image" && value instanceof File) {
        formData.append(key, value);
      } else if (key !== "slider_image") {
        formData.append(key, value);
      }
    });

    dispatch(updateSlider(formData));
  };

  // ------------------ Auto close ------------------
  useEffect(() => {
    if (updateSliderResponse) {
      toggle();
      dispatch(resetUpdateSliderResponse());
    }
  }, [updateSliderResponse, dispatch, toggle]);

  return (
    <>
      <Modal size="lg" isOpen={isOpen} centered>
        <Form onSubmit={handleUpdate}>
          <ModalHeader toggle={toggle} className="bg-light">
            <h4>Update Slider</h4>
          </ModalHeader>

          <ModalBody>
            <Card className="border card-border-success p-3 pt-0 shadow-lg">
              <Row className="p-3 justify-content-center border-bottom bg-light rounded-top">
                <Col lg={6} className="d-flex justify-content-center">
                  <div className="form-check form-switch d-flex align-items-center gap-2">
                    <Input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={sliderDetails.slider_for_product == 0}
                      onChange={() =>
                        setSliderDetails({ ...sliderDetails, slider_for_product: "0" })
                      }
                    />
                    <Label className="form-check-label fw-semibold mb-0">
                      Normal Slider
                    </Label>
                  </div>
                </Col>

                <Col lg={6} className="d-flex justify-content-center">
                  <div className="form-check form-switch d-flex align-items-center gap-2">
                    <Input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={sliderDetails.slider_for_product == 1}
                      onChange={() =>
                        setSliderDetails({ ...sliderDetails, slider_for_product: "1" })
                      }
                    />
                    <Label className="form-check-label fw-semibold mb-0">
                      Product Slider
                    </Label>
                  </div>
                </Col>
              </Row>

              {sliderDetails.slider_for_product == 0 ? <Row className="g-3  mt-2">
                {[
                  ["pre_title_text", "Pre Title Text"],
                  ["pre_title_price", "Pre Title Price"],
                  ["title", "Title"],
                  ["subtitle_text_1", "Subtitle Text 1"],
                  ["subtitle_percent", "Subtitle Percent"],
                  ["subtitle_text_2", "Subtitle Text 2"],
                ].map(([name, label]) => (
                  <Col lg={6} key={name}>
                    <Label className="fw-bold">
                      {label} <span className="text-danger">*</span>
                      <span className="text-danger float-end">{errors[name]}</span>
                    </Label>
                    <Input
                      type={name.includes("price") || name.includes("percent") ? "number" : "text"}
                      name={name}
                      value={sliderDetails[name]}
                      onChange={handleChange}
                    />
                  </Col>
                ))}

                {/* CHECKBOXES (ONLY ONE ACTIVE) */}
                <Col lg={6}>
                  <div className="form-check mt-4">
                    <Input
                      className="form-check-input"
                      type="checkbox"
                      checked={sliderDetails.green_bg === 1}
                      onChange={() => handleCheckbox("green_bg")}
                    />
                    <Label className="form-check-label fw-bold">
                      Green Background
                    </Label>
                  </div>
                </Col>

                <Col lg={6}>
                  <div className="form-check mt-4">
                    <Input
                      className="form-check-input"
                      type="checkbox"
                      checked={sliderDetails.is_light === 1}
                      onChange={() => handleCheckbox("is_light")}
                    />
                    <Label className="form-check-label fw-bold">
                      Light Text
                    </Label>
                  </div>
                </Col>

                {/* IMAGE (CATEGORY STYLE UI) */}
                <Col lg={6} className="mt-3">
                  <h5 className="fs-15 mb-1">
                    Slider Image (PNG)
                  </h5>
                  <div className="text-center">
                    <div className="position-relative d-inline-block">
                      <div className="position-absolute top-100 start-100 translate-middle">
                        <label htmlFor="sliderImgUpdate">
                          <div className="avatar-xs">
                            <div className="avatar-title bg-light border rounded-circle cursor-pointer">
                              <i
                                className="ri-image-fill"
                                style={{ color: "#009CA4", fontSize: "20px" }}
                              ></i>
                            </div>
                          </div>
                        </label>
                        <input
                          id="sliderImgUpdate"
                          type="file"
                          accept="image/png"
                          className="d-none"
                          onChange={handleImageChange}
                        />
                      </div>
                      <div className="avatar-lg">
                        <div className="avatar-title bg-light rounded">
                          {previewImg && (
                            <img
                              src={previewImg}
                              alt="Slider"
                              height="100"
                              width="100"
                              className="rounded"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    {errors.slider_image && (
                      <div className="text-danger mt-1">{errors.slider_image}</div>
                    )}
                  </div>
                </Col>

              </Row> :
                <Row className="g-3 mt-2">
                  {[

                    ["title", "Title"],
                    ["subtitle_text_1", "Subtitle Text 1"],
                    ["slider_old_price", " Old Price"],
                    ["pre_title_price", " Price"],
                    ["slider_bg_text", "Background Text"],

                  ].map(([name, label]) => (
                    <Col lg={6} key={name}>
                      <Label className="fw-bold">
                        {label} <span className="text-danger">*</span>
                        <span className="text-danger float-end">{errors[name]}</span>
                      </Label>
                      <Input
                        type={name.includes("price") || name.includes("percent") ? "number" : "text"}
                        name={name}
                        value={sliderDetails[name]}
                        onChange={handleChange}
                      />
                    </Col>
                  ))}



                  {/* IMAGE (CATEGORY STYLE UI) */}
                  <Col lg={6} className="mt-3">
                    <h5 className="fs-15 mb-1">
                      Slider Image (PNG) <span className="text-danger">*</span>
                    </h5>

                    <div className="text-center">
                      <div className="position-relative d-inline-block">
                        <div className="position-absolute top-100 start-100 translate-middle">
                          <label htmlFor="sliderImg">
                            <div className="avatar-xs">
                              <div className="avatar-title bg-light border rounded-circle cursor-pointer">
                                <i
                                  className="ri-image-fill"
                                  style={{ color: "#009CA4", fontSize: "20px" }}
                                ></i>
                              </div>
                            </div>
                          </label>

                          <input
                            id="sliderImg"
                            type="file"
                            accept="image/png"
                            className="d-none"
                            onChange={handleImageChange}
                          />
                        </div>

                        <div className="avatar-lg">
                          <div className="avatar-title bg-light rounded">
                            {previewImg && (
                              <img
                                src={previewImg}
                                alt="Slider"
                                height="100"
                                width="100"
                                className="rounded"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {errors.slider_image && (
                        <div className="text-danger mt-1">
                          {errors.slider_image}
                        </div>
                      )}
                    </div>
                  </Col>

                </Row>}
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button ref={submitButtonRef} color="primary" type="submit">
              Update
            </Button>
            <Button color="danger" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

    </>
  );
};

export default SliderUpdate;
