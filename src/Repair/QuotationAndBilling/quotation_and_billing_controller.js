

const sequelize = require("../../../config/db");
const { getCreatedBy } = require("../../helper/CurrentUser");
const QuotationAndBillingChild = require("./quotation_and_billing_child_model");
const QuotationAndBillingMaster = require("./quotation_and_billing_master_model");


// CREATE QuotationAndBill
exports.createQuotationAndBill = async (req, res) => {
  const {
    quotation_and_billing_master_customer_id,
    quotation_and_billing_master_repair_id,
    quotation_and_billing_master_total,
    quotation_and_billing_master_gst_amount,
    quotation_and_billing_master_grand_total,
    items,
  } = req.body;

  console.log("Master Data:", {
    quotation_and_billing_master_customer_id,
    quotation_and_billing_master_repair_id,
    quotation_and_billing_master_total,
    quotation_and_billing_master_gst_amount,
    quotation_and_billing_master_grand_total,
  });

  console.log("Child Items:", items);

  const t = await sequelize.transaction();
  try {
    // Create Master
    const master = await QuotationAndBillingMaster.create(
      {
        quotation_and_billing_master_invoice_number: "INV-" + Date.now(),
        quotation_and_billing_master_date: new Date(),
        quotation_and_billing_master_customer_id,
        quotation_and_billing_master_repair_id,
        quotation_and_billing_master_total,
        quotation_and_billing_master_gst_amount,
        quotation_and_billing_master_grand_total,
        quotation_and_billing_master_created_by: req.currentUser?.user_id,
      },
      { transaction: t }
    );

    // Create Child items
    const childItems = items.map((item) => ({
      quotation_and_billing_item_name: item.quotation_and_billing_product_name,
      quotation_and_billing_qty: item.quotation_and_billing_qty,
      quotation_and_billing_tax_percentage: item.quotation_and_billing_tax_percentage,
      quotation_and_billing_tax_value: item.quotation_and_billing_tax_value,
      quotation_and_billing_child_total: item.quotation_and_billing_child_total,
      quotation_and_billing_child_master_id: master.quotation_and_billing_master_id,
      isService: item.isService || false,
    }));

    await QuotationAndBillingChild.bulkCreate(childItems, { transaction: t });

    await t.commit();
    res.status(201).json({ message: "Quotation & Billing created successfully", master });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to create Quotation & Billing", details: err.message });
  }
};

// GET All QuotationAndBill
exports.getQuotationAndBills = async (req, res) => {
    try {
        const quotationData = await sequelize.query(
            `
      SELECT m.*, c.quotation_and_billing_child_id, c.quotation_and_billing_item_name, 
             c.quotation_and_billing_qty, c.quotation_and_billing_tax_percentage, 
             c.quotation_and_billing_tax_value, c.quotation_and_billing_child_total
      FROM tbl_quotation_and_billing_master AS m
      LEFT JOIN tbl_quotation_and_billing_child AS c
        ON c.quotation_and_billing_child_master_id = m.quotation_and_billing_master_id
      ORDER BY m.quotation_and_billing_master_id DESC
      `,
            {
                type: sequelize.QueryTypes.SELECT,
            }
        );

        res.json(quotationData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch QuotationAndBills" });
    }
};


// GET Single QuotationAndBill
exports.getQuotationAndBill = async (req, res) => {
    const { id } = req.params;
    try {
        const quotationData = await sequelize.query(
            `
      SELECT m.quotation_and_billing_master_id,
             m.quotation_and_billing_master_invoice_number,
             m.quotation_and_billing_master_date,
             m.quotation_and_billing_master_customer_id,
             m.quotation_and_billing_master_repair_id,
             m.quotation_and_billing_master_total,
             m.quotation_and_billing_master_gst_amount,
             m.quotation_and_billing_master_grand_total,
             m.quotation_and_billing_master_created_by,
             m.quotation_and_billing_master_status,
             c.quotation_and_billing_child_id,
             c.quotation_and_billing_item_name,
             c.quotation_and_billing_qty,
             c.quotation_and_billing_tax_percentage,
             c.quotation_and_billing_tax_value,
             c.quotation_and_billing_child_total
      FROM tbl_quotation_and_billing_master AS m
      LEFT JOIN tbl_quotation_and_billing_child AS c
        ON c.quotation_and_billing_child_master_id = m.quotation_and_billing_master_id
      WHERE m.quotation_and_billing_master_id = :id
      `,
            {
                replacements: { id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!quotationData || quotationData.length === 0) {
            return res.status(404).json({ error: "QuotationAndBill not found" });
        }

        // Transform flat JOIN result into nested master → items
        const master = {
            quotation_and_billing_master_id: quotationData[0].quotation_and_billing_master_id,
            quotation_and_billing_master_invoice_number: quotationData[0].quotation_and_billing_master_invoice_number,
            quotation_and_billing_master_date: quotationData[0].quotation_and_billing_master_date,
            quotation_and_billing_master_customer_id: quotationData[0].quotation_and_billing_master_customer_id,
            quotation_and_billing_master_repair_id: quotationData[0].quotation_and_billing_master_repair_id,
            quotation_and_billing_master_total: quotationData[0].quotation_and_billing_master_total,
            quotation_and_billing_master_gst_amount: quotationData[0].quotation_and_billing_master_gst_amount,
            quotation_and_billing_master_grand_total: quotationData[0].quotation_and_billing_master_grand_total,
            quotation_and_billing_master_created_by: quotationData[0].quotation_and_billing_master_created_by,
            quotation_and_billing_master_status: quotationData[0].quotation_and_billing_master_status,
            items: [],
        };

        quotationData.forEach(row => {
            if (row.quotation_and_billing_child_id) {
                master.items.push({
                    quotation_and_billing_child_id: row.quotation_and_billing_child_id,
                    quotation_and_billing_item_name: row.quotation_and_billing_item_name,
                    quotation_and_billing_qty: row.quotation_and_billing_qty,
                    quotation_and_billing_tax_percentage: row.quotation_and_billing_tax_percentage,
                    quotation_and_billing_tax_value: row.quotation_and_billing_tax_value,
                    quotation_and_billing_child_total: row.quotation_and_billing_child_total,
                });
            }
        });

        res.json(master);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch QuotationAndBill" });
    }
};


// UPDATE QuotationAndBill (delete old children and add new)
exports.updateQuotationAndBill = async (req, res) => {
    const { id } = req.params;

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
        const master = await QuotationAndBillingMaster.findByPk(id);
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

        // Delete old child items
        await QuotationAndBillingChild.destroy({
            where: { quotation_and_billing_child_master_id: id },
            transaction: t,
        });

        // Add new child items using exact model field names
        const childItems = items.map(item => ({
            quotation_and_billing_item_name: item.quotation_and_billing_item_name,
            quotation_and_billing_qty: item.quotation_and_billing_qty,
            quotation_and_billing_tax_percentage: item.quotation_and_billing_tax_percentage,
            quotation_and_billing_tax_value: item.quotation_and_billing_tax_value,
            quotation_and_billing_child_total: item.quotation_and_billing_child_total,
            quotation_and_billing_child_master_id: id,
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
