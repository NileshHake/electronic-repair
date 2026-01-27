// BeadingDetailsModal.jsx (Bootstrap + Reactstrap, Responsive, Smooth)
import React, { useEffect, useMemo } from "react";
import {
    Badge,
    Button,
    Card,
    CardBody,
    Col,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
} from "reactstrap";

const statusText = (s) => {
    const n = Number(s);
    if (n === 0) return "Pending";
    if (n === 1) return "Accepted";
    if (n === 2) return "In Progress";
    if (n === 3) return "Completed";
    if (n === 4) return "Rejected";
    return "Unknown";
};

const statusColor = (s) => {
    const n = Number(s);
    if (n === 0) return "warning";
    if (n === 1) return "primary";
    if (n === 2) return "info";
    if (n === 3) return "success";
    if (n === 4) return "danger";
    return "secondary";
};

const parseImgs = (imagesString) => {
    if (!imagesString) return [];
    return String(imagesString)
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
};

const BeadingDetailsModal = ({ isOpen, onAccept, toggle, data, imgBaseUrl }) => {
    const baseURL = useMemo(() => {
        const u = imgBaseUrl || "";
        return u.endsWith("/") ? u : u + "/";
    }, [imgBaseUrl]);

    // ✅ ESC close
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && toggle?.();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, toggle]);

    if (!data) return null;

    const imgs = parseImgs(data?.beading_request_images);
    const badge = statusColor(data?.beading_request_status);

    const safeDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

    const copy = (val) => {
        if (!val) return;
        navigator.clipboard?.writeText(String(val));
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                toggle={toggle}
                centered
                size="lg"
                backdrop="static"
                className="bdm-modal"
            >
                {/* ✅ Bootstrap style header */}
                <ModalHeader toggle={toggle} className="bg-light">
                    <div className="w-100 d-flex align-items-start justify-content-between">
                        <div>
                            <div className="fw-bold fs-5">Beading Request Details</div>
                            <div className="text-muted small mt-1">
                                Request <span className="fw-semibold">#{data?.beading_request_id || "-"}</span>
                                <span className="mx-2">•</span>
                                Expires: <span className="fw-semibold">{safeDate(data?.expires_at)}</span>
                            </div>
                        </div>

                        <Badge color={badge} pill className="px-3 py-2">
                            {statusText(data?.beading_request_status)}
                        </Badge>
                    </div>
                </ModalHeader>

                <ModalBody className="bg-white">
                    {/* ✅ Responsive layout with Row/Col */}
                    <Row className="g-3">
                        {/* CUSTOMER */}
                        <Col lg={4} md={5} sm={12}>
                            <Card className="h-100 border shadow-sm rounded-3">
                                <CardBody>
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="fw-bold">Customer</div>
                                        <i className="ri-user-3-line text-muted"></i>
                                    </div>

                                    <div className="mb-2">
                                        <div className="text-muted small">Name</div>
                                        <div className="fw-semibold">{data?.customer_name || "-"}</div>
                                    </div>

                                    <div className="mb-2">
                                        <div className="text-muted small">Email</div>
                                        <div className="fw-semibold text-truncate" title={data?.customer_email || ""}>
                                            {data?.customer_email || "-"}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="text-muted small">Phone</div>
                                        <div className="fw-semibold">{data?.customer_phone || "-"}</div>
                                    </div>

                                    <div className="d-flex flex-wrap gap-2">
                                        <Button
                                            size="sm"
                                            color="dark"
                                            outline
                                            onClick={() => copy(data?.customer_phone)}
                                            disabled={!data?.customer_phone}
                                        >
                                            <i className="ri-file-copy-line me-1"></i> Phone
                                        </Button>

                                        <Button
                                            size="sm"
                                            color="dark"
                                            outline
                                            onClick={() => copy(data?.customer_email)}
                                            disabled={!data?.customer_email}
                                        >
                                            <i className="ri-file-copy-line me-1"></i> Email
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* REQUEST */}
                        <Col lg={8} md={7} sm={12}>
                            <Card className="h-100 border shadow-sm rounded-3">
                                <CardBody>
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="fw-bold">Request</div>
                                        <i className="ri-file-list-3-line text-muted"></i>
                                    </div>

                                    <div className="mb-3">
                                        <div className="text-muted small">Title</div>
                                        <div className="fw-bold fs-6">{data?.beading_request_title || "-"}</div>
                                    </div>

                                    <div>
                                        <div className="text-muted small">Description</div>
                                        <div className="text-dark" style={{ lineHeight: 1.6 }}>
                                            {data?.beading_request_description || "-"}
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* STATS */}
                        <Col md={4} sm={12}>
                            <Card className="border shadow-sm rounded-3">
                                <CardBody>
                                    <div className="text-muted small">Budget</div>
                                    <div className="fw-bold fs-6 mt-1">
                                        ₹{data?.beading_budget_min || 0} - ₹{data?.beading_budget_max || 0}
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        <Col md={4} sm={12}>
                            <Card className="border shadow-sm rounded-3">
                                <CardBody>
                                    <div className="text-muted small">Location</div>
                                    <div className="fw-bold fs-6 mt-1">{data?.beading_location || "-"}</div>
                                </CardBody>
                            </Card>
                        </Col>

                        <Col md={4} sm={12}>
                            <Card className="border shadow-sm rounded-3">
                                <CardBody>
                                    <div className="text-muted small">Expires At</div>
                                    <div className="fw-bold fs-6 mt-1">{safeDate(data?.expires_at)}</div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* IMAGES */}
                        <Col xs={12}>
                            <Card className="border shadow-sm rounded-3">
                                <CardBody>
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="fw-bold">Images</div>
                                        <div className="text-muted small">{imgs.length} files</div>
                                    </div>

                                    {imgs.length === 0 ? (
                                        <div className="text-muted">No images uploaded.</div>
                                    ) : (
                                        <div className="row g-2">
                                            {imgs.map((img, i) => {
                                                const src = `${baseURL}beading_images/${img}`;
                                                return (
                                                    <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2">
                                                        <a href={src} target="_blank" rel="noreferrer" className="text-decoration-none">
                                                            <div className="bdm-imgwrap rounded-3 border">
                                                                <img
                                                                    src={src}
                                                                    alt="beading"
                                                                    className="bdm-img"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.opacity = 0.2;
                                                                    }}
                                                                />
                                                                <div className="bdm-imglabel">Open</div>
                                                            </div>
                                                        </a>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter className="bg-light p-3 d-flex justify-content-between">
                    <div>
                        {Number(data?.beading_request_status) === 0 && (
                            <Button
                                color="success"
                                onClick={() => {
                                    onAccept?.(data);   // ✅ CALL updateBeading
                                    toggle();           // optional: close modal
                                }}
                            >
                                <i className="ri-check-line me-1"></i>
                                Accept Request
                            </Button>
                        )}
                    </div>

                    <Button color="danger" onClick={toggle}>
                        Close
                    </Button>
                </ModalFooter>

            </Modal>


            <style>{`
        .bdm-modal .modal-content{
          border:0;
          border-radius: 14px;
          overflow:hidden;
        }
        .bdm-imgwrap{
          position:relative;
          width:100%;
          height:90px;
          overflow:hidden;
          background:#f8f9fa;
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .bdm-imgwrap:hover{
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        }
        .bdm-img{
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
          transition: transform .2s ease;
        }
        .bdm-imgwrap:hover .bdm-img{
          transform: scale(1.05);
        }
        .bdm-imglabel{
          position:absolute;
          left:8px;
          bottom:8px;
          background: rgba(0,0,0,0.65);
          color:#fff;
          font-size:11px;
          font-weight:700;
          padding:4px 8px;
          border-radius:999px;
          opacity:0;
          transform: translateY(6px);
          transition: all .15s ease;
        }
        .bdm-imgwrap:hover .bdm-imglabel{
          opacity:1;
          transform: translateY(0);
        }
      `}</style>
        </>
    );
};

export default BeadingDetailsModal;
