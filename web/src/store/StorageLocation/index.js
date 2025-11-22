import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_STORAGE_LOCATIONS = "GET_STORAGE_LOCATIONS";
export const ADD_STORAGE_LOCATION = "ADD_STORAGE_LOCATION";
export const UPDATE_STORAGE_LOCATION = "UPDATE_STORAGE_LOCATION";
export const DELETE_STORAGE_LOCATION = "DELETE_STORAGE_LOCATION";
export const GET_SINGLE_STORAGE_LOCATION = "GET_SINGLE_STORAGE_LOCATION";

export const RESET_ADD_STORAGE_LOCATION_RESPONSE = "RESET_ADD_STORAGE_LOCATION_RESPONSE";
export const RESET_UPDATE_STORAGE_LOCATION_RESPONSE = "RESET_UPDATE_STORAGE_LOCATION_RESPONSE";

export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const storageLocationApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const storageLocationApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const getStorageLocationsList = () => ({
  type: GET_STORAGE_LOCATIONS,
});

export const getSingleStorageLocation = (id) => ({
  type: GET_SINGLE_STORAGE_LOCATION,
  payload: id,
});

export const addStorageLocation = (storageLocation) => ({
  type: ADD_STORAGE_LOCATION,
  payload: { storageLocation },
});

export const updateStorageLocation = (storageLocation) => ({
  type: UPDATE_STORAGE_LOCATION,
  payload: { storageLocation },
});

export const deleteStorageLocation = (id) => ({
  type: DELETE_STORAGE_LOCATION,
  payload: id,
});

export const resetAddStorageLocationResponse = () => ({
  type: RESET_ADD_STORAGE_LOCATION_RESPONSE,
});

export const resetUpdateStorageLocationResponse = () => ({
  type: RESET_UPDATE_STORAGE_LOCATION_RESPONSE,
});

// ================== REDUCER ==================
const INIT_STATE = {
  storageLocations: [],
  singleStorageLocation: null,
  loading: true,
  error: false,
  addStorageLocationResponse: false,
  updateStorageLocationResponse: false,
};

export const StorageLocationReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_STORAGE_LOCATIONS:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_STORAGE_LOCATIONS:
          return {
            ...state,
            storageLocations: action.payload.data,
            loading: false,
            error: false,
          };

        case GET_SINGLE_STORAGE_LOCATION:
          return {
            ...state,
            singleStorageLocation: action.payload.data,
            loading: false,
            error: false,
          };

        case ADD_STORAGE_LOCATION:
          return {
            ...state,
            addStorageLocationResponse: true,
            storageLocations: [...state.storageLocations, action.payload.data],
            loading: false,
            error: false,
          };

        case UPDATE_STORAGE_LOCATION:
          return {
            ...state,
            updateStorageLocationResponse: true,
            storageLocations: state.storageLocations.map((loc) =>
              loc.storage_location_id === action.payload.data.storage_location_id
                ? action.payload.data
                : loc
            ),
            loading: false,
            error: false,
          };

        case DELETE_STORAGE_LOCATION:
          return {
            ...state,
            storageLocations: state.storageLocations.filter(
              (loc) => loc.storage_location_id !== action.payload.data
            ),
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true };

    case RESET_ADD_STORAGE_LOCATION_RESPONSE:
      return { ...state, addStorageLocationResponse: false };

    case RESET_UPDATE_STORAGE_LOCATION_RESPONSE:
      return { ...state, updateStorageLocationResponse: false };

    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

const getStorageLocationsApi = () => api.get("/storage-location/list");
const getSingleStorageLocationApi = (id) => api.get(`/storage-location/single/${id}`);
const addStorageLocationApi = (data) => api.create("/storage-location/store", data);
const updateStorageLocationApi = (data) => api.put("/storage-location/update", data);
const deleteStorageLocationApi = (id) => api.delete(`/storage-location/delete/${id}`);

// ================== SAGAS ==================
function* getStorageLocationsListSaga() {
  try {
    const response = yield call(getStorageLocationsApi);
    yield put(storageLocationApiResponseSuccess(GET_STORAGE_LOCATIONS, response));
  } catch (error) {
    yield put(storageLocationApiResponseError(GET_STORAGE_LOCATIONS, error));
    toast.error("Failed to fetch storage locations!");
  }
}

function* getSingleStorageLocationSaga({ payload }) {
  try {
    const response = yield call(getSingleStorageLocationApi, payload);
    yield put(storageLocationApiResponseSuccess(GET_SINGLE_STORAGE_LOCATION, response));
  } catch (error) {
    yield put(storageLocationApiResponseError(GET_SINGLE_STORAGE_LOCATION, error));
    toast.error("Failed to fetch storage location!");
  }
}

function* addStorageLocationSaga({ payload }) {
  try {
    const { storageLocation } = payload;
    const response = yield call(addStorageLocationApi, storageLocation);
    yield put(storageLocationApiResponseSuccess(ADD_STORAGE_LOCATION, response));
    yield call(getStorageLocationsListSaga);
    toast.success("Storage Location added successfully!");
  } catch (error) {
    yield put(storageLocationApiResponseError(ADD_STORAGE_LOCATION, error));
    toast.error("Failed to add storage location!");
  }
}

function* updateStorageLocationSaga({ payload }) {
  try {
    const { storageLocation } = payload;
    const response = yield call(updateStorageLocationApi, storageLocation);
    yield put(storageLocationApiResponseSuccess(UPDATE_STORAGE_LOCATION, response));
    yield call(getStorageLocationsListSaga);
    toast.success("Storage Location updated successfully!");
  } catch (error) {
    yield put(storageLocationApiResponseError(UPDATE_STORAGE_LOCATION, error));
    toast.error("Failed to update storage location!");
  }
}

function* deleteStorageLocationSaga({ payload }) {
  try {
    yield call(deleteStorageLocationApi, payload);
    yield put(storageLocationApiResponseSuccess(DELETE_STORAGE_LOCATION, { data: payload }));
    yield call(getStorageLocationsListSaga);
    toast.success("Storage Location deleted successfully!");
  } catch (error) {
    yield put(storageLocationApiResponseError(DELETE_STORAGE_LOCATION, error));
    toast.error("Failed to delete storage location!");
  }
}

// ================== WATCHERS ==================
function* watchGetStorageLocations() {
  yield takeEvery(GET_STORAGE_LOCATIONS, getStorageLocationsListSaga);
}

function* watchGetSingleStorageLocation() {
  yield takeEvery(GET_SINGLE_STORAGE_LOCATION, getSingleStorageLocationSaga);
}

function* watchAddStorageLocation() {
  yield takeEvery(ADD_STORAGE_LOCATION, addStorageLocationSaga);
}

function* watchUpdateStorageLocation() {
  yield takeEvery(UPDATE_STORAGE_LOCATION, updateStorageLocationSaga);
}

function* watchDeleteStorageLocation() {
  yield takeEvery(DELETE_STORAGE_LOCATION, deleteStorageLocationSaga);
}

// ================== ROOT SAGA ==================
export function* storageLocationSaga() {
  yield all([
    fork(watchGetStorageLocations),
    fork(watchGetSingleStorageLocation),
    fork(watchAddStorageLocation),
    fork(watchUpdateStorageLocation),
    fork(watchDeleteStorageLocation),
  ]);
}
