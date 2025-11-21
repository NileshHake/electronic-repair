const express = require("express");
const router = express.Router();
const controller = require("./accessories_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

// 🟢 CREATE
router.post("/accessories/store", verifyToken, controller.store);

// 🟡 READ ALL
router.get("/accessories/list", verifyToken, controller.index);

// 🔵 READ SINGLE
router.get("/accessories/single/:id", verifyToken, controller.Get);

// 🟠 UPDATE
router.put("/accessories/update", verifyToken, controller.update);

// 🔴 DELETE
router.delete("/accessories/delete/:id", verifyToken, controller.deleted);

module.exports = router;
