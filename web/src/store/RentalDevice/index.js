import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

/* ================== ACTION TYPES ================== */
export const GET_RENTAL_DEVICE_LIST = "GET_RENTAL_DEVICE_LIST";
export const ADD_RENTAL_DEVICE = "ADD_RENTAL_DEVICE";
export const UPDATE_RENTAL_DEVICE = "UPDATE_RENTAL_DEVICE";
export const DELETE_RENTAL_DEVICE = "DELETE_RENTAL_DEVICE";

export const RESET_ADD_RENTAL_DEVICE_RESPONSE = "RESET_ADD_RENTAL_DEVICE_RESPONSE";
export const RESET_UPDATE_RENTAL_DEVICE_RESPONSE = "RESET_UPDATE_RENTAL_DEVICE_RESPONSE";

export const API_RESPONSE_SUCCESS = "RENTAL_DEVICE_API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "RENTAL_DEVICE_API_RESPONSE_ERROR";

/* ================== ACTIONS ================== */
export const rentalDeviceApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const rentalDeviceApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddRentalDeviceResponse = () => ({
  type: RESET_ADD_RENTAL_DEVICE_RESPONSE,
});

export const resetUpdateRentalDeviceResponse = () => ({
  type: RESET_UPDATE_RENTAL_DEVICE_RESPONSE,
});

export const getRentalDeviceList = () => ({
  type: GET_RENTAL_DEVICE_LIST,
});

export const addRentalDevice = (device) => ({
  type: ADD_RENTAL_DEVICE,
  payload: { device },
});

export const updateRentalDevice = (device) => ({
  type: UPDATE_RENTAL_DEVICE,
  payload: { device },
});

export const deleteRentalDevice = (id) => ({
  type: DELETE_RENTAL_DEVICE,
  payload: id,
});

/* ================== REDUCER ================== */
const INIT_STATE = {
  rentalDevices: [],
  loading: true,
  error: false,
  addRentalDeviceResponse: false,
  updateRentalDeviceResponse: false,
};

export const RentalDeviceReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_RENTAL_DEVICE_LIST:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_RENTAL_DEVICE_LIST:
          return {
            ...state,
            rentalDevices: action.payload.data,
            loading: false,
            error: false,
          };

        case ADD_RENTAL_DEVICE:
          return {
            ...state,
            addRentalDeviceResponse: true,
            loading: false,
            error: false,
          };

        case UPDATE_RENTAL_DEVICE:
          return {
            ...state,
            updateRentalDeviceResponse: true,
            loading: false,
            error: false,
          };

        case DELETE_RENTAL_DEVICE:
          return {
            ...state,
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return {
        ...state,
        addRentalDeviceResponse: null,
        error: true,
        loading: false,
      };

    case RESET_ADD_RENTAL_DEVICE_RESPONSE:
      return { ...state, addRentalDeviceResponse: false };

    case RESET_UPDATE_RENTAL_DEVICE_RESPONSE:
      return { ...state, updateRentalDeviceResponse: false };

    default:
      return state;
  }
};

/* ================== API CALLS ================== */
const api = new APIClient();

const getRentalDeviceApi = () => api.get("/rental-device/list");
const addRentalDeviceApi = (data) => api.create("/rental-device/store", data);
const updateRentalDeviceApi = (data) => api.put("/rental-device/update", data);
const deleteRentalDeviceApi = (id) => api.delete(`/rental-device/delete/${id}`);

/* ================== SAGAS ================== */
function* getRentalDeviceListSaga() {
  try {
    const response = yield call(getRentalDeviceApi);
    yield put(rentalDeviceApiResponseSuccess(GET_RENTAL_DEVICE_LIST, response));
  } catch (error) {
    yield put(rentalDeviceApiResponseError(GET_RENTAL_DEVICE_LIST, error));
    toast.error("Failed to fetch rental devices!");
  }
}

function* addRentalDeviceSaga({ payload }) {
  try {
    const { device } = payload;
    const response = yield call(addRentalDeviceApi, device);
    yield put(rentalDeviceApiResponseSuccess(ADD_RENTAL_DEVICE, response));
    yield call(getRentalDeviceListSaga);
    toast.success("Rental device added successfully!");
  } catch (error) {
    yield put(rentalDeviceApiResponseError(ADD_RENTAL_DEVICE, error));
    toast.error("Failed to add rental device!");
  }
}

function* updateRentalDeviceSaga({ payload }) {
  try {
    const { device } = payload;
    const response = yield call(updateRentalDeviceApi, device);
    yield put(rentalDeviceApiResponseSuccess(UPDATE_RENTAL_DEVICE, response));
    yield call(getRentalDeviceListSaga);
    toast.success("Rental device updated successfully!");
  } catch (error) {
    yield put(rentalDeviceApiResponseError(UPDATE_RENTAL_DEVICE, error));
    toast.error("Failed to update rental device!");
  }
}

function* deleteRentalDeviceSaga({ payload }) {
  try {
    yield call(deleteRentalDeviceApi, payload);
    yield put(rentalDeviceApiResponseSuccess(DELETE_RENTAL_DEVICE, { data: payload }));
    yield call(getRentalDeviceListSaga);
    toast.success("Rental device deleted successfully!");
  } catch (error) {
    yield put(rentalDeviceApiResponseError(DELETE_RENTAL_DEVICE, error));
    toast.error("Failed to delete rental device!");
  }
}

/* ================== WATCHERS ================== */
function* watchGetRentalDevice() {
  yield takeEvery(GET_RENTAL_DEVICE_LIST, getRentalDeviceListSaga);
}

function* watchAddRentalDevice() {
  yield takeEvery(ADD_RENTAL_DEVICE, addRentalDeviceSaga);
}

function* watchUpdateRentalDevice() {
  yield takeEvery(UPDATE_RENTAL_DEVICE, updateRentalDeviceSaga);
}

function* watchDeleteRentalDevice() {
  yield takeEvery(DELETE_RENTAL_DEVICE, deleteRentalDeviceSaga);
}

/* ================== ROOT SAGA ================== */
export function* rentalDeviceSaga() {
  yield all([
    fork(watchGetRentalDevice),
    fork(watchAddRentalDevice),
    fork(watchUpdateRentalDevice),
    fork(watchDeleteRentalDevice),
  ]);
}