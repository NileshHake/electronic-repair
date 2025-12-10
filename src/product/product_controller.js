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
      product_color, product_material, product_weight,
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
      product_usage_type: product_usage_type || "sale",
      product_category,
      product_color, product_material, product_weight,
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
    const { category_id, brand_id, product_name } = req.body;

    // Base query
    let query = `
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
    `;

    // Add optional filters only if provided
    const replacements = { created_by: getCreatedBy(req.currentUser) };
    if (category_id) {
      query += ` AND pro.product_category = :category_id`;
      replacements.category_id = category_id;
    }
    if (brand_id) {
      query += ` AND pro.product_brand = :brand_id`;
      replacements.brand_id = brand_id;
    }
    if (product_name) {
      query += ` AND pro.product_name LIKE :product_name`;
      replacements.product_name = `%${product_name}%`;
    }

    query += ` ORDER BY pro.product_id DESC`;

    const products = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

const SaleAndBothProduct = async (req, res) => {
  try {
    const {
      categoryId = 0,
      brandIds = [],
      product_search = "",
      minPrice,
      maxPrice
    } = req.body;

    const createdBy = getCreatedBy(req.currentUser);

    // ----- Base WHERE condition -----
    let baseWhere = `WHERE pro.product_created_by = :created_by
      AND pro.product_usage_type IN ('sale','both')`;

    if (categoryId && categoryId !== 0) baseWhere += ` AND pro.product_category = :categoryId`;
    if (brandIds.length > 0) baseWhere += ` AND pro.product_brand IN (:brandIds)`;
    if (product_search.trim() !== "") baseWhere += ` AND pro.product_name LIKE :product_search`;

    const replacementsBase = {
      created_by: createdBy,
      categoryId: categoryId || null,
      brandIds: brandIds || [],
      product_search: `%${product_search}%`,
    };

    // ----- 1) Get min & max price without price filter -----
    const priceRange = await sequelize.query(
      `SELECT MIN(product_sale_price) AS minPrice, MAX(product_sale_price) AS maxPrice
       FROM tbl_products AS pro
       ${baseWhere}`,
      { replacements: replacementsBase, type: sequelize.QueryTypes.SELECT }
    );

    const { minPrice: dbMinPrice, maxPrice: dbMaxPrice } = priceRange[0];

    // ----- 2) Apply price filter for product listing -----
    const safeMinPrice = minPrice ?? dbMinPrice ?? 0;
    const safeMaxPrice = maxPrice ?? dbMaxPrice ?? 9999999;

    const whereWithPrice = `${baseWhere} AND pro.product_sale_price BETWEEN :minPrice AND :maxPrice`;

    const replacementsFiltered = { ...replacementsBase, minPrice: safeMinPrice, maxPrice: safeMaxPrice };

    // Cheapest product
    const minProduct = await sequelize.query(
      `SELECT pro.*, tx.tax_name, tx.tax_percentage, cat.category_name, br.brand_name
       FROM tbl_products AS pro
       LEFT JOIN tbl_taxes AS tx ON pro.product_tax = tx.tax_id
       LEFT JOIN tbl_categories AS cat ON pro.product_category = cat.category_id
       LEFT JOIN tbl_brands AS br ON pro.product_brand = br.brand_id
       ${whereWithPrice} AND pro.product_sale_price = :minPrice
       LIMIT 1`,
      { replacements: replacementsFiltered, type: sequelize.QueryTypes.SELECT }
    );

    // Most expensive product
    const maxProduct = await sequelize.query(
      `SELECT pro.*, tx.tax_name, tx.tax_percentage, cat.category_name, br.brand_name
       FROM tbl_products AS pro
       LEFT JOIN tbl_taxes AS tx ON pro.product_tax = tx.tax_id
       LEFT JOIN tbl_categories AS cat ON pro.product_category = cat.category_id
       LEFT JOIN tbl_brands AS br ON pro.product_brand = br.brand_id
       ${whereWithPrice} AND pro.product_sale_price = :maxPrice
       LIMIT 1`,
      { replacements: replacementsFiltered, type: sequelize.QueryTypes.SELECT }
    );

    // All filtered products
    const allProducts = await sequelize.query(
      `SELECT pro.*, tx.tax_name, tx.tax_percentage, cat.category_name, br.brand_name
       FROM tbl_products AS pro
       LEFT JOIN tbl_taxes AS tx ON pro.product_tax = tx.tax_id
       LEFT JOIN tbl_categories AS cat ON pro.product_category = cat.category_id
       LEFT JOIN tbl_brands AS br ON pro.product_brand = br.brand_id
       ${whereWithPrice}
       ORDER BY pro.product_id DESC`,
      { replacements: replacementsFiltered, type: sequelize.QueryTypes.SELECT }
    );

    return res.status(200).json({
      min_price: dbMinPrice ?? 0, // updated based on category/brand/search
      max_price: dbMaxPrice ?? 9999999,
      cheapest: minProduct[0] || null,
      expensive: maxProduct[0] || null,
      products: allProducts,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
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
