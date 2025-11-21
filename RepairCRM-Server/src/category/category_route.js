const express = require("express");
const router = express.Router();
const controller = require("./category_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/category/store",verifyToken, controller.store);
router.get("/category/list", verifyToken ,controller.index);
router.get("/category/single/:id", verifyToken ,controller.Get);
router.put("/category/update", verifyToken ,controller.update);
router.delete("/category/delete/:id", verifyToken ,controller.deleted);

module.exports = router;
