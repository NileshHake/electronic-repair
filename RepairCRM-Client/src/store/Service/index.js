import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_SERVICES = "GET_SERVICES";
export const ADD_SERVICE = "ADD_SERVICE";
export const UPDATE_SERVICE = "UPDATE_SERVICE";
export const DELETE_SERVICE = "DELETE_SERVICE";
export const RESET_ADD_SERVICE_RESPONSE = "RESET_ADD_SERVICE_RESPONSE";
export const RESET_UPDATE_SERVICE_RESPONSE = "RESET_UPDATE_SERVICE_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const serviceApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const serviceApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddServiceResponse = () => ({ type: RESET_ADD_SERVICE_RESPONSE });
export const resetUpdateServiceResponse = () => ({ type: RESET_UPDATE_SERVICE_RESPONSE });

export const getServicesList = () => ({ type: GET_SERVICES });
export const addService = (service) => ({ type: ADD_SERVICE, payload: { service } });
export const updateService = (service) => ({ type: UPDATE_SERVICE, payload: { service } });
export const deleteService = (id) => ({ type: DELETE_SERVICE, payload: id });

// ================== REDUCER ==================
const INIT_STATE = {
  services: [],
  loading: true,
  error: false,
  addServiceResponse: false,
  updateServiceResponse: false,
};

export const ServiceReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_SERVICES:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_SERVICES:
          return { ...state, services: action.payload.data, loading: false, error: false };

        case ADD_SERVICE:
          return {
            ...state,
            addServiceResponse: true,
            services: [...state.services, action.payload.data],
            loading: false,
            error: false,
          };

        case UPDATE_SERVICE:
          return {
            ...state,
            updateServiceResponse: true,
            services: state.services.map((s) =>
              s.service_id === action.payload.data.service_id ? action.payload.data : s
            ),
            loading: false,
            error: false,
          };

        case DELETE_SERVICE:
          return {
            ...state,
            services: state.services.filter((s) => s.service_id !== action.payload.data),
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true, addServiceResponse: null };

    case RESET_ADD_SERVICE_RESPONSE:
      return { ...state, addServiceResponse: false };

    case RESET_UPDATE_SERVICE_RESPONSE:
      return { ...state, updateServiceResponse: false };

    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();
const getServicesApi = () => api.get("/service/list");
const addServiceApi = (data) => api.create("/service/store", data);
const updateServiceApi = (data) => api.put("/service/update", data);
const deleteServiceApi = (id) => api.delete(`/service/delete/${id}`);

// ================== SAGAS ==================
function* getServicesListSaga() {
  try {
    const response = yield call(getServicesApi);
    yield put(serviceApiResponseSuccess(GET_SERVICES, response));
  } catch (error) {
    yield put(serviceApiResponseError(GET_SERVICES, error));
    toast.error("Failed to fetch services!");
  }
}

function* addServiceSaga({ payload }) {
  try {
    const { service } = payload;
    const response = yield call(addServiceApi, service);
    yield put(serviceApiResponseSuccess(ADD_SERVICE, response));
    yield call(getServicesListSaga);
    toast.success("Service added successfully!");
  } catch (error) {
    yield put(serviceApiResponseError(ADD_SERVICE, error));
    toast.error("Failed to add service!");
  }
}

function* updateServiceSaga({ payload }) {
  try {
    const { service } = payload;
    const response = yield call(updateServiceApi, service);
    yield put(serviceApiResponseSuccess(UPDATE_SERVICE, response));
    yield call(getServicesListSaga);
    toast.success("Service updated successfully!");
  } catch (error) {
    yield put(serviceApiResponseError(UPDATE_SERVICE, error));
    toast.error("Failed to update service!");
  }
}

function* deleteServiceSaga({ payload }) {
  try {
    yield call(deleteServiceApi, payload);
    yield put(serviceApiResponseSuccess(DELETE_SERVICE, { data: payload }));
    yield call(getServicesListSaga);
    toast.success("Service deleted successfully!");
  } catch (error) {
    yield put(serviceApiResponseError(DELETE_SERVICE, error));
    toast.error("Failed to delete service!");
  }
}

// ================== WATCHERS ==================
function* watchGetServices() {
  yield takeEvery(GET_SERVICES, getServicesListSaga);
}

function* watchAddService() {
  yield takeEvery(ADD_SERVICE, addServiceSaga);
}

function* watchUpdateService() {
  yield takeEvery(UPDATE_SERVICE, updateServiceSaga);
}

function* watchDeleteService() {
  yield takeEvery(DELETE_SERVICE, deleteServiceSaga);
}

// ================== ROOT SAGA ==================
export function* serviceSaga() {
  yield all([fork(watchGetServices), fork(watchAddService), fork(watchUpdateService), fork(watchDeleteService)]);
}
