 import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

/* ==================================================
   ACTION TYPES
================================================== */
export const GET_WORKFLOW = "GET_WORKFLOW";
export const ADD_WORKFLOW = "ADD_WORKFLOW";
export const UPDATE_WORKFLOW = "UPDATE_WORKFLOW";
export const DELETE_WORKFLOW = "DELETE_WORKFLOW";
export const GET_SINGLE_WORKFLOW = "GET_SINGLE_WORKFLOW";

export const GET_WORKFLOW_STAGE_LIST = "GET_WORKFLOW_STAGE_LIST";
export const ADD_WORKFLOW_STAGE = "ADD_WORKFLOW_STAGE";
export const UPDATE_WORKFLOW_STAGE = "UPDATE_WORKFLOW_STAGE";
export const DELETE_WORKFLOW_STAGE = "DELETE_WORKFLOW_STAGE";

export const RESET_ADD_WORKFLOW_RESPONSE = "RESET_ADD_WORKFLOW_RESPONSE";
export const RESET_UPDATE_WORKFLOW_RESPONSE = "RESET_UPDATE_WORKFLOW_RESPONSE";
export const API_RESPONSE_SUCCESS = "WORKFLOW_API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "WORKFLOW_API_RESPONSE_ERROR";

/* ==================================================
   ACTIONS
================================================== */
export const workflowApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const workflowApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddWorkflowResponse = () => ({
  type: RESET_ADD_WORKFLOW_RESPONSE,
});

export const resetUpdateWorkflowResponse = () => ({
  type: RESET_UPDATE_WORKFLOW_RESPONSE,
});

export const getWorkflowList = () => ({ type: GET_WORKFLOW });
export const getSingleWorkflow = (id) => ({
  type: GET_SINGLE_WORKFLOW,
  payload: id,
});
export const addWorkflow = (data) => ({ type: ADD_WORKFLOW, payload: data });
export const updateWorkflow = (data) => ({
  type: UPDATE_WORKFLOW,
  payload: data,
});
export const deleteWorkflow = (id) => ({ type: DELETE_WORKFLOW, payload: id });

export const getWorkflowStageList = (workflow_id) => ({
  type: GET_WORKFLOW_STAGE_LIST,
  payload: workflow_id,
});
export const addWorkflowStage = (data) => ({
  type: ADD_WORKFLOW_STAGE,
  payload: data,
});
export const updateWorkflowStage = (data) => ({
  type: UPDATE_WORKFLOW_STAGE,
  payload: data,
});
export const deleteWorkflowStage = (id) => ({
  type: DELETE_WORKFLOW_STAGE,
  payload: id,
});

/* ==================================================
   INITIAL STATE
================================================== */
const INIT_STATE = {
  workflows: [],
  workflowStages: [],
  singleWorkflow: null,
  loading: true,
  error: false,
  addWorkflowResponse: false,
  updateWorkflowResponse: false,
};

/* ==================================================
   REDUCER
================================================== */
export const WorkflowReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_WORKFLOW:
    case GET_WORKFLOW_STAGE_LIST:
    case GET_SINGLE_WORKFLOW:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_WORKFLOW:
          return { ...state, workflows: action.payload.data, loading: false };

        case GET_SINGLE_WORKFLOW:
          return {
            ...state,
            singleWorkflow: action.payload.data,
            loading: false,
          };

        case ADD_WORKFLOW:
          return {
            ...state,
            addWorkflowResponse: true,
            workflows: [...state.workflows, action.payload.data],
          };
        case ADD_WORKFLOW_STAGE:
          return {
            ...state,
            addWorkflowResponse: true,
            workflows: [...state.workflows, action.payload.data],
          };
        case UPDATE_WORKFLOW_STAGE:
          return {
            ...state,
            addWorkflowResponse: true,
            workflows: [...state.workflows, action.payload.data],
          };
        case DELETE_WORKFLOW_STAGE:
          return {
            ...state,
            addWorkflowResponse: true,
            workflows: [...state.workflows, action.payload.data],
          };
        case UPDATE_WORKFLOW:
          return {
            ...state,
            updateWorkflowResponse: true,
            workflows: state.workflows.map((w) =>
              w.workflow_id === action.payload.data.workflow_id
                ? action.payload.data
                : w
            ),
          };

        case DELETE_WORKFLOW:
          return {
            ...state,
            workflows: state.workflows.filter(
              (w) => w.workflow_id !== action.payload.data
            ),
          };

        /* ---------- STAGE SECTION ---------- */
        case GET_WORKFLOW_STAGE_LIST:
          return {
            ...state,
            workflowStages: action.payload.data,
            loading: false,
          };

        case ADD_WORKFLOW_STAGE:
          return {
            ...state,
            workflowStages: [...state.workflowStages, action.payload.data],
          };

        case UPDATE_WORKFLOW_STAGE:
          return {
            ...state,
            workflowStages: state.workflowStages.map((s) =>
              s.workflow_stage_id === action.payload.data.workflow_stage_id
                ? action.payload.data
                : s
            ),
          };

        case DELETE_WORKFLOW_STAGE:
          return {
            ...state,
            workflowStages: state.workflowStages.filter(
              (s) => s.workflow_stage_id !== action.payload.data
            ),
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true, loading: false };

    case RESET_ADD_WORKFLOW_RESPONSE:
      return { ...state, addWorkflowResponse: false };

    case RESET_UPDATE_WORKFLOW_RESPONSE:
      return { ...state, updateWorkflowResponse: false };

    default:
      return state;
  }
};

