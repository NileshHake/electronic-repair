import React from "react";
import { Row, Col, Label, Input } from "reactstrap";

const BusinessAddressTab = ({
  businessData,
  handleInputChange,
}) => {

  return (
    <Row className="gy-3">

      <Col lg={4}>
        <Label>Pincode</Label>
        <Input
          name="user_address_pincode"
          value={businessData.user_address_pincode || ""}
          onChange={handleInputChange}
          placeholder="Enter Pincode"
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
        <Label>Pincode</Label>
        <Input
          name="user_address_pincode"
          value={businessData.user_address_pincode || ""}
          onChange={handleInputChange}
          placeholder="Enter Pincode"
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
