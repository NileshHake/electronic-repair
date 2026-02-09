import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

/* ================= ACTION TYPES ================= */
export const GET_RAMS = "GET_RAMS";
export const ADD_RAM = "ADD_RAM";
export const UPDATE_RAM = "UPDATE_RAM";
export const DELETE_RAM = "DELETE_RAM";

export const RESET_ADD_RAM_RESPONSE = "RESET_ADD_RAM_RESPONSE";
export const RESET_UPDATE_RAM_RESPONSE = "RESET_UPDATE_RAM_RESPONSE";

export const API_RESPONSE_SUCCESS = "RAM_API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "RAM_API_RESPONSE_ERROR";

/* ================= ACTIONS ================= */
export const ramApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const ramApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddRamResponse = () => ({
  type: RESET_ADD_RAM_RESPONSE,
});

export const resetUpdateRamResponse = () => ({
  type: RESET_UPDATE_RAM_RESPONSE,
});

export const getRamsList = () => ({ type: GET_RAMS });

export const addRam = (ram) => ({
  type: ADD_RAM,
  payload: { ram },
});

export const updateRam = (ram) => ({
  type: UPDATE_RAM,
  payload: { ram },
});

export const deleteRam = (id) => ({
  type: DELETE_RAM,
  payload: id,
});

/* ================= REDUCER ================= */
const INIT_STATE = {
  rams: [],
  loading: true,
  error: false,
  addRamResponse: false,
  updateRamResponse: false,
};

export const RamReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_RAMS:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_RAMS:
          return {
            ...state,
            rams: action.payload.data,
            loading: false,
            error: false,
          };

        case ADD_RAM:
          return {
            ...state,
            addRamResponse: true,
            loading: false,
            error: false,
          };

        case UPDATE_RAM:
          return {
            ...state,
            updateRamResponse: true,
            loading: false,
            error: false,
          };

        case DELETE_RAM:
          return {
            ...state,
            rams: state.rams.filter(
              (r) => r.ram_id !== action.payload.data
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
        error: true,
        loading: false,
      };

    case RESET_ADD_RAM_RESPONSE:
      return { ...state, addRamResponse: false };

    case RESET_UPDATE_RAM_RESPONSE:
      return { ...state, updateRamResponse: false };

    default:
      return state;
  }
};

/* ================= API CALLS ================= */
const api = new APIClient();

const getRamsApi = () => api.get("/ram/list");
const addRamApi = (data) => api.create("/ram/store", data);
const updateRamApi = (data) => api.put("/ram/update", data);
const deleteRamApi = (id) => api.delete(`/ram/delete/${id}`);

/* ================= SAGAS ================= */
function* getRamsSaga() {
  try {
    const response = yield call(getRamsApi);
    yield put(ramApiResponseSuccess(GET_RAMS, response));
  } catch (error) {
    yield put(ramApiResponseError(GET_RAMS, error));
    toast.error("Failed to fetch RAM list");
  }
}

function* addRamSaga({ payload }) {
  try {
    const { ram } = payload;
    yield call(addRamApi, ram);
    yield put(ramApiResponseSuccess(ADD_RAM, {}));
    yield call(getRamsSaga);
    toast.success("RAM added successfully");
  } catch (error) {
    yield put(ramApiResponseError(ADD_RAM, error));
    toast.error("Failed to add RAM");
  }
}

function* updateRamSaga({ payload }) {
  try {
    const { ram } = payload;
    yield call(updateRamApi, ram);
    yield put(ramApiResponseSuccess(UPDATE_RAM, {}));
    yield call(getRamsSaga);
    toast.success("RAM updated successfully");
  } catch (error) {
    yield put(ramApiResponseError(UPDATE_RAM, error));
    toast.error("Failed to update RAM");
  }
}

function* deleteRamSaga({ payload }) {
  try {
    yield call(deleteRamApi, payload);
    yield put(ramApiResponseSuccess(DELETE_RAM, { data: payload }));
    yield call(getRamsSaga);
    toast.success("RAM deleted successfully");
  } catch (error) {
    yield put(ramApiResponseError(DELETE_RAM, error));
    toast.error("Failed to delete RAM");
  }
}

/* ================= WATCHERS ================= */
function* watchGetRams() {
  yield takeEvery(GET_RAMS, getRamsSaga);
}

function* watchAddRam() {
  yield takeEvery(ADD_RAM, addRamSaga);
}

function* watchUpdateRam() {
  yield takeEvery(UPDATE_RAM, updateRamSaga);
}

function* watchDeleteRam() {
  yield takeEvery(DELETE_RAM, deleteRamSaga);
}

/* ================= ROOT SAGA ================= */
export function* ramSaga() {
  yield all([
    fork(watchGetRams),
    fork(watchAddRam),
    fork(watchUpdateRam),
    fork(watchDeleteRam),
  ]);
}
