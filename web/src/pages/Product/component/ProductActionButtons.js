import React, { useEffect, useState } from "react";
import { Tooltip, Collapse, Input, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../../store/actions";
import { resetUpdateProductResponse } from "../../../store/product";

const ProductActionButtons = ({ userType, product, onEdit, onClose }) => {
  const dispatch = useDispatch();

  const updateProductResponse = useSelector(
    (state) => state.ProductReducer.updateProductResponse
  );

  const [statusTooltip, setStatusTooltip] = useState(false);
  const [editTooltip, setEditTooltip] = useState(false);

  const [showStatusActions, setShowStatusActions] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null); // 1 accept, 2 reject
  const [rejectMsg, setRejectMsg] = useState("");
  const [rejectError, setRejectError] = useState(false);

  if (userType === 6 || userType == 7 ) return null;

  const pid = product?.product_id;

  const resetStatusUI = () => {
    setSelectedStatus(null);
    setRejectMsg("");
    setRejectError(false);
  };

  const closeAll = () => {
    setShowStatusActions(false); // ✅ close accept/reject area
    resetStatusUI();
    if (typeof onClose === "function") onClose(); // ✅ close modal (parent)
  };

  useEffect(() => {
    if (updateProductResponse === true) {
      closeAll();
      dispatch(resetUpdateProductResponse());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateProductResponse]);

  const handleAccept = () => {
    const payload = {
      ...product,
      product_id: pid,
      product_status: 2,
      product_reject_message: "",
    };
    dispatch(updateProduct(payload));
  };

  const handleRejectSelect = () => setSelectedStatus(2);

  const handleRejectSubmit = () => {
    if (!rejectMsg.trim()) {
      setRejectError(true);
      return;
    }

    const payload = {
      ...product,
      product_id: pid,
      product_status: 3,
      product_reject_message: rejectMsg.trim(),
    };

    dispatch(updateProduct(payload));
  };

  return (
    <div className="d-flex flex-column gap-2">
      <div className="d-flex gap-2">
        {/* ✅ Change Status */}
        <div>
          <Tooltip
            placement="top"
            isOpen={statusTooltip}
            target={`StatusChangeBtn-${pid}`}
            toggle={() => setStatusTooltip((p) => !p)}
          >
            Change Status
          </Tooltip>

          <button
            id={`StatusChangeBtn-${pid}`}
            type="button"
            className="btn btn-soft-success btn-icon"
            onClick={() => {
              setShowStatusActions((p) => !p);
              resetStatusUI();
            }}
          >
            <i className="ri-check-double-line fs-16"></i>
          </button>
        </div>

        {/* ✏️ Edit */}
        <div>
          <Tooltip
            placement="top"
            isOpen={editTooltip}
            target={`TooltipEdit-${pid}`}
            toggle={() => setEditTooltip((p) => !p)}
          >
            Edit Product
          </Tooltip>

          <button
            id={`TooltipEdit-${pid}`}
            type="button"
            className="btn btn-light btn-icon"
            onClick={() => onEdit?.(product)}
          >
            <i className="ri-pencil-fill align-bottom"></i>
          </button>
        </div>
      </div>

      {/* ✅ Accept/Reject section */}
      <Collapse isOpen={showStatusActions}>
        <div className="border rounded p-2 bg-light">
          <div className="d-flex gap-2">
            <Button type="button" color="success" className="btn-sm" onClick={handleAccept}>
              Accept
            </Button>

            <Button type="button" color="danger" className="btn-sm" onClick={handleRejectSelect}>
              Reject
            </Button>

            <Button type="button" color="secondary" className="btn-sm ms-auto" onClick={closeAll}>
              Cancel
            </Button>
          </div>

          {selectedStatus === 2 && (
            <div className="mt-2">
              <label className="form-label mb-1">Why reject?</label>
              <Input
                type="textarea"
                rows="3"
                value={rejectMsg}
                onChange={(e) => {
                  setRejectMsg(e.target.value);
                  setRejectError(false);
                }}
                placeholder="Write reject reason..."
                className={rejectError ? "is-invalid" : ""}
              />
              {rejectError && (
                <div className="invalid-feedback d-block">Reject message is required.</div>
              )}

              <div className="d-flex gap-2 mt-2">
                <Button type="button" color="danger" className="btn-sm" onClick={handleRejectSubmit}>
                  Submit Reject
                </Button>
                <Button type="button" color="light" className="btn-sm" onClick={resetStatusUI}>
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default ProductActionButtons;
