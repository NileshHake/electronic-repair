const express = require("express");
const router = express.Router();
const controller = require("./customer_address_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

 
router.post("/customer-address/store", verifyToken, controller.store);

 
router.get("/customer-address/list", verifyToken ,controller.index);
 
router.get("/customer-address/single/:id", verifyToken ,controller.Get);
 
router.put("/customer-address/update", verifyToken ,controller.update);
 
router.delete("/customer-address/delete/:id", verifyToken ,controller.deleted);

module.exports = router;
