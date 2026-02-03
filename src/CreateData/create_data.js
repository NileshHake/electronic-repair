const bcrypt = require("bcryptjs");
const User = require("../auth/user_model");
const Permission = require("../permissions/permission_model");
const RoleHasPermission = require("../roles/role_has_permission_model");
const Role = require("../roles/role_model");
const { NOT } = require("sequelize/lib/deferrable");
const { Op } = require("sequelize");
const WorkflowMaster = require("../WorkFLow/work_flow_master_model");
const WorkflowChild = require("../WorkFLow/work_flow_child_model");
const Accessories = require("../Accessories/accessories_model");
const Brand = require("../Brands/brand_model");
const DeviceColor = require("../Device Color/device_color_model");
const DeviceType = require("../DeviceType/device_type_model");
const HardwareConfiguration = require("../Hardware Configuration/hardware_configuration_model");
const RepairType = require("../RepairType/repair_type_model");
const Services = require("../Services/services_model");
const ServicesType = require("../ServicesType/services_type_model");
const Source = require("../Source/source_model");
const StorageLocation = require("../StorageLocation/storage_location_model");
const DeviceModel = require("../DeviceModel/device_model_model");

const createSuperAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash("super@nbh.com", 10);

    await User.create({
      user_name: "Super Admin",
      user_email: "super@nbh.com",
      user_type: 1,
      user_created_by: 1,
      user_role_id: 1,
      user_password: hashedPassword,
    });

    const staticpermissions = [
      {
        permission_name: "Dashboard",
        permission_path: 1,
        permission_category: "DASHBOARD",
      },


      {
        permission_name: "List",
        permission_path: 1,
        permission_category: "CUSTOMER",
      },
      {
        permission_name: "Create",
        permission_path: 2,
        permission_category: "CUSTOMER",
      },
      {
        permission_name: "Update",
        permission_path: 3,
        permission_category: "CUSTOMER",
      },
      {
        permission_name: "Delete",
        permission_path: 4,
        permission_category: "CUSTOMER",
      },
      {
        permission_name: "List",
        permission_path: 1,
        permission_category: "BUSINESS",
      },
      {
        permission_name: "Create",
        permission_path: 2,
        permission_category: "BUSINESS",
      },
      {
        permission_name: "Update",
        permission_path: 3,
        permission_category: "BUSINESS",
      },
      {
        permission_name: "Delete",
        permission_path: 4,
        permission_category: "BUSINESS",
      },
      {
        permission_name: "List",
        permission_path: 1,
        permission_category: "REPAIRING",
      },
      {
        permission_name: "Create",
        permission_path: 2,
        permission_category: "REPAIRING",
      },
      {
        permission_name: "Update",
        permission_path: 3,
        permission_category: "REPAIRING",
      },
      {
        permission_name: "Delete",
        permission_path: 4,
        permission_category: "REPAIRING",
      },
      {
        permission_name: "List",
        permission_path: 1,
        permission_category: "QUOTATION_BILLING",
      },
      {
        permission_name: "Create",
        permission_path: 2,
        permission_category: "QUOTATION_BILLING",
      },
      {
        permission_name: "Update",
        permission_path: 3,
        permission_category: "QUOTATION_BILLING",
      },
      {
        permission_name: "Delete",
        permission_path: 4,
        permission_category: "QUOTATION_BILLING",
      },
      {
        permission_name: "List",
        permission_path: 1,
        permission_category: "PRODUCT",
      },
      {
        permission_name: "Create",
        permission_path: 2,
        permission_category: "PRODUCT",
      },
      {
        permission_name: "Update",
        permission_path: 3,
        permission_category: "PRODUCT",
      },
      {
        permission_name: "Delete",
        permission_path: 4,
        permission_category: "PRODUCT",
      },
      {
        permission_name: "List",
        permission_path: 1,
        permission_category: "BEADING",
      },
      {
        permission_name: "List",
        permission_path: 1,
        permission_category: "REQ_TO_SUPPLIER",
      },
      {
        permission_name: "Create",
        permission_path: 2,
        permission_category: "REQ_TO_SUPPLIER",
      },
      {
        permission_name: "Update",
        permission_path: 3,
        permission_category: "REQ_TO_SUPPLIER",
      },
      {
        permission_name: "Delete",
        permission_path: 4,
        permission_category: "REQ_TO_SUPPLIER",
      },
      {
        permission_name: "List",
        permission_path: 1,
        permission_category: "SUPPLIER",
      },
      {
        permission_name: "Create",
        permission_path: 2,
        permission_category: "SUPPLIER",
      },
      {
        permission_name: "Update",
        permission_path: 3,
        permission_category: "SUPPLIER",
      },
      {
        permission_name: "Delete",
        permission_path: 4,
        permission_category: "SUPPLIER",
      },
      {
        permission_name: "Roles",
        permission_path: 1,
        permission_category: "USERMANAGEMENT",
      },
      {
        permission_name: "Users",
        permission_path: 2,
        permission_category: "USERMANAGEMENT",
      },
      {
        permission_name: "Technicians",
        permission_path: 3,
        permission_category: "USERMANAGEMENT",
      },
      {
        permission_name: "Delivery /Pick-Up Boy",
        permission_path: 4,
        permission_category: "USERMANAGEMENT",
      },
      {
        permission_name: "All Orders",
        permission_path: 1,
        permission_category: "ORDERTRACKING",
      },
      {
        permission_name: "New Orders",
        permission_path: 2,
        permission_category: "ORDERTRACKING",
      },
      {
        permission_name: "Approval Orders",
        permission_path: 3,
        permission_category: "ORDERTRACKING",
      },
      {
        permission_name: "Packing Orders",
        permission_path: 4,
        permission_category: "ORDERTRACKING",
      },
      {
        permission_name: "Dispatch Orders",
        permission_path: 5,
        permission_category: "ORDERTRACKING",
      },
      {
        permission_name: "Rejected Orders",
        permission_path: 6,
        permission_category: "ORDERTRACKING",
      },
      {
        permission_name: "Delivered Orders",
        permission_path: 7,
        permission_category: "ORDERTRACKING",
      },
      {
        permission_name: "Accessories",
        permission_path: 1,
        permission_category: "SETTINGS",
      },
      {
        permission_name: "Brand",
        permission_path: 2,
        permission_category: "SETTINGS",
      },
      {
        permission_name: "Category",
        permission_path: 3,
        permission_category: "SETTINGS",
      },
      {
        permission_name: "Customer Address",
        permission_path: 4,
        permission_category: "SETTINGS",
      },
      {
        permission_name: "Device Type",
        permission_path: 5,
        permission_category: "SETTINGS",
      },
      {
        permission_name: "Payment",
        permission_path: 6,
        permission_category: "SETTINGS",
      },
      {
        permission_name: "Repair Type",
        permission_path: 7,
        permission_category: "SETTINGS",
      },
      {
        permission_name: "Service",
        permission_path: 8,
        permission_category: "SETTINGS",
      },
      {
        permission_name: "Source",
        permission_path: 9,
        permission_category: "SETTINGS",
      },
      {
        permission_name: "Status",
        permission_path: 10,
        permission_category: "SETTINGS",
      },
      {
        permission_name: "Tax",
        permission_path: 11,
        permission_category: "SETTINGS",
      },
      {
        permission_name: "Work Flow",
        permission_path: 12,
        permission_category: "SETTINGS",
      },
      {
        permission_name: "Device Model ",
        permission_path: 13,
        permission_category: "SETTINGS",
      },
      {
        permission_name: "Services Type",
        permission_path: 14,
        permission_category: "SETTINGS",
      },
      {
        permission_name: "Storage Location",
        permission_path: 15,
        permission_category: "SETTINGS",
      },
      {
        permission_name: "Device Color ",
        permission_path: 16,
        permission_category: "SETTINGS",
      },
    ];
    await Permission.bulkCreate(staticpermissions);
    const SuperAdminpermissionsLists = await Permission.findAll();

    await Role.create({
      role_name: "Super Admin",
      role_created_by: 1,
    });

    for (const permission of SuperAdminpermissionsLists) {
      await RoleHasPermission.create({
        rhp_role_id: 1,
        rhp_permission_id: permission.permission_id,
      });
    }
    const AdminpermissionsLists = await Permission.findAll({
      where: {
        permission_category: {
          [Op.notIn]: [
            "BUSINESS","SUPPLIER",

          ],
        },
      },
    });

    const adminRole = await Role.create({
      role_name: "Admin",
      role_created_by: 1,
    });

    for (const permission of AdminpermissionsLists) {
      await RoleHasPermission.create({
        rhp_role_id: adminRole.role_id,
        rhp_permission_id: permission.permission_id,
      });
    }

    const supplierPermissions = await Permission.findAll({
      where: {
        permission_category: {
          [Op.in]: ["DASHBOARD", "PRODUCT" ,"REQ_TO_SUPPLIER" ,],
        },
      },
    });
    const supplierRole = await Role.create({
      role_name: "Supplier",
      role_created_by: 1,
    });
    for (const permission of supplierPermissions) {
      await RoleHasPermission.create({
        rhp_role_id: supplierRole.role_id,
        rhp_permission_id: permission.permission_id,
      });
    }
    try {
      const colorOptions = [
        { label: "Primary", value: "bg-primary" },
        { label: "Secondary", value: "bg-secondary" },
        { label: "Success", value: "bg-success" },
        { label: "Info", value: "bg-info" },
        { label: "Warning", value: "bg-warning" },
        { label: "Danger", value: "bg-danger" },
        { label: "Dark", value: "bg-dark" },
      ];

      const workflow = await WorkflowMaster.create({
        workflow_create_user: 1,
        workflow_name: "Job Processing Workflow",
        workflow_status: 1,
      });

      const openStages = [
        "Requested",
        "Accepted",
        "Pickup",
        "Transit",
        "Received",
        "Inward",
        "Processing",
        "Completed",
        "Cancelled",
        "Vendor Pickup",
        "Vendor Transit",
        "Delivered",
      ];

      const closedStages = [
        { name: "Won", color: "bg-success" }, // ✅ Success color
        { name: "Lost", color: "bg-danger" }, // ✅ Danger color
      ];

      const stages = [
        // Open stages (workflow_close_stage = 0)
        ...openStages.map((name, index) => ({
          workflow_master_id: workflow.workflow_id,
          workflow_stage_name: name,
          workflow_stage_otp: false,
          workflow_stage_attachment: false,
          workflow_close_stage: 0,
          workflow_stage_color: colorOptions[index % colorOptions.length].value,
        })),

        // Closed stages (workflow_close_stage = 1)
        ...closedStages.map((stage) => ({
          workflow_master_id: workflow.workflow_id,
          workflow_stage_name: stage.name,
          workflow_stage_otp: false,
          workflow_stage_attachment: false,
          workflow_close_stage: 1,
          workflow_stage_color: stage.color,
        })),
      ];

      await WorkflowChild.bulkCreate(stages);
    } catch (error) {
      console.error("Error creating workflow:", error);
    }
    try {
      await Accessories.bulkCreate([
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
      ]);
    } catch (error) {
      console.error("Error while bulk creating accessories:", error);
    }

    try {
      await Brand.bulkCreate([
        { brand_name: "Apple", brand_created_by: 1 },
        { brand_name: "Samsung", brand_created_by: 1 },
        { brand_name: "Dell", brand_created_by: 1 },
        { brand_name: "HP", brand_created_by: 1 },
        { brand_name: "Lenovo", brand_created_by: 1 },
        { brand_name: "Asus", brand_created_by: 1 },
        { brand_name: "Acer", brand_created_by: 1 },
        { brand_name: "Microsoft", brand_created_by: 1 },
        { brand_name: "Realme", brand_created_by: 1 },
        { brand_name: "Xiaomi", brand_created_by: 1 },
      ]);
    } catch (error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    try {
      await DeviceColor.bulkCreate([
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
      ]);
    } catch (error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    try {
      await DeviceType.bulkCreate([
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
      ]);
    } catch (error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    try {
      await HardwareConfiguration.bulkCreate([
        {
          hardware_configuration_processor: "Intel Core i3",
          hardware_configuration_ram: "4GB",
          hardware_configuration_hard_disk: "500GB HDD",
          hardware_configuration_ssd: "128GB SSD",
          hardware_configuration_graphics_card: "Intel UHD Graphics",
          hardware_configuration_created_by: 1,
        },
        {
          hardware_configuration_processor: "Intel Core i5",
          hardware_configuration_ram: "8GB",
          hardware_configuration_hard_disk: "1TB HDD",
          hardware_configuration_ssd: "256GB SSD",
          hardware_configuration_graphics_card: "NVIDIA MX130",
          hardware_configuration_created_by: 1,
        },
        {
          hardware_configuration_processor: "Intel Core i7",
          hardware_configuration_ram: "16GB",
          hardware_configuration_hard_disk: "1TB HDD",
          hardware_configuration_ssd: "512GB SSD",
          hardware_configuration_graphics_card: "NVIDIA GTX 1650",
          hardware_configuration_created_by: 1,
        },
        {
          hardware_configuration_processor: "AMD Ryzen 5",
          hardware_configuration_ram: "8GB",
          hardware_configuration_hard_disk: "1TB HDD",
          hardware_configuration_ssd: "256GB SSD",
          hardware_configuration_graphics_card: "Radeon Vega 8",
          hardware_configuration_created_by: 1,
        },
        {
          hardware_configuration_processor: "AMD Ryzen 7",
          hardware_configuration_ram: "16GB",
          hardware_configuration_hard_disk: "1TB HDD",
          hardware_configuration_ssd: "512GB SSD",
          hardware_configuration_graphics_card: "Radeon RX 5600M",
          hardware_configuration_created_by: 1,
        },
        {
          hardware_configuration_processor: "Intel Core i9",
          hardware_configuration_ram: "32GB",
          hardware_configuration_hard_disk: "2TB HDD",
          hardware_configuration_ssd: "1TB SSD",
          hardware_configuration_graphics_card: "NVIDIA RTX 3080",
          hardware_configuration_created_by: 1,
        },
        {
          hardware_configuration_processor: "Apple M1",
          hardware_configuration_ram: "8GB",
          hardware_configuration_hard_disk: "None",
          hardware_configuration_ssd: "256GB SSD",
          hardware_configuration_graphics_card: "Apple Integrated GPU",
          hardware_configuration_created_by: 1,
        },
        {
          hardware_configuration_processor: "Apple M2",
          hardware_configuration_ram: "16GB",
          hardware_configuration_hard_disk: "None",
          hardware_configuration_ssd: "512GB SSD",
          hardware_configuration_graphics_card: "Apple Integrated GPU",
          hardware_configuration_created_by: 1,
        },
        {
          hardware_configuration_processor: "Intel Pentium Gold",
          hardware_configuration_ram: "4GB",
          hardware_configuration_hard_disk: "500GB HDD",
          hardware_configuration_ssd: "None",
          hardware_configuration_graphics_card: "Intel UHD Graphics 610",
          hardware_configuration_created_by: 1,
        },
        {
          hardware_configuration_processor: "AMD Athlon Silver",
          hardware_configuration_ram: "4GB",
          hardware_configuration_hard_disk: "1TB HDD",
          hardware_configuration_ssd: "128GB SSD",
          hardware_configuration_graphics_card: "AMD Radeon Graphics",
          hardware_configuration_created_by: 1,
        },
      ]);
    } catch (error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    try {
      await RepairType.bulkCreate([
        { repair_type_name: "AMC", repair_type_created_by: 1 },
        { repair_type_name: "Warranty", repair_type_created_by: 1 },
        { repair_type_name: "No Warranty", repair_type_created_by: 1 },
        { repair_type_name: "Return", repair_type_created_by: 1 },
        { repair_type_name: "Paid", repair_type_created_by: 1 },
        { repair_type_name: "Free", repair_type_created_by: 1 },
      ]);
    } catch (error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    try {
      await Services.bulkCreate([
        { service_name: "OS Installation", service_created_by: 1 },
        { service_name: "Software Installation", service_created_by: 1 },
        { service_name: "Virus Removal", service_created_by: 1 },
        { service_name: "Data Recovery", service_created_by: 1 },
        { service_name: "Screen Replacement", service_created_by: 1 },
        { service_name: "Keyboard Replacement", service_created_by: 1 },
        { service_name: "Battery Replacement", service_created_by: 1 },
        { service_name: "Charging Port Repair", service_created_by: 1 },
        { service_name: "Motherboard Repair", service_created_by: 1 },
        { service_name: "SSD Upgrade", service_created_by: 1 },
        { service_name: "RAM Upgrade", service_created_by: 1 },
        { service_name: "Cooling Fan Replacement", service_created_by: 1 },
        { service_name: "Thermal Paste Application", service_created_by: 1 },
        { service_name: "Speaker Repair", service_created_by: 1 },
        { service_name: "Wi-Fi Card Replacement", service_created_by: 1 },
        { service_name: "Display Cable Repair", service_created_by: 1 },
        { service_name: "Hinges Repair", service_created_by: 1 },
        { service_name: "Liquid Damage Service", service_created_by: 1 },
        { service_name: "Dead System Diagnosis", service_created_by: 1 },
        { service_name: "Dust Cleaning Service", service_created_by: 1 },
      ]);
    } catch (error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    try {
      await ServicesType.bulkCreate([
        { service_type_name: "Walk-in Shop", service_type_created_by: 1 },
        { service_type_name: "Pick Up and Drop", service_type_created_by: 1 },
        { service_type_name: "Only Drop", service_type_created_by: 1 },
        { service_type_name: "Only Pick Up", service_type_created_by: 1 },
        { service_type_name: "On-Site Service", service_type_created_by: 1 },
      ]);
    } catch (error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    try {
      await Source.bulkCreate([
        { source_name: "Instagram", source_created_by: 1 },
        { source_name: "Facebook", source_created_by: 1 },
        { source_name: "Google Ads", source_created_by: 1 },
        { source_name: "Walk-in Customer", source_created_by: 1 },
        { source_name: "Referral", source_created_by: 1 },
      ]);
    } catch (error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    try {
      await StorageLocation.bulkCreate([
        { storage_location_name: "Section A", storage_location_created_by: 1 },
        { storage_location_name: "Section B", storage_location_created_by: 1 },
        { storage_location_name: "Section C", storage_location_created_by: 1 },
        { storage_location_name: "Section D", storage_location_created_by: 1 },
        { storage_location_name: "Section E", storage_location_created_by: 1 },
      ]);
    } catch (error) {
      console.error("❌ Error while adding storage locations:");
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    try {
      await DeviceModel.bulkCreate([
        // Apple (Brand ID 1)
        {
          device_model_created_by: 1,
          device_model_device_id: 1,
          device_model_brand_id: 1,
          device_model_name: "MacBook Air M1",
        },
        {
          device_model_created_by: 1,
          device_model_device_id: 1,
          device_model_brand_id: 1,
          device_model_name: "MacBook Pro M2",
        },
        {
          device_model_created_by: 1,
          device_model_device_id: 2,
          device_model_brand_id: 1,
          device_model_name: "iPhone 15 Pro",
        },
        {
          device_model_created_by: 1,
          device_model_device_id: 2,
          device_model_brand_id: 1,
          device_model_name: "iPhone 14",
        },

        // Samsung (Brand ID 2)
        {
          device_model_created_by: 1,
          device_model_device_id: 2,
          device_model_brand_id: 2,
          device_model_name: "Galaxy S24 Ultra",
        },
        {
          device_model_created_by: 1,
          device_model_device_id: 2,
          device_model_brand_id: 2,
          device_model_name: "Galaxy Z Fold 5",
        },
        {
          device_model_created_by: 1,
          device_model_device_id: 3,
          device_model_brand_id: 2,
          device_model_name: "Galaxy Book 4",
        },

        // Dell (Brand ID 3)
        {
          device_model_created_by: 1,
          device_model_device_id: 1,
          device_model_brand_id: 3,
          device_model_name: "Inspiron 15 3000",
        },
        {
          device_model_created_by: 1,
          device_model_device_id: 1,
          device_model_brand_id: 3,
          device_model_name: "XPS 13 Plus",
        },

        // HP (Brand ID 4)
        {
          device_model_created_by: 1,
          device_model_device_id: 1,
          device_model_brand_id: 4,
          device_model_name: "HP Pavilion x360",
        },
        {
          device_model_created_by: 1,
          device_model_device_id: 1,
          device_model_brand_id: 4,
          device_model_name: "HP Envy 16",
        },

        // Lenovo (Brand ID 5)
        {
          device_model_created_by: 1,
          device_model_device_id: 1,
          device_model_brand_id: 5,
          device_model_name: "IdeaPad Slim 5",
        },
        {
          device_model_created_by: 1,
          device_model_device_id: 1,
          device_model_brand_id: 5,
          device_model_name: "ThinkPad X1 Carbon",
        },
        {
          device_model_created_by: 1,
          device_model_device_id: 3,
          device_model_brand_id: 5,
          device_model_name: "Yoga Tab 13",
        },

        // Asus (Brand ID 6)
        {
          device_model_created_by: 1,
          device_model_device_id: 1,
          device_model_brand_id: 6,
          device_model_name: "ROG Zephyrus G14",
        },
        {
          device_model_created_by: 1,
          device_model_device_id: 1,
          device_model_brand_id: 6,
          device_model_name: "VivoBook 15",
        },

        // Acer (Brand ID 7)
        {
          device_model_created_by: 1,
          device_model_device_id: 1,
          device_model_brand_id: 7,
          device_model_name: "Aspire 7",
        },
        {
          device_model_created_by: 1,
          device_model_device_id: 1,
          device_model_brand_id: 7,
          device_model_name: "Nitro 5",
        },

        // Microsoft (Brand ID 8)
        {
          device_model_created_by: 1,
          device_model_device_id: 1,
          device_model_brand_id: 8,
          device_model_name: "Surface Laptop 5",
        },
        {
          device_model_created_by: 1,
          device_model_device_id: 3,
          device_model_brand_id: 8,
          device_model_name: "Surface Pro 9",
        },

        // Realme (Brand ID 9)
        {
          device_model_created_by: 1,
          device_model_device_id: 2,
          device_model_brand_id: 9,
          device_model_name: "Realme 12 Pro+",
        },
        {
          device_model_created_by: 1,
          device_model_device_id: 2,
          device_model_brand_id: 9,
          device_model_name: "Realme Narzo 70",
        },

        // Xiaomi (Brand ID 10)
        {
          device_model_created_by: 1,
          device_model_device_id: 2,
          device_model_brand_id: 10,
          device_model_name: "Redmi Note 13 Pro",
        },
        {
          device_model_created_by: 1,
          device_model_device_id: 2,
          device_model_brand_id: 10,
          device_model_name: "Mi 13 Ultra",
        },
      ]);
    } catch (error) {
      console.error("❌ Error creating device models:", error);
    }
  } catch (error) {
    console.error("❌ Error creating Super Admin:", error);
  }
};

const findingAlready = async () => {
  try {
    const userCount = await User.count();
    if (userCount === 0) {
      await createSuperAdmin();
      console.log("✅ Super Admin created successfully.");
    } else {
      console.log("ℹ️  Users already exist. Super Admin not created.");
    }
  } catch (error) {
    console.log("Error");
  }
};
module.exports = findingAlready();
