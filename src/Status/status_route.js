const express = require("express");
const router = express.Router();
const controller = require("./status_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/status/store", verifyToken, controller.store);
router.get("/status/list",verifyToken, controller.index);
router.get("/status/single/:id",verifyToken, controller.Get);
router.put("/status/update", verifyToken,controller.update);
router.delete("/status/delete/:id",verifyToken, controller.deleted);

module.exports = router;
