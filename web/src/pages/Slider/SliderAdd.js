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
import { addSlider, resetAddSliderResponse } from "../../store/slider";

const SliderAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const { addSliderResponse } = useSelector(
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
    green_bg: 0,
    is_light: 0,
    slider_image: null,
  });

  const [previewImg, setPreviewImg] = useState(null);
  const [errors, setErrors] = useState({});

  /* ================= INPUT CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSliderDetails((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* ================= SINGLE CHECKBOX LOGIC ================= */
  const handleCheckbox = (name) => {
    setSliderDetails((prev) => ({
      ...prev,
      green_bg: name === "green_bg" ? 1 : 0,
      is_light: name === "is_light" ? 1 : 0,
    }));
  };

  /* ================= IMAGE HANDLER (PNG ONLY) ================= */
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

    setSliderDetails((prev) => ({
      ...prev,
      slider_image: file,
    }));

    setPreviewImg(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, slider_image: "" }));
  };

  /* ================= VALIDATION ================= */
  const validate = () => {
    const newErrors = {};
    [
      "pre_title_text",
      "pre_title_price",
      "title",
      "subtitle_text_1",
      "subtitle_percent",
      "subtitle_text_2",
      "slider_image",
    ].forEach((key) => {
      if (!sliderDetails[key]) newErrors[key] = "Required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    Object.entries(sliderDetails).forEach(([key, value]) => {
      formData.append(key, value);
    });

    dispatch(addSlider(formData));
  };

  /* ================= AUTO CLOSE ================= */
  useEffect(() => {
    if (addSliderResponse) {
      toggle();
      setSliderDetails({
        pre_title_text: "",
        pre_title_price: "",
        title: "",
        subtitle_text_1: "",
        subtitle_percent: "",
        subtitle_text_2: "",
        green_bg: 0,
        is_light: 0,
        slider_image: null,
      });
      setPreviewImg(null);
      setErrors({});
      dispatch(resetAddSliderResponse());
    }
  }, [addSliderResponse, dispatch, toggle]);

  return (
    <>
      <Modal size="lg" isOpen={isOpen} centered>
        <Form onSubmit={handleSubmit}>
          <ModalHeader toggle={toggle} className="bg-light">
            <h4>Create Slider</h4>
          </ModalHeader>

          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row className="g-3">

                {/* TEXT FIELDS */}
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

              </Row>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button ref={submitButtonRef} color="primary" type="submit">
              Save
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

export default SliderAdd;
