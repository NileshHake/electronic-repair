import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Button, Modal, ModalBody, ModalFooter, Form, Input, Card, ModalHeader } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { getCategoriesList } from "../../../store/category";
import { getBrandsList } from "../../../store/Brand";
import { filterProductforRepair } from "../../../store/product";
import { getSingleQuotationBilling, updateQuotationBilling } from "../../../store/QuotationAndBilling";

const QuotationAndBillingUpdate = ({ isOpen, toggle, quotationData }) => {
    const dispatch = useDispatch();
    const { categories } = useSelector((state) => state.CategoryReducer);
    const brands = useSelector((state) => state.BrandReducer?.brands);
    const filterProducts = useSelector((state) => state.ProductReducer.filterProductsforRepair);
    const { singleQuotationBilling } = useSelector((state) => state.QuotationBillingReducer);

    const [filterData, setFilterData] = useState({ category_id: "", brand_id: "" });
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [invoiceItems, setInvoiceItems] = useState([]);
    const [invoiceData, setInvoiceData] = useState({
        quotation_and_billing_master_customer_id: quotationData?.customer_id || null,
        quotation_and_billing_master_repair_id: quotationData?.repair_id || null,
        quotation_and_billing_master_total: 0,
        quotation_and_billing_master_gst_amount: 0,
        quotation_and_billing_master_grand_total: 0,
        quotation_or_billing: quotationData?.quotation_or_billing || "Quotation",
    });

    // Fetch categories, brands, and single quotation details
    useEffect(() => {
        dispatch(getCategoriesList());
        dispatch(getBrandsList());

        if (quotationData?.quotation_and_billing_master_id) {
            dispatch(getSingleQuotationBilling(quotationData.quotation_and_billing_master_id));
        }
    }, [dispatch, quotationData]);

    // Populate items when singleQuotationBilling is fetched
    useEffect(() => {
        if (singleQuotationBilling?.items) {
            const formatted = singleQuotationBilling.items.map((item) => {
                const isService = item.quotation_and_billing_service_or_product === "Service";

                return {
                    product_id: item.product_id || null,
                    quotation_and_billing_product_name: item.quotation_and_billing_item_name,
                    quotation_and_billing_child_product_id: item.quotation_and_billing_child_product_id,
                    quotation_and_billing_qty: isService ? "-" : Number(item.quotation_and_billing_qty),
                    quotation_and_billing_product_mrp: Number(item.quotation_and_billing_product_mrp),
                    quotation_and_billing_product_sale_price: Number(item.quotation_and_billing_product_sale_price),
                    quotation_and_billing_tax_percentage: Number(item.quotation_and_billing_tax_percentage),
                    quotation_and_billing_tax_value: Number(item.quotation_and_billing_tax_value),
                    quotation_and_billing_child_total: Number(item.quotation_and_billing_child_total),
                    quotation_and_billing_service_or_product: item.quotation_and_billing_service_or_product,
                    isService: isService,
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                    raw: item,
                };
            });

            setInvoiceItems(formatted);

            setInvoiceData((prev) => ({
                ...prev,
                quotation_and_billing_master_total: singleQuotationBilling.quotation_and_billing_master_total,
                quotation_and_billing_master_gst_amount: singleQuotationBilling.quotation_and_billing_master_gst_amount,
                quotation_and_billing_master_grand_total: singleQuotationBilling.quotation_and_billing_master_grand_total,
            }));
        }
    }, [singleQuotationBilling]);

    // Fetch filtered products
    useEffect(() => {
        dispatch(filterProductforRepair(filterData));
    }, [filterData, dispatch]);

    // Recalculate totals whenever invoiceItems change
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

    // Add product to invoice with qty update if already exists
 const handleProductAdd = (product) => {
    setInvoiceItems((prev) => {
        const now = new Date().toISOString();
        const taxPercent = Number(product.tax_percentage || 0);
        const salePrice = Number(product.product_sale_price || 0);

        // Check if product already exists
        const index = prev.findIndex(
            (item) => !item.isService && item.quotation_and_billing_child_product_id === product.product_id
        );

        if (index !== -1) {
            // Increment quantity for existing product
            const updated = [...prev];
            const newQty = Number(updated[index].quotation_and_billing_qty) + 1;

            const base = newQty * salePrice;
            const taxValue = (base * taxPercent) / 100;

            updated[index] = {
                ...updated[index],
                quotation_and_billing_qty: newQty,
                quotation_and_billing_tax_value: taxValue,
                quotation_and_billing_child_total: base + taxValue,
                updated_at: now,
            };

            return updated;
        }

        // Add new product row
        const newItem = {
            product_id: product.product_id,
            quotation_and_billing_child_product_id: product.product_id, 
            quotation_and_billing_product_name: product.product_name,
            quotation_and_billing_qty: 1,
            quotation_and_billing_product_mrp: product.product_mrp,
            quotation_and_billing_product_sale_price: salePrice,
            quotation_and_billing_tax_percentage: taxPercent,
            quotation_and_billing_tax_value: (salePrice * taxPercent) / 100,
            quotation_and_billing_child_total: salePrice + (salePrice * taxPercent) / 100,
            quotation_and_billing_service_or_product: "Product",
            raw: product,
            isService: false,
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
                quotation_and_billing_service_or_product: "Service",
                isService: true,
                created_at: now,
                updated_at: now,
            },
        ]);
    };

    // Update row and auto-remove if qty <= 0
    const updateRow = (index, field, value) => {
        let updated = [...invoiceItems];

        updated[index][field] = value;

        if (field === "quotation_and_billing_qty") {
            if (Number(value) <= 0 && !updated[index].isService) {
                updated.splice(index, 1);
                setInvoiceItems(updated);
                return;
            }
        }

        const qty = updated[index].quotation_and_billing_qty === "-" ? 1 : Number(updated[index].quotation_and_billing_qty);
        const price = Number(updated[index].quotation_and_billing_product_sale_price);
        const gst = Number(updated[index].quotation_and_billing_tax_percentage);

        const base = qty * price;
        const taxValue = (base * gst) / 100;

        updated[index].quotation_and_billing_tax_value = taxValue;
        updated[index].quotation_and_billing_child_total = base + taxValue;

        setInvoiceItems(updated);
    };

    const removeRow = (index) => {
        const updated = [...invoiceItems];
        updated.splice(index, 1);
        setInvoiceItems(updated);
    };

    const handleUpdate = () => {
        const body = {
            ...invoiceData,
            quotation_and_billing_master_id: quotationData.quotation_and_billing_master_id,
            items: invoiceItems,
        };
        
        
        dispatch(updateQuotationBilling(body));
         
    };  

    return (
        <Modal isOpen={isOpen} centered size="xl">
            <ModalHeader toggle={toggle} className="bg-light">
                <h4>Update {invoiceData.quotation_or_billing}</h4>
            </ModalHeader>

            <Form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                <ModalBody>
                    <Card className="border card-border-success p-3 shadow-lg">
                        {/* Filters */}
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
                                    options={filterProducts?.map((p) => ({
                                        label: `${p.product_name} (MRP: ₹${p.product_mrp}, Sale: ₹${p.product_sale_price})`,
                                        value: p.product_id,
                                        data: p,
                                    }))}
                                    value={selectedProduct}
                                    onChange={(e) => { setSelectedProduct(e); handleProductAdd(e.data); }}
                                    placeholder="Select Product"
                                />
                            </div>

                            <div className="col-md-2 d-flex justify-content-start">
                                <Button color="info" className="w-100" onClick={addManualService}>+ Add Service</Button>
                            </div>
                        </div>

                        {/* TABLE */}
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
                                    {invoiceItems.length ? invoiceItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            {item.isService ? (
                                                <>
                                                    <td><Input value={item.quotation_and_billing_product_name}
                                                        onChange={(e) => updateRow(index, "quotation_and_billing_product_name", e.target.value)}
                                                        placeholder="Service Name" /></td>
                                                    <td>-</td>
                                                    <td>0</td>
                                                    <td><Input type="number" value={item.quotation_and_billing_product_sale_price}
                                                        onChange={(e) => updateRow(index, "quotation_and_billing_product_sale_price", Number(e.target.value))} /></td>
                                                    <td>0</td>
                                                    <td>0</td>
                                                    <td>{item.quotation_and_billing_product_sale_price}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{item.quotation_and_billing_product_name}</td>
                                                    <td>
                                                        <div className="input-group" style={{ width: "120px" }}>
                                                            <button className="btn btn-outline-secondary" type="button"
                                                                onClick={() => updateRow(index, "quotation_and_billing_qty", Number(item.quotation_and_billing_qty) - 1)}>–</button>
                                                            <input type="number" className="form-control text-center border-secondary"
                                                                value={item.quotation_and_billing_qty} readOnly />
                                                            <button className="btn btn-outline-secondary" type="button"
                                                                onClick={() => updateRow(index, "quotation_and_billing_qty", Number(item.quotation_and_billing_qty) + 1)}>+</button>
                                                        </div>
                                                    </td>
                                                    <td><Input readOnly value={item.quotation_and_billing_product_mrp} /></td>
                                                    <td><Input type="number" value={item.quotation_and_billing_product_sale_price}
                                                        onChange={(e) => updateRow(index, "quotation_and_billing_product_sale_price", Number(e.target.value))} /></td>
                                                    <td><Input type="number" value={item.quotation_and_billing_tax_percentage}
                                                        onChange={(e) => updateRow(index, "quotation_and_billing_tax_percentage", Number(e.target.value))} /></td>
                                                    <td>{item.quotation_and_billing_tax_value}</td>
                                                    <td>{item.quotation_and_billing_child_total}</td>
                                                </>
                                            )}
                                            <td><Button color="danger" size="sm" onClick={() => removeRow(index)}>Delete</Button></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="9" className="text-center py-3">No Items Added</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* TOTALS */}
                        <div className="d-flex justify-content-end mt-3 gap-4">
                            <div><strong>Total:</strong> ₹{invoiceData.quotation_and_billing_master_total}</div>
                            <div><strong>GST Amount:</strong> ₹{invoiceData.quotation_and_billing_master_gst_amount}</div>
                            <div><strong>Grand Total:</strong> ₹{invoiceData.quotation_and_billing_master_grand_total}</div>
                        </div>
                    </Card>
                </ModalBody>

                <ModalFooter>
                    <Button color="success" type="submit">Update</Button>
                    <Button color="danger" onClick={toggle}>Close</Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};

export default QuotationAndBillingUpdate;
