import React from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import ErrorMsg from "@/components/common/error-msg";
import { useGetCategoriesWithSubQuery } from "@/redux/features/categoryApi";
import { handleFilterSidebarClose } from "@/redux/features/shop-filter-slice";
import ShopCategoryLoader from "@/components/loader/shop/shop-category-loader";

const CategoryFilter = ({ setCurrPage, shop_right = false, setFilterData }) => {
  const { data: categories, isLoading, isError } = useGetCategoriesWithSubQuery();
  const router = useRouter();
  const dispatch = useDispatch();

  const makeSlug = (text) => text.toLowerCase().replace("&", "").split(" ").join("-");

  const handleCategoryRoute = (id) => {
    setCurrPage(1);
    setFilterData((prev) => ({ ...prev, category_id: id }));
       };

  let content = null;
  if (isLoading) content = <ShopCategoryLoader loading={isLoading} />;
  if (!isLoading && isError) content = <ErrorMsg msg="There was an error" />;
  if (!isLoading && !isError && (!categories || categories.length === 0))
    content = <ErrorMsg msg="No Category found!" />;

  if (!isLoading && !isError && categories?.length > 0) {
    content = (
      <ul>
        {categories.map((item) => (
          <li key={item.category_id}>
            <a
              onClick={() => handleCategoryRoute(item.category_id)}
              style={{ cursor: "pointer" }}
              className={Number(router.query.category) === item.category_id ? "active" : ""}
            >
              {item.category_name} <span>{item.product_count || 0}</span>
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="tp-shop-widget mb-50">
      <h3 className="tp-shop-widget-title">Categories</h3>
      <div className="tp-shop-widget-content">
        <div className="tp-shop-widget-categories">{content}</div>
      </div>
    </div>
  );
};

export default CategoryFilter;
