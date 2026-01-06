import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Rating } from "react-simple-star-rating";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";

// internal
import { Cart, QuickView, Wishlist } from "@/svg";
import Timer from "@/components/common/timer";
import { handleProductModal } from "@/redux/features/productModalSlice";
import { add_cart_product } from "@/redux/features/cartSlice";
import { add_to_wishlist } from "@/redux/features/wishlist-slice";
import { api } from "../../../../config";
import { useAddToCartMutation } from "@/redux/features/cartApi";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const ProductItem = ({ product, offer_style = false }) => {
const router = useRouter();


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

  const dispatch = useDispatch();
  const { cart_products } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);

  const isAddedToCart = cart_products.some(
    (prd) => prd.product_id === product_id
  );
  const isAddedToWishlist = wishlist.some(
    (prd) => prd.product_id === product_id
  );

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

  let images = [];
  try {
    images = JSON.parse(product_image);
    if (!Array.isArray(images)) {
      // Ensure it's always an array
      images = [];
    }
  } catch (err) {
    console.error("Invalid product_image JSON:", err);
    images = []; // fallback empty array
  }

  const firstImage = images.length > 0 ? images[0] : "default.jpg";

const [addToCart] = useAddToCartMutation();

const handleAddProduct = async (prd) => {
  const userInfo = Cookies.get("userInfo");
 
  
  if (userInfo) {
     
    
    await addToCart({
      add_to_card_product_id: prd.product_id,
      
    });
  }else{
    router.push("/login");
  }
  
};
  return (
    <div
      className={`${offer_style ? "tp-product-offer-item" : "mb-25"
        } tp-product-item transition-3`}
    >
      {/* IMAGE */}
      <div className="tp-product-thumb p-relative fix">
        <Image
          src={`${api.IMG_URL}product_images/${firstImage}`}
          width={300}
          height={300}
          alt={product_name}
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
              <Link
                href="/cart"
                className="tp-product-action-btn active"
              >
                <Cart />
                <span className="tp-product-tooltip">View Cart</span>
              </Link>
            ) : (
              <button
                onClick={() => handleAddProduct(product)}
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

            {/* <button
              onClick={() => dispatch(add_to_wishlist(product))}
              className={`tp-product-action-btn ${isAddedToWishlist ? "active" : ""
                }`}
              disabled={status === "out-of-stock"}
            >
              <Wishlist />
              <span className="tp-product-tooltip">Wishlist</span>
            </button> */}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="tp-product-content">
        <div className="tp-product-category">
          <span>{category_name}</span>
        </div>

        <h3 className="tp-product-title">{product_name}</h3>

        {/* RATING */}
        <div className="tp-product-rating d-flex align-items-center">
          <Rating
            allowFraction
            size={16}
            initialValue={ratingVal}
            readonly
          />
          <span className="ms-2">({reviews.length} Review)</span>
        </div>

        {/* PRICE */}
        <div className="tp-product-price-wrapper">
          {discount > 0 ? (
            <>
              <span className="tp-product-price old-price">
                ₹{product_mrp}
              </span>
              <span className="tp-product-price new-price">
                ₹{product_sale_price}
              </span>
            </>
          ) : (
            <span className="tp-product-price new-price">
              ₹{product_sale_price}
            </span>
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
