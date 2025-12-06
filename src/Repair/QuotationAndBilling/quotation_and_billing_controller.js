

const sequelize = require("../../../config/db");
const { getCreatedBy } = require("../../helper/CurrentUser");
const Repair = require("../repair_model");
const QuotationAndBillingChild = require("./quotation_and_billing_child_model");
const QuotationAndBillingMaster = require("./quotation_and_billing_master_model");


// CREATE QuotationAndBill
exports.createQuotationAndBill = async (req, res) => {
    try {
        let {
            quotation_and_billing_master_customer_id,
            quotation_and_billing_master_repair_id,
            quotation_and_billing_master_total,
            quotation_and_billing_master_gst_amount,
            quotation_and_billing_master_grand_total,
            quotation_or_billing,
        } = req.body;

        // ---------------------------
        // ⭐ Convert FormData items[] into array
        // ---------------------------
        const items = [];

        Object.keys(req.body).forEach((key) => {
            const match = key.match(/^items\[(\d+)\]\[(.+)\]$/);
            if (match) {
                const index = parseInt(match[1]);
                const field = match[2];

                if (!items[index]) items[index] = {};
                items[index][field] = req.body[key];
            }
        });


        const t = await sequelize.transaction();

        // Create Master
        const master = await QuotationAndBillingMaster.create(
            {
                quotation_and_billing_master_invoice_number: "INV-" + Date.now(),
                quotation_and_billing_master_date: new Date(),
                quotation_and_billing_master_customer_id,
                quotation_and_billing_master_repair_id,
                quotation_or_billing,
                quotation_and_billing_master_total,
                quotation_and_billing_master_gst_amount,
                quotation_and_billing_master_grand_total,
                quotation_and_billing_master_created_by: getCreatedBy(req.currentUser),
            },
            { transaction: t }
        );

        // Child items insert
        const childItems = items.map((item) => ({
            quotation_and_billing_item_name: item.quotation_and_billing_product_name,
            quotation_and_billing_qty: item.quotation_and_billing_qty,
            quotation_and_billing_child_product_id: item.quotation_and_billing_child_product_id,
            quotation_and_billing_tax_percentage: item.quotation_and_billing_tax_percentage,
            quotation_and_billing_tax_value: item.quotation_and_billing_tax_value,
            quotation_and_billing_service_or_product: item.quotation_and_billing_service_or_product,
            quotation_and_billing_product_sale_price: item.quotation_and_billing_product_mrp,
            quotation_and_billing_product_sale_price: item.quotation_and_billing_product_sale_price,
            quotation_and_billing_child_total: item.quotation_and_billing_child_total,
            quotation_and_billing_child_master_id: master.quotation_and_billing_master_id,

        }));

        await QuotationAndBillingChild.bulkCreate(childItems, { transaction: t });
        // Update Repair Job Data with quotation id
        const RepairJobData = await Repair.findByPk(quotation_and_billing_master_repair_id);

        if (RepairJobData && master.quotation_or_billing === "Quotation") {
            await RepairJobData.update({
                repair_quotation_id: master.quotation_and_billing_master_id
            });
        } else if (RepairJobData && master.quotation_or_billing === "Billing") {
            await RepairJobData.update({
                repair_bill_id: master.quotation_and_billing_master_id
            });
        }
        else {
            console.log("Repair job not found with ID:", quotation_and_billing_master_repair_id);
        }

        await t.commit();

        return res.status(201).json({
            message: "Quotation & Billing created successfully",
            master,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Failed to create Quotation & Billing",
            details: err.message,
        });
    }
};


// GET All QuotationAndBill
exports.getQuotationAndBills = async (req, res) => {
    try {
        // Step 1: Fetch all masters with customer info
        const masters = await sequelize.query(
            `
      SELECT 
        m.*,
        u.user_name AS customer_name,
        u.user_email AS customer_email
      FROM tbl_quotation_and_billing_masters AS m
      LEFT JOIN tbl_users AS u 
        ON m.quotation_and_billing_master_customer_id = u.user_id
      ORDER BY m.quotation_and_billing_master_id DESC
      `,
            { type: sequelize.QueryTypes.SELECT }
        );

        // Step 2: If no masters, return empty array
        if (!masters.length) {
            return res.json([]);
        }

        // Step 3: Fetch only children for the fetched masters
        const masterIds = masters.map((m) => m.quotation_and_billing_master_id);

        const children = await sequelize.query(
            `
      SELECT *
      FROM tbl_quotation_and_billing_children
      WHERE quotation_and_billing_child_master_id IN (:masterIds)
      `,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: { masterIds },
            }
        );

        // Step 4: Map children into their respective masters
        const result = masters.map((master) => {
            const masterChildren = children.filter(
                (c) => c.quotation_and_billing_child_master_id === master.quotation_and_billing_master_id
            );
            return {
                ...master,
                items: masterChildren, // Nested array
            };
        });

        // Step 5: Return the final result
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch QuotationAndBills" });
    }
};




