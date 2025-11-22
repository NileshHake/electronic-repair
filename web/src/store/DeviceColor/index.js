// src/store/DeviceColor/index.js

import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ACTION TYPES
export const GET_DEVICE_COLORS = "GET_DEVICE_COLORS";
export const ADD_DEVICE_COLOR = "ADD_DEVICE_COLOR";
export const UPDATE_DEVICE_COLOR = "UPDATE_DEVICE_COLOR";
export const DELETE_DEVICE_COLOR = "DELETE_DEVICE_COLOR";
export const RESET_ADD_DEVICE_COLOR_RESPONSE = "RESET_ADD_DEVICE_COLOR_RESPONSE";
export const RESET_UPDATE_DEVICE_COLOR_RESPONSE = "RESET_UPDATE_DEVICE_COLOR_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ACTION CREATORS
export const deviceColorApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const deviceColorApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const getDeviceColorList = () => ({
  type: GET_DEVICE_COLORS,
});

export const addDeviceColor = (deviceColor) => ({
  type: ADD_DEVICE_COLOR,
  payload: { deviceColor },
});

export const updateDeviceColor = (deviceColor) => ({
  type: UPDATE_DEVICE_COLOR,
  payload: { deviceColor },
});

export const deleteDeviceColor = (id) => ({
  type: DELETE_DEVICE_COLOR,
  payload: id,
});

export const resetAddDeviceColorResponse = () => ({
  type: RESET_ADD_DEVICE_COLOR_RESPONSE,
});

export const resetUpdateDeviceColorResponse = () => ({
  type: RESET_UPDATE_DEVICE_COLOR_RESPONSE,
});

// INITIAL STATE
const INIT_STATE = {
  deviceColors: [],
  addDeviceColorResponse: false,
  updateDeviceColorResponse: false,
  loading: true,
  error: false,
};

// REDUCER
export const DeviceColorReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_DEVICE_COLORS:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_DEVICE_COLORS:
          return { ...state, deviceColors: action.payload.data, loading: false };
        case ADD_DEVICE_COLOR:
          return { ...state, addDeviceColorResponse: true, loading: false };
        case UPDATE_DEVICE_COLOR:
          return { ...state, updateDeviceColorResponse: true, loading: false };
        case DELETE_DEVICE_COLOR:
          return {
            ...state,
            deviceColors: state.deviceColors.filter(
              (c) => c.device_color_id !== action.payload.data
            ),
            loading: false,
          };
        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true, loading: false };

    case RESET_ADD_DEVICE_COLOR_RESPONSE:
      return { ...state, addDeviceColorResponse: false };

    case RESET_UPDATE_DEVICE_COLOR_RESPONSE:
      return { ...state, updateDeviceColorResponse: false };

    default:
      return state;
  }
};

// API CALLS
const api = new APIClient();
const getDeviceColorApi = () => api.get("/device-color/list");
const addDeviceColorApi = (data) => api.create("/device-color/store", data);
const updateDeviceColorApi = (data) => api.put("/device-color/update", data);
const deleteDeviceColorApi = (id) => api.delete(`/device-color/delete/${id}`);

// SAGAS
function* getDeviceColorSaga() {
  try {
    const response = yield call(getDeviceColorApi);
    yield put(deviceColorApiResponseSuccess(GET_DEVICE_COLORS, response));
  } catch (error) {
    yield put(deviceColorApiResponseError(GET_DEVICE_COLORS, error));
  }
}

function* addDeviceColorSaga({ payload }) {
  try {
    const response = yield call(addDeviceColorApi, payload.deviceColor);
    yield put(deviceColorApiResponseSuccess(ADD_DEVICE_COLOR, response));
    toast.success("Device Color added successfully!");
    yield call(getDeviceColorSaga);
  } catch (error) {
    yield put(deviceColorApiResponseError(ADD_DEVICE_COLOR, error));
    toast.error("Failed to add device color!");
  }
}

function* updateDeviceColorSaga({ payload }) {
  try {
    const response = yield call(updateDeviceColorApi, payload.deviceColor);
    yield put(deviceColorApiResponseSuccess(UPDATE_DEVICE_COLOR, response));
    toast.success("Device Color updated successfully!");
    yield call(getDeviceColorSaga);
  } catch (error) {
    yield put(deviceColorApiResponseError(UPDATE_DEVICE_COLOR, error));
    toast.error("Failed to update device color!");
  }
}

function* deleteDeviceColorSaga({ payload }) {
  try {
    yield call(deleteDeviceColorApi, payload);
    yield put(deviceColorApiResponseSuccess(DELETE_DEVICE_COLOR, { data: payload }));
    toast.success("Device Color deleted successfully!");
    yield call(getDeviceColorSaga);
  } catch (error) {
    yield put(deviceColorApiResponseError(DELETE_DEVICE_COLOR, error));
    toast.error("Failed to delete device color!");
  }
}

export function* deviceColorSaga() {
  yield all([
    takeEvery(GET_DEVICE_COLORS, getDeviceColorSaga),
    takeEvery(ADD_DEVICE_COLOR, addDeviceColorSaga),
    takeEvery(UPDATE_DEVICE_COLOR, updateDeviceColorSaga),
    takeEvery(DELETE_DEVICE_COLOR, deleteDeviceColorSaga),
  ]);
}
