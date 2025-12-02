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
import { api } from "../../config";

const CustomerList = () => {
  document.title = "User List";
  const { permissions } = AuthUser();
  const dispatch = useDispatch();

  const {
    customerList = [], // 👉 isko ab user list maan rahe hain
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
  const onClickDelete = (user) => {
    setSelectedCustomer(user);
    setDeleteModal(true);
  };

  const handleDeleteCustomer = () => {
    if (selectedCustomer) {
      // ⚠️ yaha tumhare backend ke hisab se id ka naam check karna:
      // agar user_id hai:
      dispatch(deleteCustomer(selectedCustomer.user_id));
      // agar abhi bhi customer_id hai to upar wala line:
      // dispatch(deleteCustomer(selectedCustomer.customer_id));
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

  // ✅ Helper: address string banana
  const getAddressText = (user) => {
    const parts = [
      user.user_address_city,
      user.user_address_block,
      user.user_address_district,
      user.user_address_state,
      user.user_address_pincode,
    ].filter(Boolean);
    return parts.join(", ");
  };

  // ✅ Helper: profile image path
  const getProfileImage = (user) => {
    if (!user.user_profile) return null;
    if (user.user_profile.startsWith("http")) return user.user_profile;
    return `${api.IMG_URL}user_profile/${user.user_profile}`;
  };

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
                        <th>Profile</th>
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
                        customerList.map((user, index) => {
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

                          const profileImg = getProfileImage(user);

                          return (
                            <tr key={user.user_id || index}>
                              <td>{index + 1}</td>

                              {/* Profile */}
                              <td>
                                {profileImg ? (
                                  <img
                                    src={profileImg}
                                    alt={user.user_name}
                                    style={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: "50%",
                                      backgroundColor: "#e9ecef",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: 14,
                                      fontWeight: 600,
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    {user.user_name
                                      ? user.user_name.charAt(0)
                                      : "U"}
                                  </div>
                                )}
                              </td>

                              {/* Name */}
                              <td>{user.user_name}</td>

                              {/* Phone */}
                              <td>{user.user_phone_number}</td>

                              {/* Email */}
                              <td>{user.user_email}</td>

                              

                              {/* Address */}
                              <td>{getAddressText(user)}</td>

                              {/* Actions */}
                              <td>
                                <ul className="list-inline hstack gap-2 mb-0">
                                  {canUpdate && (
                                    <li className="list-inline-item">
                                      <button
                                        className="text-primary border-0 bg-transparent"
                                        onClick={() => {
                                          setSelectedCustomer(user);
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
                                        onClick={() => onClickDelete(user)}
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
