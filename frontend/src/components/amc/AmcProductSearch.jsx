import React, { useState } from "react";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import { useLazySearchProductsQuery } from "@/redux/features/productApi";

const AmcProductSearch = ({ onSelect }) => {

  const [triggerSearch, { data = [], isLoading }] =
    useLazySearchProductsQuery();

  const [selected, setSelected] = useState([]);

  const handleSearch = (query) => {

    if (query.length < 2) return;

    triggerSearch({
      search: query,
      type: "amc"
    });

  };

  const handleChange = (items) => {

    if (items.length > 0) {

      onSelect(items[0]);

      // ✅ clear search
      setSelected([]);

    }

  };

  return (
    <AsyncTypeahead
      id="amc-product-search"
      isLoading={isLoading}
      options={data?.data || []}
      labelKey="product_name"
      minLength={2}
      onSearch={handleSearch}
      onChange={handleChange}
      selected={selected}
      placeholder="Search Product..."
      clearButton
      maxResults={50}
      paginate={false}
      filterBy={() => true}
      renderMenuItemChildren={(option) => (

        <div key={option.product_id}>

          <div className="fw-semibold">
            {option.product_name}
          </div>

          <div style={{ fontSize: 12, color: "#666" }}>
            Brand: {option.brand_name || "-"} | Category: {option.category_name || "-"}
          </div>

        </div>

      )}
    />
  );
};

export default AmcProductSearch;