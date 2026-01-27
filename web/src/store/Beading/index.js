// src/store/Beading/index.js

import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_BEADING_LIST = "GET_BEADING_LIST";
export const UPDATE_BEADING = "UPDATE_BEADING";
export const RESET_UPDATE_BEADING_RESPONSE = "RESET_UPDATE_BEADING_RESPONSE";
export const API_RESPONSE_SUCCESS = "BEADING_API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "BEADING_API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const beadingApiResponseSuccess = (actionType, data, meta = {}) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data, meta },
});

export const beadingApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetUpdateBeadingResponse = () => ({
  type: RESET_UPDATE_BEADING_RESPONSE,
});

// ✅ now accepts payload: { page, limit, start_date, end_date }
export const getBeadingList = (params = {}) => ({
  type: GET_BEADING_LIST,
  payload: params,
});

export const updateBeading = (beading) => ({
  type: UPDATE_BEADING,
  payload: { beading },
});

// ================== REDUCER ==================
const INIT_STATE = {
  list: [],
  loading: true,
  error: false,

  // ✅ pagination state
  page: 1,
  limit: 10,
  hasMore: true,

  updateBeadingResponse: false,
};

export const BeadingReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_BEADING_LIST:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_BEADING_LIST: {
          // ✅ expect response: { rows, page, limit, hasMore }
          const rows = action.payload.data?.rows || [];
          const page = Number(action.payload.data?.page || 1);
          const limit = Number(action.payload.data?.limit || state.limit);
          const hasMore =
            typeof action.payload.data?.hasMore === "boolean"
              ? action.payload.data.hasMore
              : rows.length === limit;

          // ✅ if page=1 replace, else append
          const newList = page === 1 ? rows : [...state.list, ...rows];

          return {
            ...state,
            list: newList,
            page,
            limit,
            hasMore,
            loading: false,
            error: false,
          };
        }

        case UPDATE_BEADING:
          return {
            ...state,
            updateBeadingResponse: true,
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return {
        ...state,
        updateBeadingResponse: null,
        error: true,
        loading: false,
      };

    case RESET_UPDATE_BEADING_RESPONSE:
      return {
        ...state,
        updateBeadingResponse: false,
      };

    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

// ✅ build query string safely
const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      q.append(k, v);
    }
  });
  const qs = q.toString();
  return qs ? `?${qs}` : "";
};

// ✅ now supports page/limit/start_date/end_date
const getBeadingListApi = (params) =>
  api.get(`/beading/global-list${buildQuery(params)}`);

const updateBeadingApi = (data) => api.put("/beading/vendor-accept", data);

// ================== SAGAS ==================

// ✅ List with pagination + filters
function* getBeadingListSaga({ payload }) {
  try {
    // payload = { page, limit, start_date, end_date }
    const response = yield call(getBeadingListApi, payload);
    yield put(beadingApiResponseSuccess(GET_BEADING_LIST, response, payload));
  } catch (error) {
    yield put(beadingApiResponseError(GET_BEADING_LIST, error));
    toast.error("Failed to fetch beading list!");
  }
}

// ✅ Update
function* updateBeadingSaga({ payload }) {
  try {
    const { beading } = payload;
    const response = yield call(updateBeadingApi, beading);
    yield put(beadingApiResponseSuccess(UPDATE_BEADING, response));

    toast.success("Beading updated successfully!");
  } catch (error) {
    yield put(beadingApiResponseError(UPDATE_BEADING, error));
    toast.error("Failed to update beading!");
  }
}

// ================== WATCHERS ==================
function* watchGetBeadingList() {
  yield takeEvery(GET_BEADING_LIST, getBeadingListSaga);
}

function* watchUpdateBeading() {
  yield takeEvery(UPDATE_BEADING, updateBeadingSaga);
}

// ================== ROOT SAGA ==================
export function* beadingSaga() {
  yield all([fork(watchGetBeadingList), fork(watchUpdateBeading)]);
}
