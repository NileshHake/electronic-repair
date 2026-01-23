import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  lazy,
  Suspense,
} from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

import {
  addStoreFeature,
  resetAddStoreFeatureResponse,
} from "../../store/StoreFeatures";
  
// 🔥 Lazy load icon grid
const IconGrid = lazy(() => import("./StoreFeatureIconGrid"));

const StoreFeatureAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const { addFeatureResponse } = useSelector(
    (state) => state.StoreFeatureReducer
  );

  const submitButtonRef = useRef();

  const [featureData, setFeatureData] = useState({
    title: "",
    description: "",
    icon: "",
  });

  const [errors, setErrors] = useState({});
  const [iconSearch, setIconSearch] = useState("");

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeatureData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ================= SUBMIT =================
  const handleSubmit = () => {
    let newErrors = {};
    if (!featureData.title.trim()) newErrors.title = "Title required";
    if (!featureData.description.trim())
      newErrors.description = "Description required";
    if (!featureData.icon) newErrors.icon = "Select an icon";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    dispatch(addStoreFeature(featureData));
  };

  // ================= CLOSE ON SUCCESS =================
  useEffect(() => {
    if (addFeatureResponse) {
     toggle();
      setFeatureData({ title: "", description: "", icon: "" });
      setIconSearch("");
      dispatch(resetAddStoreFeatureResponse());
    }
  }, [addFeatureResponse, dispatch, toggle]);

  // ================= KEYBOARD SHORTCUT =================
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        submitButtonRef.current?.click();
      }
      if (event.altKey && event.key === "Escape") {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <>
      <Modal isOpen={isOpen} centered size="lg" className="p-3">
        <ModalHeader toggle={toggle} className="bg-light">
          <h4>Create Store Feature</h4>
        </ModalHeader>

        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            <Row className="g-3">
              {/* TITLE */}
              <Col md={12}>
                <Label className="fw-bold">
                  Title <span className="text-danger">*</span>
                </Label>
                <Input
                  name="title"
                  value={featureData.title}
                  onChange={handleChange}
                  placeholder="Free Delivery"
                />
                <small className="text-danger">{errors.title}</small>
              </Col>

              {/* DESCRIPTION */}
              <Col md={12}>
                <Label className="fw-bold">
                  Description <span className="text-danger">*</span>
                </Label>
                <Input
                  type="textarea"
                  rows="3"
                  name="description"
                  value={featureData.description}
                  onChange={handleChange}
                  placeholder="Orders from all item"
                />
                <small className="text-danger">{errors.description}</small>
              </Col>

              {/* ICON SEARCH */}
              <Col md={12}>
                <Label className="fw-bold">Search Icon</Label>
                <Input
                  placeholder="Search icon by name..."
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                />
              </Col>

              {/* ICON GRID (Lazy Loaded) */}
              <Col md={12}>
                <Label className="fw-bold">
                  Select Icon <span className="text-danger">*</span>
                </Label>

                <Suspense fallback={<div className="text-center py-4">Loading icons...</div>}>
                  {isOpen && (
                    <IconGrid
                      iconSearch={iconSearch}
                      featureData={featureData}
                      setFeatureData={setFeatureData}
                    />
                  )}
                </Suspense>

                <small className="text-danger">{errors.icon}</small>
              </Col>

              {/* ICON PREVIEW */}
            {featureData.icon && (
  <Col md={12} className="text-center mt-3">
    <strong>Selected Icon</strong>
    <div className="mt-2">
      {React.createElement(
        require("../../icons").ICONS[featureData.icon],
        { size: 40 }
      )}
    </div>
    <small className="text-muted">{featureData.icon}</small>
  </Col>
)}

            </Row>
          </Card>
        </ModalBody>

        <ModalFooter>
          <Button ref={submitButtonRef} color="primary" onClick={handleSubmit}>
            Save
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

export default StoreFeatureAdd;
