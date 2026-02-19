import React from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from "reactstrap";

const money = (v) => {
    const n = Number(v || 0);
    return Number.isFinite(n) ? n.toLocaleString("en-IN") : "0";
};

const QuotationPreviewModal = ({
    isOpen,
    toggle,
    quoteType,
    channel,
    cameraCount,
    selectedRows = [],
    grandTotal = 0,
    status = 0,
    // ✅ NEW
    onSaveOnly,
    onSaveAndDownload,
    saving = false,
}) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl" centered>
            <ModalHeader toggle={toggle} className="bg-light p-3">
                Quotation Preview
            </ModalHeader>

            <ModalBody>
                {status === 0 && <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
                    <div>
                        <div className="fw-bold">
                            Type:{" "}
                            {Number(quoteType) === 1
                                ? "ONLY CAMERA"
                                : Number(quoteType) === 2
                                    ? "DVR SETUP"
                                    : "NVR SETUP (IP CAMERA)"}
                        </div>

                        <div className="text-muted small">
                            {Number(quoteType) !== 1 ? (
                                <>
                                    Channel: <strong>{channel || "-"}</strong> •{" "}
                                </>
                            ) : null}
                            Cameras: <strong>{cameraCount}</strong>
                        </div>
                    </div>

                    <div className="text-end">
                        <div className="text-muted small">Grand Total</div>
                        <div className="fw-bold fs-5">₹{money(grandTotal)}</div>
                    </div>
                </div>}

                <div
                    className="table-responsive"
                    style={{ maxHeight: 520, overflowY: "auto" }}
                >
                    <table className="table table-hover align-middle">
                        <thead
                            className="table-light text-uppercase small"
                            style={{ position: "sticky", top: 0, zIndex: 10 }}
                        >
                            <tr>
                                <th style={{ width: 50 }}>#</th>
                                <th style={{ minWidth: 200 }}>Category</th>
                                <th style={{ minWidth: 320 }}>Product</th>
                                <th className="text-end" style={{ width: 140 }}>
                                    Price
                                </th>
                                <th className="text-end" style={{ width: 120 }}>
                                    Qty
                                </th>
                                <th className="text-end" style={{ width: 160 }}>
                                    Total
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {Array.isArray(selectedRows) && selectedRows.length > 0 ? (
                                selectedRows.map((r, idx) => (
                                    <tr key={`${r.product?.product_id || r.category_id}-${idx}`}>
                                        <td>{idx + 1}</td>
                                        <td className="fw-semibold">{r.category_name || "-"}</td>
                                        <td>{r.product?.product_name || "-"}</td>
                                        <td className="text-end">₹{money(r.price)}</td>
                                        <td className="text-end">{Number(r.qty || 0)}</td>
                                        <td className="text-end fw-bold">₹{money(r.total)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        No items selected
                                    </td>
                                </tr>
                            )}

                            {selectedRows.length > 0 && (
                                <tr className="table-light">
                                    <td colSpan="5" className="text-end fw-bold">
                                        Grand Total
                                    </td>
                                    <td className="text-end fw-bold">₹{money(grandTotal)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </ModalBody>

            <ModalFooter className="d-flex gap-2">
                <Button
                    color="primary"
                    onClick={onSaveOnly}
                    disabled={saving || selectedRows.length === 0}
                >
                    {saving ? "Saving..." : "Save "}
                </Button>

                <Button
                    color="success"
                    onClick={onSaveAndDownload}
                    disabled={saving || selectedRows.length === 0}
                >
                    {saving ? "Saving..." : "Save & Download"}
                </Button>

                <Button color="secondary" onClick={toggle} disabled={saving}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default QuotationPreviewModal;
