const sequelize = require("../../config/db");
const User = require("../auth/user_model");
const InvoiceNumberGenerator = require("./invoice_number_model");

const FIELD_MAP = {
  invoice: "invoice_number_generator_count",
  quotation: "quotation_number_generator_count",

  orderinvoice: "order_invoice_number_generator_count",
  orderquotation: "order_quotation_number_generator_count",

  repairinvoice: "repair_invoice_number_generator_count",
  repairquotation: "repair_quotation_number_generator_count",

  recoveryinvoice: "recovery_invoice_number_generator_count",
  recoveryquotation: "recovery_quotation_number_generator_count",
};

async function generateNumber({ businessId, type }) {
  if (!businessId) {
    throw new Error("businessId is required.");
  }

  if (!FIELD_MAP[type]) {
    throw new Error("Invalid type provided.");
  }

  const fieldName = FIELD_MAP[type];

  // Find business
  const biz = await User.findByPk(businessId);
  if (!biz) {
    throw new Error(`Business not found for ID ${businessId}`);
  }

  const businessName = String(biz.user_name || biz.business_name || "").trim();
  const businessPincode = String(biz.user_address_pincode || "").trim();

  if (!businessName) {
    throw new Error("Business name missing.");
  }

  const prefix = `${businessName.substring(0, 3).toUpperCase()}${businessId}`;
  const suffix = businessPincode ? `/${businessPincode}` : "";

  return await sequelize.transaction(async (t) => {

    const [row] = await InvoiceNumberGenerator.findOrCreate({
      where: { invoice_number_generator_business_id: businessId },
      defaults: {
        invoice_number_generator_business_id: businessId,
      },
      transaction: t,
    });

    // Lock row for safe increment
    await InvoiceNumberGenerator.findOne({
      where: { invoice_number_generator_id: row.invoice_number_generator_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    await row.increment(fieldName, { by: 1, transaction: t });
    await row.reload({ transaction: t });

    return  `${prefix}/${row[fieldName]}${suffix}`
  });
}

module.exports = { generateNumber };
