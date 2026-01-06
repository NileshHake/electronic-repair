import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Rating } from "react-simple-star-rating";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";

// internal
import { Cart, QuickView } from "@/svg";
import Timer from "@/components/common/timer";
import { handleProductModal } from "@/redux/features/productModalSlice";
import { api } from "../../../../config";
import { useAddToCartMutation } from "@/redux/features/cartApi";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import defaultIMG from "../../../../public/assets/img/istockphoto-1055079680-612x612.jpg";

const ProductItem = ({ product, offer_style = false }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    product_id,
    product_image,
    category_name,
    product_name,
    reviews = [],
    product_mrp,
    product_sale_price,
    discount = 0,
    status,
    offerDate,
  } = product || {};

  const { cart_products } = useSelector((state) => state.cart);

  const isAddedToCart = cart_products.some(
    (prd) => prd.product_id === product_id
  );

  const [ratingVal, setRatingVal] = useState(0);

  // ⭐ Calculate rating
  useEffect(() => {
    if (reviews.length > 0) {
      const rating =
        reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
      setRatingVal(rating);
    } else {
      setRatingVal(0);
    }
  }, [reviews]);

  // 🖼 Parse image and fallback
  let images = [];
  try {
    images = JSON.parse(product_image);
    if (!Array.isArray(images)) images = [];
  } catch {
    images = [];
  }

  // Use first image from API or fallback defaultIMG
  const firstImage =
    images.length > 0 ? `${api.IMG_URL}product_images/${images[0]}` : defaultIMG;

  const [addToCart] = useAddToCartMutation();

  // 🛒 Add to Cart
  const handleAddProduct = async () => {
    const userInfo = Cookies.get("userInfo");

    if (!userInfo) {
      router.push("/login");
      return;
    }

    await addToCart({ add_to_card_product_id: product_id });
  };

  return (
    <div
      className={`${offer_style ? "tp-product-offer-item" : "mb-25"} tp-product-item transition-3`}
    >
      {/* IMAGE */}
      <div className="tp-product-thumb p-relative fix">
        <Image
          src={firstImage}
          alt={product_name || "Product Image"}
          width={300}
          height={300}
          style={{ width: "100%", height: "auto" }}
        />

        {status === "out-of-stock" && (
          <div className="tp-product-badge">
            <span className="product-hot">Out of Stock</span>
          </div>
        )}

        {/* ACTIONS */}
        <div className="tp-product-action">
          <div className="tp-product-action-item d-flex flex-column">
            {isAddedToCart ? (
              <Link href="/cart" className="tp-product-action-btn active">
                <Cart />
                <span className="tp-product-tooltip">View Cart</span>
              </Link>
            ) : (
              <button
                onClick={handleAddProduct}
                className="tp-product-action-btn"
                disabled={status === "out-of-stock"}
              >
                <Cart />
                <span className="tp-product-tooltip">Add to Cart</span>
              </button>
            )}

            <button
              onClick={() => dispatch(handleProductModal(product))}
              className="tp-product-action-btn"
            >
              <QuickView />
              <span className="tp-product-tooltip">Quick View</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="tp-product-content">
        <div className="tp-product-category">
          <span>{category_name || "Uncategorized"}</span>
        </div>

        <h3 className="tp-product-title">{product_name || "No Name"}</h3>

        {/* RATING */}
        <div className="tp-product-rating d-flex align-items-center">
          <Rating allowFraction size={16} initialValue={ratingVal} readonly />
          <span className="ms-2">({reviews.length} Review{reviews.length !== 1 ? "s" : ""})</span>
        </div>

        {/* PRICE */}
        <div className="tp-product-price-wrapper">
          {discount > 0 ? (
            <>
              <span className="tp-product-price old-price">₹{product_mrp}</span>
              <span className="tp-product-price new-price">₹{product_sale_price}</span>
            </>
          ) : (
            <span className="tp-product-price new-price">₹{product_sale_price}</span>
          )}
        </div>

        {/* OFFER TIMER */}
        {offer_style && offerDate?.endDate && (
          <div className="tp-product-countdown">
            {dayjs().isAfter(offerDate.endDate) ? (
              <span>Offer Expired</span>
            ) : (
              <Timer expiryTimestamp={new Date(offerDate.endDate)} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductItem;
