const AmcContracts = require("../models/amc_contract_model");

module.exports = {

    // CREATE CONTRACT
    store: async (req, res) => {
        try {

            const {
                quotation_id,
                customer_id,
                vendor_id,
                start_date,
                end_date,
                total_visits,
                remaining_visits
            } = req.body;

            const contract = await AmcContracts.create({
                quotation_id,
                customer_id,
                vendor_id,
                start_date,
                end_date,
                total_visits,
                remaining_visits,
                created_by: req.user.id
            });

            return res.status(200).json({
                success: true,
                message: "AMC Contract created successfully",
                data: contract
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // LIST CONTRACTS
    index: async (req, res) => {
        try {

            const contracts = await AmcContracts.findAll({
                order: [["contract_id", "DESC"]]
            });

            return res.status(200).json({
                success: true,
                data: contracts
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // GET SINGLE CONTRACT
    Get: async (req, res) => {
        try {

            const contract = await AmcContracts.findOne({
                where: { contract_id: req.params.id }
            });

            if (!contract) {
                return res.status(404).json({
                    success: false,
                    message: "Contract not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: contract
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // UPDATE CONTRACT
    update: async (req, res) => {
        try {

            const {
                contract_id,
                start_date,
                end_date,
                total_visits,
                remaining_visits,
                contract_status
            } = req.body;

            const contract = await AmcContracts.findOne({
                where: { contract_id }
            });

            if (!contract) {
                return res.status(404).json({
                    success: false,
                    message: "Contract not found"
                });
            }

            await contract.update({
                start_date,
                end_date,
                total_visits,
                remaining_visits,
                contract_status
            });

            return res.status(200).json({
                success: true,
                message: "Contract updated successfully"
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // DELETE CONTRACT
    deleted: async (req, res) => {
        try {

            const contract = await AmcContracts.findOne({
                where: { contract_id: req.params.id }
            });

            if (!contract) {
                return res.status(404).json({
                    success: false,
                    message: "Contract not found"
                });
            }

            await contract.destroy();

            return res.status(200).json({
                success: true,
                message: "Contract deleted successfully"
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

};