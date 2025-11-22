const express = require("express");
const router = express.Router();
const controller = require("./storage_location_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

// 🟢 CREATE
router.post("/storage-location/store", verifyToken, controller.store);

// 🟡 READ ALL
router.get("/storage-location/list", verifyToken, controller.index);

// 🔵 READ SINGLE
router.get("/storage-location/single/:id", verifyToken, controller.Get);

// 🟠 UPDATE    
router.put("/storage-location/update", verifyToken, controller.update);

// 🔴 DELETE
router.delete("/storage-location/delete/:id", verifyToken, controller.deleted);

module.exports = router;
