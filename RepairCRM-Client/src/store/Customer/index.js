// ================== IMPORTS ==================
import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_CUSTOMERS = "GET_CUSTOMERS";
export const ADD_CUSTOMER = "ADD_CUSTOMER";
export const UPDATE_CUSTOMER = "UPDATE_CUSTOMER";
export const DELETE_CUSTOMER = "DELETE_CUSTOMER";
export const GET_SINGLE_CUSTOMER = "GET_SINGLE_CUSTOMER";

export const RESET_ADD_CUSTOMER_RESPONSE = "RESET_ADD_CUSTOMER_RESPONSE";
export const RESET_UPDATE_CUSTOMER_RESPONSE = "RESET_UPDATE_CUSTOMER_RESPONSE";

export const API_RESPONSE_SUCCESS = "CUSTOMER_API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "CUSTOMER_API_RESPONSE_ERROR";

// ================== ACTION CREATORS ==================
export const customerApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const customerApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddCustomerResponse = () => ({
  type: RESET_ADD_CUSTOMER_RESPONSE,
});

export const resetUpdateCustomerResponse = () => ({
  type: RESET_UPDATE_CUSTOMER_RESPONSE,
});

export const getCustomerList = () => ({
  type: GET_CUSTOMERS,
});

export const getSingleCustomer = (id) => ({
  type: GET_SINGLE_CUSTOMER,
  payload: id,
});

export const addCustomer = (data) => ({
  type: ADD_CUSTOMER,
  payload: data,
});

export const updateCustomer = (data) => ({
  type: UPDATE_CUSTOMER,
  payload: data,
});

export const deleteCustomer = (id) => ({
  type: DELETE_CUSTOMER,
  payload: id,
});

// ================== INITIAL STATE ==================
const INIT_STATE = {
  customerList: [],
  singleCustomer: null,
  loading: true,
  error: false,
  addCustomerResponse: false,
  updateCustomerResponse: false,
};

// ================== REDUCER ==================
const CustomerReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_CUSTOMERS:
    case GET_SINGLE_CUSTOMER:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS: {
      const { actionType, data } = action.payload;
      switch (actionType) {
        case GET_CUSTOMERS:
          return { ...state, customerList: data || [], loading: false };

        case GET_SINGLE_CUSTOMER:
          return { ...state, singleCustomer: data, loading: false };

        case ADD_CUSTOMER:
          return { ...state, addCustomerResponse: true };

        case UPDATE_CUSTOMER:
          return { ...state, updateCustomerResponse: true };

        case DELETE_CUSTOMER:
          return {
            ...state,
            customerList: state.customerList.filter(
              (cust) => cust.customer_id !== data
            ),
          };

        default:
          return state;
      }
    }

    case API_RESPONSE_ERROR:
      return { ...state, error: true, loading: false };

    case RESET_ADD_CUSTOMER_RESPONSE:
      return { ...state, addCustomerResponse: false };

    case RESET_UPDATE_CUSTOMER_RESPONSE:
      return { ...state, updateCustomerResponse: false };

    default:
      return state;
  }
};

export default CustomerReducer;

// ================== API CALLS ==================
const api = new APIClient();

const getCustomerApi = () => api.get("/customer/list");
const getSingleCustomerApi = (id) => api.get(`/customer/single/${id}`);
const addCustomerApi = (formData) => api.create(`/customer/store`, formData);
const updateCustomerApi = (data) => api.put(`/customer/update`, data);
const deleteCustomerApi = (id) => api.delete(`/customer/delete/${id}`);

// ================== SAGAS ==================
function* getCustomerListSaga() {
  try {
    const response = yield call(getCustomerApi);
    yield put(customerApiResponseSuccess(GET_CUSTOMERS, response));
  } catch (error) {
    yield put(customerApiResponseError(GET_CUSTOMERS, error));
    toast.error("❌ Failed to fetch customers!");
  }
}

function* getSingleCustomerSaga({ payload }) {
  try {
    const response = yield call(getSingleCustomerApi, payload);
    yield put(customerApiResponseSuccess(GET_SINGLE_CUSTOMER, response));
  } catch (error) {
    yield put(customerApiResponseError(GET_SINGLE_CUSTOMER, error));
    toast.error("❌ Failed to fetch customer details!");
  }
}

function* addCustomerSaga({ payload }) {
  try {
    const response = yield call(addCustomerApi, payload);
    yield put(customerApiResponseSuccess(ADD_CUSTOMER, response));
     yield put({ type: GET_CUSTOMERS });
    toast.success("  Customer added successfully!");
  } catch (error) {
    yield put(customerApiResponseError(ADD_CUSTOMER, error));
    toast.error("❌ Failed to add customer!");
  }
}

function* updateCustomerSaga({ payload }) {
  try {
    const response = yield call(updateCustomerApi, payload);
    yield put(customerApiResponseSuccess(UPDATE_CUSTOMER, response));
    toast.success(" Customer updated successfully!");
  } catch (error) {
    yield put(customerApiResponseError(UPDATE_CUSTOMER, error));
    toast.error("❌ Failed to update customer!");
  }
}

function* deleteCustomerSaga({ payload }) {
  try {
    yield call(deleteCustomerApi, payload);
    yield put(customerApiResponseSuccess(DELETE_CUSTOMER, payload));
    toast.success("🗑️ Customer deleted successfully!");
  } catch (error) {
    yield put(customerApiResponseError(DELETE_CUSTOMER, error));
    toast.error("❌ Failed to delete customer!");
  }
}

// ================== WATCHERS ==================
function* watchGetCustomers() {
  yield takeEvery(GET_CUSTOMERS, getCustomerListSaga);
}
function* watchGetSingleCustomer() {
  yield takeEvery(GET_SINGLE_CUSTOMER, getSingleCustomerSaga);
}
function* watchAddCustomer() {
  yield takeEvery(ADD_CUSTOMER, addCustomerSaga);
}
function* watchUpdateCustomer() {
  yield takeEvery(UPDATE_CUSTOMER, updateCustomerSaga);
}
function* watchDeleteCustomer() {
  yield takeEvery(DELETE_CUSTOMER, deleteCustomerSaga);
}

// ================== ROOT SAGA ==================
export function* customerSaga() {
  yield all([
    fork(watchGetCustomers),
    fork(watchGetSingleCustomer),
    fork(watchAddCustomer),
    fork(watchUpdateCustomer),
    fork(watchDeleteCustomer),
  ]);
}
