const sequelize = require("../../config/db");
const AddToCard = require("./add_to_card_model");

// ------------------- CREATE -------------------
const store = async (req, res) => {
    try {

        const userId = req.currentUser.user_id;
        const {
            add_to_card_product_id,
            add_to_card_product_qty = 1,
            add_to_card_product_sale_price = 0,
        } = req.body;

        // 1️⃣ Check existing product for same user
        const existing = await AddToCard.findOne({
            where: {
                add_to_card_user_id: userId,
                add_to_card_product_id,
            },
        });

        if (existing) {
            // 2️⃣ Update qty
            const newQty = existing.add_to_card_product_qty + add_to_card_product_qty;
            const newTotal = newQty * add_to_card_product_sale_price;

            await existing.update({
                add_to_card_product_qty: newQty,
                add_to_card_product_total: newTotal,
            });

            return res.json({
                message: "Cart updated successfully",
                data: existing,
            });
        }

        // 3️⃣ Create new cart item
        const total = add_to_card_product_qty * add_to_card_product_sale_price;

        const data = await AddToCard.create({
            ...req.body,
            add_to_card_user_id: userId,
            add_to_card_product_total: total,
        });

        return res.json({
            message: "Added to cart successfully",
            data,
        });

    } catch (err) {

        return res.status(500).json({ error: err.message });
    }
};


// ------------------- LIST / GET ALL -------------------
const index = async (req, res) => {
  try {
    const userId = req.currentUser.user_id;

    const items = await sequelize.query(
      `
      SELECT
        a.add_to_card_id,
        a.add_to_card_product_qty,

        b.product_id,
        b.product_name,
        b.product_image,
        b.product_sale_price,
        b.product_delivery_charge,
        b.product_tax,

        t.tax_id,
        t.tax_name,
        t.tax_percentage

      FROM tbl_add_to_card AS a

      INNER JOIN tbl_products AS b
        ON a.add_to_card_product_id = b.product_id

      LEFT JOIN tbl_taxes AS t
        ON b.product_tax = t.tax_id

      WHERE a.add_to_card_user_id = :userId
      ORDER BY a.add_to_card_id DESC
      `,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // 🧮 SUB TOTAL
    const sub_total = items.reduce(
      (sum, item) =>
        sum +
        Number(item.product_sale_price) *
          Number(item.add_to_card_product_qty),
      0
    );

    // 🚚 SHIPPING COST
    const shipping_cost = items.reduce(
      (sum, item) => sum + Number(item.product_delivery_charge || 0),
      0
    );

    // 🧾 TAX AMOUNT
    const tax_total = items.reduce((sum, item) => {
      const price =
        Number(item.product_sale_price) *
        Number(item.add_to_card_product_qty);

      const taxPercent = Number(item.tax_percentage || 0);
      return sum + (price * taxPercent) / 100;
    }, 0);

    // 💰 GRAND TOTAL
    const grand_total = sub_total + shipping_cost + tax_total;

    return res.json({
      items,
      sub_total,
      shipping_cost,
      tax_total,
      grand_total,
    });
  } catch (err) {
    console.error("500 Error", err);
    return res.status(500).json({ error: err.message });
  }
};



// ------------------- GET SINGLE -------------------
const Get = async (req, res) => {
    try {
        const item = await AddToCard.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: "Not found" });

        return res.json(item);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// ------------------- UPDATE -------------------
const update = async (req, res) => {
    try {
        const item = await AddToCard.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: "Not found" });

        await item.update(req.body);

        return res.json({ message: "Updated successfully", item });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// ------------------- DELETE -------------------
const deleted = async (req, res) => {
    try {

        const item = await AddToCard.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: "Not found" });

        await item.destroy();
        return res.json({ message: "Removed from cart" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    store,
    index,
    Get,
    update,
    deleted,
};
