const express = require("express");
const router = express.Router();
const permissionController = require("./permission_controller");
const { verify } = require("jsonwebtoken");
const { verifyToken } = require("../auth/Middleware/authMiddleware");

// Create a new permission
router.post("/permissions", permissionController.createPermission);

// Get all permissions
router.get("/permissions", verifyToken, permissionController.getAllPermissions);

// Get a single permission by ID
router.get("/permissions/:id", permissionController.getPermissionById);

// Update a permission by ID
router.put("/permissions/:id", permissionController.updatePermission);

// Delete a permission by ID
router.delete("/permissions/:id", permissionController.deletePermission);
 

module.exports = router;
