import React, { useMemo, useState, useEffect } from "react";
import { Input, Button } from "reactstrap";
import Select from "react-select";
import { useGetProductsForQuotationQuery } from "@/redux/features/productApi";
import {
  useCreateQuotationMutation,
  useLazyDownloadQuotationInvoiceQuery,
} from "@/redux/features/quotationApi";

import QuotationPreviewModal from "./QuotationPreviewModal";
import Link from "next/link";

/* =========================
   CCTV Category IDs (match your DB)
========================= */
const CAT_NVR = 14;
const CAT_DVR = 15;
const CAT_SINGLE_CAMERA = 16;

const CAT_DOME = 17;
const CAT_BULLET = 18;

const CAT_POWER_SUPPLY = 19; // ✅ ONLY DVR
const CAT_STORAGE_CCTV_HDD = 20;

const CAT_BNC = 21;
const CAT_DC = 22;

const CAT_SCREEN = 23;
const CAT_RACK = 24;

const CAT_CABLE = 25; // not used now
const CAT_MICRO_SD = 26;

const CAT_IP_DOME = 27;
const CAT_IP_BULLET = 28;

const CAT_POE = 29; // ✅ ONLY NVR

const CAT_PVC = 31;
const CAT_CABLE_IP = 32; // not used now

/* =========================
   ✅ NEW Cable Variables (Indoor / Outdoor)
========================= */
const INDOOR_CABLE_PER_M = 50;
const OUTDOOR_CABLE_PER_M = 70;

/* =========================
   Helpers
========================= */
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

const isType1 = (quoteType) => Number(quoteType) === 1; // ONLY CAMERA
const isType2 = (quoteType) => Number(quoteType) === 2; // DVR
const isType3 = (quoteType) => Number(quoteType) === 3; // NVR

// ✅ FIX: channel parsing (works for "4 CHANNEL", "8CH", "16", etc.)
const channelNum = (v) => {
  if (v === null || v === undefined) return null;
  const str = String(v);
  const m = str.match(/\d+/); // first number
  return m ? Number(m[0]) : null;
};

const isCameraCategory = (cid) =>
  cid === CAT_SINGLE_CAMERA ||
  cid === CAT_DOME ||
  cid === CAT_BULLET ||
  cid === CAT_IP_DOME ||
  cid === CAT_IP_BULLET;

