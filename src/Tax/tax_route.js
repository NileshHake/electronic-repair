    const express = require("express");
    const router = express.Router();
    const controller = require("./tax_controller");
    const { verify } = require("jsonwebtoken");
    const { verifyToken } = require("../auth/Middleware/authMiddleware");

    router.post("/tax/store",verifyToken, controller.store);
    router.get("/tax/list", verifyToken,controller.index);
    router.get("/tax/single/:id", verifyToken,controller.Get);
    router.put("/tax/update", verifyToken,controller.update);
    router.delete("/tax/delete/:id", verifyToken,controller.deleted);

    module.exports = router;
