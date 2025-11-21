const express = require("express");
const router = express.Router();
const controller = require("./customer_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/customer/store",verifyToken ,controller.store);
router.get("/customer/list", verifyToken ,controller.index);
router.get("/customer/single/:id", verifyToken ,controller.Get);
router.put("/customer/update", verifyToken ,controller.update);
router.delete("/customer/delete/:id", verifyToken ,controller.deleted);

module.exports = router;
