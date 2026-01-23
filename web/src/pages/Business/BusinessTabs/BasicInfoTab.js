import React, { useEffect } from "react";
import { Row, Col, Label, Input } from "reactstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useDispatch, useSelector } from "react-redux";
import { getBrandsList } from "../../../store/Brand";
import Select from "react-select";
const BasicInfoTab = ({
  businessData,
  errors,
  setBusinessData,
  handleInputChange,
  handleProfileChange,
  previewProfile,
  status
}) => {

  const dispatch = useDispatch();
  const { brands } = useSelector((state) => state.BrandReducer);

  useEffect(() => {
    dispatch(getBrandsList());
  }, [dispatch]);
  useEffect(() => {
    if (businessData.user_ifsc_code?.length === 11) {
      fetch(`https://ifsc.razorpay.com/${businessData.user_ifsc_code}`)
        .then((res) => res.json())
        .then((data) => {
          setBusinessData((prev) => ({
            ...prev,
            user_bank_name: data.BANK || "",
            user_branch_name: data.BRANCH || "",
            user_bank_code: data?.IFSC ? data.IFSC.slice(-6) : "",
            user_bank_contact: data.CONTACT || "",
            user_bank_address: data.ADDRESS || "",
          }));
        })
        .catch((err) => console.error("Error:", err));
    } else {
      setBusinessData((prev) => ({
        ...prev,
        user_bank_name: "",
        user_branch_name: "",
        user_bank_code: "",
        user_bank_contact: "",
        user_bank_address: "",
      }));
    }
  }, [businessData.user_ifsc_code, setBusinessData]);

  return (
    <Row className="gy-3">
      {/* Basic Info */}
      <Col lg={4}>
        <Label>
          {status == 1 ? "Supplier" : "Business"} Name <span className="text-danger">*</span>
        </Label>
        <Input
          name="user_name"
          type="text"
          value={businessData?.user_name || ""}
          onChange={handleInputChange}
          placeholder="Enter business or shop name"
        />
        {errors.user_name && (
          <span className="text-danger small">{errors.user_name}</span>
        )}
      </Col>

      <Col lg={4}>
        <Label>
          Email <span className="text-danger">*</span>
        </Label>
        <Input
          name="user_email"
          type="email"
          value={businessData?.user_email || ""}
          onChange={handleInputChange}
          placeholder="Enter business email address"
        />
        {errors.user_email && (
          <span className="text-danger small">{errors.user_email}</span>
        )}
      </Col>

      <Col lg={4}>
        <Label>
          Password <span className="text-danger">*</span>
        </Label>
        <Input
          name="user_password"
          type="password"
          value={businessData?.user_password || ""}
          onChange={handleInputChange}
          placeholder="Enter password"
        />
        {errors.user_password && (
          <span className="text-danger small">{errors.user_password}</span>
        )}
      </Col>

      <Col lg={4}>
        <Label>Phone</Label>
        <Input
          name="user_phone_number"
          type="text"
          value={businessData?.user_phone_number || ""}
          onChange={handleInputChange}
          placeholder="Enter contact number"
        />
      </Col>

      <Col lg={4}>
        <Label>GST Number</Label>
        <Input
          name="user_gst_number"
          type="text"
          value={businessData?.user_gst_number || ""}
          onChange={handleInputChange}
          placeholder="Enter GST number"
        />
      </Col>
      {status && (
        <Col lg={4}>
          <Label>Supplier Brand</Label>
          <Select
            options={brands.map((b) => ({ value: b.brand_id, label: b.brand_name }))}
            value={
              brands
                .map((b) => ({ value: b.brand_id, label: b.brand_name }))
                .find((opt) => opt.value === businessData.supplier_brand_id) || null
            }
            onChange={(opt) =>
              setBusinessData((prev) => ({ ...prev, supplier_brand_id: opt?.value || "" }))
            }
            placeholder="Select brand"
            isClearable
          />
        </Col>
      )}



      {/* Profile Image */}
      <Col lg={6} className="mt-3">
        <h5 className="fs-15 mb-1">   {status == 1 ? "Supplier" : "Business"} Logo</h5>
        <div className="text-center">
          <div className="position-relative d-inline-block">
            <div className="position-absolute top-100 start-100 translate-middle">
              <label
                htmlFor="businessProfile"
                className="mb-0"
                title="Select Image"
              >
                <div className="avatar-xs">
                  <div className="avatar-title bg-light border rounded-circle text-muted cursor-pointer">
                    <i
                      className="ri-image-fill"
                      style={{
                        color: "#009CA4",
                        fontSize: "20px",
                      }}
                    ></i>
                  </div>
                </div>
              </label>
              <input
                className="form-control d-none"
                id="businessProfile"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleProfileChange}
              />
            </div>
            <div className="avatar-lg">
              <div className="avatar-title bg-light rounded">
                {previewProfile ? (
                  <img
                    src={previewProfile}
                    alt="Profile Preview"
                    height="100px"
                    width="100px"
                    className="rounded"
                  />
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        </div>
      </Col>
      {/* Business Address (CKEditor) */}


    </Row>
  );
};

export default BasicInfoTab;
