const express = require("express");
const router = express.Router();
const controller = require("./rental_device_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/rental-device/store", verifyToken, controller.store);
router.get("/rental-device/list", controller.index);
router.get("/rental-device/single/:id", verifyToken, controller.Get);
router.put("/rental-device/update", verifyToken, controller.update);
router.delete("/rental-device/delete/:id", verifyToken, controller.deleted);

module.exports = router;