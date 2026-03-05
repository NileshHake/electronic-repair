const { QueryTypes } = require("sequelize");
const sequelize = require("../../config/db");
const RentalDevice = require("../rental device/rental_device_model");
const RentalRequest = require("./rental_request_model");
const dayjs = require("dayjs");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const { generateNumber } = require("../invoice number/invoice_number_controller");
const User = require("../auth/user_model");
// helper: calc duration days (inclusive)
const calcDays = (from_date, to_date) => {
    const from = new Date(from_date);
    const to = new Date(to_date);
    const diff = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
};

// ✅ CREATE
const store = async (req, res) => {
    try {
        const payload = { ...req.body };

        payload.customer_id = req.currentUser.user_id

        // ✅ validate device exists + active
        const device = await RentalDevice.findByPk(payload.req_rental_device_id);
        if (!device) return res.status(404).json({ message: "Rental device not found" });

        if (String(device.status) !== "active") {
            return res.status(400).json({ message: "This device is not active" });
        }

        const quotationNo = await generateNumber({
            businessId: payload.selected_vendor_id || 1,
            type: "requestinvoice",
        });

        // ✅ stock check (simple)
        if (Number(device.available_qty || 0) <= 0) {
            return res.status(400).json({ message: "Device is not available right now" });
        }

        payload.request_status = payload.request_status ?? 0;

        const request = await RentalRequest.create({ ...payload, invoice_no: quotationNo });

        res.status(201).json({ message: "Rental request created successfully", data: request });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating rental request", error: error.message });
    }
};

// ✅ READ ALL
const index = async (req, res) => {
    try {

        const userType = req.currentUser.user_type;
        const userId = req.currentUser.user_id;

        let whereClauses = [];
        let replacements = {};

        // ✅ User filtering
        if (userType == 1 || userType == 2) {
            whereClauses.push("req.selected_vendor_id = :user_id");
            replacements.user_id = userId;
        } else if (userType == 3) {
            whereClauses.push("ven.user_created_by = :user_created_by");
            replacements.user_created_by = req.currentUser.user_created_by;
        }

        const whereCondition = whereClauses.length
            ? `WHERE ${whereClauses.join(" AND ")}`
            : "";

        const list = await sequelize.query(
            `
            SELECT
                req.*,
                dev.device_name,
                dev.device_model,

                cust.user_id              AS customer_id,
                cust.user_name            AS customer_name,
                cust.user_phone_number    AS customer_phone_number,
                cust.user_email           AS customer_email,

                ven.user_id               AS vendor_id,
                ven.user_name             AS vendor_name,
                ven.user_phone_number     AS vendor_phone_number,
                ven.user_email            AS vendor_email,

                addr.*

            FROM tbl_rental_requests req

            LEFT JOIN tbl_rental_devices dev
                ON req.req_rental_device_id = dev.rental_device_id

            LEFT JOIN tbl_users cust
                ON req.customer_id = cust.user_id

            LEFT JOIN tbl_users ven
                ON req.selected_vendor_id = ven.user_id

            LEFT JOIN tbl_customer_addresses addr
                ON req.address_id = addr.customer_address_id

            ${whereCondition}

            ORDER BY req.rental_request_id ASC
            `,
            {
                replacements,
                type: QueryTypes.SELECT,
            }
        );

        res.status(200).json(list);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Error fetching rental requests",
            error: error.message,
        });
    }
};

