import React from 'react';
import SEO from '@/components/seo';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb'; 
import RepairArea from '@/components/repair/repair-area';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

const RepairPage = () => {
     const userInfo = Cookies.get("userInfo");
    const router = useRouter();
    if (!userInfo) {
        router.push("/login");
        return;
    }
    return (
        <Wrapper>
            <SEO pageTitle="Repair" />
            <HeaderTwo style_2={true} />
            <CommonBreadcrumb title="Add Repair Order
" center={true} subtitle="Repair" />
            <RepairArea />
            <Footer primary_style={true} />
        </Wrapper>
    );
};

export default RepairPage;