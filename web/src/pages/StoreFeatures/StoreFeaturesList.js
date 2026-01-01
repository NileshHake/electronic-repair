import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Container,
    Row,
    Col,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

import DeleteModal from "../../Components/Common/DeleteModal";
import {
    getStoreFeaturesList,
    deleteStoreFeature,
} from "../../store/StoreFeatures/index";

import StoreFeatureAdd from "./StoreFeaturesAdd";
import { Icon } from "leaflet";
import { ICONS } from "../../icons";
import StoreFeatureUpdate from "./StoreFeaturesUpdate";

const StoreFeaturesList = () => {
    document.title = "Store Features";

    const dispatch = useDispatch();
    const { features, addFeatureResponse, loading } = useSelector(
        (state) => state.StoreFeatureReducer
    );

    console.log(features);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);

    // Fetch store features
    useEffect(() => {
        dispatch(getStoreFeaturesList());
        console.log(addFeatureResponse);

        if (addFeatureResponse) {
            setIsAddOpen(false)
        }
    }, [dispatch, addFeatureResponse]);

    const handleModalClose = () => {
        setIsAddOpen(false);
        setIsUpdateOpen(false);
        dispatch(getStoreFeaturesList());
    };

    const onClickDelete = (feature) => {
        setSelectedFeature(feature);
        setDeleteModal(true);
    };

    const handleDeleteFeature = () => {
        if (selectedFeature) {
            dispatch(deleteStoreFeature(selectedFeature.feature_id));
        }
        setDeleteModal(false);
    };

    return (
        <div className="page-content">
            <Container fluid>

                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardHeader className="card-header border-0">
                                <Row className="align-items-center gy-3">
                                    <div className="col-sm">
                                        <h5 className="mb-0 fw-bold">Store Features</h5>
                                    </div>
                                    <div className="col-sm-auto">
                                        <Button color="success" onClick={() => setIsAddOpen(true)}>
                                            + Add Feature
                                        </Button>
                                    </div>
                                </Row>
                            </CardHeader>

                            <CardBody className="pt-0">
                                <div className="table-responsive">
                                    <table className="table align-middle table-hover">
                                        <thead className="table-light text-uppercase text-muted">
                                            <tr>
                                                <th style={{ width: "5%" }}>#</th>
                                                <th style={{ width: "10%" }}>Icon</th>
                                                <th style={{ width: "25%" }}>Title</th>
                                                <th style={{ width: "40%" }}>Description</th>
                                                <th style={{ width: "20%" }}>Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {!loading &&
                                                features &&
                                                features.length > 0 ? (
                                                features.map((feature, index) => (
                                                    <tr key={feature.feature_id}>
                                                        <td>{index + 1}</td>

                                                        {/* ICON */}
                                                        <td>
                                                            {feature.icon && React.createElement(ICONS[feature.icon], { size: 40 })}
                                                        </td>


                                                        {/* TITLE */}
                                                        <td>{feature.title}</td>

                                                        {/* DESCRIPTION */}
                                                        <td>{feature.description}</td>

                                                        {/* ACTIONS */}
                                                        <td>
                                                            <ul className="list-inline hstack gap-2 mb-0">
                                                                <li className="list-inline-item">
                                                                    <button
                                                                        className="text-primary border-0 bg-transparent"
                                                                        onClick={() => {
                                                                            setSelectedFeature(feature);
                                                                            setIsUpdateOpen(true);
                                                                        }}
                                                                    >
                                                                        <i className="ri-pencil-fill fs-16"></i>
                                                                    </button>
                                                                </li>
                                                                <li className="list-inline-item">
                                                                    <button
                                                                        onClick={() => onClickDelete(feature)}
                                                                        className="text-danger border-0 bg-transparent"
                                                                    >
                                                                        <i className="ri-delete-bin-5-fill fs-16"></i>
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-4">
                                                        <lord-icon
                                                            src="https://cdn.lordicon.com/msoeawqm.json"
                                                            trigger="loop"
                                                            colors="primary:#405189,secondary:#0ab39c"
                                                            style={{ width: "72px", height: "72px" }}
                                                        ></lord-icon>
                                                        <h6 className="mt-3 text-muted">
                                                            No Store Features Found
                                                        </h6>
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

            {/* ADD MODAL */}
            {isAddOpen && (
                <StoreFeatureAdd isOpen={isAddOpen} toggle={handleModalClose} />
            )}

            {/* UPDATE MODAL */}
            {isUpdateOpen && (
                <StoreFeatureUpdate
                    isOpen={isUpdateOpen}
                    toggle={handleModalClose}
                    featureData={selectedFeature}
                />
            )}

            {/* DELETE MODAL */}
            <DeleteModal
                show={deleteModal}
                onDeleteClick={handleDeleteFeature}
                onCloseClick={() => setDeleteModal(false)}
            />
        </div>
    );
};

export default StoreFeaturesList;