const listindexweb = async (req, res) => {
    try {

        const userId = req.currentUser.user_id;
        const userType = req.currentUser.user_type;

        let whereClauses = [];
        let replacements = {};

        // ✅ User filtering
        if (userType == 1 || userType == 2) {
            whereClauses.push("req.selected_vendor_id = :user_id");
            replacements.user_id = userId;
        } else if (userType == 6) {
            whereClauses.push("req.customer_id = :user_id");
            replacements.user_id = userId;
        } else if (userType == 3 || userType == 4 || userType == 5) {
            whereClauses.push("ven.user_created_by = :user_created_by");
            replacements.user_created_by = req.currentUser.user_created_by;
        }

        const whereCondition = whereClauses.length
            ? `WHERE ${whereClauses.join(" AND ")}`
            : "";

        const list = await sequelize.query(
            `
            SELECT
                req.*,
                dev.device_name,
                dev.device_model,

                cust.user_id              AS customer_id,
                cust.user_name            AS customer_name,
                cust.user_phone_number    AS customer_phone_number,
                cust.user_email           AS customer_email,

                ven.user_id               AS vendor_id,
                ven.user_name             AS vendor_name,
                ven.user_phone_number     AS vendor_phone_number,
                ven.user_email            AS vendor_email,

                addr.*

            FROM tbl_rental_requests req

            LEFT JOIN tbl_rental_devices dev
                ON req.req_rental_device_id = dev.rental_device_id

            LEFT JOIN tbl_users cust
                ON req.customer_id = cust.user_id

            LEFT JOIN tbl_users ven
                ON req.selected_vendor_id = ven.user_id

            LEFT JOIN tbl_customer_addresses addr
                ON req.address_id = addr.customer_address_id

            ${whereCondition}

            ORDER BY req.rental_request_id ASC
            `,
            {
                replacements,
                type: QueryTypes.SELECT,
            }
        );

        res.status(200).json(list);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Error fetching rental requests",
            error: error.message,
        });
    }
};
const listindex = async (req, res) => {
    try {

        const userId = req.currentUser.user_id;
        const userType = req.currentUser.user_type;

        const {
            start_date,
            end_date,
            status,
            page = 1,
            limit = 10
        } = req.body;
 
        const offset = (page - 1) * limit;

        let whereClauses = [];
        let replacements = {
            limit: Number(limit),
            offset: Number(offset)
        };

        // ✅ User filtering
        if (userType == 1 || userType == 2) {
            whereClauses.push("req.selected_vendor_id = :user_id");
            replacements.user_id = userId;

        } else if (userType == 6) {
            whereClauses.push("req.customer_id = :user_id");
            replacements.user_id = userId;

        } else if (userType == 3 || userType == 4 || userType == 5) {
            whereClauses.push("ven.user_created_by = :user_created_by");
            replacements.user_created_by = req.currentUser.user_created_by;
        }

        // ✅ Start Date filter
        if (start_date && end_date) {
            whereClauses.push("DATE(req.from_date) BETWEEN :start_date AND :end_date");
            replacements.start_date = start_date;
            replacements.end_date = end_date;

        }

        // ✅ Status filter
        if (status) {
            whereClauses.push("req.request_status = :status");
            replacements.status = status;
        }

        const whereCondition = whereClauses.length
            ? `WHERE ${whereClauses.join(" AND ")}`
            : "";

        // ✅ MAIN DATA QUERY
        const list = await sequelize.query(
            `
            SELECT
                req.*,
                dev.device_name,
                dev.device_model,

                cust.user_id              AS customer_id,
                cust.user_name            AS customer_name,
                cust.user_phone_number    AS customer_phone_number,
                cust.user_email           AS customer_email,

                ven.user_id               AS vendor_id,
                ven.user_name             AS vendor_name,
                ven.user_phone_number     AS vendor_phone_number,
                ven.user_email            AS vendor_email,

                addr.*

            FROM tbl_rental_requests req

            LEFT JOIN tbl_rental_devices dev
                ON req.req_rental_device_id = dev.rental_device_id

            LEFT JOIN tbl_users cust
                ON req.customer_id = cust.user_id

            LEFT JOIN tbl_users ven
                ON req.selected_vendor_id = ven.user_id

            LEFT JOIN tbl_customer_addresses addr
                ON req.address_id = addr.customer_address_id

            ${whereCondition}

            ORDER BY req.rental_request_id DESC
            LIMIT :limit OFFSET :offset
            `,
            {
                replacements,
                type: QueryTypes.SELECT,
            }
        );

        // ✅ COUNT QUERY
        const totalCountResult = await sequelize.query(
            `
            SELECT COUNT(*) as total

            FROM tbl_rental_requests req

            LEFT JOIN tbl_users ven
                ON req.selected_vendor_id = ven.user_id

            ${whereCondition}
            `,
            {
                replacements,
                type: QueryTypes.SELECT,
            }
        );

        const total = totalCountResult[0].total;


        res.status(200).json(list);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching rental requests",
            error: error.message,
        });

    }
};
// ✅ READ SINGLE
const Get = async (req, res) => {
    try {
        const request = await RentalRequest.findByPk(req.params.id);
        if (!request) return res.status(404).json({ message: "Rental request not found" });
        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: "Error fetching rental request", error: error.message });
    }
};

