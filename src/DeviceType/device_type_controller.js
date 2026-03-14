const { QueryTypes } = require("sequelize");
const sequelize = require("../../config/db");
const { getCreatedBy } = require("../helper/CurrentUser");
const DeviceType = require("./device_type_model");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const deviceType = await DeviceType.create({
      ...req.body,
      device_type_created_by: getCreatedBy(req.currentUser),
    });

    res.status(201).json({
      message: "Device type created successfully",
      data: deviceType,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating device type", error: error.message });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const deviceTypes = await DeviceType.findAll();
    res.status(200).json(deviceTypes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching device types", error: error.message });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const deviceType = await DeviceType.findByPk(req.params.id);
    if (!deviceType)
      return res.status(404).json({ message: "Device type not found" });

    res.status(200).json(deviceType);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching device type", error: error.message });
  }
};

const searchDevice = async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT *
      FROM tbl_device_types
      WHERE 1 = 1
    `;

    const replacements = {};

    if (search) {
      query += ` AND device_type_name LIKE :search`;
      replacements.search = `%${search}%`;
    }

    query += ` ORDER BY device_type_id DESC`;

    const result = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    res.status(200).json(result);

  } catch (error) {
    console.log(error);
    
    res.status(500).json({
      message: "Error fetching device types",
      error: error.message,
    });
  }
};

// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const deviceType = await DeviceType.findByPk(req.body.device_type_id);

    if (!deviceType)
      return res.status(404).json({ message: "Device type not found" });

    await deviceType.update(req.body);
    res.status(200).json({
      message: "Device type updated successfully",
      data: deviceType,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating device type", error: error.message });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    const deleted = await DeviceType.destroy({
      where: { device_type_id: req.params.id },
    });

    if (!deleted)
      return res.status(404).json({ message: "Device type not found" });

    res.status(200).json({ message: "Device type deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting device type", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
  searchDevice,
};
