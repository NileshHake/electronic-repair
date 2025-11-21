const { getCreatedBy } = require("../helper/CurrentUser");
const DeviceColor = require("./device_color_model");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const deviceColor = await DeviceColor.create({
      ...req.body,
      device_color_created_by: getCreatedBy(req.currentUser),
    });

    res.status(201).json({
      message: "Device color created successfully",
      data: deviceColor,
    });
  } catch (error) {
    console.error("Error creating device color:", error);
    res.status(500).json({
      message: "Error creating device color",
      error: error.message,
    });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const deviceColors = await DeviceColor.findAll({
      where: { device_color_created_by: getCreatedBy(req.currentUser) },
    });

    res.status(200).json(deviceColors);
  } catch (error) {
    console.error("Error fetching device colors:", error);
    res.status(500).json({
      message: "Error fetching device colors",
      error: error.message,
    });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const deviceColor = await DeviceColor.findByPk(req.params.id);

    if (!deviceColor)
      return res.status(404).json({ message: "Device color not found" });

    res.status(200).json(deviceColor);
  } catch (error) {
    console.error("Error fetching device color:", error);
    res.status(500).json({
      message: "Error fetching device color",
      error: error.message,
    });
  }
};

// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const deviceColor = await DeviceColor.findByPk(req.body.device_color_id);

    if (!deviceColor)
      return res.status(404).json({ message: "Device color not found" });

    await deviceColor.update(req.body);

    res.status(200).json({
      message: "Device color updated successfully",
      data: deviceColor,
    });
  } catch (error) {
    console.error("Error updating device color:", error);
    res.status(500).json({
      message: "Error updating device color",
      error: error.message,
    });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    const deleted = await DeviceColor.destroy({
      where: { device_color_id: req.params.id },
    });

    if (!deleted)
      return res.status(404).json({ message: "Device color not found" });

    res.status(200).json({ message: "Device color deleted successfully" });
  } catch (error) {
    console.error("Error deleting device color:", error);
    res.status(500).json({
      message: "Error deleting device color",
      error: error.message,
    });
  }
};

module.exports = { store, index, Get, update, deleted };
