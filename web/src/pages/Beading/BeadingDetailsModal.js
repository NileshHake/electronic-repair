// BeadingDetailsModal.jsx
import React, { useEffect, useMemo, useState } from "react";
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
    Input,
    Label,
    FormFeedback,
} from "reactstrap";

/* -------------------- helpers -------------------- */
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

const parseVendorDetails = (vendorDetails) => {
    if (!vendorDetails) return [];
    try {
        const parsed =
            typeof vendorDetails === "string" ? JSON.parse(vendorDetails) : vendorDetails;
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

/* -------------------- component -------------------- */
const BeadingDetailsModal = ({
    isOpen,
    onAccept,
    toggle,
    data,
    imgBaseUrl,
    viewerType = "vendor", // "vendor" | "customer"
}) => {
    /* ✅ ALL HOOKS MUST BE FIRST (NO early return before hooks) */

    const [amountOpen, setAmountOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [touched, setTouched] = useState(false);

    const baseURL = useMemo(() => {
        const u = imgBaseUrl || "";
        return u.endsWith("/") ? u : u + "/";
    }, [imgBaseUrl]);

    // ESC close main modal
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && toggle?.();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, toggle]);

    // reset when main modal closes
    useEffect(() => {
        if (!isOpen) {
            setAmountOpen(false);
            setAmount("");
            setTouched(false);
        }
    }, [isOpen]);

    // ✅ derive safe values even when data is null
    const imgs = useMemo(() => parseImgs(data?.beading_request_images), [data?.beading_request_images]);

    const badge = useMemo(
        () => statusColor(data?.beading_request_status),
        [data?.beading_request_status]
    );

    const safeDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

    const min = useMemo(() => Number(data?.beading_budget_min || 0), [data?.beading_budget_min]);
    const max = useMemo(() => Number(data?.beading_budget_max || 0), [data?.beading_budget_max]);
    const vendorBids = useMemo(
        () => parseVendorDetails(data?.beading_vendor_details),
        [data?.beading_vendor_details]
    );

    const vendorBidsSorted = useMemo(() => {
        const arr = [...vendorBids];
        arr.sort((a, b) => {
            const aAmt = Number(a?.vendor_beading_amount ?? a?.vendor_beadding ?? 0);
            const bAmt = Number(b?.vendor_beading_amount ?? b?.vendor_beadding ?? 0);
            return aAmt - bAmt;
        });
        return arr;
    }, [vendorBids]);

    const amountNum = Number(amount);
    const isValid =
        amount !== "" &&
        Number.isFinite(amountNum) &&
        amountNum > 0 &&
        (max === 0 || (amountNum >= min && amountNum <= max));

    const amountError = () => {
        if (!touched) return "";
        if (!amount) return "Please enter your beading amount.";
        if (!Number.isFinite(amountNum) || amountNum <= 0) return "Amount must be a valid number.";
        if (max !== 0 && (amountNum < min || amountNum > max))
            return `Amount should be between ₹${min} and ₹${max}.`;
        return "";
    };

    const openAmountModal = () => {
        setAmountOpen(true);
        setTouched(false);
    };

    const closeAmountModal = () => {
        setAmountOpen(false);
        setAmount("");
        setTouched(false);
    };

    const copy = (val) => {
        if (!val) return;
        navigator.clipboard?.writeText(String(val));
    };

    const confirmAccept = () => {
        setTouched(true);
        if (!isValid) return;



        onAccept?.({
            ...data,
            vendor_beading_amount: Number(amount),
        });

        closeAmountModal();
        toggle?.();
    };

    /* ✅ NOW you can early return safely */
    if (!data) return null;

    return (
        <>
            {/* MAIN DETAILS MODAL */}
            <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static" className="bdm-modal">
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
                                        <Button size="sm" color="dark" outline onClick={() => copy(data?.customer_phone)} disabled={!data?.customer_phone}>
                                            <i className="ri-file-copy-line me-1"></i> Phone
                                        </Button>

                                        <Button size="sm" color="dark" outline onClick={() => copy(data?.customer_email)} disabled={!data?.customer_email}>
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
                                    <div className="fw-bold fs-6 mt-1">₹{min} - ₹{max}</div>
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

                        {/* ✅ VENDOR OFFERS (Customer view) */}

                        <Col xs={12}>
                            <Card className="border shadow-sm rounded-3">
                                <CardBody>
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="fw-bold">Vendor Beading Offers</div>
                                        <div className="text-muted small">{vendorBidsSorted.length} offers</div>
                                    </div>

                                    {vendorBidsSorted.length === 0 ? (
                                        <div className="text-muted">No vendor offers yet.</div>
                                    ) : (
                                        <div className="table-responsive" style={{ maxHeight: 220, overflowY: "auto" }}>
                                            <table className="table table-sm align-middle mb-0">
                                                <thead className="table-light sticky-top" style={{ top: 0, zIndex: 1 }}>
                                                    <tr className="text-muted small text-uppercase">
                                                        <th style={{ width: 40 }}>#</th>
                                                        <th>Vendor</th>
                                                        <th>Phone</th>
                                                        <th>Email</th>
                                                        <th className="text-end">Amount (₹)</th>
                                                        <th className="text-end">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {vendorBidsSorted.map((v, idx) => {
                                                        const amt = v?.vendor_beading_amount ?? v?.vendor_beadding ?? 0;
                                                        const dt = v?.accepted_at ? new Date(v.accepted_at).toLocaleString() : "-";
                                                        return (


                                                            <tr key={idx}>
                                                                {console.log(v)}
                                                                <td>{idx + 1}</td>
                                                                <td className="fw-semibold">{v?.vendor_name || "-"}</td>
                                                                <td>{v?.vendor_phone || "-"}</td>
                                                                <td className="text-truncate" style={{ maxWidth: 180 }}>
                                                                    {v?.vendor_email || "-"}
                                                                </td>
                                                                <td className="text-end fw-bold">₹ {Number(amt || 0).toFixed(0)}</td>
                                                                <td className="text-end text-muted small">{dt}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>

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
                        {viewerType === "vendor" && Number(data?.beading_request_status) === 0 && (
                            <Button color="success" onClick={openAmountModal}>
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

            {/* ✅ AMOUNT MODAL (Vendor) */}
            <Modal isOpen={amountOpen} toggle={closeAmountModal} centered backdrop="static">
                <ModalHeader toggle={closeAmountModal} className="bg-light p-2">
                    Your Beading Amount
                </ModalHeader>

                <ModalBody>
                    <div className="text-muted small mb-2">
                        Enter your amount for this request. Budget range:{" "}
                        <span className="fw-semibold">₹{min} - ₹{max}</span>
                    </div>

                    <Label className="fw-semibold mb-1">Amount (₹)</Label>
                    <Input
                        value={amount}
                        type="number"
                        placeholder="e.g. 1500"
                        onChange={(e) => setAmount(e.target.value)}
                        onBlur={() => setTouched(true)}
                        invalid={!!amountError()}
                    />
                    {!!amountError() && <FormFeedback>{amountError()}</FormFeedback>}

                    <div className="d-flex gap-2 mt-3">
                        <Button color="secondary" outline onClick={() => setAmount(String(min || ""))} disabled={!min}>
                            Use Min
                        </Button>
                        <Button color="secondary" outline onClick={() => setAmount(String(max || ""))} disabled={!max}>
                            Use Max
                        </Button>
                    </div>
                </ModalBody>

                <ModalFooter className="bg-light p-2">
                    <Button color="success" onClick={confirmAccept}>
                        Confirm & Accept
                    </Button>
                    <Button color="danger" onClick={closeAmountModal}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>

            <style>{`
        .bdm-modal .modal-content{
          border:0;
          border-radius: 14px;
          overflow:hidden;
        }
        .bdm-modal .table tbody tr:hover{
          background:#f8f9ff;
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
