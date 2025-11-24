const express = require("express");
const router = express.Router();
const controller = require("./user_controller");
const { verifyToken } = require("./Middleware/authMiddleware");

router.post("/user/login", controller.login); 
router.post("/user/store", verifyToken, controller.store);
router.get("/user/list", verifyToken, controller.index);
router.get("/technicians/list", verifyToken, controller.Techniciansindex);
router.get("/business/list", verifyToken, controller.Businessindex);
router.get("/delivery/list", verifyToken, controller.Deliveryindex);
router.get("/user/user/list", verifyToken, controller.Userindex);
router.get("/user/single/:id",   controller.Get);
router.put("/user/update", verifyToken, controller.update);
router.delete("/user/delete/:id", verifyToken, controller.deleted);
router.put("/update-password", verifyToken, controller.updatePassword);

module.exports = router;
