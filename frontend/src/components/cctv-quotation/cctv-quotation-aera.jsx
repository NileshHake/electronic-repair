/* =========================
   CCTVQuotationArea.jsx
   ✅ FIX: NVR list me Power Supply (19) remove
   ✅ FIX: Only ORDER manage (NVR -> Camera -> POE etc.)
========================= */

import React, { useMemo, useState } from "react";
import { Button } from "reactstrap";
import { useGetCategoryListQuery } from "@/redux/features/categoryApi";
import CCTVCategorySelectGrid from "./CategorySelectGrid";

export const CCTV_MAIN_ID = 13;

// 1) ONLY CAMERA
export const SINGLE_CAMERA = [16, 26];

// 2) DVR SETUP
export const DVR_CAMERA = [
  15, // DVR
  17, // Dome
  18, // Bullet
  19, // Power Supply (DVR)
  20, // HDD
  21, // BNC
  22, // DC
  23, // Screen (Optional)
  24, // Rack (Optional)
  
  31, // PVC
];

// 3) NVR SETUP (✅ NO Power Supply here)
export const NVR_CAMERA = [
  14, // NVR
  27, // IP Dome
  28, // IP Bullet
  29, // POE Switch (NVR power)
  20, // HDD
  23, // Screen (Optional)
  24, // Rack (Optional)
  31, // PVC (Optional)
  
];

const getCctvIdsByType = (quoteType) => {
  if (Number(quoteType) === 1) return SINGLE_CAMERA;
  if (Number(quoteType) === 2) return DVR_CAMERA;
  if (Number(quoteType) === 3) return NVR_CAMERA;
  return [];
};

// ✅ ORDER define here
const getOrderByType = (quoteType) => {
  const t = Number(quoteType);

  // ONLY CAMERA: Camera -> Micro SD
  if (t === 1) return [16, 26];

  // DVR: DVR -> Cameras -> Power -> HDD -> BNC/DC -> Screen/Rack -> Cable/PVC
  if (t === 2) return [15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 31];

  // NVR: NVR -> IP Cameras -> POE -> HDD -> Screen/Rack -> PVC -> Cable IP
  if (t === 3) return [14, 27, 28, 29, 20, 23, 24, 31,  ];

  return [];
};

const CCTVQuotationArea = ({ businessId = null, customerId = null }) => {
  const { data: categories, isLoading, isError } = useGetCategoryListQuery();
  const [quoteType, setQuoteType] = useState(1);

  const cctvChildCategories = useMemo(() => {
    const list = Array.isArray(categories) ? categories : categories?.data || [];
    return list.filter((c) => Number(c.category_main_id) === CCTV_MAIN_ID);
  }, [categories]);

  const filteredCategoryList = useMemo(() => {
    const allowedIds = getCctvIdsByType(quoteType);
    const order = getOrderByType(quoteType);

    const filtered = (cctvChildCategories || []).filter((c) =>
      allowedIds.includes(Number(c.category_id))
    );

    // ✅ sort by custom order
    const orderIndex = new Map(order.map((id, idx) => [Number(id), idx]));
    filtered.sort((a, b) => {
      const ai = orderIndex.has(Number(a.category_id))
        ? orderIndex.get(Number(a.category_id))
        : 9999;
      const bi = orderIndex.has(Number(b.category_id))
        ? orderIndex.get(Number(b.category_id))
        : 9999;
      return ai - bi;
    });

    return filtered;
  }, [cctvChildCategories, quoteType]);

  if (isLoading) return <div className="container mt-4">Loading categories...</div>;
  if (isError) return <div className="container mt-4 text-danger">Failed to load categories</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
        <h5 className="fw-bold mb-0">CCTV Quotation</h5>

        <div className="d-flex gap-2 flex-wrap">
          <Button
            color={quoteType === 1 ? "primary" : "secondary"}
            onClick={() => setQuoteType(1)}
          >
            ONLY CAMERA
          </Button>

          <Button
            color={quoteType === 2 ? "primary" : "secondary"}
            onClick={() => setQuoteType(2)}
          >
            DVR SETUP
          </Button>

          <Button
            color={quoteType === 3 ? "primary" : "secondary"}
            onClick={() => setQuoteType(3)}
          >
            NVR SETUP (IP CAMERA)
          </Button>
        </div>
      </div>

      <CCTVCategorySelectGrid
        quoteType={quoteType}
        categoryList={filteredCategoryList}
        businessId={businessId}
        customerId={customerId}
      />
    </div>
  );
};

export default CCTVQuotationArea;
