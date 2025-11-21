import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_DEVICE_TYPES = "GET_DEVICE_TYPES";
export const ADD_DEVICE_TYPE = "ADD_DEVICE_TYPE";
export const UPDATE_DEVICE_TYPE = "UPDATE_DEVICE_TYPE";
export const DELETE_DEVICE_TYPE = "DELETE_DEVICE_TYPE";
export const RESET_ADD_DEVICE_TYPE_RESPONSE = "RESET_ADD_DEVICE_TYPE_RESPONSE";
export const RESET_UPDATE_DEVICE_TYPE_RESPONSE = "RESET_UPDATE_DEVICE_TYPE_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const deviceTypeApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const deviceTypeApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddDeviceTypeResponse = () => ({
  type: RESET_ADD_DEVICE_TYPE_RESPONSE,
});

export const resetUpdateDeviceTypeResponse = () => ({
  type: RESET_UPDATE_DEVICE_TYPE_RESPONSE,
});

export const getDeviceTypesList = () => ({
  type: GET_DEVICE_TYPES,
});

export const addDeviceType = (deviceType) => ({
  type: ADD_DEVICE_TYPE,
  payload: { deviceType },
});

export const updateDeviceType = (deviceType) => ({
  type: UPDATE_DEVICE_TYPE,
  payload: { deviceType },
});

export const deleteDeviceType = (id) => ({
  type: DELETE_DEVICE_TYPE,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  deviceTypes: [],
  loading: true,
  error: false,
  addDeviceTypeResponse: false,
  updateDeviceTypeResponse: false,
};

export const DeviceTypeReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_DEVICE_TYPES:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_DEVICE_TYPES:
          return {
            ...state,
            deviceTypes: action.payload.data,
            loading: false,
            error: false,
          };

        case ADD_DEVICE_TYPE:
          return {
            ...state,
            addDeviceTypeResponse: true,
            deviceTypes: [...state.deviceTypes, action.payload.data],
            loading: false,
            error: false,
          };

        case UPDATE_DEVICE_TYPE:
          return {
            ...state,
            updateDeviceTypeResponse: true,
            deviceTypes: state.deviceTypes.map((t) =>
              t.device_type_id === action.payload.data.device_type_id
                ? action.payload.data
                : t
            ),
            loading: false,
            error: false,
          };

        case DELETE_DEVICE_TYPE:
          return {
            ...state,
            deviceTypes: state.deviceTypes.filter(
              (t) => t.device_type_id !== action.payload.data
            ),
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true };

    case RESET_ADD_DEVICE_TYPE_RESPONSE:
      return { ...state, addDeviceTypeResponse: false };

    case RESET_UPDATE_DEVICE_TYPE_RESPONSE:
      return { ...state, updateDeviceTypeResponse: false };

    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

const getDeviceTypesApi = () => api.get("/device-type/list");
const addDeviceTypeApi = (data) => api.create("/device-type/store", data);
const updateDeviceTypeApi = (data) => api.put("/device-type/update", data);
const deleteDeviceTypeApi = (id) => api.delete(`/device-type/delete/${id}`);

// ================== SAGAS ==================
function* getDeviceTypesListSaga() {
  try {
    const response = yield call(getDeviceTypesApi);
    yield put(deviceTypeApiResponseSuccess(GET_DEVICE_TYPES, response));
  } catch (error) {
    yield put(deviceTypeApiResponseError(GET_DEVICE_TYPES, error));
    toast.error("Failed to fetch device types!");
  }
}

function* addDeviceTypeSaga({ payload }) {
  try {
    const { deviceType } = payload;
    const response = yield call(addDeviceTypeApi, deviceType);
    yield put(deviceTypeApiResponseSuccess(ADD_DEVICE_TYPE, response));
    yield call(getDeviceTypesListSaga);
    toast.success("Device Type added successfully!");
  } catch (error) {
    yield put(deviceTypeApiResponseError(ADD_DEVICE_TYPE, error));
    toast.error("Failed to add device type!");
  }
}

function* updateDeviceTypeSaga({ payload }) {
  try {
    const { deviceType } = payload;
    const response = yield call(updateDeviceTypeApi, deviceType);
    yield put(deviceTypeApiResponseSuccess(UPDATE_DEVICE_TYPE, response));
    yield call(getDeviceTypesListSaga);
    toast.success("Device Type updated successfully!");
  } catch (error) {
    yield put(deviceTypeApiResponseError(UPDATE_DEVICE_TYPE, error));
    toast.error("Failed to update device type!");
  }
}

function* deleteDeviceTypeSaga({ payload }) {
  try {
    yield call(deleteDeviceTypeApi, payload);
    yield put(deviceTypeApiResponseSuccess(DELETE_DEVICE_TYPE, { data: payload }));
    yield call(getDeviceTypesListSaga);
    toast.success("Device Type deleted successfully!");
  } catch (error) {
    yield put(deviceTypeApiResponseError(DELETE_DEVICE_TYPE, error));
    toast.error("Failed to delete device type!");
  }
}

// ================== WATCHERS ==================
function* watchGetDeviceTypes() {
  yield takeEvery(GET_DEVICE_TYPES, getDeviceTypesListSaga);
}

function* watchAddDeviceType() {
  yield takeEvery(ADD_DEVICE_TYPE, addDeviceTypeSaga);
}

function* watchUpdateDeviceType() {
  yield takeEvery(UPDATE_DEVICE_TYPE, updateDeviceTypeSaga);
}

function* watchDeleteDeviceType() {
  yield takeEvery(DELETE_DEVICE_TYPE, deleteDeviceTypeSaga);
}

// ================== ROOT SAGA ==================
export function* deviceTypeSaga() {
  yield all([
    fork(watchGetDeviceTypes),
    fork(watchAddDeviceType),
    fork(watchUpdateDeviceType),
    fork(watchDeleteDeviceType),
  ]);
}
