const express = require("express");
const router = express.Router();
const controller = require("./recovery_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/recovery/store", verifyToken, controller.store);
router.post("/recovery/list", verifyToken, controller.index);
router.get("/recovery/single/:id", verifyToken, controller.Get);
router.get("/recovery/my", verifyToken, controller.indexCustomerOnly);

router.put("/recovery/update", verifyToken, controller.update);
router.delete("/recovery/delete/:id", verifyToken, controller.deleted);

module.exports = router;
                 