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
    CardBody,
    Spinner,
    CardHeader
} from "reactstrap";
import Select from "react-select";          // Importing select from react-select
import { useDispatch, useSelector } from "react-redux";
import { getChildAmcRequest, updateAmcRequestStatus } from "../../store/amc/AmcRequest";
import { addAmcQuotation, resetAmcQuotationResponse } from "../../store/amc/AmcQuotation";
const CreateQuoteModal = ({ isOpen, toggle, requestData }) => {

    const dispatch = useDispatch();

    const { childRequests, loading } = useSelector(
        (state) => state.AmcRequestReducer
    );
    const { addAmcQuotationResponse } = useSelector(
        (state) => state.AmcQuotationReducer
    );
    const [items, setItems] = useState([]);
    const [gst, setGst] = useState(18);

    const [vendorId, setVendorId] = useState("");
    const [durationMonths, setDurationMonths] = useState("");
    const [serviceVisits, setServiceVisits] = useState("");
    const [coverageType, setCoverageType] = useState("");

    // Load child request products
    useEffect(() => {

        if (isOpen && requestData?.request_id) {
            dispatch(getChildAmcRequest(requestData.request_id));
        }

    }, [isOpen, requestData, dispatch]);

    // Format items
    useEffect(() => {

        if (Array.isArray(childRequests)) {

            const formatted = childRequests.map((item) => ({
                ...item,
                price: "",
                total: 0
            }));

            setItems(formatted);

        }

    }, [childRequests]);
    useEffect(() => {

        if (addAmcQuotationResponse) {
            dispatch(
                updateAmcRequestStatus({
                    request_id: requestData.request_id,
                    request_status: "Quotation Created",
                })
            );
            toggle(); // close modal

            dispatch(resetAmcQuotationResponse()); // reset flag

        }

    }, [addAmcQuotationResponse, dispatch]);

    const handlePriceChange = (index, value) => {

        const updated = [...items];

        const price = Number(value || 0);
        const qty = Number(updated[index].qty || 1);

        updated[index].price = price;
        updated[index].total = price * qty;

        setItems(updated);
    };

    // Totals
    const subtotal = items.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0
    );

    const gstAmount = (subtotal * gst) / 100;
    const grandTotal = subtotal + gstAmount;

    // Save Quote

    const coverageOptions = [
        { value: "comprehensive", label: "Comprehensive" },
        { value: "non_comprehensive", label: "Non Comprehensive" }
    ];
    const handleSaveQuote = () => {

        const payload = {

            request_id: requestData.request_id,
            vendor_id: vendorId,
            customer_id: requestData.customer_id,
            customer_address_id: requestData.customer_address_id,

            duration_months: Number(durationMonths),
            service_visits: Number(serviceVisits),
            coverage_type: coverageType,

            gst_percent: Number(gst),

            items: items.map((item) => ({
                product_id: item.product_id,
                product_name: item.product_name || item.child_name || item.title,
                problem_note: item.problem_note || item.child_name || item.title,
                qty: Number(item.qty || 1),
                price: Number(item.price || 0),
                total: Number(item.qty || 1) * Number(item.price || 0)
            }))

        };

        dispatch(addAmcQuotation(payload));

    };
    return (

        <Modal isOpen={isOpen} toggle={toggle} size="xl">

            <ModalHeader toggle={toggle}>
                Create AMC Quote
            </ModalHeader>

            <ModalBody>

                {/* Quote Details */}
                <Card className="border card-border-success p-3 shadow-lg">

                    {/* <Card className="">

                        <CardBody>

                            <Row className=" d-flex justify-content-end">




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

                        </CardBody>

                    </Card> */}

                    {/* Products Table */}

                    <Card className=" ">


                        <CardBody>
                            <Row className=" d-flex justify-content-end">
                                <Col md="3">
                                    <label>Service Visits</label>
                                    <Input
                                        type="number"
                                        value={serviceVisits}
                                        onChange={(e) => setServiceVisits(e.target.value)}
                                    />
                                <Col md="3">
                                </Col>
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

                            {loading ? (

                                <div className="text-center py-4">

                                    <Spinner />

                                    <div className="mt-2">
                                        Loading child request data...
                                    </div>

                                </div>

                            ) : items.length > 0 ? (

                                <div className="table-responsive">
                                    <table className="table align-middle table-hover">
                                        <thead className="table-light text-uppercase text-muted">
                                            <tr>
                                                <th>#</th>
                                                <th>Product</th>
                                                <th>Qty</th>
                                                <th>Problem</th>
                                                <th width="150">Price</th>
                                                <th width="150">Total</th>
                                            </tr>

                                        </thead>

                                        <tbody>

                                            {items.map((item, index) => (

                                                <tr key={index}>

                                                    <td>{index + 1}</td>

                                                    <td>
                                                        {item.product_name ||
                                                            item.child_name ||
                                                            item.title ||
                                                            "-"}
                                                    </td>

                                                    <td>{item.qty || 1}</td>

                                                    <td>{item.problem_note || "-"}</td>

                                                    <td>

                                                        <Input
                                                            type="number"
                                                            placeholder="Enter price"
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

                            ) : (

                                <div className="text-center py-4 text-muted">
                                    No child request data found
                                </div>

                            )}

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

                <Button color="success" onClick={handleSaveQuote}>
                    Save Quote
                </Button>

            </ModalFooter>

        </Modal>

    );
};

export default CreateQuoteModal;