/* =========================
   MAIN COMPONENT
========================= */
const CCTVCategorySelectGrid = ({
  categoryList = [],
  businessId = null,
  customerId = null,
  quoteType = 1,
}) => {
  const [selectedIdByCategory, setSelectedIdByCategory] = useState({});
  const [selectedOptionByCategory, setSelectedOptionByCategory] = useState({});
  const [qtyByCategory, setQtyByCategory] = useState({});
const [customerName, setCustomerName] = useState("");

  // ✅ manual override flags
  const [manualQty, setManualQty] = useState({}); // { [cid]: true/false }

  // ✅ NEW: indoor/outdoor cable meters
  const [indoorCableMeters, setIndoorCableMeters] = useState(0);
  const [outdoorCableMeters, setOutdoorCableMeters] = useState(0);

  // ✅ Preview modal
  const [previewOpen, setPreviewOpen] = useState(false);

  const [createQuotation, { isLoading: isSaving }] = useCreateQuotationMutation();
  const [downloadInvoice] = useLazyDownloadQuotationInvoiceQuery();

  // ✅ Reset when quoteType changes
  useEffect(() => {
    setSelectedIdByCategory({});
    setSelectedOptionByCategory({});
    setQtyByCategory({});
    setManualQty({});
    setIndoorCableMeters(0);
    setOutdoorCableMeters(0);
    setPreviewOpen(false);
  }, [quoteType]);

  /* ✅ Select handler:
     - N/A or clear => qty 0 and no rules apply
     - Camera first select => default qty 1
     - Other product selected => default qty 1
  */
  const setSelectedForCategory = (cid, selected) => {
    const nextId = selected?.value ?? null;

    setSelectedIdByCategory((p) => ({ ...p, [cid]: nextId }));
    setSelectedOptionByCategory((p) => ({ ...p, [cid]: selected ?? null }));

    setQtyByCategory((p) => {
      if (!selected) return { ...p, [cid]: 0 };

      const wasSelected = !!p[cid] && Number(p[cid]) > 0;

      if (isCameraCategory(cid) && !wasSelected) {
        return { ...p, [cid]: 1 };
      }

      const cur = Number(p[cid] || 0);
      return { ...p, [cid]: cur > 0 ? cur : 1 };
    });

    if (!selected) {
      setManualQty((p) => {
        const next = { ...p };
        delete next[cid];
        return next;
      });
    }
  };

  /* =========================
     ✅ CLEAR DEPENDENTS (DVR / NVR)
========================= */
  const clearDvrDependents = () => {
    setSelectedForCategory(CAT_POWER_SUPPLY, null);
    setSelectedForCategory(CAT_DOME, null);
    setSelectedForCategory(CAT_BULLET, null);
    setSelectedForCategory(CAT_BNC, null);
    setSelectedForCategory(CAT_DC, null);
    setSelectedForCategory(CAT_PVC, null);

    setManualQty((m) => {
      const next = { ...m };
      delete next[CAT_POWER_SUPPLY];
      delete next[CAT_DOME];
      delete next[CAT_BULLET];
      delete next[CAT_BNC];
      delete next[CAT_DC];
      delete next[CAT_PVC];
      return next;
    });

    setQtyByCategory((p) => ({
      ...p,
      [CAT_POWER_SUPPLY]: 0,
      [CAT_DOME]: 0,
      [CAT_BULLET]: 0,
      [CAT_BNC]: 0,
      [CAT_DC]: 0,
      [CAT_PVC]: 0,
    }));
  };

  const clearNvrDependents = () => {
    setSelectedForCategory(CAT_POE, null);
    setSelectedForCategory(CAT_IP_DOME, null);
    setSelectedForCategory(CAT_IP_BULLET, null);
    setSelectedForCategory(CAT_PVC, null);

    setManualQty((m) => {
      const next = { ...m };
      delete next[CAT_POE];
      delete next[CAT_IP_DOME];
      delete next[CAT_IP_BULLET];
      delete next[CAT_PVC];
      return next;
    });

    setQtyByCategory((p) => ({
      ...p,
      [CAT_POE]: 0,
      [CAT_IP_DOME]: 0,
      [CAT_IP_BULLET]: 0,
      [CAT_PVC]: 0,
    }));
  };

  /* =========================
     DVR / NVR Channel
  ========================= */
  const selectedDvrChannel = useMemo(() => {
    const p = selectedOptionByCategory[CAT_DVR]?.product;
    return channelNum(p?.product_dvr_or_nvr_channel);
  }, [selectedOptionByCategory]);

  const selectedNvrChannel = useMemo(() => {
    const p = selectedOptionByCategory[CAT_NVR]?.product;
    return channelNum(p?.product_dvr_or_nvr_channel);
  }, [selectedOptionByCategory]);

  /* =========================
     Camera Count
  ========================= */
  const cameraCount = useMemo(() => {
    if (isType1(quoteType)) {
      const hasCam = !!selectedOptionByCategory[CAT_SINGLE_CAMERA];
      if (!hasCam) return 0;
      return Number(qtyByCategory[CAT_SINGLE_CAMERA] || 0);
    }

    if (isType2(quoteType)) {
      const domeQty = selectedOptionByCategory[CAT_DOME]
        ? Number(qtyByCategory[CAT_DOME] || 0)
        : 0;
      const bulletQty = selectedOptionByCategory[CAT_BULLET]
        ? Number(qtyByCategory[CAT_BULLET] || 0)
        : 0;
      return domeQty + bulletQty;
    }

    if (isType3(quoteType)) {
      const ipDomeQty = selectedOptionByCategory[CAT_IP_DOME]
        ? Number(qtyByCategory[CAT_IP_DOME] || 0)
        : 0;
      const ipBulletQty = selectedOptionByCategory[CAT_IP_BULLET]
        ? Number(qtyByCategory[CAT_IP_BULLET] || 0)
        : 0;
      return ipDomeQty + ipBulletQty;
    }

    return 0;
  }, [quoteType, selectedOptionByCategory, qtyByCategory]);

  /* ======================================================
     ✅ Auto adjust camera qty to channel (DVR)
     (only if DVR exists; if DVR is N/A -> channel null -> effect won't run)
  ====================================================== */
  useEffect(() => {
    if (!isType2(quoteType) || !selectedDvrChannel) return;

    const ch = Number(selectedDvrChannel);
    const domeSelected = !!selectedOptionByCategory[CAT_DOME];
    const bulletSelected = !!selectedOptionByCategory[CAT_BULLET];
    if (!domeSelected && !bulletSelected) return;

    const domeQty = Number(qtyByCategory[CAT_DOME] || 0);
    const bulletQty = Number(qtyByCategory[CAT_BULLET] || 0);
    const total = domeQty + bulletQty;

    if (total < ch) {
      const add = ch - total;
      if (domeSelected) {
        setQtyByCategory((p) => ({
          ...p,
          [CAT_DOME]: Number(p[CAT_DOME] || 0) + add,
        }));
      } else {
        setQtyByCategory((p) => ({
          ...p,
          [CAT_BULLET]: Number(p[CAT_BULLET] || 0) + add,
        }));
      }
    }

    if (total > ch) {
      const newDome = Math.min(domeQty, ch);
      const remaining = Math.max(0, ch - newDome);
      setQtyByCategory((p) => ({
        ...p,
        [CAT_DOME]: newDome,
        [CAT_BULLET]: Math.min(bulletQty, remaining),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    quoteType,
    selectedDvrChannel,
    selectedOptionByCategory[CAT_DOME],
    selectedOptionByCategory[CAT_BULLET],
  ]);

  /* ======================================================
     ✅ Auto adjust camera qty to channel (NVR)
  ====================================================== */
  useEffect(() => {
    if (!isType3(quoteType) || !selectedNvrChannel) return;

    const ch = Number(selectedNvrChannel);
    const domeSelected = !!selectedOptionByCategory[CAT_IP_DOME];
    const bulletSelected = !!selectedOptionByCategory[CAT_IP_BULLET];
    if (!domeSelected && !bulletSelected) return;

    const domeQty = Number(qtyByCategory[CAT_IP_DOME] || 0);
    const bulletQty = Number(qtyByCategory[CAT_IP_BULLET] || 0);
    const total = domeQty + bulletQty;

    if (total < ch) {
      const add = ch - total;
      if (domeSelected) {
        setQtyByCategory((p) => ({
          ...p,
          [CAT_IP_DOME]: Number(p[CAT_IP_DOME] || 0) + add,
        }));
      } else {
        setQtyByCategory((p) => ({
          ...p,
          [CAT_IP_BULLET]: Number(p[CAT_IP_BULLET] || 0) + add,
        }));
      }
    }

    if (total > ch) {
      const newDome = Math.min(domeQty, ch);
      const remaining = Math.max(0, ch - newDome);
      setQtyByCategory((p) => ({
        ...p,
        [CAT_IP_DOME]: newDome,
        [CAT_IP_BULLET]: Math.min(bulletQty, remaining),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    quoteType,
    selectedNvrChannel,
    selectedOptionByCategory[CAT_IP_DOME],
    selectedOptionByCategory[CAT_IP_BULLET],
  ]);

  /* =========================
     ✅ Auto min qty SYNC (increase + decrease)
     DVR:
       - BNC = cameras*2
       - DC = cameras
       - PVC = cameras
     NVR:
       - PVC = cameras
     NOTE:
       - If manual set -> keep, but if min bigger -> raise it
       - If not manual -> always sync exactly to min
  ========================= */
  useEffect(() => {
    const qt = Number(quoteType);
    const cam = Number(cameraCount || 0);

    const syncMin = (cid, minVal) => {
      if (!selectedOptionByCategory[cid]) return;

      setQtyByCategory((p) => {
        const cur = Number(p[cid] || 0);
        const isManual = !!manualQty[cid];

        if (isManual) {
          if (cur < minVal) return { ...p, [cid]: minVal };
          return p;
        }

        if (cur === minVal) return p;
        return { ...p, [cid]: minVal };
      });
    };

    if (qt === 2) {
      const minBnc = cam * 2;
      const minDc = cam;
      const minPvc = cam;

      if (cam === 0) {
        [CAT_BNC, CAT_DC, CAT_PVC].forEach((cid) => {
          if (!selectedOptionByCategory[cid]) return;
          if (manualQty[cid]) return;
          setQtyByCategory((p) => ({ ...p, [cid]: 0 }));
        });
        return;
      }

      syncMin(CAT_BNC, minBnc);
      syncMin(CAT_DC, minDc);
      syncMin(CAT_PVC, minPvc);
    }

    if (qt === 3) {
      const minPvc = cam;

      if (cam === 0) {
        if (selectedOptionByCategory[CAT_PVC] && !manualQty[CAT_PVC]) {
          setQtyByCategory((p) => ({ ...p, [CAT_PVC]: 0 }));
        }
        return;
      }

      syncMin(CAT_PVC, minPvc);
    }
  }, [quoteType, cameraCount, selectedOptionByCategory, manualQty]);

  /* =========================
     Qty change with clamp
     - Mark manualQty[cid] = true when user changes qty
  ========================= */
  const handleQtyChange = (cid, value) => {
    const n = Number(value);

    setManualQty((p) => ({ ...p, [cid]: true }));

    setQtyByCategory((p) => {
      const qt = Number(quoteType);
      const next = Number.isFinite(n) ? n : 0;

      // DVR camera clamp
      if (qt === 2 && selectedDvrChannel) {
        const ch = Number(selectedDvrChannel);
        if (cid === CAT_DOME || cid === CAT_BULLET) {
          const otherCid = cid === CAT_DOME ? CAT_BULLET : CAT_DOME;
          const otherQty = Number(p[otherCid] || 0);

          const desired = Math.max(0, next);
          const allowed = Math.max(0, ch - otherQty);
          return { ...p, [cid]: Math.min(desired, allowed) };
        }
      }

      // NVR camera clamp
      if (qt === 3 && selectedNvrChannel) {
        const ch = Number(selectedNvrChannel);
        if (cid === CAT_IP_DOME || cid === CAT_IP_BULLET) {
          const otherCid = cid === CAT_IP_DOME ? CAT_IP_BULLET : CAT_IP_DOME;
          const otherQty = Number(p[otherCid] || 0);

          const desired = Math.max(0, next);
          const allowed = Math.max(0, ch - otherQty);
          return { ...p, [cid]: Math.min(desired, allowed) };
        }
      }

      const isCamSplit =
        cid === CAT_DOME ||
        cid === CAT_BULLET ||
        cid === CAT_IP_DOME ||
        cid === CAT_IP_BULLET;

      const fallbackMin = isCamSplit ? 0 : 1;
      return { ...p, [cid]: Math.max(fallbackMin, Math.max(0, next)) };
    });
  };

  /* =========================
     Build rows (normal categories)
  ========================= */
  const rows = useMemo(() => {
    return categoryList.map((cat, i) => {
      const cid = Number(cat.category_id);
      const opt = selectedOptionByCategory[cid];
      const price = Number(opt?.product?.product_sale_price || 0);
      const qty = Number(qtyByCategory[cid] ?? (opt ? 1 : 0));

      return {
        index: i + 1,
        category_id: cid,
        category_name: cat.category_name,
        selectedId: selectedIdByCategory[cid],
        product: opt?.product || null,
        price,
        qty,
        total: price * qty,
        isStatic: false,
      };
    });
  }, [categoryList, selectedOptionByCategory, qtyByCategory, selectedIdByCategory]);

  /* =========================
     INSTALLATION (static rows)
  ========================= */
  const installationRow = useMemo(() => {
    const qt = Number(quoteType);

    if (qt === 1) {
      return {
        index: rows.length + 1,
        category_id: "INSTALL_FIXED",
        category_name: "Installation Charges",
        selectedId: "INSTALL_FIXED",
        product: {
          product_id: "INSTALL_FIXED",
          product_name: "Installation (Fixed)",
          product_sale_price: 999,
        },
        price: 999,
        qty: 1,
        total: 999,
        isStatic: true,
        staticType: "INSTALL_FIXED",
      };
    }

    if (qt === 2 || qt === 3) {
      const qty = Number(cameraCount || 0);
      return {
        index: rows.length + 1,
        category_id: "INSTALL_PER_CAMERA",
        category_name: "Camera Installation Charges",
        selectedId: "INSTALL_PER_CAMERA",
        product: {
          product_id: "INSTALL_PER_CAMERA",
          product_name: "Installation (₹400 per camera)",
          product_sale_price: 400,
        },
        price: 400,
        qty,
        total: qty * 400,
        isStatic: true,
        staticType: "INSTALL_PER_CAMERA",
      };
    }

    return null;
  }, [quoteType, cameraCount, rows.length]);

  /* =========================
     ✅ NEW: Indoor / Outdoor Cable rows
     - not staticType old cable logic
  ========================= */
  const indoorCableRow = useMemo(() => {
    const qt = Number(quoteType);
    if (qt === 1) return null;

    const qty = Number(indoorCableMeters || 0);
    const price = Number(INDOOR_CABLE_PER_M);

    return {
      index: rows.length + (installationRow ? 2 : 1),
      category_id: "INDOOR_CABLE",
      category_name: "Indoor Cable + Fitting",
      selectedId: "INDOOR_CABLE",
      product: {
        product_id: "INDOOR_CABLE",
        product_name: `Indoor Cable (₹${price}/m)`,
        product_sale_price: price,
      },
      price,
      qty,
      total: price * qty,
      isStatic: true,
      staticType: "INDOOR_CABLE",
    };
  }, [quoteType, indoorCableMeters, rows.length, installationRow]);

  const outdoorCableRow = useMemo(() => {
    const qt = Number(quoteType);
    if (qt === 1) return null;

    const qty = Number(outdoorCableMeters || 0);
    const price = Number(OUTDOOR_CABLE_PER_M);

    return {
      index: rows.length + (installationRow ? 3 : 2),
      category_id: "OUTDOOR_CABLE",
      category_name: "Outdoor Cable + Fitting",
      selectedId: "OUTDOOR_CABLE",
      product: {
        product_id: "OUTDOOR_CABLE",
        product_name: `Outdoor Cable (₹${price}/m)`,
        product_sale_price: price,
      },
      price,
      qty,
      total: price * qty,
      isStatic: true,
      staticType: "OUTDOOR_CABLE",
    };
  }, [quoteType, outdoorCableMeters, rows.length, installationRow]);

  const finalRows = useMemo(() => {
    const list = [...rows];
    if (installationRow) list.push(installationRow);
    if (indoorCableRow) list.push(indoorCableRow);
    if (outdoorCableRow) list.push(outdoorCableRow);
    return list;
  }, [rows, installationRow, indoorCableRow, outdoorCableRow]);

  const selectedRows = useMemo(
    () => finalRows.filter((r) => !!r.product && Number(r.qty || 0) > 0),
    [finalRows]
  );

  const grandTotal = useMemo(
    () => selectedRows.reduce((s, r) => s + Number(r.total || 0), 0),
    [selectedRows]
  );

  const canSave = selectedRows.length > 0 && !isSaving;

  /* =========================
     Save (+ optional download)
  ========================= */
  const handleSaveQuotation = async ({ shouldDownload = true } = {}) => {
    try {
      const today = new Date();
      const expiry = new Date();
      expiry.setDate(today.getDate() + 7);

      const payload = {
        business_id: businessId,
        customer_id: customerId,
        created_for_name: customerName,
        create_date: toDateOnly(today),
        expire_date: toDateOnly(expiry),
        grand_total: Number(grandTotal || 0),
        total_items: Number(selectedRows.length || 0),
        quotation_status: 1,

        quotation_items: selectedRows.map((r) => ({
          category_id:
            typeof r.category_id === "string" ? null : Number(r.category_id),
          product_id: r.product?.product_id,
          product_name: r.product?.product_name,
          price: Number(r.price || 0),
          qty: Number(r.qty || 0),
          total: Number(r.total || 0),
        })),
      };

      const saved = await createQuotation(payload).unwrap();

      const quotationId =
        saved?.data?.quotation_id ||
        saved?.data?.quotationId ||
        saved?.data?.id ||
        saved?.quotation_id ||
        saved?.id;

      if (!quotationId) return;

      if (shouldDownload) {
        const pdfBlob = await downloadInvoice(quotationId).unwrap();
        if (pdfBlob instanceof Blob) {
          downloadBlob(pdfBlob, `Quotation-${quotationId}.pdf`);
        }
      }

      // ✅ reset after save
      setPreviewOpen(false);
      setSelectedIdByCategory({});
      setSelectedOptionByCategory({});
      setQtyByCategory({});
      setManualQty({});
      setIndoorCableMeters(0);
      setOutdoorCableMeters(0);
    } catch (e) {
      console.log("❌ save quotation error", e);
    }
  };

  const channelForPreview =
    Number(quoteType) === 2
      ? selectedDvrChannel
      : Number(quoteType) === 3
        ? selectedNvrChannel
        : null;

  return (
    <div className="table-responsive">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
        <div>
          <div className="fw-bold">Build CCTV Quotation</div>

          <div className="text-muted small">
            Type:{" "}
            {Number(quoteType) === 1
              ? "ONLY CAMERA"
              : Number(quoteType) === 2
                ? "DVR SETUP"
                : "NVR SETUP (IP CAMERA)"}

            {Number(quoteType) !== 1 && (
              <>
                {" "}
                • Channel:{" "}
                {Number(quoteType) === 2
                  ? selectedDvrChannel || "-"
                  : selectedNvrChannel || "-"}
              </>
            )}{" "}
            • Cameras: {cameraCount}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <ul className="list-unstyled d-flex flex-wrap align-items-center gap-2 mb-0">
            <li  >
              <label>Created For</label>
              <input
              style={{height:"10px" }}
                type="text"
                className="form-control form-control-sm"
                placeholder="Customer Name"
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </li>

            <li className="btn btn-outline-secondary btn-sm px-3  mt-4"
              style={{
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: "none",
              }}>
              <Link href="/profile#nav-quotation">My Quotations  </Link>
            </li>

            <li className=" mt-4">
              <Button
                color="info"
                onClick={() => setPreviewOpen(true)}
                disabled={selectedRows.length === 0}
                className="btn-sm px-3"
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                View
              </Button>
            </li>

            <li className=" mt-4">
              <Button
                color="success"
                onClick={() => handleSaveQuotation({ shouldDownload: true })}
                disabled={!canSave}
                className="btn-sm px-3"
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                {isSaving ? "Saving..." : "Save & Download"}
              </Button>
            </li>

          </ul>
        </div>

      </div>

      <table className="table table-hover align-middle">
        <thead className="table-light text-uppercase small">
          <tr>
            <th style={{ width: 50 }}>#</th>
            <th style={{ minWidth: 190 }}>Category</th>
            <th style={{ minWidth: 320 }}>Product</th>
            <th className="text-end" style={{ width: 120 }}>
              Price
            </th>
            <th className="text-end" style={{ width: 120 }}>
              Qty
            </th>
            <th className="text-end" style={{ width: 130 }}>
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          {finalRows.map((row) => {
            // ✅ Static rows
            if (row.isStatic) {
              // Indoor Cable
              if (row.staticType === "INDOOR_CABLE") {
                return (
                  <tr key={String(row.category_id)}>
                    <td>{row.index}</td>
                    <td className="fw-semibold">{row.category_name}</td>

                    <td>
                      <span className="text-muted">
                        Indoor Cable — Price: ₹{money(row.price)}/m
                      </span>
                    </td>

                    <td className="text-end">₹{money(row.price)}</td>

                    <td className="text-end">
                      <Input
                        type="number"
                        min={0}
                        value={indoorCableMeters}
                        onChange={(e) =>
                          setIndoorCableMeters(
                            Math.max(0, Number(e.target.value || 0))
                          )
                        }
                        className="form-control form-control-sm w-auto d-inline-block text-end px-1"
                      />
                    </td>

                    <td className="text-end fw-bold">₹{money(row.total)}</td>
                  </tr>
                );
              }

              // Outdoor Cable
              if (row.staticType === "OUTDOOR_CABLE") {
                return (
                  <tr key={String(row.category_id)}>
                    <td>{row.index}</td>
                    <td className="fw-semibold">{row.category_name}</td>

                    <td>
                      <span className="text-muted">
                        Outdoor Cable — Price: ₹{money(row.price)}/m
                      </span>
                    </td>

                    <td className="text-end">₹{money(row.price)}</td>

                    <td className="text-end">
                      <Input
                        type="number"
                        min={0}
                        value={outdoorCableMeters}
                        onChange={(e) =>
                          setOutdoorCableMeters(
                            Math.max(0, Number(e.target.value || 0))
                          )
                        }
                        className="form-control form-control-sm w-auto d-inline-block text-end px-1"
                      />
                    </td>

                    <td className="text-end fw-bold">₹{money(row.total)}</td>
                  </tr>
                );
              }

              // Installation rows
              return (
                <tr key={String(row.category_id)}>
                  <td>{row.index}</td>
                  <td className="fw-semibold">{row.category_name}</td>
                  <td>
                    <span className="text-muted">{row.product?.product_name}</span>
                  </td>
                  <td className="text-end">₹{money(row.price)}</td>
                  <td className="text-end">
                    <Input
                      type="number"
                      value={row.qty}
                      disabled
                      className="form-control form-control-sm w-auto d-inline-block text-end px-1"
                    />
                  </td>
                  <td className="text-end fw-bold">₹{money(row.total)}</td>
                </tr>
              );
            }

            // ✅ Normal rows
            return (
              <CategoryRow
                key={row.category_id}
                row={row}
                quoteType={quoteType}
                cameraCount={cameraCount}
                selectedDvrChannel={selectedDvrChannel}
                selectedNvrChannel={selectedNvrChannel}
                onSelect={(sel) => {
                  const rcid = Number(row.category_id);

                  // ✅ Handle N/A option
                  const safeSel =
                    sel?.value === "NA" || !sel ? null : sel;

                  // DVR changed
                  if (rcid === CAT_DVR) {
                    setSelectedForCategory(CAT_DVR, safeSel);

                    // ✅ DVR is N/A -> remove all conditions + clear dependents
                    if (!safeSel) {
                      clearDvrDependents();
                      return;
                    }

                    // ✅ DVR selected -> reset dependents
                    clearDvrDependents();
                    return;
                  }

                  // NVR changed
                  if (rcid === CAT_NVR) {
                    setSelectedForCategory(CAT_NVR, safeSel);

                    // ✅ NVR is N/A -> remove all conditions + clear dependents
                    if (!safeSel) {
                      clearNvrDependents();
                      return;
                    }

                    // ✅ NVR selected -> reset dependents
                    clearNvrDependents();
                    return;
                  }

                  setSelectedForCategory(rcid, safeSel);
                }}
                onQtyChange={handleQtyChange}
              />
            );
          })}

          <tr className="table-light">
            <td colSpan="5" className="text-end fw-bold">
              Grand Total
            </td>
            <td className="text-end fw-bold">₹{money(grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      {/* ✅ Preview Modal */}
      {previewOpen && (
        <QuotationPreviewModal
          isOpen={previewOpen}
          toggle={() => setPreviewOpen(false)}
          quoteType={quoteType}
          channel={channelForPreview}
          cameraCount={cameraCount}
          selectedRows={selectedRows}
          grandTotal={grandTotal}
          saving={isSaving}
          onSaveOnly={() => handleSaveQuotation({ shouldDownload: false })}
          onSaveAndDownload={() => handleSaveQuotation({ shouldDownload: true })}
        />
      )}
    </div>
  );
};

export default CCTVCategorySelectGrid;

/* =========================
   CategoryRow
   ✅ Power Supply / POE filtering uses channelNum()
   ✅ Adds N/A option in every select
========================= */
const CategoryRow = ({
  row,
  quoteType,
  cameraCount,
  selectedDvrChannel,
  selectedNvrChannel,
  onSelect,
  onQtyChange,
}) => {
  const cid = Number(row.category_id);

  const { data, isLoading } = useGetProductsForQuotationQuery(
    { category_id: cid },
    { skip: !cid }
  );

  const products = useMemo(() => {
    let list = data?.data || [];

    // ✅ DVR: power supply must match DVR channel
    if (Number(quoteType) === 2 && cid === CAT_POWER_SUPPLY) {
      if (!selectedDvrChannel) return [];
      return list.filter(
        (p) => channelNum(p.product_dvr_or_nvr_channel) === Number(selectedDvrChannel)
      );
    }

    // ✅ NVR: POE must match NVR channel
    if (Number(quoteType) === 3 && cid === CAT_POE) {
      if (!selectedNvrChannel) return [];
      return list.filter(
        (p) => channelNum(p.product_dvr_or_nvr_channel) === Number(selectedNvrChannel)
      );
    }

    return list;
  }, [data, quoteType, cid, selectedDvrChannel, selectedNvrChannel]);

  const options = useMemo(() => {
    const normal = products.map((p) => ({
      value: p.product_id,
      label: `${p.product_name} • ₹${money(p.product_sale_price)}`,
      product: p,
    }));

    // ✅ Add N/A at top
    return [{ value: "NA", label: "N/A" }, ...normal];
  }, [products]);

  const selected = useMemo(() => {
    // if no selection -> show N/A
    if (!row.selectedId) return options[0] || null;

    return (
      options.find((o) => String(o.value) === String(row.selectedId)) ||
      null
    );
  }, [options, row.selectedId]);

  const minQty = useMemo(() => {
    const qt = Number(quoteType);
    const cam = Number(cameraCount || 0);

    // allow 0 for camera split
    if (qt === 2 && (cid === CAT_DOME || cid === CAT_BULLET)) return 0;
    if (qt === 3 && (cid === CAT_IP_DOME || cid === CAT_IP_BULLET)) return 0;

    // min rules
    if (qt === 2) {
      if (cid === CAT_BNC) return Math.max(1, cam * 2);
      if (cid === CAT_DC) return Math.max(1, cam);
      if (cid === CAT_PVC) return Math.max(1, cam);
    }
    if (qt === 3) {
      if (cid === CAT_PVC) return Math.max(1, cam);
    }

    return 1;
  }, [quoteType, cid, cameraCount]);

  const disabledSelect = useMemo(() => {
    // disable PS until DVR selected
    if (Number(quoteType) === 2 && cid === CAT_POWER_SUPPLY) return !selectedDvrChannel;

    // disable POE until NVR selected
    if (Number(quoteType) === 3 && cid === CAT_POE) return !selectedNvrChannel;

    return false;
  }, [quoteType, cid, selectedDvrChannel, selectedNvrChannel]);

  return (
    <tr>
      <td>{row.index}</td>
      <td className="fw-semibold">{row.category_name}</td>

      <td style={{ minWidth: 260 }}>
        {isLoading ? (
          <span className="text-muted small">Loading…</span>
        ) : (
          <Select
            styles={selectStyles}
            options={options}
            value={selected}
            onChange={onSelect}
            isClearable={false}
            isDisabled={disabledSelect}
            placeholder="Select"
          />
        )}
      </td>

      <td className="text-end">₹{money(row.price)}</td>

      <td className="text-end">
        <Input
          type="number"
          min={0}
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
