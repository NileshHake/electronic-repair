const express = require("express");
const router = express.Router();
const controller = require("./device_color_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

// 🟢 CREATE
router.post("/device-color/store", verifyToken, controller.store);

// 🟡 READ ALL
router.get("/device-color/list", verifyToken, controller.index);

// 🔵 READ SINGLE
router.get("/device-color/single/:id", verifyToken, controller.Get);

// 🟠 UPDATE
router.put("/device-color/update", verifyToken, controller.update);

// 🔴 DELETE
router.delete("/device-color/delete/:id", verifyToken, controller.deleted);

module.exports = router;
