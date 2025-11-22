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
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import Select from "react-select";
import { addCustomer } from "../../store/Customer";
import { getCustomerAddressList } from "../../store/CustomerAddress";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const CustomerAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const submitButtonRef = useRef();

  // ✅ State for customer data
  const [customerData, setCustomerData] = useState({
    customer_name: "",
    customer_phone_number: "",
    customer_email: "",
    customer_address_pincode: "",
    customer_address_city: "",
    customer_address_block: "",
    customer_address_district: "",
    customer_address_state: "",
    customer_address_description: "",
  });

  const [errors, setErrors] = useState({});
  const [villageOptions, setVillageOptions] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState(null);

  // ✅ Fetch address list when modal opens (for dropdown if needed)
  useEffect(() => {
    if (isOpen) {
      dispatch(getCustomerAddressList());
    }
  }, [dispatch, isOpen]);

  // ✅ Fetch address data by PINCODE
  useEffect(() => {
    const fetchAddressByPincode = async () => {
      const pin = customerData.customer_address_pincode.trim();

      if (pin.length === 6) {
        try {
          const res = await fetch(
            `https://api.postalpincode.in/pincode/${pin}`
          );
          const data = await res.json();

          if (data[0].Status === "Success") {
            const postOffices = data[0].PostOffice;
            const options = postOffices.map((p) => ({
              label: p.Name,
              value: p.Name,
              data: p,
            }));
            setVillageOptions(options);
            setSelectedVillage(null);

            // Reset address fields when pincode changes
            setCustomerData((prev) => ({
              ...prev,
              customer_address_city: "",
              customer_address_district: "",
              customer_address_state: "",
              customer_address_block: "",
              customer_address_description: "",
            }));
          } else {
            toast.error("Invalid Pincode!");
            setVillageOptions([]);
          }
        } catch (error) {
          toast.error("Failed to fetch address data!");
        }
      } else {
        setVillageOptions([]);
      }
    };

    fetchAddressByPincode();
  }, [customerData.customer_address_pincode]);

  // ✅ Handle village select
  // ✅ Update description automatically when state/district/block changes
  useEffect(() => {
    if (
      customerData.customer_address_city ||
      customerData.customer_address_block ||
      customerData.customer_address_district ||
      customerData.customer_address_state ||
      customerData.customer_address_pincode
    ) {
      const formattedDescription = `
      <p><strong>Village:</strong> ${
        customerData.customer_address_city || ""
      }</p>
      <p><strong>Block:</strong> ${
        customerData.customer_address_block || ""
      }</p>
      <p><strong>District:</strong> ${
        customerData.customer_address_district || ""
      }</p>
      <p><strong>State:</strong> ${
        customerData.customer_address_state || ""
      }</p>
      <p><strong>Pincode:</strong> ${
        customerData.customer_address_pincode || ""
      }</p>
    `;

      setCustomerData((prev) => ({
        ...prev,
        customer_address_description: formattedDescription,
      }));
    }
  }, [
    customerData.customer_address_city,
    customerData.customer_address_block,
    customerData.customer_address_district,
    customerData.customer_address_state,
    customerData.customer_address_pincode,
  ]);

  const handleVillageSelect = (option) => {
    if (!option) {
      setSelectedVillage(null);
      setCustomerData((prev) => ({
        ...prev,
        customer_address_city: "",
        customer_address_block: "",
        customer_address_district: "",
        customer_address_state: "",
        customer_address_description: "",
      }));
      return;
    }

    const office = option.data;
    const blockValue =
      office.Block && office.Block.trim() !== "" ? office.Block : "N/A";

    const formattedDescription = `
      <p><strong>Village:</strong> ${office.Name}</p>
      <p><strong>Block:</strong> ${blockValue}</p>
      <p><strong>District:</strong> ${office.District}</p>
      <p><strong>State:</strong> ${office.State}</p>
      <p><strong>Pincode:</strong> ${office.Pincode}</p>
    `;

    setSelectedVillage(option);
    setCustomerData((prev) => ({
      ...prev,
      customer_address_city: office.Name,
      customer_address_block: blockValue,
      customer_address_district: office.District,
      customer_address_state: office.State,
      customer_address_pincode: office.Pincode,
      customer_address_description: formattedDescription,
    }));
  };

  // ✅ Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};
    if (!customerData.customer_name)
      newErrors.customer_name = "Name is required";
    else if (!customerData.customer_phone_number)
      newErrors.customer_phone_number = "Phone Number is required";
    else if (!customerData.customer_email)
      newErrors.customer_email = "Email is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(addCustomer(customerData));
    toast.success("Customer added successfully!");
    toggle();

    // Reset form
    setCustomerData({
      customer_name: "",
      customer_phone_number: "",
      customer_email: "",
      customer_address_pincode: "",
      customer_address_city: "",
      customer_address_block: "",
      customer_address_district: "",
      customer_address_state: "",
      customer_address_description: "",
    });
    setSelectedVillage(null);
    setVillageOptions([]);
  };

  // ✅ Keyboard shortcuts (Alt+S = Save, Alt+Esc = Close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        submitButtonRef.current?.click();
      }
      if (e.altKey && e.key === "Escape") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
        <ModalHeader toggle={toggle} className="bg-light fw-bold p-3">
          Add Customer
        </ModalHeader>
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        >
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row className="gy-3">
                {/* Name */}
                <Col lg={4}>
                  <Label className="form-label fw-bold d-flex justify-content-between">
                    <span>
                      Name <span className="text-danger">*</span>
                    </span>
                  </Label>
                  <Input
                    name="customer_name"
                    type="text"
                    placeholder="Enter Customer Name"
                    value={customerData.customer_name}
                    onChange={handleInputChange}
                  />
                  <span className="text-danger text-sm">
                    {errors.customer_name}
                  </span>
                </Col>

                {/* Phone */}
                <Col lg={4}>
                  <Label className="form-label fw-bold">
                    Phone Number <span className="text-danger">*</span>
                  </Label>
                  <Input
                    name="customer_phone_number"
                    type="text"
                    placeholder="Enter Phone Number"
                    value={customerData.customer_phone_number}
                    maxLength={10}
                    onChange={handleInputChange}
                  />
                  <span className="text-danger text-sm">
                    {errors.customer_phone_number}
                  </span>
                </Col>

                {/* Email */}
                <Col lg={4}>
                  <Label className="form-label fw-bold">
                    Email <span className="text-danger">*</span>{" "}
                  </Label>
                  <Input
                    name="customer_email"
                    type="email"
                    placeholder="Enter Email Address"
                    value={customerData.customer_email}
                    onChange={handleInputChange}
                  />
                  <span className="text-danger text-sm">
                    {errors.customer_email}
                  </span>
                </Col>

                {/* Pincode */}
                <Col lg={4}>
                  <Label className="form-label fw-bold d-flex justify-content-between">
                    <span>Pincode</span>
                  </Label>
                  <Input
                    name="customer_address_pincode"
                    type="text"
                    placeholder="Enter Pincode"
                    value={customerData.customer_address_pincode}
                    onChange={handleInputChange}
                    maxLength={6}
                  />
                </Col>

                {/* Village / City */}
                <Col lg={8}>
                  <Label className="form-label fw-bold d-flex justify-content-between">
                    <span>Village / City</span>
                  </Label>
                  <Select
                    options={villageOptions}
                    value={selectedVillage}
                    onChange={handleVillageSelect}
                    placeholder="Select Village / City"
                    isClearable
                  />
                </Col>

                {/* State */}
                <Col lg={4}>
                  <Label className="form-label fw-bold">State</Label>
                  <Input
                    name="customer_address_state"
                    type="text"
                    value={customerData.customer_address_state}
                    onChange={handleInputChange}
                  />
                </Col>
                {/* District */}
                <Col lg={4}>
                  <Label className="form-label fw-bold">District</Label>
                  <Input
                    name="customer_address_district"
                    type="text"
                    value={customerData.customer_address_district}
                    onChange={handleInputChange}
                  />
                </Col>

                {/* Block */}
                <Col lg={4}>
                  <Label className="form-label fw-bold">Block</Label>
                  <Input
                    name="customer_address_block"
                    type="text"
                    value={customerData.customer_address_block}
                    onChange={handleInputChange}
                  />
                </Col>

                {/* Description */}
                <Col lg={12}>
                  <Label className="form-label fw-bold">
                    Address Description
                  </Label>
                  <div className="border rounded-3 p-2">
                    <CKEditor
                      editor={ClassicEditor}
                      data={customerData.customer_address_description}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setCustomerData((prev) => ({
                          ...prev,
                          customer_address_description: data,
                        }));
                      }}
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit" innerRef={submitButtonRef}>
              Save
            </Button>
            <Button color="danger" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <ToastContainer closeButton={false} limit={1} autoClose={800} />
    </>
  );
};

export default CustomerAdd;
