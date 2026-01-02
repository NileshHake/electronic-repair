import React from "react";
import menu_data from "@/data/menu-data";
import Link from "next/link";
import Image from "next/image";
import OfferCouponArea from "@/components/offerHeader/OfferCouponArea";
import { useGetProductTypeQuery } from "@/redux/features/productApi";
import { HomeNewArrivalPrdLoader } from "@/components/loader";
import ErrorMsg from "@/components/common/error-msg";
import ProductItem from "@/components/products/electronics/product-item";

const Menus = () => {
  
  return (
    <ul>
      {menu_data.map((menu) =>

        <li key={menu.id} className=" has-mega-menu">
          <Link href={menu.link}>{menu.title}</Link>

        </li>

      )}
    </ul>
  );
};

export default Menus;
