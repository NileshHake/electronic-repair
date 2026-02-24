import { useEffect, useState } from "react";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import Wrapper from "@/layout/wrapper";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import BeadingArea from "@/components/beading/beading-area";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

export default function BeadingPage() {
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
      <SEO pageTitle="Beading" />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb
        title="Add Beading Order"
        center={true}
        subtitle="Beading"
      />
      <BeadingArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
