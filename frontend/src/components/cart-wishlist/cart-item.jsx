import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Close, Minus, Plus } from "@/svg";
import { api } from "../../../config";
import defaultIMG from "../../../public/assets/img/istockphoto-1055079680-612x612.jpg";
import {
  useDeleteCartItemMutation,
  useUpdateCartMutation,
} from "@/redux/features/cartApi";

const safeParseImages = (v) => {
  try {
    const arr = typeof v === "string" ? JSON.parse(v) : v;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const CartItem = ({ product }) => {
  const {
    add_to_card_id,
    product_image,
    product_name,
    product_sale_price,
    add_to_card_product_qty,
    // ⚠️ If you have product_id in product, use that for product-details route
    // product_id,
  } = product || {};

  const [quantity, setQuantity] = useState(add_to_card_product_qty || 1);

  const [updateCart] = useUpdateCartMutation();
  const [deleteCartItem] = useDeleteCartItemMutation();

  // ✅ images + first image
  const images = useMemo(() => safeParseImages(product_image), [product_image]);
  const firstImage = images?.[0];

  // ✅ main image src (string or imported static)
  const initialSrc = firstImage
    ? `${api.IMG_URL}product_images/${firstImage}`
    : defaultIMG;

  const [imgSrc, setImgSrc] = useState(initialSrc);

  // ✅ if product changes, reset image
  useEffect(() => {
    setImgSrc(initialSrc);
  }, [initialSrc]);

  // Handle increment
  const handleAddProduct = async () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    try {
      await updateCart({ id: add_to_card_id, quantity: newQty }).unwrap();
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
    }
  };

  // Handle decrement
  const handleDecrement = async () => {
    if (quantity <= 1) return;
    const newQty = quantity - 1;
    setQuantity(newQty);
    try {
      await updateCart({ id: add_to_card_id, quantity: newQty }).unwrap();
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
    }
  };

  // Handle remove
  const handleRemovePrd = async () => {
    try {
      await deleteCartItem(add_to_card_id).unwrap();
    } catch (err) {
      console.error("Failed to remove cart item:", err);
    }
  };

  const price = Number(product_sale_price || 0);

  return (
    <tr>
      <td className="tp-cart-img">
        <Link href={`/product-details/${add_to_card_id}`}>
          <Image
            src={imgSrc}
            alt={product_name || "product"}
            width={70}
            height={100}
            style={{ objectFit: "cover" }}
            onError={() => setImgSrc(defaultIMG)}
          />
        </Link>
      </td>

      <td className="tp-cart-title">
        <Link href={`/product-details/${add_to_card_id}`}>
          {product_name || "-"}
        </Link>
      </td>

      <td className="tp-cart-price">
        <span> ₹{(price * quantity).toFixed(2)}</span>
      </td>

      <td className="tp-cart-quantity">
        <div className="tp-product-quantity mt-10 mb-10">
          <span onClick={handleDecrement} className="tp-cart-minus">
            <Minus />
          </span>

          <input
            className="tp-cart-input"
            type="text"
            value={quantity}
            readOnly
          />

          <span onClick={handleAddProduct} className="tp-cart-plus">
            <Plus />
          </span>
        </div>
      </td>

      <td className="tp-cart-action">
        <button onClick={handleRemovePrd} className="tp-cart-action-btn">
          <Close />
          <span> Remove</span>
        </button>
      </td>
    </tr>
  );
};

export default CartItem;
