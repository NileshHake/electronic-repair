import React, { useEffect, useState, useMemo, lazy, Suspense } from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Card,
    Row,
    Col,
    Input,
    Label,
} from "reactstrap";
import { useDispatch } from "react-redux";
import {
    updateStoreFeature,
} from "../../store/StoreFeatures";

import { ICONS } from "../../icons";

const StoreFeatureUpdate = ({ isOpen, toggle, featureData }) => {
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        icon: "",
    });

    const [iconSearch, setIconSearch] = useState("");
    const [errors, setErrors] = useState({});

    // 🔁 Prefill data
    useEffect(() => {
        if (featureData) {
            setFormData({
                title: featureData.title || "",
                description: featureData.description || "",
                icon: featureData.icon || "",
            });
        }
    }, [featureData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
        setErrors((p) => ({ ...p, [name]: "" }));
    };

    const handleSubmit = () => {
        let newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title required";
        if (!formData.description.trim())
            newErrors.description = "Description required";
        if (!formData.icon) newErrors.icon = "Select icon";

        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }

        dispatch(
            updateStoreFeature({
                feature_id: featureData.feature_id,
                ...formData,
            })
        );

        toggle();
    };

    const filteredIcons = useMemo(() => {
        if (!isOpen) return [];
        return Object.keys(ICONS)
            .filter((key) =>
                key.toLowerCase().includes(iconSearch.toLowerCase())
            )
            .slice(0, 60);
    }, [iconSearch, isOpen]);

    return (
        <Modal isOpen={isOpen} centered size="lg">
            <ModalHeader toggle={toggle}>Update Store Feature</ModalHeader>

            <ModalBody>
                <Card className="border card-border-success p-3 shadow-lg">
                    <Row className="g-3">
                        <Col md={12}>
                            <Label>Title *</Label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                            />
                            <small className="text-danger">{errors.title}</small>
                        </Col>

                        <Col md={12}>
                            <Label>Description *</Label>
                            <Input
                                type="textarea"
                                rows="3"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                            <small className="text-danger">{errors.description}</small>
                        </Col>

                        <Col md={12}>
                            <Label>Search Icon</Label>
                            <Input
                                value={iconSearch}
                                onChange={(e) => setIconSearch(e.target.value)}
                                placeholder="Search icon..."
                            />
                        </Col>

                        <Col md={12}>
                            <Label>Select Icon *</Label>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
                                    gap: "10px",
                                    maxHeight: "260px",
                                    overflowY: "auto",
                                    border: "1px solid #ddd",
                                    padding: "10px",
                                }}
                            >
                                {filteredIcons.map((key) => {
                                    const Icon = ICONS[key];
                                    const active = formData.icon === key;

                                    return (
                                        <div
                                            key={key}
                                            onClick={() =>
                                                setFormData((p) => ({ ...p, icon: key }))
                                            }
                                            style={{
                                                cursor: "pointer",
                                                border: active
                                                    ? "2px solid #0d6efd"
                                                    : "1px solid #ccc",
                                                padding: "10px",
                                                textAlign: "center",
                                            }}
                                        >
                                            <Icon size={26} />
                                            <div style={{ fontSize: "10px" }}>{key}</div>
                                        </div>
                                    );
                                })}
                            </div>
                            <small className="text-danger">{errors.icon}</small>
                        </Col>
                        {/* ICON PREVIEW */}
                        {/* ICON PREVIEW */}
                        {formData.icon && ICONS[formData.icon] && (
                            <Col md={12} className="text-center mt-3">
                                <Label className="fw-bold">Selected Icon</Label>
                                <div
                                // className="justify-content- d-flex"
                                >
                                    {React.createElement(ICONS[formData.icon], { size: 40 })}
                                </div>
                                <small className="mt-1 text-muted">{formData.icon}</small>
                            </Col>
                        )}

                    </Row>
                </Card>
            </ModalBody>

            <ModalFooter>
                <Button color="primary" onClick={handleSubmit}>
                    Update
                </Button>
                <Button color="danger" onClick={toggle}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default StoreFeatureUpdate;
