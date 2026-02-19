import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useGetCategoriesWithSubQuery } from "@/redux/features/categoryApi";
import ErrorMsg from "@/components/common/error-msg";
import Loader from "@/components/loader/loader";
import { api } from "../../../../config";
import defaultIMG from "../../../../public/assets/img/istockphoto-1055079680-612x612.jpg";

const HeaderCategory = ({ isCategoryActive }) => {
  const { data: categories, isLoading, isError } =
    useGetCategoriesWithSubQuery();
  const router = useRouter();

  // ✅ Common router function
  const goShop = (category_id) => {
    router.push({
      pathname: "/shop",
      query: {
        category_id: category_id,
      },
    });
  };

  let content = null;

  if (isLoading) content = <Loader loading />;
  if (!isLoading && isError) content = <ErrorMsg msg="There was an error" />;
  if (!isLoading && !isError && (!categories || categories?.length === 0))
    content = <ErrorMsg msg="No Category found!" />;

  if (!isLoading && !isError && categories?.length > 0) {
    content = categories.map((item) => (
      <li className="has-dropdown" key={item.category_id}>
        
        {/* ✅ Parent Category */}
        <a
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            goShop(item.category_id); // send parent id
          }}
        >
          <span>
            <Image
              src={
                item.category_img
                  ? `${api.IMG_URL}category_img/${item.category_img}`
                  : defaultIMG
              }
              alt={item.category_name}
              width={50}
              height={50}
            />
          </span>
          {item.category_name}
        </a>

        {/* ✅ Sub Categories */}
        {item.children?.length > 0 && (
          <ul className="tp-submenu">
            {item.children.map((child) => (
              <li key={child.category_id}>
                <a
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();

                    // 🔥 Send category_main_id instead of child id
                    goShop(child.category_main_id);
                  }}
                >
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
