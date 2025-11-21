const express = require("express");
const router = express.Router();
const controller = require("./product_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/product/store",verifyToken, controller.store);
router.get("/product/list", verifyToken,controller.index);
router.get("/product/single/:id", verifyToken,controller.Get);
router.put("/product/update", verifyToken,controller.update);
router.delete("/product/delete/:id", verifyToken,controller.deleted);

module.exports = router;
