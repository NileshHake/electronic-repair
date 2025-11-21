import React, { useEffect, useState, useRef } from "react";
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
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import Select from "react-select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { addCustomerAddress } from "../../store/CustomerAddress";

const CustomerAddressAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const submitButtonRef = useRef();

  const [addressData, setAddressData] = useState({
    customer_address_city: "",
    customer_address_pincode: "",
    customer_address_block: "",
    customer_address_district: "",
    customer_address_state: "",
    customer_address_description: "",
  });

  const [villageOptions, setVillageOptions] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [errors, setErrors] = useState({});

  // ✅ Handle input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!addressData.customer_address_pincode)
      newErrors.customer_address_pincode = "Pincode is required";
    if (!selectedVillage)
      newErrors.customer_address_city = "Please select a village";
    if (!addressData.customer_address_state)
      newErrors.customer_address_state = "State is required";
    if (!addressData.customer_address_description)
      newErrors.customer_address_description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Fetch address data by pincode
  useEffect(() => {
    const fetchAddressByPincode = async () => {
      const pin = addressData.customer_address_pincode;
      if (pin.length === 6) {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
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
            setAddressData((prev) => ({
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
  }, [addressData.customer_address_pincode]);

// ✅ Handle village selection (Fixed Block update issue)
const handleVillageSelect = (option) => {
  if (!option) {
    // 🧹 Clear selection if user unselects
    setSelectedVillage(null);
    setAddressData((prev) => ({
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

  // 🟢 Make sure Block updates correctly for every selection
  const blockValue = office.Block && office.Block.trim() !== "" ? office.Block : "N/A";

  // 🧾 Auto-fill formatted HTML description
  const formattedDescription = `
    <p><strong>Village:</strong> ${office.Name}</p>
    <p><strong>Block:</strong> ${blockValue}</p>
    <p><strong>District:</strong> ${office.District}</p>
    <p><strong>State:</strong> ${office.State}</p>
    <p><strong>Pincode:</strong> ${office.Pincode}</p>
  `;

  setSelectedVillage(option);
  setAddressData({
    customer_address_city: office.Name,
    customer_address_block: blockValue,
    customer_address_district: office.District,
    customer_address_state: office.State,
    customer_address_pincode: office.Pincode,
    customer_address_description: formattedDescription,
  });
};


  // ✅ Submit handler
  const handleSubmit = () => {
    if (!validateForm()) return;

    dispatch(addCustomerAddress(addressData));
    toast.success("Customer Address added successfully!");
    toggle();
    setAddressData({
      customer_address_city: "",
      customer_address_pincode: "",
      customer_address_block: "",
      customer_address_district: "",
      customer_address_state: "",
      customer_address_description: "",
    });
    setSelectedVillage(null);
    setVillageOptions([]);
  };

  // ✅ Keyboard shortcuts (Alt + S, Alt + Esc)
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
        <ModalHeader toggle={toggle} className="bg-light fw-bold p-3" >
          Add Customer Address
        </ModalHeader>
        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            <Row className="gy-3">
              {/* Pincode */}
              <Col lg={4}>
                <Label className="form-label fw-bold d-flex justify-content-between">
                  <span>Pincode</span>
                  <span className="text-danger">{errors.customer_address_pincode}</span>
                </Label>
                <Input
                  name="customer_address_pincode"
                  type="text"
                  placeholder="Enter Pincode"
                  value={addressData.customer_address_pincode}
                  onChange={handleInputChange}
                  maxLength={6}
                />
              </Col>

              {/* Village / City */}
              <Col lg={8}>
                <Label className="form-label fw-bold d-flex justify-content-between">
                  <span>Village / City</span>
                  <span className="text-danger">{errors.customer_address_city}</span>
                </Label>
                <Select
                  options={villageOptions}
                  value={selectedVillage}
                  onChange={handleVillageSelect}
                  placeholder="Select Village / City"
                  isClearable
                />
              </Col>

              {/* District */}
              <Col lg={4}>
                <Label className="form-label fw-bold">District</Label>
                <Input
                  name="customer_address_district"
                  type="text"
                  placeholder="Auto-filled"
                  value={addressData.customer_address_district}
                  readOnly
                />
              </Col>

              {/* State */}
              <Col lg={4}>
                <Label className="form-label fw-bold d-flex justify-content-between">
                  <span>State</span>
                  <span className="text-danger">{errors.customer_address_state}</span>
                </Label>
                <Input
                  name="customer_address_state"
                  type="text"
                  placeholder="Auto-filled"
                  value={addressData.customer_address_state}
                  readOnly
                />
              </Col>

              {/* Block */}
              <Col lg={4}>
                <Label className="form-label fw-bold">Block</Label>
                <Input
                  name="customer_address_block"
                  type="text"
                  placeholder="Auto-filled"
                  value={addressData.customer_address_block}
                  readOnly
                />
              </Col>

              {/* Description */}
              <Col lg={12}>
                <Label className="form-label fw-bold d-flex justify-content-between">
                  <span>Address Description</span>
                  <span className="text-danger">{errors.customer_address_description}</span>
                </Label>
                <div className="border rounded-3 p-2">
                  <CKEditor
                    editor={ClassicEditor}
                    data={addressData.customer_address_description}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setAddressData((prev) => ({
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

export default CustomerAddressAdd;
