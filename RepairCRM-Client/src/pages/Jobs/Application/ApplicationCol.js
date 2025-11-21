import React from "react";
import { NavLink } from "react-router-dom";

const AppId = (cell) => {
  return (
    <NavLink to="#" className="text-body fw-bold">
      {cell.value ? cell.value : ""}
    </NavLink>
  );
};
const Name = (cell) => {
  return <React.Fragment>{cell.value}</React.Fragment>;
};
const Designation = (cell) => {
  return <React.Fragment>{cell.value}</React.Fragment>;
};

const Date = (cell) => {
  return <React.Fragment>{cell.value}</React.Fragment>;
};

const Contact = (cell) => {
  return <React.Fragment>{cell.value}</React.Fragment>;
};
const Type = (cell) => {
  return <React.Fragment>{cell.value}</React.Fragment>;
};

const Status = (cell) => {
  return (
    <React.Fragment>
      {cell.value === "NEW" ? (
        <span className="badge bg-info-subtle text-info text-uppercase">
          {cell.value}
        </span>
      ) : cell.value === "REJECTED" ? (
        <span className="badge bg-danger-subtle text-danger text-uppercase">
          {cell.value}
        </span>
      ) : cell.value === "PENDING" ? (
        <span className="badge bg-warning-subtle text-warning text-uppercase">
          {cell.value}
        </span>
      ) : cell.value === "APPROVED" ? (
        <span className="badge bg-success-subtle text-success text-uppercase">
          {cell.value}
        </span>
      ) : null}
    </React.Fragment>
  );
};

export { AppId, Name, Designation, Date, Contact, Type, Status };
