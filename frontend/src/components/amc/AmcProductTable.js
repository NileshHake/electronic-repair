import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import AmcProductSearch from "./AmcProductSearch";

const AmcProductTable = ({ products, setProducts }) => {

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [problemNote, setProblemNote] = useState("");
    const [qty, setQty] = useState(1);

    const [modalOpen, setModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    // Select product
    const handleProductSelect = (product) => {
        const existingIndex = products.findIndex(
            (p) => p.product_id == product.product_id
        );
        // If product already exists → increase qty
        if (existingIndex !== -1) {

            const updated = [...products];
            updated[existingIndex] = {  
                ...updated[existingIndex],
                qty: updated[existingIndex].qty + 1
            };

            setProducts(updated);
            return;
        }

        // If new product → open modal
        setSelectedProduct(product);
        setProblemNote("");
        setEditIndex(null);
        setModalOpen(true);
    };
    // Save
    const handleSave = () => {

        if (!selectedProduct) return;

        const newProduct = {
            product_id: selectedProduct.product_id,
            product_name: selectedProduct.product_name,
            qty: qty,
            problem_note: problemNote
        };

        if (editIndex !== null) {

            const updated = [...products];

            updated[editIndex] = {
                ...updated[editIndex],
                qty,
                problem_note: problemNote
            };

            setProducts(updated);

        } else {

            setProducts([...products, newProduct]);

        }

        setModalOpen(false);

    };

    // Edit
    const handleEdit = (product, index) => {

        setSelectedProduct(product);
        setProblemNote(product.problem_note);
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
                            <th>Problem Note</th>
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

                                    <td>{item.problem_note}</td>

                                    <td>
                                        <ul className="list-inline hstack gap-2 mb-0">

                                            <li className="list-inline-item">
                                                <button
                                                    className="btn btn-sm text-primary d-flex align-items-center justify-content-center"
                                                    onClick={() => handleEdit(item, index)}
                                                >
                                                    Edit
                                                </button>
                                            </li>

                                            <li className="list-inline-item">
                                                <button
                                                    className="btn btn-sm text-danger d-flex align-items-center justify-content-center"
                                                    onClick={() => handleDelete(index)}
                                                >
                                                    Delete                                                </button>
                                            </li>

                                        </ul>

                                    </td>

                                </tr>

                            ))

                        ) : (

                            <tr>

                                <td colSpan="5" className="text-center py-4">

                                    <lord-icon
                                        src="https://cdn.lordicon.com/msoeawqm.json"
                                        trigger="loop"
                                        colors="primary:#405189,secondary:#0ab39c"
                                        style={{ width: "72px", height: "72px" }}
                                    ></lord-icon>

                                    <h6 className="mt-3 text-muted">
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
                    Product Details
                </ModalHeader>

                <ModalBody>

                    <div className="mb-3 fw-semibold">
                        {selectedProduct?.product_name}
                    </div>

                    {/* Qty */}

                    <div className="mb-3">

                        <label className="form-label">Quantity</label>

                        <input
                            type="number"
                            className="form-control"
                            min="1"
                            value={qty}
                            onChange={(e) => setQty(parseInt(e.target.value))}
                        />

                    </div>

                    {/* Problem */}

                    <div>

                        <label className="form-label">Problem Note</label>

                        <textarea
                            className="form-control"
                            rows="4"
                            placeholder="Enter problem..."
                            value={problemNote}
                            onChange={(e) => setProblemNote(e.target.value)}
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