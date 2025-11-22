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
import { ToastContainer } from "react-toastify";

import DeleteModal from "../../Components/Common/DeleteModal"; 
import DeliveryBoyUpdate from "./DeliveryAndPickUpBoyUpdate";
import DeliveryBoyAdd from "./DeliveryBoyAdd";
import { deleteDeliveryBoy, getDeliveryBoysList } from "../../store/DeliveryAndPickUpBoy";

const DeliveryAndPickUpBoyList = () => {
  document.title = "Delivery / Pickup Boy List";

  const dispatch = useDispatch();
  const { deliveryBoys, loading } = useSelector(
    (state) => state.DeliveryBoyReducer
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  // ✅ Fetch Delivery Boys
  useEffect(() => {
    dispatch(getDeliveryBoysList());
  }, [dispatch]);

  // ✅ Close modals and refresh list
  const handleModalClose = () => {
    setIsAddOpen(false);
    setIsUpdateOpen(false);
    dispatch(getDeliveryBoysList());
  };

  // ✅ Delete Delivery Boy
  const onClickDelete = (deliveryBoy) => {
    setSelectedDeliveryBoy(deliveryBoy);
    setDeleteModal(true);
  };

  const handleDeleteDeliveryBoy = () => {
    if (selectedDeliveryBoy) {
      dispatch(deleteDeliveryBoy(selectedDeliveryBoy.user_id));
    }
    setDeleteModal(false);
  };

  // ✅ Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setIsAddOpen(true);
      }
      if (event.altKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        setIsAddOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <ToastContainer closeButton={false} limit={1} autoClose={800} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <div className="col-sm">
                    <h5 className="mb-0 fw-bold">Delivery / Pickup Boy List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add Delivery / Pickup Boy
                    </Button>
                  </div>
                </Row>
              </CardHeader>

              <CardBody className="pt-0">
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light text-uppercase text-muted">
                      <tr>
                        <th style={{ width: "5%" }}>#</th>
                        <th style={{ width: "20%" }}>Name</th>
                        <th style={{ width: "25%" }}>Email</th>
                        <th style={{ width: "15%" }}>Phone</th>
                        <th style={{ width: "15%" }}>Role</th>
                        <th style={{ width: "20%" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && deliveryBoys && deliveryBoys.length > 0 ? (
                        deliveryBoys.map((deliveryBoy, index) => (
                          <tr key={deliveryBoy.user_id}>
                            <td>{index + 1}</td>
                            <td>{deliveryBoy.user_name}</td>
                            <td>{deliveryBoy.user_email}</td>
                            <td>{deliveryBoy.user_phone_number}</td>
                            <td>{deliveryBoy.user_role_name || "—"}</td>

                            <td>
                              <ul className="list-inline hstack gap-2 mb-0">
                                <li className="list-inline-item">
                                  <button
                                    className="text-primary border-0 bg-transparent"
                                    onClick={() => {
                                      setSelectedDeliveryBoy(deliveryBoy);
                                      setIsUpdateOpen(true);
                                    }}
                                  >
                                    <i className="ri-pencil-fill fs-16"></i>
                                  </button>
                                </li>
                                <li className="list-inline-item">
                                  <button
                                    onClick={() => onClickDelete(deliveryBoy)}
                                    className="text-danger border-0 bg-transparent"
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
                          <td colSpan="6" className="text-center py-4">
                            <h6 className="mt-3 text-muted">
                              No Delivery / Pickup Boys Found
                            </h6>
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
      {isAddOpen && (
        <DeliveryBoyAdd isOpen={isAddOpen} toggle={handleModalClose} />
      )}

      {/* ✅ Update Modal */}
      {isUpdateOpen && (
        <DeliveryBoyUpdate
          isOpen={isUpdateOpen}
          toggle={handleModalClose}
          deliveryBoyDataToEdit={selectedDeliveryBoy}
        />
      )}

      {/* ✅ Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteDeliveryBoy}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default DeliveryAndPickUpBoyList;
