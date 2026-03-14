import React, { useState } from "react";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import { useLazySearchDeviceTypeQuery } from "@/redux/features/devicetypeApi";

const AmcProductSearch = ({ onSelect }) => {

  const [triggerSearch, { data = [], isLoading }] =
    useLazySearchDeviceTypeQuery();

  const [selected, setSelected] = useState([]);

  const handleSearch = (query) => {

    if (query.length < 2) return;

    triggerSearch(query);

  };

  const handleChange = (items) => {

    if (items.length > 0) {

      onSelect(items[0]);

      // clear search
      setSelected([]);

    }

  };

  return (
    <AsyncTypeahead
      id="device-type-search"
      isLoading={isLoading}
      options={data || []}
      labelKey="device_type_name"
      minLength={2}
      onSearch={handleSearch}
      onChange={handleChange}
      selected={selected}
      placeholder="Search Device Type..."
      clearButton
      maxResults={50}
      paginate={false}
      filterBy={() => true}
      renderMenuItemChildren={(option) => (

        <div key={option.device_type_id}>

          <div className="fw-semibold">
            {option.device_type_name}
          </div>

          <div style={{ fontSize: 12, color: "#666" }}>
            Carry / Month: ₹{Number(option.carry_price_per_month)} |
            Onsite / Month: ₹{Number(option.onsite_price_per_month)}
          </div>

        </div>

      )}
    />
  );
};

export default AmcProductSearch;