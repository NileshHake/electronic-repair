import { useRouter } from "next/router";
import React from "react";

const ResetButton = ({
  setFilterData,
  setPriceValue,
  setSelectValue,
  setCurrPage,
}) => {
  const handleReset = () => {
    setFilterData({
      category_id: null,
      brand_id: null,
    });

    setPriceValue([0, 999999]);
    setSelectValue("default");
    setCurrPage(1);
  };

  return (
    <div className="tp-shop-widget mb-50">
      <h3 className="tp-shop-widget-title">Reset Filter</h3>
      <button onClick={handleReset} className="tp-btn">
        Reset Filter
      </button>
    </div>
  );
};


export default ResetButton;
