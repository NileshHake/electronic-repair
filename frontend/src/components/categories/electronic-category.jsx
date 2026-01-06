import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
// internal
import ErrorMsg from "../common/error-msg";
import { useGetCategoriesWithSubQuery } from "@/redux/features/categoryApi";
import HomeCateLoader from "../loader/home/home-cate-loader";
import { api } from "../../../config";
import defaultIMG from "../../../public/assets/img/istockphoto-1055079680-612x612.jpg"; // default image

const ElectronicCategory = () => {
  const { data: categories, isLoading, isError } =
    useGetCategoriesWithSubQuery();
  const router = useRouter();

  // handle category route
  const handleCategoryRoute = (title) => {
    router.push(
      `/shop?category=${title
        .toLowerCase()
        .replace("&", "")
        .split(" ")
        .join("-")}`
    );
  };

  // decide what to render
  let content = null;

  if (isLoading) {
    content = <HomeCateLoader loading={isLoading} />;
  } else if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  } else if (!isLoading && !isError && categories.length === 0) {
    content = <ErrorMsg msg="No Category found!" />;
  } else if (!isLoading && !isError && categories.length > 0) {
    content = categories.slice(0, 5).map((item) => (
      <div className="col" key={item._id}>
        <div className="tp-product-category-item text-center mb-40">
          <div className="tp-product-category-thumb fix">
            <a
              className="cursor-pointer"
              onClick={() => handleCategoryRoute(item.category_name)}
            >
              <Image
                src={
                  item.category_img
                    ? `${api.IMG_URL}category_img/${item.category_img}`
                    : defaultIMG
                }
                alt={item.category_name || "Category Image"}
                width={76}
                height={98}
              />
            </a>
          </div>
          <div className="tp-product-category-content">
            <h3 className="tp-product-category-title">
              <a
                className="cursor-pointer"
                onClick={() => handleCategoryRoute(item.category_name)}
              >
                {item.category_name || "Unnamed Category"}
              </a>
            </h3>
            {/* <p>{item.products.length} Product</p> */}
          </div>
        </div>
      </div>
    ));
  }

  return (
    <section className="tp-product-category pt-60 pb-15">
      <div className="container">
        <div className="row row-cols-xl-5 row-cols-lg-5 row-cols-md-4">
          {content}
        </div>
      </div>
    </section>
  );
};

export default ElectronicCategory;
