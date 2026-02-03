import React, { useMemo } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Table,
  Badge,
} from "reactstrap";
import { api } from "../../config"; // adjust path if needed

const getServiceText = (val) => {
  const n = Number(val);
  if (n === 1) return "PC";
  if (n === 2) return "CCTV";
  if (n === 3) return "PC + CCTV";
  return "-";
};

const BusinessViewModal = ({ isOpen, toggle, business }) => {
  const profileUrl = useMemo(() => {
    if (!business?.user_profile) return "";
    return `${api.IMG_URL}user_profile/${business.user_profile}`;
  }, [business?.user_profile]);

  if (!business) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle}>
        Business Details - <span className="ms-1">{business?.user_name || "-"}</span>
      </ModalHeader>

      <ModalBody>
        {/* ✅ TOP SECTION */}
        <Row className="g-3 align-items-center mb-3">
          <Col md={4} className="text-center">
            <div className="border rounded p-2 bg-light">
              {profileUrl ? (
                <img
                  src={profileUrl}
                  alt="profile"
                  style={{ width: 140, height: 140, objectFit: "cover" }}
                  className="rounded"
                />
              ) : (
                <div className="text-muted small py-5">No Profile Image</div>
              )}
            </div>
          </Col>

          <Col md={8}>
            <h5 className="mb-1">{business?.user_name || "-"}</h5>
            <div className="text-muted">{business?.user_email || "-"}</div>

            <div className="mt-2 d-flex flex-wrap gap-2">
              <Badge color="primary" pill>
                Type: {Number(business?.user_type) === 2 ? "Business" : business?.user_type}
              </Badge>
              <Badge color="info" pill>
                Service: {getServiceText(business?.user_cctv_or_pc)}
              </Badge>
              {Number(business?.status) === 1 && (
                <Badge color="success" pill>
                  Active
                </Badge>
              )}
            </div>
          </Col>
        </Row>

        {/* ✅ DETAILS TABLE */}
        <Table bordered responsive className="mb-0">
          <tbody>
            <tr>
              <th style={{ width: "35%" }}>Phone</th>
              <td>{business?.user_phone_number || "-"}</td>
            </tr>
            <tr>
              <th>GST Number</th>
              <td>{business?.user_gst_number || "-"}</td>
            </tr>
            <tr>
              <th>UPI ID</th>
              <td>{business?.user_upi_id || "-"}</td>
            </tr>

            <tr className="table-light">
              <th colSpan="2">Bank Details</th>
            </tr>
            <tr>
              <th>Bank Name</th>
              <td>{business?.user_bank_name || "-"}</td>
            </tr>
            <tr>
              <th>IFSC Code</th>
              <td>{business?.user_ifsc_code || "-"}</td>
            </tr>
            <tr>
              <th>Branch</th>
              <td>{business?.user_branch_name || "-"}</td>
            </tr>
            <tr>
              <th>Account Number</th>
              <td>{business?.user_bank_account_number || "-"}</td>
            </tr>
            <tr>
              <th>Bank Code</th>
              <td>{business?.user_bank_code || "-"}</td>
            </tr>
            <tr>
              <th>Bank Contact</th>
              <td>{business?.user_bank_contact || "-"}</td>
            </tr>
            <tr>
              <th>Bank Address</th>
              <td>{business?.user_bank_address || "-"}</td>
            </tr>

            <tr className="table-light">
              <th colSpan="2">Address</th>
            </tr>
            <tr>
              <th>Pincode</th>
              <td>{business?.user_address_pincode || "-"}</td>
            </tr>
            <tr>
              <th>City</th>
              <td>{business?.user_address_city || "-"}</td>
            </tr>
            <tr>
              <th>Block</th>
              <td>{business?.user_address_block || "-"}</td>
            </tr>
            <tr>
              <th>District</th>
              <td>{business?.user_address_district || "-"}</td>
            </tr>
            <tr>
              <th>State</th>
              <td>{business?.user_address_state || "-"}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>
                <div
                  dangerouslySetInnerHTML={{
                    __html: business?.user_address_description || "-",
                  }}
                />
              </td>
            </tr>

            <tr className="table-light">
              <th colSpan="2">Terms & Conditions</th>
            </tr>
            <tr>
              <th>T&C</th>
              <td>
                <div
                  dangerouslySetInnerHTML={{
                    __html: business?.user_terms_and_conditions || "-",
                  }}
                />
              </td>
            </tr>

            <tr className="table-light">
              <th colSpan="2">Shop Location</th>
            </tr>
            <tr>
              <th>Latitude</th>
              <td>{business?.shop_lat || "-"}</td>
            </tr>
            <tr>
              <th>Longitude</th>
              <td>{business?.shop_lng || "-"}</td>
            </tr>
          </tbody>
        </Table>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default BusinessViewModal;
