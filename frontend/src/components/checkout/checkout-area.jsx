import React, { useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";

// internal
import CheckoutBillingArea from "./checkout-billing-area";
import CheckoutOrderArea from "./checkout-order-area"; 
import useCheckoutSubmit from "@/hooks/use-checkout-submit";
import CheckoutAddressList from "./checkout-address-list";

const CheckoutArea = () => {
  const checkoutData = useCheckoutSubmit();
  const {
    handleSubmit,
    submitHandler,
    register,
    errors, 
  } = checkoutData;

  const { cart_products } = useSelector((state) => state.cart);
  const [selectedAddress, setSelectedAddress] = useState(null);

  return (
    <section
      className="tp-checkout-area pb-120"
      style={{ backgroundColor: "#EFF1F5" }}
    >
      <div className="container">
        {cart_products.length === 0 && (
          <div className="text-center pt-50">
            <h3 className="py-2">No items found in cart to checkout</h3>
            <Link href="/shop" className="tp-checkout-btn">
              Return to shop
            </Link>
          </div>
        )}

        {cart_products.length > 0 && (
           
            <div className="row">
              <div className="col-lg-7">

                {/* ADDRESS LIST */}
                <CheckoutAddressList
                  selectedAddress={selectedAddress}
                  setSelectedAddress={setSelectedAddress}
                />

                {/* BILLING FORM */}
                <CheckoutBillingArea
                  register={register}
                  errors={errors}
                />
              </div>

              <div className="col-lg-5">
                <CheckoutOrderArea selectedAddress={selectedAddress} />
              </div>
            </div>
          
        )}
      </div>
    </section>
  );
};

export default CheckoutArea;
