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

export const RESET_ADD_QUOTATION_BILLING_RESPONSE =
    "RESET_ADD_QUOTATION_BILLING_RESPONSE";
export const RESET_UPDATE_QUOTATION_BILLING_RESPONSE =
    "RESET_UPDATE_QUOTATION_BILLING_RESPONSE";

export const API_RESPONSE_SUCCESS_QUOTATION_BILLING =
    "API_RESPONSE_SUCCESS_QUOTATION_BILLING";
export const API_RESPONSE_ERROR_QUOTATION_BILLING =
    "API_RESPONSE_ERROR_QUOTATION_BILLING";

// ===================== ACTIONS =====================
export const quotationBillingApiResponseSuccess = (actionType, data) => ({
    type: API_RESPONSE_SUCCESS_QUOTATION_BILLING,
    payload: { actionType, data },
});

export const quotationBillingApiResponseError = (actionType, error) => ({
    type: API_RESPONSE_ERROR_QUOTATION_BILLING,
    payload: { actionType, error },
});

export const resetAddQuotationBillingResponse = () => ({
    type: RESET_ADD_QUOTATION_BILLING_RESPONSE,
});

export const resetUpdateQuotationBillingResponse = () => ({
    type: RESET_UPDATE_QUOTATION_BILLING_RESPONSE,
});

export const getQuotationBilling = () => ({
    type: GET_QUOTATION_BILLING,
});

export const getSingleQuotationBilling = (id) => ({
    type: GET_SINGLE_QUOTATION_BILLING,
    payload: { id },
});

export const addQuotationBilling = (body) => ({
    type: ADD_QUOTATION_BILLING,
    payload: body,
});

export const updateQuotationBilling = (invoiceData) => ({
    type: UPDATE_QUOTATION_BILLING,
    payload: { invoiceData },
});

export const deleteQuotationBilling = (id) => ({
    type: DELETE_QUOTATION_BILLING,
    payload: { id },
});

// ===================== INITIAL STATE =====================

const INIT_STATE = {
    quotationBillingList: [],
    singleQuotationBilling: {},
    loading: false,
    error: false,
    addResponse: false,
    updateResponse: false,
};

// ===================== REDUCER =====================

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
                    return {
                        ...state,
                        quotationBillingList: action.payload.data,
                        loading: false,
                        error: false,
                    };

                case GET_SINGLE_QUOTATION_BILLING:
                    return {
                        ...state,
                        singleQuotationBilling: action.payload.data,
                        loading: false,
                        error: false,
                    };

                case ADD_QUOTATION_BILLING:
                    return {
                        ...state,
                        addResponse: true,
                        loading: false,
                        error: false,
                    };

                case UPDATE_QUOTATION_BILLING:
                    return {
                        ...state,
                        updateResponse: true,
                        loading: false,
                        error: false,
                    };

                case DELETE_QUOTATION_BILLING:
                    return {
                        ...state,
                        loading: false,
                        error: false,
                    };

                default:
                    return state;
            }

        case API_RESPONSE_ERROR_QUOTATION_BILLING:
            return {
                ...state,
                loading: false,
                error: true,
                addResponse: false,
                updateResponse: false,
            };

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

// NO JSON HEADERS FOR FORM DATA
const getQuotationBillingApi = () =>
    api.create("/quotationAndBill/list");

const getSingleQuotationBillingApi = (id) =>
    api.get(`/quotationAndBill/single/${id}`);

const addQuotationBillingApi = (body) =>
    api.create("/quotationAndBill/store", body); // FIXED

const updateQuotationBillingApi = (invoiceData) =>
    api.put(`/quotationAndBill/updated`, invoiceData);

const deleteQuotationBillingApi = (id) =>
    api.delete(`/quotationAndBill/delete/${id}`);

function* getQuotationBillingSaga() {
    try {
        const res = yield call(getQuotationBillingApi);
        yield put(quotationBillingApiResponseSuccess(GET_QUOTATION_BILLING, res));
    } catch (error) {
        yield put(quotationBillingApiResponseError(GET_QUOTATION_BILLING, error));
        console.log("Test", error);

    }
}

function* getSingleQuotationBillingSaga({ payload }) {
    try {
        const res = yield call(getSingleQuotationBillingApi, payload.id);
        yield put(
            quotationBillingApiResponseSuccess(
                GET_SINGLE_QUOTATION_BILLING,
                res
            )
        );
    } catch (error) {
        yield put(
            quotationBillingApiResponseError(GET_SINGLE_QUOTATION_BILLING, error)
        );
    }
}

function* addQuotationBillingSaga({ payload }) {
    try {
        const res = yield call(addQuotationBillingApi, payload);

        yield put(quotationBillingApiResponseSuccess(ADD_QUOTATION_BILLING, res));
    } catch (error) {
        yield put(quotationBillingApiResponseError(ADD_QUOTATION_BILLING, error));
        toast.error("Failed to add Quotation & Billing!");
    }
}

function* updateQuotationBillingSaga({ payload }) {
    try {
        const { invoiceData } = payload;
        console.log(invoiceData);

        const res = yield call(updateQuotationBillingApi, invoiceData);

        yield put(
            quotationBillingApiResponseSuccess(UPDATE_QUOTATION_BILLING, res)
        );

        yield call(getQuotationBillingSaga);

        toast.success("Quotation & Billing updated successfully!");
    } catch (error) {
        yield put(
            quotationBillingApiResponseError(UPDATE_QUOTATION_BILLING, error)
        );
        toast.error("Failed to update Quotation & Billing!");
    }
}

function* deleteQuotationBillingSaga({ payload }) {
    try {
        const { id } = payload;
        yield call(deleteQuotationBillingApi, id);

        yield put(
            quotationBillingApiResponseSuccess(DELETE_QUOTATION_BILLING, id)
        );

        yield call(getQuotationBillingSaga);

        toast.success("Quotation & Billing deleted successfully!");
    } catch (error) {
        yield put(
            quotationBillingApiResponseError(DELETE_QUOTATION_BILLING, error)
        );
        toast.error("Failed to delete Quotation & Billing!");
    }
}

// ===================== WATCHERS =====================
function* watchQuotationBilling() {
    yield all([
        fork(function* () {
            yield takeEvery(GET_QUOTATION_BILLING, getQuotationBillingSaga);
        }),
        fork(function* () {
            yield takeEvery(
                GET_SINGLE_QUOTATION_BILLING,
                getSingleQuotationBillingSaga
            );
        }),
        fork(function* () {
            yield takeEvery(ADD_QUOTATION_BILLING, addQuotationBillingSaga);
        }),
        fork(function* () {
            yield takeEvery(
                UPDATE_QUOTATION_BILLING,
                updateQuotationBillingSaga
            );
        }),
        fork(function* () {
            yield takeEvery(
                DELETE_QUOTATION_BILLING,
                deleteQuotationBillingSaga
            );
        }),
    ]);
}

export { watchQuotationBilling };
