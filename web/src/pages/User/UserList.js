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
import UserAdd from "./UserAdd";
import UserUpdate from "./UserUpdate";
import { getUsersList, deleteUser } from "../../store/User";

const UserList = () => {
  document.title = "User List";

  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.UserReducer);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  // ✅ Fetch users
  useEffect(() => {
    dispatch(getUsersList());
  }, [dispatch]);

  // ✅ Close modals and refresh list
  const handleModalClose = () => {
    setIsAddOpen(false);
    setIsUpdateOpen(false);
    dispatch(getUsersList());
  };

  // ✅ Delete user
  const onClickDelete = (user) => {
    setSelectedUser(user);
    setDeleteModal(true);
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      dispatch(deleteUser(selectedUser.user_id));
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
                    <h5 className="mb-0 fw-bold">User List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add User
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
                        <th style={{ width: "15%" }}>Access</th>
                        <th style={{ width: "15%" }}>Role</th>
                        <th style={{ width: "20%" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && users && users.length > 0 ? (
                        users.map((user, index) => (
                          <tr key={user.user_id}>
                            <td>{index + 1}</td>
                            <td>{user.user_name}</td>
                            <td>{user.user_email}</td>
                            <td>{user.user_phone_number}</td>
                            <td>{user.role_name || "—"}</td>
                            <td>
                              {user.user_type == 3
                                ? "User"
                                : user.user_type == 4
                                ? "Technician"
                                : "Delivery boy"}
                            </td>

                            <td>
                              <ul className="list-inline hstack gap-2 mb-0">
                                <li className="list-inline-item">
                                  <button
                                    className="text-primary border-0 bg-transparent"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsUpdateOpen(true);
                                    }}
                                  >
                                    <i className="ri-pencil-fill fs-16"></i>
                                  </button>
                                </li>
                                <li className="list-inline-item">
                                  <button
                                    onClick={() => onClickDelete(user)}
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
                            <h6 className="mt-3 text-muted">No Users Found</h6>
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
      {isAddOpen && <UserAdd isOpen={isAddOpen} toggle={handleModalClose} />}

      {/* ✅ Update Modal — FIXED PROP NAME */}
      {isUpdateOpen && (
        <UserUpdate
          isOpen={isUpdateOpen}
          toggle={handleModalClose}
          userDataToEdit={selectedUser} // ✅ Correct prop name
        />
      )}

      {/* ✅ Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteUser}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default UserList;
