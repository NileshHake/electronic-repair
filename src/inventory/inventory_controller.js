const InventoryItem = require("./inventory_model");

// ==============================
//  STORE (Create Inventory Item)
// ==============================
const store = async (req, res) => {
  try {
    const {
      inventory_item_name,
      inventory_item_category,
      inventory_item_brand,
      inventory_item_description,
      inventory_item_qty,
      inventory_item_purchase_price,
      inventory_item_sale_price,
      created_by,
    } = req.body;

    const item = await InventoryItem.create({
      inventory_item_name,
      inventory_item_category,
      inventory_item_brand,
      inventory_item_description,
      inventory_item_qty,
      inventory_item_purchase_price,
      inventory_item_sale_price,
      created_by,
    });

    return res.status(201).json({
      message: "Inventory item added successfully",
      data: item,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to add inventory item" });
  }
};

// ==============================
//  INDEX (Get All Items)
// ==============================
const index = async (req, res) => {
  try {
    const items = await InventoryItem.findAll({
      order: [["inventory_item_id", "ASC"]],
    });

    return res.json(items);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch inventory items" });
  }
};

// ==============================
//  GET SINGLE ITEM
// ==============================
const Get = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await InventoryItem.findByPk(id);

    if (!item)
      return res.status(404).json({ error: "Inventory item not found" });

    return res.json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch inventory item" });
  }
};

// ==============================
//  UPDATE ITEM
// ==============================
const update = async (req, res) => {
  try {
    const { inventory_item_id } = req.body;

    const item = await InventoryItem.findByPk(inventory_item_id);

    if (!item)
      return res.status(404).json({ error: "Inventory item not found" });

    await item.update(req.body);

    return res.json({
      message: "Inventory item updated successfully",
      data: item,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update inventory item" });
  }
};

// ==============================
//  DELETE ITEM
// ==============================
const deleted = async (req, res) => {
  try {
    const { id } = req.params;

    await InventoryItem.destroy({ where: { inventory_item_id: id } });

    return res.json({
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete inventory item" });
  }
};

// EXPORT ALL FUNCTIONS
module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
