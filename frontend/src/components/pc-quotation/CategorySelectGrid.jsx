import React, { useMemo, useState } from "react";
import { Input, Button } from "reactstrap";
import Select from "react-select";
import { useGetProductsForQuotationQuery } from "@/redux/features/productApi";
import {
  useCreateQuotationMutation,
  useLazyDownloadQuotationInvoiceQuery,
} from "@/redux/features/quotationApi";

const PROCESSOR_CAT_ID = 1;
const MOTHERBOARD_CAT_ID = 2;
const RAM_CAT_ID = 4;

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderRadius: 8,
    borderColor: state.isFocused ? "#86b7fe" : base.borderColor,
    boxShadow: "none",
  }),
};

const money = (v) => {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n.toLocaleString("en-IN") : "0";
};

const toDateOnly = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const downloadBlob = (blob, filename = "quotation.pdf") => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

const CategorySelectGrid = ({ categoryList = [], businessId = null, customerId = null }) => {
  const [selectedIdByCategory, setSelectedIdByCategory] = useState({});
  const [selectedOptionByCategory, setSelectedOptionByCategory] = useState({});
  const [qtyByCategory, setQtyByCategory] = useState({});

  const [createQuotation, { isLoading: isSaving }] = useCreateQuotationMutation();
  const [downloadInvoice] = useLazyDownloadQuotationInvoiceQuery();

  const setSelectedForCategory = (cid, selected) => {
    setSelectedIdByCategory((p) => ({ ...p, [cid]: selected?.value || null }));
    setSelectedOptionByCategory((p) => ({ ...p, [cid]: selected || null }));
    setQtyByCategory((p) => ({ ...p, [cid]: Number(p[cid] || 1) }));
  };

  const processorGenId = useMemo(() => {
    const opt = selectedOptionByCategory[PROCESSOR_CAT_ID];
    return Number(opt?.product?.product_generation_id) || null;
  }, [selectedOptionByCategory]);

  const motherboardRamId = useMemo(() => {
    const opt = selectedOptionByCategory[MOTHERBOARD_CAT_ID];
    return Number(opt?.product?.product_ram_id) || null;
  }, [selectedOptionByCategory]);

  const handleQtyChange = (cid, value) => {
    const n = Number(value);
    setQtyByCategory((p) => ({ ...p, [cid]: n > 0 ? n : 1 }));
  };

  const rows = useMemo(() => {
    return categoryList.map((cat, i) => {
      const cid = Number(cat.category_id);
      const opt = selectedOptionByCategory[cid];
      const price = Number(opt?.product?.product_sale_price || 0);
      const qty = Number(qtyByCategory[cid] || 1);
      return {
        index: i + 1,
        category_id: cid,
        category_name: cat.category_name,
        selectedId: selectedIdByCategory[cid],
        product: opt?.product || null,
        price,
        qty,
        total: price * qty,
      };
    });
  }, [categoryList, selectedOptionByCategory, qtyByCategory, selectedIdByCategory]);

  const selectedRows = useMemo(() => rows.filter((r) => !!r.product), [rows]);

  const grandTotal = useMemo(
    () => selectedRows.reduce((s, r) => s + Number(r.total || 0), 0),
    [selectedRows]
  );

  const canSave = selectedRows.length > 0 && !isSaving;

  const handleSaveQuotation = async () => {
    try {
      const today = new Date();
      const expiry = new Date();
      expiry.setDate(today.getDate() + 7);

      const payload = {
        business_id: businessId,
        customer_id: customerId,

        create_date: toDateOnly(today),
        expire_date: toDateOnly(expiry),

        grand_total: Number(grandTotal || 0),
        total_items: Number(selectedRows.length || 0),
        quotation_status: 1,

        quotation_items: selectedRows.map((r) => ({
          category_id: Number(r.category_id),
          product_id: Number(r.product.product_id),
          product_name: r.product.product_name,
          price: Number(r.price || 0),
          qty: Number(r.qty || 1),
          total: Number(r.total || 0),
        })),
      };

      // ✅ 1) create quotation
      const saved = await createQuotation(payload).unwrap();

      const quotationId =
        saved?.data?.quotation_id ||
        saved?.data?.quotationId ||
        saved?.data?.id ||
        saved?.quotation_id ||
        saved?.id;

      if (!quotationId) {
        console.log("❌ quotation id not found in response:", saved);
        return;
      }

      // ✅ 2) download invoice PDF
      let pdfBlob;
      try {
        pdfBlob = await downloadInvoice(quotationId).unwrap();
      } catch (err) {
        console.log("❌ invoice download error:", err);
        return;
      }

      if (!(pdfBlob instanceof Blob)) {
        console.log("❌ invoice API did not return Blob:", pdfBlob);
        return;
      }

      downloadBlob(pdfBlob, `Quotation-${quotationId}.pdf`);

      // ✅ reset
      setSelectedIdByCategory({});
      setSelectedOptionByCategory({});
      setQtyByCategory({});
    } catch (e) {
      console.log("❌ save quotation error", e);
    }
  };

  return (
    <div className="table-responsive">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
        <div>
          <div className="fw-bold">Build Quotation</div>
          <div className="text-muted small">Select items and save quotation</div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="text-end">
            <div className="text-muted small">Grand Total</div>
            <div className="fw-bold">₹{money(grandTotal)}</div>
          </div>

          <Button color="primary" onClick={handleSaveQuotation} disabled={!canSave} className="px-3">
            {isSaving ? "Saving..." : "Save Quotation"}
          </Button>
        </div>
      </div>

      <table className="table table-hover align-middle">
        <thead className="table-light text-uppercase small">
          <tr>
            <th>#</th>
            <th>Category</th>
            <th>Product</th>
            <th className="text-end">Price</th>
            <th className="text-end">Qty</th>
            <th className="text-end">Total</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <CategoryRow
              key={row.category_id}
              row={row}
              onSelect={(sel) => {
                if (row.category_id === PROCESSOR_CAT_ID) {
                  setSelectedForCategory(PROCESSOR_CAT_ID, sel);
                  setSelectedForCategory(MOTHERBOARD_CAT_ID, null);
                  setSelectedForCategory(RAM_CAT_ID, null);
                  setQtyByCategory((p) => ({ ...p, [MOTHERBOARD_CAT_ID]: 1, [RAM_CAT_ID]: 1 }));
                } else if (row.category_id === MOTHERBOARD_CAT_ID) {
                  setSelectedForCategory(MOTHERBOARD_CAT_ID, sel);
                  setSelectedForCategory(RAM_CAT_ID, null);
                  setQtyByCategory((p) => ({ ...p, [RAM_CAT_ID]: 1 }));
                } else {
                  setSelectedForCategory(row.category_id, sel);
                }
              }}
              onQtyChange={handleQtyChange}
              processorGenId={processorGenId}
              motherboardRamId={motherboardRamId}
            />
          ))}

          <tr className="table-light">
            <td colSpan="5" className="text-end fw-bold">
              Grand Total
            </td>
            <td className="text-end fw-bold">₹{money(grandTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CategorySelectGrid;

/* ===========================
   Row Component
=========================== */
const CategoryRow = ({ row, onSelect, onQtyChange, processorGenId, motherboardRamId }) => {
  const cid = row.category_id;
  const { data, isLoading } = useGetProductsForQuotationQuery({ category_id: cid }, { skip: !cid });

  const parseSupportGens = (v) => {
    if (!v) return [];
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed.map(Number) : [];
    } catch {
      return String(v).split(",").map((x) => Number(x.trim()));
    }
  };

  const products = useMemo(() => {
    let list = data?.data || [];

    if (cid === MOTHERBOARD_CAT_ID) {
      if (!processorGenId) return [];
      list = list.filter((p) =>
        parseSupportGens(p.product_support_generations).includes(Number(processorGenId))
      );
    }

    if (cid === RAM_CAT_ID) {
      if (!motherboardRamId) return [];
      list = list.filter((p) => Number(p.product_ram_id) === Number(motherboardRamId));
    }

    return list;
  }, [data, cid, processorGenId, motherboardRamId]);

  const options = useMemo(
    () =>
      products.map((p) => ({
        value: p.product_id,
        label: `${p.product_name} • ₹${money(p.product_sale_price)}`,
        product: p,
      })),
    [products]
  );

  const selected = useMemo(
    () => options.find((o) => Number(o.value) === Number(row.selectedId)) || null,
    [options, row.selectedId]
  );

  return (
    <tr>
      <td>{row.index}</td>
      <td className="fw-semibold">{row.category_name}</td>

      <td style={{ minWidth: 240 }}>
        {isLoading ? (
          <span className="text-muted small">Loading…</span>
        ) : (
          <Select
            styles={selectStyles}
            options={options}
            value={selected}
            onChange={onSelect}
            isClearable
            isDisabled={
              (cid === MOTHERBOARD_CAT_ID && !processorGenId) ||
              (cid === RAM_CAT_ID && !motherboardRamId)
            }
          />
        )}
      </td>

      <td className="text-end">₹{money(row.price)}</td>

      <td className="text-end">
        <Input
          type="number"
          min={1}
          value={row.qty}
          disabled={!row.price}
          onChange={(e) => onQtyChange(cid, e.target.value)}
          className="form-control form-control-sm w-auto d-inline-block text-end px-1"
        />
      </td>

      <td className="text-end fw-bold">₹{money(row.total)}</td>
    </tr>
  );
};
