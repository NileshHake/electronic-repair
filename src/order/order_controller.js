const sequelize = require("../../config/db");
const AddToCard = require("../add_to_card/add_to_card_model");
const User = require("../auth/user_model");
const Customer = require("../Customer/customer_model");
const CustomerAddress = require("../CustomerAddress/customer_address_model");
const { getCreatedBy } = require("../helper/CurrentUser");
const OrderChild = require("./order_model_child");
const OrderMaster = require("./order_model_master");


/* 🟢 CREATE ORDER */
const store = async (req, res) => {
    const transaction = await sequelize.transaction();
    const customerData = await User.findByPk(req.currentUser.user_id)
    const customerAddressData = await CustomerAddress.findByPk(req.body.order_master_address_id)
    try {
        const {
            order_items,
            ...orderMasterData
        } = req.body;

        const orderMaster = await OrderMaster.create(
            {
                ...orderMasterData,
                order_master_customer_name: customerData.user_name,
                order_master_delivery_phone_number: customerAddressData.customer_address_mobile ? customerAddressData.customer_address_mobile : customerData.user_phone_number || "",
                order_master_user_id: req.currentUser.user_id,
                order_master_date: new Date(),
            },
            { transaction }
        );

        if (order_items && order_items.length > 0) {
            const childData = order_items.map((item) => ({
                ...item,
                order_child_master_id: orderMaster.order_master_id,
            }));

            await OrderChild.bulkCreate(childData, { transaction });
            const productIds = order_items.map((x) => x.order_child_product_id);

            await AddToCard.destroy({
                where: {
                    add_to_card_user_id: req.currentUser.user_id,
                    add_to_card_product_id: productIds, // IN (...) automatically
                },
                transaction,
            });
        }

        await transaction.commit();
        req.io.emit("orderStatusUpdated", {
            order_master_id: orderMaster.order_master_id,
            order_master_status: orderMaster.order_master_status ?? 0,
            type: "NEW_ORDER",
        });


        res.status(201).json({
            message: "Order created successfully",
            data: orderMaster,
        });
    } catch (error) {
        await transaction.rollback();
        console.log(error);

        res.status(500).json({
            message: "Error creating order",
            error: error.message,
        });
    }
};

/* 🟡 READ ALL ORDERS */
const index = async (req, res) => {
    try {
        let { order_status = 0, page = 1, limit = 10 } = req.body;

        page = Number(page);
        limit = Number(limit);
        const offset = (page - 1) * limit;

        const orders = await sequelize.query(
            `
            SELECT 
                om.*,
                u.user_name,
                ca.customer_address_city,
                ca.customer_address_pincode,
                ca.customer_address_description
            FROM tbl_order_master AS om
            LEFT JOIN tbl_users AS u 
                ON om.order_master_user_id = u.user_id
            LEFT JOIN tbl_customer_addresses AS ca
                ON om.order_master_address_id = ca.customer_address_id
            WHERE om.order_master_status = :order_status
            ORDER BY om.order_master_id DESC
            LIMIT ${limit} OFFSET ${offset}
            `,
            {
                replacements: { order_status },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });

    }
};

const indexchild = async (req, res) => {
    try {
        const { order_id } = req.body;

        console.log("Oerder ID ", order_id);

        if (!order_id) {
            return res.status(400).json({
                message: "order_id is required",
            });
        }

        const orderItems = await sequelize.query(
            `
            SELECT 
                oc.*,
                pro.*
            FROM tbl_order_child AS oc
            LEFT JOIN tbl_products AS pro
                ON oc.order_child_product_id = pro.product_id
            WHERE oc.order_child_master_id = :order_id
            ORDER BY oc.order_child_id DESC
            `,
            {
                replacements: { order_id },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        console.log("orderItems", orderItems);

        return res.status(200).json(orderItems);
    } catch (error) {
        console.error("Order Child Fetch Error:", error);
        return res.status(500).json({
            message: "Error fetching order items",
            error: error.message,
        });
    }
};





/* 🔵 READ SINGLE ORDER */
const Get = async (req, res) => {
    try {
        const order = await OrderMaster.findByPk(req.params.id, {
            include: [
                {
                    model: OrderChild,
                    as: "items",
                },
            ],
        });

        if (!order)
            return res.status(404).json({ message: "Order not found" });

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching order",
            error: error.message,
        });
    }
};

