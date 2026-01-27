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
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const userInfo = Cookies.get("userInfo");

    if (!userInfo) {
      router.replace("/login"); // ✅ better than push
      return;
    }

    setIsAllowed(true);
  }, [router]);

  // ✅ Avoid render until auth check done
  if (!isAllowed) return null; // or loader

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
