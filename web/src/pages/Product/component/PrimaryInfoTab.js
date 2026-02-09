import React from "react";
import { Row, Col, Label, Input } from "reactstrap";
import Select from "react-select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import SelectWithAdd from "./SelectWithAdd";

const PrimaryInfoTab = ({ form, lookups }) => {
  const { productData, setField, errorMessage } = form;
  const { categories, brands, taxes } = lookups.data;

  const usageOptions = [
    { value: "sale", label: "Only Sale" },
    { value: "repair", label: "Only Repair" },
    { value: "both", label: "Sale & Repair Both" },
  ];

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
          label="Select Category"
          placeholder="Select Category"
          options={categories.map((c) => ({
            value: c.category_id,
            label: c.category_name,
          }))}
          onAddClick={() => lookups.ui.setIsCategoryOpen(true)}
          onChange={(val) => setField("product_category", val)}
        />
      </Col>

      {/* Brand */}
      <Col lg={4} className="mt-2">
        <SelectWithAdd
          label="Select Brand"
          placeholder="Select Brand"
          options={brands.map((b) => ({
            value: b.brand_id,
            label: b.brand_name,
          }))}
          onAddClick={() => lookups.ui.setIsBrandOpen(true)}
          onChange={(val) => setField("product_brand", val)}
        />
      </Col>

      {/* Tax */}
      <Col lg={4} className="mt-2">
        <SelectWithAdd
          label="Select Tax %"
          placeholder="Select Tax %"
          options={taxes.map((t) => ({
            value: t.tax_id,
            label: t.tax_name,
          }))}
          onAddClick={() => lookups.ui.setIsTaxOpen(true)}
          onChange={(val) => setField("product_tax", val)}
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

      {/* Product On Sale + Discount */}
      <Col lg={4} className="mt-2">
        <div className="d-flex align-items-center justify-content-between">
          <Label className="form-label fw-bold mb-0">
             Product On Sale
          </Label>

          <div className="form-check form-switch me-3">
            <Input
              type="switch"
              className="form-check-input"
              checked={productData.product_on_sale === 1}
              onChange={(e) => {
                const isSale = e.target.checked ? 1 : 0;
                setField("product_on_sale", isSale);

                // reset discount when OFF
                if (isSale === 0) setField("product_discount_amount", 0);
              }}
            />
          </div>
        </div>

       
      </Col>

      {/* Free Delivery + Charge */}
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

                // reset charge when OFF
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

      {/* Prices Table */}
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
