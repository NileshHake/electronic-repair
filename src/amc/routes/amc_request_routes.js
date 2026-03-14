const express = require("express");
const router = express.Router();

const controller = require("../controllers/amc_request_controller");
const { verifyToken } = require("../../auth/Middleware/authMiddleware");

router.post("/amc-request/store", verifyToken, controller.store);
router.get("/amc-request/list", verifyToken, controller.index);
router.get("/amc-request/single/:id", verifyToken, controller.Get);
router.put("/amc-request/update", verifyToken, controller.update);
router.put("/amc-request-status/update", verifyToken, controller.Statusupdate);
router.get("/amc-request/child-list/:id", verifyToken, controller.childGet);
router.delete("/amc-request/delete/:id", verifyToken, controller.deleted);

module.exports = router;    