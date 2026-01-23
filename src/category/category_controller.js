const { Op } = require("sequelize");
const { getCreatedBy } = require("../helper/CurrentUser");
const { saveImage, deleteImage } = require("../helper/fileUpload");
const Category = require("./category_model");
const sequelize = require("../../config/db");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const file = req.files?.category_img;
    let savedPath = null;

    if (file) {
      savedPath = await saveImage(file, "category_img");
    }
    const category = await Category.create({
      ...req.body,
      category_img: savedPath,
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
         
        category_main_id: {
          [Op.or]: [0, null],
        },
      },
    });
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};
const getSubCategories = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategories = await Category.findAll({
      where: {
        category_main_id: id, // only subcategories of this main category
      },
    });

    res.status(200).json(subCategories);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching subcategories", error: error.message });
  }
};
const getCategoriesWithSub = async (req, res) => {
  try {

    // 1️⃣ Main categories with product count
    const mainCategories = await sequelize.query(
      `
      SELECT 
        c.*,
        COUNT(p.product_id) AS product_count
      FROM tbl_categories AS c
      LEFT JOIN tbl_products AS p 
        ON p.product_category = c.category_id
      WHERE c.category_main_id IS NULL
      GROUP BY c.category_id
      ORDER BY c.category_id DESC
      `,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // 2️⃣ Attach subcategories
    const categoriesWithChildren = await Promise.all(
      mainCategories.map(async (mainCat) => {
        const subCategories = await sequelize.query(
          `
          SELECT *
          FROM tbl_categories
          WHERE category_main_id = :mainCategoryId
          `,
          {
            replacements: { mainCategoryId: mainCat.category_id },
            type: sequelize.QueryTypes.SELECT,
          }
        );

        return {
          ...mainCat,
          children: subCategories,
        };
      })
    );

    res.status(200).json(categoriesWithChildren);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching categories with subcategories",
      error: error.message,
    });
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
    const file = req.files?.category_img;

    const category = await Category.findByPk(req.body.category_id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    let category_img = category.category_img; // default old image

    // 🔥 If new image uploaded
    if (file) {
      // Delete old image if exists
      if (category.category_img) {
        deleteImage("category_img", category.category_img);
      }

      // Save new image
      category_img = await saveImage(file, "category_img");
    }

    // Update category
    await category.update({
      ...req.body,
      category_img, // updated OR old
    });

    res.status(200).json({
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error updating category",
      error: error.message,
    });
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
  getSubCategories,
  getCategoriesWithSub,
  Get,
  update,
  deleted,
};
