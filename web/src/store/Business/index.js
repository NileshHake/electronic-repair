import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_BUSINESSES = "GET_BUSINESSES";
export const ADD_BUSINESS = "ADD_BUSINESS";
export const UPDATE_BUSINESS = "UPDATE_BUSINESS";
export const DELETE_BUSINESS = "DELETE_BUSINESS";
export const GET_SINGLE_BUSINESS = "GET_SINGLE_BUSINESS";
export const RESET_ADD_BUSINESS_RESPONSE = "RESET_ADD_BUSINESS_RESPONSE";
export const RESET_UPDATE_BUSINESS_RESPONSE = "RESET_UPDATE_BUSINESS_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const businessApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const businessApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddBusinessResponse = () => ({
  type: RESET_ADD_BUSINESS_RESPONSE,
});

export const resetUpdateBusinessResponse = () => ({
  type: RESET_UPDATE_BUSINESS_RESPONSE,
});

export const getBusinessesList = () => ({
  type: GET_BUSINESSES,
});

export const getSingleBusiness = (id) => ({
  type: GET_SINGLE_BUSINESS,
  payload: id,
});

export const addBusiness = (business) => ({
  type: ADD_BUSINESS,
  payload: business,
});

export const IsBusinessUpdate = (business) => ({
  type: UPDATE_BUSINESS,
  payload: business,
});

export const deleteBusiness = (id) => ({
  type: DELETE_BUSINESS,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  businesses: [],
  singleBusiness: null,
  loading: true,
  error: false,
  addBusinessResponse: false,
  updateBusinessResponse: false,
};

export const BusinessReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_BUSINESSES:
    case GET_SINGLE_BUSINESS:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_BUSINESSES:
          return { ...state, businesses: action.payload.data, loading: false };
        case GET_SINGLE_BUSINESS:
          return { ...state, singleBusiness: action.payload.data, loading: false };
        case ADD_BUSINESS:
          return {
            ...state,
            addBusinessResponse: true,
            businesses: [...state.businesses, action.payload.data],
          };
        case UPDATE_BUSINESS:
          return {
            ...state,
            updateBusinessResponse: true,
            businesses: state.businesses.map((b) =>
              b.user_id === action.payload.data.user_id ? action.payload.data : b
            ),
          };
        case DELETE_BUSINESS:
          return {
            ...state,
            businesses: state.businesses.filter((b) => b.user_id !== action.payload.data),
          };
        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true, loading: false };
    case RESET_ADD_BUSINESS_RESPONSE:
      return { ...state, addBusinessResponse: false };
    case RESET_UPDATE_BUSINESS_RESPONSE:
      return { ...state, updateBusinessResponse: false };
    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

const getBusinessesApi = () => api.get("/business/list");
const getSingleBusinessApi = (id) => api.get(`/user/single/${id}`);
const addBusinessApi = (formData) => api.create(`/user/store`, formData);
const updateBusinessApi = (data) => api.put(`/user/update`, data);
const deleteBusinessApi = (id) => api.delete(`/user/delete/${id}`);

// ================== SAGAS ==================
function* getBusinessesListSaga() {
  try {
    const response = yield call(getBusinessesApi);
    yield put(businessApiResponseSuccess(GET_BUSINESSES, response));
  } catch (error) {
    yield put(businessApiResponseError(GET_BUSINESSES, error));
    toast.error("Failed to fetch businesses!");
  }
}

function* getSingleBusinessSaga({ payload }) {
  try {
    const response = yield call(getSingleBusinessApi, payload);
    yield put(businessApiResponseSuccess(GET_SINGLE_BUSINESS, response));
  } catch (error) {
    yield put(businessApiResponseError(GET_SINGLE_BUSINESS, error));
    toast.error("Failed to fetch business details!");
  }
}

function* addBusinessSaga({ payload }) {
  try {
    let response;
    payload.user_type = 2; // ✅ For Business (change user_type as needed)

    if (payload.user_profile && payload.user_profile instanceof File) {
      const formData = new FormData();
      for (const key in payload) {
        formData.append(key, payload[key]);
      }
      response = yield call(addBusinessApi, formData);
    } else {
      response = yield call(api.create, `/user/store`, payload);
    }

    yield put(businessApiResponseSuccess(ADD_BUSINESS, response));
    yield call(getBusinessesListSaga);
    toast.success("Business added successfully!");
  } catch (error) {
    yield put(businessApiResponseError(ADD_BUSINESS, error));
    toast.error("Failed to add business!");
  }
}

function* updateBusinessSaga({ payload }) {
  try {
    let response;
    payload.user_type = 2; // ✅ For Business

    if (payload.user_profile && payload.user_profile instanceof File) {
      const formData = new FormData();
      for (const key in payload) {
        formData.append(key, payload[key]);
      }
      response = yield call(api.putFormData, `/user/update`, formData);
    } else {
      response = yield call(api.put, `/user/update`, payload);
    }

    yield put(businessApiResponseSuccess(UPDATE_BUSINESS, response));
    yield call(getBusinessesListSaga);
    toast.success("Business updated successfully!");
  } catch (error) {
    yield put(businessApiResponseError(UPDATE_BUSINESS, error));
    toast.error("Failed to update business!");
  }
}

function* deleteBusinessSaga({ payload }) {
  try {
    yield call(deleteBusinessApi, payload);
    yield put(businessApiResponseSuccess(DELETE_BUSINESS, { data: payload }));
    yield call(getBusinessesListSaga);
    toast.success("Business deleted successfully!");
  } catch (error) {
    yield put(businessApiResponseError(DELETE_BUSINESS, error));
    toast.error("Failed to delete business!");
  }
}

// ================== WATCHERS ==================
function* watchGetBusinesses() {
  yield takeEvery(GET_BUSINESSES, getBusinessesListSaga);
}
function* watchGetSingleBusiness() {
  yield takeEvery(GET_SINGLE_BUSINESS, getSingleBusinessSaga);
}
function* watchAddBusiness() {
  yield takeEvery(ADD_BUSINESS, addBusinessSaga);
}
function* watchUpdateBusiness() {
  yield takeEvery(UPDATE_BUSINESS, updateBusinessSaga);
}
function* watchDeleteBusiness() {
  yield takeEvery(DELETE_BUSINESS, deleteBusinessSaga);
}

export function* businessSaga() {
  yield all([
    fork(watchGetBusinesses),
    fork(watchGetSingleBusiness),
    fork(watchAddBusiness),
    fork(watchUpdateBusiness),
    fork(watchDeleteBusiness),
  ]);
}
