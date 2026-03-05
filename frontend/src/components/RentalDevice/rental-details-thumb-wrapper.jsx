import React, { useEffect, useMemo } from "react";
import Image from "next/image";
import { api } from "../../../config";
import defaultIMG from "../../../public/assets/img/istockphoto-1055079680-612x612.jpg";

const safeParseImages = (v) => {
  try {
    if (!v) return [];
    const parsed = typeof v === "string" ? JSON.parse(v) : v;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const RentalDetailsThumbWrapper = ({
  deviceItem,
  activeImg,
  handleImageActive,
  imgWidth = 416,
  imgHeight = 480,
}) => {
  const images = useMemo(
    () => safeParseImages(deviceItem?.images),
    [deviceItem]
  );

  // ✅ set first image automatically
  useEffect(() => {
    if (images.length && !activeImg) {
      handleImageActive(images[0]);
    }
  }, [images, activeImg, handleImageActive]);

  // ✅ main image src
  const mainImageSrc =
    activeImg && images.length
      ? `${api.IMG_URL}/rental_device_images/${activeImg}`
      : defaultIMG;

  return (
    <div className="tp-product-details-thumb-wrapper d-flex flex-column flex-sm-row">
      {/* Thumbnails */}
      {images.length > 0 && (
        <nav className="me-3">
          <div className="nav nav-tabs flex-sm-column">
            {images.map((imgItem, i) => (
              <button
                key={i}
                type="button"
                className={`nav-link p-1 mb-2 border ${
                  imgItem === activeImg ? "active border-primary" : ""
                }`}
                onClick={() => handleImageActive(imgItem)}
              >
                <Image
                  src={`${api.IMG_URL}/rental_device_images/${imgItem}`}
                  alt={`thumb-${i}`}
                  width={78}
                  height={100}
                  style={{ objectFit: "cover", borderRadius: "4px" }}
                />
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Main Image */}
      <div className="tp-product-details-main-thumb position-relative">
        <Image
          src={mainImageSrc}
          alt="rental-device"
          width={imgWidth}
          height={imgHeight}
          style={{ objectFit: "contain", width: "300px", height: "400px" }}
        />
      </div>
    </div>
  );
};

export default RentalDetailsThumbWrapper;