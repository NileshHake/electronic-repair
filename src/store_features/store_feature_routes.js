const express = require("express");
const router = express.Router();
const controller = require("./store_feature_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/store-feature/store", verifyToken, controller.store);
router.get("/store-feature/list", controller.index); // public for frontend
router.get("/store-feature/single/:id", controller.Get);
router.put("/store-feature/update", verifyToken, controller.update);
router.delete("/store-feature/delete/:id", verifyToken, controller.deleted);

module.exports = router;

