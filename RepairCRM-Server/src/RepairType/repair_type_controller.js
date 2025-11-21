const { getCreatedBy } = require("../helper/CurrentUser");
const RepairType = require("./repair_type_model");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const repairType = await RepairType.create({
      ...req.body,
      repair_type_created_by: getCreatedBy(req.currentUser),
    });

    res
      .status(201)
      .json({ message: "Repair type created successfully", data: repairType });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating repair type", error: error.message });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const repairTypes = await RepairType.findAll({
      where: {
        repair_type_created_by: getCreatedBy(req.currentUser),
      },
      order: [["repair_type_id", "DESC"]],
    });
    res.status(200).json(repairTypes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching repair types", error: error.message });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const repairType = await RepairType.findByPk(req.params.id);
    if (!repairType)
      return res.status(404).json({ message: "Repair type not found" });

    res.status(200).json(repairType);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching repair type", error: error.message });
  }
};

// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const repairType = await RepairType.findByPk(req.body.repair_type_id);

    if (!repairType)
      return res.status(404).json({ message: "Repair type not found" });

    await repairType.update(req.body);
    res.status(200).json({
      message: "Repair type updated successfully",
      data: repairType,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating repair type", error: error.message });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    const deleted = await RepairType.destroy({
      where: { repair_type_id: req.params.id },
    });

    if (!deleted)
      return res.status(404).json({ message: "Repair type not found" });

    res.status(200).json({ message: "Repair type deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting repair type", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
