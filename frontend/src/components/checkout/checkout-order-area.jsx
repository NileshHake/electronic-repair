import { useState } from "react";
import { CardElement } from "@stripe/react-stripe-js";
import { useForm } from "react-hook-form";
import { useGetCartListQuery } from "@/redux/features/cartApi";
import { useCreateOrderMutation } from "@/redux/features/orderApi";
import ErrorMsg from "../common/error-msg";

const CheckoutOrderArea = ({ selectedAddress }) => {
  const [showCard, setShowCard] = useState(false);
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // 🛒 Cart
  const { data: cartData = {}, isLoading } = useGetCartListQuery();
  const [createOrder] = useCreateOrderMutation();

  if (isLoading) return <p>Loading cart...</p>;

  const cartItems = cartData?.items || [];
  const subTotal = cartData?.sub_total || 0;
  const TaxTotal = cartData?.tax_total || 0;
  const shippingCost = cartData?.shipping_cost || 0;
  const total = cartData?.grand_total || 0;

  // ✅ SUBMIT HANDLER (NO PAGE REFRESH)
  const onSubmit = async (data) => {


    if (!selectedAddress) {
      alert("Please select delivery address");
      return;
    }

    setIsCheckoutSubmit(true);

    // 🔹 ORDER ITEMS
    const order_items = cartItems.map((item) => {
      const itemSubTotal =
        item.product_sale_price * item.add_to_card_product_qty;


      const qty = item.add_to_card_product_qty;
      const price = item.product_sale_price;

      const originalAmount = price * qty;
      const gstAmount = (originalAmount * item.tax_percentage) / 100;
      const totalWithGst = originalAmount + gstAmount + item.product_delivery_charge;
      return {
        order_child_product_price: item.product_sale_price,
        order_child_product_id: item.product_id,
        order_child_gst_percentage: item.tax_percentage,
        order_child_gst_amount: gstAmount,
        order_child_delivery_charge: item.product_delivery_charge || 0,
        order_child_sub_total: itemSubTotal,
        order_child_grand_total: totalWithGst,
      };
    });

    // 🔹 FINAL PAYLOAD (BACKEND FORMAT)
    const payload = {
      order_master_address_id: selectedAddress, 
      order_master_sub_total: subTotal,
      order_master_grand_total: total,
      order_master_gst_amount: TaxTotal,
      order_master_delivery_charge: shippingCost,
      payment_mode: data.payment,
      order_items,
    };



    try {
      await createOrder(payload).unwrap();
    } catch (err) {
      console.error("❌ Order error:", err);
    } finally {
      setIsCheckoutSubmit(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="tp-checkout-place white-bg">
        <h3 className="tp-checkout-place-title">Your Order</h3>

        <div className="tp-order-info-list">
          <ul>
            <li className="tp-order-info-list-header">
              <h4>Product</h4>
              <h4> Price</h4>
              <h4>GST</h4>
              <h4> Amount</h4>
              <h4>Total</h4>
            </li>

            {cartItems.map((item) => {
              const qty = item.add_to_card_product_qty;
              const price = item.product_sale_price;

              const originalAmount = price * qty;
              const gstAmount = (originalAmount * item.tax_percentage) / 100;
              const totalWithGst = originalAmount + gstAmount;

              return (
                <li
                  key={item.add_to_card_id}
                  className="tp-order-info-list-desc"
                >
                  {/* Product */}
                  <p>
                    {item.product_name} × {qty}
                  </p>

                  {/* Original Price */}
                  <p>₹{originalAmount.toFixed(2)}</p>

                  {/* GST % */}
                  <p>{item.tax_percentage}%</p>

                  {/* GST Amount */}
                  <p>₹{gstAmount.toFixed(2)}</p>

                  {/* Total */}
                  <span>₹{totalWithGst.toFixed(2)}</span>
                </li>
              );
            })}

            <li className="tp-order-info-list-subtotal">
              <span>Subtotal</span>
              <span>₹{subTotal.toFixed(2)}</span>
            </li>

            <li className="tp-order-info-list-subtotal">
              <span>Tax Amount</span>
              <span>₹{TaxTotal.toFixed(2)}</span>
            </li>

            <li className="tp-order-info-list-subtotal">
              <span>Shipping Cost</span>
              <span>₹{shippingCost.toFixed(2)}</span>
            </li>

            <li className="tp-order-info-list-total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </li>
          </ul>
        </div>


        {/* 💳 PAYMENT */}
        <div className="tp-checkout-payment">
          <div className="tp-checkout-payment-item">
            <input
              {...register("payment", { required: "Payment option required" })}
              type="radio"
              id="card"
              name="payment"
              value="CARD"
              onClick={() => setShowCard(true)}
            />
            <label htmlFor="card">Credit Card</label>

            {showCard && (
              <div className="direct-bank-transfer">
                <div className="payment_card">
                  <CardElement />
                </div>
              </div>
            )}

            <ErrorMsg msg={errors?.payment?.message} />
          </div>

          <div className="tp-checkout-payment-item">
            <input
              {...register("payment", { required: "Payment option required" })}
              type="radio"
              id="cod"
              name="payment"
              value="COD"
              onClick={() => setShowCard(false)}
            />
            <label htmlFor="cod">Cash on Delivery</label>
          </div>
        </div>

        {/* 🟢 PLACE ORDER */}
        <div className="tp-checkout-btn-wrapper">
          <button
            type="submit"
            disabled={isCheckoutSubmit}
            className="tp-checkout-btn w-100"
          >
            {isCheckoutSubmit ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CheckoutOrderArea;
