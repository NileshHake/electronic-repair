const express = require("express");
const router = express.Router();

const controller = require("../controllers/amc_service_visit_controller");
const { verifyToken } = require("../../auth/Middleware/authMiddleware");

router.post("/amc-service-visit/store", verifyToken, controller.store);
router.get("/amc-service-visit/list", verifyToken, controller.index);
router.get("/amc-service-visit/single/:id", verifyToken, controller.Get);
router.put("/amc-service-visit/update", verifyToken, controller.update);
router.delete("/amc-service-visit/delete/:id", verifyToken, controller.deleted);

module.exports = router;