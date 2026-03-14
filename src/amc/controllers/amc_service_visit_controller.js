const AmcServiceVisits = require("../models/amc_service_visit_model");

module.exports = {

  // CREATE VISIT
  store: async (req, res) => {
    try {

      const {
        contract_id,
        technician_id,
        visit_date,
        visit_status,
        service_report
      } = req.body;

      const visit = await AmcServiceVisits.create({
        contract_id,
        technician_id,
        visit_date,
        visit_status,
        service_report,
        created_by: req.user.id
      });

      return res.status(200).json({
        success: true,
        message: "Service visit created successfully",
        data: visit
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }
  },

  // LIST VISITS
  index: async (req, res) => {
    try {

      const visits = await AmcServiceVisits.findAll({
        order: [["visit_id", "DESC"]]
      });

      return res.status(200).json({
        success: true,
        data: visits
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }
  },

  // GET SINGLE VISIT
  Get: async (req, res) => {
    try {

      const visit = await AmcServiceVisits.findOne({
        where: { visit_id: req.params.id }
      });

      if (!visit) {
        return res.status(404).json({
          success: false,
          message: "Visit not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: visit
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }
  },

  // UPDATE VISIT
  update: async (req, res) => {
    try {

      const {
        visit_id,
        technician_id,
        visit_date,
        visit_status,
        service_report
      } = req.body;

      const visit = await AmcServiceVisits.findOne({
        where: { visit_id }
      });

      if (!visit) {
        return res.status(404).json({
          success: false,
          message: "Visit not found"
        });
      }

      await visit.update({
        technician_id,
        visit_date,
        visit_status,
        service_report
      });

      return res.status(200).json({
        success: true,
        message: "Visit updated successfully"
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }
  },

  // DELETE VISIT
  deleted: async (req, res) => {
    try {

      const visit = await AmcServiceVisits.findOne({
        where: { visit_id: req.params.id }
      });

      if (!visit) {
        return res.status(404).json({
          success: false,
          message: "Visit not found"
        });
      }

      await visit.destroy();

      return res.status(200).json({
        success: true,
        message: "Visit deleted successfully"
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }
  }

};