import React from "react";

const Name = (cell) => {
  return cell.value ? cell.value : "";
};

const CreatedBy = (cell) => {
  return cell.value ? cell.value : "";
};

const APIKeys = (cell) => {
  return (
    <input type="text" className="form-control apikey-value" readOnly defaultValue={cell.value} />
  )
};

const Status = (cell) => {
  return (
    cell.value === "Disable" ?
      <span className="badge bg-danger-subtle text-danger">{cell.value}</span>
      : cell.value === "Active" ?
      <span className="badge bg-success-subtle text-success">{cell.value}</span>
      : null
    
  )
};
const CreatedDate = (cell) => {
  return cell.value ? cell.value : "";
};
const ExpiryDate = (cell) => {
  return cell.value ? cell.value : "";
};

export { Name, CreatedBy, APIKeys, Status, CreatedDate, ExpiryDate };
