import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { getTaxesList, deleteTax } from "../../store/Tax";
import TaxAdd from "./TaxAdd";
import TaxUpdate from "./TaxUpdate";
import DeleteModal from "../../Components/Common/DeleteModal";
import { ToastContainer } from "react-toastify";

const TaxList = () => {
  document.title = "Tax List";

  const dispatch = useDispatch();

  // ✅ FIX: take loading and taxes from reducer
  const { taxes, loading } = useSelector((state) => state.TaxReducer);

  const [isOpen, setIsOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isTaxData, setIsTaxData] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedTax, setSelectedTax] = useState(null);

  useEffect(() => {
    dispatch(getTaxesList());
  }, [dispatch]);

  // ✅ Keyboard shortcut: Alt + A open modal | Alt + C close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.altKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ✅ Delete handlers
  const onClickDelete = (tax) => {
    setSelectedTax(tax);
    setDeleteModal(true);
  };

  const handleDeleteTax = () => {
    if (selectedTax) {
      dispatch(deleteTax(selectedTax.tax_id));
    }
    setDeleteModal(false);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <ToastContainer closeButton={false} limit={1} autoClose={100} />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <div className="col-sm">
                    <h5 className="mb-0 fw-bold">Tax List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsOpen(true)}>
                      + Add Tax
                    </Button>
                  </div>
                </Row>
              </CardHeader>

              {/* ✅ FIXED TABLE */}
              <CardBody className="pt-0">
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light text-uppercase text-muted">
                      <tr>
                        <th style={{ width: "5%" }}>#</th>
                        <th style={{ width: "45%" }}>Tax Name</th>
                        <th style={{ width: "45%" }}>Tax Percentage</th>
                        <th style={{ width: "25%" }}>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {!loading && taxes && taxes.length > 0 ? (
                        taxes.map((tax, index) => (
                          <tr key={tax.tax_id}>
                            <td>{index + 1}</td>
                            <td>{tax.tax_name}</td>
                            <td>{tax.tax_percentage}%</td>

                            <td>
                              <ul className="list-inline hstack gap-2 mb-0">
                                {/* ✅ Edit */}
                                <li className="list-inline-item">
                                  <button
                                    className="text-primary border-0 bg-transparent"
                                    onClick={() => {
                                      setIsTaxData(tax); // ✅ correct
                                      setIsUpdateOpen(true);
                                    }}
                                    title="Edit"
                                  >
                                    <i className="ri-pencil-fill fs-16"></i>
                                  </button>
                                </li>

                                {/* ✅ Delete */}
                                <li className="list-inline-item">
                                  <button
                                    onClick={() => onClickDelete(tax)} // ✅ correct
                                    className="text-danger border-0 bg-transparent"
                                    title="Delete"
                                  >
                                    <i className="ri-delete-bin-5-fill fs-16"></i>
                                  </button>
                                </li>
                              </ul>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center py-4">
                            <lord-icon
                              src="https://cdn.lordicon.com/msoeawqm.json"
                              trigger="loop"
                              colors="primary:#405189,secondary:#0ab39c"
                              style={{ width: "72px", height: "72px" }}
                            ></lord-icon>
                            <h6 className="mt-3 text-muted">No Taxes Found</h6>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* ✅ Add Modal */}
      {isOpen && <TaxAdd isOpen={isOpen} toggle={() => setIsOpen(false)} />}

      {/* ✅ Update Modal */}
      {isUpdateOpen && (
        <TaxUpdate
          isOpen={isUpdateOpen}
          toggle={() => setIsUpdateOpen(false)}
          taxData={isTaxData}
        />
      )}

      {/* ✅ Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteTax}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default TaxList;
