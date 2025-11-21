import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_REPAIR_TYPES = "GET_REPAIR_TYPES";
export const ADD_REPAIR_TYPE = "ADD_REPAIR_TYPE";
export const UPDATE_REPAIR_TYPE = "UPDATE_REPAIR_TYPE";
export const DELETE_REPAIR_TYPE = "DELETE_REPAIR_TYPE";
export const RESET_ADD_REPAIR_TYPE_RESPONSE = "RESET_ADD_REPAIR_TYPE_RESPONSE";
export const RESET_UPDATE_REPAIR_TYPE_RESPONSE = "RESET_UPDATE_REPAIR_TYPE_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const repairTypeApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const repairTypeApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddRepairTypeResponse = () => ({
  type: RESET_ADD_REPAIR_TYPE_RESPONSE,
});

export const resetUpdateRepairTypeResponse = () => ({
  type: RESET_UPDATE_REPAIR_TYPE_RESPONSE,
});

export const getRepairTypesList = () => ({
  type: GET_REPAIR_TYPES,
});

export const addRepairType = (repairType) => ({
  type: ADD_REPAIR_TYPE,
  payload: { repairType },
});

export const updateRepairType = (repairType) => ({
  type: UPDATE_REPAIR_TYPE,
  payload: { repairType },
});

export const deleteRepairType = (id) => ({
  type: DELETE_REPAIR_TYPE,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  repairTypes: [],
  loading: true,
  error: false,
  addRepairTypeResponse: false,
  updateRepairTypeResponse: false,
};

export const RepairTypeReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_REPAIR_TYPES:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_REPAIR_TYPES:
          return {
            ...state,
            repairTypes: action.payload.data,
            loading: false,
            error: false,
          };

        case ADD_REPAIR_TYPE:
          return {
            ...state,
            addRepairTypeResponse: true,
            repairTypes: [...state.repairTypes, action.payload.data],
            loading: false,
            error: false,
          };

        case UPDATE_REPAIR_TYPE:
          return {
            ...state,
            updateRepairTypeResponse: true,
            repairTypes: state.repairTypes.map((r) =>
              r.repair_type_id === action.payload.data.repair_type_id
                ? action.payload.data
                : r
            ),
            loading: false,
            error: false,
          };

        case DELETE_REPAIR_TYPE:
          return {
            ...state,
            repairTypes: state.repairTypes.filter(
              (r) => r.repair_type_id !== action.payload.data
            ),
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true };

    case RESET_ADD_REPAIR_TYPE_RESPONSE:
      return { ...state, addRepairTypeResponse: false };

    case RESET_UPDATE_REPAIR_TYPE_RESPONSE:
      return { ...state, updateRepairTypeResponse: false };

    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

const getRepairTypesApi = () => api.get("/repair-type/list");
const addRepairTypeApi = (data) => api.create("/repair-type/store", data);
const updateRepairTypeApi = (data) => api.put("/repair-type/update", data);
const deleteRepairTypeApi = (id) => api.delete(`/repair-type/delete/${id}`);

// ================== SAGAS ==================
function* getRepairTypesListSaga() {
  try {
    const response = yield call(getRepairTypesApi);
    yield put(repairTypeApiResponseSuccess(GET_REPAIR_TYPES, response));
  } catch (error) {
    yield put(repairTypeApiResponseError(GET_REPAIR_TYPES, error));
    toast.error("Failed to fetch repair types!");
  }
}

function* addRepairTypeSaga({ payload }) {
  try {
    const { repairType } = payload;
    const response = yield call(addRepairTypeApi, repairType);
    yield put(repairTypeApiResponseSuccess(ADD_REPAIR_TYPE, response));
    yield call(getRepairTypesListSaga);
    toast.success("Repair Type added successfully!");
  } catch (error) {
    yield put(repairTypeApiResponseError(ADD_REPAIR_TYPE, error));
    toast.error("Failed to add repair type!");
  }
}

function* updateRepairTypeSaga({ payload }) {
  try {
    const { repairType } = payload;
    const response = yield call(updateRepairTypeApi, repairType);
    yield put(repairTypeApiResponseSuccess(UPDATE_REPAIR_TYPE, response));
    yield call(getRepairTypesListSaga);
    toast.success("Repair Type updated successfully!");
  } catch (error) {
    yield put(repairTypeApiResponseError(UPDATE_REPAIR_TYPE, error));
    toast.error("Failed to update repair type!");
  }
}

function* deleteRepairTypeSaga({ payload }) {
  try {
    yield call(deleteRepairTypeApi, payload);
    yield put(repairTypeApiResponseSuccess(DELETE_REPAIR_TYPE, { data: payload }));
    yield call(getRepairTypesListSaga);
    toast.success("Repair Type deleted successfully!");
  } catch (error) {
    yield put(repairTypeApiResponseError(DELETE_REPAIR_TYPE, error));
    toast.error("Failed to delete repair type!");
  }
}

// ================== WATCHERS ==================
function* watchGetRepairTypes() {
  yield takeEvery(GET_REPAIR_TYPES, getRepairTypesListSaga);
}

function* watchAddRepairType() {
  yield takeEvery(ADD_REPAIR_TYPE, addRepairTypeSaga);
}

function* watchUpdateRepairType() {
  yield takeEvery(UPDATE_REPAIR_TYPE, updateRepairTypeSaga);
}

function* watchDeleteRepairType() {
  yield takeEvery(DELETE_REPAIR_TYPE, deleteRepairTypeSaga);
}

// ================== ROOT SAGA ==================
export function* repairTypeSaga() {
  yield all([
    fork(watchGetRepairTypes),
    fork(watchAddRepairType),
    fork(watchUpdateRepairType),
    fork(watchDeleteRepairType),
  ]);
}
