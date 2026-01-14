import { useState } from "react";
import { CardElement } from "@stripe/react-stripe-js";
import { useGetCartListQuery } from "@/redux/features/cartApi";
import ErrorMsg from "../common/error-msg";

const CheckoutOrderArea = ({ checkoutData }) => {
  const {
    handleShippingCost,
    cartTotal = 0,
    stripe,
    isCheckoutSubmit,
    register,
    errors,
    showCard,
    setShowCard,
    
    discountAmount,
  } = checkoutData;

  // ✅ Fetch cart from API
  const { data: cartData = {}, isLoading } = useGetCartListQuery();

  if (isLoading) return <p>Loading cart...</p>;

  const cartItems = cartData?.items || [];
  const total = cartData?.grand_total || 0;
  const subTotal = cartData?.sub_total || 0;
  const shippingCost = cartData?.shipping_cost || 0;

  // Calculate total including shipping and discount
   

  return (
    <div className="tp-checkout-place white-bg">
      <h3 className="tp-checkout-place-title">Your Order</h3>

      <div className="tp-order-info-list">
        <ul>
          {/* HEADER */}
          <li className="tp-order-info-list-header">
            <h4>Product</h4>
            <h4>Total</h4>
          </li>

          {/* CART ITEMS */}
          {cartItems.map((item) => (
            <li key={item.add_to_card_id} className="tp-order-info-list-desc">
              <p>
                {item.product_name} <span>× {item.add_to_card_product_qty}</span>
              </p>
              <span>
                ₹{(item.product_sale_price * item.add_to_card_product_qty).toFixed(2)}
              </span>
            </li>
          ))}

           

          {/* SUBTOTAL */}
          <li className="tp-order-info-list-subtotal">
            <span>Subtotal</span>
            <span>₹{subTotal.toFixed(2)}</span>
          </li>

          {/* SHIPPING COST */}
          <li className="tp-order-info-list-subtotal">
            <span>Shipping Cost</span>
            <span>₹{shippingCost.toFixed(2)}</span>
          </li>

          

          {/* TOTAL */}
          <li className="tp-order-info-list-total">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </li>
        </ul>
      </div>

      {/* PAYMENT */}
      <div className="tp-checkout-payment">
        <div className="tp-checkout-payment-item">
          <input
            {...register("payment", { required: "Payment Option is required!" })}
            type="radio"
            id="card"
            name="payment"
            value="Card"
            onClick={() => setShowCard(true)}
          />
          <label htmlFor="card">Credit Card</label>

          {showCard && (
            <div className="direct-bank-transfer">
              <div className="payment_card">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#424770",
                        "::placeholder": { color: "#aab7c4" },
                      },
                      invalid: { color: "#9e2146" },
                    },
                  }}
                />
              </div>
            </div>
          )}
          <ErrorMsg msg={errors?.payment?.message} />
        </div>

        <div className="tp-checkout-payment-item">
          <input
            {...register("payment", { required: "Payment Option is required!" })}
            type="radio"
            id="cod"
            name="payment"
            value="COD"
            onClick={() => setShowCard(false)}
          />
          <label htmlFor="cod">Cash on Delivery</label>
        </div>
      </div>

      {/* PLACE ORDER */}
      <div className="tp-checkout-btn-wrapper">
        <button
          type="submit"
          disabled={!stripe || isCheckoutSubmit}
          className="tp-checkout-btn w-100"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default CheckoutOrderArea;
