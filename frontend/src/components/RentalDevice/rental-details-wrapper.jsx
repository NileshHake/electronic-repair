import React from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const RentalDetailsWrapper = ({ deviceItem }) => {
  const router = useRouter();

  const {
    rental_device_id,
    device_name,
    device_description,
    price_per_day,

    device_category_name,
    device_sub_category_name,
    device_brand_name,
  } = deviceItem || {};

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

    // ✅ go to device details / checkout
    router.push(`/rental-devices/${rental_device_id}`);
  };

  return (
    <div className="tp-product-details-wrapper">
      {/* Category / Sub category / Brand */}
      <span className="text-muted d-block mb-1">
        {device_category_name || "-"}{" "}
        {device_sub_category_name ? ` / ${device_sub_category_name}` : ""}
      </span>

      <span className="text-muted d-block mb-10">
        Brand: <b>{device_brand_name || "-"}</b>
      </span>

      <h3 className="mb-10">{device_name || "No Name"}</h3>

      <div className="product-description mb-20">
        <p className="text-muted">
          {device_description || "No description"}
        </p>
      </div>

      <div className="tp-product-details-price-wrapper mb-20">
        <span className="new-price">
          ₹{Number(price_per_day || 0).toFixed(2)} <small className="text-muted">/ day</small>
        </span>
      </div>
      <button
        onClick={handleRentNow}
        className="tp-product-details-add-to-cart-btn w-100 mb-10"
      >
        Rent Now
      </button>

      <button
        onClick={() => router.push(`/rental-devices/${rental_device_id}`)}
        className="tp-product-details-buy-now-btn w-100"
      >
        View Details
      </button>
    </div>
  );
};

export default RentalDetailsWrapper;