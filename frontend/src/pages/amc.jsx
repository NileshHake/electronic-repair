import React, { useEffect, useState } from "react";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import Wrapper from "@/layout/wrapper";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import AmcArea from "@/components/amc/amc-area";

const AmcPage = () => {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cookie = Cookies.get("userInfo");

    // Not logged in
    if (!cookie) {
      router.replace("/login");
      return;
    }

    let userInfo;

    try {
      userInfo = JSON.parse(cookie);
    } catch (e) {
      router.replace("/login");
      return;
    }

    // Phone number check
    if (!userInfo?.user?.user_phone_number) {
      router.replace("/profile#nav-information");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <Wrapper>
      <SEO pageTitle="AMC Service" />
      <HeaderTwo style_2={true} />

      <CommonBreadcrumb
        title="Add AMC Request"
        center={true}
        subtitle="AMC Service"
      />

      <AmcArea />

      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default AmcPage;