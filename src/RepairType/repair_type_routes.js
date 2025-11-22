const express = require("express");
const router = express.Router();
const controller = require("./repair_type_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

// 🟢 CREATE
router.post("/repair-type/store", verifyToken, controller.store);

// 🟡 READ ALL
router.get("/repair-type/list", verifyToken, controller.index);

// 🔵 READ SINGLE
router.get("/repair-type/single/:id", verifyToken, controller.Get);

// 🟠 UPDATE
router.put("/repair-type/update", verifyToken, controller.update);

// 🔴 DELETE
router.delete("/repair-type/delete/:id", verifyToken, controller.deleted);

module.exports = router;
