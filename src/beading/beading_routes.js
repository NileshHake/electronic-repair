const express = require("express");
const router = express.Router();
const controller = require("./beading_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

/* =====================================================
   ✅ MASTER ROUTES
===================================================== */

router.post("/beading/store", verifyToken, controller.store);
router.get("/beading/list", verifyToken, controller.index);
router.get("/beading/global-list", verifyToken, controller.globalList);
router.get("/beading/single/:id", verifyToken, controller.Get);
router.put("/beading/update", verifyToken, controller.update);
router.delete("/beading/delete/:id", verifyToken, controller.deleted);

/* =====================================================
   ✅ CHILD ROUTES (Vendor Offers)
===================================================== */

/* ➜ Vendor create/update offer (UPSERT) */
router.post(
  "/beading/vendor-offer",
  verifyToken,
  controller.vendorOfferUpsert
);

/* ➜ Get all vendor offers for a request */
router.get(
  "/beading/:beading_request_id/vendor-offers",
  verifyToken,
  controller.vendorOfferListByRequest
);

/* ➜ Get single vendor offer */
router.get(
  "/beading/vendor-offer/:br_vendor_id",
  verifyToken,
  controller.vendorOfferGet
);

/* ➜ Update vendor offer */
router.put(
  "/beading/vendor-offer/update",
  verifyToken,
  controller.vendorOfferUpdate
);

/* ➜ Delete vendor offer */
router.delete(
  "/beading/vendor-offer/delete/:br_vendor_id",
  verifyToken,
  controller.vendorOfferDelete
);

/* =====================================================
   ✅ ACCEPT VENDOR (Customer accepts offer)
===================================================== */

router.put(
  "/beading/vendor-accept",
  verifyToken,
  controller.vendorAccept
);

module.exports = router;