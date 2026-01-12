import React from "react";
import { Row, Col, Label, Input } from "reactstrap";

const BusinessAddressTab = ({
  businessData,
  handleInputChange,
  setBusinessData
}) => {
  const fetchLatLngByPincode = async (pincode) => {
    try {
      if (pincode.length !== 6) return;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`
      );

      const data = await res.json();

      if (!data || data.length === 0) return;

      setBusinessData((prev) => ({
        ...prev,
        shop_lat: data[0].lat,
        shop_lng: data[0].lon,
       
      }));
    } catch (error) {
      console.error("Pincode lookup failed", error);
    }
  };


  return (
    <Row className="gy-3">

      <Col lg={4}>
        <Label>Pincode</Label>
        <Input
          name="user_address_pincode"
          value={businessData.user_address_pincode || ""}
          onChange={(e) => {
            handleInputChange(e);
            fetchLatLngByPincode(e.target.value);
          }}
          placeholder="Enter Pincode"
          maxLength={6}
        />
      </Col>


      <Col lg={4}>
        <Label>City / Village</Label>
        <Input
          name="user_address_city"
          value={businessData.user_address_city || ""}
          onChange={handleInputChange}
          placeholder="Enter City / Village"
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

      
      <Col lg={4}>
        <Label>Latitude</Label>
        <Input
          value={businessData.shop_lat || ""}
          readOnly
          placeholder="Auto from pincode"
        />
      </Col>

      <Col lg={4}>
        <Label>Longitude</Label>
        <Input
          value={businessData.shop_lng || ""}
          readOnly
          placeholder="Auto from pincode"
        />
      </Col>

      <Col lg={12}>
        <Label>Address Description</Label>
        <Input
          name="user_address_description"
          type="textarea"
          rows={4}
          value={businessData.user_address_description || ""}
          onChange={handleInputChange}
          placeholder="Write your full address..."
        />
      </Col>

    </Row>
  );
};

export default BusinessAddressTab;
