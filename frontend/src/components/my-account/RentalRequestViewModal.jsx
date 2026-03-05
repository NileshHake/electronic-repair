import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  Badge
} from "reactstrap";

const getStatus = (status) => {
  switch (Number(status)) {
    case 0:
      return <Badge color="warning">Pending</Badge>;
    case 1:
      return <Badge color="success">Accepted</Badge>;
    case 2:
      return <Badge color="info">Shipped</Badge>;
    case 3:
      return <Badge color="primary">Active</Badge>;
    case 4:
      return <Badge color="danger">Cancelled</Badge>;
    case 5:
      return <Badge color="secondary">Expired</Badge>;
    case 6:
      return <Badge color="dark">Returned</Badge>;
    default:
      return "-";
  }
};

const getPaymentStatus = (status) => {
  switch (Number(status)) {
    case 0:
      return <Badge color="warning">Pending</Badge>;
    case 1:
      return <Badge color="info">Partial</Badge>;
    case 2:
      return <Badge color="success">Paid</Badge>;
    case 3:
      return <Badge color="danger">Refunded</Badge>;
    default:
      return "-";
  }
};

const RentalRequestViewModal = ({ isOpen, toggle, data }) => {

  if (!data) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>

      <ModalHeader toggle={toggle}>
        Rental Request #{data.rental_request_id}
      </ModalHeader>

      <ModalBody>

        <Table bordered responsive>

          <tbody>

            {/* CUSTOMER */}
            <tr className="table-light">
              <th colSpan="2">Customer Details</th>
            </tr>

            <tr>
              <th width="35%">Customer Name</th>
              <td>{data.customer_name || "-"}</td>
            </tr>

            <tr>
              <th>Phone</th>
              <td>{data.customer_phone_number || "-"}</td>
            </tr>

            <tr>
              <th>Email</th>
              <td>{data.customer_email || "-"}</td>
            </tr>

            {/* DEVICE */}

            <tr className="table-light">
              <th colSpan="2">Device Details</th>
            </tr>

            <tr>
              <th>Device</th>
              <td>{data.device_name || "-"}</td>
            </tr>

            <tr>
              <th>Model</th>
              <td>{data.device_model || "-"}</td>
            </tr>

            {/* RENTAL */}

            <tr className="table-light">
              <th colSpan="2">Rental Information</th>
            </tr>

            <tr>
              <th>Rent Type</th>
              <td>{data.rent_type || "-"}</td>
            </tr>

            <tr>
              <th>Duration</th>
              <td>{data.duration} Days</td>
            </tr>

            <tr>
              <th>From Date</th>
              <td>{data.from_date || "-"}</td>
            </tr>

            <tr>
              <th>To Date</th>
              <td>{data.to_date || "-"}</td>
            </tr>

            {/* PRICE */}

            <tr className="table-light">
              <th colSpan="2">Pricing</th>
            </tr>

            <tr>
              <th>Rent</th>
              <td>₹ {data.rent}</td>
            </tr>

            <tr>
              <th>Security Deposit</th>
              <td>₹ {data.security_deposit}</td>
            </tr>

            <tr>
              <th>Delivery Fee</th>
              <td>₹ {data.delivery_fee}</td>
            </tr>

            <tr>
              <th>Base Amount</th>
              <td>₹ {data.base_amount}</td>
            </tr>

            <tr>
              <th>GST</th>
              <td>{data.gst_percentage}% (₹ {data.gst_amount})</td>
            </tr>

            <tr>
              <th>Total Amount</th>
              <td className="fw-bold text-success">
                ₹ {data.total_amount}
              </td>
            </tr>

            {/* PAYMENT */}

            <tr className="table-light">
              <th colSpan="2">Payment</th>
            </tr>

            <tr>
              <th>Paid Amount</th>
              <td>₹ {data.paid_amount}</td>
            </tr>

            <tr>
              <th>Payment Mode</th>
              <td>{data.payment_mode || "-"}</td>
            </tr>

            <tr>
              <th>Payment Status</th>
              <td>{getPaymentStatus(data.payment_status)}</td>
            </tr>

            {/* DELIVERY */}

            <tr className="table-light">
              <th colSpan="2">Delivery Tracking</th>
            </tr>

            <tr>
              <th>Delivered At</th>
              <td>{data.delivered_at || "-"}</td>
            </tr>

            <tr>
              <th>Returned At</th>
              <td>{data.returned_at || "-"}</td>
            </tr>

            {/* VENDOR */}

            <tr className="table-light">
              <th colSpan="2">Vendor</th>
            </tr>

            <tr>
              <th>Vendor Name</th>
              <td>{data.vendor_name || "-"}</td>
            </tr>

            <tr>
              <th>Vendor Phone</th>
              <td>{data.vendor_phone_number || "-"}</td>
            </tr>

            {/* ADDRESS */}

            <tr className="table-light">
              <th colSpan="2">Delivery Address</th>
            </tr>

            <tr>
              <th>Address</th>
              <td>
                {data.address_line1} {data.address_line2}
              </td>
            </tr>

            <tr>
              <th>City</th>
              <td>{data.city}</td>
            </tr>

            <tr>
              <th>State</th>
              <td>{data.state}</td>
            </tr>

            <tr>
              <th>Pincode</th>
              <td>{data.pincode}</td>
            </tr>

            {/* STATUS */}

            <tr className="table-light">
              <th colSpan="2">Status</th>
            </tr>

            <tr>
              <th>Request Status</th>
              <td>{getStatus(data.request_status)}</td>
            </tr>

            {data.cancel_reason && (
              <tr>
                <th>Cancel Reason</th>
                <td className="text-danger">{data.cancel_reason}</td>
              </tr>
            )}

            <tr>
              <th>Cancelled By</th>
              <td>{data.cancelled_by || "-"}</td>
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

export default RentalRequestViewModal;