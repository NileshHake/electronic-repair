/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Button,
  Col,
  Card,
  CardHeader,
  CardBody,
  Label,
} from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import DeleteModal from "../../Components/Common/DeleteModal";
import RepairingAdd from "./RepairingAdd";
import RepairingUpdate from "./RepairingUpdate";

import Flatpickr from "react-flatpickr";
import {
  deleteRepair,
  getRepairList,
  resetAddRepairResponse,
  resetDeleteRepairResponse,
  resetUpdateRepairResponse,
} from "../../store/Repairing/index";
import AuthUser from "../../helpers/AuthType/AuthUser";
import Select from "react-select";
import { getWorkflowList, getWorkflowStageList } from "../../store/Workflow";
import { formatDateTime } from "../../helpers/date_and_time_format";
import { Value } from "sass";
import RepairBoard from "./RepairComponent/RepairBoard";

const RepairList = () => {
  const { permissions } = AuthUser();
  const dispatch = useDispatch();

  const { repairs = [], addRepairResponse ,DeleteRepairResponse,updateRepairResponse,loading = false } =
    useSelector((state) => state.RepairReducer) || {};

  const { workflows = [], workflowStages = [] } = useSelector(
    (state) => state.WorkflowReducer
  );

  // ================== LOCAL STATE ==================
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [filterData, setfilterData] = useState({
    start_date: new Date(),
    end_date: new Date(),
    workflow_id: 0,
    customer_search: "",
  });

  // ================== INITIAL FETCH ==================

  useEffect(() => {
    dispatch(getWorkflowList());
    dispatch(resetAddRepairResponse());
  }, [dispatch]);
useEffect(() => {
  // 1) Set default workflow_id once workflows are loaded
  if (workflows.length > 0 && !filterData.workflow_id) {
    setfilterData((prev) => ({
      ...prev,
      workflow_id: workflows[0].workflow_id,
    }));
    return; // avoid running rest with empty workflow_id in same tick
  }

  // 2) When workflow_id is available, load workflow stages
  if (filterData.workflow_id) {
    dispatch(getWorkflowStageList(filterData.workflow_id));
  }

  // 3) Whenever filters OR add/update/delete response flags change,
  //    call getRepairList
  if (filterData) {
    dispatch(getRepairList(filterData));
  }

  // 4) Reset flags after using them so next add/update/delete
  //    will again trigger this effect
  if (addRepairResponse) {
    dispatch(resetAddRepairResponse());
  }
  if (updateRepairResponse) {
    dispatch(resetUpdateRepairResponse());
  }
  if (DeleteRepairResponse) {
    dispatch(resetDeleteRepairResponse());
  }
}, [
  workflows,
  filterData,
  addRepairResponse,
  updateRepairResponse,
  DeleteRepairResponse,
  dispatch,
]);


  // ================== DELETE LOGIC ==================
  const onClickDelete = (repair) => {
    setSelectedRepair(repair);
    setDeleteModal(true);
  };

  const handleDeleteRepair = () => {
    if (selectedRepair?.repair_id) {
      dispatch(deleteRepair(selectedRepair.repair_id));
      setDeleteModal(false);
    }
  };

  // ================== KEYBOARD SHORTCUTS ==================
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setIsAddModalOpen(true);
      }
      if (event.altKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        setIsAddModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ================== TITLE ==================
  useEffect(() => {
    document.title = "Repair List";
  }, []);
  const canUpdate = permissions.some(
    (p) => p.permission_category === "REPAIRING" && p.permission_path === "3"
  );
  const canDelete = permissions.some(
    (p) => p.permission_category === "REPAIRING" && p.permission_path === "4"
  );

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} autoClose={800} />

      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteRepair}
        onCloseClick={() => setDeleteModal(false)}
      />

      <Container fluid>
        <Row className="align-items-center gy-3">
          <Col lg={12}>
            <Card className="p-3">
              {/* === Header === */}
              <CardHeader className="border-0 ">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                  <h4 className="mb-0">Repair List</h4>

                  <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-end gap-2">
                    {/* === Workflow === */}
                    <div className="w-100 w-sm-auto">
                      <Label className="form-label mb-1">Workflow</Label>
                      <Select
                        className="w-100"
                        value={
                          workflows
                            .filter(
                              (f) => f.workflow_id === filterData.workflow_id
                            )
                            .map((w) => ({
                              label: w.workflow_name,
                              value: w.workflow_id,
                            }))[0] || null
                        }
                        options={workflows.map((w) => ({
                          label: w.workflow_name,
                          value: w.workflow_id,
                        }))}
                        onChange={(selected) =>
                          setfilterData((prev) => ({
                            ...prev,
                            workflow_id: selected.value,
                          }))
                        }
                        placeholder="Select Workflow..."
                      />
                    </div>

                    {/* === Start Date === */}
                    <div className="w-100 w-sm-auto">
                      <Label className="form-label mb-1">Start Date</Label>
                      <Flatpickr
                        className="form-control w-100"
                        value={filterData.start_date}
                        onChange={(selectedDates) => {
                          if (selectedDates && selectedDates[0]) {
                            setfilterData((prev) => ({
                              ...prev,
                              start_date: selectedDates[0],
                            }));
                          }
                        }}
                        options={{
                          dateFormat: "d/m/Y  ",
                          altInput: true,
                          altFormat: "d/m/Y",
                        }}
                        placeholder="Start Date"
                      />
                    </div>

                    {/* === End Date === */}
                    <div className="w-100 w-sm-auto">
                      <Label className="form-label mb-1">End Date</Label>
                      <Flatpickr
                        className="form-control w-100"
                        value={filterData.end_date}
                        onChange={(selectedDates) => {
                          if (selectedDates && selectedDates[0]) {
                            setfilterData((prev) => ({
                              ...prev,
                              end_date: selectedDates[0],
                            }));
                          }
                        }}
                        options={{
                          dateFormat: "d/m/Y  ",
                          altInput: true,
                          altFormat: "d/m/Y",
                        }}
                        placeholder="End Date"
                      />
                    </div>

                    {/* === Customer Search === */}
                    <div className="w-100 w-sm-auto">
                      <Label className="form-label mb-1">Customer</Label>
                      <input
                        type="text"
                        className="form-control w-100"
                        placeholder="Search Customer..."
                        value={filterData.customer_search || ""}
                        onChange={(e) =>
                          setfilterData((prev) => ({
                            ...prev,
                            customer_search: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* === Add Repair Button === */}
                    {permissions.find(
                      (permission) =>
                        permission.permission_category === "REPAIRING" &&
                        permission.permission_path === "2"
                    ) && (
                      <div className="w-100 w-sm-auto">
                        <Label className="form-label mb-1 d-none d-sm-block">
                          &nbsp;
                        </Label>
                        <Button
                          color="success"
                          className="w-100"
                          onClick={() => setIsAddModalOpen(true)}
                          style={{ whiteSpace: "nowrap" }}
                        >
                          + Add Repair
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* === Body === */}
              <CardBody className="p-2">
                <RepairBoard
                  repairs={repairs}
                  workflowStages={workflowStages}
                  permissions={permissions}
                  canDelete={canDelete}
                  setSelectedRepair={setSelectedRepair}
                  setIsUpdateModalOpen={setIsUpdateModalOpen}
                  onClickDelete={onClickDelete}
                  canUpdate={canUpdate}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* ================== ADD MODAL ================== */}
      {isAddModalOpen && (
        <RepairingAdd
          isOpen={isAddModalOpen}
          toggle={() => setIsAddModalOpen(false)}
        />
      )}

      {/* ================== UPDATE MODAL ================== */}
      {isUpdateModalOpen && (
        <RepairingUpdate
          isOpen={isUpdateModalOpen}
          toggle={() => setIsUpdateModalOpen(false)}
          isRepairData={selectedRepair}
        />
      )}
    </div>
  );
};

export default RepairList;
