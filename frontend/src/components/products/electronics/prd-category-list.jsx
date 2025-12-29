import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import ErrorMsg from "@/components/common/error-msg";
import { useGetCategoriesWithSubQuery } from "@/redux/features/categoryApi";
import CategoryListLoader from "@/components/loader/home/category-list-loader";
import { api } from "../../../../config";
import D_img from "@/components/Default/D_img";

const PrdCategoryList = () => {
  const { data: categories, isLoading, isError } =
    useGetCategoriesWithSubQuery();
  const router = useRouter();

  const handleCategoryRoute = (name, type = "parent") => {
    const param = type === "parent" ? "category" : "subCategory";
    router.push(
      `/shop?${param}=${name
        .toLowerCase()
        .replace("&", "")
        .split(" ")
        .join("-")}`
    );
  };

  let content = null;

  if (isLoading) content = <CategoryListLoader loading />;
  if (!isLoading && isError)
    content = <ErrorMsg msg="There was an error" />;

  if (!isLoading && !isError && categories?.length === 0)
    content = <ErrorMsg msg="No Category found!" />;

  if (!isLoading && !isError && categories?.length > 0) {
    content = categories.slice(0,5).map((item) => (
    <li key={item.category_id}>
        <a onClick={() => handleCategoryRoute(item.category_name)} className="cursor-pointer">{item.category_name}</a>
      </li>
    ));
  }

  return <ul>{content}</ul>;
};

export default PrdCategoryList;
