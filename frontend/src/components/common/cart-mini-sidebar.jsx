import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import empty_cart_img from '@assets/img/product/cartmini/empty-cart.png';
import { closeCartMini } from '@/redux/features/cartSlice';
import { api } from '../../../config';
import { useGetCartListQuery, useDeleteCartItemMutation } from '@/redux/features/cartApi';

const CartMiniSidebar = () => {
  const dispatch = useDispatch();
  const { cartMiniOpen } = useSelector((state) => state.cart);

  // Fetch cart from backend
  const { data, isLoading, isError } = useGetCartListQuery();
  const [deleteCartItem] = useDeleteCartItemMutation();
console.log(data);

  const cart_products = data?.items || [];
  const subtotal = data?.grand_total || 0;

  // Close sidebar
  const handleCloseCartMini = () => {
    dispatch(closeCartMini());
  };

  // Remove product from cart
  const handleRemovePrd = async (id) => {
    try {
      await deleteCartItem(id).unwrap();
    } catch (err) {
      console.error('Failed to remove cart item:', err);
    }
  };

  return (
    <>
      <div className={`cartmini__area tp-all-font-roboto ${cartMiniOpen ? 'cartmini-opened' : ''}`}>
        <div className="cartmini__wrapper d-flex justify-content-between flex-column">
          <div className="cartmini__top-wrapper">
            <div className="cartmini__top p-relative">
              <div className="cartmini__top-title">
                <h4>Shopping cart</h4>
              </div>
              <div className="cartmini__close">
                <button onClick={handleCloseCartMini} type="button" className="cartmini__close-btn">
                  <i className="fal fa-times"></i>
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-5">Loading cart...</div>
            ) : isError ? (
              <div className="text-center py-5">Failed to load cart.</div>
            ) : cart_products.length === 0 ? (
              <div className="cartmini__empty text-center">
                <Image src={empty_cart_img} alt="empty-cart-img" />
                <p>Your Cart is empty</p>
                <Link href="/shop" className="tp-btn">Go to Shop</Link>
              </div>
            ) : (
              <div className="cartmini__widget">
                {cart_products.map((item) => {
                  // parse image
                  let images = [];
                  try {
                    images = JSON.parse(item.product_image);
                    if (!Array.isArray(images)) images = [];
                  } catch (err) {
                    images = [];
                  }
                  const firstImage = images.length > 0 ? images[0] : 'default.jpg';
                  const imgUrl = `${api.IMG_URL}product_images/${firstImage}`;

                  const price = item.product_sale_price || 0;
                  const qty = item.add_to_card_product_qty || 1;

                  return (
                    <div key={item.add_to_card_id} className="cartmini__widget-item d-flex align-items-center">
                      <div className="cartmini__thumb me-3">
                        <Link href={`/product-details/${item.add_to_card_id}`}>
                          <Image src={imgUrl} width={70} height={60} alt={item.product_name} />
                        </Link>
                      </div>
                      <div className="cartmini__content flex-grow-1">
                        <h5 className="cartmini__title">
                          <Link href={`/product-details/${item.add_to_card_id}`}>{item.product_name}</Link>
                        </h5>
                        <div className="cartmini__price-wrapper">
                          <span className="cartmini__price">  ₹{(price * qty).toFixed(2)}</span>
                          <span className="cartmini__quantity"> x{qty}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePrd(item.add_to_card_id)}
                        className="cartmini__del cursor-pointer btn p-0 border-0 bg-transparent"
                      >
                        <i className="fa-regular fa-xmark"></i>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cart_products.length > 0 && (
            <div className="cartmini__checkout mt-3">
              <div className="cartmini__checkout-title mb-2 d-flex justify-content-between">
                <h4>Subtotal:</h4>
                <span>  ₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="cartmini__checkout-btn d-flex flex-column gap-2">
                <Link href="/cart" onClick={handleCloseCartMini} className="tp-btn w-100">View Cart</Link>
                <Link href="/checkout" onClick={handleCloseCartMini} className="tp-btn tp-btn-border w-100">Checkout</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* overlay */}
      <div onClick={handleCloseCartMini} className={`body-overlay ${cartMiniOpen ? 'opened' : ''}`}></div>
    </>
  );
};

export default CartMiniSidebar;
