import { GridTab, ListTab } from "@/svg";
import React from "react";

const ShopTopLeft = ({total,showing=9}) => {
  return (
    <>
      <div className="tp-shop-top-left d-flex align-items-center ">
        <div className="tp-shop-top-tab tp-tab">
        
        </div>
        <div className="tp-shop-top-result">
          <p>Showing 1–{showing} of {total} results</p>
        </div>
      </div>
    </>
  );
};

export default ShopTopLeft;
