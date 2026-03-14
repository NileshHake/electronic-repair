import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../../helpers/api_helper";

/* ================= ACTION TYPES ================= */

export const GET_AMC_QUOTATIONS = "GET_AMC_QUOTATIONS";
export const GET_SINGLE_AMC_QUOTATION = "GET_SINGLE_AMC_QUOTATION";
export const GET_CHILD_AMC_QUOTATION = "GET_CHILD_AMC_QUOTATION";

export const ADD_AMC_QUOTATION = "ADD_AMC_QUOTATION";
export const UPDATE_AMC_QUOTATION = "UPDATE_AMC_QUOTATION";
export const DELETE_AMC_QUOTATION = "DELETE_AMC_QUOTATION";

export const AMC_QUOTATION_API_RESPONSE_SUCCESS =
  "AMC_QUOTATION_API_RESPONSE_SUCCESS";

export const AMC_QUOTATION_API_RESPONSE_ERROR =
  "AMC_QUOTATION_API_RESPONSE_ERROR";

export const RESET_AMC_QUOTATION_RESPONSE =
  "RESET_AMC_QUOTATION_RESPONSE";

/* ================= ACTIONS ================= */

export const amcQuotationApiResponseSuccess = (actionType, data) => ({
  type: AMC_QUOTATION_API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const amcQuotationApiResponseError = (actionType, error) => ({
  type: AMC_QUOTATION_API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAmcQuotationResponse = () => ({
  type: RESET_AMC_QUOTATION_RESPONSE,
});

export const getAmcQuotations = () => ({
  type: GET_AMC_QUOTATIONS,
});

export const getSingleAmcQuotation = (id) => ({
  type: GET_SINGLE_AMC_QUOTATION,
  payload: id,
});

export const getChildAmcQuotation = (id) => ({
  type: GET_CHILD_AMC_QUOTATION,
  payload: id,
});

export const addAmcQuotation = (data) => ({
  type: ADD_AMC_QUOTATION,
  payload: { data },
});

export const updateAmcQuotation = (data) => ({
  type: UPDATE_AMC_QUOTATION,
  payload: { data },
});

export const deleteAmcQuotation = (id) => ({
  type: DELETE_AMC_QUOTATION,
  payload: id,
});

/* ================= REDUCER ================= */

const INIT_STATE = {
  amcQuotations: [],
  singleQuotation: null,
  childQuotationItems: [],
  loading: false,
  error: null,

  addAmcQuotationResponse: false,
  updateAmcQuotationResponse: false,
};

export const AmcQuotationReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_AMC_QUOTATIONS:
    case GET_SINGLE_AMC_QUOTATION:
    case GET_CHILD_AMC_QUOTATION:
      return {
        ...state,
        loading: true,
      };

    case AMC_QUOTATION_API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_AMC_QUOTATIONS:
          return {
            ...state,
            amcQuotations: action.payload.data,
            loading: false,
          };

        case GET_SINGLE_AMC_QUOTATION:
          return {
            ...state,
            singleQuotation: action.payload.data,
            loading: false,
          };

        case GET_CHILD_AMC_QUOTATION:
          return {
            ...state,
            childQuotationItems: action.payload.data,
            loading: false,
          };

        case ADD_AMC_QUOTATION:
          return {
            ...state,
            addAmcQuotationResponse: true,
            amcQuotations: [...state.amcQuotations, action.payload.data],
            loading: false,
          };

        case UPDATE_AMC_QUOTATION:
          return {
            ...state,
            updateAmcQuotationResponse: true,
            amcQuotations: state.amcQuotations.map((item) =>
              item.quotation_id === action.payload.data.quotation_id
                ? action.payload.data
                : item
            ),
            loading: false,
          };

        case DELETE_AMC_QUOTATION:
          return {
            ...state,
            amcQuotations: state.amcQuotations.filter(
              (item) => item.quotation_id !== action.payload.data
            ),
            loading: false,
          };

        default:
          return state;
      }

    case AMC_QUOTATION_API_RESPONSE_ERROR:
      return {
        ...state,
        error: action.payload.error,
        loading: false,
      };

    case RESET_AMC_QUOTATION_RESPONSE:
      return {
        ...state,
        addAmcQuotationResponse: false,
        updateAmcQuotationResponse: false,
      };

    default:
      return state;
  }
};

/* ================= API ================= */

const api = new APIClient();

const getAmcQuotationListApi = () => api.get("/amc-quotation/list");

const getSingleAmcQuotationApi = (id) =>
  api.get(`/amc-quotation/single/${id}`);

const getChildAmcQuotationApi = (id) =>
  api.get(`/amc-quotation/child-list/${id}`);

const addAmcQuotationApi = (data) =>
  api.create("/amc-quotation/store", data);

const updateAmcQuotationApi = (data) =>
  api.put("/amc-quotation/update", data);

const deleteAmcQuotationApi = (id) =>
  api.delete(`/amc-quotation/delete/${id}`);

/* ================= SAGAS ================= */

function* getAmcQuotationsSaga() {
  try {
    const response = yield call(getAmcQuotationListApi);

    yield put(
      amcQuotationApiResponseSuccess(GET_AMC_QUOTATIONS, response)
    );
  } catch (error) {
    yield put(amcQuotationApiResponseError(GET_AMC_QUOTATIONS, error));
    toast.error("Failed to load quotations");
  }
}

function* getSingleAmcQuotationSaga({ payload }) {
  try {
    const response = yield call(getSingleAmcQuotationApi, payload);

    yield put(
      amcQuotationApiResponseSuccess(
        GET_SINGLE_AMC_QUOTATION,
        response.data ? response.data : response
      )
    );
  } catch (error) {
    yield put(
      amcQuotationApiResponseError(GET_SINGLE_AMC_QUOTATION, error)
    );
  }
}

function* getChildAmcQuotationSaga({ payload }) {
  try {
    const response = yield call(getChildAmcQuotationApi, payload);

    yield put(
      amcQuotationApiResponseSuccess(
        GET_CHILD_AMC_QUOTATION,
        response.data ? response.data : response
      )
    );
  } catch (error) {
    yield put(
      amcQuotationApiResponseError(GET_CHILD_AMC_QUOTATION, error)
    );
    toast.error("Failed to load quotation items");
  }
}

function* addAmcQuotationSaga({ payload }) {
  try {
    const { data } = payload;

    const response = yield call(addAmcQuotationApi, data);

    yield put(
      amcQuotationApiResponseSuccess(
        ADD_AMC_QUOTATION,
        response.data ? response.data : response
      )
    );

    yield put(getAmcQuotations());

    toast.success(response.message || "Quotation created");
  } catch (error) {
    yield put(amcQuotationApiResponseError(ADD_AMC_QUOTATION, error));
    toast.error("Failed to create quotation");
  }
}

function* updateAmcQuotationSaga({ payload }) {
  try {
    const { data } = payload;

    const response = yield call(updateAmcQuotationApi, data);

    yield put(
      amcQuotationApiResponseSuccess(
        UPDATE_AMC_QUOTATION,
        response.data ? response.data : response
      )
    );

    yield put(getAmcQuotations());

    toast.success(response.message || "Quotation updated");
  } catch (error) {
    yield put(amcQuotationApiResponseError(UPDATE_AMC_QUOTATION, error));
    toast.error("Failed to update quotation");
  }
}

function* deleteAmcQuotationSaga({ payload }) {
  try {
    yield call(deleteAmcQuotationApi, payload);

    yield put(
      amcQuotationApiResponseSuccess(DELETE_AMC_QUOTATION, payload)
    );

    yield put(getAmcQuotations());

    toast.success("Quotation deleted");
  } catch (error) {
    yield put(amcQuotationApiResponseError(DELETE_AMC_QUOTATION, error));
    toast.error("Failed to delete quotation");
  }
}

/* ================= WATCHERS ================= */

function* watchGetAmcQuotations() {
  yield takeEvery(GET_AMC_QUOTATIONS, getAmcQuotationsSaga);
}

function* watchGetSingleAmcQuotation() {
  yield takeEvery(GET_SINGLE_AMC_QUOTATION, getSingleAmcQuotationSaga);
}

function* watchGetChildAmcQuotation() {
  yield takeEvery(GET_CHILD_AMC_QUOTATION, getChildAmcQuotationSaga);
}

function* watchAddAmcQuotation() {
  yield takeEvery(ADD_AMC_QUOTATION, addAmcQuotationSaga);
}

function* watchUpdateAmcQuotation() {
  yield takeEvery(UPDATE_AMC_QUOTATION, updateAmcQuotationSaga);
}

function* watchDeleteAmcQuotation() {
  yield takeEvery(DELETE_AMC_QUOTATION, deleteAmcQuotationSaga);
}

/* ================= ROOT SAGA ================= */

export function* amcQuotationSaga() {
  yield all([
    fork(watchGetAmcQuotations),
    fork(watchGetSingleAmcQuotation),
    fork(watchGetChildAmcQuotation),
    fork(watchAddAmcQuotation),
    fork(watchUpdateAmcQuotation),
    fork(watchDeleteAmcQuotation),
  ]);
}