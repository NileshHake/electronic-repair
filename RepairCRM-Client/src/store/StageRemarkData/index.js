import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

/* ================== ACTION TYPES ================== */

export const GET_STAGE_REMARKS = "GET_STAGE_REMARKS";
export const GET_SINGLE_STAGE_REMARK = "GET_SINGLE_STAGE_REMARK";
export const ADD_STAGE_REMARK = "ADD_STAGE_REMARK";
export const UPDATE_STAGE_REMARK = "UPDATE_STAGE_REMARK";
export const DELETE_STAGE_REMARK = "DELETE_STAGE_REMARK";

export const RESET_ADD_STAGE_REMARK_RESPONSE = "RESET_ADD_STAGE_REMARK_RESPONSE";
export const RESET_UPDATE_STAGE_REMARK_RESPONSE = "RESET_UPDATE_STAGE_REMARK_RESPONSE";

export const API_RESPONSE_SUCCESS_STAGE_REMARK = "API_RESPONSE_SUCCESS_STAGE_REMARK";
export const API_RESPONSE_ERROR_STAGE_REMARK = "API_RESPONSE_ERROR_STAGE_REMARK";

/* ================== ACTIONS ================== */

export const stageRemarkApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS_STAGE_REMARK,
  payload: { actionType, data },
});

export const stageRemarkApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR_STAGE_REMARK,
  payload: { actionType, error },
});

export const resetAddStageRemarkResponse = () => ({
  type: RESET_ADD_STAGE_REMARK_RESPONSE,
});

export const resetUpdateStageRemarkResponse = () => ({
  type: RESET_UPDATE_STAGE_REMARK_RESPONSE,
});

// 🔹 Get all stage remarks (you can pass filter later if needed)
export const getStageRemarks = () => ({
  type: GET_STAGE_REMARKS,
});

// 🔹 Get single stage remark
export const getSingleStageRemark = (id) => ({
  type: GET_SINGLE_STAGE_REMARK,
  payload: { id },
});

// 🔹 Add stage remark (FormData)
export const addStageRemark = (formData) => ({
  type: ADD_STAGE_REMARK,
  payload: { formData },
});

// 🔹 Update stage remark (FormData or JSON as per your backend)
export const updateStageRemark = (formData) => ({
  type: UPDATE_STAGE_REMARK,
  payload: { formData },
});

// 🔹 Delete stage remark
export const deleteStageRemark = (id) => ({
  type: DELETE_STAGE_REMARK,
  payload: { id },
});

/* ================== REDUCER ================== */

const INIT_STATE = {
  stageRemarks: [],
  singleStageRemark: [],
  loading: false,
  error: false,
  addStageRemarkResponse: false,
  updateStageRemarkResponse: false,
};

export const StageRemarkReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_STAGE_REMARKS:
    case GET_SINGLE_STAGE_REMARK:
    case ADD_STAGE_REMARK:
    case UPDATE_STAGE_REMARK:
    case DELETE_STAGE_REMARK:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS_STAGE_REMARK:
      switch (action.payload.actionType) {
        case GET_STAGE_REMARKS:
          return {
            ...state,
            stageRemarks: action.payload.data,
            loading: false,
            error: false,
          };

        case GET_SINGLE_STAGE_REMARK:
          return {
            ...state,
            singleStageRemark: action.payload.data,
            loading: false,
            error: false,
          };

        case ADD_STAGE_REMARK:
          return {
            ...state,
            addStageRemarkResponse: true,
            stageRemarks: [...state.stageRemarks, action.payload.data],
            loading: false,
            error: false,
          };

        case UPDATE_STAGE_REMARK:
          return {
            ...state,
            updateStageRemarkResponse: true,
            stageRemarks: state.stageRemarks.map((item) =>
              item.stage_remark_id === action.payload.data.stage_remark_id
                ? action.payload.data
                : item
            ),
            loading: false,
            error: false,
          };

        case DELETE_STAGE_REMARK:
          return {
            ...state,
            stageRemarks: state.stageRemarks.filter(
              (item) => item.stage_remark_id !== action.payload.data
            ),
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR_STAGE_REMARK:
      return {
        ...state,
        addStageRemarkResponse: null,
        updateStageRemarkResponse: null,
        loading: false,
        error: true,
      };

    case RESET_ADD_STAGE_REMARK_RESPONSE:
      return { ...state, addStageRemarkResponse: false };

    case RESET_UPDATE_STAGE_REMARK_RESPONSE:
      return { ...state, updateStageRemarkResponse: false };

    default:
      return state;
  }
};


