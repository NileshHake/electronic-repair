import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_SUPPLIERS = "GET_SUPPLIERS";
export const ADD_SUPPLIER = "ADD_SUPPLIER";
export const UPDATE_SUPPLIER = "UPDATE_SUPPLIER";
export const DELETE_SUPPLIER = "DELETE_SUPPLIER";
export const GET_SINGLE_SUPPLIER = "GET_SINGLE_SUPPLIER";
export const RESET_ADD_SUPPLIER_RESPONSE = "RESET_ADD_SUPPLIER_RESPONSE";
export const RESET_UPDATE_SUPPLIER_RESPONSE = "RESET_UPDATE_SUPPLIER_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const supplierApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const supplierApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddSupplierResponse = () => ({
  type: RESET_ADD_SUPPLIER_RESPONSE,
});

export const resetUpdateSupplierResponse = () => ({
  type: RESET_UPDATE_SUPPLIER_RESPONSE,
});

export const getSuppliersList = () => ({
  type: GET_SUPPLIERS,
});

export const getSingleSupplier = (id) => ({
  type: GET_SINGLE_SUPPLIER,
  payload: id,
});

export const addSupplier = (supplier) => ({
  type: ADD_SUPPLIER,
  payload: supplier,
});

export const updateSupplier = (supplier) => ({
  type: UPDATE_SUPPLIER,
  payload: supplier,
});

export const deleteSupplier = (id) => ({
  type: DELETE_SUPPLIER,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  suppliers: [],
  singleSupplier: null,
  loading: true,
  error: false,
  addSupplierResponse: false,
  updateSupplierResponse: false,
};

export const SupplierReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_SUPPLIERS:
    case GET_SINGLE_SUPPLIER:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_SUPPLIERS:
          return { ...state, suppliers: action.payload.data, loading: false };

        case GET_SINGLE_SUPPLIER:
          return { ...state, singleSupplier: action.payload.data, loading: false };

        case ADD_SUPPLIER:
          return {
            ...state,
            addSupplierResponse: true,
            suppliers: [...state.suppliers, action.payload.data],
          };

        case UPDATE_SUPPLIER:
          return {
            ...state,
            updateSupplierResponse: true,
            suppliers: state.suppliers.map((s) =>
              s.user_id === action.payload.data.user_id
                ? action.payload.data
                : s
            ),
          };

        case DELETE_SUPPLIER:
          return {
            ...state,
            suppliers: state.suppliers.filter(
              (s) => s.user_id !== action.payload.data
            ),
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true, loading: false };

    case RESET_ADD_SUPPLIER_RESPONSE:
      return { ...state, addSupplierResponse: false };

    case RESET_UPDATE_SUPPLIER_RESPONSE:
      return { ...state, updateSupplierResponse: false };

    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

const getSuppliersApi = () => api.get("/supplier/list");
const getSingleSupplierApi = (id) => api.get(`/user/single/${id}`);
const addSupplierApi = (formData) => api.create("/user/store", formData);
const updateSupplierApi = (data) => api.put("/user/update", data);
const deleteSupplierApi = (id) => api.delete(`/user/delete/${id}`);

// ================== SAGAS ==================
function* getSuppliersListSaga() {                                                                      
  try {
    const response = yield call(getSuppliersApi);
    yield put(supplierApiResponseSuccess(GET_SUPPLIERS, response));
  } catch (error) {
    yield put(supplierApiResponseError(GET_SUPPLIERS, error));
    toast.error("Failed to fetch suppliers!");
  }
}

function* getSingleSupplierSaga({ payload }) {
  try {
    const response = yield call(getSingleSupplierApi, payload);
    yield put(supplierApiResponseSuccess(GET_SINGLE_SUPPLIER, response));
  } catch (error) {
    yield put(supplierApiResponseError(GET_SINGLE_SUPPLIER, error));
    toast.error("Failed to fetch supplier details!");
  }
}

function* addSupplierSaga({ payload }) {
  try {
    payload.user_type = 7;  

    let response;
    if (payload.user_profile instanceof File) {
      const formData = new FormData();
      for (const key in payload) {
        formData.append(key, payload[key]);
      }
      response = yield call(addSupplierApi, formData);
    } else {
      response = yield call(api.create, "/supplier/store", payload);
    }

    yield put(supplierApiResponseSuccess(ADD_SUPPLIER, response));
    yield call(getSuppliersListSaga);
    toast.success("Supplier added successfully!");
  } catch (error) {
    yield put(supplierApiResponseError(ADD_SUPPLIER, error));
    toast.error("Failed to add supplier!");
  }
}

function* updateSupplierSaga({ payload }) {
  try {
    payload.user_type = 7;

    let response;
    if (payload.user_profile instanceof File) {
      const formData = new FormData();
      for (const key in payload) {
        formData.append(key, payload[key]);
      }
      response = yield call(api.putFormData, "/supplier/update", formData);
    } else {
      response = yield call(updateSupplierApi, payload);
    }

    yield put(supplierApiResponseSuccess(UPDATE_SUPPLIER, response));
    yield call(getSuppliersListSaga);
    toast.success("Supplier updated successfully!");
  } catch (error) {
    yield put(supplierApiResponseError(UPDATE_SUPPLIER, error));
    toast.error("Failed to update supplier!");
  }
}

function* deleteSupplierSaga({ payload }) {
  try {
    yield call(deleteSupplierApi, payload);
    yield put(supplierApiResponseSuccess(DELETE_SUPPLIER, payload));
    yield call(getSuppliersListSaga);
    toast.success("Supplier deleted successfully!");
  } catch (error) {
    yield put(supplierApiResponseError(DELETE_SUPPLIER, error));
    toast.error("Failed to delete supplier!");
  }
}

// ================== WATCHERS ==================
function* watchGetSuppliers() {
  yield takeEvery(GET_SUPPLIERS, getSuppliersListSaga);
}
function* watchGetSingleSupplier() {
  yield takeEvery(GET_SINGLE_SUPPLIER, getSingleSupplierSaga);
}
function* watchAddSupplier() {
  yield takeEvery(ADD_SUPPLIER, addSupplierSaga);
}
function* watchUpdateSupplier() {
  yield takeEvery(UPDATE_SUPPLIER, updateSupplierSaga);
}
function* watchDeleteSupplier() {
  yield takeEvery(DELETE_SUPPLIER, deleteSupplierSaga);
}

// ================== ROOT SAGA ==================
export function* supplierSaga() {
  yield all([
    fork(watchGetSuppliers),
    fork(watchGetSingleSupplier),
    fork(watchAddSupplier),
    fork(watchUpdateSupplier),
    fork(watchDeleteSupplier),
  ]);
}
