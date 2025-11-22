const express = require("express");
const router = express.Router();
const controller = require("./work_flow_controller");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

router.get("/workflow/list", verifyToken, controller.index);
router.post("/workflow/store", verifyToken, controller.store);
router.put("/workflow/update", verifyToken, controller.update);
router.delete("/workflow/delete/:id", verifyToken, controller.deleted);

router.get("/workflow/stage/list/:id", verifyToken, controller.indexStage);
router.post("/workflow/stage/store", verifyToken, controller.storeStage);
router.put("/workflow/stage/update", verifyToken, controller.updateStage);
router.delete(
  "/workflow/stage/delete/:id",
  verifyToken,
  controller.deletedStage
);

module.exports = router;
