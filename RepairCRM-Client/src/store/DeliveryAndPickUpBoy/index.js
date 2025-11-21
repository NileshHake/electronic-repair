import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_DELIVERY_BOYS = "GET_DELIVERY_BOYS";
export const ADD_DELIVERY_BOY = "ADD_DELIVERY_BOY";
export const UPDATE_DELIVERY_BOY = "UPDATE_DELIVERY_BOY";
export const DELETE_DELIVERY_BOY = "DELETE_DELIVERY_BOY";
export const GET_SINGLE_DELIVERY_BOY = "GET_SINGLE_DELIVERY_BOY";
export const RESET_ADD_DELIVERY_BOY_RESPONSE = "RESET_ADD_DELIVERY_BOY_RESPONSE";
export const RESET_UPDATE_DELIVERY_BOY_RESPONSE = "RESET_UPDATE_DELIVERY_BOY_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const deliveryBoyApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const deliveryBoyApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddDeliveryBoyResponse = () => ({
  type: RESET_ADD_DELIVERY_BOY_RESPONSE,
});

export const resetUpdateDeliveryBoyResponse = () => ({
  type: RESET_UPDATE_DELIVERY_BOY_RESPONSE,
});

export const getDeliveryBoysList = () => ({
  type: GET_DELIVERY_BOYS,
});

export const getSingleDeliveryBoy = (id) => ({
  type: GET_SINGLE_DELIVERY_BOY,
  payload: id,
});

export const addDeliveryBoy = (deliveryBoy) => ({
  type: ADD_DELIVERY_BOY,
  payload: deliveryBoy,
});

export const updateDeliveryBoy = (deliveryBoy) => ({
  type: UPDATE_DELIVERY_BOY,
  payload: deliveryBoy,
});

export const deleteDeliveryBoy = (id) => ({
  type: DELETE_DELIVERY_BOY,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  deliveryBoys: [],
  singleDeliveryBoy: null,
  loading: true,
  error: false,
  addDeliveryBoyResponse: false,
  updateDeliveryBoyResponse: false,
};

export const DeliveryBoyReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_DELIVERY_BOYS:
    case GET_SINGLE_DELIVERY_BOY:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_DELIVERY_BOYS:
          return { ...state, deliveryBoys: action.payload.data, loading: false };
        case GET_SINGLE_DELIVERY_BOY:
          return { ...state, singleDeliveryBoy: action.payload.data, loading: false };
        case ADD_DELIVERY_BOY:
          return {
            ...state,
            addDeliveryBoyResponse: true,
            deliveryBoys: [...state.deliveryBoys, action.payload.data],
          };
        case UPDATE_DELIVERY_BOY:
          return {
            ...state,
            updateDeliveryBoyResponse: true,
            deliveryBoys: state.deliveryBoys.map((d) =>
              d.user_id === action.payload.data.user_id ? action.payload.data : d
            ),
          };
        case DELETE_DELIVERY_BOY:
          return {
            ...state,
            deliveryBoys: state.deliveryBoys.filter((d) => d.user_id !== action.payload.data),
          };
        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true, loading: false };
    case RESET_ADD_DELIVERY_BOY_RESPONSE:
      return { ...state, addDeliveryBoyResponse: false };
    case RESET_UPDATE_DELIVERY_BOY_RESPONSE:
      return { ...state, updateDeliveryBoyResponse: false };
    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

const getDeliveryBoysApi = () => api.get("/delivery/list");
const getSingleDeliveryBoyApi = (id) => api.get(`/user/single/${id}`);
const addDeliveryBoyApi = (formData) => api.create(`/user/store`, formData);
const updateDeliveryBoyApi = (data) => api.put(`/user/update`, data);
const deleteDeliveryBoyApi = (id) => api.delete(`/user/delete/${id}`);

// ================== SAGAS ==================
function* getDeliveryBoysListSaga() {
  try {
    const response = yield call(getDeliveryBoysApi);
    yield put(deliveryBoyApiResponseSuccess(GET_DELIVERY_BOYS, response));
  } catch (error) {
    yield put(deliveryBoyApiResponseError(GET_DELIVERY_BOYS, error));
    toast.error("Failed to fetch delivery boys!");
  }
}

