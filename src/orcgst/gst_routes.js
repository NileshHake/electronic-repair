const express = require("express");
const router = express.Router();
const controller = require("./gst_controller"); 
const { verifyToken } = require("../auth/Middleware/authMiddleware");

// ✅ CREATE / UPDATE (Upsert per user)
router.post("/gst/store", verifyToken, controller.store);

// ✅ READ ALL
router.get("/gst/list", controller.index);

// ✅ READ SINGLE
router.get("/gst/single/:id", verifyToken, controller.Get);

// ✅ READ MY GST (logged in user)
router.get("/gst/my", verifyToken, controller.myGst);

// ✅ UPDATE (by gst_id)
router.put("/gst/update/:id", verifyToken, controller.update);

// ✅ DELETE
router.delete("/gst/delete/:id", verifyToken, controller.deleted);

module.exports = router;