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

// ✅ string -> array safe parse (for images etc.)
const safeParseArray = (v) => {
    try {
        if (!v) return [];
        if (Array.isArray(v)) return v;
        const parsed = JSON.parse(v);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        if (typeof v === "string") {
            return v
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean);
        }
        return [];
    }
};

// ✅ string/object -> JSON safe parse (for services array of objects)
const safeParseJSON = (v, fallback) => {
    try {
        if (!v) return fallback;
        if (typeof v === "object") return v; // already parsed
        return JSON.parse(v); // JSON string
    } catch {
        return fallback;
    }
};

const toText = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));

const toBadgeColor = (c) => {
    const x = String(c || "").toLowerCase().trim();
    if (["primary", "secondary", "success", "danger", "warning", "info", "dark"].includes(x)) return x;
    if (x.startsWith("bg-")) return "primary";
    return "primary";
};

const money = (v) => {
    const n = Number(v || 0);
    return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

const InfoCard = ({ iconClass, iconBg, label, value, rightEl }) => (
    <div className="p-3 bg-white rounded-4 shadow-sm border d-flex gap-3 align-items-center justify-content-between">
        <div className="d-flex gap-3 align-items-center">
            <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 42, height: 42, background: iconBg }}
            >
                <i className={`${iconClass} fs-5`}></i>
            </div>
            <div>
                <div className="text-muted small">{label}</div>
                <div className="fw-semibold">{value}</div>
            </div>
        </div>
        {rightEl ? rightEl : null}
    </div>
);

