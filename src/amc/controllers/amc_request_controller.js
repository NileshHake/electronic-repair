
const sequelize = require("../../../config/db");
const { QueryTypes } = require("sequelize");

const AMCRequest = require("../models/amc_request_model");
const AMCRequestItems = require("../models/amc_request_items_model");
const { getCreatedBy } = require("../../helper/CurrentUser");


// ================= STORE =================

const store = async (req, res) => {

    try {

        const {

            customer_address_id,
            service_type,
            billing_type,
            autopay,
            items
        } = req.body;

        const request = await AMCRequest.create({
            customer_id: req.currentUser.user_id,
            service_type: service_type || "carry_in",
            billing_type: billing_type || "monthly",
            autopay: autopay || "off",
            customer_address_id,
            vendor_id: 1
        });

        for (let item of items) {

            await AMCRequestItems.create({
                request_id: request.request_id,
                product_id: item.product_id,
                product_name: item.product_name,
                qty: item.qty,
                problem_note: item.problem_note
            });

        }

        res.status(201).json({
            message: "AMC Request Created Successfully",
            data: request
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Error creating request",
            error: error.message
        });

    }

};



// ================= LIST (NATIVE QUERY) =================
const index = async (req, res) => {
    try {
        const userType = req.currentUser.user_type;
        const userId = req.currentUser.user_id;
        const createdBy = req.currentUser.user_created_by;

        let whereClauses = [];
        let replacements = {};

        if (userType == 1 || userType == 2) {
            whereClauses.push("r.vendor_id = :user_id");
            replacements.user_id = userId;

        } else if (userType == 3) {
            whereClauses.push("r.vendor_id = :created_by");
            replacements.created_by = createdBy;

        } else if (userType == 4 || userType == 5) {
            whereClauses.push("r.vendor_id = :user_id");
            replacements.user_id = userId;

        } else if (userType == 6) {
            whereClauses.push("r.customer_id = :user_id");
            replacements.user_id = userId;
        }

        const whereCondition =
            whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

        const data = await sequelize.query(
            `SELECT
        r.*,

        a.customer_address_description,
        a.customer_address_city,
        a.customer_address_taluka,
        a.customer_address_district,
        a.customer_address_state,
        a.customer_address_pincode,
        a.customer_address_mobile,

        cu.user_name AS customer_name,
        cu.user_email AS customer_email,
        cu.user_phone_number AS customer_phone,

        v.user_name AS vendor_name,
        v.user_email AS vendor_email,
        v.user_phone_number AS vendor_phone

      FROM tbl_amc_requests r

      LEFT JOIN tbl_customer_addresses a
        ON r.customer_address_id = a.customer_address_id

      LEFT JOIN tbl_users cu
        ON r.customer_id = cu.user_id

      LEFT JOIN tbl_users v
        ON r.vendor_id = v.user_id

      ${whereCondition}

      ORDER BY r.request_id DESC`,
            {
                replacements,
                type: QueryTypes.SELECT,
            }
        );

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching requests",
            error: error.message,
        });
    }
};

// ================= SINGLE =================

const Get = async (req, res) => {

    try {

        const id = req.params.id;

        const request = await AMCRequest.findByPk(id);

        if (!request)
            return res.status(404).json({ message: "Request not found" });

        const items = await AMCRequestItems.findAll({
            where: { request_id: id }
        });

        res.status(200).json({
            request,
            items
        });

    } catch (error) {

        res.status(500).json({
            message: "Error fetching request",
            error: error.message
        });

    }

};



// ================= UPDATE =================

const update = async (req, res) => {

    try {

        const {
            request_id,
            service_type,
            billing_type,
            autopay,
            customer_address_id,
            items
        } = req.body;

        const request = await AMCRequest.findByPk(request_id);


        await request.update({
            service_type: service_type || "carry_in",
            billing_type: billing_type || "monthly",
            autopay: autopay || "off",
            customer_address_id,
        })
        if (!request)
            return res.status(404).json({ message: "Request not found" });


        await AMCRequestItems.destroy({
            where: { request_id }
        });

        for (let item of items) {

            await AMCRequestItems.create({
                request_id,
                product_id: item.product_id,
                product_name: item.product_name,
                qty: item.qty,
                problem_note: item.problem_note
            });

        }

        res.status(200).json({
            message: "Request updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Error updating request",
            error: error.message
        });

    }

};

const Statusupdate = async (req, res) => {

    try {

        const {
            request_id,
            request_status,


        } = req.body;

        const request = await AMCRequest.findByPk(request_id);

        if (!request) return res.status(404).json({ message: "Request not found" });

        request.request_status = request_status;
        await request.save();

        res.status(200).json({
            message: "Request updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Error updating request",
            error: error.message
        });

    }

};

const childGet = async (req, res) => {
    try {
        const { id } = req.params;
        const requests = await AMCRequestItems.findAll({
            where: { request_id: id }
        });

        // Check if we actually found anything
        if (!requests || requests.length === 0) {
            console.log("NOt Found");

            return res.status(404).json({
                success: false,
                message: "No AMC requests found for this ID."
            });
        }

        // Return the data with a 200 OK status
        return res.status(200).json(requests);

    } catch (error) {
        console.error("Error fetching AMC requests:", error);

        // Always send a response in the catch block!
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

// ================= DELETE =================

const deleted = async (req, res) => {

    try {

        const id = req.params.id;

        await AMCRequestItems.destroy({
            where: { request_id: id }
        });

        await AMCRequest.destroy({
            where: { request_id: id }
        });

        res.status(200).json({
            message: "Request deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Error deleting request",
            error: error.message
        });

    }

};

module.exports = {
    store,
    index,
    Get,
    update,
    childGet,
    Statusupdate,
    deleted
};