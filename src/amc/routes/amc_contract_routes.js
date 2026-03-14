const express = require("express");
const router = express.Router();

const controller = require("../controllers/amc_contract_controller");
const { verifyToken } = require("../../auth/Middleware/authMiddleware");

router.post("/amc-contract/store", verifyToken, controller.store);
router.get("/amc-contract/list", verifyToken, controller.index);
router.get("/amc-contract/single/:id", verifyToken, controller.Get);
router.put("/amc-contract/update", verifyToken, controller.update);
router.delete("/amc-contract/delete/:id", verifyToken, controller.deleted);

module.exports = router;