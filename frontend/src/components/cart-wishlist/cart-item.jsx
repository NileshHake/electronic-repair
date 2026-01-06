import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Close, Minus, Plus } from "@/svg";
import { api } from "../../../config";
import { useDeleteCartItemMutation, useUpdateCartMutation } from "@/redux/features/cartApi";

const CartItem = ({ product }) => {
  const {
    add_to_card_id,
    product_image,
    product_name,
    product_sale_price,
    add_to_card_product_qty,
  } = product || {};

  const [quantity, setQuantity] = useState(add_to_card_product_qty || 1);

  const [updateCart] = useUpdateCartMutation();
  const [deleteCartItem] = useDeleteCartItemMutation();

  // Handle increment
  const handleAddProduct = async () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    try {
      await updateCart({ id: add_to_card_id, quantity: newQty }).unwrap();
      // Cart list will auto-refresh because of invalidatesTags
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
      // Cart list will auto-refresh
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
    }
  };

  // Handle remove
  const handleRemovePrd = async () => {
    try {
      await deleteCartItem(add_to_card_id).unwrap();
      // Cart list will auto-refresh
    } catch (err) {
      console.error("Failed to remove cart item:", err);
    }
  };

  // Parse product_image JSON
  let images = [];
  try {
    images = JSON.parse(product_image);
    if (!Array.isArray(images)) images = [];
  } catch (err) {
    images = [];
  }
  const firstImage = images.length > 0 ? images[0] : "default.jpg";
  const imgUrl = `${api.IMG_URL}product_images/${firstImage}`;

  const price = product_sale_price || 0;

  return (
    <tr>
      <td className="tp-cart-img">
        <Link href={`/product-details/${add_to_card_id}`}>
          <Image src={imgUrl} alt={product_name} width={70} height={100} />
        </Link>
      </td>
      <td className="tp-cart-title">
        <Link href={`/product-details/${add_to_card_id}`}>{product_name}</Link>
      </td>
      <td className="tp-cart-price">
        <span> ₹{(price * quantity).toFixed(2)}</span>
      </td>
      <td className="tp-cart-quantity">
        <div className="tp-product-quantity mt-10 mb-10">
          <span onClick={handleDecrement} className="tp-cart-minus">
            <Minus />
          </span>
          <input className="tp-cart-input" type="text" value={quantity} readOnly />
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
