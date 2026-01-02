import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Pagination, EffectFade } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
// internal
import offer_img from "@assets/img/banner/banner-slider-offer.png";
import { useGetProductSlidersQuery } from "@/redux/features/sliderApi";
import { api } from "../../../../config";

// Swiper settings
const slider_setting = {
  slidesPerView: 1,
  spaceBetween: 0,
  effect: "fade",
  pagination: {
    el: ".tp-product-banner-slider-dot",
    clickable: true,
  },
};

const ProductBanner = () => {
  const { data: Productsliders, isLoading, isError } = useGetProductSlidersQuery();
  
  if (isLoading) {
    return (
      <div className="tp-product-banner-area pb-90 text-center">
        <p>Loading sliders...</p>
      </div>
    );
  }

  if (!Productsliders) {
    return (
      <div className="tp-product-banner-area pb-90 text-center">
        <p>No Product Sliders Found</p>

      </div>
    );
  }

  return (
    <div className="tp-product-banner-area pb-90">
      <div className="container">
        <div className="tp-product-banner-slider fix">
          <Swiper
            {...slider_setting}
            modules={[Pagination, EffectFade]}
            className="tp-product-banner-slider-active swiper-container"
          >
            {Productsliders.map((item) => (
              <SwiperSlide
                key={item.slider_id}
                className="tp-product-banner-inner theme-bg p-relative z-index-1 fix"
              >
                {/* Background Text */}
                <h4 className="tp-product-banner-bg-text">
                  {item.slider_bg_text || ""}
                </h4>

                <div className="row align-items-center">
                  <div className="col-xl-6 col-lg-6">
                    <div className="tp-product-banner-content p-relative z-index-1">
                      <span className="tp-product-banner-subtitle">
                        {item.subtitle_text_1 || ""}
                      </span>

                      <h3 className="tp-product-banner-title">
                        {item.title || ""}
                      </h3>

                      <div className="tp-product-banner-price mb-40">
                        <span className="old-price">₹{item.slider_old_price || 0}</span>
                        <p className="new-price">₹{item.pre_title_price || 0}</p>
                      </div>

                      <div className="tp-product-banner-btn">
                        <Link href="/shop" className="tp-btn tp-btn-2">
                          Shop now
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-6 col-lg-6">
                    <div className="tp-product-banner-thumb-wrapper p-relative" style={{ minHeight: "400px" }}>
                      <div
                        className="tp-product-banner-thumb text-end p-relative z-index-1"
                        style={{ position: "relative", width: "100%", height: "400px" }}
                      >
                        {item.slider_image && (
                          <Image
                            src={`${api.IMG_URL}slider_image/${item.slider_image}`}
                            alt="slider-img"
                            fill
                            style={{ objectFit: "contain" }}
                            priority
                          />
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </SwiperSlide>
            ))}


            {/* Swiper Pagination Dots */}
            <div className="tp-product-banner-slider-dot tp-swiper-dot"></div>
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default ProductBanner;
