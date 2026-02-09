const express = require("express");
const router = express.Router();

const controller = require("./ram_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/ram/store", verifyToken, controller.store);
router.get("/ram/list", verifyToken, controller.index);
router.get("/ram/single/:id", verifyToken, controller.Get);
router.put("/ram/update", verifyToken, controller.update);
router.delete("/ram/delete/:id", verifyToken, controller.deleted);

module.exports = router;
