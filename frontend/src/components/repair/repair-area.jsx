// components/RepairArea.js
import React from "react"; 
import RepairForm from "./repair-form";
const RepairArea = () => {
  return (
    <div className="container mt-4">
      <div className="row g-4">
        {/* Left Column: Repair Form */}
        <div className="col-lg-4 col-md-12 pb-3">    
          <RepairForm />
        </div>

        {/* Right Column: Repair Orders Table (just placeholder for now) */}
        <div className="col-lg-8 col-md-12 pb-3">
          {/* You 5can create a separate component RepairOrders.js and call it here */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="card-title mb-3">Repair Orders</h3>
              <p className="text-muted">Repair orders table will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairArea;
