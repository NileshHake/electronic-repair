const cron = require("node-cron");
const sequelize = require("../../config/db");

// ✅ Expire rentals automatically
async function expireOldRentals() {
  try {

    await sequelize.query(`
      UPDATE tbl_rental_requests
      SET request_status = 5
      WHERE request_status = 3
      AND to_date IS NOT NULL
      AND to_date < CURDATE()
    `);

    console.log("✅ Rental expire cron executed");

  } catch (err) {

    console.error("❌ Rental expire cron error:", err.message);

  }
}


// ✅ Run every day 12 AM
function startRentalExpireJob() {

  cron.schedule("0 0 * * *", async () => {

    console.log("⏳ Running rental expire cron...");

    await expireOldRentals();

  });

  console.log("✅ Rental expire cron scheduled (daily 12 AM)");
}

module.exports = { startRentalExpireJob };