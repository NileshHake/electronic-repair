const WorkflowChild = require("../WorkFLow/work_flow_child_model");
const WorkflowMaster = require("../WorkFLow/work_flow_master_model");

 

async function createDefaultWorkflow(userId) {
  try {
    const colorOptions = [
      { label: "Primary", value: "bg-primary" },
      { label: "Secondary", value: "bg-secondary" },
      { label: "Success", value: "bg-success" },
      { label: "Info", value: "bg-info" },
      { label: "Warning", value: "bg-warning" },
      { label: "Danger", value: "bg-danger" },
      { label: "Dark", value: "bg-dark" },
    ];

    // ✅ Create the workflow master record
    const workflow = await WorkflowMaster.create({
      workflow_create_user: userId, // dynamic userId
      workflow_name: "Job Processing Workflow",
      workflow_status: 1,
    });

    // ✅ Define open and closed stages
    const openStages = [
      "Requested",
      "Accepted",
      "Pickup",
      "Transit",
      "Received",
      "Inward",
      "Processing",
      "Completed",
      "Cancelled",
      "Vendor Pickup",
      "Vendor Transit",
      "Delivered",
    ];

    const closedStages = [
      { name: "Won", color: "bg-success" },
      { name: "Lost", color: "bg-danger" },
    ];

    // ✅ Combine and map all stages
    const stages = [
      // Open stages (workflow_close_stage = 0)
      ...openStages.map((name, index) => ({
        workflow_master_id: workflow.workflow_id,
        workflow_stage_name: name,
        workflow_close_stage: 0,
        workflow_stage_color: colorOptions[index % colorOptions.length].value,
      })),

      // Closed stages (workflow_close_stage = 1)
      ...closedStages.map((stage) => ({
        workflow_master_id: workflow.workflow_id,
        workflow_stage_name: stage.name,
        workflow_close_stage: 1,
        workflow_stage_color: stage.color,
      })),
    ];

    // ✅ Bulk insert all workflow stages
    await WorkflowChild.bulkCreate(stages);

    return {
      success: true,
      message: "Default workflow created successfully",
      workflow_id: workflow.workflow_id,
    };
  } catch (error) {
    console.error("Error creating workflow:", error);
    return {
      success: false,
      message: "Error creating workflow",
      error: error.message,
    };
  }
}

module.exports = { createDefaultWorkflow };
