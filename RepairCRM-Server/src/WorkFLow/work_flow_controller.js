const sequelize = require("../../config/db");
const { getCreatedBy } = require("../helper/CurrentUser");
const WorkflowChild = require("./work_flow_child_model");
const WorkflowMaster = require("./work_flow_master_model");

// ======================== INDEX ========================
const index = async (req, res) => {
  try {
    const workflows = await WorkflowMaster.findAll({
      where: {
        workflow_create_user: getCreatedBy(req.currentUser),
      },
    });
    const workflowChildren = await WorkflowChild.findAll();

    const result = workflows.map((flow) => {
      const children = workflowChildren.filter(
        (child) => flow.workflow_id === child.workflow_master_id
      );
      return { ...flow.toJSON(), children };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== INDEX STAGE ========================
const indexStage = async (req, res) => {
  try {
    const { id } = req.params;
    const workflowChildren = await WorkflowChild.findAll({
      where: {
        workflow_master_id: id,
      },
    });
    res.status(200).json(workflowChildren);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== SHOW ========================
const show = async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = await WorkflowMaster.findByPk(id, {
      include: [{ model: WorkflowChild, as: "children" }],
    });

    if (!workflow)
      return res
        .status(404)
        .json({ success: false, message: "Workflow not found" });

    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== STORE WORKFLOW ========================
const store = async (req, res) => {
  const parseNestedFields = (prefix, body) =>
    Object.keys(body)
      .filter((key) => key.startsWith(`${prefix}[`))
      .reduce((acc, key) => {
        const match = key.match(/\[(\d+)\]\[(\w+)\]/);
        if (match) {
          const index = parseInt(match[1], 10);
          const field = match[2];
          if (!acc[index]) acc[index] = {};
          acc[index][field] = body[key];
        }
        return acc;
      }, []);

  const { workflow_name } = req.body;

  try {
    if (!workflow_name)
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });

    const children = parseNestedFields("children", req.body);
    const closeChildren = parseNestedFields("CloseStagechildren", req.body);

    const newWorkflow = await WorkflowMaster.create({
      workflow_create_user: getCreatedBy(req.currentUser),
      workflow_name,
    });

    const openStages = children.map((child, index) => ({
      workflow_master_id: newWorkflow.workflow_id,
      workflow_stage_name: child.workflow_stages,
      workflow_stage_color: child.workflow_stage_color,
      workflow_stage_attachment: child.workflow_stage_attachment,
      workflow_stage_otp: child.workflow_stage_otp,
      workflow_close_stage: 0,
      workflow_stage_created_user_id: getCreatedBy(req.currentUser),
    }));

    const closeStages = closeChildren.map((child, index) => ({
      workflow_master_id: newWorkflow.workflow_id,
      workflow_stage_name: child.workflow_close_stages,
      workflow_stage_color: child.workflow_stage_color,
      workflow_stage_attachment: child.workflow_stage_attachment,
      workflow_stage_otp: child.workflow_stage_otp,
      workflow_stage_created_user_id: getCreatedBy(req.currentUser),
      workflow_close_stage: 1,
    }));

    await WorkflowChild.bulkCreate([...openStages, ...closeStages]);

    res.status(201).json({
      success: true,
      message: "Workflow created successfully",
      status: 1,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== STORE STAGE ========================
const storeStage = async (req, res) => {
  try {
    const {
      workflow_master_id,
      workflow_close_stage,
      workflow_stage_name,
      workflow_stage_color,
      workflow_stage_attachment,
      workflow_stage_otp,
      workflow_child_status,
    } = req.body;

    await WorkflowChild.create({
      workflow_child_status,
      workflow_master_id,
      workflow_close_stage,
      workflow_stage_color,
      workflow_stage_attachment,
      workflow_stage_otp,
      workflow_stage_name,
      workflow_stage_created_user_id: getCreatedBy(req.currentUser),
    });

    res.status(201).json({
      success: true,
      message: "Stage created successfully",
      status: 1,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== UPDATE WORKFLOW ========================
const update = async (req, res) => {
  const { workflow_id, workflow_name, workflow_status } = req.body;

  try {
    const workflow = await WorkflowMaster.findByPk(workflow_id);

    if (!workflow)
      return res
        .status(404)
        .json({ success: false, message: "Workflow not found" });

    await workflow.update({ workflow_name, workflow_status });

    res.status(200).json({
      success: true,
      status: 1,
      message: "Workflow updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStage = async (req, res) => {
  try {
    const {
      workflow_child_id,
      workflow_child_status,
      workflow_stage_color,
      workflow_stage_otp,
      workflow_stage_attachment,
      workflow_close_stage,
      workflow_stage_name,
    } = req.body;
    const workflow = await WorkflowChild.findByPk(workflow_child_id);

    if (!workflow)
      return res
        .status(404)
        .json({ success: false, message: "Stage not found" });

    await workflow.update({
      workflow_stage_name,
      workflow_child_status,
      workflow_stage_color,
      workflow_stage_otp,
      workflow_stage_attachment,
      workflow_close_stage,
    });

    res.status(200).json({
      success: true,
      status: 1,
      message: "Stage updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== DELETE WORKFLOW ========================
const deleted = async (req, res) => {
  const { id } = req.params;

  try {
    const workflow = await WorkflowMaster.findByPk(id);
    if (!workflow)
      return res
        .status(404)
        .json({ success: false, message: "Workflow not found" });

    await WorkflowChild.destroy({ where: { workflow_master_id: id } });
    await workflow.destroy();

    res.status(200).json({
      success: true,
      message: "Workflow deleted successfully",
      status: 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletedStage = async (req, res) => {
  const { id } = req.params;

  try {
    const stage = await WorkflowChild.findByPk(id);
    if (!stage)
      return res
        .status(404)
        .json({ success: false, message: "Stage not found" });

    await stage.destroy();

    res.status(200).json({
      success: true,
      message: "Stage deleted successfully",
      status: 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== EXPORTS ========================
module.exports = {
  index,
  show,
  store,
  storeStage,
  update,
  updateStage,
  deleted,
  deletedStage,
  indexStage,
};
