const sequelize = require("../../config/db");
const { getCreatedBy } = require("../helper/CurrentUser");
const { saveImage, deleteImage } = require("../helper/fileUpload");
const Product = require("./product_model");

const store = async (req, res) => {
  try {
    let {
      product_name,
      product_tax,
      product_brand,
      product_usage_type,
      product_created_by,
      product_category,
      product_description,
      product_purchase_price,
      product_sale_price,
      product_mrp,
      product_status,
    } = req.body;

    let product_images = [];
    product_created_by = getCreatedBy(req.currentUser);
    if (req.files && req.files.product_img) {
      const files = Array.isArray(req.files.product_img)
        ? req.files.product_img
        : [req.files.product_img];

      for (const file of files) {
        const savedPath = await saveImage(file, "product_images");
        product_images.push(savedPath);
      }
    }

    const productData = await Product.create({
      product_name,
      product_tax,
      product_brand,
      product_created_by,
      product_description,
      product_usage_type,
      product_category,
      product_image: JSON.stringify(product_images),
      product_purchase_price,
      product_sale_price,
      product_mrp,
      product_status,
    });

    res.status(201).json({
      message: "✅ Product created successfully",
      data: productData,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({
      message: "Error creating product",
      error: error.message,
    });
  }
};

const index = async (req, res) => {
  try {
    const products = await sequelize.query(
      `
      SELECT 
        pro.*,
        tx.tax_name,
        tx.tax_percentage,
        cat.category_name,
        br.brand_name
      FROM tbl_products AS pro
      LEFT JOIN tbl_taxes AS tx ON pro.product_tax = tx.tax_id
      LEFT JOIN tbl_categories AS cat ON pro.product_category = cat.category_id
      LEFT JOIN tbl_brands AS br ON pro.product_brand = br.brand_id
      WHERE pro.product_created_by = :created_by
      ORDER BY pro.product_id DESC
      `,
      {
        replacements: { created_by: getCreatedBy(req.currentUser) },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

const RepairandSaleProduct = async (req, res) => {
  try {
    const products = await sequelize.query(
      `
      SELECT 
        pro.*,
        tx.tax_name,
        tx.tax_percentage,
        cat.category_name,
        br.brand_name
      FROM tbl_products AS pro
      LEFT JOIN tbl_taxes AS tx ON pro.product_tax = tx.tax_id
      LEFT JOIN tbl_categories AS cat ON pro.product_category = cat.category_id
      LEFT JOIN tbl_brands AS br ON pro.product_brand = br.brand_id
      WHERE pro.product_created_by = :created_by
        AND pro.product_usage_type IN ('repair', 'both')
      ORDER BY pro.product_id DESC
      `,
      {
        replacements: { created_by: getCreatedBy(req.currentUser) },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};
const  SaleAndBothProduct = async (req, res) => {
  try {
    const products = await sequelize.query(
      `
      SELECT 
        pro.*,
        tx.tax_name,
        tx.tax_percentage,
        cat.category_name,
        br.brand_name
      FROM tbl_products AS pro
      LEFT JOIN tbl_taxes AS tx ON pro.product_tax = tx.tax_id
      LEFT JOIN tbl_categories AS cat ON pro.product_category = cat.category_id
      LEFT JOIN tbl_brands AS br ON pro.product_brand = br.brand_id
      WHERE pro.product_created_by = :created_by
        AND pro.product_usage_type IN ('sale', 'both')
      ORDER BY pro.product_id DESC
      `,
      {
        replacements: { created_by: getCreatedBy(req.currentUser) },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};
const Get = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { product_id } = req.body;

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let oldImages = [];
    try {
      oldImages = JSON.parse(product.product_image || "[]");
      for (const img of oldImages) {
        await deleteImage("product_images", img);
      }
    } catch (err) {
      console.error("❌ Failed to delete old images:", err);
    }

    let newImages = [];
    if (req.files && req.files["product_image[]"]) {
      const files = Array.isArray(req.files["product_image[]"])
        ? req.files["product_image[]"]
        : [req.files["product_image[]"]];

      for (const file of files) {
        const savedName = await saveImage(file, "product_images");
        newImages.push(savedName);
      }
    }

    await product.update({
      ...req.body,
      product_image: JSON.stringify(newImages),
    });

    res.status(200).json({
      message: "✅ Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({
      message: "Error updating product",
      error: error.message,
    });
  }
};





const deleted = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.product_image) {
      await deleteImage("product_images", product.product_image);
    }

    await product.destroy();

    res.status(200).json({ message: "🗑️ Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
  RepairandSaleProduct,
  SaleAndBothProduct,
};