function* getSingleDeliveryBoySaga({ payload }) {
  try {
    const response = yield call(getSingleDeliveryBoyApi, payload);
    yield put(deliveryBoyApiResponseSuccess(GET_SINGLE_DELIVERY_BOY, response));
  } catch (error) {
    yield put(deliveryBoyApiResponseError(GET_SINGLE_DELIVERY_BOY, error));
    toast.error("Failed to fetch delivery boy details!");
  }
}

function* addDeliveryBoySaga({ payload }) {
  try {
    let response;
    payload.user_type = 5; // ✅ Always Delivery Boy

    if (payload.user_profile && payload.user_profile instanceof File) {
      const formData = new FormData();
      for (const key in payload) {
        formData.append(key, payload[key]);
      }
      response = yield call(addDeliveryBoyApi, formData);
    } else {
      response = yield call(api.create, `/user/store`, payload);
    }

    yield put(deliveryBoyApiResponseSuccess(ADD_DELIVERY_BOY, response));
    yield call(getDeliveryBoysListSaga);
    toast.success("✅ Delivery Boy added successfully!");
  } catch (error) {
    console.error("❌ Error in addDeliveryBoySaga:", error);
    yield put(deliveryBoyApiResponseError(ADD_DELIVERY_BOY, error));
    toast.error("❌ Failed to add delivery boy!");
  }
}

function* updateDeliveryBoySaga({ payload }) {
  try {
    let response;
    payload.user_type = 5; // ✅ Always Delivery Boy

    if (payload.user_profile && payload.user_profile instanceof File) {
      const formData = new FormData();
      for (const key in payload) {
        formData.append(key, payload[key]);
      }
      response = yield call(api.putFormData, `/user/update`, formData);
    } else {
      response = yield call(api.put, `/user/update`, payload);
    }

    yield put(deliveryBoyApiResponseSuccess(UPDATE_DELIVERY_BOY, response));
    yield call(getDeliveryBoysListSaga);
    toast.success("✅ Delivery Boy updated successfully!");
  } catch (error) {
    console.error("❌ Error in updateDeliveryBoySaga:", error);
    yield put(deliveryBoyApiResponseError(UPDATE_DELIVERY_BOY, error));
    toast.error("❌ Failed to update delivery boy!");
  }
}

function* deleteDeliveryBoySaga({ payload }) {
  try {
    yield call(deleteDeliveryBoyApi, payload);
    yield put(deliveryBoyApiResponseSuccess(DELETE_DELIVERY_BOY, { data: payload }));
    yield call(getDeliveryBoysListSaga);
    toast.success("🗑️ Delivery Boy deleted successfully!");
  } catch (error) {
    yield put(deliveryBoyApiResponseError(DELETE_DELIVERY_BOY, error));
    toast.error("❌ Failed to delete delivery boy!");
  }
}

// ================== WATCHERS ==================
function* watchGetDeliveryBoys() {
  yield takeEvery(GET_DELIVERY_BOYS, getDeliveryBoysListSaga);
}
function* watchGetSingleDeliveryBoy() {
  yield takeEvery(GET_SINGLE_DELIVERY_BOY, getSingleDeliveryBoySaga);
}
function* watchAddDeliveryBoy() {
  yield takeEvery(ADD_DELIVERY_BOY, addDeliveryBoySaga);
}
function* watchUpdateDeliveryBoy() {
  yield takeEvery(UPDATE_DELIVERY_BOY, updateDeliveryBoySaga);
}
function* watchDeleteDeliveryBoy() {
  yield takeEvery(DELETE_DELIVERY_BOY, deleteDeliveryBoySaga);
}

// ================== ROOT SAGA ==================
export function* deliveryBoySaga() {
  yield all([
    fork(watchGetDeliveryBoys),
    fork(watchGetSingleDeliveryBoy),
    fork(watchAddDeliveryBoy),
    fork(watchUpdateDeliveryBoy),
    fork(watchDeleteDeliveryBoy),
  ]);
}
