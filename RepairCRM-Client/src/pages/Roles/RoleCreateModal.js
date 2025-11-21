import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Col,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import {
  addRole,
  getRolePermissions,
  resetAddRoleResponse,
  resetRole,
} from "../../store/Role";

const RoleCreateModal = (props) => {
  const dispatch = useDispatch();
  const {
    rolePermissions = [],
    loading = false,
    addRoleResponse,
  } = useSelector((state) => state.roleReducer || {});
  const [roleName, setRoleName] = useState("");
  const [permissionsLists, setPermissionsLists] = useState([]);
  const [checkNameStatus, setCheckStatus] = useState({});
  const [msg, setMsg] = useState("");

  // Fetch permissions when modal opens
  useEffect(() => {
    if (props.isOpen) {
      dispatch(getRolePermissions());
    }
  }, [props.isOpen, dispatch]);

  // Reset after add success
  useEffect(() => {
    if (addRoleResponse) {
      setRoleName("");
      setPermissionsLists([]);
      dispatch(resetAddRoleResponse());
      props.toggle();
    }
  }, [addRoleResponse, dispatch, props]);

  const Close = () => {
    props.toggle();
    dispatch(resetRole());
  };

  // Get unique permission categories
  const uniqueCategories = Array.from(
    new Set(rolePermissions.map((p) => p.permission_category))
  );

  // Checkbox handling
  const handleCheckboxChange = (e) => {
    const id = parseInt(e.target.value);
    setPermissionsLists((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleAll = (category) => {
    const categoryPermissions = rolePermissions
      .filter((p) => p.permission_category === category)
      .map((p) => p.permission_id);

    const allChecked = categoryPermissions.every((id) =>
      permissionsLists.includes(id)
    );

    setPermissionsLists((prev) =>
      allChecked
        ? prev.filter((id) => !categoryPermissions.includes(id))
        : [...prev, ...categoryPermissions.filter((id) => !prev.includes(id))]
    );
  };

  // Submit data
  const SubmitData = () => {
    if (!roleName.trim()) {
      setCheckStatus({ borderColor: "red", borderStyle: "groove" });
      setMsg("Role cannot be empty!");
      return;
    }
    
    const payload = { role_name: roleName, permissionsLists };
    
     
    dispatch(addRole(payload));
  };

  // Shortcut keys
  const submitButtonRef = useRef();
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && (event.key === "s" || event.key === "S"))
        submitButtonRef.current.click();
      if (event.altKey && (event.key === "c" || event.key === "C"))
        props.toggle();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [props]);

  return (
    <Modal size="xl" isOpen={props.isOpen} toggle={props.toggle} centered>
      <ModalHeader className="bg-light p-3" toggle={props.toggle}>
        Add Role
      </ModalHeader>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          SubmitData();
        }}
      >
        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            <Row>
              <Col lg={12}>
                <Label className="form-label fw-bold d-flex justify-content-between">
                  <div>
                    Role Name<span style={{ color: "red" }}> *</span>
                  </div>
                  <div style={{ color: "red" }}>{msg}</div>
                </Label>
                <Input
                  style={checkNameStatus}
                  className="form-control fw-bold"
                  placeholder="Role Name"
                  type="text"
                  value={roleName}
                  onChange={(e) => {
                    setRoleName(e.target.value);
                    setMsg("");
                    setCheckStatus({});
                  }}
                />
              </Col>

              <Col
                lg={12}
                className="align-middle table-nowrap border shadow table table-hover mt-3"
              >
                <div className="mt-3">
                  <Row>
                    {loading ? (
                      <div className="text-center text-muted p-4">
                        Loading permissions...
                      </div>
                    ) : (
                      uniqueCategories.map((category) => (
                        <Col lg={4} key={category}>
                          <div
                            className="text-uppercase p-2"
                            style={{ backgroundColor: "teal", color: "white" }}
                          >
                            <input
                              type="checkbox"
                              className="m-1"
                              onClick={() => handleToggleAll(category)}
                            />
                            &nbsp;{category}
                          </div>
                          <div className="p-2">
                            {rolePermissions
                              .filter((p) => p.permission_category === category)
                              .map((permission) => (
                                <div
                                  className="d-flex"
                                  key={permission.permission_id}
                                  style={{
                                    marginBottom: "5px",
                                    fontSize: "15px",
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    value={permission.permission_id}
                                    onChange={handleCheckboxChange}
                                    checked={permissionsLists.includes(
                                      permission.permission_id
                                    )}
                                  />
                                  &nbsp;&nbsp;
                                  {permission.permission_name}
                                </div>
                              ))}
                          </div>
                        </Col>
                      ))
                    )}
                  </Row>
                </div>
              </Col>
            </Row>
          </Card>
        </ModalBody>

        <div className="modal-footer">
          <button
            ref={submitButtonRef}
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            <i className="ri-save-3-line align-bottom me-1"></i>
            Save
          </button>
          <button type="button" className="btn btn-danger" onClick={Close}>
            <i className="ri-close-line me-1 align-middle" />
            Close
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default RoleCreateModal;
