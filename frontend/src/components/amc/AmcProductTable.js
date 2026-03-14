import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import AmcProductSearch from "./AmcProductSearch";

const AmcProductTable = ({ products, setProducts }) => {

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Select product
  const handleProductSelect = (product) => {

    const existingIndex = products.findIndex(
      (p) => p.product_id === product.device_type_id
    );

    // Same product → increase qty
    if (existingIndex !== -1) {

      const updated = [...products];

      updated[existingIndex] = {
        ...updated[existingIndex],
        qty: updated[existingIndex].qty + 1
      };

      setProducts(updated);

      return;

    }

    // New product
    setSelectedProduct(product);
    setQty(1);
    setEditIndex(null);
    setModalOpen(true);

  };

  // Save product
  const handleSave = () => {

    if (!selectedProduct) return;

    const newProduct = {
      product_id: selectedProduct.device_type_id,
      product_name: selectedProduct.device_type_name,
      qty: qty
    };

    if (editIndex !== null) {

      const updated = [...products];

      updated[editIndex] = newProduct;

      setProducts(updated);

    } else {

      setProducts([...products, newProduct]);

    }

    setModalOpen(false);
    setQty(1);
    setSelectedProduct(null);

  };

  // Edit
  const handleEdit = (product, index) => {

    setSelectedProduct({
      device_type_id: product.product_id,
      device_type_name: product.product_name
    });

    setQty(product.qty);
    setEditIndex(index);
    setModalOpen(true);

  };

  // Delete
  const handleDelete = (index) => {

    const updated = products.filter((_, i) => i !== index);

    setProducts(updated);

  };

  return (
    <div>

      {/* Search */}
      <div className="mb-3">
        <AmcProductSearch onSelect={handleProductSelect} />
      </div>

      {/* Table */}
      <div className="table-responsive">

        <table className="table align-middle table-hover">

          <thead className="table-light text-uppercase text-muted">
            <tr>
              <th>#</th>
              <th>Product</th>
              <th width="120">Qty</th>
              <th width="120">Actions</th>
            </tr>
          </thead>

          <tbody>

            {products.length > 0 ? (

              products.map((item, index) => (

                <tr key={index}>

                  <td>{index + 1}</td>

                  <td>{item.product_name}</td>

                  <td>{item.qty}</td>

                  <td className="d-flex justify-content-between">

                    <button
                      className="btn btn-sm btn-soft-primary me-2 text-primary"
                      onClick={() => handleEdit(item, index)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-soft-danger text-danger"
                      onClick={() => handleDelete(index)}
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td colSpan="4" className="text-center py-4">

                  <h6 className="text-muted">
                    No Products Added
                  </h6>

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* Modal */}

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} centered>

        <ModalHeader toggle={() => setModalOpen(false)}>
          Product Quantity
        </ModalHeader>

        <ModalBody>

          <div className="mb-3 fw-semibold">
            {selectedProduct?.device_type_name}
          </div>

          <div>

            <label className="form-label">Quantity</label>

            <input
              type="number"
              className="form-control"
              min="1"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />

          </div>

        </ModalBody>

        <ModalFooter>

          <Button color="primary" onClick={handleSave}>
            Save
          </Button>

          <Button color="danger" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>

        </ModalFooter>

      </Modal>

    </div>
  );
};

export default AmcProductTable;