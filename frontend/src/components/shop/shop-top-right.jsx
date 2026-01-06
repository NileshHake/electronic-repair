import React from "react";
import NiceSelect from "@/ui/nice-select";

const ShopTopRight = ({ selectHandleFilter ,otherProps }) => {
  return (
    <div className="tp-shop-top-right d-sm-flex align-items-center justify-content-xl-end">
      <div className="tp-shop-top-select">
        <NiceSelect
          options={[
            { value: "", text: "Default Sorting" },
            { value: "low_to_high", text: "Low to High" },
            { value: "high_to_low", text: "High to Low" },
            { value: "new", text: "New Added" },
            { value: "sale", text: "On Sale" },
          ]}

          defaultCurrent={0}
          onChange={(e) => selectHandleFilter(e.value)}
          name="sorting"
        />
      </div>
    </div>
  );
};

export default ShopTopRight;
