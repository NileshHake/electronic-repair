import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import Wrapper from "@/layout/wrapper";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb"; 
import BeadingArea from "@/components/beading/beading-area";

export default function BeadingPage() {
  return (
    <Wrapper>
      <SEO pageTitle="Beading" />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title="Add Beading Order" center={true} subtitle="Beading" />
      <BeadingArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
