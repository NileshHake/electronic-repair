const express = require("express");
const router = express.Router();
const controller = require("./service_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/service/store", verifyToken, controller.store);
router.get("/service/list", verifyToken, controller.index);
router.get("/service/single/:id", verifyToken, controller.Get);
router.put("/service/update", verifyToken, controller.update);
router.delete("/service/delete/:id", verifyToken, controller.deleted);

module.exports = router;