const RepairViewModal = ({ isOpen, toggle, repair }) => {
    if (!repair) return null;

    // ✅ workflow stage
    const stageName =
        repair.workflow_child_name || repair.workflow_stage_name || repair.workflow_stage || "-";
    const stageColorRaw =
        repair.workflow_child_color || repair.workflow_stage_color || "primary";
    const isBgClass = String(stageColorRaw || "").includes("bg-");

    // ✅ images (string array)
    const images = useMemo(() => safeParseArray(repair.repair_image), [repair]);

    // ✅ services (array of objects) from repair_device_services_id
    const serviceRows = useMemo(() => {
        const parsed = safeParseJSON(repair.repair_device_services_id, []);
        return Array.isArray(parsed) ? parsed : [];
    }, [repair]);

    const totalServiceCost = useMemo(() => {
        return serviceRows.reduce((sum, x) => {
            const n = Number(x?.cost || 0);
            return sum + (Number.isFinite(n) ? n : 0);
        }, 0);
    }, [serviceRows]);

    // ✅ folder paths (change if needed)
    const imgUrl = (imgName) => `${api.IMG_URL}repair_images/${imgName}`;
    const videoUrl = repair.repair_video
        ? `${api.VID_URL}repair_videos/${repair.repair_video}`
        : null;

    const fullCustomerAddress = [
        repair.customer_address_description,
        repair.customer_address_city,
        repair.customer_address_block,
        repair.customer_address_district,
        repair.customer_address_state,
        repair.customer_address_pincode,
    ]
        .map((x) => (x ? String(x).trim() : ""))
        .filter(Boolean)
        .join(", ");

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl" centered>
            <ModalHeader toggle={toggle} className="bg-light">
                <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold">Repair Details</span>
                    <span className="text-muted">#{toText(repair.repair_id)}</span>
                </div>
            </ModalHeader>

            <ModalBody className="bg-body-tertiary">
                <Card className="border-0 shadow-sm p-3 rounded-4">
                    {/* ✅ Top grid */}
                    <Row className="g-3">
                        <Col md={6}>
                            <InfoCard
                                iconClass="ri-user-line text-primary"
                                iconBg="rgba(13,110,253,.12)"
                                label="Customer"
                                value={toText(repair.customer_name)}
                            />
                        </Col>

                        <Col md={6}>
                            <InfoCard
                                iconClass="ri-phone-line text-info"
                                iconBg="rgba(13,202,240,.12)"
                                label="Customer Phone"
                                value={toText(repair.customer_phone_number)}
                            />
                        </Col>

                        <Col md={6}>
                            <InfoCard
                                iconClass="ri-mail-line text-success"
                                iconBg="rgba(25,135,84,.12)"
                                label="Customer Email"
                                value={toText(repair.customer_email)}
                            />
                        </Col>

                        <Col md={6}>
                            <InfoCard
                                iconClass="ri-calendar-line text-primary"
                                iconBg="rgba(13,110,253,.12)"
                                label="Received Date"
                                value={
                                    repair.repair_received_date
                                        ? formatDateTime(repair.repair_received_date)
                                        : "-"
                                }
                            />
                        </Col>

                        <Col md={6}>
                            <InfoCard
                                iconClass="ri-flow-chart text-info"
                                iconBg="rgba(13,202,240,.12)"
                                label="Workflow"
                                value={toText(repair.workflow_name)}
                            />
                        </Col>

                        <Col md={6}>
                            <InfoCard
                                iconClass="ri-flag-line text-warning"
                                iconBg="rgba(255,193,7,.12)"
                                label="Stage"
                                value={toText(stageName)}
                                rightEl={
                                    isBgClass ? (
                                        <span className={`badge ${stageColorRaw} px-3 py-2 rounded-pill`}>
                                            {toText(stageName)}
                                        </span>
                                    ) : (
                                        <Badge color={toBadgeColor(stageColorRaw)} pill className="px-3 py-2">
                                            {toText(stageName)}
                                        </Badge>
                                    )
                                }
                            />
                        </Col>

                        <Col md={6}>
                            <InfoCard
                                iconClass="ri-device-line text-primary"
                                iconBg="rgba(13,110,253,.12)"
                                label="Device Type"
                                value={toText(repair.device_type_name)}
                            />
                        </Col>

                        <Col md={6}>
                            <InfoCard
                                iconClass="ri-price-tag-3-line text-success"
                                iconBg="rgba(25,135,84,.12)"
                                label="Brand"
                                value={toText(repair.brand_name)}
                            />
                        </Col>

                        <Col xs={12}>
                            <div className="p-3 bg-white rounded-4 shadow-sm border">
                                <div className="text-muted small mb-1">Customer Address</div>
                                <div className="fw-semibold">{fullCustomerAddress || "-"}</div>
                            </div>
                        </Col>

                        <Col xs={12}>
                            <div className="p-3 bg-white rounded-4 shadow-sm border">
                                <div className="text-muted small mb-1">Problem Description</div>
                                <div className="fw-semibold">{toText(repair.repair_problem_description)}</div>
                            </div>
                        </Col>
                    </Row>

                    {/* ✅ Services (repair_device_services_id) */}
                    <div className="mt-4">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="fw-bold">Services</div>
                            <Badge color="secondary" pill>
                                {serviceRows.length} item(s)
                            </Badge>
                        </div>

                        {serviceRows.length === 0 ? (
                            <div className="bg-white border rounded-4 p-4 text-center text-muted">
                                No services added
                            </div>
                        ) : (
                            <div className="table-responsive bg-white border rounded-4 shadow-sm">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: 70 }}>#</th>
                                            <th>Service</th>
                                            <th className="text-end" style={{ width: 160 }}>
                                                Cost
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {serviceRows.map((s, idx) => (
                                            <tr key={idx}>
                                                <td className="fw-semibold">{idx + 1}</td>
                                                <td>{toText(s?.service || s?.service_name)}</td>
                                                <td className="text-end">₹ {money(s?.cost)}</td>
                                            </tr>
                                        ))}
                                        <tr className="table-light">
                                            <td colSpan={2} className="text-end fw-bold">
                                                Total
                                            </td>
                                            <td className="text-end fw-bold">₹ {money(totalServiceCost)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* ✅ Images */}
                    <div className="d-flex align-items-center justify-content-between mt-4 mb-2">
                        <div className="fw-bold">Uploaded Images</div>
                        <div className="text-muted small">
                            Total: <span className="fw-semibold">{images.length}</span>
                        </div>
                    </div>

                    {images.length === 0 ? (
                        <div className="bg-white border rounded-4 p-4 text-center">
                            <div className="text-muted">No images uploaded</div>
                        </div>
                    ) : (
                        <Row className="g-3">
                            {images.map((imgName, idx) => (
                                <Col key={`${imgName}-${idx}`} xs={6} md={4} lg={3} xl={2}>
                                    <div className="bg-white border rounded-4 p-2 shadow-sm h-100">
                                        <div className="ratio ratio-1x1 rounded-4 overflow-hidden">
                                            <img
                                                src={imgUrl(imgName)}
                                                alt={imgName}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        </div>
                                        <div className="small text-muted mt-2 text-truncate" title={imgName}>
                                            {imgName}
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    )}

                    {/* ✅ Video */}
                    <div className="mt-4">
                        <div className="fw-bold mb-2">Video</div>
                        {videoUrl ? (
                            <div className="bg-white border rounded-4 p-2 shadow-sm">
                                <video src={videoUrl} controls style={{ width: "100%", maxHeight: 360 }} />
                            </div>
                        ) : (
                            <div className="bg-white border rounded-4 p-4 text-center text-muted">
                                No video uploaded
                            </div>
                        )}
                    </div>
                </Card>
            </ModalBody>

            <ModalFooter className="bg-light">
                <Button color="secondary" onClick={toggle}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default RepairViewModal;