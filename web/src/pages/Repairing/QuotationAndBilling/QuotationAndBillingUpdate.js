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
        quotation_and_billing_master_total: 0, // ✅ taxable/base
        quotation_and_billing_master_gst_amount: 0,
        quotation_and_billing_master_grand_total: 0,
        quotation_or_billing: quotationData?.quotation_or_billing || "Quotation",
    });

    // ✅ Product GST inclusive fixed 18%
    const PRODUCT_GST_PERCENT = 18;
    const PRODUCT_GST_FACTOR = 1 + PRODUCT_GST_PERCENT / 100; // 1.18

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

                    // ✅ for product use fixed 18; for service use stored %
                    quotation_and_billing_tax_percentage: isService
                        ? Number(item.quotation_and_billing_tax_percentage)
                        : PRODUCT_GST_PERCENT,

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
        if (!isOpen) return;
        dispatch(filterProductforRepair(filterData));
    }, [filterData, dispatch, isOpen]);

    // Recalculate totals whenever invoiceItems change
    // ✅ Product: sale price includes 18% GST -> split base + gst
    // ✅ Service: base + gst added on top
    useEffect(() => {
        let taxableTotal = 0;
        let gstAmount = 0;
        let grandTotal = 0;

        const recalculated = invoiceItems.map((item) => {
            const isServiceRow = item.quotation_and_billing_service_or_product === "Service";

            const qty = item.quotation_and_billing_qty === "-" ? 1 : Number(item.quotation_and_billing_qty);
            const price = Number(item.quotation_and_billing_product_sale_price || 0);
            const gross = qty * price;

            if (!isServiceRow) {
                const base = gross / PRODUCT_GST_FACTOR;
                const gstValue = gross - base;

                taxableTotal += base;
                gstAmount += gstValue;
                grandTotal += gross;

                return {
                    ...item,
                    quotation_and_billing_tax_percentage: PRODUCT_GST_PERCENT,
                    quotation_and_billing_tax_value: gstValue,
                    quotation_and_billing_child_total: gross,
                };
            }

            const gst = Number(item.quotation_and_billing_tax_percentage || 0);
            const gstValue = (gross * gst) / 100;
            const total = gross + gstValue;

            taxableTotal += gross;
            gstAmount += gstValue;
            grandTotal += total;

            return {
                ...item,
                quotation_and_billing_tax_value: gstValue,
                quotation_and_billing_child_total: total,
            };
        });

        const changed =
            recalculated.length !== invoiceItems.length ||
            recalculated.some((it, i) => {
                const old = invoiceItems[i];
                if (!old) return true;
                return (
                    Number(old.quotation_and_billing_tax_value || 0) !== Number(it.quotation_and_billing_tax_value || 0) ||
                    Number(old.quotation_and_billing_child_total || 0) !== Number(it.quotation_and_billing_child_total || 0) ||
                    Number(old.quotation_and_billing_tax_percentage || 0) !== Number(it.quotation_and_billing_tax_percentage || 0)
                );
            });

        if (changed) setInvoiceItems(recalculated);

        setInvoiceData((prev) => ({
            ...prev,
            quotation_and_billing_master_total: taxableTotal.toFixed(2),
            quotation_and_billing_master_gst_amount: gstAmount.toFixed(2),
            quotation_and_billing_master_grand_total: grandTotal.toFixed(2),
        }));
    }, [invoiceItems]);

    // Add product to invoice with qty update if already exists
    // ✅ Product GST inclusive 18%
    const handleProductAdd = (product) => {
        setInvoiceItems((prev) => {
            const now = new Date().toISOString();
            const salePrice = Number(product.product_sale_price || 0);

            // Check if product already exists
            const index = prev.findIndex(
                (item) => !item.isService && item.quotation_and_billing_child_product_id === product.product_id
            );

            if (index !== -1) {
                const updated = [...prev];
                const newQty = Number(updated[index].quotation_and_billing_qty) + 1;

                const gross = newQty * salePrice;
                const base = gross / PRODUCT_GST_FACTOR;
                const gstValue = gross - base;

                updated[index] = {
                    ...updated[index],
                    quotation_and_billing_qty: newQty,
                    quotation_and_billing_tax_percentage: PRODUCT_GST_PERCENT,
                    quotation_and_billing_tax_value: gstValue,
                    quotation_and_billing_child_total: gross,
                    updated_at: now,
                };

                return updated;
            }

            const gross = 1 * salePrice;
            const base = gross / PRODUCT_GST_FACTOR;
            const gstValue = gross - base;

            const newItem = {
                product_id: product.product_id,
                quotation_and_billing_child_product_id: product.product_id,
                quotation_and_billing_product_name: product.product_name,
                quotation_and_billing_qty: 1,
                quotation_and_billing_product_mrp: product.product_mrp,
                quotation_and_billing_product_sale_price: salePrice,
                quotation_and_billing_tax_percentage: PRODUCT_GST_PERCENT,
                quotation_and_billing_tax_value: gstValue,
                quotation_and_billing_child_total: gross,
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
    // ✅ also set updated_at properly
    // ✅ Product: fixed 18% split
    // ✅ Service: gst editable
    const updateRow = (index, field, value) => {
        let updated = [...invoiceItems];
        const now = new Date().toISOString();

        updated[index][field] = value;
        updated[index].updated_at = now;

        if (field === "quotation_and_billing_qty") {
            if (Number(value) <= 0 && !updated[index].isService) {
                updated.splice(index, 1);
                setInvoiceItems(updated);
                return;
            }
        }

        const isServiceRow = updated[index].quotation_and_billing_service_or_product === "Service";

        const qty = updated[index].quotation_and_billing_qty === "-" ? 1 : Number(updated[index].quotation_and_billing_qty);
        const price = Number(updated[index].quotation_and_billing_product_sale_price || 0);
        const gross = qty * price;

        if (!isServiceRow) {
            const base = gross / PRODUCT_GST_FACTOR;
            const gstValue = gross - base;

            updated[index].quotation_and_billing_tax_percentage = PRODUCT_GST_PERCENT;
            updated[index].quotation_and_billing_tax_value = gstValue;
            updated[index].quotation_and_billing_child_total = gross;

            setInvoiceItems(updated);
            return;
        }

        const gst = Number(updated[index].quotation_and_billing_tax_percentage || 0);
        const taxValue = (gross * gst) / 100;

        updated[index].quotation_and_billing_tax_value = taxValue;
        updated[index].quotation_and_billing_child_total = gross + taxValue;

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
                                        label: `${p.product_name} (Price incl GST: ₹${p.product_sale_price})`,
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

                                        {/* ✅ MRP removed */}
                                        <th>Price</th>
                                        <th>Base Amount</th>

                                        <th>GST %</th>
                                        <th>GST Value</th>
                                        <th>Total</th>

                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceItems.length ? invoiceItems.map((item, index) => {
                                        const isServiceRow = item.isService;
                                        const qty = item.quotation_and_billing_qty === "-" ? 1 : Number(item.quotation_and_billing_qty);
                                        const price = Number(item.quotation_and_billing_product_sale_price || 0);
                                        const gross = qty * price;

                                        const base = isServiceRow ? gross : gross / PRODUCT_GST_FACTOR;
                                        const gstValue = isServiceRow
                                            ? Number(item.quotation_and_billing_tax_value || 0)
                                            : gross - base;

                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                {isServiceRow ? (
                                                    <>
                                                        <td>
                                                            <Input
                                                                value={item.quotation_and_billing_product_name}
                                                                onChange={(e) => updateRow(index, "quotation_and_billing_product_name", e.target.value)}
                                                                placeholder="Service Name"
                                                            />
                                                        </td>
                                                        <td>-</td>

                                                        <td>
                                                            <Input
                                                                type="number"
                                                                value={item.quotation_and_billing_product_sale_price}
                                                                onChange={(e) => updateRow(index, "quotation_and_billing_product_sale_price", Number(e.target.value))}
                                                            />
                                                        </td>

                                                        <td>{Number(base || 0).toFixed(2)}</td>

                                                        <td style={{ width: 110 }}>
                                                            <Input
                                                                type="number"
                                                                value={item.quotation_and_billing_tax_percentage}
                                                                onChange={(e) => updateRow(index, "quotation_and_billing_tax_percentage", Number(e.target.value))}
                                                            />
                                                        </td>

                                                        <td>{Number(gstValue || 0).toFixed(2)}</td>
                                                        <td>{Number(item.quotation_and_billing_child_total || 0).toFixed(2)}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td>{item.quotation_and_billing_product_name}</td>
                                                        <td>
                                                            <div className="input-group" style={{ width: "120px" }}>
                                                                <button
                                                                    className="btn btn-outline-secondary"
                                                                    type="button"
                                                                    onClick={() => updateRow(index, "quotation_and_billing_qty", Number(item.quotation_and_billing_qty) - 1)}
                                                                >
                                                                    –
                                                                </button>
                                                                <input
                                                                    type="number"
                                                                    className="form-control text-center border-secondary"
                                                                    value={item.quotation_and_billing_qty}
                                                                    readOnly
                                                                />
                                                                <button
                                                                    className="btn btn-outline-secondary"
                                                                    type="button"
                                                                    onClick={() => updateRow(index, "quotation_and_billing_qty", Number(item.quotation_and_billing_qty) + 1)}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <Input
                                                                type="number"
                                                                value={item.quotation_and_billing_product_sale_price}
                                                                onChange={(e) => updateRow(index, "quotation_and_billing_product_sale_price", Number(e.target.value))}
                                                            />
                                                        </td>

                                                        <td>{Number(base || 0).toFixed(2)}</td>

                                                        <td style={{ width: 110 }}>
                                                            <Input type="number" value={PRODUCT_GST_PERCENT} readOnly />
                                                        </td>

                                                        <td>{Number(gstValue || 0).toFixed(2)}</td>
                                                        <td>{Number(item.quotation_and_billing_child_total || 0).toFixed(2)}</td>
                                                    </>
                                                )}
                                                <td>
                                                    <Button color="danger" size="sm" onClick={() => removeRow(index)}>Delete</Button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="9" className="text-center py-3">No Items Added</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* TOTALS */}
                        <div className="d-flex justify-content-end mt-3 gap-4">
                            <div><strong>Taxable (Base) Total:</strong> ₹{invoiceData.quotation_and_billing_master_total}</div>
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