import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const PreviewModal = ({ isOpen, toggle, rows = [] }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" centered>
      <ModalHeader toggle={toggle} className="bg-light">
        Selected Products Preview
      </ModalHeader>

      <ModalBody>
        {rows.length === 0 ? (
          <div className="text-muted">No products selected</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-sm align-middle">
              <thead className="table-light text-uppercase text-muted">
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th style={{ width: 180 }}>Category</th>
                  <th style={{ width: 100 }}>Product ID</th>
                  <th>Product</th>
                  <th style={{ width: 120 }} className="text-end">
                    Sale Price
                  </th>
                  <th style={{ width: 120 }} className="text-end">
                    MRP
                  </th>
                  <th style={{ width: 90 }} className="text-center">
                    Gen ID
                  </th>
                  <th style={{ width: 90 }} className="text-center">
                    RAM ID
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r, idx) => (
                  <tr key={`${r.category_id}-${r.product_id}-${idx}`}>
                    <td>{idx + 1}</td>
                    <td>{r.category_name || `Category ${r.category_id}`}</td>
                    <td>{r.product_id}</td>
                    <td>{r.product_name}</td>
                    <td className="text-end">₹{r.product_sale_price}</td>
                    <td className="text-end">₹{r.product_mrp}</td>
                    <td className="text-center">{r.product_generation_id || "-"}</td>
                    <td className="text-center">{r.product_ram_id || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="danger" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default PreviewModal;
    