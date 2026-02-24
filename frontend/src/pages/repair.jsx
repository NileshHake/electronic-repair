import React, { useEffect, useState } from "react";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import Wrapper from "@/layout/wrapper";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import RepairArea from "@/components/repair/repair-area";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const RepairPage = () => {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cookie = Cookies.get("userInfo");

    // ✅ Not logged in
    if (!cookie) {
      router.replace("/login");
      return;
    }

    // ✅ Parse user info
    let userInfo;
    try {
      userInfo = JSON.parse(cookie);
    } catch (e) {
      router.replace("/login");
      return;
    }

    // ✅ If phone number missing → redirect to profile
    if (!userInfo?.user_phone_number) {
      router.replace("/profile#nav-information");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <Wrapper>
      <SEO pageTitle="Repair" />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb
        title="Add Repair Order"
        center={true}
        subtitle="Repair"
      />
      <RepairArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default RepairPage;