/* 🟠 UPDATE ORDER */
const update = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { order_master_id, order_items, ...updateData } = req.body;

        const orderMaster = await OrderMaster.findByPk(order_master_id);

        if (!orderMaster)
            return res.status(404).json({ message: "Order not found" });

        // Update master
        await orderMaster.update(updateData, { transaction });

        // Replace child items
        if (order_items) {
            await OrderChild.destroy({
                where: { order_child_master_id: order_master_id },
                transaction,
            });

            const childData = order_items.map((item) => ({
                ...item,
                order_child_master_id: order_master_id,
            }));

            await OrderChild.bulkCreate(childData, { transaction });
        }

        await transaction.commit();

        res.status(200).json({
            message: "Order updated successfully",
            data: orderMaster,
        });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            message: "Error updating order",
            error: error.message,
        });
    }
};
const Masterupdate = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { order_master_id, order_master_status } = req.body;

        // 1️⃣ Validation
        if (!order_master_id || order_master_status === undefined) {
            return res.status(400).json({
                message: "Order ID and status are required",
            });
        }

        // 2️⃣ Find order (lock row)
        const orderMaster = await OrderMaster.findOne({
            where: { order_master_id },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!orderMaster) {
            await transaction.rollback();
            return res.status(404).json({
                message: "Order not found",
            });
        }

        // 3️⃣ Prevent duplicate update
        if (orderMaster.order_master_status === order_master_status) {
            await transaction.rollback();
            return res.status(409).json({
                message: "Order status already updated",
                data: orderMaster,
            });
        }

        // 4️⃣ Update
        await orderMaster.update(
            { order_master_status },
            { transaction }
        );

        await transaction.commit();

        // 🔥 5️⃣ SOCKET EVENT (after commit only)
        if (req.io) {
            req.io.emit("orderStatusUpdated", {
                order_master_id,
                order_master_status,
                updated_at: new Date(),
            });
        }

        return res.status(200).json({
            message: "Order status updated successfully",
            data: orderMaster,
        });

    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({
            message: "Error updating order",
            error: error.message,
        });
    }
};


/* 🔴 DELETE ORDER */
const deleted = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const orderId = req.params.id;

        await OrderChild.destroy({
            where: { order_child_master_id: orderId },
            transaction,
        });

        const deleted = await OrderMaster.destroy({
            where: { order_master_id: orderId },
            transaction,
        });

        if (!deleted)
            return res.status(404).json({ message: "Order not found" });

        await transaction.commit();

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            message: "Error deleting order",
            error: error.message,
        });
    }
};
const userOrders = async (req, res) => {
    try {

        const userId = req.currentUser.user_id;

        const orders = await sequelize.query(
            `
      SELECT 
        om.*,
        u.user_name,
        ca.customer_address_city,
        ca.customer_address_pincode,
        ca.customer_address_description
      FROM tbl_order_master AS om
      LEFT JOIN tbl_users AS u 
        ON om.order_master_user_id = u.user_id
      LEFT JOIN tbl_customer_addresses AS ca
        ON om.order_master_address_id = ca.customer_address_id
      WHERE  
          om.order_master_user_id = :userId
      ORDER BY om.order_master_id DESC
      `,
            {
                replacements: {

                    userId,
                },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        res.status(200).json(orders);
    } catch (error) {
        console.error("Order index error:", error);
        res.status(500).json({
            message: "Error fetching orders",
            error: error.message,
        });
    }
};

module.exports = {
    store,
    index,
    Get,
    update,
    Masterupdate,
    deleted,
    indexchild,
    userOrders,
};
