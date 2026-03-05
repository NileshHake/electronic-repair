import React, { useEffect } from "react";
import { useRouter } from "next/router";

import ProfileNavTab from "./profile-nav-tab";
import ProfileShape from "./profile-shape";
import NavProfileTab from "./nav-profile-tab";
import ProfileInfo from "./profile-info";
import ChangePassword from "./change-password";
import MyOrders from "./my-orders";
import QuotationTab from "./quotations";
import GSTVerification from "./gst-verification";
import RentalRequests from "./RentalRequests";

const ProfileArea = ({ orderData, quotationData }) => {
  const router = useRouter();

  useEffect(() => {
    const activateTabByHash = async () => {
      const hash = window.location.hash || "#nav-profile"; // default tab

      // Bootstrap Tab JS load (only client side)
      const bs = await import("bootstrap/dist/js/bootstrap.bundle.min.js");

      // Find the tab button that targets this hash
      const triggerEl = document.querySelector(
        `[data-bs-toggle="tab"][data-bs-target="${hash}"],` +
        `[data-toggle="tab"][data-target="${hash}"],` + // old bootstrap support
        `a[href="${hash}"]`
      );

      if (triggerEl && bs?.Tab) {
        const tab = bs.Tab.getOrCreateInstance(triggerEl);
        tab.show();
      }
    };

    activateTabByHash();

    // when hash changes (footer click, back/forward)
    const onHashChange = () => activateTabByHash();

    window.addEventListener("hashchange", onHashChange);
    router.events?.on("hashChangeComplete", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      router.events?.off("hashChangeComplete", onHashChange);
    };
  }, [router]);

  return (
    <section className="profile__area pt-120 pb-120">
      <div className="container">
        <div className="profile__inner p-relative">
          <ProfileShape />
          <div className="row">
            <div className="col-xxl-4 col-lg-4">
              <div className="profile__tab mr-40">
                <ProfileNavTab />
              </div>
            </div>

            <div className="col-xxl-8 col-lg-8">
              <div className="profile__tab-content">
                <div className="tab-content" id="profile-tabContent">
                  {/* Profile */}
                  <div
                    className="tab-pane fade show active"
                    id="nav-profile"
                    role="tabpanel"
                    aria-labelledby="nav-profile-tab"
                  >
                    <NavProfileTab orderData={orderData} />
                  </div>

                  {/* Information */}
                  <div
                    className="tab-pane fade"
                    id="nav-information"
                    role="tabpanel"
                    aria-labelledby="nav-information-tab"
                  >
                    <ProfileInfo />
                  </div>

                  {/* Orders */}
                  <div
                    className="tab-pane fade"
                    id="nav-order"
                    role="tabpanel"
                    aria-labelledby="nav-order-tab"
                  >
                    <MyOrders orderData={orderData} />
                  </div>

                  {/* Quotation */}
                  <div
                    className="tab-pane fade"
                    id="nav-quotation"
                    role="tabpanel"
                    aria-labelledby="nav-quotation-tab"
                  >
                    <QuotationTab quotationData={quotationData} />
                  </div>

                  {/* Password */}
                  <div
                    className="tab-pane fade"
                    id="nav-password"
                    role="tabpanel"
                    aria-labelledby="nav-password-tab"
                  >
                    <ChangePassword />
                  </div>
                  {/* GST Verification */}
                  <div
                    className="tab-pane fade"
                    id="nav-gst"
                    role="tabpanel"
                    aria-labelledby="nav-gst-tab"
                  >
                    <GSTVerification />
                  </div>
                  <div
                    className="tab-pane fade"
                    id="nav-rental"
                    role="tabpanel"
                    aria-labelledby="nav-rental-tab"
                  >
                    <RentalRequests />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileArea;
