const express = require("express");
const router = express.Router();
const controller = require("./services_type_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/service-type/store", verifyToken, controller.store);
router.get("/service-type/list", verifyToken, controller.index);
router.get("/service-type/single/:id", verifyToken, controller.Get);
router.put("/service-type/update", verifyToken, controller.update);
router.delete("/service-type/delete/:id", verifyToken, controller.deleted);

module.exports = router;
