const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

// ✅ IMPORTANT: import sequelize instance
const sequelize = require("../../config/db"); // <-- adjust path (where your sequelize instance is)
const User = require("../auth/user_model");
const Permission = require("../permissions/permission_model");
const RoleHasPermission = require("../roles/role_has_permission_model");
const Role = require("../roles/role_model");
const WorkflowMaster = require("../WorkFLow/work_flow_master_model");
const WorkflowChild = require("../WorkFLow/work_flow_child_model");
const Accessories = require("../Accessories/accessories_model");
const Brand = require("../Brands/brand_model");
const DeviceColor = require("../Device Color/device_color_model");
const DeviceType = require("../DeviceType/device_type_model");
const RepairType = require("../RepairType/repair_type_model");
const ServicesType = require("../ServicesType/services_type_model");
const Source = require("../Source/source_model");
const StorageLocation = require("../StorageLocation/storage_location_model");
const Product = require("../product/product_model");
const Category = require("../category/category_model");
const Slider = require("../slider/slider_model");
const StoreFeature = require("../store_features/store_feature_model");
const Generations = require("../Generation/generation_model");
const Ram = require("../Ram/ram_model");

const createSuperAdmin = async () => {
  const t = await sequelize.transaction();

  try {
    /* =========================
      1) SUPER ADMIN
    ========================= */
    const hashedPassword = await bcrypt.hash("super@nbh.com", 10);

    const superAdmin = await User.create(
      {
        user_name: "Super Admin",
        user_email: "super@nbh.com",
        user_type: 1,
        user_created_by: 1,
        user_role_id: 1,
        user_password: hashedPassword,
      },
      { transaction: t }
    );

    /* =========================
      2) PERMISSIONS
    ========================= */
    const staticpermissions = [
      { permission_name: "Dashboard", permission_path: 1, permission_category: "DASHBOARD" },
      { permission_name: "Inquiry", permission_path: 1, permission_category: "INQUIRY" },

      { permission_name: "List", permission_path: 1, permission_category: "CUSTOMER" },
      { permission_name: "Create", permission_path: 2, permission_category: "CUSTOMER" },
      { permission_name: "Update", permission_path: 3, permission_category: "CUSTOMER" },
      { permission_name: "Delete", permission_path: 4, permission_category: "CUSTOMER" },

      { permission_name: "List", permission_path: 1, permission_category: "BUSINESS" },
      { permission_name: "Create", permission_path: 2, permission_category: "BUSINESS" },
      { permission_name: "Update", permission_path: 3, permission_category: "BUSINESS" },
      { permission_name: "Delete", permission_path: 4, permission_category: "BUSINESS" },

      { permission_name: "List", permission_path: 1, permission_category: "REPAIRING" },
      { permission_name: "Create", permission_path: 2, permission_category: "REPAIRING" },
      { permission_name: "Update", permission_path: 3, permission_category: "REPAIRING" },
      { permission_name: "Delete", permission_path: 4, permission_category: "REPAIRING" },

      { permission_name: "List", permission_path: 1, permission_category: "QUOTATION_BILLING" },
      { permission_name: "Create", permission_path: 2, permission_category: "QUOTATION_BILLING" },
      { permission_name: "Update", permission_path: 3, permission_category: "QUOTATION_BILLING" },
      { permission_name: "Delete", permission_path: 4, permission_category: "QUOTATION_BILLING" },

      { permission_name: "List", permission_path: 1, permission_category: "PRODUCT" },
      { permission_name: "Create", permission_path: 2, permission_category: "PRODUCT" },
      { permission_name: "Update", permission_path: 3, permission_category: "PRODUCT" },
      { permission_name: "Delete", permission_path: 4, permission_category: "PRODUCT" },

      { permission_name: "List", permission_path: 1, permission_category: "BEADING" },

      { permission_name: "List", permission_path: 1, permission_category: "REQ_TO_SUPPLIER" },
      { permission_name: "Create", permission_path: 2, permission_category: "REQ_TO_SUPPLIER" },
      { permission_name: "Update", permission_path: 3, permission_category: "REQ_TO_SUPPLIER" },
      { permission_name: "Delete", permission_path: 4, permission_category: "REQ_TO_SUPPLIER" },

      { permission_name: "List", permission_path: 1, permission_category: "SUPPLIER" },
      { permission_name: "Create", permission_path: 2, permission_category: "SUPPLIER" },
      { permission_name: "Update", permission_path: 3, permission_category: "SUPPLIER" },
      { permission_name: "Delete", permission_path: 4, permission_category: "SUPPLIER" },

      { permission_name: "Roles", permission_path: 1, permission_category: "USERMANAGEMENT" },
      { permission_name: "Users", permission_path: 2, permission_category: "USERMANAGEMENT" },
      { permission_name: "Technicians", permission_path: 3, permission_category: "USERMANAGEMENT" },
      { permission_name: "Delivery /Pick-Up Boy", permission_path: 4, permission_category: "USERMANAGEMENT" },

      { permission_name: "All Orders", permission_path: 1, permission_category: "ORDERTRACKING" },
      { permission_name: "New Orders", permission_path: 2, permission_category: "ORDERTRACKING" },
      { permission_name: "Approval Orders", permission_path: 3, permission_category: "ORDERTRACKING" },
      { permission_name: "Packing Orders", permission_path: 4, permission_category: "ORDERTRACKING" },
      { permission_name: "Dispatch Orders", permission_path: 5, permission_category: "ORDERTRACKING" },
      { permission_name: "Rejected Orders", permission_path: 6, permission_category: "ORDERTRACKING" },
      { permission_name: "Delivered Orders", permission_path: 7, permission_category: "ORDERTRACKING" },

      { permission_name: "Accessories", permission_path: 1, permission_category: "SETTINGS" },
      { permission_name: "Brand", permission_path: 2, permission_category: "SETTINGS" },
      { permission_name: "Category", permission_path: 3, permission_category: "SETTINGS" },
      { permission_name: "Customer Address", permission_path: 4, permission_category: "SETTINGS" },
      { permission_name: "Device Type", permission_path: 5, permission_category: "SETTINGS" },
      { permission_name: "Payment", permission_path: 6, permission_category: "SETTINGS" },
      { permission_name: "Repair Type", permission_path: 7, permission_category: "SETTINGS" },
      { permission_name: "Service", permission_path: 8, permission_category: "SETTINGS" },
      { permission_name: "Source", permission_path: 9, permission_category: "SETTINGS" },
      { permission_name: "Status", permission_path: 10, permission_category: "SETTINGS" },
      { permission_name: "Tax", permission_path: 11, permission_category: "SETTINGS" },
      { permission_name: "Work Flow", permission_path: 12, permission_category: "SETTINGS" },
      { permission_name: "Device Model", permission_path: 13, permission_category: "SETTINGS" },
      { permission_name: "Services Type", permission_path: 14, permission_category: "SETTINGS" },
      { permission_name: "Storage Location", permission_path: 15, permission_category: "SETTINGS" },
      { permission_name: "Device Color", permission_path: 16, permission_category: "SETTINGS" },
      { permission_name: "Generation", permission_path: 17, permission_category: "SETTINGS" },
      { permission_name: "Ram", permission_path: 18, permission_category: "SETTINGS" },
    ];

    await Permission.bulkCreate(staticpermissions, { transaction: t, ignoreDuplicates: true });

    const allPermissions = await Permission.findAll({ transaction: t });

    /* =========================
      3) ROLES
    ========================= */
    const superRole = await Role.create(
      { role_name: "Super Admin", role_created_by: 1 },
      { transaction: t }
    );

    // give all permissions to super admin
    await RoleHasPermission.bulkCreate(
      allPermissions.map((p) => ({
        rhp_role_id: superRole.role_id,
        rhp_permission_id: p.permission_id,
      })),
      { transaction: t }
    );

    // Admin role (exclude some categories)
    const adminPermissions = allPermissions.filter(
      (p) => !["BUSINESS", "SUPPLIER", "PRODUCT", "SETTINGS"].includes(p.permission_category)
    );

    const adminRole = await Role.create(
      { role_name: "Admin", role_created_by: 1 },
      { transaction: t }
    );

    await RoleHasPermission.bulkCreate(
      adminPermissions.map((p) => ({
        rhp_role_id: adminRole.role_id,
        rhp_permission_id: p.permission_id,
      })),
      { transaction: t }
    );

    // Supplier role
    const supplierPermissions = allPermissions.filter((p) =>
      ["DASHBOARD", "PRODUCT", "REQ_TO_SUPPLIER"].includes(p.permission_category)
    );

    const supplierRole = await Role.create(
      { role_name: "Supplier", role_created_by: 1 },
      { transaction: t }
    );

    await RoleHasPermission.bulkCreate(
      supplierPermissions.map((p) => ({
        rhp_role_id: supplierRole.role_id,
        rhp_permission_id: p.permission_id,
      })),
      { transaction: t }
    );

    /* =========================
      4) WORKFLOW
    ========================= */
    const colorOptions = ["bg-primary", "bg-secondary", "bg-success", "bg-info", "bg-warning", "bg-danger", "bg-dark"];

    const workflow = await WorkflowMaster.create(
      {
        workflow_create_user: 1,
        workflow_name: "Job Processing Workflow",
        workflow_status: 1,
      },
      { transaction: t }
    );

    const openStages = [
      "Requested", "Accepted", "Pickup", "Transit", "Received", "Inward",
      "Processing", "Completed", "Cancelled", "Vendor Pickup", "Vendor Transit", "Delivered",
    ];

    const closedStages = [
      { name: "Won", color: "bg-success" },
      { name: "Lost", color: "bg-danger" },
    ];

    const stages = [
      ...openStages.map((name, index) => ({
        workflow_master_id: workflow.workflow_id,
        workflow_stage_name: name,
        workflow_stage_otp: false,
        workflow_stage_attachment: false,
        workflow_close_stage: 0,
        workflow_stage_color: colorOptions[index % colorOptions.length],
      })),
      ...closedStages.map((s) => ({
        workflow_master_id: workflow.workflow_id,
        workflow_stage_name: s.name,
        workflow_stage_otp: false,
        workflow_stage_attachment: false,
        workflow_close_stage: 1,
        workflow_stage_color: s.color,
      })),
    ];

    await WorkflowChild.bulkCreate(stages, { transaction: t });

    /* =========================
      5) MASTER DATA (bulk)
    ========================= */
    await Accessories.bulkCreate(
      [
        { accessories_name: "Charger", accessories_created_by: 1 },
        { accessories_name: "Laptop Bag", accessories_created_by: 1 },
        { accessories_name: "External Hard Disk", accessories_created_by: 1 },
        { accessories_name: "USB Cable", accessories_created_by: 1 },
        { accessories_name: "Mouse", accessories_created_by: 1 },
        { accessories_name: "Keyboard", accessories_created_by: 1 },
        { accessories_name: "Pen Drive", accessories_created_by: 1 },
        { accessories_name: "Power Adapter", accessories_created_by: 1 },
        { accessories_name: "Cooling Pad", accessories_created_by: 1 },
        { accessories_name: "Headphones", accessories_created_by: 1 },
      ],
      { transaction: t, ignoreDuplicates: true }
    );

    await DeviceColor.bulkCreate(
      [
        { device_color_name: "Black", device_color_created_by: 1 },
        { device_color_name: "White", device_color_created_by: 1 },
        { device_color_name: "Silver", device_color_created_by: 1 },
        { device_color_name: "Gray", device_color_created_by: 1 },
        { device_color_name: "Blue", device_color_created_by: 1 },
        { device_color_name: "Red", device_color_created_by: 1 },
        { device_color_name: "Gold", device_color_created_by: 1 },
        { device_color_name: "Green", device_color_created_by: 1 },
        { device_color_name: "Purple", device_color_created_by: 1 },
        { device_color_name: "Rose Gold", device_color_created_by: 1 },
      ],
      { transaction: t, ignoreDuplicates: true }
    );

    await DeviceType.bulkCreate(
      [
        { device_type_name: "Laptop", device_type_created_by: 1 },
        { device_type_name: "Desktop", device_type_created_by: 1 },
        { device_type_name: "Tablet", device_type_created_by: 1 },
        { device_type_name: "Mobile", device_type_created_by: 1 },
        { device_type_name: "Smart Watch", device_type_created_by: 1 },
        { device_type_name: "Printer", device_type_created_by: 1 },
        { device_type_name: "Scanner", device_type_created_by: 1 },
        { device_type_name: "Monitor", device_type_created_by: 1 },
        { device_type_name: "Server", device_type_created_by: 1 },
        { device_type_name: "All-in-One PC", device_type_created_by: 1 },
      ],
      { transaction: t, ignoreDuplicates: true }
    );

    await RepairType.bulkCreate(
      [
        { repair_type_name: "AMC", repair_type_created_by: 1 },
        { repair_type_name: "Warranty", repair_type_created_by: 1 },
        { repair_type_name: "No Warranty", repair_type_created_by: 1 },
        { repair_type_name: "Return", repair_type_created_by: 1 },
        { repair_type_name: "Paid", repair_type_created_by: 1 },
        { repair_type_name: "Free", repair_type_created_by: 1 },
      ],
      { transaction: t, ignoreDuplicates: true }
    );

    await ServicesType.bulkCreate(
      [
        { service_type_name: "Walk-in Shop", service_type_created_by: 1 },
        { service_type_name: "Pick Up and Drop", service_type_created_by: 1 },
        { service_type_name: "Only Drop", service_type_created_by: 1 },
        { service_type_name: "Only Pick Up", service_type_created_by: 1 },
        { service_type_name: "On-Site Service", service_type_created_by: 1 },
      ],
      { transaction: t, ignoreDuplicates: true }
    );

    await Source.bulkCreate(
      [
        { source_name: "Instagram", source_created_by: 1 },
        { source_name: "Facebook", source_created_by: 1 },
        { source_name: "Google Ads", source_created_by: 1 },
        { source_name: "Walk-in Customer", source_created_by: 1 },
        { source_name: "Referral", source_created_by: 1 },
      ],
      { transaction: t, ignoreDuplicates: true }
    );

    await StorageLocation.bulkCreate(
      [
        { storage_location_name: "Section A", storage_location_created_by: 1 },
        { storage_location_name: "Section B", storage_location_created_by: 1 },
        { storage_location_name: "Section C", storage_location_created_by: 1 },
        { storage_location_name: "Section D", storage_location_created_by: 1 },
        { storage_location_name: "Section E", storage_location_created_by: 1 },
      ],
      { transaction: t, ignoreDuplicates: true }
    );

    /* =========================
      6) BRANDS + CATEGORIES + PRODUCTS
    ========================= */
    const brandsPayload = [
      { brand_name: "Intel", brand_created_by: 1 },
      { brand_name: "AMD", brand_created_by: 1 },
      { brand_name: "ASUS", brand_created_by: 1 },
      { brand_name: "MSI", brand_created_by: 1 },
      { brand_name: "Gigabyte", brand_created_by: 1 },
      { brand_name: "Corsair", brand_created_by: 1 },
      { brand_name: "Kingston", brand_created_by: 1 },
      { brand_name: "Crucial", brand_created_by: 1 },
      { brand_name: "Samsung", brand_created_by: 1 },
      { brand_name: "Western Digital", brand_created_by: 1 },
      { brand_name: "Seagate", brand_created_by: 1 },
      { brand_name: "EVM", brand_created_by: 1 },
      { brand_name: "Cooler Master", brand_created_by: 1 },
      { brand_name: "Zebronics", brand_created_by: 1 },
      { brand_name: "Ant Esports", brand_created_by: 1 },
      { brand_name: "Logitech", brand_created_by: 1 },
      { brand_name: "HP", brand_created_by: 1 },
      { brand_name: "Dell", brand_created_by: 1 },
      { brand_name: "Microsoft", brand_created_by: 1 },
      { brand_name: "Quick Heal", brand_created_by: 1 },
    ];

    await Brand.bulkCreate(brandsPayload, { transaction: t, ignoreDuplicates: true });

    const allBrands = await Brand.findAll({ transaction: t });
    const brandMap = {};
    allBrands.forEach((b) => (brandMap[b.brand_name] = b.brand_id));

    const categoriesPayload = [
      "PROCESSOR", "MOTHERBOARD", "CPU COOLER", "RAM", "SSD", "HARD DISK",
      "CABINET", "SMPS", "MONITOR", "KEYBOARD AND MOUSE", "OS", "APPLICATION",
    ].map((name) => ({
      category_name: name,
      category_main_id: null,
      category_created_by: 1,
      category_status: 1,
    }));

    await Category.bulkCreate(categoriesPayload, { transaction: t, ignoreDuplicates: true });

    const allCategories = await Category.findAll({ transaction: t });
    const categoryMap = {};
    allCategories.forEach((c) => (categoryMap[c.category_name] = c.category_id));

    const makeProduct = (name, cat, brand, buy, sell, mrp) => ({
      product_name: name,
      product_tax: 1,
      product_created_by: 1,
      product_description: `<p>${name}</p>`,
      product_usage_type: "both",
      product_brand: brandMap[brand],
      product_category: categoryMap[cat],
      product_image: JSON.stringify([]),
      product_purchase_price: buy,
      product_sale_price: sell,
      product_mrp: mrp,
      product_status: 2,
    });

    const productsPayload = [
      /* ================= PROCESSOR ================= */
      makeProduct("Intel i3 12100F", "PROCESSOR", "Intel", 6500, 7200, 8000),
      makeProduct("Intel i5 12400F", "PROCESSOR", "Intel", 11500, 12900, 14500),
      makeProduct("Ryzen 5 5600", "PROCESSOR", "AMD", 10500, 11900, 13500),
      makeProduct("Ryzen 7 5700X", "PROCESSOR", "AMD", 16000, 17800, 19500),

      /* ================= MOTHERBOARD ================= */
      makeProduct("ASUS H610", "MOTHERBOARD", "ASUS", 5200, 5900, 6500),
      makeProduct("MSI B660", "MOTHERBOARD", "MSI", 10500, 11900, 13500),
      makeProduct("Gigabyte A520", "MOTHERBOARD", "Gigabyte", 4600, 5200, 5900),
      makeProduct("ASUS B550", "MOTHERBOARD", "ASUS", 9800, 11200, 12900),

      /* ================= CPU COOLER ================= */
      makeProduct("Cooler Master Air Cooler", "CPU COOLER", "Cooler Master", 800, 999, 1299),
      makeProduct("Ant Esports Air Cooler", "CPU COOLER", "Ant Esports", 1200, 1499, 1999),
      makeProduct("Cooler Master 240mm Liquid", "CPU COOLER", "Cooler Master", 4500, 5200, 6500),
      makeProduct("Cooler Master 360mm Liquid", "CPU COOLER", "Cooler Master", 7200, 8500, 9999),

      /* ================= RAM ================= */
      makeProduct("Corsair 8GB DDR4", "RAM", "Corsair", 1200, 1450, 1699),
      makeProduct("Corsair 16GB DDR4", "RAM", "Corsair", 2200, 2600, 2999),
      makeProduct("Kingston 16GB DDR5", "RAM", "Kingston", 3600, 4200, 4999),
      makeProduct("Crucial 32GB DDR5", "RAM", "Crucial", 6900, 7900, 8999),

      /* ================= SSD ================= */
      makeProduct("EVM SSD 500GB", "SSD", "EVM", 1500, 1800, 2000),
      makeProduct("Samsung SSD 1TB", "SSD", "Samsung", 4200, 4900, 5999),
      makeProduct("WD NVMe 500GB", "SSD", "Western Digital", 2100, 2500, 2999),
      makeProduct("Crucial NVMe 1TB", "SSD", "Crucial", 4200, 4900, 5999),

      /* ================= HARD DISK ================= */
      makeProduct("Seagate HDD 500GB", "HARD DISK", "Seagate", 900, 1150, 1400),
      makeProduct("Seagate HDD 1TB", "HARD DISK", "Seagate", 1600, 1950, 2400),
      makeProduct("WD HDD 2TB", "HARD DISK", "Western Digital", 3100, 3600, 4300),
      makeProduct("WD HDD 4TB", "HARD DISK", "Western Digital", 6800, 7500, 8999),

      /* ================= CABINET ================= */
      makeProduct("Zebronics Cabinet", "CABINET", "Zebronics", 1200, 1500, 1999),
      makeProduct("Ant Esports Mid Tower", "CABINET", "Ant Esports", 1900, 2300, 2999),
      makeProduct("Ant Esports RGB Cabinet", "CABINET", "Ant Esports", 2400, 2900, 3999),
      makeProduct("Cooler Master Cabinet", "CABINET", "Cooler Master", 3800, 4500, 5999),

      /* ================= SMPS ================= */
      makeProduct("Cooler Master 450W SMPS", "SMPS", "Cooler Master", 1400, 1700, 2299),
      makeProduct("Cooler Master 550W SMPS", "SMPS", "Cooler Master", 1900, 2300, 2999),
      makeProduct("Corsair 650W SMPS", "SMPS", "Corsair", 2600, 3100, 3999),
      makeProduct("Corsair 750W SMPS", "SMPS", "Corsair", 3400, 3999, 4999),

      /* ================= MONITOR ================= */
      makeProduct("Dell 19 inch Monitor", "MONITOR", "Dell", 3200, 3800, 4499),
      makeProduct("HP 22 inch Monitor", "MONITOR", "HP", 4300, 4999, 5999),
      makeProduct("Dell 24 inch IPS", "MONITOR", "Dell", 6200, 6999, 8499),
      makeProduct("Samsung 27 inch IPS", "MONITOR", "Samsung", 9800, 10999, 12999),

      /* ================= KEYBOARD AND MOUSE ================= */
      makeProduct("Logitech Keyboard Mouse Combo", "KEYBOARD AND MOUSE", "Logitech", 350, 499, 699),
      makeProduct("Logitech Wireless Combo", "KEYBOARD AND MOUSE", "Logitech", 850, 999, 1299),
      makeProduct("Ant Esports Gaming Keyboard", "KEYBOARD AND MOUSE", "Ant Esports", 1100, 1399, 1999),
      makeProduct("Ant Esports Gaming Mouse", "KEYBOARD AND MOUSE", "Ant Esports", 500, 699, 999),

      /* ================= OS ================= */
      makeProduct("Windows 10 Pro", "OS", "Microsoft", 900, 1200, 1999),
      makeProduct("Windows 11 Pro", "OS", "Microsoft", 1100, 1500, 2499),
      makeProduct("Ubuntu OS Install", "OS", "Microsoft", 0, 300, 499),
      makeProduct("Driver Pack Installation", "OS", "Microsoft", 0, 200, 299),

      /* ================= APPLICATION ================= */
      makeProduct("MS Office Setup", "APPLICATION", "Microsoft", 0, 500, 999),
      makeProduct("Quick Heal Antivirus", "APPLICATION", "Quick Heal", 300, 499, 799),
      makeProduct("Adobe Reader Setup", "APPLICATION", "Microsoft", 0, 150, 299),
      makeProduct("Basic Software Tools", "APPLICATION", "Microsoft", 0, 199, 399)
    ];


    await Product.bulkCreate(productsPayload, { transaction: t, ignoreDuplicates: true });

    /* =========================
      7) SLIDERS
    ========================= */

    const slidersPayload = [
      // slider_for_product = 0
      {
        pre_title_text: "Starting at",
        pre_title_price: 200,
        title: "Best Price",
        subtitle_text_1: "Exclusive offer",
        subtitle_percent: -40,
        subtitle_text_2: "off this week",
        slider_image: "banner-slider-1.png",
        slider_for_product: 0,
        slider_old_price: "",
        slider_bg_text: "",
        green_bg: 1,
        is_light: 0,
        slider_status: 1,
      },
      {
        pre_title_text: "Limited Deal",
        pre_title_price: 499,
        title: "Mega Sale",
        subtitle_text_1: "Hurry Up",
        subtitle_percent: -30,
        subtitle_text_2: "limited time",
        slider_image: "banner-slider-2.png",
        slider_for_product: 0,
        slider_old_price: "",
        slider_bg_text: "",
        green_bg: 0,
        is_light: 1,
        slider_status: 1,
      },
      {
        pre_title_text: "From",
        pre_title_price: 999,
        title: "Festival Offer",
        subtitle_text_1: "Special Prices",
        subtitle_percent: -50,
        subtitle_text_2: "today only",
        slider_image: "banner-slider-3.png",
        slider_for_product: 0,
        slider_old_price: "",
        slider_bg_text: "",
        green_bg: 1,
        is_light: 0,
        slider_status: 1,
      },

      // slider_for_product = 1
      {
        pre_title_text: "Only at",
        pre_title_price: 1800,
        title: "SSD Deal",
        subtitle_text_1: "Flat Discount",
        subtitle_percent: -25,
        subtitle_text_2: "on SSD",
        slider_image: "banner-product-1.png",
        slider_for_product: 1,
        slider_old_price: "2400",
        slider_bg_text: "STORAGE",
        green_bg: 1,
        is_light: 0,
        slider_status: 1,
      },
      {
        pre_title_text: "Buy Now",
        pre_title_price: 12900,
        title: "Intel i5 Offer",
        subtitle_text_1: "Processor Sale",
        subtitle_percent: -15,
        subtitle_text_2: "best choice",
        slider_image: "banner-product-2.png",
        slider_for_product: 1,
        slider_old_price: "14900",
        slider_bg_text: "PROCESSOR",
        green_bg: 0,
        is_light: 1,
        slider_status: 1,
      },
      {
        pre_title_text: "Starting",
        pre_title_price: 2600,
        title: "RAM Upgrade",
        subtitle_text_1: "Performance Boost",
        subtitle_percent: -20,
        subtitle_text_2: "limited stock",
        slider_image: "banner-product-3.png",
        slider_for_product: 1,
        slider_old_price: "3200",
        slider_bg_text: "MEMORY",
        green_bg: 1,
        is_light: 0,
        slider_status: 1,
      },
    ];

    await Slider.bulkCreate(slidersPayload, { transaction: t, ignoreDuplicates: true });

    /* =========================
      ✅ COMMIT
    ========================= */
    await t.commit();

    console.log("✅ Seed completed successfully");


    await StoreFeature.bulkCreate(
      [
        {
          title: "Fast Service",
          description: "Quick repairs.",
          icon: "FaBolt",
          feature_status: 1,
          feature_created_by: 1
        },
        {
          title: "Genuine Parts",
          description: "Original parts.",
          icon: "FaCheckCircle",
          feature_status: 1,
          feature_created_by: 1
        },
        {
          title: "Affordable Pricing",
          description: "Best prices.",
          icon: "FaRupeeSign",
          feature_status: 1,
          feature_created_by: 1
        },
        {
          title: "Expert Technicians",
          description: "Skilled experts.",
          icon: "FaUserShield",
          feature_status: 1,
          feature_created_by: 1
        }
      ]
      ,
      {
        ignoreDuplicates: true // optional (needs unique index on title)
      }
    );
    await Generations.bulkCreate(
      [
        // 🔵 INTEL (brand = 1)
        {
          generations_name: "1st Gen (Nehalem)",
          generations_brand: 1,
          generations_created_by: 1,
        },
        {
          generations_name: "2nd Gen (Sandy Bridge)",
          generations_brand: 1,
          generations_created_by: 1,
        },
        {
          generations_name: "3rd Gen (Ivy Bridge)",
          generations_brand: 1,
          generations_created_by: 1,
        },
        {
          generations_name: "4th Gen (Haswell)",
          generations_brand: 1,
          generations_created_by: 1,
        },
        {
          generations_name: "5th Gen (Broadwell)",
          generations_brand: 1,
          generations_created_by: 1,
        },
        {
          generations_name: "6th Gen (Skylake)",
          generations_brand: 1,
          generations_created_by: 1,
        },
        {
          generations_name: "7th Gen (Kaby Lake)",
          generations_brand: 1,
          generations_created_by: 1,
        },
        {
          generations_name: "8th Gen (Coffee Lake)",
          generations_brand: 1,
          generations_created_by: 1,
        },
        {
          generations_name: "9th Gen (Coffee Lake Refresh)",
          generations_brand: 1,
          generations_created_by: 1,
        },
        {
          generations_name: "10th Gen (Comet Lake)",
          generations_brand: 1,
          generations_created_by: 1,
        },
        {
          generations_name: "11th Gen (Rocket Lake)",
          generations_brand: 1,
          generations_created_by: 1,
        },
        {
          generations_name: "12th Gen (Alder Lake)",
          generations_brand: 1,
          generations_created_by: 1,
        },
        {
          generations_name: "13th Gen (Raptor Lake)",
          generations_brand: 1,
          generations_created_by: 1,
        },
        {
          generations_name: "14th Gen (Raptor Lake Refresh)",
          generations_brand: 1,
          generations_created_by: 1,
        },
        {
          generations_name: "15th Gen (Next Gen)",
          generations_brand: 1,
          generations_created_by: 1,
        },

        // 🔴 AMD (brand = 2)
        {
          generations_name: "Ryzen 1000 (Zen 1)",
          generations_brand: 2,
          generations_created_by: 1,
        },
        {
          generations_name: "Ryzen 2000 (Zen+)",
          generations_brand: 2,
          generations_created_by: 1,
        },
        {
          generations_name: "Ryzen 3000 (Zen 2)",
          generations_brand: 2,
          generations_created_by: 1,
        },
        {
          generations_name: "Ryzen 4000 (OEM)",
          generations_brand: 2,
          generations_created_by: 1,
        },
        {
          generations_name: "Ryzen 5000 (Zen 3)",
          generations_brand: 2,
          generations_created_by: 1,
        },
        {
          generations_name: "Ryzen 6000 (Laptop)",
          generations_brand: 2,
          generations_created_by: 1,
        },
        {
          generations_name: "Ryzen 7000 (Zen 4)",
          generations_brand: 2,
          generations_created_by: 1,
        },
        {
          generations_name: "Ryzen 8000G (Desktop APU)",
          generations_brand: 2,
          generations_created_by: 1,
        },
        {
          generations_name: "Ryzen 9000 (Zen 5)",
          generations_brand: 2,
          generations_created_by: 1,
        },
      ],
      {
        ignoreDuplicates: true, // ✅ requires unique index (brand + value)
      }
    );
    await Ram.bulkCreate(
      [
        {
          ram_name: "DDR3",
          ram_created_by: 1,
        },
        {
          ram_name: "DDR4",
          ram_created_by: 1,
        },
        {
          ram_name: "DDR5",
          ram_created_by: 1,
        },
      ],
      {
        ignoreDuplicates: true, // optional (add unique index on ram_name)
      }
    );
    return true;

  } catch (error) {
    await t.rollback();
    console.error("❌ Error creating Super Admin:", error);
    return false;
  }
};

const findingAlready = async () => {
  try {
    const userCount = await User.count();
    if (userCount === 0) {
      await createSuperAdmin();
    } else {
      console.log("ℹ️ Users already exist. Skipping seeding.");
    }
  } catch (error) {
    console.error("❌ findingAlready error:", error);
  }
};

module.exports = { findingAlready };  
