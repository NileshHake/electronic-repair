const { getCreatedBy } = require("../helper/CurrentUser");
const Brand = require("./brand_model");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const brand = await Brand.create({
      ...req.body,
      brand_created_by: getCreatedBy(req.currentUser),
    });
    res
      .status(201)
      .json({ message: "Brand created successfully", data: brand });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ message: "Error creating brand", error: error.message });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const brands = await Brand.findAll();
    res.status(200).json(brands);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching brands", error: error.message });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.status(200).json(brand);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching brand", error: error.message });
  }
};

// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.body.brand_id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    await brand.update(req.body);
    res
      .status(200)
      .json({ message: "Brand updated successfully", data: brand });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating brand", error: error.message });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    const deleted = await Brand.destroy({ where: { brand_id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Brand not found" });
    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting brand", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
