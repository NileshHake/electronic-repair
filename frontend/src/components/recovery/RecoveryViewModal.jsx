import React, { useMemo } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Row,
    Col,
    Card,
    Badge,
} from "reactstrap";
import { api } from "../../../config";
import { formatDateTime } from "@/helpers/date_and_time";

// ✅ string -> array safe parse
const safeParseArray = (v) => {
    try {
        if (!v) return [];
        if (Array.isArray(v)) return v;

        const parsed = JSON.parse(v); // '["a.jpg","b.jpg"]'
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        // fallback if stored "a.jpg,b.jpg"
        if (typeof v === "string") {
            return v
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean);
        }
        return [];
    }
};

const toText = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));

const RecoveryViewModal = ({ isOpen, toggle, recovery }) => {
    if (!recovery) return null;

    // ✅ images from DB (string -> array)
    const images = useMemo(() => safeParseArray(recovery.recovery_image), [recovery]);

    // ✅ folder name = column name
    const imgUrl = (imgName) => `${api.IMG_URL}recovery_images/${imgName}`;

    // ✅ workflow / stage badge (use your SQL joined fields if present)
    const workflowName = recovery.workflow_name;
    const stageName = recovery.workflow_stage_name;
    const stageColor = recovery.workflow_stage_color;

    // if your stage has color coming from wf_child table



    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl" centered>
            <ModalHeader toggle={toggle} className="bg-light p-3">
                Recovery Details
            </ModalHeader>

            <ModalBody>
                <Card className="border card-border-success p-3 shadow-lg">
                    {/* ✅ Header cards like your quotation modal */}
                    <Card className="shadow-lg border-0 p-4 mb-4 rounded-3">
                        <Row className="mb-3 g-2">
                            <Col xs={12} md={6}>
                                <div className="p-2 bg-light rounded d-flex align-items-center">
                                    <i className="ri-calendar-line me-2 text-primary fs-5"></i>
                                    <div>
                                        <small className="text-muted d-block">Received Date</small>
                                        <span className="fw-semibold text-dark">
                                            {formatDateTime(recovery.recovery_received_date)}
                                        </span>
                                    </div>
                                </div>
                            </Col>

                            <Col xs={12} md={6}>
                                <div className="p-2 bg-light rounded d-flex align-items-center">
                                    <i className="ri-user-settings-line me-2 text-success fs-5"></i>
                                    <div>
                                        <small className="text-muted d-block">Vendor (Created By)</small>
                                        <span className="fw-semibold text-dark">
                                            {toText(recovery.vendor_name)}
                                        </span>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row className="mb-3 g-2">
                            <Col xs={12} md={6}>
                                <div className="p-2 bg-light rounded d-flex align-items-center">
                                    <i className="ri-flow-chart me-2 text-info fs-5"></i>
                                    <div>
                                        <small className="text-muted d-block">Workflow</small>
                                        <span className="fw-semibold text-dark">{toText(workflowName)}</span>
                                    </div>
                                </div>
                            </Col>

                            <Col xs={12} md={6}>
                                <div className="p-2 bg-light rounded d-flex align-items-center justify-content-between">
                                    <div>
                                        <small className="text-muted d-block">Stage</small>


                                        {toText(stageName)}

                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row className="mb-0 g-2">
                            <Col xs={12}>
                                <div className="p-2 bg-primary-subtle rounded">
                                    <small className="text-muted d-block">Problem Description</small>
                                    <div className="fw-semibold text-dark">
                                        {toText(recovery.recovery_problem_description)}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    {/* ✅ Images Section */}
                    <div className="mb-2 d-flex align-items-center justify-content-between">
                        <h6 className="mb-0 fw-bold">Uploaded Images</h6>
                        <Badge color="secondary" pill>
                            {images.length} file(s)
                        </Badge>
                    </div>

                    {images.length === 0 ? (
                        <div className="text-center py-5">
                            <lord-icon
                                src="https://cdn.lordicon.com/msoeawqm.json"
                                trigger="loop"
                                colors="primary:#405189,secondary:#0ab39c"
                                style={{ width: "72px", height: "72px" }}
                            ></lord-icon>
                            <div className="mt-3">
                                <h6 className="mb-0">No images uploaded</h6>
                            </div>
                        </div>
                    ) : (
                        <Row className="g-3">
                            {images.map((imgName, idx) => (
                                <Col key={`${imgName}-${idx}`} xs={6} md={3} lg={2}>
                                    <div className="border rounded-3 p-2 shadow-sm h-100">
                                        <img
                                            src={imgUrl(imgName)}
                                            alt={imgName}
                                            style={{
                                                width: "100%",
                                                height: "110px",
                                                objectFit: "cover",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <div
                                            className="small text-muted mt-2 text-truncate"
                                            title={imgName}
                                        >
                                            {imgName}
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Card>
            </ModalBody>

            <ModalFooter>
                <Button color="danger" onClick={toggle}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default RecoveryViewModal;