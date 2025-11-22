import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_STATUS = "GET_STATUS";
export const ADD_STATUS = "ADD_STATUS";
export const UPDATE_STATUS = "UPDATE_STATUS";
export const DELETE_STATUS = "DELETE_STATUS";
export const RESET_ADD_STATUS_RESPONSE = "RESET_ADD_STATUS_RESPONSE";
export const RESET_UPDATE_STATUS_RESPONSE = "RESET_UPDATE_STATUS_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const statusApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const statusApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddStatusResponse = () => ({
  type: RESET_ADD_STATUS_RESPONSE,
});

export const resetUpdateStatusResponse = () => ({
  type: RESET_UPDATE_STATUS_RESPONSE,
});

export const getStatusList = () => ({
  type: GET_STATUS,
});

export const addStatus = (status) => ({
  type: ADD_STATUS,
  payload: { status },
});

export const updateStatus = (status) => ({
  type: UPDATE_STATUS,
  payload: { status },
});

export const deleteStatus = (id) => ({
  type: DELETE_STATUS,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  statuses: [],
  loading: true,
  error: false,
  addStatusResponse: false,
  updateStatusResponse: false,
};

export const StatusReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_STATUS:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_STATUS:
          return {
            ...state,
            statuses: action.payload.data,
            loading: false,
            error: false,
          };

        case ADD_STATUS:
          return {
            ...state,
            addStatusResponse: true,
            statuses: [...state.statuses, action.payload.data],
            loading: false,
            error: false,
          };

        case UPDATE_STATUS:
          return {
            ...state,
            updateStatusResponse: true,
            statuses: state.statuses.map((s) =>
              s.status_id === action.payload.data.status_id
                ? action.payload.data
                : s
            ),
            loading: false,
            error: false,
          };

        case DELETE_STATUS:
          return {
            ...state,
            statuses: state.statuses.filter(
              (s) => s.status_id !== action.payload.data
            ),
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return {
        ...state,
        addStatusResponse: null,
        error: true,
      };

    case RESET_ADD_STATUS_RESPONSE:
      return {
        ...state,
        addStatusResponse: false,
      };

    case RESET_UPDATE_STATUS_RESPONSE:
      return {
        ...state,
        updateStatusResponse: false,
      };

    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

const getStatusApi = () => api.get("/status/list");
const addStatusApi = (data) => api.create("/status/store", data);
const updateStatusApi = (data) => api.put("/status/update", data);
const deleteStatusApi = (id) => api.delete(`/status/delete/${id}`);

// ================== SAGAS ==================

// ✅ Get All Status
function* getStatusListSaga() {
  try {
    const response = yield call(getStatusApi);
    yield put(statusApiResponseSuccess(GET_STATUS, response));
  } catch (error) {
    yield put(statusApiResponseError(GET_STATUS, error));
    toast.error("Failed to fetch status list!");
  }
}

// ✅ Add Status
function* addStatusSaga({ payload }) {
  try {
    const { status } = payload;
    const response = yield call(addStatusApi, status);
    yield put(statusApiResponseSuccess(ADD_STATUS, response));
    yield call(getStatusListSaga);
    toast.success("Status added successfully!");
  } catch (error) {
    yield put(statusApiResponseError(ADD_STATUS, error));
    toast.error("Failed to add status!");
  }
}
 
function* updateStatusSaga({ payload }) {
  try {
    const { status } = payload;
    const response = yield call(updateStatusApi, status);
    yield put(statusApiResponseSuccess(UPDATE_STATUS, response));
    yield call(getStatusListSaga);
    toast.success("Status updated successfully!");
  } catch (error) {
    yield put(statusApiResponseError(UPDATE_STATUS, error));
    toast.error("Failed to update status!");
  }
}

// ✅ Delete Status
function* deleteStatusSaga({ payload }) {
  try {
    yield call(deleteStatusApi, payload);
    yield put(statusApiResponseSuccess(DELETE_STATUS, { data: payload }));
    yield call(getStatusListSaga);
    toast.success("Status deleted successfully!");
  } catch (error) {
    yield put(statusApiResponseError(DELETE_STATUS, error));
    toast.error("Failed to delete status!");
  }
}

// ================== WATCHERS ==================
function* watchGetStatus() {
  yield takeEvery(GET_STATUS, getStatusListSaga);
}

function* watchAddStatus() {
  yield takeEvery(ADD_STATUS, addStatusSaga);
}

function* watchUpdateStatus() {
  yield takeEvery(UPDATE_STATUS, updateStatusSaga);
}

function* watchDeleteStatus() {
  yield takeEvery(DELETE_STATUS, deleteStatusSaga);
}

// ================== ROOT SAGA ==================
export function* statusSaga() {
  yield all([
    fork(watchGetStatus),
    fork(watchAddStatus),
    fork(watchUpdateStatus),
    fork(watchDeleteStatus),
  ]);
}
