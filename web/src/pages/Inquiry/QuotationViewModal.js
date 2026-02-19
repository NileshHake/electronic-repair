import React, { useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Card,
  Badge,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

import { getQuotationChildList } from "../../store/Inquiry";
import { api } from "../../config";

const QuotationViewModal = ({ isOpen, toggle, quotation }) => {
  if (!quotation) return null;

  const dispatch = useDispatch();

  const { quotationChildList, loading } = useSelector(
    (state) => state.QuotationReducer
  );

  useEffect(() => {
    if (quotation?.quotation_id && isOpen) {
      dispatch(
        getQuotationChildList({
          quotation_id: quotation.quotation_id,
        })
      );
    }
  }, [quotation, isOpen, dispatch]);

  const getStatusLabel = (s) => {
    const val = Number(s);
    if (val === 1) return { text: "New", color: "secondary" };
    if (val === 2) return { text: "Accept", color: "primary" };
    if (val === 3) return { text: "In Process", color: "warning" };
    if (val === 4) return { text: "Final", color: "success" };
    if (val === 5) return { text: "Reject", color: "danger" };
    return { text: "Unknown", color: "dark" };
  };

  const st = getStatusLabel(quotation.quotation_status);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" centered>
      <ModalHeader toggle={toggle} className="bg-light p-3">
        Quotation Details #{quotation.quotation_id}
      </ModalHeader>

      <ModalBody>
        <Card className="border card-border-success p-3 shadow-lg">
          <Card className="shadow-lg border-0 p-4 mb-4 rounded-3">
            <Row className="mb-3 g-2">
              <Col xs={12} md={6}>
                <div className="p-2 bg-light rounded d-flex align-items-center">
                  <i className="ri-user-line me-2 text-primary fs-5"></i>
                  <div>
                    <small className="text-muted d-block">Customer</small>
                    <span className="fw-semibold text-dark">
                      {quotation.customer_name || "-"}
                    </span>
                  </div>
                </div>
              </Col>

              <Col xs={12} md={6}>
                <div className="p-2 bg-light rounded d-flex align-items-center">
                  <i className="ri-mail-line me-2 text-success fs-5"></i>
                  <div>
                    <small className="text-muted d-block">Email</small>
                    <span className="fw-semibold text-dark">
                      {quotation.customer_email || "-"}
                    </span>
                  </div>
                </div>
              </Col>
            </Row>

            <Row className="mb-3 g-2">
              <Col xs={12} md={6}>
                <div className="p-2 bg-light rounded d-flex align-items-center">
                  <i className="ri-phone-line me-2 text-info fs-5"></i>
                  <div>
                    <small className="text-muted d-block">Phone</small>
                    <span className="fw-semibold text-dark">
                      {quotation.customer_phone || "-"}
                    </span>
                  </div>
                </div>
              </Col>

              <Col xs={12} md={6}>
                <div className="p-2 bg-light rounded d-flex align-items-center justify-content-between">
                  <div>
                    <small className="text-muted d-block">Status</small>
                    <Badge color={st.color} className="fs-6" pill>
                      {st.text}
                    </Badge>
                  </div>
                </div>
              </Col>
            </Row>

            <Row className="mb-3 g-2">
              <Col xs={12} md={6}>
                <div className="p-2 rounded d-flex align-items-center justify-content-between bg-primary-subtle">
                  <strong>Total:</strong>
                  <span className="fw-bold text-primary fs-5">
                    ₹ {Number(quotation.grand_total || 0).toFixed(2)}
                  </span>
                </div>
              </Col>

              <Col xs={12} md={6}>
                <div className="p-2 bg-light rounded d-flex align-items-center">
                  <i className="ri-hashtag-line me-2 text-secondary fs-5"></i>
                  <div>
                    <small className="text-muted d-block">Quotation No</small>
                    <span className="fw-semibold text-dark">
                      {quotation.quotation_no || `#${quotation.quotation_id}`}
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* ================= QUOTATION ITEMS ================= */}
          <div className="table-responsive">
            <table className="table align-middle table-hover">
              <thead className="table-light text-uppercase text-muted">
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-3">
                      Loading items...
                    </td>
                  </tr>
                ) : Array.isArray(quotationChildList) && quotationChildList.length > 0 ? (
                  quotationChildList.map((item, index) => (
                    <tr key={item.quotation_child_id || index}>
                      <td>{index + 1}</td>

                      <td>{item.product_name || item.product?.product_name || "-"}</td>

                      <td>
                        {item.product_image ? (
                          <img
                            src={`${api.IMG_URL}product_images/${item.product_image}`}
                            alt={item.product_name || "product"}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                        ) : (
                          "N/A"
                        )}
                      </td>

                      <td>₹ {Number(item.price || item.product_price || 0).toFixed(2)}</td>

                      <td>
                        <span>{Number(item.qty || item.product_qty || 0)}</span>
                      </td>

                      <td>₹ {Number(item.total || item.product_total || 0).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <lord-icon
                        src="https://cdn.lordicon.com/msoeawqm.json"
                        trigger="loop"
                        colors="primary:#405189,secondary:#0ab39c"
                        style={{ width: "72px", height: "72px" }}
                      ></lord-icon>
                      <div className="mt-4">
                        <h5>No items found</h5>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </ModalBody>

      <ModalFooter>
        <Button color="danger" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default QuotationViewModal;