/* ================== API CALLS ================== */

const api = new APIClient();

// list
const getStageRemarksApi = () => api.get("/stage-remark/list");

// single
const getSingleStageRemarkApi = (id) =>
  api.get(`/stage-remark/single/${id}`);

// add (FormData: images + video + other fields)
const addStageRemarkApi = (formData) =>
  api.create("/stage-remark/store", formData);

// update (same pattern; adjust if your backend expects JSON)
const updateStageRemarkApi = (formData) =>
  api.put("/stage-remark/update", formData);

// delete
const deleteStageRemarkApi = (id) =>
  api.delete(`/stage-remark/delete/${id}`);

/* ================== SAGAS ================== */

// Get all stage remarks
function* getStageRemarksSaga() {
  try {
    const response = yield call(getStageRemarksApi);
    yield put(stageRemarkApiResponseSuccess(GET_STAGE_REMARKS, response));
  } catch (error) {
    yield put(stageRemarkApiResponseError(GET_STAGE_REMARKS, error));
    toast.error("Failed to fetch stage remarks!");
  }
}

// Get single stage remark
function* getSingleStageRemarkSaga({ payload }) {
  try {
    const { id } = payload;
    const response = yield call(getSingleStageRemarkApi, id);
    yield put(
      stageRemarkApiResponseSuccess(GET_SINGLE_STAGE_REMARK, response)
    );
  } catch (error) {
    yield put(stageRemarkApiResponseError(GET_SINGLE_STAGE_REMARK, error));
    toast.error("Failed to fetch stage remark detail!");
  }
}

// Add stage remark
function* addStageRemarkSaga({ payload }) {
  try {
    const { formData } = payload;
    const response = yield call(addStageRemarkApi, formData);
    yield put(stageRemarkApiResponseSuccess(ADD_STAGE_REMARK, response));
    // refresh list
    yield call(getStageRemarksSaga);
    toast.success("Stage remark added successfully!");
  } catch (error) {
    yield put(stageRemarkApiResponseError(ADD_STAGE_REMARK, error));
    toast.error("Failed to add stage remark!");
  }
}

// Update stage remark
function* updateStageRemarkSaga({ payload }) {
  try {
    const { formData } = payload;
    const response = yield call(updateStageRemarkApi, formData);
    yield put(stageRemarkApiResponseSuccess(UPDATE_STAGE_REMARK, response));
    // refresh list
    yield call(getStageRemarksSaga);
    toast.success("Stage remark updated successfully!");
  } catch (error) {
    yield put(stageRemarkApiResponseError(UPDATE_STAGE_REMARK, error));
    toast.error("Failed to update stage remark!");
  }
}

// Delete stage remark
function* deleteStageRemarkSaga({ payload }) {
  try {
    const { id } = payload;
    yield call(deleteStageRemarkApi, id);
    // payload in success is just ID, like in your status file
    yield put(
      stageRemarkApiResponseSuccess(DELETE_STAGE_REMARK, { data: id })
    );
    // refresh list
    yield call(getStageRemarksSaga);
    toast.success("Stage remark deleted successfully!");
  } catch (error) {
    yield put(stageRemarkApiResponseError(DELETE_STAGE_REMARK, error));
    toast.error("Failed to delete stage remark!");
  }
}

/* ================== WATCHERS ================== */

function* watchGetStageRemarks() {
  yield takeEvery(GET_STAGE_REMARKS, getStageRemarksSaga);
}

function* watchGetSingleStageRemark() {
  yield takeEvery(GET_SINGLE_STAGE_REMARK, getSingleStageRemarkSaga);
}

function* watchAddStageRemark() {
  yield takeEvery(ADD_STAGE_REMARK, addStageRemarkSaga);
}

function* watchUpdateStageRemark() {
  yield takeEvery(UPDATE_STAGE_REMARK, updateStageRemarkSaga);
}

function* watchDeleteStageRemark() {
  yield takeEvery(DELETE_STAGE_REMARK, deleteStageRemarkSaga);
}

/* ================== ROOT SAGA ================== */

export function* stageRemarkSaga() {
  yield all([
    fork(watchGetStageRemarks),
    fork(watchGetSingleStageRemark),
    fork(watchAddStageRemark),
    fork(watchUpdateStageRemark),
    fork(watchDeleteStageRemark),
  ]);
}
