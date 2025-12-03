// ===================== QUOTATION & BILLING - ALL IN ONE =====================

import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ===================== ACTION TYPES =====================
export const GET_QUOTATION_BILLING = "GET_QUOTATION_BILLING";
export const GET_SINGLE_QUOTATION_BILLING = "GET_SINGLE_QUOTATION_BILLING";
export const ADD_QUOTATION_BILLING = "ADD_QUOTATION_BILLING";
export const UPDATE_QUOTATION_BILLING = "UPDATE_QUOTATION_BILLING";
export const DELETE_QUOTATION_BILLING = "DELETE_QUOTATION_BILLING";

export const RESET_ADD_QUOTATION_BILLING_RESPONSE = "RESET_ADD_QUOTATION_BILLING_RESPONSE";
export const RESET_UPDATE_QUOTATION_BILLING_RESPONSE = "RESET_UPDATE_QUOTATION_BILLING_RESPONSE";

export const API_RESPONSE_SUCCESS_QUOTATION_BILLING = "API_RESPONSE_SUCCESS_QUOTATION_BILLING";
export const API_RESPONSE_ERROR_QUOTATION_BILLING = "API_RESPONSE_ERROR_QUOTATION_BILLING";

// ===================== ACTIONS =====================
export const quotationBillingApiResponseSuccess = (actionType, data) => ({
    type: API_RESPONSE_SUCCESS_QUOTATION_BILLING,
    payload: { actionType, data },
});

export const quotationBillingApiResponseError = (actionType, error) => ({
    type: API_RESPONSE_ERROR_QUOTATION_BILLING,
    payload: { actionType, error },
});

export const resetAddQuotationBillingResponse = () => ({ type: RESET_ADD_QUOTATION_BILLING_RESPONSE });
export const resetUpdateQuotationBillingResponse = () => ({ type: RESET_UPDATE_QUOTATION_BILLING_RESPONSE });

export const getQuotationBilling = () => ({ type: GET_QUOTATION_BILLING });
export const getSingleQuotationBilling = (id) => ({ type: GET_SINGLE_QUOTATION_BILLING, payload: { id } });
export const addQuotationBilling = (invoiceData, invoiceItems) => ({ type: ADD_QUOTATION_BILLING, payload: { invoiceData, invoiceItems } });
export const updateQuotationBilling = (id, invoiceData, invoiceItems) => ({ type: UPDATE_QUOTATION_BILLING, payload: { id, invoiceData, invoiceItems } });
export const deleteQuotationBilling = (id) => ({ type: DELETE_QUOTATION_BILLING, payload: { id } });

// ===================== REDUCER =====================
const INIT_STATE = {
    quotationBillingList: [],
    singleQuotationBilling: {},
    loading: false,
    error: false,
    addResponse: false,
    updateResponse: false,
};

export const QuotationBillingReducer = (state = INIT_STATE, action) => {
    switch (action.type) {
        case GET_QUOTATION_BILLING:
        case GET_SINGLE_QUOTATION_BILLING:
        case ADD_QUOTATION_BILLING:
        case UPDATE_QUOTATION_BILLING:
        case DELETE_QUOTATION_BILLING:
            return { ...state, loading: true };

        case API_RESPONSE_SUCCESS_QUOTATION_BILLING:
            switch (action.payload.actionType) {
                case GET_QUOTATION_BILLING:
                    return { ...state, quotationBillingList: action.payload.data, loading: false, error: false };
                case GET_SINGLE_QUOTATION_BILLING:
                    return { ...state, singleQuotationBilling: action.payload.data, loading: false, error: false };
                case ADD_QUOTATION_BILLING:
                    return { ...state, addResponse: true, quotationBillingList: [...state.quotationBillingList, action.payload.data], loading: false, error: false };
                case UPDATE_QUOTATION_BILLING:
                    return {
                        ...state,
                        updateResponse: true,
                        quotationBillingList: state.quotationBillingList.map(item => item.id === action.payload.data.id ? action.payload.data : item),
                        loading: false,
                        error: false
                    };
                case DELETE_QUOTATION_BILLING:
                    return { ...state, quotationBillingList: state.quotationBillingList.filter(item => item.id !== action.payload.data), loading: false, error: false };
                default:
                    return state;
            }

        case API_RESPONSE_ERROR_QUOTATION_BILLING:
            return { ...state, loading: false, error: true, addResponse: false, updateResponse: false };

        case RESET_ADD_QUOTATION_BILLING_RESPONSE:
            return { ...state, addResponse: false };
        case RESET_UPDATE_QUOTATION_BILLING_RESPONSE:
            return { ...state, updateResponse: false };

        default:
            return state;
    }
};

