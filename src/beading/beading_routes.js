const express = require("express");
const router = express.Router();
const controller = require("./beading_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/beading/store", verifyToken, controller.store);
router.get("/beading/list", verifyToken, controller.index);
router.get("/beading/global-list", verifyToken, controller.globalList);
router.get("/beading/single/:id", verifyToken, controller.Get);
router.put("/beading/update", verifyToken, controller.update);
router.delete("/beading/delete/:id", verifyToken, controller.deleted);

// ✅ vendor accept
router.put("/beading/vendor-accept", verifyToken, controller.vendorAccept);

module.exports = router;
