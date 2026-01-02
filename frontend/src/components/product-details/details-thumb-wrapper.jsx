import React, { useEffect, useState } from "react";
import Image from "next/image"; 
import { api } from "../../../config";

const DetailsThumbWrapper = ({
  productItem,
  activeImg,
  handleImageActive,
  imgWidth = 416,
  imgHeight = 480,
  videoId = false,
  status
}) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const images = JSON.parse(productItem?.product_image || "[]");

  useEffect(() => {
    if (images.length && !activeImg) handleImageActive(images[0]);
  }, [images]);

  return (
    <>
      <div className="tp-product-details-thumb-wrapper d-flex flex-column flex-sm-row">
        {/* Thumbnails */}
        <nav className="me-3">
          <div className="nav nav-tabs flex-sm-column">
            {images.map((imgItem, i) => (
              <button
                key={i}
                className={`nav-link p-1 mb-2 border ${
                  imgItem === activeImg ? "active border-primary" : ""
                }`}
                onClick={() => handleImageActive(imgItem)}
              >
                <Image
                  src={`${api.IMG_URL}product_images/${imgItem}`}
                  alt={`thumb-${i}`}
                  width={78}
                  height={100}
                  style={{ objectFit: "cover", borderRadius: "4px" }}
                />
              </button>
            ))}
          </div>
        </nav>

        {/* Main Image */}
        <div className="tab-content flex-grow-1">
          <div className="tab-pane fade show active">
            <div className="tp-product-details-main-thumb position-relative">
              <Image
                src={`${api.IMG_URL}product_images/${activeImg}`}
                alt="product"
                width={imgWidth}
                height={imgHeight}
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
              />

              {status === "out-of-stock" && (
                <div className="tp-product-badge position-absolute top-0 start-0 m-3">
                  <span className="product-hot bg-danger text-white px-2 py-1 rounded">
                    Out of stock
                  </span>
                </div>
              )}

              {videoId && (
                <div
                  className="tp-product-video-btn position-absolute top-50 start-50 translate-middle"
                  onClick={() => setIsVideoOpen(true)}
                  style={{ cursor: "pointer" }}
                >
                  <i className="fas fa-play-circle fa-3x text-white"></i>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
 
    </>
  );
};

export default DetailsThumbWrapper;
