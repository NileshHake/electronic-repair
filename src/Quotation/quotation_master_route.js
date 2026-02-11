const express = require("express");
const router = express.Router();
const controller = require("./quotation_master_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

/* 🟢 CREATE */
router.post("/quotation/store", verifyToken, controller.store);

/* 🟡 READ ALL */
router.post("/quotation/list", verifyToken, controller.index);
router.post("/quotation/child-list", verifyToken, controller.indexchild);

/* 🔵 READ SINGLE */
router.get("/quotation/single/:id", verifyToken, controller.get);

/* 🟠 UPDATE */
router.put("/quotation/update", verifyToken, controller.update);
router.put("/quotation/master-update", verifyToken, controller.masterUpdate);

/* 🔴 DELETE */
router.delete("/quotation/delete/:id", verifyToken, controller.deleted);
/* 🟢 CUSTOMER QUOTATION LIST */
router.get(
  "/quotation/customer-list",
  verifyToken,
  controller.customerQuotations
);
router.get("/quotation/:id/invoice", verifyToken, controller.quotationInvoicePdf);

module.exports = router;