// GET Single QuotationAndBill
exports.getQuotationAndBill = async (req, res) => {
    try {
        const { id } = req.params;

        // Step 1: Fetch ONE master with customer info
        const masters = await sequelize.query(
            `
            SELECT 
                m.*,
                u.user_name AS customer_name,
                u.user_email AS customer_email
            FROM tbl_quotation_and_billing_masters AS m
            LEFT JOIN tbl_users AS u 
                ON m.quotation_and_billing_master_customer_id = u.user_id
            WHERE m.quotation_and_billing_master_id = :id
            `,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: { id },
            }
        );

        // Step 2: If no master exists
        if (!masters.length) {
            return res.status(404).json({ error: "Quotation & Billing not found" });
        }

        const master = masters[0];

        // Step 3: Fetch children of this master
        const children = await sequelize.query(
            `
            SELECT *
            FROM tbl_quotation_and_billing_children
            WHERE quotation_and_billing_child_master_id = :id
            `,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: { id },
            }
        );

        // Step 4: Add children as items array
        const finalData = {
            ...master,
            items: children,
        };

        res.json(finalData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch QuotationAndBill" });
    }
};


// UPDATE QuotationAndBill (delete old children and add new)
exports.updateQuotationAndBill = async (req, res) => {


    // Use the exact field names from your model
    const {
        quotation_and_billing_master_invoice_number,
        quotation_and_billing_master_date,
        quotation_and_billing_master_customer_id,
        quotation_and_billing_master_repair_id,
        quotation_and_billing_master_total,
        quotation_and_billing_master_gst_amount,
        quotation_and_billing_master_grand_total,
        quotation_and_billing_master_created_by,
        items, // array of child items
    } = req.body;

    const t = await sequelize.transaction();
    try {
        
        const master = await QuotationAndBillingMaster.findByPk(req.body.quotation_and_billing_master_id);
        if (!master) return res.status(404).json({ error: "QuotationAndBill not found" });

        // Update master using model field names directly
        await master.update(
            {
                quotation_and_billing_master_invoice_number,
                quotation_and_billing_master_date,
                quotation_and_billing_master_customer_id,
                quotation_and_billing_master_repair_id,
                quotation_and_billing_master_total,
                quotation_and_billing_master_gst_amount,
                quotation_and_billing_master_grand_total,
                quotation_and_billing_master_created_by,
            },
            { transaction: t }
        );
        // Convert form-data "items[0][field]" keys into an array
        const parsedItems = [];
        Object.keys(req.body).forEach((key) => {
            const match = key.match(/^items\[(\d+)\]\[(.+)\]$/);
            if (match) {
                const index = parseInt(match[1]);
                const field = match[2];

                if (!parsedItems[index]) parsedItems[index] = {};
                parsedItems[index][field] = req.body[key];
            }
        });


        // Delete old child items
        await QuotationAndBillingChild.destroy({
            where: { quotation_and_billing_child_master_id: master.quotation_and_billing_master_id },
            transaction: t,
        });

        // Add new child items using exact model field names
        const childItems = parsedItems.map((item) => ({
            quotation_and_billing_item_name: item.quotation_and_billing_product_name,
            quotation_and_billing_qty: item.quotation_and_billing_qty,
            quotation_and_billing_child_product_id: item.quotation_and_billing_child_product_id,
            quotation_and_billing_tax_percentage: item.quotation_and_billing_tax_percentage,
            quotation_and_billing_tax_value: item.quotation_and_billing_tax_value,
            quotation_and_billing_service_or_product: item.quotation_and_billing_service_or_product,
            quotation_and_billing_product_sale_price: item.quotation_and_billing_product_sale_price,
            quotation_and_billing_child_total: item.quotation_and_billing_child_total,
            quotation_and_billing_child_master_id: master.quotation_and_billing_master_id,
        }));

        await QuotationAndBillingChild.bulkCreate(childItems, { transaction: t });
        await t.commit();
        res.json({ message: "QuotationAndBill updated successfully" });
    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ error: "Failed to update QuotationAndBill" });
    }
};


// DELETE QuotationAndBill
exports.deleteQuotationAndBill = async (req, res) => {
    const { id } = req.params;
    const t = await sequelize.transaction();
    try {
        await QuotationAndBillingChild.destroy({ where: { quotation_and_billing_child_master_id: id }, transaction: t });
        await QuotationAndBillingMaster.destroy({ where: { quotation_and_billing_master_id: id }, transaction: t });
        await t.commit();
        res.json({ message: "QuotationAndBill deleted successfully" });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: "Failed to delete QuotationAndBill" });
    }
};
