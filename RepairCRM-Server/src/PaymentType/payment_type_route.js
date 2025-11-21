const express = require("express");
const router = express.Router();
const controller = require("./payment_type_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/payment_type/store", verifyToken,controller.store);
router.get("/payment_type/list", verifyToken,controller.index);
router.get("/payment_type/single/:id", verifyToken,controller.Get);
router.put("/payment_type/update", verifyToken,controller.update);
router.delete("/payment_type/delete/:id", verifyToken,controller.deleted);

module.exports = router;
