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

const LatestProduct = async (req, res) => {
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
       
      ORDER BY pro.product_id DESC
      LIMIT 8
      `,
      {

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
const filterstrendingproduct = async (req, res) => {
  try {
    const query = `
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
      ORDER BY pro.createdAt DESC
      LIMIT 8
    `;

    const products = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

const filterProducts = async (req, res) => {
  try {
    const {
      category_id,
      brand_id,
      min_price,
      max_price,
      product_on_sale,
      sort,
      page = 1,
    } = req.body;

    const limit = 12;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let replacements = { limit, offset };

    // ✅ CATEGORY
    if (category_id) {
      whereConditions.push("pro.product_category = :category_id");
      replacements.category_id = category_id;
    }

    // ✅ BRAND
    if (brand_id) {
      whereConditions.push("pro.product_brand = :brand_id");
      replacements.brand_id = brand_id;
    }

    // ✅ PRICE RANGE
    if (min_price != null && max_price != null) {
      whereConditions.push(
        "pro.product_sale_price BETWEEN :min_price AND :max_price"
      );
      replacements.min_price = min_price;
      replacements.max_price = max_price;
    }

    // ✅ ON SALE FILTER
    if (product_on_sale) {
      whereConditions.push("pro.product_on_sale = 1");
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // ✅ SORT LOGIC
    let orderBy = "pro.product_id DESC";

    if (sort === "low_to_high") {
      orderBy = "pro.product_sale_price ASC";
    }
    else if (sort === "high_to_low") {
      orderBy = "pro.product_sale_price DESC";
    }
    else if (sort === "new") {
      orderBy = "pro.createdAt DESC";
    }
    else if (sort === "sale") {
      orderBy = "pro.product_on_sale DESC";
    }

    // 🔹 TOTAL COUNT
    const totalResult = await sequelize.query(
      `
      SELECT COUNT(*) as total
      FROM tbl_products AS pro
      ${whereClause}
      `,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const totalRecords = totalResult[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    // 🔹 DATA QUERY
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
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      success: true,
      page,
      limit,
      totalRecords,
      totalPages,
      data: products,
    });

  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};




const SearchProducts = async (req, res) => {
  try {
    const { search } = req.body; // or req.body if you want

    const whereCondition = search
      ? `
        WHERE
          LOWER(pro.product_name) LIKE LOWER(:search)
          OR LOWER(cat.category_name) LIKE LOWER(:search)
          OR LOWER(br.brand_name) LIKE LOWER(:search)
      `
      : "";

    const products = await sequelize.query(
      `
      SELECT
        pro.product_id,
        pro.product_name,
        br.brand_id,
        br.brand_name,
        cat.category_id,
        cat.category_name
      FROM tbl_products pro
      INNER JOIN tbl_categories cat
        ON pro.product_category = cat.category_id
      INNER JOIN tbl_brands br
        ON pro.product_brand = br.brand_id
      ${whereCondition}
      ORDER BY pro.product_id DESC
      LIMIT 20
      `,
      {
        replacements: search ? { search: `%${search}%` } : {},
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return res.status(200).json({
      success: true,
      data: products,
    });

  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({
      success: false,
      message: "Search failed",
    });
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
  SearchProducts,
  index,
  Get,
  update,
  deleted,
  RepairandSaleProduct,
  SaleAndBothProduct,
  LatestProduct,
  filterstrendingproduct,
  filterProducts,
};
