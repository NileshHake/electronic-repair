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
import CustomerAdd from "./CustomerAdd";
import CustomerUpdate from "./CustomerUpdate";

import {
  getCustomerList,
  deleteCustomer,
  resetAddCustomerResponse,
  resetUpdateCustomerResponse,
} from "../../store/Customer";
import AuthUser from "../../helpers/AuthType/AuthUser";

const CustomerList = () => {
  document.title = "Customer List";
  const { permissions } = AuthUser();
  const dispatch = useDispatch();

  const {
    customerList = [],
    loading = false,
    addCustomerResponse = false,
    updateCustomerResponse = false,
  } = useSelector((state) => state.CustomerReducer || {});

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  // ✅ Initial fetch
  useEffect(() => {
    dispatch(getCustomerList());
  }, [dispatch]);

  // ✅ Refresh after add/update
  useEffect(() => {
    if (addCustomerResponse) {
      dispatch(getCustomerList());
      dispatch(resetAddCustomerResponse());
      setIsAddOpen(false);
    }
    if (updateCustomerResponse) {
      dispatch(getCustomerList());
      dispatch(resetUpdateCustomerResponse());
      setIsUpdateOpen(false);
    }
  }, [addCustomerResponse, updateCustomerResponse, dispatch]);

  // ✅ Delete
  const onClickDelete = (customer) => {
    setSelectedCustomer(customer);
    setDeleteModal(true);
  };

  const handleDeleteCustomer = () => {
    if (selectedCustomer) {
      dispatch(deleteCustomer(selectedCustomer.customer_id));
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
                    <h5 className="mb-0 fw-bold">Customer List</h5>
                  </div>
                  <div className="col-sm-auto">
                      {permissions.find(
                        (permission) =>
                          permission.permission_category == "CUSTOMER" &&
                          permission.permission_path == "2"
                      ) && (
                      <Button
                        color="success"
                        onClick={() => setIsAddOpen(true)}
                      >
                        + Add Customer
                      </Button>
                    )}
                  </div>
                </Row>
              </CardHeader>

              <CardBody className="pt-0">
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light text-uppercase text-muted">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Phone Number</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.find(
                        (permission) =>
                          permission.permission_category === "CUSTOMER" &&
                          permission.permission_path === "1"
                      ) &&
                      customerList &&
                      customerList.length > 0 ? (
                        customerList.map((customer, index) => {
                          // Check permissions for update and delete
                          const canUpdate = permissions.some(
                            (p) =>
                              p.permission_category === "CUSTOMER" &&
                              p.permission_path === "3"
                          );
                          const canDelete = permissions.some(
                            (p) =>
                              p.permission_category === "CUSTOMER" &&
                              p.permission_path === "4"
                          );

                          return (
                            <tr key={customer.customer_id || index}>
                              <td>{index + 1}</td>
                              <td>{customer.customer_name}</td>
                              <td>{customer.customer_phone_number}</td>
                              <td>{customer.customer_email}</td>
                              <td>{customer.customer_address}</td>
                              <td>
                                <ul className="list-inline hstack gap-2 mb-0">
                                  {canUpdate && (
                                    <li className="list-inline-item">
                                      <button
                                        className="text-primary border-0 bg-transparent"
                                        onClick={() => {
                                          setSelectedCustomer(customer);
                                          setIsUpdateOpen(true);
                                        }}
                                      >
                                        <i className="ri-pencil-fill fs-16"></i>
                                      </button>
                                    </li>
                                  )}
                                  {canDelete && (
                                    <li className="list-inline-item">
                                      <button
                                        className="text-danger border-0 bg-transparent"
                                        onClick={() => onClickDelete(customer)}
                                      >
                                        <i className="ri-delete-bin-5-fill fs-16"></i>
                                      </button>
                                    </li>
                                  )}
                                </ul>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-5">
                            <lord-icon
                              src="https://cdn.lordicon.com/msoeawqm.json"
                              trigger="loop"
                              colors="primary:#405189,secondary:#0ab39c"
                              style={{ width: "72px", height: "72px" }}
                            ></lord-icon>
                            <div className="mt-4">
                              <h5>Sorry! No Result Found</h5>
                            </div>
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
        <CustomerAdd isOpen={isAddOpen} toggle={() => setIsAddOpen(false)} />
      )}

      {/* ✅ Update Modal */}
      {isUpdateOpen && (
        <CustomerUpdate
          isOpen={isUpdateOpen}
          toggle={() => setIsUpdateOpen(false)}
          customerDataToEdit={selectedCustomer}
        />
      )}

      {/* ✅ Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteCustomer}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default CustomerList;
