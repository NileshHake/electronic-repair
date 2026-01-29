const express = require("express");
const router = express.Router();
const controller = require("./order_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

// 🟢 CREATE
router.post("/order/store", verifyToken, controller.store);

// 🟡 READ ALL
router.post ("/order/list",   controller.index);
router.post ("/order/child-list",   controller.indexchild);

// 🔵 READ SINGLE
router.get("/order/single/:id", verifyToken, controller.Get);
router.get("/orders/user-list", verifyToken, controller.userOrders);

// 🟠 UPDATE
router.put("/order/update", verifyToken, controller.update);
router.put("/order/master-update", verifyToken, controller.Masterupdate);

// 🔴 DELETE
router.delete("/order/delete/:id", verifyToken, controller.deleted);

module.exports = router;
