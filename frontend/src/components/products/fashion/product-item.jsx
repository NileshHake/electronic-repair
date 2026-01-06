import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Rating } from "react-simple-star-rating";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

// internal
import { Cart, CompareThree, QuickView } from "@/svg";
import { handleProductModal } from "@/redux/features/productModalSlice";
import { add_to_compare } from "@/redux/features/compareSlice";
import { useAddToCartMutation } from "@/redux/features/cartApi";
import { api } from "../../../../config";
import defaultIMG from "../../../../public/assets/img/istockphoto-1055079680-612x612.jpg";

const ProductItem = ({ product, style_2 = false }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  // ✅ BACKEND FIELDS
  const {
    product_id,
    product_image,
    category_name,
    product_name,
    reviews = [],
    product_sale_price,
    product_mrp,
    discount = 0,
    status,
  } = product || {};

  const { cart_products } = useSelector((state) => state.cart);
  const isAddedToCart = cart_products.some(
    (prd) => prd.product_id === product_id
  );

  // ⭐ RATING
  const [ratingVal, setRatingVal] = useState(0);

  useEffect(() => {
    if (reviews.length > 0) {
      const rating =
        reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviews.length;
      setRatingVal(rating);
    } else {
      setRatingVal(0);
    }
  }, [reviews]);

  // 🖼 IMAGE PARSE
  let images = [];
  try {
    images = JSON.parse(product_image);
    if (!Array.isArray(images)) images = [];
  } catch {
    images = [];
  }

  const firstImage = images.length > 0 ? `${api.IMG_URL}product_images/${images[0]}` : defaultIMG.src;

  // 🛒 ADD TO CART API
  const [addToCart] = useAddToCartMutation();

  const handleAddProduct = async () => {
    const userInfo = Cookies.get("userInfo");

    if (!userInfo) {
      router.push("/login");
      return;
    }

    await addToCart({
      add_to_card_product_id: product_id,
    });
  };
  const defaultImage = "";
  return (
    <div className={`tp-product-item-2 ${style_2 ? "" : "mb-40"}`}>
      <div className="tp-product-thumb-2 p-relative z-index-1 fix">
        <Image
          src={firstImage}
          alt={product_name}
          width={284}
          height={302}
        />

        {status === "out-of-stock" && (
          <div className="tp-product-badge">
            <span className="product-hot">out-stock</span>
          </div>
        )}

        {/* ACTIONS */}
        <div className="tp-product-action-2 tp-product-action-blackStyle">
          <div className="tp-product-action-item-2 d-flex flex-column">
            {isAddedToCart ? (
              <Link
                href="/cart"
                className="tp-product-action-btn-2 active tp-product-add-cart-btn"
              >
                <Cart />
                <span className="tp-product-tooltip tp-product-tooltip-right">
                  View Cart
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleAddProduct}
                className="tp-product-action-btn-2 tp-product-add-cart-btn"
                disabled={status === "out-of-stock"}
              >
                <Cart />
                <span className="tp-product-tooltip tp-product-tooltip-right">
                  Add to Cart
                </span>
              </button>
            )}

            <button
              onClick={() => dispatch(handleProductModal(product))}
              className="tp-product-action-btn-2 tp-product-quick-view-btn"
            >
              <QuickView />
              <span className="tp-product-tooltip tp-product-tooltip-right">
                Quick View
              </span>
            </button>

            {/* <button
              disabled={status === "out-of-stock"}
              onClick={() => dispatch(add_to_compare(product))}
              className="tp-product-action-btn-2 tp-product-add-to-compare-btn"
            >
              <CompareThree />
              <span className="tp-product-tooltip tp-product-tooltip-right">
                Add To Compare
              </span>
            </button> */}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="tp-product-content-2 pt-15">
        <div className="tp-product-category">
          <span>{category_name}</span>
        </div>

        <h3 className="tp-product-title-2">{product_name}</h3>

        <div className="tp-product-rating-icon tp-product-rating-icon-2">
          <Rating allowFraction size={16} initialValue={ratingVal} readonly />
        </div>

        <div className="tp-product-price-wrapper-2">
          {discount > 0 ? (
            <>
              <span className="tp-product-price-2 old-price">
                ₹{product_mrp}
              </span>
              <span className="tp-product-price-2 new-price">
                ₹{product_sale_price}
              </span>
            </>
          ) : (
            <span className="tp-product-price-2 new-price">
              ₹{product_sale_price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
