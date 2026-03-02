const express = require("express");
const router = express.Router(); 
const controller = require("./rental_request_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/rental-request/store", verifyToken, controller.store);
router.get("/rental-request/list", controller.index);
router.get("/rental-request/single/:id", verifyToken, controller.Get);
router.put("/rental-request/update", verifyToken, controller.update);
router.delete("/rental-request/delete/:id", verifyToken, controller.deleted);

module.exports = router;