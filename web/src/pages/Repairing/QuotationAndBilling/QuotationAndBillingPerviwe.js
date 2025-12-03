import AuthUser from "../../../helpers/AuthType/AuthUser";

const QuotationAndBillingPerviwe = () => {
    const printRef = useRef(null);
    const { BusinessData } = AuthUser();

    const handlePrint = () => {
        window.print();
    };
    return (
        <>
            <Modal isOpen={isOpen} centered>
                <Form>
                    <ModalBody  >


                        <div className="quotation-container" style={{ width: '210mm', margin: '20px auto', backgroundColor: 'white', padding: 30, boxShadow: '0 0 10px rgba(0,0,0,0.1)', border: '1px solid #ccc' }}>
                            {/* Header */}
                            <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 10, marginBottom: 20 }}>
                                <div style={{ width: '50%', display: 'flex', alignItems: 'center' }}>
                                    <img src="sai_logo.png" alt="SAI SUPPLIERS Logo" style={{ width: 80, verticalAlign: 'middle' }} />
                                    <p style={{ fontSize: '12pt', margin: 0, paddingLeft: 10 }}>SAI SUPPLIERS</p>
                                </div>
                                <div style={{ width: '45%', textAlign: 'right', fontSize: '10pt', lineHeight: '1.4' }}>
                                    <p style={{ margin: 0 }}><strong>{BusinessData?.user_name || "N/A"} </strong></p>
                                    <p style={{ margin: 0 }}>GST No: {BusinessData?.user_gst_number || "N/A"} </p>
                                    <p style={{ margin: 0 }}>Phone: {BusinessData?.user_phone_number || "N/A"} </p>
                                    <p style={{ margin: 0 }}>Email: {BusinessData?.user_email || "N/A"} </p>
                                </div>
                                <div style={{ width: '100%', textAlign: 'center', margin: '15px 0', padding: 8, border: '1px solid black', backgroundColor: '#f0f0f0' }}>
                                    <h2 style={{ margin: 0, fontSize: '14pt' }}>QUOTATION</h2>
                                </div>
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '10pt', borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '10px 0' }}>
                                    <div style={{ width: '48%' }}>
                                        <p style={{ margin: 0 }}><strong>QU No:</strong> QU-185</p>
                                    </div>
                                    <div style={{ width: '48%', textAlign: 'right' }}>
                                        <p style={{ margin: 0 }}><strong>QU Date:</strong> 28/11/2025</p>
                                    </div>
                                </div>
                            </header>
                            {/* Billing & Shipping */}
                            <section style={{ display: 'flex', border: '1px solid #000', marginBottom: 20 }}>
                                <div style={{
                                    width: '50%',
                                    padding: 10,
                                    fontSize: '10pt',
                                    lineHeight: '1.5',
                                    borderRight: '1px solid #000'
                                }}>
                                    <p style={{ margin: '0 0 5px 0', textDecoration: 'underline' }}>
                                        <strong>Bill To:</strong>
                                    </p>

                                    <p style={{ margin: 0 }}>
                                        <strong>{BusinessData?.user_name || "N/A"}</strong>
                                    </p>

                                    <p style={{ margin: 0 }}>
                                        {BusinessData?.user_address_block ? BusinessData.user_address_block + ', ' : ''}
                                        {BusinessData?.user_address_district ? BusinessData.user_address_district + ', ' : ''}
                                        {BusinessData?.user_address_city ? BusinessData.user_address_city + ', ' : ''}
                                        {BusinessData?.user_address_state || ''}
                                    </p>

                                    <p style={{ margin: 0 }}>
                                        Pincode: {BusinessData?.user_address_pincode || "N/A"}
                                    </p>

                                    <p style={{ margin: 0 }}>
                                        Email: {BusinessData?.user_email || "N/A"}
                                    </p>

                                    <p style={{ margin: 0 }}>
                                        Contact No: {BusinessData?.user_phone_number || "N/A"}
                                    </p>
                                </div>

                                <div style={{ width: '50%', padding: 10, fontSize: '10pt', lineHeight: '1.5' }}>
                                    <p style={{ margin: '0 0 5px 0', textDecoration: 'underline' }}><strong>Ship To:</strong></p>
                                    <p style={{ margin: 0 }}>Address: 9, Indiranagar, Sangamner,</p>
                                    <p style={{ margin: 0 }}>Maharashtra, Ahmed Nagar, Sangamner,</p>
                                    <p style={{ margin: 0 }}>Maharashtra</p>
                                    <p style={{ margin: 0 }}>Pincode: 422605</p>
                                </div>
                            </section>
                            {/* Item Details Table */}
                            <section style={{ marginBottom: 20 }}>
                                <p style={{ fontSize: '11pt', marginBottom: 5 }}><strong>Item Details</strong></p>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                                            <th style={{ border: '1px solid black', padding: 5 }}>Sr. No.</th>
                                            <th style={{ border: '1px solid black', padding: 5 }}>Item Description</th>
                                            <th style={{ border: '1px solid black', padding: 5 }}>Qty</th>
                                            <th style={{ border: '1px solid black', padding: 5 }}>Rate</th>
                                            <th style={{ border: '1px solid black', padding: 5 }}>Taxable Value</th>
                                            <th style={{ border: '1px solid black', padding: 5 }}>GST %</th>
                                            <th style={{ border: '1px solid black', padding: 5 }}>GST Value</th>
                                            <th style={{ border: '1px solid black', padding: 5 }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ border: '1px solid black', padding: 5, textAlign: 'center' }}>1</td>
                                            <td style={{ border: '1px solid black', padding: 5, textAlign: 'left' }}>ALL PURPOSE WHITE PATCH (5 X 7) (ONE AUDIT)</td>

                                            <td style={{ border: '1px solid black', padding: 5, textAlign: 'center' }}>5000</td>
                                            <td style={{ border: '1px solid black', padding: 5, textAlign: 'center' }}>3.26</td>
                                            <td style={{ border: '1px solid black', padding: 5, textAlign: 'center' }}>16299.99</td>
                                            <td style={{ border: '1px solid black', padding: 5, textAlign: 'center' }}>18</td>
                                            <td style={{ border: '1px solid black', padding: 5, textAlign: 'center' }}>2934.00</td>
                                            <td style={{ border: '1px solid black', padding: 5, textAlign: 'center' }}>19234.00</td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ backgroundColor: '#f9f9f9' }}>
                                            <td colSpan={4} style={{ border: '1px solid black', padding: 5, textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                                            <td style={{ border: '1px solid black', padding: 5, textAlign: 'center' }}>16300.00</td>
                                            <td style={{ border: '1px solid black', padding: 5, textAlign: 'center' }}>-</td>
                                            <td style={{ border: '1px solid black', padding: 5, textAlign: 'center' }}>2934.00</td>
                                            <td style={{ border: '1px solid black', padding: 5, textAlign: 'center' }}>19234.00</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </section>
                            {/* Tax Summary */}
                            <section style={{ display: 'flex', justifyContent: 'end', fontSize: '10pt' }}>

                                <div style={{ width: '25%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                        <p style={{ margin: 0 }}>Total Amount</p>
                                        <p style={{ margin: 0 }}>16300</p>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                        <p style={{ margin: 0 }}>Total Tax Amount : GST</p>
                                        <p style={{ margin: 0 }}>2934.00</p>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                        <p style={{ margin: 0 }}>Other Charges</p>
                                        <p style={{ margin: 0 }}>0</p>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid black', paddingTop: 5 }}>
                                        <p style={{ margin: 0, fontSize: '12pt', fontWeight: 'bold' }}>Total Amount After Tax</p>
                                        <p style={{ margin: 0, fontSize: '12pt', fontWeight: 'bold' }}>19234</p>
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

            <ToastContainer />
        </>
    )
}

export default QuotationAndBillingPerviwe