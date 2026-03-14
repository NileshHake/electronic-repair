const express = require("express");
const router = express.Router();

const controller = require("../controllers/amc_quotation_controller");
const { verifyToken } = require("../../auth/Middleware/authMiddleware");

router.post("/amc-quotation/store", verifyToken, controller.store);

router.get("/amc-quotation/list", verifyToken, controller.index);

router.get("/amc-quotation/details/:id", verifyToken, controller.Get);
router.get("/amc-quotation/child-list/:id", verifyToken, controller.GetchildGet);


router.put("/amc-quotation/update", verifyToken, controller.update);
router.put("/amc-quotation-status/update", verifyToken, controller.statusupdate);

router.delete("/amc-quotation/delete/:id", verifyToken, controller.deleted);

module.exports = router;