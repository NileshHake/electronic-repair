const { getCreatedBy } = require("../helper/CurrentUser");
const HardwareConfiguration = require("./hardware_configuration_model");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const hardware = await HardwareConfiguration.create({
      ...req.body,
      hardware_configuration_created_by: getCreatedBy(req.currentUser),
    });

    res.status(201).json({
      message: "Hardware configuration created successfully",
      data: hardware,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating hardware configuration",
      error: error.message,
    });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const hardwareList = await HardwareConfiguration.findAll({
      where: {
        hardware_configuration_created_by: getCreatedBy(req.currentUser),
      },
      order: [["hardware_configuration_id", "ASC"]],
    });

    res.status(200).json(hardwareList);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching hardware configurations",
      error: error.message,
    });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const hardware = await HardwareConfiguration.findByPk(req.params.id);
    if (!hardware)
      return res
        .status(404)
        .json({ message: "Hardware configuration not found" });

    res.status(200).json(hardware);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching hardware configuration",
      error: error.message,
    });
  }
};

// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const hardware = await HardwareConfiguration.findByPk(
      req.body.hardware_configuration_id
    );

    if (!hardware)
      return res
        .status(404)
        .json({ message: "Hardware configuration not found" });

    await hardware.update(req.body);
    res.status(200).json({
      message: "Hardware configuration updated successfully",
      data: hardware,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating hardware configuration",
      error: error.message,
    });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    const deleted = await HardwareConfiguration.destroy({
      where: { hardware_configuration_id: req.params.id },
    });

    if (!deleted)
      return res
        .status(404)
        .json({ message: "Hardware configuration not found" });

    res
      .status(200)
      .json({ message: "Hardware configuration deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error deleting hardware configuration",
      error: error.message,
    });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
