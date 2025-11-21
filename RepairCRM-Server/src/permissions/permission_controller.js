const Permission = require("./permission_model");
 
async function createPermission(req, res) {
  try {
    const { name } = req.body;
    const permission = await Permission.create({ name });
    res.status(201).json(permission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to create the permission" });
  }
}

// Get all permissions
async function getAllPermissions(req, res) {
  try {
    let permissions = await Permission.findAll();

    if (req.currentUser.user_type != 1) {
      console.log("true");
      permissions = permissions.filter(
        (f) => f.permission_category !== "BUSINESS"
      );
    }

    res.status(200).json(permissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}

// Get a single permission by ID
async function getPermissionById(req, res) {
  try {
    const permissionId = req.params.id;
    const permission = await Permission.findByPk(permissionId);
    if (permission) {
      res.status(200).json(permission);
    } else {
      res.status(404).json({ error: "Permission not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to retrieve the permission" });
  }
}

// Update a permission by ID
async function updatePermission(req, res) {
  try {
    const permissionId = req.params.id;
    const { name, isSynced } = req.body;
    const permission = await Permission.findByPk(permissionId);
    let updatedIsSynced = isSynced;
    if (isSynced === 2) {
      updatedIsSynced = 3; // Update the variable
    }
    if (permission) {
      permission.name = name;
      permission.isSynced = updatedIsSynced;
      await permission.save();
      res.status(200).json(permission);
    } else {
      res.status(404).json({ error: "Permission not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to update the permission" });
  }
}

// Delete a permission by ID
async function deletePermission(req, res) {
  try {
    const permissionId = req.params.id;
    const permission = await Permission.findByPk(permissionId);
    if (permission) {
      await permission.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Permission not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to delete the permission" });
  }
}

module.exports = {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission, 
};
