const express = require("express");
const router = express.Router();
const controller = require("./requests_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/requests/store", verifyToken, controller.store);
router.post("/requests/list", verifyToken, controller.index);
router.get("/requests/single/:id", verifyToken, controller.Get);
router.put("/requests/update", verifyToken, controller.update);
router.put("/requests/status-update", verifyToken, controller.statusupdate);
router.delete("/requests/delete/:id", verifyToken, controller.deleted);

module.exports = router;
