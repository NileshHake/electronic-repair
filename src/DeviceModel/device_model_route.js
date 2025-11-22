const express = require("express");
const router = express.Router();
const controller = require("./device_model_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

// 🟢 CREATE
router.post("/device-model/store", verifyToken, controller.store);

// 🟡 READ ALL
router.get("/device-model/list", verifyToken, controller.index);

// 🔵 READ SINGLE
router.get("/device-model/single/:id", verifyToken, controller.Get);

// 🟠 UPDATE
router.put("/device-model/update", verifyToken, controller.update);

// 🔴 DELETE
router.delete("/device-model/delete/:id", verifyToken, controller.deleted);

module.exports = router;
