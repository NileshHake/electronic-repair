const express = require("express");
const router = express.Router();
const controller = require("./device_type_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

// 🟢 CREATE
router.post("/device-type/store", verifyToken, controller.store);

// 🟡 READ ALL
router.get("/device-type/list",   controller.index);

// 🔵 READ SINGLE
router.get("/device-type/single/:id", verifyToken, controller.Get);

// 🟠 UPDATE
router.put("/device-type/update", verifyToken, controller.update);

// 🔴 DELETE
router.delete("/device-type/delete/:id", verifyToken, controller.deleted);

module.exports = router;
