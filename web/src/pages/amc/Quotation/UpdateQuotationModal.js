import React, { useEffect, useState } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Row,
    Col,
    Card,
    CardBody
} from "reactstrap";

import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";

import {
    resetAmcQuotationResponse,
    updateAmcQuotation,

} from "../../../store/amc/AmcQuotation/index";

const UpdateQuotationModal = ({
    isOpen,
    toggle,
    quotationData,
    childQuotationItems
}) => {

    const dispatch = useDispatch();

    const { updateAmcQuotationResponse } = useSelector(
        (state) => state.AmcQuotationReducer
    );

    const [items, setItems] = useState([]);
    const [gst, setGst] = useState(18);
    const [coverageType, setCoverageType] = useState("");

    const [serviceVisits, setServiceVisits] = useState("");
    const [durationMonths, setDurationMonths] = useState("");

    useEffect(() => {
        if (quotationData) {

            setCoverageType(quotationData.coverage_type);
            setServiceVisits(quotationData.service_visits);
            setDurationMonths(quotationData.duration_months);
            setGst(quotationData.gst_percent || 18);
        }
    }, [quotationData]);

    useEffect(() => {

        if (childQuotationItems) {

            const formatted = childQuotationItems.map((item) => ({
                ...item,
                price: item.price,
                total: item.total
            }));

            setItems(formatted);
        }

    }, [childQuotationItems]);

    useEffect(() => {

        if (updateAmcQuotationResponse) {

            toggle();

            dispatch(resetAmcQuotationResponse());

        }

    }, [updateAmcQuotationResponse]);

    const handlePriceChange = (index, value) => {

        const updated = [...items];

        const price = Number(value || 0);
        const qty = Number(updated[index].qty || 1);

        updated[index].price = price;
        updated[index].total = price * qty;

        setItems(updated);

    };

    const subtotal = items.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0
    );

    const gstAmount = (subtotal * gst) / 100;
    const grandTotal = subtotal + gstAmount;

    const coverageOptions = [
        { value: "comprehensive", label: "Comprehensive" },
        { value: "non_comprehensive", label: "Non Comprehensive" }
    ];

    const handleUpdateQuote = () => {

        const payload = {

            quotation_id: quotationData.quotation_id,

            duration_months: Number(durationMonths),
            service_visits: Number(serviceVisits),
            coverage_type: coverageType,

            gst_percent: Number(gst),

            items: items.map((item) => ({
                quotation_item_id: item.quotation_item_id,
                product_id: item.product_id,
                qty: Number(item.qty),
                price: Number(item.price),
                total: Number(item.qty) * Number(item.price)
            }))

        };

        dispatch(updateAmcQuotation(payload));

    };

    return (

        <Modal isOpen={isOpen} toggle={toggle} size="xl">

            <ModalHeader toggle={toggle}>
                Update AMC Quote
            </ModalHeader>

            <ModalBody>

                <Card className="border card-border-success p-3 shadow-lg">

                    <Card>

                        <CardBody>

                            <Row className="d-flex justify-content-end">

                                <Col md="3">
                                    <label>Service Visits</label>
                                    <Input
                                        type="number"
                                        value={serviceVisits}
                                        onChange={(e) => setServiceVisits(e.target.value)}
                                    />
                                </Col>

                                <Col md="3">
                                    <label>Coverage Type</label>
                                    <Select
                                        options={coverageOptions}
                                        value={coverageOptions.find(
                                            (option) => option.value === coverageType
                                        )}
                                        onChange={(selected) => setCoverageType(selected.value)}
                                        placeholder="Select Coverage"
                                    />
                                </Col>

                            </Row>

                            <h5 className="mb-3 fw-bold">AMC Products</h5>

                            <div className="table-responsive">

                                <table className="table align-middle table-hover">

                                    <thead className="table-light text-uppercase text-muted">
                                        <tr>
                                            <th>#</th>
                                            <th>Product</th>
                                            <th>Qty</th>
                                            <th width="150">Price</th>
                                            <th width="150">Total</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {items.map((item, index) => (

                                            <tr key={index}>

                                                <td>{index + 1}</td>

                                                <td>{item.product_name}</td>

                                                <td>{item.qty}</td>

                                                <td>

                                                    <Input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) =>
                                                            handlePriceChange(index, e.target.value)
                                                        }
                                                    />

                                                </td>

                                                <td>
                                                    <strong>₹ {item.total}</strong>
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </CardBody>

                    </Card>

                    {/* TOTAL SECTION */}

                    <Row className="justify-content-end mt-4">

                        <Col md="4">

                            <Card>

                                <CardBody>

                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Subtotal</span>
                                        <strong>₹ {subtotal}</strong>
                                    </div>

                                    <div className="d-flex justify-content-between mb-2 align-items-center">

                                        <span>GST %</span>

                                        <Input
                                            type="number"
                                            style={{ width: "80px" }}
                                            value={gst}
                                            onChange={(e) => setGst(Number(e.target.value))}
                                        />

                                    </div>

                                    <div className="d-flex justify-content-between mb-2">
                                        <span>GST Amount</span>
                                        <strong>₹ {gstAmount}</strong>
                                    </div>

                                    <hr />

                                    <div className="d-flex justify-content-between fw-bold">
                                        <span>Total</span>
                                        <span>₹ {grandTotal}</span>
                                    </div>

                                </CardBody>

                            </Card>

                        </Col>

                    </Row>

                </Card>

            </ModalBody>

            <ModalFooter>

                <Button color="secondary" onClick={toggle}>
                    Cancel
                </Button>

                <Button color="primary" onClick={handleUpdateQuote}>
                    Update Quote
                </Button>

            </ModalFooter>

        </Modal>
    );
};

export default UpdateQuotationModal;