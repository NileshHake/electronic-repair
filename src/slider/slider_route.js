const express = require("express");
const router = express.Router();
const controller = require("./slider_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.post("/slider/store", verifyToken, controller.store);
router.get("/slider/list", controller.index); 
router.get("/slider/product-list", controller.Prodcutindex); 
router.get("/slider/web/list", controller.InWebindex); 
router.get("/slider/home-list", controller.Webindex); 
router.get("/slider/single/:id", controller.get);
router.put("/slider/update", verifyToken, controller.update);
router.delete("/slider/delete/:id", verifyToken, controller.delete);

module.exports = router;
