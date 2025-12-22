import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useGetCategoriesWithSubQuery } from "@/redux/features/categoryApi";
import ErrorMsg from "@/components/common/error-msg";
import Loader from "@/components/loader/loader";
import { api } from "../../../../config";
import D_img from "@/components/Default/D_img";

const HeaderCategory = ({ isCategoryActive }) => {
  const { data: categories, isLoading, isError } =
    useGetCategoriesWithSubQuery();
  const router = useRouter();

  const handleCategoryRoute = (name, type) => {
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

  if (isLoading) content = <Loader loading />;
  if (!isLoading && isError) content = <ErrorMsg msg="There was an error" />;
  if (!isLoading && !isError && categories?.length === 0)
    content = <ErrorMsg msg="No Category found!" />;

  if (!isLoading && !isError && categories?.length > 0) {
    content = categories.map((item) => (
      <li className="has-dropdown" key={item.category_id}>
        {/* Parent Category */}
        <a
          className="cursor-pointer"
          onClick={() =>
            handleCategoryRoute(item.category_name, "parent")
          }
        >
        {item.category_img ? (
  <span>
    <Image
      src={`${api.IMG_URL}category_img/${item.category_img}`}
      alt={item.category_name}
      width={50}
      height={50}
    />
  </span>
) : (
  <D_img />
)}
{item.category_name}

        </a>

        {/* Sub Categories */}
        {item.children?.length > 0 && (
          <ul className="tp-submenu">
            {item.children.map((child) => (
              <li
                key={child.category_id}
                onClick={() =>
                  handleCategoryRoute(child.category_name, "children")
                }
              >
                <a className="cursor-pointer">
                  {child.category_name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </li>
    ));
  }

  return <ul className={isCategoryActive ? "active" : ""}>{content}</ul>;
};

export default HeaderCategory;
