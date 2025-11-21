const express = require("express");
const router = express.Router();
const controller = require("./repair_controller");
const { verify } = require("jsonwebtoken");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/repair/store", verifyToken,controller.store);
router.post("/repair/list", verifyToken ,controller.index);
router.get("/repair/single/:id", verifyToken ,controller.Get);
router.put("/repair/update", verifyToken ,controller.update);
router.delete("/repair/delete/:id", verifyToken ,controller.deleted);

module.exports = router;
        