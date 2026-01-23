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
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { addBusiness, resetAddBusinessResponse } from "../../store/Business";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import BasicInfoTab from "./BusinessTabs/BasicInfoTab";
import BusinessAddressTab from "./BusinessTabs/BusinessAddressTab";
import BankDetails from "./BusinessTabs/BankDetails";

const BusinessAdd = ({ isOpen, toggle, status }) => {


  const dispatch = useDispatch();
  const { addBusinessResponse } = useSelector((state) => state.BusinessReducer);

  // 🧩 Tabs
  const [activeTab, setActiveTab] = useState("1");
  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const [businessData, setBusinessData] = useState({
    user_name: "",
    user_email: "",
    user_password: "",
    user_phone_number: "",
    user_gst_number: "",
    user_upi_id: "",
    user_bank_name: "",
    user_ifsc_code: "",
    user_branch_name: "",
    user_bank_account_number: "",
    user_bank_address: "",
    user_bank_code: "",
    user_bank_contact: "",
    user_profile: null,
    user_address_pincode: "",
    user_address_city: "",
    user_address_block: "",
    user_address_district: "",
    user_address_state: "",
    user_address_description: "",
    user_terms_and_conditions: "",
    user_type: 2,
    supplier_brand_id: 0,
    shop_lat: "",
    shop_lng: "",
    status: status,

  });

  const [errors, setErrors] = useState({});
  const [previewProfile, setPreviewProfile] = useState(null);

  const submitButtonRef = useRef();

  // ==============================
  // 📦 HANDLERS
  // ==============================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessData((prev) => {
      const updatedData = { ...prev, [name]: value };



      return updatedData;
    });

    setBusinessData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // 🧩 Profile image
  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBusinessData({ ...businessData, user_profile: file });
      setPreviewProfile(URL.createObjectURL(file));
    }
  };

  // 🧩 Validate
  const validateForm = () => {
    const newErrors = {};
    if (!businessData.user_name.trim()) newErrors.user_name = "Name required";
    else if (!businessData.user_email.trim())
      newErrors.user_email = "Email required";
    else if (!businessData.user_password.trim())
      newErrors.user_password = "Password required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🧩 Submit
  const handleAddBusiness = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(addBusiness(businessData));
  };

  // 🧩 Success Response
  useEffect(() => {
    if (addBusinessResponse) {
      toggle();
      setBusinessData({
        user_name: "",
        user_email: "",
        user_password: "",
        user_phone_number: "",
        user_profile: null,
        user_type: 2,
      });
      setPreviewProfile(null);
      dispatch(resetAddBusinessResponse());
    }
  }, [addBusinessResponse, dispatch, toggle]);

  return (
    <>
      <Modal id="showModal" size="xl" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle}>
          <h4>Create    {status == 1 ? "Supplier" : "Business"} </h4>
        </ModalHeader>
        <form onSubmit={handleAddBusiness}>
          <ModalBody>
            {/* Nav Tabs */}
            <Card className="border card-border-success shadow-lg">
              <Nav
                tabs
                className="nav-tabs nav-tabs-custom nav-success p-2 pb-0 bg-light"
              >
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "1" })}
                    onClick={() => toggleTab("1")}
                  >
                    Basic Info
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "2" })}
                    onClick={() => toggleTab("2")}
                  >
                    Bank Details
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "3" })}
                    onClick={() => toggleTab("3")}
                  >
                    {status == 1 ? "Supplier" : "Business"} Address
                  </NavLink>
                </NavItem>
                {!status   && <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "4" })}
                    onClick={() => toggleTab("4")}
                  >
                    Terms & Conditions
                  </NavLink>
                </NavItem>}
              </Nav>

              {/* ==================== TAB CONTENT ==================== */}
              <TabContent activeTab={activeTab}>
                {/* TAB 1: BASIC INFO */}
                <TabPane tabId="1">
                  <Card className="border p-3 shadow-sm">
                    <BasicInfoTab
                      businessData={businessData}
                      setBusinessData={setBusinessData}
                      handleInputChange={handleInputChange}
                      handleProfileChange={handleProfileChange}
                      previewProfile={previewProfile}
                      errors={errors}
                      status={status}
                    />
                  </Card>
                </TabPane>
                {/* TAB 2: Bank Details */}
                <TabPane tabId="2">
                  <Card className="border p-3 shadow-sm">
                    <BankDetails
                      businessData={businessData}
                      setBusinessData={setBusinessData}
                      handleInputChange={handleInputChange}
                    />
                  </Card>
                </TabPane>

                {/* TAB 3: BUSINESS ADDRESS */}
                <TabPane tabId="3">
                  <Card className="border p-3 shadow-sm">
                    <BusinessAddressTab
                      businessData={businessData}
                      handleInputChange={handleInputChange}
                      setBusinessData={setBusinessData}
                    />
                  </Card>
                </TabPane>

                {/* TAB 3: TERMS & CONDITIONS */}
                <TabPane tabId="4">
                  <Card className="border p-3 shadow-sm">
                    <Label>Terms & Conditions</Label>
                    <div className="border rounded p-2">
                      <CKEditor
                        editor={ClassicEditor}
                        data={businessData.user_terms_and_conditions}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setBusinessData((prev) => ({
                            ...prev,
                            user_terms_and_conditions: data,
                          }));
                        }}
                      />
                    </div>
                  </Card>
                </TabPane>
              </TabContent>
            </Card>
          </ModalBody>
          <ModalFooter>
            <div className="hstack gap-2 justify-content-center mt-2">
              <Button color="danger" type="button" onClick={toggle}>
                <i className="ri-close-line me-1 align-middle" />
                Close
              </Button>
              <Button color="primary" type="submit">
                <i className="ri-save-3-line align-bottom me-1"></i>
                Save
              </Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>

      <ToastContainer />
    </>
  );
};

export default BusinessAdd;
