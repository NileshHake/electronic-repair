// components/beading/beading-area.jsx
import React from "react";
import BeadingForm from "./BeadingForm";
import BeadingOrders from "./BeadingOrders"; 

const BeadingArea = () => {
   
    return (
        <div className="container mt-4">
            <div className="row g-4">

                {/* Left Column: Beading Form */}
                <div className="col-lg-4 col-md-12 pb-3">
                    <BeadingForm />
                </div>

                {/* Right Column: Beading Orders Table */}
                <div className="col-lg-8 col-md-12 pb-3">

                    <p className="text-muted">
                        <BeadingOrders />
                    </p>

                </div>

            </div>
        </div>
    );
};

export default BeadingArea;
