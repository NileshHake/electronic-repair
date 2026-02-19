import { Col, Input, Label } from "reactstrap";
import SelectWithAdd from "./SelectWithAdd";
import Select from "react-select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
const getVal = (opt) => opt?.value ?? opt ?? "";

const getMultiVals = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((x) => x?.value ?? x).filter(Boolean);
};

const findOption = (opts, id) =>
    opts.find((o) => String(o.value) === String(id)) || null;

const findMultiOptions = (opts, ids) => {
    if (!Array.isArray(ids)) return [];
    const set = new Set(ids.map(String));
    return opts.filter((o) => set.has(String(o.value)));
};
export const ProductNameField = ({ productData, setField, errorMessage }) => (
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
);

const channelOptions = [
    { label: "4 Channel", value: 4 },
    { label: "8 Channel", value: 8 },
    { label: "16 Channel", value: 16 },
    { label: "32 Channel", value: 32 },
    { label: "64 Channel", value: 64 },
];

export const CategoryAndSubCategory = ({
    lookups,
    productData,
    setField,
    categoryOptions,
    selectedCategoryId,
    subcategoryOptions,
}) => {
    const selectedSubCategoryId = productData.product_sub_category;

    const isChannelVisible =
        Number(selectedCategoryId) === 13 &&
        (
            Number(selectedSubCategoryId) === 14 || // NVR
            Number(selectedSubCategoryId) === 15 || // DVR
            Number(selectedSubCategoryId) === 19 || // Power Supply (DVR)
            Number(selectedSubCategoryId) === 29    // POE (NVR)
        );

    const channelLabel =
        Number(selectedSubCategoryId) === 14
            ? "Select NVR Channel"
            : Number(selectedSubCategoryId) === 15
                ? "Select DVR Channel"
                : Number(selectedSubCategoryId) === 19
                    ? "Select DVR Channel (for Power Supply)"
                    : Number(selectedSubCategoryId) === 29
                        ? "Select NVR Channel (for POE Switch)"
                        : "";


    return (
        <>
            {/* Category */}
            <Col lg={4} className="mt-2">
                <SelectWithAdd
                    status
                    isMulti={false}
                    label="Select Category"
                    options={categoryOptions}
                    value={findOption(categoryOptions, productData.product_category)}
                    onAddClick={() => lookups.ui.setIsCategoryOpen(true)}
                    onChange={(opt) => {
                        const v = getVal(opt);
                        setField("product_category", v);

                        // Reset dependents
                        setField("product_sub_category", "");
                        setField("product_dvr_or_nvr_channel", "");
                    }}
                />
            </Col>

            {/* Sub Category */}
            {selectedCategoryId > 0 && subcategoryOptions.length > 0 && (
                <Col lg={4} className="mt-2">
                    <SelectWithAdd
                        status
                        isMulti={false}
                        label="Select Sub Category"
                        options={subcategoryOptions}
                        value={findOption(
                            subcategoryOptions,
                            productData.product_sub_category
                        )}
                        onAddClick={() => lookups.ui.setIsCategoryOpen(true)}
                        onChange={(opt) => {
                            const v = getVal(opt);
                            setField("product_sub_category", v);
                            setField("product_dvr_or_nvr_channel", "");
                        }}
                    />
                </Col>
            )}

            {/* ✅ DVR / NVR Channel Dropdown */}
            {isChannelVisible && (
                <Col lg={4} className="mt-3">
                    <label className="form-label fw-bold">{channelLabel}</label>
                    <Select
                        options={channelOptions}
                        placeholder="Select Channel"
                        value={channelOptions.find(
                            (opt) =>
                                Number(opt.value) ===
                                Number(productData.product_dvr_or_nvr_channel)
                        )}
                        onChange={(opt) =>
                            setField("product_dvr_or_nvr_channel", opt?.value || "")
                        }
                    />
                </Col>
            )}
        </>
    );
};

export const BrandField = ({ lookups, productData, setField, brandOptions }) => (
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
);

export const SupportGenSection = ({
    lookups,
    productData,
    setField,
    showSupportGen,
    supportBrandOptions,
    supportGenOptions,
    ramOptions,
}) => {
    if (!showSupportGen) return null;

    return (
        <>
            {/* ✅ Support Brand + Support Generations (Category=2) */}
            <Col lg={4} className="mt-4">
                <SelectWithAdd
                    status={false}
                    label="Select   Processor Brand"
                    placeholder="Select   Processor Brand"
                    options={supportBrandOptions}
                    value={findOption(
                        supportBrandOptions,
                        productData.product_support_brand_id
                    )}
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
                    value={findMultiOptions(
                        supportGenOptions,
                        productData.product_support_generations
                    )}
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
    );
};

export const MainGenerationSection = ({
    lookups,
    productData,
    setField,
    showMainGen,
    mainGenOptions,
}) => {
    if (!showMainGen) return null;

    return (
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
    );
};

export const RamForCategory4 = ({
    lookups,
    productData,
    setField,
    selectedCategoryId,
    ramOptions,
}) => {
    if (selectedCategoryId !== 4) return null;

    return (
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
    );
};

export const TaxField = ({ lookups, productData, setField, taxOptions }) => (
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
);

export const UsageField = ({ productData, setField, usageOptions }) => (
    <Col lg={4} className="mt-3">
        <Label className="form-label fw-bold">Product Usage</Label>
        <Select
            value={usageOptions.find((x) => x.value === productData.product_usage_type) || null}
            placeholder="Select Usage"
            options={usageOptions}
            onChange={(selected) => setField("product_usage_type", selected?.value || "")}
        />
    </Col>
);

export const BasicAttributes = ({ productData, setField }) => (
    <>
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
    </>
);

export const SaleToggle = ({ productData, setField }) => (
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
);

export const DeliveryToggle = ({ productData, setField }) => (
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
);

export const PricesTable = ({ productData, setField }) => (
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
);

export const DescriptionField = ({ productData, setField }) => (
    <Col lg={12}>
        <Label className="form-label fw-bold">Description</Label>
        <CKEditor
            editor={ClassicEditor}
            data={productData.product_description}
            onChange={(event, editor) => setField("product_description", editor.getData())}
        />
    </Col>
);

