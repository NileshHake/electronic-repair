const express = require("express");
const router = express.Router();
const controller = require("./brand_controller");
const { verify } = require("jsonwebtoken");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/brand/store", verifyToken, controller.store);
router.get("/brand/list",  controller.index);
router.get("/brand/single/:id", controller.Get);
router.put("/brand/update", controller.update);
router.delete("/brand/delete/:id", controller.deleted);

module.exports = router;
