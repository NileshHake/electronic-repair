// BankDetails.js
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import React, { useEffect } from "react";
import { Row, Col, Label, Input } from "reactstrap";

const BankDetails = ({ businessData, setBusinessData, handleInputChange }) => {
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
        .catch((err) => console.error("Error fetching IFSC details:", err));
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
    <Row className="gy-3 ">
      <Col lg={4}>
        <Label>Bank IFSC Code</Label>
        <Input
          name="user_ifsc_code"
          type="text"
          value={businessData?.user_ifsc_code || ""}
          onChange={handleInputChange}
          placeholder="Enter IFSC code (e.g., HDFC0001234)"
        />
      </Col>

      <Col lg={4}>
        <Label>Bank Name</Label>
        <Input
          name="user_bank_name"
          type="text"
          value={businessData?.user_bank_name || ""}
          onChange={handleInputChange}
          placeholder="Auto-filled or manually enter bank name"
        />
      </Col>

      <Col lg={4}>
        <Label>Branch Name</Label>
        <Input
          name="user_branch_name"
          type="text"
          value={businessData?.user_branch_name || ""}
          onChange={handleInputChange}
          placeholder="Auto-filled or manually enter branch name"
        />
      </Col>

      <Col lg={4}>
        <Label>Bank Code</Label>
        <Input
          name="user_bank_code"
          type="text"
          value={businessData?.user_bank_code || ""}
          onChange={handleInputChange}
          placeholder="Auto-filled or manually enter bank code"
        />
      </Col>

      <Col lg={4}>
        <Label>Bank Contact Number</Label>
        <Input
          name="user_bank_contact"
          type="text"
          value={businessData?.user_bank_contact || ""}
          onChange={handleInputChange}
          placeholder="Auto-filled or manually enter contact number"
        />
      </Col>

      <Col lg={4}>
        <Label>Account Number</Label>
        <Input
          name="user_bank_account_number"
          type="text"
          value={businessData?.user_bank_account_number || ""}
          onChange={handleInputChange}
          placeholder="Enter bank account number"
        />
      </Col>

      <Col lg={4}>
        <Label>UPI ID</Label>
        <Input
          name="user_upi_id"
          type="text"
          value={businessData?.user_upi_id || ""}
          onChange={handleInputChange}
          placeholder="Enter UPI ID (e.g., name@bank)"
        />
      </Col>
      <Col lg={12}>
        <Label>Bank Address</Label>
        <CKEditor
          editor={ClassicEditor}
          data={businessData?.user_bank_address || ""}
          onChange={(event, editor) => {
            const data = editor.getData();
            setBusinessData((prev) => ({
              ...prev,
              user_bank_address: data,
            }));
          }}
          config={{
            placeholder:
              "Enter detailed business address with formatting (optional)...",
          }}
        />
      </Col>
    </Row>
  );
};

export default BankDetails;
