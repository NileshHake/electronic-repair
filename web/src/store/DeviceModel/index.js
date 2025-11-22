// src/store/DeviceModel.js
import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_DEVICE_MODELS = "GET_DEVICE_MODELS";
export const ADD_DEVICE_MODEL = "ADD_DEVICE_MODEL";
export const UPDATE_DEVICE_MODEL = "UPDATE_DEVICE_MODEL";
export const DELETE_DEVICE_MODEL = "DELETE_DEVICE_MODEL";
export const RESET_ADD_DEVICE_MODEL_RESPONSE = "RESET_ADD_DEVICE_MODEL_RESPONSE";
export const RESET_UPDATE_DEVICE_MODEL_RESPONSE = "RESET_UPDATE_DEVICE_MODEL_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const deviceModelApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const deviceModelApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddDeviceModelResponse = () => ({ type: RESET_ADD_DEVICE_MODEL_RESPONSE });
export const resetUpdateDeviceModelResponse = () => ({ type: RESET_UPDATE_DEVICE_MODEL_RESPONSE });

export const getDeviceModelsList = () => ({ type: GET_DEVICE_MODELS });
export const addDeviceModel = (data) => ({ type: ADD_DEVICE_MODEL, payload: { data } });
export const updateDeviceModel = (data) => ({ type: UPDATE_DEVICE_MODEL, payload: { data } });
export const deleteDeviceModel = (id) => ({ type: DELETE_DEVICE_MODEL, payload: id });

// ================== REDUCER ==================
const INIT_STATE = {
  deviceModels: [],
  loading: true,
  error: false,
  addDeviceModelResponse: false,
  updateDeviceModelResponse: false,
};

export const DeviceModelReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_DEVICE_MODELS:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_DEVICE_MODELS:
          return { ...state, deviceModels: action.payload.data, loading: false, error: false };

        case ADD_DEVICE_MODEL:
          return {
            ...state,
            addDeviceModelResponse: true,
            deviceModels: [...state.deviceModels, action.payload.data],
            loading: false,
            error: false,
          };

        case UPDATE_DEVICE_MODEL:
          return {
            ...state,
            updateDeviceModelResponse: true,
            deviceModels: state.deviceModels.map((d) =>
              d.device_model_id === action.payload.data.device_model_id
                ? action.payload.data
                : d
            ),
            loading: false,
            error: false,
          };

        case DELETE_DEVICE_MODEL:
          return {
            ...state,
            deviceModels: state.deviceModels.filter(
              (d) => d.device_model_id !== action.payload.data
            ),
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, addDeviceModelResponse: null, error: true };
    case RESET_ADD_DEVICE_MODEL_RESPONSE:
      return { ...state, addDeviceModelResponse: false };
    case RESET_UPDATE_DEVICE_MODEL_RESPONSE:
      return { ...state, updateDeviceModelResponse: false };
    default:
      return state;
  }
};

// ================== API ==================
const api = new APIClient();
const getDeviceModelsApi = () => api.get("/device-model/list");
const addDeviceModelApi = (data) => api.create("/device-model/store", data);
const updateDeviceModelApi = (data) => api.put("/device-model/update", data);
const deleteDeviceModelApi = (id) => api.delete(`/device-model/delete/${id}`);

// ================== SAGAS ==================
function* getDeviceModelsListSaga() {
  try {
    const response = yield call(getDeviceModelsApi);
    yield put(deviceModelApiResponseSuccess(GET_DEVICE_MODELS, response));
  } catch (error) {
    yield put(deviceModelApiResponseError(GET_DEVICE_MODELS, error));
    toast.error("Failed to fetch device models!");
  }
}

function* addDeviceModelSaga({ payload }) {
  try {
    const response = yield call(addDeviceModelApi, payload.data);
    yield put(deviceModelApiResponseSuccess(ADD_DEVICE_MODEL, response));
    yield call(getDeviceModelsListSaga);
    toast.success("Device Model added successfully!");
  } catch (error) {
    yield put(deviceModelApiResponseError(ADD_DEVICE_MODEL, error));
    toast.error("Failed to add device model!");
  }
}

function* updateDeviceModelSaga({ payload }) {
  try {
    const response = yield call(updateDeviceModelApi, payload.data);
    yield put(deviceModelApiResponseSuccess(UPDATE_DEVICE_MODEL, response));
    yield call(getDeviceModelsListSaga);
    toast.success("Device Model updated successfully!");
  } catch (error) {
    yield put(deviceModelApiResponseError(UPDATE_DEVICE_MODEL, error));
    toast.error("Failed to update device model!");
  }
}

function* deleteDeviceModelSaga({ payload }) {
  try {
    yield call(deleteDeviceModelApi, payload);
    yield put(deviceModelApiResponseSuccess(DELETE_DEVICE_MODEL, { data: payload }));
    yield call(getDeviceModelsListSaga);
    toast.success("Device Model deleted successfully!");
  } catch (error) {
    yield put(deviceModelApiResponseError(DELETE_DEVICE_MODEL, error));
    toast.error("Failed to delete device model!");
  }
}

// ================== WATCHERS ==================
function* watchGetDeviceModels() { yield takeEvery(GET_DEVICE_MODELS, getDeviceModelsListSaga); }
function* watchAddDeviceModel() { yield takeEvery(ADD_DEVICE_MODEL, addDeviceModelSaga); }
function* watchUpdateDeviceModel() { yield takeEvery(UPDATE_DEVICE_MODEL, updateDeviceModelSaga); }
function* watchDeleteDeviceModel() { yield takeEvery(DELETE_DEVICE_MODEL, deleteDeviceModelSaga); }

// ================== ROOT SAGA ==================
export function* deviceModelSaga() {
  yield all([
    fork(watchGetDeviceModels),
    fork(watchAddDeviceModel),
    fork(watchUpdateDeviceModel),
    fork(watchDeleteDeviceModel),
  ]);
}
