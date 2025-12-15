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

        // fetch cart items
        const list = await AddToCard.findAll({
            where: { add_to_card_user_id: userId },
            order: [["add_to_card_id", "DESC"]],
        });

        // calculate grand total
        const grand_total = list.reduce(
            (sum, item) => sum + Number(item.add_to_card_product_total),
            0
        );

        return res.json({
            items: list,
            grand_total,
        });
    } catch (err) {
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
