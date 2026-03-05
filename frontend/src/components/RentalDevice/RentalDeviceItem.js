import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { openRentalDeviceModal } from "@/redux/features/rentalDeviceModalSlice";
// internal
import { Cart, QuickView } from "@/svg";
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

const shortText = (txt = "", limit = 80) => {
    const t = String(txt || "").trim();
    if (!t) return "No description";
    return t.length > limit ? t.slice(0, limit) + "..." : t;
};

const RentalDeviceItem = ({ device }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const {
        rental_device_id,
        device_name,
        device_description,
        price_per_day,
        images,
        device_brand_name,
        device_category_name,
        device_sub_category_name,
    } = device || {};

    const rowimg = useMemo(() => safeParseImages(images), [images]);

    // ✅ build image src with fallback
    const imgSrc = rowimg?.length
        ? `${api.IMG_URL}/rental_device_images/${rowimg[0]}`
        : defaultIMG;

    const handleRentNow = () => {
        const cookie = Cookies.get("userInfo");
        if (!cookie) {
            router.replace("/login");
            return;
        }

        let userInfo;
        try {
            userInfo = JSON.parse(cookie);
        } catch {
            router.replace("/login");
            return;
        }

        if (!userInfo?.user?.user_phone_number) {
            router.replace("/profile#nav-information");
            return;
        }

        router.push(`/rental-devices/${rental_device_id}`);
    };

    return (
        <div className="mb-25 tp-product-item transition-3 rental-card">
            {/* IMAGE */}
            <div className="tp-product-thumb p-relative fix rental-thumb">
                <Image
                    src={imgSrc}
                    alt={device_name || "Rental Device"}
                    width={300}
                    height={670}
                    style={{ width: "100%", height: "340px", objectFit: "cover" }}
                    onError={(e) => {
                        // ✅ if remote image fails, show fallback (works for <img>, next/image ignore)
                        // if you face remote error, use unoptimized or allow domain in next.config
                    }}
                    unoptimized
                />

                {/* Gradient overlay for premium look */}
                <div className="rental-overlay" />

                {/* BADGE */}
                <div className="tp-product-badge">
                    <span className="product-hot">Rent</span>
                </div>

                {/* ACTIONS */}
                <div className="tp-product-action">
                    <div className="tp-product-action-item d-flex flex-column">
                        <button onClick={handleRentNow} className="tp-product-action-btn">
                            <i className="fa-solid fa-cart-shopping"></i>
                            <span className="tp-product-tooltip">Rent Now</span>
                        </button>


                    </div>
                </div>

                {/* Price chip on image */}
                <div className="rental-price-chip">
                    ₹{Number(price_per_day || 0).toFixed(0)} <span>/day</span>
                </div>
            </div>

            {/* CONTENT */}
            <div className="tp-product-content">
                <div className="tp-product-category">
                    <span>
                        {device_category_name || "Rental Device"}
                        {device_sub_category_name ? ` / ${device_sub_category_name}` : ""}
                    </span>
                </div>

                <h3 className="tp-product-title">{device_name || "No Name"}</h3>

                {device_brand_name && (
                    <div className="small text-muted mb-1">
                        Brand: <b className="text-dark">{device_brand_name}</b>
                    </div>
                )}

                <p className="text-muted small mb-2">{shortText(device_description, 85)}</p>


            </div>

            {/* ✅ Scoped CSS */}
            <style jsx>{` 
        .rental-card {
          border-radius: 14px;
          overflow: hidden;
        }

        .rental-thumb {
          border-radius: 14px 14px 0 0;
        }

        .rental-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.55),
            rgba(0, 0, 0, 0.05),
            rgba(0, 0, 0, 0)
          );
          opacity: 0.9;
          pointer-events: none;
        }

        .rental-price-chip {
          position: absolute;
          left: 12px;
          bottom: 12px;
          background: rgba(255, 255, 255, 0.92);
          padding: 6px 10px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .rental-price-chip span {
          font-weight: 500;
          font-size: 12px;
          color: #666;
        }
      `}</style>
        </div>
    );
};

export default RentalDeviceItem;