const { getCreatedBy } = require("../helper/CurrentUser");
const Accessories = require("./accessories_model");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const accessories = await Accessories.create({
      ...req.body,
      accessories_created_by: getCreatedBy(req.currentUser),
    });

    res.status(201).json({
      message: "Accessory created successfully",
      data: accessories,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating accessory", error: error.message });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const accessories = await Accessories.findAll({
      where: {
        accessories_created_by: getCreatedBy(req.currentUser),
      },
      order: [["accessories_id", "ASC"]],
    });
    res.status(200).json(accessories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching accessories", error: error.message });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const accessories = await Accessories.findByPk(req.params.id);
    if (!accessories)
      return res.status(404).json({ message: "Accessory not found" });

    res.status(200).json(accessories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching accessory", error: error.message });
  }
};

// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const accessories = await Accessories.findByPk(req.body.accessories_id);

    if (!accessories)
      return res.status(404).json({ message: "Accessory not found" });

    await accessories.update(req.body);
    res.status(200).json({
      message: "Accessory updated successfully",
      data: accessories,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating accessory", error: error.message });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    const deleted = await Accessories.destroy({
      where: { accessories_id: req.params.id },
    });

    if (!deleted)
      return res.status(404).json({ message: "Accessory not found" });

    res.status(200).json({ message: "Accessory deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting accessory", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
