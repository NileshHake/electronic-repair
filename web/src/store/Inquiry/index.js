import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

/* ================= ACTION TYPES ================= */
export const GET_QUOTATIONS = "GET_QUOTATIONS";
export const GET_QUOTATION_CHILD_LIST = "GET_QUOTATION_CHILD_LIST";
export const GET_QUOTATION_SINGLE = "GET_QUOTATION_SINGLE";

export const UPDATE_QUOTATION_CHILD = "UPDATE_QUOTATION_CHILD";
export const UPDATE_QUOTATION_MASTER = "UPDATE_QUOTATION_MASTER";

export const RESET_UPDATE_QUOTATION_CHILD_RESPONSE =
  "RESET_UPDATE_QUOTATION_CHILD_RESPONSE";
export const RESET_UPDATE_QUOTATION_MASTER_RESPONSE =
  "RESET_UPDATE_QUOTATION_MASTER_RESPONSE";

export const API_RESPONSE_SUCCESS = "QUOTATION_API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "QUOTATION_API_RESPONSE_ERROR";

/* ================= ACTIONS ================= */
export const quotationApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const quotationApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetUpdateQuotationChildResponse = () => ({
  type: RESET_UPDATE_QUOTATION_CHILD_RESPONSE,
});

export const resetUpdateQuotationMasterResponse = () => ({
  type: RESET_UPDATE_QUOTATION_MASTER_RESPONSE,
});

export const getQuotationsList = (filters = {}) => ({
  type: GET_QUOTATIONS,
  payload: { filters },
});

export const getQuotationChildList = (filters = {}) => ({
  type: GET_QUOTATION_CHILD_LIST,
  payload: { filters },
});

export const getQuotationSingle = (id) => ({
  type: GET_QUOTATION_SINGLE,
  payload: { id },
});

export const updateQuotationChild = (data) => ({
  type: UPDATE_QUOTATION_CHILD,
  payload: { data },
});

export const updateQuotationMaster = (data) => ({
  type: UPDATE_QUOTATION_MASTER,
  payload: { data },
});

/* ================= REDUCER ================= */
const INIT_STATE = {
  quotations: [],
  quotationChildList: [],
  quotationSingle: null,

  loading: true,
  error: false,

  updateQuotationChildResponse: false,
  updateQuotationMasterResponse: false,
};

export const QuotationReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_QUOTATIONS:
    case GET_QUOTATION_CHILD_LIST:
    case GET_QUOTATION_SINGLE:
    case UPDATE_QUOTATION_CHILD:
    case UPDATE_QUOTATION_MASTER:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_QUOTATIONS:
          return {
            ...state,
            quotations: action.payload.data,
            loading: false,
            error: false,
          };

        case GET_QUOTATION_CHILD_LIST:
          return {
            ...state,
            quotationChildList: action.payload.data,
            loading: false,
            error: false,
          };

        case GET_QUOTATION_SINGLE:
          return {
            ...state,
            quotationSingle: action.payload.data,
            loading: false,
            error: false,
          };

        case UPDATE_QUOTATION_CHILD:
          return {
            ...state,
            updateQuotationChildResponse: true,
            loading: false,
            error: false,
          };

        case UPDATE_QUOTATION_MASTER:
          return {
            ...state,
            updateQuotationMasterResponse: true,
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true, loading: false };

    case RESET_UPDATE_QUOTATION_CHILD_RESPONSE:
      return { ...state, updateQuotationChildResponse: false };

    case RESET_UPDATE_QUOTATION_MASTER_RESPONSE:
      return { ...state, updateQuotationMasterResponse: false };

    default:
      return state;
  }
};

/* ================= API CALLS ================= */
const api = new APIClient();

// ✅ your routes
const getQuotationsApi = (filters) => api.create("/quotation/list", filters); // POST
const getQuotationChildApi = (filters) => api.create("/quotation/child-list", filters); // POST
const getQuotationSingleApi = (id) => api.get(`/quotation/single/${id}`); // GET
const updateQuotationChildApi = (data) => api.put("/quotation/update", data); // PUT
const updateQuotationMasterApi = (data) => api.put("/quotation/master-update", data); // PUT

/* ================= SAGAS ================= */
function* getQuotationsSaga({ payload }) {
  try {
    const filters = payload?.filters || {};
    const response = yield call(getQuotationsApi, filters);
    yield put(quotationApiResponseSuccess(GET_QUOTATIONS, response));
  } catch (error) {
    yield put(quotationApiResponseError(GET_QUOTATIONS, error));
    toast.error("Failed to fetch quotation list");
  }
}

function* getQuotationChildListSaga({ payload }) {
  try {
    const filters = payload?.filters || {};
    const response = yield call(getQuotationChildApi, filters);
    yield put(quotationApiResponseSuccess(GET_QUOTATION_CHILD_LIST, response));
  } catch (error) {
    yield put(quotationApiResponseError(GET_QUOTATION_CHILD_LIST, error));
    toast.error("Failed to fetch quotation child list");
  }
}

function* getQuotationSingleSaga({ payload }) {
  try {
    const id = payload?.id;
    const response = yield call(getQuotationSingleApi, id);
    yield put(quotationApiResponseSuccess(GET_QUOTATION_SINGLE, response));
  } catch (error) {
    yield put(quotationApiResponseError(GET_QUOTATION_SINGLE, error));
    toast.error("Failed to fetch quotation details");
  }
}

function* updateQuotationChildSaga({ payload }) {
  try {
    const { data } = payload;
    yield call(updateQuotationChildApi, data);
    yield put(quotationApiResponseSuccess(UPDATE_QUOTATION_CHILD, {}));

    // optional: refresh list after update
    // yield call(getQuotationsSaga, { payload: { filters: {} } });

    toast.success("Quotation updated successfully");
  } catch (error) {
    yield put(quotationApiResponseError(UPDATE_QUOTATION_CHILD, error));
    toast.error("Failed to update quotation");
  }
}

function* updateQuotationMasterSaga({ payload }) {
  try {
    const { data } = payload;
    yield call(updateQuotationMasterApi, data);
    yield put(quotationApiResponseSuccess(UPDATE_QUOTATION_MASTER, {}));

    toast.success("Quotation master updated successfully");
  } catch (error) {
    yield put(quotationApiResponseError(UPDATE_QUOTATION_MASTER, error));
    toast.error("Failed to update quotation master");
  }
}

/* ================= WATCHERS ================= */
function* watchGetQuotations() {
  yield takeEvery(GET_QUOTATIONS, getQuotationsSaga);
}
function* watchGetQuotationChildList() {
  yield takeEvery(GET_QUOTATION_CHILD_LIST, getQuotationChildListSaga);
}
function* watchGetQuotationSingle() {
  yield takeEvery(GET_QUOTATION_SINGLE, getQuotationSingleSaga);
}
function* watchUpdateQuotationChild() {
  yield takeEvery(UPDATE_QUOTATION_CHILD, updateQuotationChildSaga);
}
function* watchUpdateQuotationMaster() {
  yield takeEvery(UPDATE_QUOTATION_MASTER, updateQuotationMasterSaga);
}

/* ================= ROOT SAGA ================= */
export function* quotationSaga() {
  yield all([
    fork(watchGetQuotations),
    fork(watchGetQuotationChildList),
    fork(watchGetQuotationSingle),
    fork(watchUpdateQuotationChild),
    fork(watchUpdateQuotationMaster),
  ]);
}
