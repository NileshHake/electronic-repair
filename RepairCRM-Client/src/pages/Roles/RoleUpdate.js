/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Card,
  Modal,
  ModalHeader,
  ModalBody,
  Label,
  Input,
  Col,
  Row,
} from "reactstrap";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getOldRolePermissions,
  getRolePermissions,
  updateRole,
} from "../../store/Role";

const RoleUpdate = (props) => {
  const dispatch = useDispatch();

  const {
    rolePermissions = [],
    oldrolePermissions = [],
    updateRoleResponse,
  } = useSelector((state) => state.roleReducer);
  // console.log("oldrolePermissions", oldrolePermissions);

  const [modal, setModal] = useState(false);
  const [roleName, setRoleName] = useState(props.edit_data?.role_name || "");
  const [permissionsLists, setPermissionsLists] = useState([]);
  const [msg, setMsg] = useState("");

  const Close = () => {
    setModal(false);
    props.CloseModal();
  };

  useEffect(() => {
    if (props.isOpen) {
      setModal(true);
      if (props.edit_data?.role_id) {
        dispatch(getOldRolePermissions(props.edit_data.role_id));
      }
      dispatch(getRolePermissions());
    } else {
      setModal(false);
    }
  }, [props.isOpen, dispatch, props.edit_data]);

  useEffect(() => {
    if (oldrolePermissions?.length > 0 && rolePermissions?.length > 0) {
      const oldPermissionIds = oldrolePermissions.map(
        (p) => p.permission_id || p.rhp_permission_id
      );
      setPermissionsLists(oldPermissionIds.map(Number));
    }
  }, [oldrolePermissions, rolePermissions]);

  const getUniquePermissionCategories = () => {
    const uniqueCategories = new Set();
    rolePermissions.forEach((permission) => {
      if (permission.permission_category) {
        uniqueCategories.add(permission.permission_category);
      }
    });
    return Array.from(uniqueCategories);
  };

  const uniqueCategories = getUniquePermissionCategories();

  const handleCheckboxChange = (e) => {
    const permissionId = parseInt(e.target.value);
    setPermissionsLists((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };
  const handleToggleAll = (category) => {
    const categoryPermissions = rolePermissions
      .filter((p) => p.permission_category === category)
      .map((p) => p.permission_id);

    const allChecked = categoryPermissions.every((id) =>
      permissionsLists.includes(id)
    );

    const updated = allChecked
      ? permissionsLists.filter((id) => !categoryPermissions.includes(id))
      : [
          ...permissionsLists,
          ...categoryPermissions.filter((id) => !permissionsLists.includes(id)),
        ];

    setPermissionsLists(updated);
  };

  const renderPermissionTableRows = (category) => {
    const allPermissionsChecked = rolePermissions
      .filter((p) => p.permission_category === category)
      .every((p) => permissionsLists.includes(p.permission_id));

    return (
      <Col lg={4} key={category} style={{ cursor: "pointer" }}>
        <div
          className="text-uppercase p-2"
          style={{ backgroundColor: "teal", color: "white" }}
        >
          <input
            type="checkbox"
            className="m-1"
            onChange={() => handleToggleAll(category)}
            checked={allPermissionsChecked}
          />
          &nbsp;{category}
        </div>
        <div className="p-2">
          {rolePermissions.map(
            (permission) =>
              permission.permission_category === category && (
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
                    checked={permissionsLists.includes(
                      permission.permission_id
                    )}
                    onChange={handleCheckboxChange}
                  />
                  &nbsp;&nbsp;{permission.permission_name}
                </div>
              )
          )}
        </div>
      </Col>
    );
  };

  const SubmitData = () => {
    if (!roleName.trim()) {
      setMsg("Role name is required");
      return;
    }

    const payload = {
      role_id: props.edit_data.role_id,
      role_name: roleName,
      permissionList: permissionsLists,
    };

    dispatch(updateRole(payload));
  };

  useEffect(() => {
    if (updateRoleResponse?.success) {
      toast.success("Role updated successfully!");
      setModal(false);
      props.checkchang("Role updated successfully!!");
    } else if (updateRoleResponse?.error) {
      toast.error(updateRoleResponse.error);
    }
  }, [updateRoleResponse]);

  return (
    <div>
      <Modal id="showModal" size="xl" isOpen={modal} centered>
        <ModalHeader className="bg-light p-3 " toggle={Close}>
          Update Role
        </ModalHeader>
        <span className="tablelist-form">
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <div className="mb-3">
                <Row>
                  <Col lg={12}>
                    <Label
                      htmlFor="role-name-field"
                      className="form-label fw-bold d-flex justify-content-between"
                    >
                      <div>
                        Role Name<span style={{ color: "red" }}> *</span>
                      </div>
                      <div style={{ color: "red" }}>{msg}</div>
                    </Label>
                    <Input
                      id="role-name-field"
                      className="form-control fw-bold"
                      placeholder={props.edit_data?.role_name}
                      type="text"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                    />
                  </Col>

                  <Col
                    lg={12}
                    className="align-middle table-nowrap border shadow table table-hover"
                  >
                    <div className="mt-3">
                      <Row>
                        {uniqueCategories.map((category) =>
                          renderPermissionTableRows(category)
                        )}
                      </Row>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </ModalBody>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={SubmitData}
            >
              <i className="ri-save-3-line align-bottom me-1"></i>
              Update
            </button>
            <button type="button" className="btn btn-danger" onClick={Close}>
              <i className="ri-close-line me-1 align-middle" />
              Close
            </button>
          </div>
        </span>
      </Modal>
    </div>
  );
};

export default RoleUpdate;
