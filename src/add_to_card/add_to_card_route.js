const express = require("express");
const router = express.Router();
const controller = require("./add_to_card_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/add-to-cart/store", verifyToken, controller.store);
router.get("/add-to-cart/list", verifyToken, controller.index);
router.get("/add-to-cart/single/:id", verifyToken, controller.Get);
router.put("/add-to-cart/update", verifyToken, controller.update);
router.delete("/add-to-cart/delete/:id", verifyToken, controller.deleted);

module.exports = router;
