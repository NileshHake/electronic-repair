// src/store/CustomerAddress/index.js

// ================== IMPORTS ==================
import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_CUSTOMER_ADDRESS = "GET_CUSTOMER_ADDRESS";
export const ADD_CUSTOMER_ADDRESS = "ADD_CUSTOMER_ADDRESS";
export const UPDATE_CUSTOMER_ADDRESS = "UPDATE_CUSTOMER_ADDRESS";
export const DELETE_CUSTOMER_ADDRESS = "DELETE_CUSTOMER_ADDRESS";
export const GET_SINGLE_CUSTOMER_ADDRESS = "GET_SINGLE_CUSTOMER_ADDRESS";

export const RESET_ADD_CUSTOMER_ADDRESS_RESPONSE =
  "RESET_ADD_CUSTOMER_ADDRESS_RESPONSE";
export const RESET_UPDATE_CUSTOMER_ADDRESS_RESPONSE =
  "RESET_UPDATE_CUSTOMER_ADDRESS_RESPONSE";

export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTION CREATORS ==================
export const customerAddressApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const customerAddressApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddCustomerAddressResponse = () => ({
  type: RESET_ADD_CUSTOMER_ADDRESS_RESPONSE,
});

export const resetUpdateCustomerAddressResponse = () => ({
  type: RESET_UPDATE_CUSTOMER_ADDRESS_RESPONSE,
});

export const getCustomerAddressList = () => ({
  type: GET_CUSTOMER_ADDRESS,
});

export const getSingleCustomerAddress = (id) => ({
  type: GET_SINGLE_CUSTOMER_ADDRESS,
  payload: id,
});

export const addCustomerAddress = (data) => ({
  type: ADD_CUSTOMER_ADDRESS,
  payload: data,
});

export const updateCustomerAddress = (data) => ({
  type: UPDATE_CUSTOMER_ADDRESS,
  payload: data,
});

export const deleteCustomerAddress = (id) => ({
  type: DELETE_CUSTOMER_ADDRESS,
  payload: id,
});

// ================== REDUCER ==================
// NOTE: use key customerAddressList to match your component selector
const INIT_STATE = {
  customerAddressList: [], // <- array used by component
  singleCustomerAddress: null,
  loading: true,
  error: false,
  addCustomerAddressResponse: false,
  updateCustomerAddressResponse: false,
};

const CustomerAddressReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_CUSTOMER_ADDRESS:
    case GET_SINGLE_CUSTOMER_ADDRESS:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS: {
      const { actionType, data } = action.payload;
      switch (actionType) {
        case GET_CUSTOMER_ADDRESS:
          // API should return the list (array). store it in customerAddressList
          return { ...state, customerAddressList: data || [], loading: false };

        case GET_SINGLE_CUSTOMER_ADDRESS:
          return { ...state, singleCustomerAddress: data, loading: false };

        case ADD_CUSTOMER_ADDRESS:
          // set flag — component will trigger refresh
          return { ...state, addCustomerAddressResponse: true };

        case UPDATE_CUSTOMER_ADDRESS:
          return { ...state, updateCustomerAddressResponse: true };

        case DELETE_CUSTOMER_ADDRESS:
          return {
            ...state,
            customerAddressList: state.customerAddressList.filter(
              (addr) => addr.customer_address__id !== data
            ),
          };

        default:
          return state;
      }
    }

    case API_RESPONSE_ERROR:
      return { ...state, error: true, loading: false };

    case RESET_ADD_CUSTOMER_ADDRESS_RESPONSE:
      return { ...state, addCustomerAddressResponse: false };

    case RESET_UPDATE_CUSTOMER_ADDRESS_RESPONSE:
      return { ...state, updateCustomerAddressResponse: false };

    default:
      return state;
  }
};

export default CustomerAddressReducer;

// ================== API CALLS ==================
const api = new APIClient();

const getCustomerAddressApi = () => api.get("/customer-address/list");
const getSingleCustomerAddressApi = (id) =>
  api.get(`/customer-address/single/${id}`);
