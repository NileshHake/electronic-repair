import React, { useMemo, useState } from "react";
import { CardElement } from "@stripe/react-stripe-js";
import { useForm } from "react-hook-form";
import ErrorMsg from "../common/error-msg";
import { toast } from "react-toastify";
import { useCreateRentalRequestMutation } from "@/redux/features/rentalRequestApi";
import SuccessOrderModal from "../checkout/SuccessOrderModal";
const money = (v) => `₹${Number(v || 0).toFixed(2)}`;
import { useRouter } from "next/router";
const DeviceCheckoutOrderArea = ({ selectedAddress, device }) => {
    const [showCard, setShowCard] = useState(false);
    const [createRentalRequest] = useCreateRentalRequestMutation();
    const perDay = Number(device?.price_per_day ?? device?.base_rent_per_day ?? 0);
    const perWeek = Number(device?.base_rent_per_week ?? 0);
    const perMonth = Number(device?.base_rent_per_month ?? 0);
    const router = useRouter();

    const deposit = Number(device?.security_deposit ?? 0);
    const deliveryFee =
        Number(device?.delivery_available) === 1 ? Number(device?.delivery_fee ?? 0) : 0;

    // ✅ choose best default duration type based on available rates
    const defaultDurationType = useMemo(() => {
        if (perDay > 0) return "DAY";
        if (perWeek > 0) return "WEEK";
        if (perMonth > 0) return "MONTH";
        return "DAY";
    }, [perDay, perWeek, perMonth]);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            duration_type: defaultDurationType, // DAY | WEEK | MONTH
            duration_value: 1,
            payment: "COD",
        },
    });

    const durationType = watch("duration_type");
    const durationValue = Math.floor(Number(watch("duration_value") || 0));
    const payment = watch("payment");
    const [successOpen, setSuccessOpen] = useState(false);
    const [successOrderId, setSuccessOrderId] = useState("");
    const rentAmount = useMemo(() => {
        if (!durationValue || durationValue < 1) return 0;

        if (durationType === "DAY") return perDay * durationValue;
        if (durationType === "WEEK") return perWeek * durationValue;
        if (durationType === "MONTH") return perMonth * durationValue;
        return 0;
    }, [durationType, durationValue, perDay, perWeek, perMonth]);

    const grandTotal = rentAmount + deposit + deliveryFee;

    const durationLabel =
        durationType === "DAY" ? "Days" : durationType === "WEEK" ? "Weeks" : "Months";

    const submit = async (data) => {
        if (!selectedAddress) {
            toast.error("Please select delivery address");
            return;
        }

        if (!data.payment) {
            toast.error("Please select payment method");
            return;
        }

        const gstRate = 0.18;

        // use calculated values safely
        const rent = Number(rentAmount || 0);
        const dep = Number(deposit || 0);
        const delivery = Number(deliveryFee || 0);

        // subtotal before GST
        const subTotal = rent + delivery;

        // GST
        const gstAmount = Number((subTotal * gstRate).toFixed(2));

        // final total
        const totalAmount = Number((subTotal + gstAmount + dep).toFixed(2));

        const payload = {
            req_rental_device_id: device?.rental_device_id,

            address_id: selectedAddress,
            selected_vendor_id: 1,

            rent_type: data.duration_type,
            duration: Number(data.duration_value),

            // pricing
            rent: durationType === "DAY" ? perDay : durationType === "WEEK" ? perWeek : perMonth,
            rent_amount: rent,
            delivery_fee: delivery,
            security_deposit: dep,

            base_amount: subTotal,

            gst_percentage: 18,
            gst_amount: gstAmount,

            total_amount: totalAmount,

            payment_mode: data.payment
        };

        try {
            const res = await createRentalRequest(payload).unwrap();

            const oid =
                res?.rental_request_id ||
                res?.data?.rental_request_id ||
                "";

            setSuccessOrderId(oid);
            setSuccessOpen(true);

            setTimeout(() => {
                router.push("/rental-device");
            }, 15000);

        } catch (error) {
            toast.error(error?.data?.message || "Failed to place order");
        }
    };

    return (
        <form onSubmit={handleSubmit(submit)}>
            <div className="card shadow-sm  p-3">
                <h3 className=" text-center">Device Order</h3>

                {/* ✅ RENTAL DURATION */}
                <div className="mb-3">
                    <h6 className="mb-2 text-center mt-2">Rental Duration</h6>

                    <div className="d-flex gap-3 flex-wrap">
                        {/* show day only if rate exists */}
                        {perDay > 0 && (
                            <label className="d-flex align-items-center gap-2">
                                <input
                                    type="radio"
                                    value="DAY"
                                    {...register("duration_type", { required: "Select duration type" })}
                                />
                                Per Day
                            </label>
                        )}

                        {/* show week only if rate exists */}
                        {perWeek > 0 && (
                            <label className="d-flex align-items-center gap-2">
                                <input
                                    type="radio"
                                    value="WEEK"
                                    {...register("duration_type", { required: "Select duration type" })}
                                />
                                Per Week
                            </label>
                        )}

                        {/* show month only if rate exists */}
                        {perMonth > 0 && (
                            <label className="d-flex align-items-center gap-2">
                                <input
                                    type="radio"
                                    value="MONTH"
                                    {...register("duration_type", { required: "Select duration type" })}
                                />
                                Per Month
                            </label>
                        )}
                    </div>

                    <ErrorMsg msg={errors?.duration_type?.message} />

                    {/* ✅ INPUT BASED ON SELECTION */}
                    <div className="mt-3">
                        <label className="form-label fw-semibold">
                            Enter {durationLabel} <span className="text-danger">*</span>
                        </label>

                        <input
                            type="number"
                            className="form-control"
                            min={1}
                            step={1}
                            placeholder={`Enter ${durationLabel.toLowerCase()}`}
                            {...register("duration_value", {
                                required: `Enter ${durationLabel.toLowerCase()}`,
                                valueAsNumber: true,
                                min: { value: 1, message: `Minimum 1 ${durationLabel.toLowerCase()}` },
                                validate: (v) =>
                                    Number.isInteger(Number(v)) || `Enter valid ${durationLabel.toLowerCase()} count`,
                            })}
                        />
                        <ErrorMsg msg={errors?.duration_value?.message} />

                        {/* ✅ PRODUCTION NOTE */}
                        <p className="text-muted small mt-2 mb-0" style={{ lineHeight: 1.3 }}>
                            Note: Final rent is calculated based on selected duration (Day/Week/Month) and
                            quantity.
                        </p>
                    </div>
                </div>

                {/* ✅ SUMMARY */}
                <div className="tp-order-info-list mb-3">
                    <ul>
                        <li className="tp-order-info-list-subtotal">
                            <span>Rent Amount</span>
                            <span>{money(rentAmount)}</span>
                        </li>

                        <li className="tp-order-info-list-subtotal">
                            <span>Security Deposit</span>
                            <span>{money(deposit)}</span>
                        </li>

                        <li className="tp-order-info-list-subtotal">
                            <span>Delivery Fee</span>
                            <span>{money(deliveryFee)}</span>
                        </li>

                        <li className="tp-order-info-list-total">
                            <span>Total</span>
                            <span>{money(grandTotal)}</span>
                        </li>
                    </ul>
                </div>

                {/* ✅ PAYMENT ONLY */}
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

                        {(showCard || payment === "CARD") && (
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

                {/* ✅ PLACE ORDER */}
                <div className="tp-checkout-btn-wrapper">
                    <button
                        type="submit"
                        className="tp-checkout-btn w-100"
                        disabled={!selectedAddress || isSubmitting}
                        title={!selectedAddress ? "Please select delivery address" : ""}
                    >
                        {isSubmitting ? "Placing..." : "Place Order"}
                    </button>

                    {!selectedAddress && (
                        <p className="text-danger small mt-2 mb-0">
                            Please select delivery address to continue.
                        </p>
                    )}
                </div>
            </div>
            {successOpen && <SuccessOrderModal
                open={successOpen}
                orderId={successOrderId}

                onClose={() => {
                    setSuccessOpen(false);

                }}
            />}
        </form>
    );
};

export default DeviceCheckoutOrderArea;