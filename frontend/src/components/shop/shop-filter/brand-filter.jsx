import React from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import ErrorMsg from "@/components/common/error-msg";
import { useGetallBrandsQuery } from "@/redux/features/brandApi";
import { handleFilterSidebarClose } from "@/redux/features/shop-filter-slice";
import ShopCategoryLoader from "@/components/loader/shop/shop-category-loader";

const BrandFilter = ({ setCurrPage, setFilterData, shop_right = false }) => {
  const { data: brands, isLoading, isError } = useGetallBrandsQuery();
  const router = useRouter(); 

  const handleBrandRoute = (id) => {
    setCurrPage(1);
    setFilterData((prev) => ({ ...prev, brand_id: id }));
    
  };

  let content = null;
  if (isLoading) content = <ShopCategoryLoader loading={isLoading} />;
  if (!isLoading && isError) content = <ErrorMsg msg="There was an error" />;
  if (!isLoading && !isError && (!brands || brands.length === 0))
    content = <ErrorMsg msg="No Brand found!" />;

  if (!isLoading && !isError && brands?.length > 0) {
    content = (
      <ul>
        {brands.map((item) => (
          <li key={item.brand_id}>
            <a
              onClick={() => handleBrandRoute(item.brand_id)}
              style={{ cursor: "pointer" }}
              className={Number(router.query.brand) === item.brand_id ? "active" : ""}
            >
              {item.brand_name}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="tp-shop-widget mb-50">
      <h3 className="tp-shop-widget-title">Brands</h3>
      <div className="tp-shop-widget-content">
        <div className="tp-shop-widget-categories">{content}</div>
      </div>
    </div>
  );
};

export default BrandFilter;
