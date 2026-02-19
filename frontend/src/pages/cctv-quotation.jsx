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
    // ✅ runs only in browser
    const userInfo = Cookies.get("userInfo");

    if (!userInfo) {
        
      router.replace("/login"); // replace is better than push for auth redirect
      return;
    }

    setReady(true);
  }, [router]);

  // ✅ while checking cookie, show nothing (or loader)
  if (!ready) return null;

  return (
    
     <Wrapper>
      <SEO pageTitle="CCTV" />
      <HeaderTwo style_2={false} />
     
         <CCTVQuotationArea/>
 
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default PCQuotationPage;
