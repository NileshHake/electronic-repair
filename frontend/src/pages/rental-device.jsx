import React, { useEffect, useState } from "react";
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import RentalDeviceArea from "@/components/RentalDevice/RentalDeviceArea";

// ✅ create this component 

const RentalDevicePage = () => {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cookie = Cookies.get("userInfo");

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

    // ✅ Require phone number before rental
    if (!userInfo?.user?.user_phone_number) {
      router.replace("/profile#nav-information");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <Wrapper>
      <SEO pageTitle="Rental Device" />
      <HeaderTwo style_2={false} />

      <RentalDeviceArea />

      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default RentalDevicePage;