// ===================== SAGAS =====================
const api = new APIClient();

const getQuotationBillingApi = () => api.post("/quotationAndBill/list");
const getSingleQuotationBillingApi = (id) => api.get(`/quotationAndBill/single/${id}`);
const addQuotationBillingApi = (invoiceData, invoiceItems) => api.create("/quotationAndBill/store", { invoiceData, invoiceItems });
const updateQuotationBillingApi = (id, invoiceData, invoiceItems) => api.put(`/quotationAndBill/update/${id}`, { invoiceData, invoiceItems });
const deleteQuotationBillingApi = (id) => api.delete(`/quotationAndBill/delete/${id}`);

function* getQuotationBillingSaga() {
    try {
        const res = yield call(getQuotationBillingApi);
        yield put(quotationBillingApiResponseSuccess(GET_QUOTATION_BILLING, res));
    } catch (error) {
        yield put(quotationBillingApiResponseError(GET_QUOTATION_BILLING, error));
    }
}

function* getSingleQuotationBillingSaga({ payload }) {
    try {
        const res = yield call(getSingleQuotationBillingApi, payload.id);
        yield put(quotationBillingApiResponseSuccess(GET_SINGLE_QUOTATION_BILLING, res));
    } catch (error) {
        yield put(quotationBillingApiResponseError(GET_SINGLE_QUOTATION_BILLING, error));
    }
}
 function* addQuotationBillingSaga({ payload }) {
  try {
    const { invoiceData, invoiceItems } = payload;

    // Calculate totals
    const totalAmount = invoiceItems.reduce(
      (sum, item) => sum + Number(item.quotation_and_billing_child_total || 0),
      0
    );
    const totalGst = invoiceItems.reduce(
      (sum, item) => sum + Number(item.quotation_and_billing_tax_value || 0),
      0
    );

    const body = {
      ...invoiceData,
      quotation_and_billing_master_total: totalAmount.toFixed(2),
      quotation_and_billing_master_gst_amount: totalGst.toFixed(2),
      quotation_and_billing_master_grand_total: (totalAmount + totalGst).toFixed(2),
      items: invoiceItems,
    };

    const res = yield call(addQuotationBillingApi, body);

    yield put(quotationBillingApiResponseSuccess(ADD_QUOTATION_BILLING, res));
    yield call(getQuotationBillingSaga); // refresh list
    toast.success("Quotation & Billing added successfully!");
  } catch (error) {
    yield put(quotationBillingApiResponseError(ADD_QUOTATION_BILLING, error));
    toast.error("Failed to add Quotation & Billing! " + (error.message || ""));
  }
}



function* updateQuotationBillingSaga({ payload }) {
    try {
        const { id, invoiceData, invoiceItems } = payload;
        const res = yield call(updateQuotationBillingApi, id, invoiceData, invoiceItems);
        yield put(quotationBillingApiResponseSuccess(UPDATE_QUOTATION_BILLING, res));
        yield call(getQuotationBillingSaga);
        toast.success("Quotation & Billing updated successfully!");
    } catch (error) {
        yield put(quotationBillingApiResponseError(UPDATE_QUOTATION_BILLING, error));
        toast.error("Failed to update Quotation & Billing!");
    }
}

function* deleteQuotationBillingSaga({ payload }) {
    try {
        const { id } = payload;
        yield call(deleteQuotationBillingApi, id);
        yield put(quotationBillingApiResponseSuccess(DELETE_QUOTATION_BILLING, id));
        yield call(getQuotationBillingSaga);
        toast.success("Quotation & Billing deleted successfully!");
    } catch (error) {
        yield put(quotationBillingApiResponseError(DELETE_QUOTATION_BILLING, error));
        toast.error("Failed to delete Quotation & Billing!");
    }
}

// ===================== WATCHERS =====================
function* watchQuotationBilling() {
    yield all([
        fork(function* () { yield takeEvery(GET_QUOTATION_BILLING, getQuotationBillingSaga); }),
        fork(function* () { yield takeEvery(GET_SINGLE_QUOTATION_BILLING, getSingleQuotationBillingSaga); }),
        fork(function* () { yield takeEvery(ADD_QUOTATION_BILLING, addQuotationBillingSaga); }),
        fork(function* () { yield takeEvery(UPDATE_QUOTATION_BILLING, updateQuotationBillingSaga); }),
        fork(function* () { yield takeEvery(DELETE_QUOTATION_BILLING, deleteQuotationBillingSaga); }),
    ]);
}

export { watchQuotationBilling };
