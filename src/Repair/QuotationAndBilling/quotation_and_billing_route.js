const express = require("express");
const router = express.Router();
const quotationAndBillController = require("../QuotationAndBilling/quotation_and_billing_controller");
const { verifyToken } = require("../../auth/Middleware/authMiddleware");

// Create a new QuotationAndBill
router.post("/quotationAndBill/store", verifyToken, quotationAndBillController.createQuotationAndBill);

// List all QuotationAndBills
router.post("/quotationAndBill/list", verifyToken, quotationAndBillController.getQuotationAndBills);

// Get single QuotationAndBill by ID
router.get("/quotationAndBill/single/:id", verifyToken, quotationAndBillController.getQuotationAndBill);

// Update QuotationAndBill
router.put("/quotationAndBill/updated", verifyToken, quotationAndBillController.updateQuotationAndBill);

// Delete QuotationAndBill
router.delete("/quotationAndBill/delete/:id", verifyToken, quotationAndBillController.deleteQuotationAndBill);

module.exports = router;
