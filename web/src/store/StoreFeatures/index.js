// src/store/StoreFeatures/index.js

import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_STORE_FEATURES = "GET_STORE_FEATURES";
export const ADD_STORE_FEATURE = "ADD_STORE_FEATURE";
export const UPDATE_STORE_FEATURE = "UPDATE_STORE_FEATURE";
export const DELETE_STORE_FEATURE = "DELETE_STORE_FEATURE";
export const RESET_ADD_STORE_FEATURE_RESPONSE = "RESET_ADD_STORE_FEATURE_RESPONSE";
export const RESET_UPDATE_STORE_FEATURE_RESPONSE = "RESET_UPDATE_STORE_FEATURE_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const storeFeatureApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const storeFeatureApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddStoreFeatureResponse = () => ({
  type: RESET_ADD_STORE_FEATURE_RESPONSE,
});

export const resetUpdateStoreFeatureResponse = () => ({
  type: RESET_UPDATE_STORE_FEATURE_RESPONSE,
});

export const getStoreFeaturesList = () => ({
  type: GET_STORE_FEATURES,
});

export const addStoreFeature = (feature) => ({
  type: ADD_STORE_FEATURE,
  payload: { feature },
});

export const updateStoreFeature = (feature) => ({
  type: UPDATE_STORE_FEATURE,
  payload: { feature },
});

export const deleteStoreFeature = (id) => ({
  type: DELETE_STORE_FEATURE,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  features: [],
  loading: true,
  error: false,
  addFeatureResponse: false,
  updateFeatureResponse: false,
};

export const StoreFeatureReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_STORE_FEATURES:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_STORE_FEATURES:
          return {
            ...state,
            features: action.payload.data,
            loading: false,
            error: false,
          };
        case ADD_STORE_FEATURE:
          return {
            ...state,
            addFeatureResponse: true,
            features: [...state.features, action.payload.data],
            loading: false,
            error: false,
          };
        case UPDATE_STORE_FEATURE:
          return {
            ...state,
            updateFeatureResponse: true,
            features: state.features.map((f) =>
              f.id === action.payload.data.id ? action.payload.data : f
            ),
            loading: false,
            error: false,
          };
        case DELETE_STORE_FEATURE:
          return {
            ...state,
            features: state.features.filter((f) => f.id !== action.payload.data),
            loading: false,
            error: false,
          };
        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return {
        ...state,
        addFeatureResponse: null,
        error: true,
      };

    case RESET_ADD_STORE_FEATURE_RESPONSE:
      return {
        ...state,
        addFeatureResponse: false,
      };

    case RESET_UPDATE_STORE_FEATURE_RESPONSE:
      return {
        ...state,
        updateFeatureResponse: false,
      };

    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

const getStoreFeaturesApi = () => api.get("/store-feature/list");
const addStoreFeatureApi = (data) => api.create("/store-feature/store", data);
const updateStoreFeatureApi = (data) => api.put("/store-feature/update", data);
const deleteStoreFeatureApi = (id) => api.delete(`/store-feature/delete/${id}`);

// ================== SAGAS ==================

// ✅ Get All Features
function* getStoreFeaturesSaga() {
  try {
    const response = yield call(getStoreFeaturesApi);
    yield put(storeFeatureApiResponseSuccess(GET_STORE_FEATURES, response));
  } catch (error) {
    yield put(storeFeatureApiResponseError(GET_STORE_FEATURES, error));
    toast.error("Failed to fetch store features!");
  }
}

// ✅ Add Feature
function* addStoreFeatureSaga({ payload }) {
  try {
    const { feature } = payload;
    const response = yield call(addStoreFeatureApi, feature);
    yield put(storeFeatureApiResponseSuccess(ADD_STORE_FEATURE, response));
    yield call(getStoreFeaturesSaga);
    toast.success("Feature added successfully!");
  } catch (error) {
    yield put(storeFeatureApiResponseError(ADD_STORE_FEATURE, error));
    toast.error("Failed to add feature!");
  }
}

// ✅ Update Feature
function* updateStoreFeatureSaga({ payload }) {
  try {
    const { feature } = payload;
    const response = yield call(updateStoreFeatureApi, feature);
    yield put(storeFeatureApiResponseSuccess(UPDATE_STORE_FEATURE, response));
    yield call(getStoreFeaturesSaga);
    toast.success("Feature updated successfully!");
  } catch (error) {
    yield put(storeFeatureApiResponseError(UPDATE_STORE_FEATURE, error));
    toast.error("Failed to update feature!");
  }
}

// ✅ Delete Feature
function* deleteStoreFeatureSaga({ payload }) {
  try {
    yield call(deleteStoreFeatureApi, payload);
    yield put(storeFeatureApiResponseSuccess(DELETE_STORE_FEATURE, { data: payload }));
    yield call(getStoreFeaturesSaga);
    toast.success("Feature deleted successfully!");
  } catch (error) {
    yield put(storeFeatureApiResponseError(DELETE_STORE_FEATURE, error));
    toast.error("Failed to delete feature!");
  }
}

// ================== WATCHERS ==================
function* watchGetStoreFeatures() {
  yield takeEvery(GET_STORE_FEATURES, getStoreFeaturesSaga);
}

function* watchAddStoreFeature() {
  yield takeEvery(ADD_STORE_FEATURE, addStoreFeatureSaga);
}

function* watchUpdateStoreFeature() {
  yield takeEvery(UPDATE_STORE_FEATURE, updateStoreFeatureSaga);
}

function* watchDeleteStoreFeature() {
  yield takeEvery(DELETE_STORE_FEATURE, deleteStoreFeatureSaga);
}

// ================== ROOT SAGA ==================
export function* storeFeatureSaga() {
  yield all([
    fork(watchGetStoreFeatures),
    fork(watchAddStoreFeature),
    fork(watchUpdateStoreFeature),
    fork(watchDeleteStoreFeature),
  ]);
}
