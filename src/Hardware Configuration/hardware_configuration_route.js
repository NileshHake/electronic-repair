const express = require("express");
const router = express.Router();
const controller = require("./hardware_configuration_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

// 🟢 CREATE
router.post("/hardware-configuration/store", verifyToken, controller.store);

// 🟡 READ ALL
router.get("/hardware-configuration/list", verifyToken, controller.index);

// 🔵 READ SINGLE
router.get("/hardware-configuration/single/:id", verifyToken, controller.Get);

// 🟠 UPDATE
router.put("/hardware-configuration/update", verifyToken, controller.update);

// 🔴 DELETE
router.delete("/hardware-configuration/delete/:id", verifyToken, controller.deleted);

module.exports = router;
