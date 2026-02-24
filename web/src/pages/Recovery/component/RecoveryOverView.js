/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Recovery/RecoveryComponent/RecoveryOverView.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Card,
    Col,
    Container,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane,
} from "reactstrap";
import classnames from "classnames";

import profileBg from "../../../assets/images/profile-bg.jpg";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../../config";

// ✅ your redux actions
import { getSingleRecovery } from "../../../store/recovery/index";
import { getServicesList } from "../../../store/Service";
import RecoveryDetailsLayout from "./RecoveryDetailsLayout";

// ✅ Quotation/Billing modals 
import { toast, ToastContainer } from "react-toastify";
import { resetAddQuotationBillingResponse } from "../../../store/QuotationAndBilling";
import QuotationAndBillingAdd from "../../Repairing/QuotationAndBilling/QuotationAndBillingAdd";
import QuotationAndBillingPerviwe from "../../Repairing/QuotationAndBilling/QuotationAndBillingPerviwe";

const RecoveryOverView = () => {
    const dispatch = useDispatch();
    const { recovery_id } = useParams();

    const [activeTab, setActiveTab] = useState("1");
    const [activityTab, setActivityTab] = useState("1");

    // ✅ quotation/billing modal states
    const [isQuotationModaLOpen, setIsQuotationModaLOpen] = useState(false);
    const [isQuotationPreviewModalOpen, setIsQuotationPreviewModalOpen] = useState(false);
    const [isBillingPreviewModalOpen, setIsBillingPreviewModalOpen] = useState(false);
    const [isBillingModaLOpen, setIsBillingModaLOpen] = useState(false);

    const addResponse = useSelector((state) => state.QuotationBillingReducer.addResponse);

    // ✅ reducers
    const { services } = useSelector((state) => state.ServiceReducer) || {};
    const { singleRecovery } = useSelector((state) => state.RecoveryReducer) || {};

    const toggleTab = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    };

    // ✅ fetch single recovery
    useEffect(() => {
        if (recovery_id) {
            dispatch(getSingleRecovery(recovery_id));
            dispatch(getServicesList());
        }
    }, [dispatch, recovery_id, addResponse]);

    // ✅ toast on add
    useEffect(() => {
        if (addResponse) {
            if (isQuotationModaLOpen && isBillingModaLOpen) {
                toast.success("Quotation & Billing added successfully!");
            } else if (isQuotationModaLOpen) {
                toast.success("Quotation added successfully!");
            } else if (isBillingModaLOpen) {
                toast.success("Billing added successfully!");
            }

            dispatch(resetAddQuotationBillingResponse());

            setIsQuotationModaLOpen(false);
            setIsBillingModaLOpen(false);
        }
    }, [addResponse, dispatch]);

    // ✅ images
    const [selectedFiles, setSelectedFiles] = useState([]);
    useEffect(() => {
        if (singleRecovery?.recovery_image) {
            let existingImages = [];
            try {
                existingImages = JSON.parse(singleRecovery.recovery_image);
            } catch {
                existingImages = [];
            }

            const existingPreviews = (existingImages || []).map((imgName) => ({
                name: imgName,
                preview: `${api.IMG_URL}recovery_images/${imgName}`,
                isExisting: true,
            }));

            setSelectedFiles(existingPreviews);
        } else {
            setSelectedFiles([]);
        }
    }, [singleRecovery]);

    // ✅ profile image
    const getProfileImage = (row) => {
        const p = row?.customer_profile;
        if (!p) return null;
        if (String(p).startsWith("http")) return p;
        return `${api.IMG_URL}user_profile/${p}`;
    };

    // ✅ video URL
    const videoUrl = singleRecovery?.recovery_video
        ? `${api.VID_URL}recovery_videos/${singleRecovery?.recovery_video}`
        : null;

    document.title = "Recovery | Over View";

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    {/* top bg */}
                    <div className="profile-foreground position-relative mx-n4 mt-n4">
                        <div className="profile-wid-bg">
                            <img
                                src={profileBg}
                                alt=""
                                className="profile-wid-img"
                                style={{ pointerEvents: "none" }}
                            />
                        </div>

                        {/* ✅ Buttons (Quotation/Billing) */}
                        <div
                            className="position-absolute top-0 end-0 m-3 d-flex gap-2"
                            style={{ zIndex: 9999, pointerEvents: "auto" }}
                        >
                            {singleRecovery?.recovery_quotation_id !== null ? (
                                <button
                                    className="btn btn-sm text-white fw-bold d-flex align-items-center gap-1"
                                    onClick={() => setIsQuotationPreviewModalOpen(true)}
                                    style={{ backgroundColor: "#D92D20" }}
                                >
                                    <i className="bi bi-receipt-cutoff"></i>
                                    View Quotation
                                </button>
                            ) : (
                                <button
                                    className="btn btn-sm text-white fw-bold d-flex align-items-center gap-1"
                                    onClick={() => setIsQuotationModaLOpen(true)}
                                    style={{ backgroundColor: "#D92D20" }}
                                >
                                    <i className="bi bi-receipt-cutoff"></i>
                                    Quotation
                                </button>
                            )}

                            {singleRecovery?.recovery_bill_id !== null ? (
                                <button
                                    className="btn btn-sm text-white fw-bold d-flex align-items-center gap-1"
                                    onClick={() => setIsBillingPreviewModalOpen(true)}
                                    style={{ backgroundColor: "#0FA958" }}
                                >
                                    <i className="bi bi-receipt"></i>
                                    View Billing
                                </button>
                            ) : (
                                <button
                                    className="btn btn-sm text-white fw-bold d-flex align-items-center gap-1"
                                    onClick={() => setIsBillingModaLOpen(true)}
                                    style={{ backgroundColor: "#0FA958" }}
                                >
                                    <i className="bi bi-receipt"></i>
                                    Billing
                                </button>
                            )}
                        </div>
                    </div>

                    {/* header profile */}
                    <div className="pt-4 mb-4 mb-lg-3 pb-lg-4 profile-wrapper">
                        <Row className="g-4">
                            <div className="col-auto">
                                <div className="avatar-lg">
                                    {getProfileImage(singleRecovery) ? (
                                        <img
                                            src={getProfileImage(singleRecovery)}
                                            alt="profile"
                                            className="img-thumbnail rounded-circle"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="img-thumbnail rounded-circle bg-primary text-white"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: "600",
                                                fontSize: "38px",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            {singleRecovery?.customer_name?.charAt(0) || "C"}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Col>
                                <div className="p-2">
                                    <h3 className="text-white mb-1">
                                        {singleRecovery?.customer_name || ""}
                                    </h3>
                                    <p className="text-white text-opacity-75">Customer</p>

                                    <div className="hstack text-white-50 gap-1">
                                        <div className="me-2">
                                            <i className="ri-map-pin-user-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
                                            {singleRecovery?.customer_address_state || "-"}
                                        </div>
                                        <div>
                                            <i className="ri-building-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
                                            {singleRecovery?.customer_address_city || "-"}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {/* tabs */}
                    <Row>
                        <Col lg={12}>
                            <div>
                                <div className="d-flex profile-wrapper">
                                    <Nav pills className="animation-nav profile-nav gap-2 gap-lg-3 mb-4">
                                        <NavItem>
                                            <NavLink
                                                className={classnames({ active: activeTab === "1" })}
                                                onClick={() => toggleTab("1")}
                                            >
                                                Overview
                                            </NavLink>
                                        </NavItem>

                                        <NavItem>
                                            <NavLink
                                                className={classnames({ active: activeTab === "2" })}
                                                onClick={() => toggleTab("2")}
                                            >
                                                Gallery
                                            </NavLink>
                                        </NavItem>

                                        <NavItem>
                                            <NavLink
                                                className={classnames({ active: activeTab === "3" })}
                                                onClick={() => toggleTab("3")}
                                            >
                                                Video
                                            </NavLink>
                                        </NavItem>
                                    </Nav>
                                </div>

                                <TabContent activeTab={activeTab} className="pt-4">
                                    {/* ✅ overview */}
                                    <TabPane tabId="1">
                                        <RecoveryDetailsLayout
                                            singleRecovery={singleRecovery}
                                            services={services}
                                            activityTab={activityTab}
                                        />
                                    </TabPane>

                                    {/* ✅ gallery */}
                                    <TabPane tabId="2">
                                        <Row className="g-3">
                                            {selectedFiles.length > 0 ? (
                                                selectedFiles.map((file, idx) => (
                                                    <Col key={idx} xs="6" sm="4" md="3" lg="2">
                                                        <Card className="shadow-sm border-0 h-100">
                                                            <img
                                                                src={file.preview}
                                                                alt={file.name}
                                                                className="img-fluid rounded-top"
                                                                style={{ height: "150px", objectFit: "cover" }}
                                                            />
                                                            <div className="p-2 text-center">
                                                                <p
                                                                    className="mb-0 fw-semibold text-truncate"
                                                                    title={file.name}
                                                                >
                                                                    {file.name}
                                                                </p>
                                                            </div>
                                                        </Card>
                                                    </Col>
                                                ))
                                            ) : (
                                                <Col>
                                                    <p className="text-muted">No images available.</p>
                                                </Col>
                                            )}
                                        </Row>
                                    </TabPane>

                                    {/* ✅ video */}
                                    <TabPane tabId="3">
                                        <Row className="g-3">
                                            <Col lg={12}>
                                                <Card className="shadow-sm border-0">
                                                    <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <h6 className="mb-0 fw-bold">Recovery Video</h6>
                                                            <small className="text-muted">
                                                                {singleRecovery?.recovery_video
                                                                    ? singleRecovery.recovery_video
                                                                    : "No video uploaded"}
                                                            </small>
                                                        </div>

                                                        {singleRecovery?.recovery_video ? (
                                                            <span className="badge bg-success">Available</span>
                                                        ) : (
                                                            <span className="badge bg-secondary">Not Available</span>
                                                        )}
                                                    </div>

                                                    <div className="p-3">
                                                        {videoUrl ? (
                                                            <video
                                                                src={videoUrl}
                                                                controls
                                                                style={{
                                                                    width: "100%",
                                                                    maxHeight: "520px",
                                                                    borderRadius: "12px",
                                                                    background: "#000",
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="text-center py-5 text-muted">
                                                                No video available.
                                                            </div>
                                                        )}
                                                    </div>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </TabPane>
                                </TabContent>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* ✅ Toast */}
            <ToastContainer limit={1} autoClose={800} />

            {/* ✅ Quotation Modal */}
            {isQuotationModaLOpen && (
                <QuotationAndBillingAdd
                    RepairData={singleRecovery}
                    recovery_or_repair="recovery"
                    isOpen={isQuotationModaLOpen}
                    toggle={() => setIsQuotationModaLOpen(false)}
                    type="Quotation"
                />
            )}

            {/* ✅ Quotation Preview */}
            {isQuotationPreviewModalOpen && (
                <QuotationAndBillingPerviwe
                    RepairData={singleRecovery}
                    recovery_or_repair="recovery"
                    isOpen={isQuotationPreviewModalOpen}
                    toggle={() => setIsQuotationPreviewModalOpen(false)}

                    mode="recovery"
                    type="Quotation"
                />
            )}

            {/* ✅ Billing Preview */}
            {isBillingPreviewModalOpen && (
                <QuotationAndBillingPerviwe
                    RepairData={singleRecovery}
                    recovery_or_repair="recovery"
                    isOpen={isBillingPreviewModalOpen}
                    toggle={() => setIsBillingPreviewModalOpen(false)}
                    mode="recovery"
                    type="Billing"
                />
            )}

            {/* ✅ Billing Modal */}
            {isBillingModaLOpen && (
                <QuotationAndBillingAdd
                    RepairData={singleRecovery}
                    recovery_or_repair="recovery"
                    isOpen={isBillingModaLOpen}
                    toggle={() => setIsBillingModaLOpen(false)}
                    type="Billing"
                />
            )}
        </React.Fragment>
    );
};

export default RecoveryOverView;