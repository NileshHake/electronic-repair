import React, { useEffect, useState } from "react";
import { Row, Col, Label, Input } from "reactstrap";
import Select from "react-select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast } from "react-toastify";

const BusinessAddressTab = ({
  businessData,
  handleInputChange,

  setBusinessData,
}) => {
  const [villageOptions, setVillageOptions] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const handleVillageSelect = (option) => {
    if (!option) {
      setSelectedVillage(null);
      setBusinessData((prev) => ({
        ...prev,
        user_address_city: "",
        user_address_block: "",
        user_address_district: "",
        user_address_state: "",
        user_address_description: "",
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
    setBusinessData((prev) => ({
      ...prev,
      user_address_city: office.Name,
      user_address_block: blockValue,
      user_address_district: office.District,
      user_address_state: office.State,
      user_address_pincode: office.Pincode,
      user_address_description: formattedDescription,
    }));
  };
  useEffect(() => {
    const fetchAddressByPincode = async () => {
      const pin = String(businessData?.user_address_pincode || "").trim();
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
            setSelectedVillage(
              businessData.user_address_city
                ? options.find(
                    (e) => e.value === businessData.user_address_city
                  ) || null
                : null
            );
          } else {
            toast.error("Invalid Pincode!");
            setVillageOptions([]);
          }
        } catch (error) {
          toast.error("Failed to fetch address data!");
        }
      }
    };
    fetchAddressByPincode();
  }, [businessData?.user_address_pincode]);

  return (
    <Row className="gy-3">
      <Col lg={4}>
        <Label>Pincode</Label>
        <Input
          name="user_address_pincode"
          value={businessData?.user_address_pincode || ""}
          onChange={handleInputChange}
          maxLength={6}
          placeholder="Enter Pincode"
        />
      </Col>

      <Col lg={8}>
        <Label>Village / City</Label>
        <Select
          options={villageOptions}
          value={selectedVillage}
          onChange={handleVillageSelect}
          placeholder="Select Village / City"
          isClearable
        />
      </Col>

      <Col lg={4}>
        <Label>State</Label>
        <Input
          name="user_address_state"
          value={businessData.user_address_state || ""}
          onChange={handleInputChange}
          placeholder="Enter State"
        />
      </Col>

      <Col lg={4}>
        <Label>District</Label>
        <Input
          name="user_address_district"
          value={businessData.user_address_district || ""}
          onChange={handleInputChange}
          placeholder="Enter District"
        />
      </Col>

      <Col lg={4}>
        <Label>Block</Label>
        <Input
          name="user_address_block"
          value={businessData.user_address_block || ""}
          onChange={handleInputChange}
          placeholder="Enter Block"
        />
      </Col>

      <Col lg={12}>
        <Label>Address Description</Label>
        <div className=" ">
          <CKEditor
            editor={ClassicEditor}
            data={businessData.user_address_description || ""}
            onChange={(event, editor) => {
              const data = editor.getData();
              setBusinessData((prev) => ({
                ...prev,
                user_address_description: data,
              }));
            }}
          />
        </div>
      </Col>
    </Row>
  );
};

export default BusinessAddressTab;
