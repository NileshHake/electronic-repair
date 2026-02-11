const { getCreatedBy } = require("../helper/CurrentUser");
const DeviceModel = require("./device_model_model");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const deviceModel = await DeviceModel.create({
      ...req.body,
      device_model_created_by: getCreatedBy(req.currentUser),
    });

    res.status(201).json({ message: "Device Model created successfully", data: deviceModel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating device model", error: error.message });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const deviceModels = await DeviceModel.findAll({
      where: {
        device_model_created_by: getCreatedBy(req.currentUser),
      },
      order: [["device_model_id", "ASC"]],
    });

    res.status(200).json(deviceModels);
  } catch (error) {
    res.status(500).json({ message: "Error fetching device models", error: error.message });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const deviceModel = await DeviceModel.findByPk(req.params.id);
    if (!deviceModel)
      return res.status(404).json({ message: "Device Model not found" });

    res.status(200).json(deviceModel);
  } catch (error) {
    res.status(500).json({ message: "Error fetching device model", error: error.message });
  }
};

// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const deviceModel = await DeviceModel.findByPk(req.body.device_model_id);

    if (!deviceModel)
      return res.status(404).json({ message: "Device Model not found" });

    await deviceModel.update(req.body);
    res.status(200).json({ message: "Device Model updated successfully", data: deviceModel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating device model", error: error.message });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    const deleted = await DeviceModel.destroy({
      where: { device_model_id: req.params.id },
    });

    if (!deleted)
      return res.status(404).json({ message: "Device Model not found" });

    res.status(200).json({ message: "Device Model deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting device model", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
