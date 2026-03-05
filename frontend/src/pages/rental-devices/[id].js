import React, { useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Cookies from "js-cookie";

import defaultIMG from "../../../public/assets/img/istockphoto-1055079680-612x612.jpg";
import { api } from "../../../config";

import { useGetRentalDeviceSingleQuery } from "@/redux/features/rentalDeviceApi";
import Wrapper from "@/layout/wrapper";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";

const safeParse = (v, fallback) => {
  try {
    if (!v) return fallback;
    const parsed = typeof v === "string" ? JSON.parse(v) : v;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const money = (v) => `₹${Number(v || 0).toFixed(2)}`;
const toText = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));

const RentalDeviceSinglePage = () => {
  const router = useRouter();
  const { id } = router.query;

  const canFetch = router.isReady && id;

  const { data: device, isLoading, isError, error, refetch } =
    useGetRentalDeviceSingleQuery(id, { skip: !canFetch });

  const images = useMemo(() => safeParse(device?.images, []), [device?.images]);
  const specs = useMemo(() => safeParse(device?.specs_json, null), [device?.specs_json]);

  const mainImg = images?.length
    ? `${api.IMG_URL}/rental_device_images/${images[0]}`
    : defaultIMG;

  const handleRentNow = useCallback(() => {
    const cookie = Cookies.get("userInfo");
    if (!cookie) return router.replace("/login");

    let userInfo;
    try {
      userInfo = JSON.parse(cookie);
    } catch {
      return router.replace("/login");
    }

    if (!userInfo?.user?.user_phone_number) {
      return router.replace("/profile#nav-information");
    }

    router.push(`/rental-devices/${id}/device-checkout`);
  }, [router, id]);

  if (isLoading || !canFetch) {
    return (
      <Wrapper>
        <SEO pageTitle="Rental Device" />
        <HeaderTwo style_2={false} />
        <div className="container py-5">
          <h4>Loading device...</h4>
        </div>
        <Footer primary_style={true} />
      </Wrapper>
    );
  }

  if (isError) {
    return (
      <Wrapper>
        <SEO pageTitle="Rental Device" />
        <HeaderTwo style_2={false} />
        <div className="container py-5">
          <h4 className="text-danger mb-2">Failed to load device</h4>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {toText(error?.data?.message || error?.error || "Unknown error")}
          </pre>
          <button className="btn btn-dark mt-2" onClick={() => refetch()}>
            Retry
          </button>
        </div>
        <Footer primary_style={true} />
      </Wrapper>
    );
  }

  if (!device) {
    return (
      <Wrapper>
        <SEO pageTitle="Rental Device" />
        <HeaderTwo style_2={false} />
        <div className="container py-5">
          <h4>No device found</h4>
        </div>
        <Footer primary_style={true} />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <SEO pageTitle="Rental Device" />
      <HeaderTwo style_2={false} />

      <div className="container py-4">
        <div className="row g-4">
          {/* LEFT: Images */}
          <div className="col-lg-6">
            <div className="card shadow-sm">
              <div style={{ position: "relative", width: "100%", height: 420 }}>
                <Image
                  src={mainImg}
                  alt={device?.device_name || "Device"}
                  fill
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              </div>

              {images?.length > 1 && (
                <div className="p-3 d-flex gap-2 flex-wrap">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: 70,
                        height: 70,
                        position: "relative",
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1px solid #eee",
                      }}
                    >
                      <Image
                        src={`${api.IMG_URL}/rental_device_images/${img}`}
                        alt={`thumb-${idx}`}
                        fill
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="col-lg-6">
            <div className="card shadow-sm p-4">
              <div className="text-muted mb-1">
                {toText(device?.device_category_name || device?.device_category)}
                {device?.device_sub_category_name ? ` / ${device?.device_sub_category_name}` : ""}
              </div>

              <h3 className="mb-2">{toText(device?.device_name)}</h3>

              <div className="mb-3 text-muted">
                Brand: <b className="text-dark">{toText(device?.device_brand_name || device?.device_brand)}</b>
                {device?.device_model ? (
                  <>
                    {" "}
                    | Model: <b className="text-dark">{toText(device?.device_model)}</b>
                  </>
                ) : null}
              </div>

              <div className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between">
                  <span>Per Day</span>
                  <b>{money(device?.price_per_day || device?.base_rent_per_day)}</b>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Per Week</span>
                  <b>{money(device?.base_rent_per_week)}</b>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Per Month</span>
                  <b>{money(device?.base_rent_per_month)}</b>
                </div>

                <hr />

                <div className="d-flex justify-content-between">
                  <span>Security Deposit</span>
                  <b>{money(device?.security_deposit)}</b>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Min Rental Days</span>
                  <b>{toText(device?.min_rental_days)}</b>
                </div>
              </div>

              <div className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between">
                  <span>Stock Qty</span>
                  <b>{toText(device?.stock_qty)}</b>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Available Qty</span>
                  <b>{toText(device?.available_qty)}</b>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Status</span>
                  <b className={device?.status === "active" ? "text-success" : "text-danger"}>
                    {toText(device?.status)}
                  </b>
                </div>
              </div>

              <div className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between">
                  <span>Delivery Available</span>
                  <b>{Number(device?.delivery_available) === 1 ? "Yes" : "No"}</b>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Delivery Fee</span>
                  <b>{money(device?.delivery_fee)}</b>
                </div>
              </div>

              <button className="btn btn-dark w-100 mb-2" onClick={handleRentNow}>
                <i className="fa-solid fa-cart-shopping me-2"></i>
                Rent Now
              </button>

              <button className="btn btn-outline-secondary w-100" onClick={() => router.back()}>
                Back
              </button>
            </div>
          </div>
        </div>

        <div className="card shadow-sm p-4 mt-4">
          <h5 className="mb-3">Specifications</h5>

          {specs && typeof specs === "object" ? (
            <div className="row">
              {Object.entries(specs).map(([k, v]) => (
                <div key={k} className="col-md-6 mb-2">
                  <div className="d-flex justify-content-between border rounded p-2">
                    <span className="text-muted">{k}</span>
                    <b>{toText(v)}</b>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted">No specifications</div>
          )}
        </div>
      </div>

      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default RentalDeviceSinglePage;