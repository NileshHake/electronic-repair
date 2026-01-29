import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Container,
    Row,
    Col,
    Label,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../config";
import {
    getBeadingList,
    resetUpdateBeadingResponse,
    updateBeading,
} from "../../store/Beading/index";
import BeadingDetailsModal from "./BeadingDetailsModal";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";

const statusText = (s) =>
    Number(s) === 0 ? "Pending" : Number(s) === 1 ? "Accepted" : "Unknown";

const statusClass = (s) =>
    Number(s) === 0
        ? "badge bg-warning text-dark"
        : Number(s) === 1
            ? "badge bg-success"
            : "badge bg-secondary";

const parseImgs = (imagesString) =>
    !imagesString
        ? []
        : String(imagesString)
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);

const sliceText = (text, limit = 20) => {
    const t = (text ?? "").toString().trim();
    if (!t) return "-";
    return t.length > limit ? t.slice(0, limit) + "..." : t;
};

const BeadingList = () => {
    document.title = "Beading Orders";

    const dispatch = useDispatch();
    const { list, loading, hasMore, updateBeadingResponse } = useSelector(
        (state) => state.BeadingReducer
    );

    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [detailsData, setDetailsData] = useState(null);

    // ✅ filters
    const [filters, setFilters] = useState({
        start_date: "",
        end_date: "",
    });

    // ✅ pagination
    const [page, setPage] = useState(1);
    const limit = 10;

    // ✅ IMPORTANT refs (scroll container + sentinel)
    const scrollRootRef = useRef(null);
    const sentinelRef = useRef(null);

    const baseURL = useMemo(() => {
        const u = api?.IMG_URL || "";
        return u.endsWith("/") ? u : u + "/";
    }, []);

    // ✅ Load data when page changes
    useEffect(() => {
        dispatch(getBeadingList({ page, limit, ...filters }));
    }, [dispatch, page, filters.start_date, filters.end_date]);

    // ✅ PERFECT Infinite scroll for overflow container
    useEffect(() => {
        const rootEl = scrollRootRef.current;
        const targetEl = sentinelRef.current;
        if (!rootEl || !targetEl) return;

        const obs = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && !loading && hasMore) {
                    setPage((p) => p + 1);
                }
            },
            {
                root: rootEl,
                threshold: 0.1,
                rootMargin: "200px",
            }
        );

        obs.observe(targetEl);
        return () => obs.disconnect();
    }, [loading, hasMore]);

    const openDetails = (row) => {
        setDetailsData(row);
        setIsDetailsOpen(true);
    };

    const closeDetails = () => {
        setIsDetailsOpen(false);
        setDetailsData(null);
    };

    const handleAcceptBeading = (row) => {
        dispatch(
            updateBeading({
                beading_request_id: row.beading_request_id,
                vendor_beading_amount: row.vendor_beading_amount,

            })
        );
    };

    // ✅ after accept: reload from page 1
    useEffect(() => {
        if (updateBeadingResponse) {
            setIsDetailsOpen(false);
            setDetailsData(null); dispatch(getBeadingList({ page, limit, ...filters }));
            dispatch(resetUpdateBeadingResponse());
        }
    }, [updateBeadingResponse, dispatch]);

    // ✅ filter actions
    const applyFilter = () => {
        setPage(1); // ✅ reset page
        dispatch(getBeadingList({ page: 1, limit, ...filters }));
    };

    const clearFilter = () => {
        setFilters({ start_date: "", end_date: "" });
        setPage(1);
        dispatch(getBeadingList({ page: 1, limit }));
    };

    const refresh = () => {
        setPage(1);
        dispatch(getBeadingList({ page: 1, limit, ...filters }));
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Row>
                    <Col lg={12}>
                        <Card>
                            {/* ✅ one line header properly */}
                            <CardHeader className="card-header border-0">
                                <Row className="align-items-end g-2">
                                    {/* LEFT: Title */}
                                    <Col md="3">
                                        <h5 className="mb-0 fw-bold">Beading Orders</h5>
                                    </Col>

                                    {/* RIGHT: Filters + Buttons */}
                                    <Col md="9" className="ms-auto">
                                        <Row className="align-items-end g-2 justify-content-end">
                                            <Col md="3">
                                                <Label className="form-label fw-bold mb-1">Start Date</Label>
                                                <Flatpickr
                                                    className="form-control"
                                                    placeholder="Start date"
                                                    options={{ dateFormat: "Y-m-d" }}
                                                    value={filters.start_date}
                                                    onChange={([date]) =>
                                                        setFilters((p) => ({
                                                            ...p,
                                                            start_date: date ? date.toISOString().slice(0, 10) : "",
                                                        }))
                                                    }
                                                />
                                            </Col>

                                            <Col md="3">
                                                <Label className="form-label fw-bold mb-1">End Date</Label>
                                                <Flatpickr
                                                    className="form-control"
                                                    placeholder="End date"
                                                    options={{ dateFormat: "Y-m-d" }}
                                                    value={filters.end_date}
                                                    onChange={([date]) =>
                                                        setFilters((p) => ({
                                                            ...p,
                                                            end_date: date ? date.toISOString().slice(0, 10) : "",
                                                        }))
                                                    }
                                                />
                                            </Col>

                                            {/* Buttons */}
                                            <Col md="4" className="d-flex gap-2 justify-content-end">
                                                <Button color="success" className="mt-auto" onClick={applyFilter}>
                                                    Apply
                                                </Button>

                                                <Button color="secondary" className="mt-auto" onClick={clearFilter}>
                                                    Clear
                                                </Button>

                                                <Button color="primary" className="mt-auto" onClick={refresh}>
                                                    Refresh
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </CardHeader>


                            <CardBody className="pt-0">
                                {/* ✅ scroll container root */}
                                <div
                                    ref={scrollRootRef}
                                    className="table-responsive"
                                    style={{ maxHeight: "70vh", overflow: "auto" }}
                                >
                                    <table className="table align-middle table-hover mb-0">
                                        <thead
                                            className="table-light text-uppercase text-muted sticky-top"
                                            style={{ top: 0, zIndex: 1 }}
                                        >
                                            <tr>
                                                <th style={{ width: "5%" }}>#</th>
                                                <th style={{ width: "10%" }}>Image</th>
                                                <th style={{ width: "20%" }}>Title</th>
                                                <th style={{ width: "20%" }}>Customer</th>
                                                <th style={{ width: "15%" }}>Budget</th>
                                                <th style={{ width: "10%" }}>Location</th>
                                                <th style={{ width: "10%" }}>Status</th>
                                                <th style={{ width: "10%" }}>Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {list && list.length > 0 ? (
                                                list.map((o, index) => {
                                                    const imgs = parseImgs(o?.beading_request_images);
                                                    const firstImg = imgs?.[0] || null;
                                                    const imgSrc = firstImg
                                                        ? `${baseURL}beading_images/${firstImg}`
                                                        : null;

                                                    return (
                                                        <tr key={o?.beading_request_id || index}>
                                                            <td>{index + 1}</td>

                                                            <td>
                                                                {imgSrc ? (
                                                                    <img
                                                                        src={imgSrc}
                                                                        alt="beading"
                                                                        style={{
                                                                            width: 52,
                                                                            height: 52,
                                                                            objectFit: "cover",
                                                                            borderRadius: 8,
                                                                            border: "1px solid #e9ecef",
                                                                        }}
                                                                        onError={(e) => (e.currentTarget.style.opacity = 0.2)}
                                                                    />
                                                                ) : (
                                                                    <span className="text-muted small">No image</span>
                                                                )}
                                                            </td>

                                                            <td title={o?.beading_request_title || ""}>
                                                                <div className="fw-bold">
                                                                    {sliceText(o?.beading_request_title, 12)}
                                                                </div>
                                                                <div
                                                                    className="text-muted small"
                                                                    title={o?.beading_request_description || ""}
                                                                >
                                                                    {sliceText(o?.beading_request_description, 20)}
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <div className="fw-bold">{o?.customer_name || "-"}</div>
                                                                <div className="text-muted small">
                                                                    {o?.customer_email || "-"}
                                                                </div>
                                                                <div className="text-muted small">
                                                                    {o?.customer_phone || "-"}
                                                                </div>
                                                            </td>

                                                            <td>
                                                                ₹{o?.beading_budget_min || 0} - ₹{o?.beading_budget_max || 0}
                                                            </td>

                                                            <td title={o?.beading_location || ""}>
                                                                {sliceText(o?.beading_location, 16)}
                                                            </td>

                                                            <td>
                                                                <span className={statusClass(o?.beading_request_status)}>
                                                                    {statusText(o?.beading_request_status)}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <button
                                                                    className="text-dark border-0 bg-transparent"
                                                                    onClick={() => openDetails(o)}
                                                                    title="View Details"
                                                                >
                                                                    <i className="ri-eye-fill fs-16"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : !loading ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-5">
                                                        <lord-icon
                                                            src="https://cdn.lordicon.com/msoeawqm.json"
                                                            trigger="loop"
                                                            colors="primary:#405189,secondary:#0ab39c"
                                                            style={{ width: "72px", height: "72px" }}
                                                        ></lord-icon>
                                                        <div className="mt-4">
                                                            <h5>No Records found</h5>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : null}

                                            {/* ✅ Sentinel (must be inside scroll div) */}
                                            <tr>
                                                <td colSpan="8">
                                                    <div ref={sentinelRef} style={{ height: 1 }} />
                                                </td>
                                            </tr>

                                            {loading && (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-3 text-muted">
                                                        Loading...
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

            {/* DETAILS MODAL */}
            <BeadingDetailsModal
                isOpen={isDetailsOpen}
                toggle={closeDetails}
                data={detailsData}
                imgBaseUrl={baseURL}
                onAccept={handleAcceptBeading}
            />
        </div>
    );
};

export default BeadingList;
