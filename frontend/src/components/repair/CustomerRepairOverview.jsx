import React, { useEffect, useMemo, useState } from "react";
import {
    Container, Row, Col, Nav, NavItem, NavLink,
    TabContent, TabPane, Card, Badge, Button,
} from "reactstrap";
import classnames from "classnames";
import { api } from "../../../config";
import { useGetMyRepairsQuery } from "@/redux/features/repairApi";
import { formatDateTime } from "@/helpers/date_and_time";

// --- Helpers moved outside to prevent re-creation ---
const safeParseJSON = (v) => {
    try {
        const x = typeof v === 'string' ? JSON.parse(v) : v;
        return Array.isArray(x) ? x : [];
    } catch { return []; }
};

const toText = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));

const getInitials = (name = "") => {
    const parts = String(name).trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "C";
    return parts.length === 1
        ? parts[0].charAt(0).toUpperCase()
        : (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getStatusColor = (stage) => {
    const s = String(stage).toLowerCase();
    if (s.includes("completed") || s.includes("delivered")) return "success";
    if (s.includes("progress") || s.includes("repairing")) return "warning";
    if (s.includes("cancelled") || s.includes("rejected")) return "danger";
    return "info";
};

const CustomerRepairOverviewModal = ({ repairId, onClose }) => {
    const [activeTab, setActiveTab] = useState("1");
    const [images, setImages] = useState([]);

    const { data: repairs = [], isLoading, isError } = useGetMyRepairsQuery();

    const singleRepair = useMemo(() => {
        if (!repairId) return null;
        return repairs.find((x) => String(x?.repair_id) === String(repairId)) || null;
    }, [repairs, repairId]);

    useEffect(() => {
        if (singleRepair?.repair_image) {
            const list = safeParseJSON(singleRepair.repair_image);
            setImages(list.map((img) => ({
                name: img,
                url: `${api.IMG_URL}repair_images/${img}`,
            })));
        } else {
            setImages([]);
        }
    }, [singleRepair]);

    const profileImg = useMemo(() => {
        const p = singleRepair?.customer_profile;
        if (!p) return null;
        return String(p).startsWith("http") ? p : `${api.IMG_URL}user_profile/${p}`;
    }, [singleRepair]);

    // --- Early Returns ---
    if (!repairId) return <div className="p-5 text-center text-muted">Select a repair.</div>;
    if (isLoading) return (
        <div className="py-5 text-center">
            <div className="spinner-grow text-primary" role="status" />
            <p className="mt-3 text-muted fw-medium">Fetching details...</p>
        </div>
    );
    if (isError || !singleRepair) return (
        <div className="p-5 text-center">
            <h5 className="text-danger">Repair details unavailable</h5>
            <Button color="secondary" outline size="sm" className="mt-2" onClick={onClose}>Return to List</Button>
        </div>
    );

    const activity = [
        { title: "Repair Created", time: singleRepair?.repair_received_date, desc: "Device checked into system" },
        { title: "Status Updated", time: singleRepair?.updatedAt, desc: `Moved to ${singleRepair?.workflow_stage_name}` },
    ];

    return (
        <div style={{ background: "#f8f9fa", minHeight: "100%" }}>
            <Container fluid className="p-0">
                {/* Header Section */}
                <div className="p-4 text-white" style={{
                    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                    borderBottomLeftRadius: 24,
                    borderBottomRightRadius: 24,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                    <Row className="align-items-center g-3">
                        <Col xs="auto">

                        </Col> 
                        <Col>
                            <h4 className="mb-1 fw-bold">{toText(singleRepair?.customer_name)}</h4>
                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                <Badge color="light" className="text-primary">ID: #{singleRepair?.repair_id}</Badge>
                                <Badge color={getStatusColor(singleRepair?.workflow_stage_name)} pill>
                                    {toText(singleRepair?.workflow_stage_name)}
                                </Badge>
                            </div>
                        </Col>
                        <Col xs="12" md="auto" className="ms-auto">
                            <Button color="white" className="bg-white text-dark border-0 shadow-sm fw-bold px-4" onClick={onClose} style={{ borderRadius: 12 }}>
                                Close
                            </Button>
                        </Col>
                    </Row>
                </div>

                <div className="p-3 p-md-4" style={{ marginTop: -20 }}>
                    {/* Navigation */}
                    <Nav pills className="bg-white shadow-sm p-1 mb-4 mx-auto" style={{ borderRadius: 16, maxWidth: "400px" }}>
                        <NavItem className="flex-fill text-center">
                            <NavLink className={classnames("border-0", { active: activeTab === "1" })} onClick={() => setActiveTab("1")} style={{ cursor: "pointer", borderRadius: 12 }}>
                                Information
                            </NavLink>
                        </NavItem>
                        <NavItem className="flex-fill text-center">
                            <NavLink className={classnames("border-0", { active: activeTab === "2" })} onClick={() => setActiveTab("2")} style={{ cursor: "pointer", borderRadius: 12 }}>
                                Media ({images.length})
                            </NavLink>
                        </NavItem>
                    </Nav>

                    <TabContent activeTab={activeTab}>
                        <TabPane tabId="1">
                            <Row className="g-4">
                                <Col lg="8">
                                    {/* High-level summary cards */}
                                    <Row className="g-3 mb-4">
                                        {[
                                            { label: "Device & Brand", val: singleRepair?.device_type_name, sub: singleRepair?.brand_name },
                                            { label: "Model / Serial", val: singleRepair?.device_model_name, sub: singleRepair?.device_serial_no },
                                            { label: "Last Update", val: formatDateTime(singleRepair?.updatedAt), sub: "Automated Log" }
                                        ].map((item, i) => (
                                            <Col md="4" key={i}>
                                                <Card className="border-0 shadow-sm p-3 h-100" style={{ borderRadius: 16 }}>
                                                    <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: 0.5 }}>{item.label}</span>
                                                    <div className="fw-bold text-dark mt-1">{toText(item.val)}</div>
                                                    <div className="text-muted small mt-1">{toText(item.sub)}</div>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>

                                    <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: 16 }}>
                                        <div className="bg-light p-3 border-bottom">
                                            <h6 className="mb-0 fw-bold">Repair Specifications</h6>
                                        </div>
                                        <div className="p-0">
                                            <table className="table mb-0 table-hover">
                                                <tbody>
                                                    {[
                                                        { label: "Reported Problem", value: singleRepair?.repair_problem },
                                                        { label: "Technical Remarks", value: singleRepair?.repair_remark },
                                                        { label: "Warranty Status", value: singleRepair?.warranty_status },
                                                        { label: "Contact Mobile", value: singleRepair?.customer_mobile },
                                                        { label: "Contact Email", value: singleRepair?.customer_email }
                                                    ].map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td className="ps-4 text-muted py-3" style={{ width: "35%" }}>{row.label}</td>
                                                            <td className="fw-medium py-3">{toText(row.value)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>
                                </Col>

                                <Col lg="4">
                                    {/* Vertical Timeline */}
                                    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
                                        <div className="p-3 border-bottom d-flex justify-content-between">
                                            <h6 className="mb-0 fw-bold">Timeline</h6>
                                            <Badge color="soft-primary" className="text-primary">Updates</Badge>
                                        </div>
                                        <div className="p-4">
                                            <div className="position-relative">
                                                <div className="position-absolute h-100" style={{ left: 5, borderLeft: "2px dashed #dee2e6" }} />
                                                {activity.map((a, idx) => (
                                                    <div key={idx} className="mb-4 ps-4 position-relative">
                                                        <div className="position-absolute" style={{ left: -3, top: 6, width: 14, height: 14, borderRadius: '50%', background: "#3b82f6", border: "3px solid #fff" }} />
                                                        <div className="fw-bold small">{a.title}</div>
                                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{formatDateTime(a.time)}</div>
                                                        <div className="text-muted small mt-1">{a.desc}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="border-0 shadow-sm bg-primary text-white" style={{ borderRadius: 16 }}>
                                        <div className="p-3">
                                            <h6 className="fw-bold mb-3">Service Location</h6>
                                            <div className="small opacity-75">Assigned Technician</div>
                                            <div className="fw-bold mb-2">{toText(singleRepair?.technician_name)}</div>
                                            <div className="small opacity-75">Service Center</div>
                                            <div className="fw-bold">{toText(singleRepair?.outlet_name)}</div>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </TabPane>

                        <TabPane tabId="2">
                            <Row className="g-3">
                                {images.length > 0 ? (
                                    images.map((img, idx) => (
                                        <Col key={idx} xs="6" sm="4" md="3">
                                            <Card className="border-0 shadow-sm h-100 gallery-card" style={{ borderRadius: 14, overflow: 'hidden' }}>
                                                <div style={{ height: 180, overflow: 'hidden', background: '#eee' }}>
                                                    <img
                                                        src={img.url}
                                                        alt={img.name}
                                                        className="img-fluid w-100 h-100"
                                                        style={{ objectFit: "cover", transition: '0.3s' }}
                                                        onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=No+Image'; }}
                                                    />
                                                </div>
                                                <div className="p-2 bg-white">
                                                    <div className="text-truncate small fw-bold text-center" title={img.name}>{img.name}</div>
                                                </div>
                                            </Card>
                                        </Col>
                                    ))
                                ) : (
                                    <Col xs="12">
                                        <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                                            <div className="mb-3 text-muted" style={{ fontSize: '3rem' }}>📸</div>
                                            <h5>No Media Found</h5>
                                            <p className="text-muted">No images have been uploaded for this repair yet.</p>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </TabPane>
                    </TabContent>
                </div>
            </Container>

            <style>{`
        .gallery-card:hover img { transform: scale(1.08); cursor: pointer; }
        .nav-pills .nav-link.active { background-color: #3b82f6 !important; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3); }
        .table > :not(caption) > * > * { border-bottom-color: #f1f5f9; }
      `}</style>
        </div>
    );
};

export default CustomerRepairOverviewModal;