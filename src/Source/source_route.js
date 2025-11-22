const express = require("express");
const router = express.Router();
const controller = require("./source_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

// 🟢 CREATE
router.post("/source/store", verifyToken, controller.store);

// 🟡 READ ALL
router.get("/source/list", verifyToken, controller.index);

// 🔵 READ SINGLE
router.get("/source/single/:id", verifyToken, controller.Get);

// 🟠 UPDATE
router.put("/source/update", verifyToken, controller.update);

// 🔴 DELETE
router.delete("/source/delete/:id", verifyToken, controller.deleted);

module.exports = router;
