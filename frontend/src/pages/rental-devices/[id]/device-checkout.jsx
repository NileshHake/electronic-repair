import React, { useState } from "react";
import { useRouter } from "next/router";

import Wrapper from "@/layout/wrapper";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";

import { useGetRentalDeviceSingleQuery } from "@/redux/features/rentalDeviceApi";

// existing checkout components
import CheckoutAddressList from "@/components/checkout/checkout-address-list";
import CheckoutOrderArea from "@/components/checkout/checkout-order-area"; // reuse if you want
// OR create new: RentalCheckoutOrderArea (recommended)

import RentalCheckoutDeviceInfo from "@/components/RentalDevice/RentalCheckoutDeviceInfo";
import DeviceCheckoutAddressList from "@/components/RentalDevice/DeviceCheckoutAddressList";
import useCheckoutSubmit from "@/hooks/use-checkout-submit";
import CheckoutBillingArea from "@/components/checkout/checkout-billing-area";
import DeviceCheckoutOrderArea from "@/components/RentalDevice/device-checkout-billing";

const RentalDeviceCheckoutPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const checkoutData = useCheckoutSubmit();
    const {
        handleSubmit,
        submitHandler,
        register,
        errors,
    } = checkoutData;

    const [selectedAddress, setSelectedAddress] = useState(null);


    const canFetch = router.isReady && id;

    const { data: device, isLoading, isError } =
        useGetRentalDeviceSingleQuery(id, { skip: !canFetch });

    return (
        <Wrapper>
            <SEO pageTitle="Device Checkout" />
            <HeaderTwo style_2={false} />

            <div className="container py-4">
                <h3 className="mb-4">Device Checkout</h3>

                {isLoading && <div className="py-5">Loading...</div>}
                {isError && <div className="py-5 text-danger">Failed to load device</div>}

                {!isLoading && device && (
                    <div className="row g-4">
                        {/* LEFT */}
                        <div className="col-lg-4">
                            <DeviceCheckoutAddressList
                                selectedAddress={selectedAddress}
                                setSelectedAddress={setSelectedAddress} />
                            <CheckoutBillingArea
                                register={register}
                                errors={errors}
                            />
                        </div>

                        {/* CENTER */}
                        <div className="col-lg-4">
                            <RentalCheckoutDeviceInfo device={device} />
                        </div>

                        {/* RIGHT */}
                        <div className="col-lg-4">
                            {/* If your CheckoutOrderArea supports type switch */}
                            <DeviceCheckoutOrderArea selectedAddress={selectedAddress} type="deviceCheckout" device={device} />

                            {/* OR (recommended) use separate component */}
                            {/* <RentalCheckoutOrderArea device={device} /> */}
                        </div>
                    </div>
                )}
            </div>

            <Footer primary_style={true} />
        </Wrapper>
    );
};

export default RentalDeviceCheckoutPage;