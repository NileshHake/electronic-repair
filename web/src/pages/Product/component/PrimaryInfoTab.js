import React, { useMemo } from "react";
import { Row, Col, Label, Input } from "reactstrap";
import Select from "react-select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import SelectWithAdd from "./SelectWithAdd";
import { AMCToggle, BasicAttributes, BrandField, CategoryAndSubCategory, DeliveryToggle, DescriptionField, MainGenerationSection, PricesTable, ProductNameField, RamForCategory4, SaleToggle, SupportGenSection, TaxField, UsageField } from "./ProductConfigurationForm";

/* =========================
   helpers (same logic)
========================= */
const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};




/* =========================
   MAIN COMPONENT
========================= */
const PrimaryInfoTab = ({ form, lookups }) => {
    const { productData, setField, errorMessage } = form;

    const {
        categories = [],
        brands = [],
        taxes = [],
        generations = [],
        rams = [],
    } = lookups?.data || {};

    const usageOptions = [
        { value: "sale", label: "Only Sale" },
        { value: "repair", label: "Only Repair" },
        { value: "both", label: "Sale & Repair Both" },
    ];

    // ✅ IDs (safe number)
    const selectedCategoryId = toNum(productData.product_category);
    const selectedBrandId = toNum(productData.product_brand);
    const supportBrandId = toNum(productData.product_support_brand_id);

    // ✅ Category Options (main)
    const categoryOptions = useMemo(() => {
        return categories
            .filter(
                (c) => c.category_main_id === null || c.category_main_id === "" || c.category_main_id === 0
            )
            .map((c) => ({ value: c.category_id, label: c.category_name }));
    }, [categories]);

    // ✅ Subcategory Options (child of selectedCategoryId)
    const subcategoryOptions = useMemo(() => {
        if (!selectedCategoryId) return [];
        return categories
            .filter((c) => toNum(c.category_main_id) == selectedCategoryId)
            .map((c) => ({ value: c.category_id, label: c.category_name }));
    }, [categories, selectedCategoryId]);




    // ✅ Brands filter
    const filteredBrands = useMemo(() => {
        if (!selectedCategoryId) return brands;
        if (selectedCategoryId === 1) return brands.slice(0, 2);
        return brands;
    }, [brands, selectedCategoryId]);

    const brandOptions = useMemo(() => {
        return filteredBrands.map((b) => ({ value: b.brand_id, label: b.brand_name }));
    }, [filteredBrands]);

    const taxOptions = useMemo(() => {
        return taxes.map((t) => ({ value: t.tax_id, label: t.tax_name }));
    }, [taxes]);

    const ramOptions = useMemo(() => {
        return rams.map((r) => ({ value: r.ram_id, label: r.ram_name }));
    }, [rams]);

    const supportBrandOptions = [
        { value: 1, label: "Intel" },
        { value: 2, label: "AMD" },
    ];

    // ✅ show rules
    const showSupportGen = selectedCategoryId === 2;
    const showMainGen = (selectedBrandId === 1 || selectedBrandId === 2) && selectedCategoryId !== 2;

    const mainGenOptions = useMemo(() => {
        return generations
            .filter((g) => toNum(g.generations_brand) === selectedBrandId)
            .map((g) => ({ value: g.generations_id, label: g.generations_name }));
    }, [generations, selectedBrandId]);

    const supportGenOptions = useMemo(() => {
        return generations
            .filter((g) => toNum(g.generations_brand) === supportBrandId)
            .map((g) => ({ value: g.generations_id, label: g.generations_name }));
    }, [generations, supportBrandId]);

    return (
        <Row className="ps-3 pe-3">
            <ProductNameField
                productData={productData}
                setField={setField}
                errorMessage={errorMessage}
            />

            <CategoryAndSubCategory
                lookups={lookups}
                productData={productData}
                setField={setField}
                categoryOptions={categoryOptions}
                selectedCategoryId={selectedCategoryId}
                subcategoryOptions={subcategoryOptions}
            />

            <BrandField
                lookups={lookups}
                productData={productData}
                setField={setField}
                brandOptions={brandOptions}
            />

            <SupportGenSection
                lookups={lookups}
                productData={productData}
                setField={setField}
                showSupportGen={showSupportGen}
                supportBrandOptions={supportBrandOptions}
                supportGenOptions={supportGenOptions}
                ramOptions={ramOptions}
            />

            <MainGenerationSection
                lookups={lookups}
                productData={productData}
                setField={setField}
                showMainGen={showMainGen}
                mainGenOptions={mainGenOptions}
            />

            <RamForCategory4
                lookups={lookups}
                productData={productData}
                setField={setField}
                selectedCategoryId={selectedCategoryId}
                ramOptions={ramOptions}
            />

            <TaxField
                lookups={lookups}
                productData={productData}
                setField={setField}
                taxOptions={taxOptions}
            />

            <UsageField
                productData={productData}
                setField={setField}
                usageOptions={usageOptions}
            />

            <BasicAttributes productData={productData} setField={setField} />

            <SaleToggle productData={productData} setField={setField} />
            <DeliveryToggle productData={productData} setField={setField} />
            
            <AMCToggle productData={productData} setField={setField} />

            <PricesTable productData={productData} setField={setField} />

            <DescriptionField productData={productData} setField={setField} />
        </Row>
    );
};

export default PrimaryInfoTab;
