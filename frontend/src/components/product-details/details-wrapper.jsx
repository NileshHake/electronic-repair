import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Rating } from "react-simple-star-rating";
import { useDispatch } from "react-redux";
import { add_cart_product } from "@/redux/features/cartSlice";
import { add_to_wishlist } from "@/redux/features/wishlist-slice";
import { add_to_compare } from "@/redux/features/compareSlice";
import { handleModalClose } from "@/redux/features/productModalSlice";
import { api } from "../../../config";
import ProductDetailsCountdown from "./product-details-countdown";
import ProductQuantity from "./product-quantity";

const DetailsWrapper = ({ productItem, activeImg }) => {
  const dispatch = useDispatch();
  const [ratingVal, setRatingVal] = useState(0);
  const [textMore, setTextMore] = useState(false);

  const {
    product_image,
    category_name,
    product_name, 
    reviews = [],
    product_mrp,
    product_sale_price,
    discount = 0,
    status,
    offerDate,
    product_description,
  } = productItem || {};

  const images = JSON.parse(product_image || "[]");

  useEffect(() => {
    if (reviews.length > 0) {
      const avg = reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;
      setRatingVal(avg);
    }
  }, [reviews]);

  const getShortDescription = (html, limit = 150) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || "";
    return text.substring(0, limit) + "...";
  };

  return (
    <div className="tp-product-details-wrapper">
      <span className="text-muted">{category_name}</span>
      <h3>{product_name}</h3>

      <div className="d-flex align-items-center mb-10">
        <Rating allowFraction size={16} initialValue={ratingVal} readonly />
        <span className="ms-2">({reviews.length} Reviews)</span>
      </div>

      <div className="product-description">
        {!textMore ? (
          <p className="text-muted">
            {getShortDescription(product_description, 150)}
            <span
              onClick={() => setTextMore(true)}
              className="text-primary ms-2"
              style={{ cursor: "pointer", fontWeight: 500 }}
            >
              See more
            </span>
          </p>
        ) : (
          <>
            <div
              className="full-description"
              dangerouslySetInnerHTML={{ __html: product_description }}
            />
            <span
              onClick={() => setTextMore(false)}
              className="text-primary mt-2 d-inline-block"
              style={{ cursor: "pointer", fontWeight: 500 }}
            >
              See less
            </span>
          </>
        )}
      </div>

      <div className="tp-product-details-price-wrapper mb-20">
        {discount > 0 ? (
          <>
            <span className="old-price">₹{product_mrp}</span>
            <span className="new-price ms-2">₹{product_sale_price}</span>
          </>
        ) : (
          <span className="new-price">₹{product_sale_price}</span>
        )}
      </div>

      {offerDate?.endDate && <ProductDetailsCountdown offerExpiryTime={offerDate.endDate} />}
      <ProductQuantity />

      <button
        onClick={() => dispatch(add_cart_product(productItem))}
        disabled={status === "out-of-stock"}
        className="tp-product-details-add-to-cart-btn w-100 mb-10"
      >
        Add To Cart
      </button>

      <Link href="/cart" onClick={() => dispatch(handleModalClose())}>
        <button className="tp-product-details-buy-now-btn w-100">Buy Now</button>
      </Link>

      
    </div>
  );
};

export default DetailsWrapper;
