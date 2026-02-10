import React from "react";
import { Row, Col, Label, Input } from "reactstrap";
import Select from "react-select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import SelectWithAdd from "./SelectWithAdd";

const PrimaryInfoTab = ({ form, lookups }) => {
    const { productData, setField, errorMessage } = form;
    const {
        categories = [],
        brands = [],
        taxes = [],
        generations = [],
        rams = [],
    } = lookups?.data || {};



    // ✅ helper: works if SelectWithAdd returns number OR option object
    const getVal = (opt) => opt?.value ?? opt ?? "";

    // ✅ helper for multi: works if returns array of numbers OR array of option objects
    const getMultiVals = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.map((x) => x?.value ?? x).filter(Boolean);
    };

    const usageOptions = [
        { value: "sale", label: "Only Sale" },
        { value: "repair", label: "Only Repair" },
        { value: "both", label: "Sale & Repair Both" },
    ];

    const selectedCategoryId = Number(productData.product_category);
    const selectedBrandId = Number(productData.product_brand);
    const supportBrandId = Number(productData.product_support_brand_id);

    const filteredBrands = !selectedCategoryId
        ? brands
        : selectedCategoryId === 1
            ? brands.slice(0, 2)
            : brands;

    // ✅ options
    const categoryOptions = categories.map((c) => ({
        value: c.category_id,
        label: c.category_name,
    }));

    const brandOptions = filteredBrands.map((b) => ({
        value: b.brand_id,
        label: b.brand_name,
    }));

    const taxOptions = taxes.map((t) => ({
        value: t.tax_id,
        label: t.tax_name,
    }));

    const ramOptions = rams.map((r) => ({
        value: r.ram_id,
        label: r.ram_name,
    }));

    const supportBrandOptions = [
        { value: 1, label: "Intel" },
        { value: 2, label: "AMD" },
    ];

    // ✅ show rules
    const showSupportGen = selectedCategoryId === 2;
    const showMainGen =
        (selectedBrandId === 1 || selectedBrandId === 2) && selectedCategoryId !== 2;

    const mainGenOptions = generations
        .filter((g) => Number(g.generations_brand) === Number(selectedBrandId))
        .map((g) => ({ value: g.generations_id, label: g.generations_name }));

    const supportGenOptions = generations
        .filter((g) => Number(g.generations_brand) === Number(supportBrandId))
        .map((g) => ({ value: g.generations_id, label: g.generations_name }));
    const findOption = (opts, id) =>
        opts.find((o) => String(o.value) === String(id)) || null;

    const findMultiOptions = (opts, ids) => {
        if (!Array.isArray(ids)) return [];
        const set = new Set(ids.map(String));
        return opts.filter((o) => set.has(String(o.value)));
    };

    return (
        <Row className="ps-3 pe-3">
            {/* Product Name */}
            <Col lg={4} className="mt-3">
                <Label className="form-label fw-bold">
                    Product Name<span className="text-danger"> *</span>
                </Label>
                <Input
                    type="text"
                    placeholder="Enter Product Name"
                    value={productData.product_name}
                    onChange={(e) => setField("product_name", e.target.value)}
                />
                {errorMessage.product_name && (
                    <div className="text-danger small">{errorMessage.product_name}</div>
                )}
            </Col>

            {/* Category */}
            <Col lg={4} className="mt-2">
                <SelectWithAdd
                    status={true}
                    isMulti={false}
                    label="Select Category"
                    placeholder="Select Category"
                    options={categoryOptions}
                    value={findOption(categoryOptions, productData.product_category)}
                    onAddClick={() => lookups.ui.setIsCategoryOpen(true)}
                    onChange={(opt) => {
                        const v = getVal(opt);
                        setField("product_category", v);

                        // reset dependents
                        setField("product_brand", "");
                        setField("product_generation_id", "");
                        setField("product_support_brand_id", "");
                        setField("product_support_generations", []);
                    }}
                />
            </Col>

            {/* Brand */}
            <Col lg={4} className="mt-2">
                <SelectWithAdd
                    status={true}
                    isMulti={false}
                    label="Select Brand"
                    placeholder="Select Brand"
                    options={brandOptions}
                    value={findOption(brandOptions, productData.product_brand)}
                    onAddClick={() => lookups.ui.setIsBrandOpen(true)}
                    onChange={(opt) => {
                        const v = getVal(opt);
                        setField("product_brand", v);
                        setField("product_generation_id", "");
                    }}
                />
            </Col>

            {/* ✅ Support Brand + Support Generations (Category=2) */}
            {showSupportGen && (
                <>
                    <Col lg={4} className="mt-4">
                        <SelectWithAdd
                            status={false}
                            label="Select Support Brand"
                            placeholder="Select Support Brand"
                            options={supportBrandOptions}
                            value={findOption(supportBrandOptions, productData.product_support_brand_id)}
                            onChange={(opt) => {
                                const v = getVal(opt);
                                setField("product_support_brand_id", v);
                                setField("product_support_generations", []);
                            }}
                        />
                    </Col>

                    <Col lg={4} className="mt-2">
                        <SelectWithAdd
                            status={true}
                            isMulti={true}
                            label="Select Support Generations"
                            placeholder="Select Generations"
                            options={supportGenOptions}
                            value={findMultiOptions(supportGenOptions, productData.product_support_generations)}
                            onAddClick={() => lookups.ui.setIsGenerationOpen(true)}
                            onChange={(selected) => {
                                const ids = getMultiVals(selected);
                                setField("product_support_generations", ids);
                            }}
                        />
                    </Col>
                    {/* RAM */}
                    <Col lg={4} className="mt-2">
                        <SelectWithAdd
                            status={true}
                            isMulti={false}
                            label="Select RAM"
                            placeholder="Select RAM"
                            value={findOption(ramOptions, productData.product_ram_id)}
                            options={ramOptions}
                            onAddClick={() => lookups.ui.setIsRamOpen(true)}
                            onChange={(opt) => setField("product_ram_id", getVal(opt))}
                        />
                    </Col>
                </>
            )}

            {/* ✅ Main Generation (Intel/AMD) */}
            {showMainGen && (
                <Col lg={4} className="mt-2">
                    <SelectWithAdd
                        status={true}
                        isMulti={false}
                        label="Select Generation / Series"
                        placeholder="Select Generation"
                        options={mainGenOptions}
                        onAddClick={() => lookups.ui.setIsGenerationOpen(true)}
                        value={findOption(mainGenOptions, productData.product_generation_id)}
                        onChange={(opt) => setField("product_generation_id", getVal(opt))}
                    />
                </Col>
            )}



            {/* Tax */}
            <Col lg={4} className="mt-2">
                <SelectWithAdd
                    status={true}
                    isMulti={false}
                    label="Select Tax %"
                    placeholder="Select Tax %"
                    options={taxOptions}
                    value={findOption(taxOptions, productData.product_tax)}
                    onAddClick={() => lookups.ui.setIsTaxOpen(true)}
                    onChange={(opt) => setField("product_tax", getVal(opt))}
                />
            </Col>

            {/* Usage */}
            <Col lg={4} className="mt-3">
                <Label className="form-label fw-bold">Product Usage</Label>
                <Select
                    value={usageOptions.find((x) => x.value === productData.product_usage_type)}
                    placeholder="Select Usage"
                    options={usageOptions}
                    onChange={(selected) => setField("product_usage_type", selected.value)}
                />
            </Col>

            {/* Product Color */}
            <Col lg={4} className="mt-2">
                <Label className="form-label fw-bold">Product Color</Label>
                <Input
                    type="text"
                    placeholder="Enter Color (e.g., Red, Blue)"
                    value={productData.product_color}
                    onChange={(e) => setField("product_color", e.target.value)}
                />
            </Col>

            {/* Product Material */}
            <Col lg={4} className="mt-2">
                <Label className="form-label fw-bold">Product Material</Label>
                <Input
                    type="text"
                    placeholder="Enter Material (e.g., Cotton, Steel)"
                    value={productData.product_material}
                    onChange={(e) => setField("product_material", e.target.value)}
                />
            </Col>

            {/* Product Weight */}
            <Col lg={4} className="mt-2">
                <Label className="form-label fw-bold">Product Weight</Label>
                <Input
                    type="text"
                    placeholder="Enter Weight (e.g., 500g, 2kg)"
                    value={productData.product_weight}
                    onChange={(e) => setField("product_weight", e.target.value)}
                />
            </Col>

            {/* ✅ Product On Sale + Discount */}
            <Col lg={4} className="mt-2">
                <div className="d-flex align-items-center justify-content-between">
                    <Label className="form-label fw-bold mb-0">Product On Sale</Label>
                    <div className="form-check form-switch me-3">
                        <Input
                            type="switch"
                            className="form-check-input"
                            checked={productData.product_on_sale === 1}
                            onChange={(e) => {
                                const isSale = e.target.checked ? 1 : 0;
                                setField("product_on_sale", isSale);
                                if (isSale === 0) setField("product_discount_amount", 0);
                            }}
                        />
                    </div>
                </div>
            </Col>

            {/* ✅ Free Delivery + Charge */}
            <Col lg={4} className="mt-2">
                <div className="d-flex align-items-center justify-content-between">
                    <Label className="form-label fw-bold mb-0">
                        {productData.product_on_free_delivery === 1 ? "Charge" : "Free Delivery"}
                    </Label>

                    <div className="form-check form-switch me-3">
                        <Input
                            type="switch"
                            className="form-check-input"
                            checked={productData.product_on_free_delivery === 1}
                            onChange={(e) => {
                                const isCharge = e.target.checked ? 1 : 0;
                                setField("product_on_free_delivery", isCharge);
                                if (isCharge === 0) setField("product_delivery_charge", 0);
                            }}
                        />
                    </div>
                </div>

                {productData.product_on_free_delivery === 1 && (
                    <Input
                        type="number"
                        min={0}
                        className="form-control mt-2"
                        value={productData.product_delivery_charge ?? ""}
                        placeholder="Enter delivery charge"
                        onChange={(e) => setField("product_delivery_charge", Number(e.target.value))}
                    />
                )}
            </Col>

            {/* ✅ Prices Table */}
            <Col lg={12}>
                <div className="table-responsive table-card mt-4 p-3">
                    <table className="table text-center align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th>MRP</th>
                                <th>Sale</th>
                                <th>Purchase Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {["product_mrp", "product_sale_price", "product_purchase_price"].map((field) => (
                                    <td key={field}>
                                        <input
                                            type="number"
                                            className="form-control text-end fw-bold"
                                            value={productData[field]}
                                            onChange={(e) => setField(field, e.target.value)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Col>

            {/* Description */}
            <Col lg={12}>
                <Label className="form-label fw-bold">Description</Label>
                <CKEditor
                    editor={ClassicEditor}
                    data={productData.product_description}
                    onChange={(event, editor) => setField("product_description", editor.getData())}
                />
            </Col>
        </Row>
    );
};

export default PrimaryInfoTab;
