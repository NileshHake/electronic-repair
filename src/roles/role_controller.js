const Role = require("./role_model");
const RoleHasPermission = require("./role_has_permission_model");
const DB = require("../../config/db");
const { QueryTypes, Op } = require("sequelize");
const sequelize = require("../../config/db");
const { getCreatedBy } = require("../helper/CurrentUser");

async function createRole(req, res) {
  try {
    const role_name = req.body.role_name;
    const permissionsLists = req.body["permissionsLists[]"];
    const role = await Role.create({
      role_name,
      role_created_by: getCreatedBy(req.currentUser),
    });
    if (permissionsLists && permissionsLists.length > 0) {
      for (const permissionId of permissionsLists) {
        await RoleHasPermission.create({
          rhp_role_id: role.role_id,
          rhp_permission_id: permissionId,
        });
      }
    }

    return res.json({ code: 1, message: "Role created successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message, code: 123 });
  }
}

async function updateRole(req, res) {
  try {
    const { role_name, role_id } = req.body;

    const permissionList =
      req.body.permissionList || req.body["permissionList[]"] || [];

    const role = await Role.findByPk(role_id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    // Update role name
    role.role_name = role_name;
    await role.save();

    // Remove old permissions
    await RoleHasPermission.destroy({ where: { rhp_role_id: role_id } });

    // Add new permissions
    for (const permissionId of permissionList) {
      await RoleHasPermission.create({
        rhp_role_id: role_id,
        rhp_permission_id: permissionId,
      });
    }

    res.json({ message: "Role updated successfully!", status: 1 });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: error.message });
  }
}

async function getAllRoles(req, res) {
  try {
    const roles = await Role.findAll({
      where: {
        role_created_by: getCreatedBy(req.currentUser),
        role_id: {
          [Op.notIn]: [1, 2],
        },
      },
    });
    res.status(200).json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}

async function getRoleById(req, res) {
  try {
    const roleId = req.params.id;

    const role = await Role.findByPk(roleId);
    if (!role) return res.status(404).json({ message: "Role not found" });

    const permissions = await DB.query(
      `
      SELECT * 
      FROM tbl_role_has_permissions AS rhp
      INNER JOIN tbl_permissions AS p 
        ON rhp.rhp_permission_id = p.permission_id
      WHERE rhp.rhp_role_id = :roleId
      `,
      {
        replacements: { roleId },
        type: QueryTypes.SELECT,
      }
    );

    res.json({ role, permissions });
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ error: "Failed to fetch role and permissions." });
  }
}

async function deleteRole(req, res) {
  try {
    const roleId = req.params.id;
    const role = await Role.findByPk(roleId);

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    await RoleHasPermission.destroy({ where: { rhp_role_id: roleId } });
    await role.destroy();

    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to delete the role" });
  }
}

async function getPermissionsList(req, res) {
  try {
    const { role_id } = req.params;

    const PermissionData = await sequelize.query(
      `
      SELECT *
      FROM tbl_role_has_permissions AS rhp
      INNER JOIN tbl_permission AS p
        ON rhp.rhp_permission_id = p.permission_id
      WHERE rhp.rhp_role_id = :role_id
      `,
      {
        replacements: { role_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return res.json(PermissionData);
  } catch (error) {
    console.error("Error fetching permissions list:", error);
    return res
      .status(500)
      .json({ code: 0, error: "Failed to fetch permissions list." });
  }
}
async function getRoleForPermissionsList(req, res) {
  try {
    const { role_id } = req.params;
    const PermissionData = await sequelize.query(
      `
      SELECT *
      FROM tbl_role_has_permissions AS rhp
      INNER JOIN tbl_permission AS p
        ON rhp.rhp_permission_id = p.permission_id
      WHERE rhp.rhp_role_id = :role_id
      `,
      {
        replacements: { role_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return res.json(PermissionData);
  } catch (error) {
    console.error("Error fetching permissions list:", error);
    return res
      .status(500)
      .json({ code: 0, error: "Failed to fetch permissions list." });
  }
}
module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getPermissionsList,
  getRoleForPermissionsList,
};
