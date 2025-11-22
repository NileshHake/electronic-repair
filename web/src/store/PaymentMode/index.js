import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_PAYMENT_TYPES = "GET_PAYMENT_TYPES";
export const ADD_PAYMENT_TYPE = "ADD_PAYMENT_TYPE";
export const UPDATE_PAYMENT_TYPE = "UPDATE_PAYMENT_TYPE";
export const DELETE_PAYMENT_TYPE = "DELETE_PAYMENT_TYPE";
export const RESET_ADD_PAYMENT_TYPE_RESPONSE = "RESET_ADD_PAYMENT_TYPE_RESPONSE";
export const RESET_UPDATE_PAYMENT_TYPE_RESPONSE = "RESET_UPDATE_PAYMENT_TYPE_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const paymentTypeApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const paymentTypeApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddPaymentTypeResponse = () => ({
  type: RESET_ADD_PAYMENT_TYPE_RESPONSE,
});

export const resetUpdatePaymentTypeResponse = () => ({
  type: RESET_UPDATE_PAYMENT_TYPE_RESPONSE,
});

export const getPaymentTypesList = () => ({
  type: GET_PAYMENT_TYPES,
});

export const addPaymentType = (paymentType) => ({
  type: ADD_PAYMENT_TYPE,
  payload: { paymentType },
});

export const updatePaymentType = (paymentType) => ({
  type: UPDATE_PAYMENT_TYPE,
  payload: { paymentType },
});

export const deletePaymentType = (id) => ({
  type: DELETE_PAYMENT_TYPE,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  paymentTypes: [],
  loading: true,
  error: false,
  addPaymentTypeResponse: false,
  updatePaymentTypeResponse: false,
};

export const PaymentTypeReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_PAYMENT_TYPES:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_PAYMENT_TYPES:
          return {
            ...state,
            paymentTypes: action.payload.data,
            loading: false,
            error: false,
          };

        case ADD_PAYMENT_TYPE:
          return {
            ...state,
            addPaymentTypeResponse: true,
            paymentTypes: [...state.paymentTypes, action.payload.data],
            loading: false,
            error: false,
          };

        case UPDATE_PAYMENT_TYPE:
          return {
            ...state,
            updatePaymentTypeResponse: true,
            paymentTypes: state.paymentTypes.map((t) =>
              t.payment_type_id === action.payload.data.payment_type_id
                ? action.payload.data
                : t
            ),
            loading: false,
            error: false,
          };

        case DELETE_PAYMENT_TYPE:
          return {
            ...state,
            paymentTypes: state.paymentTypes.filter(
              (t) => t.payment_type_id !== action.payload.data
            ),
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return {
        ...state,
        addPaymentTypeResponse: null,
        error: true,
      };

    case RESET_ADD_PAYMENT_TYPE_RESPONSE:
      return {
        ...state,
        addPaymentTypeResponse: false,
      };

    case RESET_UPDATE_PAYMENT_TYPE_RESPONSE:
      return {
        ...state,
        updatePaymentTypeResponse: false,
      };

    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

const getPaymentTypesApi = () => api.get("/payment_type/list");
const addPaymentTypeApi = (data) => api.create("/payment_type/store", data);
const updatePaymentTypeApi = (data) => api.put("/payment_type/update", data);
const deletePaymentTypeApi = (id) => api.delete(`/payment_type/delete/${id}`);

// ================== SAGAS ==================
function* getPaymentTypesListSaga() {
  try {
    const response = yield call(getPaymentTypesApi);
    yield put(paymentTypeApiResponseSuccess(GET_PAYMENT_TYPES, response));
  } catch (error) {
    yield put(paymentTypeApiResponseError(GET_PAYMENT_TYPES, error));
    toast.error("Failed to fetch payment types!");
  }
}

function* addPaymentTypeSaga({ payload }) {
  try {
    const { paymentType } = payload;
    const response = yield call(addPaymentTypeApi, paymentType);
    yield put(paymentTypeApiResponseSuccess(ADD_PAYMENT_TYPE, response));
    yield call(getPaymentTypesListSaga);
    toast.success("Payment Type added successfully!");
  } catch (error) {
    yield put(paymentTypeApiResponseError(ADD_PAYMENT_TYPE, error));
    toast.error("Failed to add payment type!");
  }
}

function* updatePaymentTypeSaga({ payload }) {
  try {
    const { paymentType } = payload;
    const response = yield call(updatePaymentTypeApi, paymentType);
    yield put(paymentTypeApiResponseSuccess(UPDATE_PAYMENT_TYPE, response));
    yield call(getPaymentTypesListSaga);
    toast.success("Payment Type updated successfully!");
  } catch (error) {
    yield put(paymentTypeApiResponseError(UPDATE_PAYMENT_TYPE, error));
    toast.error("Failed to update payment type!");
  }
}

function* deletePaymentTypeSaga({ payload }) {
  try {
    yield call(deletePaymentTypeApi, payload);
    yield put(paymentTypeApiResponseSuccess(DELETE_PAYMENT_TYPE, { data: payload }));
    yield call(getPaymentTypesListSaga);
    toast.success("Payment Type deleted successfully!");
  } catch (error) {
    yield put(paymentTypeApiResponseError(DELETE_PAYMENT_TYPE, error));
    toast.error("Failed to delete payment type!");
  }
}


// ================== WATCHERS ==================
function* watchGetPaymentTypes() {
  yield takeEvery(GET_PAYMENT_TYPES, getPaymentTypesListSaga);
}

function* watchAddPaymentType() {
  yield takeEvery(ADD_PAYMENT_TYPE, addPaymentTypeSaga);
}

function* watchUpdatePaymentType() {
  yield takeEvery(UPDATE_PAYMENT_TYPE, updatePaymentTypeSaga);
}

function* watchDeletePaymentType() {
  yield takeEvery(DELETE_PAYMENT_TYPE, deletePaymentTypeSaga);
}

// ================== ROOT SAGA ==================
export function* paymentTypeSaga() {
  yield all([
    fork(watchGetPaymentTypes),
    fork(watchAddPaymentType),
    fork(watchUpdatePaymentType),
    fork(watchDeletePaymentType),
  ]);
}
