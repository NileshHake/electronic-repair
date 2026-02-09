const express = require("express");
const router = express.Router();

const controller = require("./generation_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/generation/store", verifyToken, controller.store);
router.get("/generation/list", verifyToken, controller.index);
router.get("/generation/single/:id", verifyToken, controller.Get);
router.put("/generation/update", verifyToken, controller.update);
router.delete("/generation/delete/:id", verifyToken, controller.deleted);

module.exports = router;
