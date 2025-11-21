import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_TAXES = "GET_TAXES";
export const ADD_TAX = "ADD_TAX";
export const UPDATE_TAX = "UPDATE_TAX";
export const DELETE_TAX = "DELETE_TAX";
export const RESET_ADD_TAX_RESPONSE = "RESET_ADD_TAX_RESPONSE";
export const RESET_UPDATE_TAX_RESPONSE = "RESET_UPDATE_TAX_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const taxApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const taxApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddTaxResponse = () => ({
  type: RESET_ADD_TAX_RESPONSE,
});

export const resetUpdateTaxResponse = () => ({
  type: RESET_UPDATE_TAX_RESPONSE,
});

export const getTaxesList = () => ({
  type: GET_TAXES,
});

export const addTax = (tax) => ({
  type: ADD_TAX,
  payload: { tax },
});

export const updateTax = (tax) => ({
  type: UPDATE_TAX,
  payload: { tax },
});

export const deleteTax = (id) => ({
  type: DELETE_TAX,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  taxes: [],
  loading: true,
  error: false,
  addTaxResponse: false,
  updateTaxResponse: false,
};

export const TaxReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_TAXES:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_TAXES:
          return {
            ...state,
            taxes: action.payload.data,
            loading: false,
            error: false,
          };

        case ADD_TAX:
          return {
            ...state,
            addTaxResponse: true,
            taxes: [...state.taxes, action.payload.data],
            loading: false,
            error: false,
          };

        case UPDATE_TAX:
          return {
            ...state,
            updateTaxResponse: true,
            taxes: state.taxes.map((t) =>
              t.tax_id === action.payload.data.tax_id ? action.payload.data : t
            ),
            loading: false,
            error: false,
          };

        case DELETE_TAX:
          return {
            ...state,
            taxes: state.taxes.filter((t) => t.tax_id !== action.payload.data),
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return {
        ...state,
        addTaxResponse: null,
        error: true,
      };

    case RESET_ADD_TAX_RESPONSE:
      return {
        ...state,
        addTaxResponse: false,
      };

    case RESET_UPDATE_TAX_RESPONSE:
      return {
        ...state,
        updateTaxResponse: false,
      };

    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

const getTaxesApi = () => api.get("/tax/list");
const addTaxApi = (data) => api.create("/tax/store", data);
const updateTaxApi = (data) => api.put("/tax/update", data);
const deleteTaxApi = (id) => api.delete(`/tax/delete/${id}`);

// ================== SAGAS ==================

// ✅ Get All Taxes
function* getTaxesListSaga() {
  try {
    const response = yield call(getTaxesApi);
    yield put(taxApiResponseSuccess(GET_TAXES, response));
  } catch (error) {
    yield put(taxApiResponseError(GET_TAXES, error));
    toast.error("Failed to fetch tax list!");
  }
}

// ✅ Add Tax
function* addTaxSaga({ payload }) {
  try {
    const { tax } = payload;
    const response = yield call(addTaxApi, tax);
    yield put(taxApiResponseSuccess(ADD_TAX, response));
    yield call(getTaxesListSaga);
    toast.success("Tax added successfully!");
  } catch (error) {
    yield put(taxApiResponseError(ADD_TAX, error));
    toast.error("Failed to add tax!");
  }
}

// ✅ Update Tax
function* updateTaxSaga({ payload }) {
  try {
    const { tax } = payload;
    const response = yield call(updateTaxApi, tax);
    yield put(taxApiResponseSuccess(UPDATE_TAX, response));
    yield call(getTaxesListSaga);
    toast.success("Tax updated successfully!");
  } catch (error) {
    yield put(taxApiResponseError(UPDATE_TAX, error));
    toast.error("Failed to update tax!");
  }
}

// ✅ Delete Tax
function* deleteTaxSaga({ payload }) {
  try {
    yield call(deleteTaxApi, payload);
    yield put(taxApiResponseSuccess(DELETE_TAX, { data: payload }));
    yield call(getTaxesListSaga);
    toast.success("Tax deleted successfully!");
  } catch (error) {
    yield put(taxApiResponseError(DELETE_TAX, error));
    toast.error("Failed to delete tax!");
  }
}

// ================== WATCHERS ==================
function* watchGetTaxes() {
  yield takeEvery(GET_TAXES, getTaxesListSaga);
}

function* watchAddTax() {
  yield takeEvery(ADD_TAX, addTaxSaga);
}

function* watchUpdateTax() {
  yield takeEvery(UPDATE_TAX, updateTaxSaga);
}

function* watchDeleteTax() {
  yield takeEvery(DELETE_TAX, deleteTaxSaga);
}

// ================== ROOT SAGA ==================
export function* taxSaga() {
  yield all([
    fork(watchGetTaxes),
    fork(watchAddTax),
    fork(watchUpdateTax),
    fork(watchDeleteTax),
  ]);
}
