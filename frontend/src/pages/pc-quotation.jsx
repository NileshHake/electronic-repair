import React, { useEffect, useState } from "react";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import Wrapper from "@/layout/wrapper";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import RepairArea from "@/components/repair/repair-area";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import PCQuotationArea from "@/components/pc-quotation/pc-quotation-aera";

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
      if (!userInfo?.user?.user_phone_number) {
       router.replace("/profile#nav-information");
       return;
     }
 
     setReady(true);
   }, [router]);
 
   if (!ready) return null;
  return (
    <Wrapper>
      <SEO pageTitle="Repair" />
      <HeaderTwo style_2={false} />
     
      <PCQuotationArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default PCQuotationPage;
