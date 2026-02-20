// components/RepairArea.js
import React from "react";
import RepairForm from "./repair-form";
import MyRepairsTable from "./MyRepairsTable";
const RepairArea = () => {
  return (
    <div className="container mt-4">
      <div className="row g-4"> 
        <div className="col-lg-4 col-md-12 pb-3">
          <RepairForm />
        </div>
        <div className="col-lg-8 col-md-12 pb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="mb-3 fw-bold">My Repairs</h5>
              <MyRepairsTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairArea;
