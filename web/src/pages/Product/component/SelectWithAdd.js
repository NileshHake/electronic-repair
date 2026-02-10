import React from "react";
import { Label } from "reactstrap";
import Select from "react-select";

const SelectWithAdd = ({
  label,
  placeholder,
  options = [],
  onAddClick,
  onChange,
  status,
  isMulti = false,
  value, // ✅ NEW
}) => {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <Label className="fw-bold mb-0">{label}</Label>
        {status && (
          <span
            role="button"
            onClick={onAddClick}
            className="text-success fw-bold me-2"
            style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
          >
            +
          </span>
        )}
      </div>

      <Select
        placeholder={placeholder}
        options={options}
        isMulti={isMulti}
        value={value} // ✅ CONTROLLED
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: "38px",
            backgroundColor: "#fff",
            borderColor: state.isFocused ? "#0ab39c" : "#ced4da",
            boxShadow: "none",
            ":hover": { borderColor: "#0ab39c" },
          }),
        }}
        onChange={(selected) => {
          if (isMulti) onChange(selected || []);
          else onChange(selected?.value || "");
        }}
      />
    </>
  );
};

export default SelectWithAdd;
