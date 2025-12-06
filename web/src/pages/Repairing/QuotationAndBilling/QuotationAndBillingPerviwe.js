import { useRef } from "react";
import AuthUser from "../../../helpers/AuthType/AuthUser";
import { Button, Form, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSingleQuotationBilling } from "../../../store/QuotationAndBilling";
import { formatDateTime } from "../../../helpers/date_and_time_format";
import { api } from "../../../config";
import QRCode from "react-qr-code";

const QuotationAndBillingPerviwe = ({ isOpen, toggle, RepairData, type }) => {
    const printRef = useRef(null);
    const { singleQuotationBilling } = useSelector((state) => state.QuotationBillingReducer);
    const { BusinessData } = AuthUser();
    const dispatch = useDispatch();
    console.log(RepairData?.repair_quotation_id);
    console.log(RepairData?.RepairData?.repair_bill_id);

    useEffect(() => {
        dispatch(getSingleQuotationBilling(type === "Quotation" ? RepairData?.repair_quotation_id : RepairData?.repair_bill_id));
    }, [dispatch])
    // ================================ PRINT START ================================
    const handlePrint = () => {
        const printContents = printRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };
    // ================================ PRINT END ================================
    const upiLink = `upi://pay?pa=${BusinessData?.user_upi_id}&pn=${BusinessData?.user_name}&am=${singleQuotationBilling?.quotation_and_billing_master_grand_total}&cu=INR`;

    return (
        <>
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .modal, .modal-content { position: static !important; }
                    .modal-footer, .modal-header, button { display: none !important; }
                    .print-area {
                        width: 210mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>
            <Modal size="" style={{ maxWidth: "230mm", width: "230mm" }} isOpen={isOpen} centered>
                <ModalHeader toggle={toggle}>
                    Print
                </ModalHeader>

                <Form>
                    <ModalBody  >
                        <div ref={printRef} className="print-area">


                            <div className="quotation-container" style={{ width: '210mm', margin: '20px auto', backgroundColor: 'white', padding: 30, boxShadow: '0 0 10px rgba(0,0,0,0.1)', border: '1px solid #ccc' }}>
                                {/* Header */}
                                <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 10, marginBottom: 20 }}>
                                    <div style={{ width: '50%', display: 'flex', alignItems: 'center' }}>
                                        {BusinessData.user_profile ? (
                                            <img
                                                src={`${api.IMG_URL}user_profile/${BusinessData.user_profile}`}
                                                alt={BusinessData.user_name}
                                                style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: "50%",
                                                    backgroundColor: '#f0f0f0',
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "35px",
                                                    fontWeight: "bold",
                                                    color: "black",
                                                    textTransform: "uppercase"
                                                }}
                                            >
                                                {BusinessData?.user_name?.charAt(0)}
                                            </div>
                                        )}

                                        <p style={{ fontSize: '12pt', margin: 0, paddingLeft: 10 }}>
                                            {BusinessData.user_name}
                                        </p>
                                    </div>

                                    <div style={{ width: '45%', textAlign: 'right', fontSize: '10pt', lineHeight: '1.4' }}>
                                        <p style={{ margin: 0 }}><strong>{BusinessData?.user_name || "N/A"} </strong></p>
                                        <p style={{ margin: 0 }}>GST No: {BusinessData?.user_gst_number || "N/A"} </p>
                                        <p style={{ margin: 0 }}>Phone: {BusinessData?.user_phone_number || "N/A"} </p>
                                        <p style={{ margin: 0 }}>Email: {BusinessData?.user_email || "N/A"} </p>
                                    </div>
                                    <div style={{ width: '100%', textAlign: 'center', margin: '15px 0', padding: 8, border: '1px solid black', backgroundColor: '#f0f0f0' }}>
                                        <h2 style={{ margin: 0, fontSize: '14pt' }}>{singleQuotationBilling.quotation_or_billing === "Quotation" ? "QUOTATION" : "BILL"}</h2>
                                    </div>
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '10pt', borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '10px 0' }}>
                                        <div style={{ width: '48%' }}>
                                            <p style={{ margin: 0 }}>
                                                <strong>QU No:</strong> {`QU-${singleQuotationBilling?.quotation_and_billing_master_id || ""}`}
                                            </p>

                                        </div>
                                        <div style={{ width: '48%', textAlign: 'right' }}>
                                            <p style={{ margin: 0 }}><strong>QU Date:</strong>  {formatDateTime(singleQuotationBilling.quotation_and_billing_master_date)}</p>
                                        </div>
                                    </div>
                                </header>
                                {/* Billing & Shipping */}
                                <section style={{
                                    display: 'flex',

                                    marginBottom: 20,
                                    minHeight: 130
                                }}>

                                    <div style={{
                                        width: '50%',
                                        padding: 10,
                                        fontSize: '10pt',
                                        lineHeight: '1.5',
                                        borderRight: '1px solid #000'
                                    }}>
                                        <strong style={{ textDecoration: 'underline' }}>Bill To:</strong>

                                        <p style={{ margin: 0 }}><strong>{BusinessData?.user_name || "N/A"}</strong></p>

                                        <p style={{ margin: 0 }}>
                                            {BusinessData?.user_address_block ? BusinessData.user_address_block + ', ' : ''}
                                            {BusinessData?.user_address_district ? BusinessData.user_address_district + ', ' : ''}
                                            {BusinessData?.user_address_city ? BusinessData.user_address_city + ', ' : ''}
                                            {BusinessData?.user_address_state || ''}
                                        </p>

                                        <p style={{ margin: 0 }}>Pincode: {BusinessData?.user_address_pincode || "N/A"}</p>
                                        <p style={{ margin: 0 }}>Email: {BusinessData?.user_email || "N/A"}</p>
                                        <p style={{ margin: 0 }}>Contact No: {BusinessData?.user_phone_number || "N/A"}</p>
                                    </div>

                                    <div style={{
                                        width: '50%',
                                        padding: 10,
                                        fontSize: '10pt',
                                        lineHeight: '1.5'
                                    }}>
                                        <strong style={{ textDecoration: 'underline' }}>Ship To:</strong>

                                        <p style={{ margin: 0 }}><strong>{RepairData?.customer_name || "N/A"}</strong></p>

                                        <p style={{ margin: 0 }}>
                                            {RepairData?.customer_address_block ? RepairData?.customer_address_block + ', ' : ''}
                                            {RepairData?.customer_address_district ? RepairData?.customer_address_district + ', ' : ''}
                                            {RepairData?.customer_address_city ? RepairData?.customer_address_city + ', ' : ''}
                                            {RepairData?.customer_address_state || ''}
                                        </p>

                                        <p style={{ margin: 0 }}>Pincode: {RepairData?.customer_address_pincode || "N/A"}</p>
                                        <p style={{ margin: 0 }}>Email: {RepairData?.customer_email || "N/A"}</p>
                                        <p style={{ margin: 0 }}>Contact No: {RepairData?.customer_phone_number || "N/A"}</p>
                                    </div>

                                </section>

                                {/* Item Details Table */}
                                <section style={{ marginBottom: 20 }}>
                                    <p style={{ fontSize: '11pt', marginBottom: 5 }}><strong>Item Details</strong></p>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', borderBottom: '1px solid black' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                                {['Sr. No.', 'Item Description', 'Qty', 'MRP', 'Sale Price', 'GST %', 'Taxable Value', 'Total'].map((h, i) => (
                                                    <th key={i} style={{ border: '1px solid black', padding: 5 }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {singleQuotationBilling?.items?.map((item, index) => (
                                                <tr key={index}>
                                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: 5 }}>{index + 1}</td>
                                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: 5 }}>{item.quotation_and_billing_item_name}</td>
                                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: 5 }}>{item.quotation_and_billing_qty}</td>
                                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: 5 }}>{item.quotation_and_billing_product_mrp}</td>
                                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: 5 }}>{item.quotation_and_billing_product_sale_price}</td>
                                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: 5 }}>{item.quotation_and_billing_tax_percentage}</td>
                                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: 5 }}>{item.quotation_and_billing_tax_value}</td>
                                                    <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: 5 }}>{item.quotation_and_billing_child_total}</td>
                                                </tr>
                                            ))}
                                        </tbody>


                                    </table>


                                </section>
                                {/* Tax Summary */}
                                <section
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center', // <-- vertical center for QR & totals

                                        fontSize: '10pt'
                                    }}
                                >
                                    {/* QR Code Section */}
                                    {type !== "Quotation" ? <div style={{
                                        marginLeft: "200px",
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',  // horizontal center
                                        justifyContent: 'center' // vertical center inside div
                                    }}>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '9pt' }}>Scan To Pay (UPI)</p>

                                        <QRCode
                                            size={120}
                                            value={upiLink} // upiLink = `upi://pay?pa=xxx@upi&pn=Name&am=Amount&cu=INR`
                                        />

                                        <p style={{ margin: '5px 0 0 0', fontSize: '9pt' }}>
                                            UPI ID: {BusinessData?.user_upi_id || "N/A"}
                                        </p>
                                    </div> : <div></div>}

                                    {/* Totals Section */}
                                    <div style={{ width: '25%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                            <p style={{ margin: 0 }}>Total Amount</p>
                                            <p style={{ margin: 0 }}>{singleQuotationBilling?.quotation_and_billing_master_total || 0}</p>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                            <p style={{ margin: 0 }}>Total Tax Amount : GST</p>
                                            <p style={{ margin: 0 }}>{singleQuotationBilling?.quotation_and_billing_master_gst_amount || 0}</p>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid black', paddingTop: 5 }}>
                                            <p style={{ margin: 0, fontSize: '12pt', fontWeight: 'bold' }}>Grand Total</p>
                                            <p style={{ margin: 0, fontSize: '12pt', fontWeight: 'bold' }}>
                                                {singleQuotationBilling?.quotation_and_billing_master_grand_total || 0}
                                            </p>
                                        </div>
                                    </div>
                                </section>


                                {/* Terms & Conditions */}
                                <section style={{ marginTop: 25, fontSize: '10pt', lineHeight: '1.5' }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '12pt', textDecoration: 'underline' }}>Terms &amp; Conditions</h3>
                                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                                        <li>Quotation valid for <strong>7 days</strong> from the date of issue.</li>
                                        <li>Prices are subject to change without prior notice.</li>
                                        <li>Delivery period will be confirmed at the time of order placement.</li>
                                        <li>GST applicable as per Government norms.</li>
                                        <li>Payment terms: <strong>50% advance</strong>, balance before delivery.</li>
                                        <li>No return or exchange once the order is confirmed.</li>
                                        <li>Any dispute will be subject to <strong>Ahmednagar jurisdiction</strong>.</li>
                                    </ul>
                                </section>
                                {/* Footer */}
                                <footer style={{ marginTop: 30, textAlign: 'center', paddingTop: 10, borderTop: '1px solid #ccc' }}>
                                    <p style={{ margin: 0, fontSize: '10pt' }}>Thank you for giving us the opportunity to serve you!</p>
                                    <p style={{ margin: 0, fontSize: '10pt', fontWeight: 'bold' }}>{BusinessData?.user_name || "N/A"} </p>
                                </footer>
                            </div>
                        </div>
                    </ModalBody>

                    <ModalFooter>
                        <Button color="success" onClick={handlePrint}>
                            Print / Download PDF
                        </Button>

                        <Button color="primary" type="submit">
                            Save
                        </Button>

                        <Button color="danger" onClick={toggle}>
                            Close
                        </Button>
                    </ModalFooter>
                </Form>
            </Modal>

        </>
    )
}

export default QuotationAndBillingPerviwe