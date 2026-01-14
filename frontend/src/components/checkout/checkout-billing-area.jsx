import React, { useState } from "react";
import ErrorMsg from "../common/error-msg";
import { useSelector } from "react-redux";
import { useStoreCustomerAddressMutation } from "@/redux/features/customerAddressApi";

const CheckoutBillingArea = ({ register, errors }) => {
  const { user } = useSelector((state) => state.auth);

  const [showBilling, setShowBilling] = useState(false);

  const [storeCustomerAddress, { isLoading }] =
    useStoreCustomerAddressMutation();

  // ✅ ONE STATE WITH ALL REQUIRED FIELDS
  const [billingData, setBillingData] = useState({
    customer_address_description: "",
    customer_address_city: "",
    customer_address_taluka: "",
    customer_address_district: "",
    customer_address_state: "",
    customer_address_pincode: "",
    customer_address_mobile: "", // ✅ ADDED
  });

  // COMMON CHANGE HANDLER
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBillingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // STORE ADDRESS & CLOSE BOX
  const handleStoreAddress = async () => {
    try {
      await storeCustomerAddress(billingData).unwrap();
      setShowBilling(false); // ✅ CLOSE AFTER SUCCESS
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* ADD BUTTON */}
      <button
        type="button"
        className="btn btn-primary mb-3"
        onClick={() => setShowBilling(true)}
      >
        Add Billing Details
      </button>

      {/* BILLING BOX */}
      {showBilling && (
        <div className="tp-checkout-bill-area">
          <h3 className="tp-checkout-bill-title">Billing Details</h3>

          <div className="tp-checkout-bill-form">
            <div className="tp-checkout-bill-inner">
              <div className="row">

                {/* MOBILE */}
                <div className="col-md-6">
                  <div className="tp-checkout-input">
                    <label>Mobile Number <span>*</span></label>
                    <input
                      {...register("customer_address_mobile", {
                        required: "Mobile number is required!",
                        pattern: {
                          value: /^[6-9]\d{9}$/,
                          message: "Enter valid 10 digit mobile number",
                        },
                      })}
                      name="customer_address_mobile"
                      type="text"
                      placeholder="Mobile Number"
                      defaultValue={user?.mobile}
                      onChange={handleChange}
                    />
                    <ErrorMsg msg={errors?.customer_address_mobile?.message} />
                  </div>
                </div>

                {/* CITY */}
                <div className="col-md-6">
                  <div className="tp-checkout-input">
                    <label>City <span>*</span></label>
                    <input
                      {...register("customer_address_city", {
                        required: "City is required!",
                      })}
                      name="customer_address_city"
                      type="text"
                      placeholder="City"
                      onChange={handleChange}
                    />
                    <ErrorMsg msg={errors?.customer_address_city?.message} />
                  </div>
                </div>

                {/* TALUKA */}
                <div className="col-md-6">
                  <div className="tp-checkout-input">
                    <label>Taluka <span>*</span></label>
                    <input
                      {...register("customer_address_taluka", {
                        required: "Taluka is required!",
                      })}
                      name="customer_address_taluka"
                      type="text"
                      placeholder="Taluka"
                      onChange={handleChange}
                    />
                    <ErrorMsg msg={errors?.customer_address_taluka?.message} />
                  </div>
                </div>

                {/* DISTRICT */}
                <div className="col-md-6">
                  <div className="tp-checkout-input">
                    <label>District <span>*</span></label>
                    <input
                      {...register("customer_address_district", {
                        required: "District is required!",
                      })}
                      name="customer_address_district"
                      type="text"
                      placeholder="District"
                      onChange={handleChange}
                    />
                    <ErrorMsg msg={errors?.customer_address_district?.message} />
                  </div>
                </div>

                {/* STATE */}
                <div className="col-md-6">
                  <div className="tp-checkout-input">
                    <label>State <span>*</span></label>
                    <input
                      {...register("customer_address_state", {
                        required: "State is required!",
                      })}
                      name="customer_address_state"
                      type="text"
                      placeholder="State"
                      onChange={handleChange}
                    />
                    <ErrorMsg msg={errors?.customer_address_state?.message} />
                  </div>
                </div>

                {/* PINCODE */}
                <div className="col-md-6">
                  <div className="tp-checkout-input">
                    <label>Pincode <span>*</span></label>
                    <input
                      {...register("customer_address_pincode", {
                        required: "Pincode is required!",
                        pattern: {
                          value: /^[0-9]{6}$/,
                          message: "Enter valid 6 digit pincode",
                        },
                      })}
                      name="customer_address_pincode"
                      type="text"
                      placeholder="Pincode"
                      onChange={handleChange}
                    />
                    <ErrorMsg msg={errors?.customer_address_pincode?.message} />
                  </div>
                </div>

                {/* ADDRESS */}
                <div className="col-md-12">
                  <div className="tp-checkout-input">
                    <label>Address <span>*</span></label>
                    <textarea
                      {...register("customer_address_description", {
                        required: "Address is required!",
                      })}
                      name="customer_address_description"
                      placeholder="House no, street, area"
                      onChange={handleChange}
                    />
                    <ErrorMsg
                      msg={errors?.customer_address_description?.message}
                    />
                  </div>
                </div>

                {/* SAVE BUTTON */}
                <div className="col-md-12 text-end mt-3">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleStoreAddress}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Address"}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutBillingArea;
