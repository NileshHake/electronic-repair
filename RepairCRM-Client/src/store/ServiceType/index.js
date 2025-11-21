// src/store/ServiceType.js
import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_SERVICE_TYPES = "GET_SERVICE_TYPES";
export const ADD_SERVICE_TYPE = "ADD_SERVICE_TYPE";
export const UPDATE_SERVICE_TYPE = "UPDATE_SERVICE_TYPE";
export const DELETE_SERVICE_TYPE = "DELETE_SERVICE_TYPE";
export const RESET_ADD_SERVICE_TYPE_RESPONSE = "RESET_ADD_SERVICE_TYPE_RESPONSE";
export const RESET_UPDATE_SERVICE_TYPE_RESPONSE = "RESET_UPDATE_SERVICE_TYPE_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const serviceTypeApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const serviceTypeApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddServiceTypeResponse = () => ({ type: RESET_ADD_SERVICE_TYPE_RESPONSE });
export const resetUpdateServiceTypeResponse = () => ({ type: RESET_UPDATE_SERVICE_TYPE_RESPONSE });

export const getServiceTypeList = () => ({ type: GET_SERVICE_TYPES });
export const addServiceType = (data) => ({ type: ADD_SERVICE_TYPE, payload: { data } });
export const updateServiceType = (data) => ({ type: UPDATE_SERVICE_TYPE, payload: { data } });
export const deleteServiceType = (id) => ({ type: DELETE_SERVICE_TYPE, payload: id });

// ================== REDUCER ==================
const INIT_STATE = {
  serviceTypes: [],
  loading: true,
  error: false,
  addServiceTypeResponse: false,
  updateServiceTypeResponse: false,
};

export const ServiceTypeReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_SERVICE_TYPES:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_SERVICE_TYPES:
          return { ...state, serviceTypes: action.payload.data, loading: false, error: false };

        case ADD_SERVICE_TYPE:
          return {
            ...state,
            addServiceTypeResponse: true,
            serviceTypes: [...state.serviceTypes, action.payload.data],
            loading: false,
            error: false,
          };

        case UPDATE_SERVICE_TYPE:
          return {
            ...state,
            updateServiceTypeResponse: true,
            serviceTypes: state.serviceTypes.map((s) =>
              s.id === action.payload.data.id ? action.payload.data : s
            ),
            loading: false,
            error: false,
          };

        case DELETE_SERVICE_TYPE:
          return {
            ...state,
            serviceTypes: state.serviceTypes.filter(
              (s) => s.id !== action.payload.data
            ),
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, addServiceTypeResponse: null, error: true };

    case RESET_ADD_SERVICE_TYPE_RESPONSE:
      return { ...state, addServiceTypeResponse: false };

    case RESET_UPDATE_SERVICE_TYPE_RESPONSE:
      return { ...state, updateServiceTypeResponse: false };

    default:
      return state;
  }
};

// ================== API ==================
const api = new APIClient();
const getServiceTypeApi = () => api.get("/service-type/list");
const addServiceTypeApi = (data) => api.create("/service-type/store", data);
const updateServiceTypeApi = (data) => api.put("/service-type/update", data);
const deleteServiceTypeApi = (id) => api.delete(`/service-type/delete/${id}`);

// ================== SAGAS ==================
function* getServiceTypeListSaga() {
  try {
    const response = yield call(getServiceTypeApi);
    yield put(serviceTypeApiResponseSuccess(GET_SERVICE_TYPES, response));
  } catch (error) {
    yield put(serviceTypeApiResponseError(GET_SERVICE_TYPES, error));
    toast.error("Failed to fetch service types!");
  }
}

function* addServiceTypeSaga({ payload }) {
  try {
    const response = yield call(addServiceTypeApi, payload.data);
    yield put(serviceTypeApiResponseSuccess(ADD_SERVICE_TYPE, response));
    yield call(getServiceTypeListSaga);
    toast.success("Service Type added successfully!");
  } catch (error) {
    yield put(serviceTypeApiResponseError(ADD_SERVICE_TYPE, error));
    toast.error("Failed to add service type!");
  }
}

function* updateServiceTypeSaga({ payload }) {
  try {
    const response = yield call(updateServiceTypeApi, payload.data);
    yield put(serviceTypeApiResponseSuccess(UPDATE_SERVICE_TYPE, response));
    yield call(getServiceTypeListSaga);
    toast.success("Service Type updated successfully!");
  } catch (error) {
    yield put(serviceTypeApiResponseError(UPDATE_SERVICE_TYPE, error));
    toast.error("Failed to update service type!");
  }
}

function* deleteServiceTypeSaga({ payload }) {
  try {
    yield call(deleteServiceTypeApi, payload);
    yield put(serviceTypeApiResponseSuccess(DELETE_SERVICE_TYPE, { data: payload }));
    yield call(getServiceTypeListSaga);
    toast.success("Service Type deleted successfully!");
  } catch (error) {
    yield put(serviceTypeApiResponseError(DELETE_SERVICE_TYPE, error));
    toast.error("Failed to delete service type!");
  }
}

// ================== WATCHERS ==================
function* watchGetServiceType() { yield takeEvery(GET_SERVICE_TYPES, getServiceTypeListSaga); }
function* watchAddServiceType() { yield takeEvery(ADD_SERVICE_TYPE, addServiceTypeSaga); }
function* watchUpdateServiceType() { yield takeEvery(UPDATE_SERVICE_TYPE, updateServiceTypeSaga); }
function* watchDeleteServiceType() { yield takeEvery(DELETE_SERVICE_TYPE, deleteServiceTypeSaga); }

// ================== ROOT SAGA ==================
export function* serviceTypeSaga() {
  yield all([
    fork(watchGetServiceType),
    fork(watchAddServiceType),
    fork(watchUpdateServiceType),
    fork(watchDeleteServiceType),
  ]);
}
