const { getCreatedBy } = require("../helper/CurrentUser");
const Category = require("./category_model");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const category = await Category.create({
      ...req.body,
      category_created_by: getCreatedBy(req.currentUser),
    });
    res
      .status(201)
      .json({ message: "Category created successfully", data: category });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ message: "Error creating category", error: error.message });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: {
        category_created_by: getCreatedBy(req.currentUser),
      },
    });
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching category", error: error.message });
  }
};

// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.body.category_id);

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    await category.update(req.body);
    res
      .status(200)
      .json({ message: "Category updated successfully", data: category });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ message: "Error updating category", error: error.message });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    const deleted = await Category.destroy({
      where: { category_id: req.params.id },
    });
    if (!deleted)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting category", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
