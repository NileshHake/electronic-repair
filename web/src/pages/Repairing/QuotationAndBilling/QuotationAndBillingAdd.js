import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Button, Modal, ModalBody, ModalFooter, Form, Input, Card, ModalHeader } from "reactstrap";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { getCategoriesList } from "../../../store/category";
import { getBrandsList } from "../../../store/Brand";
import { filterProductforRepair } from "../../../store/product";
import { addQuotationBilling } from "../../../store/QuotationAndBilling";

const QuotationAndBillingAdd = ({ isOpen, toggle, RepairData }) => {
    const dispatch = useDispatch();

    const { categories } = useSelector((state) => state.CategoryReducer);
    const brands = useSelector((state) => state.BrandReducer?.brands);
    const filterProducts = useSelector(
        (state) => state.ProductReducer.filterProductsforRepair
    );

    const [filterData, setFilterData] = useState({ category_id: "", brand_id: "" });
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [invoiceItems, setInvoiceItems] = useState([]);
    const [invoiceData, setInvoiceData] = useState({
        quotation_and_billing_master_customer_id: RepairData?.repair_customer_id || null,
        quotation_and_billing_master_repair_id: RepairData?.repair_id || null,
        quotation_and_billing_master_total: 0,
        quotation_and_billing_master_gst_amount: 0,
        quotation_and_billing_master_grand_total: 0,
    });

    // Load categories, brands, and prefill service items
    useEffect(() => {
        dispatch(getCategoriesList());
        dispatch(getBrandsList());

        if (RepairData) {
            try {
                const servicesArray = JSON.parse(RepairData.repair_device_services_id || "[]");
                if (Array.isArray(servicesArray)) {
                    const formattedServices = servicesArray.map((srv) => {
                        const price = Number(srv.cost || 0);
                        const now = new Date().toISOString();
                        return {
                            quotation_and_billing_product_name: srv.service || "",
                            quotation_and_billing_qty: "-",
                            quotation_and_billing_product_mrp: 0,
                            quotation_and_billing_product_sale_price: price,
                            quotation_and_billing_tax_percentage: 0,
                            quotation_and_billing_tax_value: 0,
                            quotation_and_billing_child_total: price,
                            isService: true,
                            created_at: now,
                            updated_at: now,
                        };
                    });
                    setInvoiceItems((prev) => [...prev, ...formattedServices]);
                }
            } catch (err) {
                console.error("Invalid Service JSON:", err);
            }
        }
    }, [dispatch, RepairData]);

    // Fetch filtered products
    useEffect(() => {
        dispatch(filterProductforRepair(filterData));
    }, [filterData]);

    // Update master totals whenever invoiceItems change
    useEffect(() => {
        let total = 0;
        let gstAmount = 0;
        invoiceItems.forEach((item) => {
            const qty = item.quotation_and_billing_qty === "-" ? 1 : Number(item.quotation_and_billing_qty);
            const price = Number(item.quotation_and_billing_product_sale_price);
            const gst = Number(item.quotation_and_billing_tax_percentage);
            const base = qty * price;
            const gstValue = (base * gst) / 100;

            total += base;
            gstAmount += gstValue;
        });

        setInvoiceData((prev) => ({
            ...prev,
            quotation_and_billing_master_total: total.toFixed(2),
            quotation_and_billing_master_gst_amount: gstAmount.toFixed(2),
            quotation_and_billing_master_grand_total: (total + gstAmount).toFixed(2),
        }));
    }, [invoiceItems]);

    // Add product
    const handleProductAdd = (product) => {
        setInvoiceItems((prev) => {
            const updated = [...prev];
            const index = updated.findIndex(
                (item) => item.raw?.product_id === product.product_id
            );
            const taxPercent = Number(product.tax_percentage || 0);
            const salePrice = Number(product.product_sale_price || 0);
            const now = new Date().toISOString();

            if (index !== -1) {
                const item = updated[index];
                const newQty = Number(item.quotation_and_billing_qty) + 1;
                const productTotal = salePrice * newQty;
                const taxValue = (productTotal * taxPercent) / 100;
                const finalTotal = productTotal + taxValue;

                updated[index] = {
                    ...item,
                    quotation_and_billing_qty: newQty,
                    quotation_and_billing_product_mrp: product.product_mrp || 0,
                    quotation_and_billing_product_sale_price: salePrice,
                    quotation_and_billing_tax_percentage: taxPercent,
                    quotation_and_billing_tax_value: taxValue,
                    quotation_and_billing_child_total: finalTotal,
                    updated_at: now,
                };
                return updated;
            }

            const qty = 1;
            const productTotal = salePrice * qty;
            const taxValue = (productTotal * taxPercent) / 100;
            const finalTotal = productTotal + taxValue;

            const newItem = {
                quotation_and_billing_product_name: product.product_name,
                quotation_and_billing_qty: qty,
                quotation_and_billing_product_mrp: product.product_mrp || 0,
                quotation_and_billing_product_sale_price: salePrice,
                quotation_and_billing_tax_percentage: taxPercent,
                quotation_and_billing_tax_value: taxValue,
                quotation_and_billing_child_total: finalTotal,
                isService: false,
                raw: product,
                created_at: now,
                updated_at: now,
            };
            return [...prev, newItem];
        });
    };

    // Add manual service
    const addManualService = () => {
        const now = new Date().toISOString();
        setInvoiceItems((prev) => [
            ...prev,
            {
                quotation_and_billing_product_name: "",
                quotation_and_billing_qty: "-",
                quotation_and_billing_product_mrp: 0,
                quotation_and_billing_product_sale_price: 0,
                quotation_and_billing_tax_percentage: 0,
                quotation_and_billing_tax_value: 0,
                quotation_and_billing_child_total: 0,
                isService: true,
                created_at: now,
                updated_at: now,
            },
        ]);
    };

    const updateRow = (index, field, value) => {
        const updated = [...invoiceItems];
        const now = new Date().toISOString();

        updated[index][field] = value;

        const qty = updated[index].quotation_and_billing_qty === "-" ? 1 : Number(updated[index].quotation_and_billing_qty);
        const rate = Number(updated[index].quotation_and_billing_product_sale_price);
        const gst = Number(updated[index].quotation_and_billing_tax_percentage);

        const base = qty * rate;
        const gstAmount = (base * gst) / 100;

        updated[index].quotation_and_billing_tax_value = gstAmount.toFixed(2);
        updated[index].quotation_and_billing_child_total = (base + gstAmount).toFixed(2);
        updated[index].updated_at = now;

        setInvoiceItems(updated);
    };

    // Remove row
    const removeRow = (index) => {
        const updated = [...invoiceItems];
        updated.splice(index, 1);
        setInvoiceItems(updated);
    };

 const handleGenerate = () => {
   
   dispatch(addQuotationBilling({ invoiceData, invoiceItems }));

};


    return (
        <>
            <Modal isOpen={isOpen} centered size="xl">
                <ModalHeader toggle={toggle} className="bg-light">
                    <h4>Create Quotation & Billing</h4>
                </ModalHeader>
                <Form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}>
                    <ModalBody>
                        <Card className="border card-border-success p-3 shadow-lg">
                            <div className="row mb-4 d-flex align-items-end">
                                <div className="col-md-3">
                                    <label>Category</label>
                                    <Select
                                        options={categories?.map((c) => ({ label: c.category_name, value: c.category_id }))}
                                        value={selectedCategory}
                                        onChange={(e) => { setSelectedCategory(e); setFilterData({ ...filterData, category_id: e.value }); }}
                                        placeholder="Select Category"
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label>Brand</label>
                                    <Select
                                        options={brands?.map((b) => ({ label: b.brand_name, value: b.brand_id }))}
                                        value={selectedBrand}
                                        onChange={(e) => { setSelectedBrand(e); setFilterData({ ...filterData, brand_id: e.value }); }}
                                        placeholder="Select Brand"
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label>Product</label>
                                    <Select
                                        options={filterProducts?.map((p) => ({ label: `${p.product_name} (MRP: ₹${p.product_mrp}, Sale: ₹${p.product_sale_price})`, value: p.product_id, data: p }))}
                                        value={selectedProduct}
                                        onChange={(e) => { setSelectedProduct(e); handleProductAdd(e.data); }}
                                        placeholder="Select Product"
                                    />
                                </div>
                                <div className="col-md-2 d-flex justify-content-start">
                                    <Button color="info" className="w-100" onClick={addManualService}>+ Add Service</Button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="table-responsive">
                                <table className="table align-middle">
                                    <thead className="table-light text-uppercase text-muted">
                                        <tr>
                                            <th>Sr.</th>
                                            <th>Item / Service</th>
                                            <th>Qty</th>
                                            <th>MRP</th>
                                            <th>Sale Price</th>
                                            <th>GST %</th>
                                            <th>GST Value</th>
                                            <th>Total</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceItems.length > 0 ? invoiceItems.map((item, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                {item.isService ? (
                                                    <>
                                                        <td><Input value={item.quotation_and_billing_product_name} placeholder="Service Name" onChange={(e) => updateRow(index, "quotation_and_billing_product_name", e.target.value)} /></td>
                                                        <td>-</td>
                                                        <td>0</td>
                                                        <td><Input type="number" value={item.quotation_and_billing_product_sale_price} onChange={(e) => updateRow(index, "quotation_and_billing_product_sale_price", Number(e.target.value))} /></td>
                                                        <td>0</td>
                                                        <td>0</td>
                                                        <td>{item.quotation_and_billing_product_sale_price}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td>{item.quotation_and_billing_product_name}</td>
                                                        <td style={{ width: "15%" }}>
                                                            <div className="input-group" style={{ width: "120px" }}>
                                                                <button className="btn btn-outline-secondary" type="button" onClick={() => updateRow(index, "quotation_and_billing_qty", Number(item.quotation_and_billing_qty) - 1)}>–</button>
                                                                <input type="number" className="form-control text-center border-secondary" value={item.quotation_and_billing_qty} readOnly />
                                                                <button className="btn btn-outline-secondary" type="button" onClick={() => updateRow(index, "quotation_and_billing_qty", Number(item.quotation_and_billing_qty) + 1)}>+</button>
                                                            </div>
                                                        </td>
                                                        <td><Input readOnly value={item.quotation_and_billing_product_mrp} /></td>
                                                        <td><Input type="number" value={item.quotation_and_billing_product_sale_price} onChange={(e) => updateRow(index, "quotation_and_billing_product_sale_price", Number(e.target.value))} /></td>
                                                        <td><Input type="number" value={item.quotation_and_billing_tax_percentage} onChange={(e) => updateRow(index, "quotation_and_billing_tax_percentage", Number(e.target.value))} /></td>
                                                        <td>{item.quotation_and_billing_tax_value}</td>
                                                        <td>{item.quotation_and_billing_child_total}</td>
                                                    </>
                                                )}
                                                <td>
                                                    <Button color="danger" size="sm" onClick={() => removeRow(index)}>Delete</Button>
                                                </td>
                                            </tr>
                                        )) : <tr><td colSpan="9" className="text-center py-3">No Items Added</td></tr>}
                                    </tbody>
                                </table>
                            </div>

                            {/* Master Totals */}
                            <div className="d-flex justify-content-end mt-3 gap-4">
                                <div><strong>Total:</strong> ₹{invoiceData.quotation_and_billing_master_total}</div>
                                <div><strong>GST Amount:</strong> ₹{invoiceData.quotation_and_billing_master_gst_amount}</div>
                                <div><strong>Grand Total:</strong> ₹{invoiceData.quotation_and_billing_master_grand_total}</div>
                            </div>

                        </Card>
                    </ModalBody>

                    <ModalFooter>
                        <Button color="success" type="submit">Save</Button>
                        <Button color="danger" onClick={toggle}>Close</Button>
                    </ModalFooter>
                </Form>
            </Modal>

            <ToastContainer />
        </>
    );
};

export default QuotationAndBillingAdd;
