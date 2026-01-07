import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import ShopBreadcrumb from "@/components/breadcrumb/shop-breadcrumb";
import ShopArea from "@/components/shop/shop-area";
import { useGetAllProductsQuery } from "@/redux/features/productApi";
import ErrorMsg from "@/components/common/error-msg";
import Footer from "@/layout/footers/footer";
import ShopLoader from "@/components/loader/shop/shop-loader";
import { api } from "../../config";

const ShopPage = () => {
  const router = useRouter();
  const { category_id, brand_id } = router.query;

  const [currPage, setCurrPage] = useState(1);
  const [priceValue, setPriceValue] = useState([0, 999999]);
  const [selectValue, setSelectValue] = useState("default");
  const [filterData, setFilterData] = useState({
    category_id: null,
    brand_id: null,
  });

  // ✅ Set filterData when query params arrive
  useEffect(() => {
    if (category_id || brand_id) {
       
       

      setFilterData({
        category_id: category_id ? Number(category_id) : null,
        brand_id: brand_id ? Number(brand_id) : null,
      });
    }
  }, [category_id, brand_id]);

  // ✅ API BODY
  const apiBody = {
    page: currPage,
    limit: 12,
    category_id: filterData.category_id,
    brand_id: filterData.brand_id,
    min_price: priceValue[0],
    max_price: priceValue[1],
    sort: selectValue, // low_to_high | high_to_low | new | sale
  };
   

  const { data, isLoading, isError } = useGetAllProductsQuery(apiBody);

  const otherProps = {
    currPage,
    setCurrPage,
    selectHandleFilter: (val) => {
      setCurrPage(1);
      setSelectValue(val);
    },
  };

  let content = null;

  if (isLoading) {
    content = <ShopLoader loading />;
  } else if (isError) {
    content = <ErrorMsg msg="There was an error" />;
  } else {
    content = (
      <ShopArea
        all_products={data?.data || []}
        products={data?.data || []}
        otherProps={otherProps}
        selectValue={selectValue}
        setPriceValue={setPriceValue}
        setFilterData={setFilterData}
      />
    );
  }

  return (
    <Wrapper>
      <SEO pageTitle="Shop" />
      <HeaderTwo style_2 />
      <ShopBreadcrumb title="Shop Grid" subtitle="Shop Grid" />
      {content}
      <Footer primary_style />
    </Wrapper>
  );
};

export default ShopPage;
