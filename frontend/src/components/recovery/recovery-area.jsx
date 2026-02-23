// components/RecoveryArea.js
import React from "react";
import RecoveryForm from "./RecoveryForm";
import MyRecoveriesTable from "./MyRecoveriesTable";
// import RecoveryForm from "./RecoveryForm";
// import MyRecoveriesTable from "./MyRecoveriesTable";

const RecoveryArea = () => {
    return (
        <div className="container mt-4">
            <div className="row g-4">
                <div className="col-lg-4 col-md-12 pb-3">
                    <RecoveryForm />
                </div>

                {/* RIGHT SIDE → Recovery List */}
                <div className="col-lg-8 col-md-12 pb-3">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="mb-3 fw-bold text-dark">
                                My Recoveries
                            </h5>

                            <MyRecoveriesTable />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RecoveryArea;