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
import { updateCustomer } from "../../store/Customer";
import { getCustomerAddressList } from "../../store/CustomerAddress";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const CustomerUpdate = ({ isOpen, toggle, customerDataToEdit }) => {
  const dispatch = useDispatch();
  const submitButtonRef = useRef();

  // ✅ Local state
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

  // ✅ Pre-fill when modal opens
  useEffect(() => {
    if (isOpen && customerDataToEdit) {
      setCustomerData({
        customer_name: customerDataToEdit.customer_name || "",
        customer_phone_number: customerDataToEdit.customer_phone_number || "",
        customer_email: customerDataToEdit.customer_email || "",
        customer_address_pincode:
          customerDataToEdit.customer_address_pincode || "",
        customer_address_city: customerDataToEdit.customer_address_city || "",
        customer_address_block: customerDataToEdit.customer_address_block || "",
        customer_address_district:
          customerDataToEdit.customer_address_district || "",
        customer_address_state: customerDataToEdit.customer_address_state || "",
        customer_address_description:
          customerDataToEdit.customer_address_description || "",
      });
      setSelectedVillage(
        customerDataToEdit.customer_address_city
          ? {
              label: customerDataToEdit.customer_address_city,
              value: customerDataToEdit.customer_address_city,
            }
          : null
      );
    }
  }, [isOpen, customerDataToEdit]);

  // ✅ Fetch address list when modal opens (optional)
  useEffect(() => {
    if (isOpen) dispatch(getCustomerAddressList());
  }, [dispatch, isOpen]);

  // ✅ Fetch address data by PINCODE
  useEffect(() => {
    const fetchAddressByPincode = async () => {
      const pin = customerData.customer_address_pincode || "";
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
          } else {
            setVillageOptions([]);
            toast.error("Invalid Pincode!");
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

  // ✅ Handle input changes and update description dynamically
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => {
      const updated = { ...prev, [name]: value };

      // Only update description dynamically if manual edits occur
      if (
        [
          "customer_address_state",
          "customer_address_district",
          "customer_address_block",
          "customer_address_city",
          "customer_address_pincode",
        ].includes(name)
      ) {
        updated.customer_address_description = `
          <p><strong>Village:</strong> ${updated.customer_address_city}</p>
          <p><strong>Block:</strong> ${updated.customer_address_block}</p>
          <p><strong>District:</strong> ${updated.customer_address_district}</p>
          <p><strong>State:</strong> ${updated.customer_address_state}</p>
          <p><strong>Pincode:</strong> ${updated.customer_address_pincode}</p>
        `;
      }

      return updated;
    });
 
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

  // ✅ Submit update 
  const handleSubmit = () => {
    if (!validateForm()) return;

    const finalData = {
      ...customerData,
      customer_id: customerDataToEdit.customer_id,
    };

    dispatch(updateCustomer(finalData));
    toggle();
  };

  // ✅ Keyboard shortcuts
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
          Update Customer
        </ModalHeader>

        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            <Row className="gy-3">
              <Col lg={4}>
                <Label className="form-label fw-bold d-flex justify-content-between">
                  <span>
                    Name <span className="text-danger"> *</span>
                  </span>
                </Label>
                <Input
                  name="customer_name"
                  type="text"
                  value={customerData.customer_name}
                  onChange={handleInputChange}
                  placeholder="Enter Customer Name"
                />
                <span className="text-danger">{errors.customer_name}</span>
              </Col>

              <Col lg={4}>
                <Label className="form-label fw-bold">
                  Phone Number<span className="text-danger"> *</span>
                </Label>
                <Input
                  name="customer_phone_number"
                  type="text"
                  value={customerData.customer_phone_number}
                  onChange={handleInputChange}
                  maxLength={10}
                  placeholder="Enter Phone Number"
                />
                <span className="text-danger">
                  {errors.customer_phone_number}
                </span>
              </Col>

              {/* Email */}
              <Col lg={4}>
                <Label className="form-label fw-bold">Email<span className="text-danger"> *</span></Label>
                <Input
                  name="customer_email"
                  type="email"
                  placeholder="Enter Email Address"
                  value={customerData.customer_email}
                  onChange={handleInputChange}
                />
                <span className="text-danger">{errors.customer_email}</span>
              </Col>
              <Col lg={4}>
                <Label className="form-label fw-bold">Pincode</Label>
                <Input
                  name="customer_address_pincode"
                  type="text"
                  value={customerData.customer_address_pincode}
                  onChange={handleInputChange}
                  maxLength={6}
                  placeholder="Enter Pincode"
                />
              </Col>
              <Col lg={8}>
                <Label className="form-label fw-bold">Village / City</Label>
                <Select
                  options={villageOptions}
                  value={selectedVillage}
                  onChange={handleVillageSelect}
                  placeholder="Select Village / City"
                  isClearable
                />
              </Col>

              <Col lg={4}>
                <Label className="form-label fw-bold">State</Label>
                <Input
                  name="customer_address_state"
                  type="text"
                  value={customerData.customer_address_state}
                  onChange={handleInputChange}
                />
              </Col>

              <Col lg={4}>
                <Label className="form-label fw-bold">District</Label>
                <Input
                  name="customer_address_district"
                  type="text"
                  value={customerData.customer_address_district}
                  onChange={handleInputChange}
                />
              </Col>

              <Col lg={4}>
                <Label className="form-label fw-bold">Block</Label>
                <Input
                  name="customer_address_block"
                  type="text"
                  value={customerData.customer_address_block}
                  onChange={handleInputChange}
                />
              </Col>

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
          <Button
            color="primary"
            ref={submitButtonRef}
            onClick={handleSubmit}
            style={{ minWidth: "120px" }}
          >
            Update
          </Button>
          <Button color="danger" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <ToastContainer closeButton={false} limit={1} autoClose={800} />
    </>
  );
};

export default CustomerUpdate;
