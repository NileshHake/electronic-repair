const express = require('express');
const router = express.Router();
const roleController = require('./role_controller');
const { verifyToken } = require('../auth/Middleware/authMiddleware');

// Create a new role
router.post('/role/store', verifyToken,  roleController.createRole);

// Get all roles
router.get('/role/list', verifyToken,  roleController.getAllRoles);

// Get a single role by ID
router.get('/role/show/:id', verifyToken,  roleController.getRoleById);

// Update a role by ID
router.put('/role/update', verifyToken,  roleController.updateRole);

// GET PERMISSIONS LIST BY ROLE ID
router.get("/get/permissions/:role_id",   roleController.getPermissionsList)
router.get("/get/assigned/permissions/:role_id",   roleController.getRoleForPermissionsList)


// Delete a role by ID
router.delete('/role/delete/:id', verifyToken,  roleController.deleteRole);
module.exports = router;