const addCustomerAddressApi = (formData) =>
  api.create(`/customer-address/store`, formData);
const updateCustomerAddressApi = (data) =>
  api.put(`/customer-address/update`, data);
const deleteCustomerAddressApi = (id) =>
  api.delete(`/customer-address/delete/${id}`);

// ================== SAGAS ==================
function* getCustomerAddressListSaga() {
  try {
    const response = yield call(getCustomerAddressApi);
    // response assumed to be array (or response.data depending on APIClient)
    yield put(
      customerAddressApiResponseSuccess(GET_CUSTOMER_ADDRESS, response)
    );
  } catch (error) {
    yield put(customerAddressApiResponseError(GET_CUSTOMER_ADDRESS, error));
    toast.error("❌ Failed to fetch customer addresses!");
  }
}

function* getSingleCustomerAddressSaga({ payload }) {
  try {
    const response = yield call(getSingleCustomerAddressApi, payload);
    yield put(
      customerAddressApiResponseSuccess(GET_SINGLE_CUSTOMER_ADDRESS, response)
    );
  } catch (error) {
    yield put(
      customerAddressApiResponseError(GET_SINGLE_CUSTOMER_ADDRESS, error)
    );
    toast.error("❌ Failed to fetch customer address details!");
  }
}

function* addCustomerAddressSaga({ payload }) {
  try {
    const response = yield call(addCustomerAddressApi, payload);
    yield put(
      customerAddressApiResponseSuccess(ADD_CUSTOMER_ADDRESS, response)
    );
    toast.success(" Customer address added successfully!");
    // NOTE: do not fetch list here — let component react to success flag and refresh
  } catch (error) {
    yield put(customerAddressApiResponseError(ADD_CUSTOMER_ADDRESS, error));
    toast.error("❌ Failed to add customer address!");
  }
}

function* updateCustomerAddressSaga({ payload }) {
  try {
    const response = yield call(updateCustomerAddressApi, payload);
    yield put(
      customerAddressApiResponseSuccess(UPDATE_CUSTOMER_ADDRESS, response)
    );
    toast.success(" Customer address updated successfully!");
  } catch (error) {
    yield put(customerAddressApiResponseError(UPDATE_CUSTOMER_ADDRESS, error));
    toast.error("❌ Failed to update customer address!");
  }
}

function* deleteCustomerAddressSaga({ payload }) {
  try {
    yield call(deleteCustomerAddressApi, payload);
    yield put(
      customerAddressApiResponseSuccess(DELETE_CUSTOMER_ADDRESS, payload)
    ); // payload is id
    toast.success("🗑️ Customer address deleted successfully!");
  } catch (error) {
    yield put(customerAddressApiResponseError(DELETE_CUSTOMER_ADDRESS, error));
    toast.error("❌ Failed to delete customer address!");
  }
}

// ================== WATCHERS ==================
function* watchGetCustomerAddress() {
  yield takeEvery(GET_CUSTOMER_ADDRESS, getCustomerAddressListSaga);
}
function* watchGetSingleCustomerAddress() {
  yield takeEvery(GET_SINGLE_CUSTOMER_ADDRESS, getSingleCustomerAddressSaga);
}
function* watchAddCustomerAddress() {
  yield takeEvery(ADD_CUSTOMER_ADDRESS, addCustomerAddressSaga);
}
function* watchUpdateCustomerAddress() {
  yield takeEvery(UPDATE_CUSTOMER_ADDRESS, updateCustomerAddressSaga);
}
function* watchDeleteCustomerAddress() {
  yield takeEvery(DELETE_CUSTOMER_ADDRESS, deleteCustomerAddressSaga);
}

// ================== ROOT SAGA (export) ==================
export function* customerAddressSaga() {
  yield all([
    fork(watchGetCustomerAddress),
    fork(watchGetSingleCustomerAddress),
    fork(watchAddCustomerAddress),
    fork(watchUpdateCustomerAddress),
    fork(watchDeleteCustomerAddress),
  ]);
}
