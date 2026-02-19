import React from "react";
import { useRouter } from "next/router";
import ErrorMsg from "@/components/common/error-msg";
import { useGetCategoriesWithSubQuery } from "@/redux/features/categoryApi";
import CategoryListLoader from "@/components/loader/home/category-list-loader";

const PrdCategoryList = () => {
  const { data: categories, isLoading, isError } =
    useGetCategoriesWithSubQuery();
  const router = useRouter();

  // ✅ Navigate using category_id
  const handleCategoryRoute = (category_id) => {
    router.push({
      pathname: "/shop",
      query: {
        category_id: category_id,
      },
    });
  };

  let content = null;

  if (isLoading) content = <CategoryListLoader loading />;
  if (!isLoading && isError)
    content = <ErrorMsg msg="There was an error" />;

  if (!isLoading && !isError && categories?.length === 0)
    content = <ErrorMsg msg="No Category found!" />;

  if (!isLoading && !isError && categories?.length > 0) {
    content = categories.slice(0, 5).map((item) => (
      <li key={item.category_id}>
        <a
          onClick={() => handleCategoryRoute(item.category_id)}
          className="cursor-pointer"
        >
          {item.category_name}
        </a>
      </li>
    ));
  }

  return <ul>{content}</ul>;
};

export default PrdCategoryList;
