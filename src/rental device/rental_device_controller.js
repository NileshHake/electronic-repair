const { QueryTypes } = require("sequelize");
const sequelize = require("../../config/db");
const { getCreatedBy } = require("../helper/CurrentUser"); // if you need vendor from token
const { saveImage, deleteImage } = require("../helper/fileUpload");
const RentalDevice = require("./rental_device_model");

// ✅ CREATE
const store = async (req, res) => {
    try {
        const payload = { ...req.body };

        // ✅ vendor from login (optional)
        // payload.vendor_id = getCreatedBy(req.currentUser);

        const uploadedImages = [];

        // ✅ Use YOUR field name: "images"
        if (req.files && req.files.images) {
            const files = Array.isArray(req.files.images)
                ? req.files.images
                : [req.files.images];

            for (const file of files) {
                const savedName = await saveImage(file, "rental_device_images");
                uploadedImages.push(savedName);
            }
        }

        // ✅ If DB column type = JSON (recommended)
        payload.images = uploadedImages;
        payload.vendor_id = getCreatedBy(req.currentUser);

        // If DB column type = STRING/TEXT then use:
        // payload.images = JSON.stringify(uploadedImages);

        // ✅ auto set available_qty
        if (!payload.available_qty) {
            payload.available_qty = Number(payload.stock_qty || 0);
        }

        const device = await RentalDevice.create(payload);

        res.status(201).json({
            message: "Rental device created successfully",
            data: device,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error creating rental device",
            error: error.message,
        });
    }
};

// ✅ READ ALL
const index = async (req, res) => {
    try {
        // ✅ Get Vendor ID from login
        const VendorID = getCreatedBy(req.currentUser);

        const list = await sequelize.query(
            `
      SELECT 
        rd.*,

        -- MAIN CATEGORY NAME
        cat.category_name    AS device_category_name,

        -- SUB CATEGORY NAME
        subcat.category_name AS device_sub_category_name,

        -- BRAND NAME
        br.brand_name        AS device_brand_name

      FROM tbl_rental_devices AS rd

      LEFT JOIN tbl_categories AS cat
        ON rd.device_category = cat.category_id

      LEFT JOIN tbl_categories AS subcat
        ON rd.device_sub_category_id = subcat.category_id

      LEFT JOIN tbl_brands AS br
        ON rd.device_brand = br.brand_id

      WHERE rd.vendor_id = :VendorID

      ORDER BY rd.rental_device_id DESC
      `,
            {
                replacements: { VendorID },
                type: QueryTypes.SELECT,
            }
        );

        return res.status(200).json(list);
    } catch (error) {
        console.error("❌ Error fetching rental devices:", error);
        return res.status(500).json({
            message: "Error fetching rental devices",
            error: error.message,
        });
    }
};


// ✅ READ SINGLE
const Get = async (req, res) => {
    try {
        const device = await RentalDevice.findByPk(req.params.id);
        if (!device) return res.status(404).json({ message: "Rental device not found" });
        res.status(200).json(device);
    } catch (error) {
        res.status(500).json({ message: "Error fetching rental device", error: error.message });
    }
};

// ✅ UPDATE
const update = async (req, res) => {
    try {
        const { rental_device_id } = req.body;

        const device = await RentalDevice.findByPk(rental_device_id);
        if (!device) {
            return res.status(404).json({ message: "Rental device not found" });
        }

        /* ✅ STOCK / AVAILABLE CLAMP */
        const nextStock =
            req.body.stock_qty !== undefined
                ? Number(req.body.stock_qty)
                : Number(device.stock_qty || 0);

        let nextAvailable =
            req.body.available_qty !== undefined
                ? Number(req.body.available_qty)
                : Number(device.available_qty || 0);

        if (nextAvailable > nextStock) nextAvailable = nextStock;

        /* ✅ CURRENT IMAGES FROM DB */
        let dbImages = [];
        try {
            dbImages = Array.isArray(device.images)
                ? device.images
                : JSON.parse(device.images || "[]");
        } catch {
            dbImages = [];
        }

        /* ✅ KEEP IMAGES FROM FRONTEND */
        let keepImages = [];
        try {
            keepImages = req.body.existing_images
                ? JSON.parse(req.body.existing_images)
                : dbImages; // if not sent, keep all
        } catch {
            keepImages = dbImages;
        }

        // ✅ REMOVED = DB - KEEP  => delete from folder
        const removedImages = dbImages.filter((img) => !keepImages.includes(img));
        for (const img of removedImages) {
            await deleteImage("rental_device_images", img);
        }

        /* ✅ UPLOAD NEW FILES */
        const newImages = [];
        if (req.files && req.files.images) {
            const files = Array.isArray(req.files.images)
                ? req.files.images
                : [req.files.images];

            for (const file of files) {
                const savedName = await saveImage(file, "rental_device_images");
                newImages.push(savedName);
            }
        }

        /* ✅ FINAL IMAGES = KEEP + NEW */
        const finalImages = [...keepImages, ...newImages];

        /* ✅ UPDATE DEVICE */
        const payload = { ...req.body };

        // remove helper field so it doesn’t try to update column
        delete payload.existing_images;

        await device.update({
            ...payload,
            stock_qty: nextStock,
            available_qty: nextAvailable,
            images: finalImages, // JSON column
            // images: JSON.stringify(finalImages), // if STRING column
        });

        return res.status(200).json({
            message: "✅ Rental device updated successfully",
            data: device,
        });
    } catch (error) {
        console.error("❌ Error updating rental device:", error);
        return res.status(500).json({
            message: "Error updating rental device",
            error: error.message,
        });
    }
};

// ✅ DELETE
const deleted = async (req, res) => {
    try {
        const deleted = await RentalDevice.destroy({
            where: { rental_device_id: req.params.id },
        });
        if (!deleted) return res.status(404).json({ message: "Rental device not found" });
        res.status(200).json({ message: "Rental device deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting rental device", error: error.message });
    }
};

module.exports = {
    store,
    index,
    Get,
    update,
    deleted,
};