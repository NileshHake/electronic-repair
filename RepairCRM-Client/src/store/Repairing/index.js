import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_REPAIR = "GET_REPAIR";
export const ADD_REPAIR = "ADD_REPAIR";
export const UPDATE_REPAIR = "UPDATE_REPAIR"; 
export const RESET_DELETE_REPAIR_RESPONSE = "RESET_DELETE_REPAIR_RESPONSE"; 
export const DELETE_REPAIR = "DELETE_REPAIR"; 
export const GET_SINGLE_REPAIR = "GET_SINGLE_REPAIR";
export const RESET_ADD_REPAIR_RESPONSE = "RESET_ADD_REPAIR_RESPONSE";
export const RESET_UPDATE_REPAIR_RESPONSE = "RESET_UPDATE_REPAIR_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const repairApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const repairApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddRepairResponse = () => ({
  type: RESET_ADD_REPAIR_RESPONSE,
});

export const resetUpdateRepairResponse = () => ({
  type: RESET_UPDATE_REPAIR_RESPONSE,
});
export const resetDeleteRepairResponse = () => ({
  type: RESET_DELETE_REPAIR_RESPONSE,
});

export const getRepairList = (data) => ({
  type: GET_REPAIR,
  payload: data,
});

export const getSingleRepair = (id) => ({
  type: GET_SINGLE_REPAIR,
  payload: id,
});

export const addRepair = (repair) => ({
  type: ADD_REPAIR,
  payload: repair,
});

export const updateRepair = (repair) => ({
  type: UPDATE_REPAIR,
  payload: repair,
});

export const deleteRepair = (id) => ({
  type: DELETE_REPAIR,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  repairs: [],
  singleRepair: null,
  loading: true,
  error: false,
  addRepairResponse: false,
  DeleteRepairResponse: false,
  updateRepairResponse: false,
};

export const RepairReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_REPAIR:
    case GET_SINGLE_REPAIR:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_REPAIR:
          return { ...state, repairs: action.payload.data, loading: false };
        case GET_SINGLE_REPAIR:
          return {
            ...state,
            singleRepair: action.payload.data,
            loading: false,
          };
        case ADD_REPAIR:
          return {
            ...state,
            addRepairResponse: true,
            repairs: [...state.repairs, action.payload.data],
          };
        case UPDATE_REPAIR:
          return {
            ...state,
            updateRepairResponse: true,
            repairs: state.repairs.map((r) =>
              r.repair_id === action.payload.data.repair_id
                ? action.payload.data
                : r
            ),
          };
        case DELETE_REPAIR:
          return {
            ...state,
            DeleteRepairResponse: true,
            repairs: state.repairs.filter(
              (r) => r.repair_id !== action.payload.data
            ),
          };
        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true, loading: false };

    case RESET_ADD_REPAIR_RESPONSE:
      return { ...state, addRepairResponse: false };

    case RESET_UPDATE_REPAIR_RESPONSE:
      return { ...state, updateRepairResponse: false };

    case RESET_DELETE_REPAIR_RESPONSE:
      return { ...state, DeleteRepairResponse: false };

      return { ...state, updateRepairResponse: false };
    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();
const getRepairApi = (formData) => api.create("/repair/list", formData);

const getSingleRepairApi = (id) => api.get(`/repair/single/${id}`);
const addRepairApi = (formData) => api.create(`/repair/store`, formData);
const updateRepairApi = (data) => api.put(`/repair/update`, data);
const deleteRepairApi = (id) => api.delete(`/repair/delete/${id}`);

// ================== SAGAS ==================
function* getRepairListSaga({ payload = {} }) {
  // default to empty object
  try {
    const response = yield call(getRepairApi, payload);

    yield put(repairApiResponseSuccess(GET_REPAIR, response));
  } catch (error) {
    console.error("Error fetching repairs:", error);
    yield put(repairApiResponseError(GET_REPAIR, error));
    toast.error("Failed to fetch repairs!");
  }
}

function* getSingleRepairSaga({ payload }) {
  try {
    const response = yield call(getSingleRepairApi, payload);
    yield put(repairApiResponseSuccess(GET_SINGLE_REPAIR, response));
  } catch (error) {
    yield put(repairApiResponseError(GET_SINGLE_REPAIR, error));
    toast.error("Failed to fetch repair details!");
  }
}

function* addRepairSaga({ payload }) {
  try {
    const response = yield call(addRepairApi, payload);
    yield put(repairApiResponseSuccess(ADD_REPAIR, response));

    toast.success("Repair added successfully!");
  } catch (error) {
    console.error("❌ Error in addRepairSaga:", error);
    yield put(repairApiResponseError(ADD_REPAIR, error));
    toast.error("Failed to add repair!");
  }
}

function* updateRepairSaga({ payload }) {
  try {
    const response = yield call(updateRepairApi, payload);

    // ✅ Dispatch success & refresh list
    yield put(repairApiResponseSuccess(UPDATE_REPAIR, response));

    toast.success("Repair updated successfully!");
  } catch (error) {
    console.error("❌ Error in updateRepairSaga:", error);
    yield put(repairApiResponseError(UPDATE_REPAIR, error));
    toast.error("Failed to update repair!");
  }
}

function* deleteRepairSaga({ payload }) {
  try {
    yield call(deleteRepairApi, payload);

    // send plain id in data
    yield put(repairApiResponseSuccess(DELETE_REPAIR, payload));

    toast.success("Repair deleted successfully!");
  } catch (error) {
    yield put(repairApiResponseError(DELETE_REPAIR, error));
    toast.error("Failed to delete repair!");
  }
}

// ================== WATCHERS ==================
function* watchGetRepair() {
  yield takeEvery(GET_REPAIR, getRepairListSaga);
}
function* watchGetSingleRepair() {
  yield takeEvery(GET_SINGLE_REPAIR, getSingleRepairSaga);
}
function* watchAddRepair() {
  yield takeEvery(ADD_REPAIR, addRepairSaga);
}
function* watchUpdateRepair() {
  yield takeEvery(UPDATE_REPAIR, updateRepairSaga);
}
function* watchDeleteRepair() {
  yield takeEvery(DELETE_REPAIR, deleteRepairSaga);
}

export function* repairSaga() {
  yield all([
    fork(watchGetRepair),
    fork(watchGetSingleRepair),
    fork(watchAddRepair),
    fork(watchUpdateRepair),
    fork(watchDeleteRepair),
  ]);
}
