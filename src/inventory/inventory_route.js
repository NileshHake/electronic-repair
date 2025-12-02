const express = require("express");
const router = express.Router();
const controller = require("./inventory_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/inventory/store", verifyToken,controller.store);
router.get("/inventory/list", verifyToken,controller.index);
router.get("/inventory/single/:id", verifyToken,controller.Get);
router.put("/inventory/update", verifyToken,controller.update);
router.delete("/inventory/delete/:id", verifyToken,controller.deleted);

module.exports = router;
