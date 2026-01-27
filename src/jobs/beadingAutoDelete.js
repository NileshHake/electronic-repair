const cron = require("node-cron");
const sequelize = require("../../config/db");

// ✅ Delete only expired + pending + not accepted
async function deleteOldPendingBeading() {
  try {
    await sequelize.query(
      `
      DELETE FROM tbl_beading_request
      WHERE beading_request_status = 0
        AND (beading_vender_accepted_id IS NULL OR beading_vender_accepted_id = 0)
        AND expires_at < NOW()
      `
    );

    console.log("✅ Beading auto delete executed");
  } catch (err) {
    console.error("❌ Beading auto delete error:", err.message);
  }
}

// ✅ Runs at 12 AM, 6 AM, 12 PM, 6 PM
function startBeadingAutoDeleteJob() {
  cron.schedule("0 0,6,12,18 * * *", async () => {
    console.log("⏳ Running Beading auto delete cron...");
    await deleteOldPendingBeading();
  });

  console.log("✅ Beading auto delete cron scheduled (4 times daily)");
}

module.exports = { startBeadingAutoDeleteJob };
