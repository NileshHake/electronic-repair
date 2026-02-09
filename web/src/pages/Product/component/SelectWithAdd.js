import React from "react";
import { Label } from "reactstrap";
import Select from "react-select";

const SelectWithAdd = ({ label, placeholder, options, onAddClick, onChange ,status }) => {
    return (
        <>
            <div className="d-flex justify-content-between align-items-center">
                <Label className="fw-bold mb-0">{label}</Label>
                {status && <span
                    role="button"
                    onClick={onAddClick}
                    className="text-success fw-bold me-2"
                    style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
                >
                    +
                </span>}
            </div>

            <Select
                placeholder={placeholder}
                options={options}
                onChange={(selected) => onChange(selected?.value || "")}
            />
        </>
    );
};

export default SelectWithAdd;
