import React from 'react';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
// internal
import { clearCart } from '@/redux/features/cartSlice';
import CartCheckout from './cart-checkout';
import CartItem from './cart-item';
import { useGetCartListQuery } from '@/redux/features/cartApi';

const CartArea = () => {
  const dispatch = useDispatch();

  // Fetch cart list from backend
  const { data, isLoading, isError } = useGetCartListQuery();

  // Data from API
  const cart_products = data?.items || [];

  if (isLoading) {
    return (
      <div className="text-center pt-50">
        <h3>Loading Cart...</h3>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center pt-50">
        <h3>Failed to load cart. Please try again.</h3>
      </div>
    );
  }

  return (
    <section className="tp-cart-area pb-120">
      <div className="container">
        {cart_products.length === 0 ? (
          <div className='text-center pt-50'>
            <h3>No Cart Items Found</h3>
            <Link href="/shop" className="tp-cart-checkout-btn mt-20">Continue Shopping</Link>
          </div>
        ) : (
          <div className="row">
            <div className="col-xl-9 col-lg-8">
              <div className="tp-cart-list mb-25 mr-30">
                <table className="table">
                  <thead>
                    <tr>
                      <th colSpan="2" className="tp-cart-header-product">Product</th>
                      <th className="tp-cart-header-price">Price</th>
                      <th className="tp-cart-header-quantity">Quantity</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart_products.map((item) => (
                      <CartItem key={item.add_to_card_id} product={item} />
                    ))} 
                  </tbody>
                </table>
              </div>
              <div className="tp-cart-bottom">
                <div className="row align-items-end">
                  <div className="col-xl-6 col-md-8">
                    {/* Coupon code area can go here */}
                  </div>
                  <div className="col-xl-6 col-md-4">
                    <div className="tp-cart-update text-md-end mr-30">
                      {/* <button
                        onClick={() => dispatch(clearCart())}
                        type="button"
                        className="tp-cart-update-btn"
                      >
                        Clear Cart
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-4 col-md-6">
              <CartCheckout grandTotal={data?.grand_total || 0} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CartArea;
