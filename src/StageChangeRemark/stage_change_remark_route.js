const express = require("express");
const router = express.Router();
const controller = require("./stage_change_remark_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

// 🟢 CREATE
router.post("/stage-remark/store", verifyToken, controller.store);

// 🟡 READ ALL
router.get("/stage-remark/list", verifyToken, controller.index);

// 🔵 READ SINGLE
router.post("/stage-remark", verifyToken, controller.Get);

// 🟠 UPDATE
router.put("/stage-remark/update", verifyToken, controller.update);

// 🔴 DELETE
router.delete("/stage-remark/delete/:id", verifyToken, controller.deleted);

module.exports = router;
