import React, { useMemo } from "react";
import Image from "next/image";
import defaultIMG from "../../../public/assets/img/istockphoto-1055079680-612x612.jpg";
import { api } from "../../../config";

const safeParseImages = (v) => {
  try {
    if (!v) return [];
    const parsed = typeof v === "string" ? JSON.parse(v) : v;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const money = (v) => `₹${Number(v || 0).toFixed(2)}`;

const RentalCheckoutDeviceInfo = ({ device }) => {
  const images = useMemo(() => safeParseImages(device?.images), [device?.images]);

  const mainImg = images?.length
    ? `${api.IMG_URL}/rental_device_images/${images[0]}`
    : defaultIMG;

  const perDay = Number(device?.price_per_day ?? device?.base_rent_per_day ?? 0);
  const perWeek = Number(device?.base_rent_per_week ?? 0);
  const perMonth = Number(device?.base_rent_per_month ?? 0);

  return (
    <div className="card shadow-sm p-3">
      <h3 className="mb-3 text-center   ">Device Info</h3>

      <div style={{ position: "relative", width: "100%", height: 220 }}>
        <Image
          src={mainImg}
          alt={device?.device_name || "Device"}
          fill
          style={{ objectFit: "cover", borderRadius: 10 }}
          unoptimized
        />
      </div>

      <div className="mt-3">
        <div className="text-muted small">
          {device?.device_category_name || device?.device_category || "-"}
          {device?.device_sub_category_name ? ` / ${device?.device_sub_category_name}` : ""}
        </div>

        <h6 className="mt-1 mb-2">{device?.device_name || "-"}</h6>

        <div className="text-muted small mb-3">
          Brand:{" "}
          <b className="text-dark">{device?.device_brand_name || device?.device_brand || "-"}</b>
        </div>

        {/* ✅ Day/Week/Month prices */}
        <div className="border rounded p-2">
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted">Per Day</span>
            <b>{money(perDay)}</b>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted">Per Week</span>
            <b>{money(perWeek)}</b>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">Per Month</span>
            <b>{money(perMonth)}</b>
          </div>
        </div>

        {device?.security_deposit ? (
          <div className="d-flex justify-content-between border rounded p-2 mt-2">
            <span className="text-muted">Deposit</span>
            <b>{money(device?.security_deposit)}</b>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RentalCheckoutDeviceInfo;