/* ==================================================
   API CALLS
================================================== */
const api = new APIClient();

// Workflow Master
const getWorkflowApi = () => api.get("/workflow/list");
const getSingleWorkflowApi = (id) => api.get(`/workflow/single/${id}`);
const addWorkflowApi = (data) => api.create(`/workflow/store`, data);
const updateWorkflowApi = (data) => api.put(`/workflow/update`, data);
const deleteWorkflowApi = (id) => api.delete(`/workflow/delete/${id}`);

// Workflow Stages
const getWorkflowStageApi = (id) => api.get(`/workflow/stage/list/${id}`);
const addWorkflowStageApi = (data) => api.create(`/workflow/stage/store`, data);
const updateWorkflowStageApi = (data) =>
  api.put(`/workflow/stage/update`, data);
const deleteWorkflowStageApi = (id) =>
  api.delete(`/workflow/stage/delete/${id}`);

/* ==================================================
   SAGAS
================================================== */
function* getWorkflowListSaga() {
  try {
    const response = yield call(getWorkflowApi);
    yield put(workflowApiResponseSuccess(GET_WORKFLOW, response));
  } catch (error) {
    yield put(workflowApiResponseError(GET_WORKFLOW, error));
    toast.error("Failed to fetch workflows!");
  }
}

function* addWorkflowSaga({ payload }) {
  try {
    const response = yield call(addWorkflowApi, payload);
    yield put(workflowApiResponseSuccess(ADD_WORKFLOW, response));
    yield call(getWorkflowListSaga);
    toast.success("Workflow added successfully!");
  } catch (error) {
    yield put(workflowApiResponseError(ADD_WORKFLOW, error));
    toast.error("Failed to add workflow!");
  }
}

function* updateWorkflowSaga({ payload }) {
  try {
    const response = yield call(updateWorkflowApi, payload);
    yield put(workflowApiResponseSuccess(UPDATE_WORKFLOW, response));
    yield call(getWorkflowListSaga);
    toast.success("Workflow updated successfully!");
  } catch (error) {
    yield put(workflowApiResponseError(UPDATE_WORKFLOW, error));
    toast.error("Failed to update workflow!");
  }
}

function* deleteWorkflowSaga({ payload }) {
  try {
    yield call(deleteWorkflowApi, payload);
    yield put(workflowApiResponseSuccess(DELETE_WORKFLOW, { data: payload }));
    yield call(getWorkflowListSaga);
    toast.success("Workflow deleted successfully!");
  } catch (error) {
    yield put(workflowApiResponseError(DELETE_WORKFLOW, error));
    toast.error("Failed to delete workflow!");
  }
}

/* ---------- Workflow Stages ---------- */
function* getWorkflowStageListSaga({ payload }) {
  try {
    const response = yield call(getWorkflowStageApi, payload);
    yield put(workflowApiResponseSuccess(GET_WORKFLOW_STAGE_LIST, response));
  } catch (error) {
    yield put(workflowApiResponseError(GET_WORKFLOW_STAGE_LIST, error));
    toast.error("Failed to fetch workflow stages!");
  }
}

function* addWorkflowStageSaga({ payload }) {
  try {
    const response = yield call(addWorkflowStageApi, payload);
    yield put(workflowApiResponseSuccess(ADD_WORKFLOW_STAGE, response));
    yield call(getWorkflowStageListSaga, {
      payload: payload.workflow_master_id,
    });
    toast.success("Stage added successfully!");
  } catch (error) {
    yield put(workflowApiResponseError(ADD_WORKFLOW_STAGE, error));
    toast.error("Failed to add stage!");
  }
}

function* updateWorkflowStageSaga({ payload }) {
  try {
    const response = yield call(updateWorkflowStageApi, payload);
    yield put(workflowApiResponseSuccess(UPDATE_WORKFLOW_STAGE, response));
    yield call(getWorkflowStageListSaga, {
      payload: payload.workflow_master_id,
    });
    toast.success("Stage updated successfully!");
  } catch (error) {
    yield put(workflowApiResponseError(UPDATE_WORKFLOW_STAGE, error));
    toast.error("Failed to update stage!");
  }
}

function* deleteWorkflowStageSaga({ payload }) {
  try {
    yield call(deleteWorkflowStageApi, payload);
    yield put(
      workflowApiResponseSuccess(DELETE_WORKFLOW_STAGE, { data: payload })
    );
    toast.success("Stage deleted successfully!");
  } catch (error) {
    yield put(workflowApiResponseError(DELETE_WORKFLOW_STAGE, error));
    toast.error("Failed to delete stage!");
  }
}

/* ==================================================
   WATCHERS
================================================== */
export function* workflowSaga() {
  yield all([
    fork(function* () {
      yield takeEvery(GET_WORKFLOW, getWorkflowListSaga);
      yield takeEvery(ADD_WORKFLOW, addWorkflowSaga);
      yield takeEvery(UPDATE_WORKFLOW, updateWorkflowSaga);
      yield takeEvery(DELETE_WORKFLOW, deleteWorkflowSaga);

      yield takeEvery(GET_WORKFLOW_STAGE_LIST, getWorkflowStageListSaga);
      yield takeEvery(ADD_WORKFLOW_STAGE, addWorkflowStageSaga);
      yield takeEvery(UPDATE_WORKFLOW_STAGE, updateWorkflowStageSaga);
      yield takeEvery(DELETE_WORKFLOW_STAGE, deleteWorkflowStageSaga);
    }),
  ]);
}
