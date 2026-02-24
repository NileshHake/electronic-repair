import React, { useEffect, useState } from "react";
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import CCTVQuotationArea from "@/components/cctv-quotation/cctv-quotation-aera";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";

const PCQuotationPage = () => {
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
      <SEO pageTitle="CCTV" />
      <HeaderTwo style_2={false} />

      <CCTVQuotationArea />

      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default PCQuotationPage;
