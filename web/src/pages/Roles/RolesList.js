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
import RoleCreateModal from "./RoleCreateModal";
import {
  deleteRole,
  getRole,
  resetAddRoleResponse,
  resetUpdateRoleResponse,
} from "../../store/Role";
import RoleUpdate from "./RoleUpdate";

const RoleList = () => {
  document.title = "Access List | CRM";

  const dispatch = useDispatch();

  // ✅ Safe selector
  const {
    roles = [],
    loading = false,
    addRoleResponse = false,
    updateRoleResponse = false,
  } = useSelector((state) => state.roleReducer || {});
   

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  // ✅ Fetch role list initially
  useEffect(() => {
    dispatch(getRole());
  }, [dispatch]);

  // ✅ Refresh after add/update
  useEffect(() => {
    if (addRoleResponse) {
      dispatch(getRole());
      dispatch(resetAddRoleResponse());
      setIsAddOpen(false);
    }
    if (updateRoleResponse) {
      dispatch(getRole());
      dispatch(resetUpdateRoleResponse());
      setIsUpdateOpen(false);
    }
  }, [addRoleResponse, updateRoleResponse, dispatch]);

  // ✅ Delete
  const onClickDelete = (role) => {
    setSelectedRole(role);
    setDeleteModal(true);
  };

  const handleDeleteRole = () => {
    if (selectedRole) {
      dispatch(deleteRole(selectedRole.role_id));
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
                    <h5 className="mb-0 fw-bold">Access List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add Access
                    </Button>
                  </div>
                </Row>
              </CardHeader>

              <CardBody className="pt-0">
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light text-uppercase text-muted">
                      <tr>
                        <th>#</th>
                        <th>Access Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && roles?.length > 0 ? (
                        roles.map((role, index) => (
                          <tr key={role.role_id || index}>
                            <td>{index + 1}</td>
                            <td>{role.role_name}</td>
                            <td>
                              <ul className="list-inline hstack gap-2 mb-0">
                                <li className="list-inline-item">
                                  <button
                                    className="text-primary border-0 bg-transparent"
                                    onClick={() => {
                                      setSelectedRole(role);
                                      setIsUpdateOpen(true);
                                    }}
                                  >
                                    <i className="ri-pencil-fill fs-16"></i>
                                  </button>
                                </li>
                                <li className="list-inline-item">
                                  <button
                                    className="text-danger border-0 bg-transparent"
                                    onClick={() => onClickDelete(role)}
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
                            <h6 className="mt-3 text-muted">No Roles Found</h6>
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

      {isAddOpen && (
        <RoleCreateModal
          isOpen={isAddOpen}
          toggle={() => setIsAddOpen(false)}
        />
      )}
      {isUpdateOpen && (
        <RoleUpdate
          isOpen={isUpdateOpen}
          CloseModal={() => setIsUpdateOpen(false)}
          edit_data={selectedRole}
        />
      )}

      {/* ✅ Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteRole}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default RoleList;
