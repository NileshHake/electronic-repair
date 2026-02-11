const { getCreatedBy } = require("../helper/CurrentUser");
const Ram = require("./ram_model");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const ram = await Ram.create({
      ...req.body,
      ram_created_by: getCreatedBy(req.currentUser),
    });

    res.status(201).json({ message: "RAM created successfully", data: ram });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating RAM",
      error: error.message,
    });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const rams = await Ram.findAll({
      where: { ram_created_by: getCreatedBy(req.currentUser) },
      order: [["ram_id", "ASC"]],
    });

    res.status(200).json(rams);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching RAM list",
      error: error.message,
    });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const ram = await Ram.findByPk(req.params.id);

    if (!ram) return res.status(404).json({ message: "RAM not found" });

    // ✅ optional: ownership check
    if (Number(ram.ram_created_by) !== Number(getCreatedBy(req.currentUser))) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(ram);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching RAM",
      error: error.message,
    });
  }
};

// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const ram = await Ram.findByPk(req.body.ram_id);

    if (!ram) return res.status(404).json({ message: "RAM not found" });

    // ✅ optional: ownership check
    if (Number(ram.ram_created_by) !== Number(getCreatedBy(req.currentUser))) {
      return res.status(403).json({ message: "Access denied" });
    }

    await ram.update(req.body);

    res.status(200).json({ message: "RAM updated successfully", data: ram });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating RAM",
      error: error.message,
    });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    const ram = await Ram.findByPk(req.params.id);

    if (!ram) return res.status(404).json({ message: "RAM not found" });

    // ✅ optional: ownership check
    if (Number(ram.ram_created_by) !== Number(getCreatedBy(req.currentUser))) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Ram.destroy({ where: { ram_id: req.params.id } });

    res.status(200).json({ message: "RAM deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting RAM",
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