// ✅ UPDATE
const update = async (req, res) => {
    try {
        const request = await RentalRequest.findByPk(req.body.rental_request_id);
        if (!request) return res.status(404).json({ message: "Rental request not found" });

        // if dates updated -> recalc duration_days
        let duration_days = request.duration_days;
        const from_date = req.body.from_date ?? request.from_date;
        const to_date = req.body.to_date ?? request.to_date;

        if (req.body.from_date || req.body.to_date) {
            const days = calcDays(from_date, to_date);
            if (!days || days <= 0) {
                return res.status(400).json({ message: "Invalid from_date / to_date" });
            }
            duration_days = days;
        }

        await request.update({
            ...req.body,
            duration_days,
        });

        res.status(200).json({ message: "Rental request updated successfully", data: request });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating rental request", error: error.message });
    }
};
const rentalInvoicePdf = async (req, res) => {
    try {
        const { id } = req.params;

        const rental = await RentalRequest.findByPk(id);

        if (!rental) {
            return res.status(404).json({
                status: false,
                message: "Rental request not found",
            });
        }

        const device = await RentalDevice.findByPk(rental.req_rental_device_id);

        const [vendor, customer] = await Promise.all([
            rental.selected_vendor_id
                ? User.findByPk(rental.selected_vendor_id)
                : null,
            rental.customer_id ? User.findByPk(rental.customer_id) : null,
        ]);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=Rental-Invoice-${id}.pdf`
        );

        const doc = new PDFDocument({
            size: "A4",
            margin: 28,
            bufferPages: true,
        });

        doc.pipe(res);

        const theme = {
            text: "#111827",
            muted: "#6b7280",
            line: "#e5e7eb",
            soft: "#f3f4f6",
            softer: "#f9fafb",
            rowAlt: "#fcfcfd",
        };

        const PAGE = () => ({
            w: doc.page.width,
            h: doc.page.height,
            left: doc.page.margins.left,
            right: doc.page.width - doc.page.margins.right,
            top: doc.page.margins.top,
            bottom: doc.page.height - doc.page.margins.bottom,
            contentW:
                doc.page.width -
                doc.page.margins.left -
                doc.page.margins.right,
        });

        const safe = (v) =>
            v !== null && v !== undefined && String(v).trim()
                ? String(v)
                : "N/A";

        const money = (val) => {
            const n = Number(val || 0);
            return `Rs. ${n.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
            })}`;
        };

        const drawHLine = (y) => {
            const { left, right } = PAGE();
            doc
                .moveTo(left, y)
                .lineTo(right, y)
                .strokeColor(theme.line)
                .stroke();
        };

        // ================= HEADER =================

        const drawHeader = () => {
            const { left, right } = PAGE();
            const y0 = PAGE().top;

            doc
                .font("Helvetica-Bold")
                .fontSize(22)
                .fillColor(theme.text)
                .text(vendor?.user_name || "Vendor", left, y0);

            doc
                .font("Helvetica-Bold")
                .fontSize(18)
                .text("RENTAL INVOICE", right - 200, y0, {
                    width: 200,
                    align: "right",
                });

            doc
                .font("Helvetica")
                .fontSize(8)
                .fillColor(theme.muted)
                .text(`Invoice No: RENT-${rental.rental_request_id}`, right - 200, y0 + 22, {
                    width: 200,
                    align: "right",
                })
                .text(`Date: ${safe(rental.create_date)}`, right - 200, y0 + 34, {
                    width: 200,
                    align: "right",
                });

            drawHLine(y0 + 60);

            return y0 + 78;
        };

        // ================= BILLING =================

        const drawBilling = (y) => {
            const { left, contentW } = PAGE();

            const colGap = 16;
            const colW = (contentW - colGap) / 2;

            doc.font("Helvetica-Bold").fontSize(9);

            doc.text("FROM", left, y);
            doc.text("BILL TO", left + colW + colGap, y);

            y += 12;

            doc.roundedRect(left, y, colW, 82, 8).fill(theme.softer);
            doc.roundedRect(left + colW + colGap, y, colW, 82, 8).fill(theme.softer);

            doc.font("Helvetica-Bold").fontSize(9).fillColor(theme.text);

            doc.text(safe(vendor?.user_name), left + 10, y + 10);

            doc.font("Helvetica").fontSize(8).fillColor(theme.muted);

            doc.text(safe(vendor?.user_email), left + 10, y + 24);
            doc.text(safe(vendor?.user_phone_number), left + 10, y + 36);

            doc.font("Helvetica-Bold").fontSize(9).fillColor(theme.text);

            doc.text(safe(customer?.user_name), left + colW + colGap + 10, y + 10);

            doc.font("Helvetica").fontSize(8).fillColor(theme.muted);

            doc.text(safe(customer?.user_email), left + colW + colGap + 10, y + 24);
            doc.text(
                safe(customer?.user_phone_number),
                left + colW + colGap + 10,
                y + 36
            );

            return y + 100;
        };

        // ================= TABLE =================

        const drawTable = (y) => {
            const { left, contentW } = PAGE();

            const rowH = 20;

            // Column positions
            const col = {
                sr: left + 5,
                device: left + 40,
                type: left + 230,
                duration: left + 300,
                amount: left + 380,
                total: left + 460,
            };

            // Header Background
            doc.rect(left, y, contentW, rowH).fill(theme.soft);

            doc.font("Helvetica-Bold").fontSize(8).fillColor(theme.text);

            doc.text("SR", col.sr, y + 6);
            doc.text("DEVICE", col.device, y + 6);
            doc.text("TYPE", col.type, y + 6);
            doc.text("DURATION", col.duration, y + 6);
            doc.text("AMOUNT", col.amount, y + 6);
            doc.text("TOTAL", col.total, y + 6);

            y += rowH;

            doc.font("Helvetica").fontSize(8);

            const total = Number(rental.rent || 0) * Number(rental.duration || 0);

            doc.text("1", col.sr, y + 6);
            doc.text(safe(device?.device_name), col.device, y + 6, { width: 180 });
            doc.text(safe(rental.rent_type), col.type, y + 6);
            doc.text(`${safe(rental.duration)} ${safe(rental.rent_type)}`, col.duration, y + 6);
            doc.text(money(rental.rent), col.amount, y + 6);
            doc.text(money(total), col.total, y + 6);

            y += rowH;

            drawHLine(y);

            return y + 10;
        };

        // ================= TOTALS =================

        const drawTotals = (y) => {
            const { right } = PAGE();

            const boxW = 220;
            const x = right - boxW;

            doc.font("Helvetica").fontSize(9).fillColor(theme.muted);

            doc.text("Security Deposit", x, y);
            doc.text(money(rental.security_deposit), x, y, {
                width: boxW,
                align: "right",
            });

            y += 14;

            doc.text("Delivery Fee", x, y);
            doc.text(money(rental.delivery_fee), x, y, {
                width: boxW,
                align: "right",
            });

            y += 14;

            doc.text("Base Amount", x, y);
            doc.text(money(rental.base_amount), x, y, {
                width: boxW,
                align: "right",
            });

            y += 14;

            doc.text(`GST (${rental.gst_percentage}%)`, x, y);
            doc.text(money(rental.gst_amount), x, y, {
                width: boxW,
                align: "right",
            });

            y += 20;

            doc.roundedRect(x - 8, y - 6, boxW + 16, 26, 10).fill(theme.softer);

            doc.font("Helvetica-Bold").fontSize(11).fillColor(theme.text);

            doc.text("Grand Total", x, y);
            doc.text(money(rental.total_amount), x, y, {
                width: boxW,
                align: "right",
            });

            return y + 30;
        };

        // ================= TERMS =================

        const drawTerms = (y) => {
            const terms = [
                "Rental device must be returned before due date.",
                "Security deposit will be refunded after inspection.",
                "Damage charges will be deducted from deposit.",
                "Late return may incur additional charges.",
                "Delivery charges are non-refundable.",
            ];

            doc.font("Helvetica-Bold").fontSize(11).text("Terms & Conditions", PAGE().left, y);

            y += 16;

            doc.font("Helvetica").fontSize(9);

            for (const term of terms) {
                doc.text(`• ${term}`, PAGE().left + 10, y);
                y += 12;
            }

            return y;
        };

        // ================= FOOTER =================

        const addFooters = () => {
            const range = doc.bufferedPageRange();
            const totalPages = range.count;

            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);

                const { left, right, bottom, contentW } = PAGE();

                doc
                    .moveTo(left, bottom - 22)
                    .lineTo(right, bottom - 22)
                    .strokeColor(theme.line)
                    .stroke();

                doc
                    .font("Helvetica")
                    .fontSize(7)
                    .fillColor(theme.muted);

                doc.text("Thank you for your business!", left, bottom - 16, {
                    width: contentW,
                    align: "left",
                });

                doc.text(`Page ${i + 1} of ${totalPages}`, left, bottom - 16, {
                    width: contentW,
                    align: "right",
                });
            }
        };

        // ================= RENDER =================

        let y = drawHeader();

        y = drawBilling(y);

        y = drawTable(y);

        y = drawTotals(y);

        y += 10;

        drawTerms(y);

        addFooters();

        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            message: "PDF generation failed",
        });
    }
};
const StatusUpdate = async (req, res) => {
    try {

        const { rental_request_id, request_status } = req.body;

        if (!rental_request_id) {
            return res.status(400).json({ message: "rental_request_id is required" });
        }

        const request = await RentalRequest.findByPk(rental_request_id);

        if (!request) {
            return res.status(404).json({ message: "Rental request not found" });
        }

        const updateData = {
            request_status
        };

        /* ---------- CANCEL ---------- */

        if (request_status == 4) {
            updateData.cancelled_by = req.currentUser.user_id;
        }

        /* ---------- START RENTAL ---------- */

        if (request_status == 3) {

            const rentType = request.rent_type;
            const duration = request.duration;

            if (!rentType || !duration) {
                return res.status(400).json({
                    message: "rent_type or duration missing"
                });
            }

            const startDate = dayjs();

            updateData.delivered_at = startDate.toDate();
            updateData.from_date = startDate.format("YYYY-MM-DD");

            let toDate;

            if (rentType == "DAY") {
                toDate = startDate.add(duration, "day");
            }

            if (rentType == "WEEK") {
                toDate = startDate.add(duration, "week");
            }

            if (rentType == "MONTH") {
                toDate = startDate.add(duration, "month");
            }

            updateData.to_date = toDate.format("YYYY-MM-DD");
        }

        /* ---------- RETURN ---------- */

        if (request_status == 6) {
            updateData.returned_at = new Date();
        }

        await request.update(updateData);

        res.status(200).json({
            message: "Status updated successfully",
            data: request
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error updating rental request",
            error: error.message
        });

    }
};

// ✅ DELETE
const deleted = async (req, res) => {
    try {
        const deleted = await RentalRequest.destroy({
            where: { rental_request_id: req.params.id },
        });
        if (!deleted) return res.status(404).json({ message: "Rental request not found" });
        res.status(200).json({ message: "Rental request deleted successfully" });
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: "Error deleting rental request", error: error.message });
    }
};

module.exports = {
    store,
    index,
    listindex,
    rentalInvoicePdf,
    Get,
    update,
    StatusUpdate,
    deleted,
    listindexweb,
};