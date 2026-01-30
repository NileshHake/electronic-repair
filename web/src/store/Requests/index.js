import { call, put, takeEvery, all, fork, select } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_REQUESTS = "GET_REQUESTS";
export const ADD_REQUEST = "ADD_REQUEST";
export const UPDATE_REQUEST = "UPDATE_REQUEST";
export const DELETE_REQUEST = "DELETE_REQUEST";

// ✅ NEW: status update (when modal opens for user_type 7)
export const STATUS_UPDATE_REQUEST = "STATUS_UPDATE_REQUEST";

export const RESET_ADD_REQUEST_RESPONSE = "RESET_ADD_REQUEST_RESPONSE";
export const RESET_UPDATE_REQUEST_RESPONSE = "RESET_UPDATE_REQUEST_RESPONSE";

export const API_RESPONSE_SUCCESS = "REQUEST_API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "REQUEST_API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const requestApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const requestApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddRequestResponse = () => ({
  type: RESET_ADD_REQUEST_RESPONSE,
});

export const resetUpdateRequestResponse = () => ({
  type: RESET_UPDATE_REQUEST_RESPONSE,
});

export const getRequestsList = (payload = {}) => ({
  type: GET_REQUESTS,
  payload, // { start_date, end_date, page, limit }
});

export const addRequest = (request) => ({
  type: ADD_REQUEST,
  payload: { request },
});

export const updateRequest = (request) => ({
  type: UPDATE_REQUEST,
  payload: { request },
});

export const deleteRequest = (id) => ({
  type: DELETE_REQUEST,
  payload: id,
});

// ✅ NEW action creator
export const statusUpdateRequest = (payload) => ({
  type: STATUS_UPDATE_REQUEST,
  payload, // { requests_id }
});

// ================== REDUCER ==================
const INIT_STATE = {
  requests: [],
  loading: true,
  error: false,
  addRequestResponse: false,
  updateRequestResponse: false,

  // ✅ store last filters + pagination used in list
  lastListPayload: {
    page: 1,
    limit: 10,
    start_date: "",
    end_date: "",
  },
};

export const RequestsReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_REQUESTS:
      return {
        ...state,
        loading: true,

        // ✅ save last payload for refresh after add/update/delete
        lastListPayload: {
          ...state.lastListPayload,
          ...(action.payload || {}),
        },
      };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_REQUESTS:
          return {
            ...state,
            requests: action.payload.data,
            loading: false,
            error: false,
          };

        case ADD_REQUEST:
          return {
            ...state,
            addRequestResponse: true,
            loading: false,
            error: false,
          };

        case UPDATE_REQUEST:
          return {
            ...state,
            updateRequestResponse: true,
            loading: false,
            error: false,
          };

        case DELETE_REQUEST:
          return {
            ...state,
            loading: false,
            error: false,
          };

        case STATUS_UPDATE_REQUEST:
          return {
            ...state,
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return {
        ...state,
        addRequestResponse: null,
        error: true,
        loading: false,
      };

    case RESET_ADD_REQUEST_RESPONSE:
      return { ...state, addRequestResponse: false };

    case RESET_UPDATE_REQUEST_RESPONSE:
      return { ...state, updateRequestResponse: false };

    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

const getRequestsApi = (data) => api.create("/requests/list", data);
const addRequestApi = (data) => api.create("/requests/store", data);
const updateRequestApi = (data) => api.put("/requests/update", data);
const deleteRequestApi = (id) => api.delete(`/requests/delete/${id}`);
const statusUpdateRequestApi = (data) => api.put("/requests/status-update", data);

// ================== SELECTORS ==================
const getLastPayload = (state) => state.RequestsReducer.lastListPayload;

// ================== SAGAS ==================

// ✅ Get All Requests
function* getRequestsListSaga({ payload }) {
  try {
    const response = yield call(getRequestsApi, payload || {});
    yield put(requestApiResponseSuccess(GET_REQUESTS, response));
  } catch (error) {
    yield put(requestApiResponseError(GET_REQUESTS, error));
    toast.error("Failed to fetch request list!");
  }
}

// ✅ Add Request
function* addRequestSaga({ payload }) {
  try {
    const { request } = payload;
    const response = yield call(addRequestApi, request);
    yield put(requestApiResponseSuccess(ADD_REQUEST, response));

    // ✅ refresh list using saved payload (filters + page + limit)
    const lastPayload = yield select(getLastPayload);
    yield put(getRequestsList(lastPayload));

    toast.success("Request created successfully!");
  } catch (error) {
    console.log(error);
    yield put(requestApiResponseError(ADD_REQUEST, error));
    toast.error("Failed to create request!");
  }
}

// ✅ Update Request
function* updateRequestSaga({ payload }) {
  try {
    const { request } = payload;
    const response = yield call(updateRequestApi, request);
    yield put(requestApiResponseSuccess(UPDATE_REQUEST, response));

    // ✅ refresh list using saved payload
    const lastPayload = yield select(getLastPayload);
    yield put(getRequestsList(lastPayload));

    toast.success("Request updated successfully!");
  } catch (error) {
    yield put(requestApiResponseError(UPDATE_REQUEST, error));
    toast.error("Failed to update request!");
  }
}

// ✅ Delete Request
function* deleteRequestSaga({ payload }) {
  try {
    yield call(deleteRequestApi, payload);
    yield put(requestApiResponseSuccess(DELETE_REQUEST, { data: payload }));

    // ✅ refresh list using saved payload
    const lastPayload = yield select(getLastPayload);
    yield put(getRequestsList(lastPayload));

    toast.success("Request deleted successfully!");
  } catch (error) {
    yield put(requestApiResponseError(DELETE_REQUEST, error));
    toast.error("Failed to delete request!");
  }
}

// ✅ Status update (background, no toast)
function* statusUpdateRequestSaga({ payload }) {
  try {
    const response = yield call(statusUpdateRequestApi, payload);
    yield put(requestApiResponseSuccess(STATUS_UPDATE_REQUEST, response));

    // ✅ refresh list using saved payload
    const lastPayload = yield select(getLastPayload);
    yield put(getRequestsList(lastPayload));
  } catch (error) {
    yield put(requestApiResponseError(STATUS_UPDATE_REQUEST, error));
  }
}

// ================== WATCHERS ==================
function* watchGetRequests() {
  yield takeEvery(GET_REQUESTS, getRequestsListSaga);
}

function* watchAddRequest() {
  yield takeEvery(ADD_REQUEST, addRequestSaga);
}

function* watchUpdateRequest() {
  yield takeEvery(UPDATE_REQUEST, updateRequestSaga);
}

function* watchDeleteRequest() {
  yield takeEvery(DELETE_REQUEST, deleteRequestSaga);
}

function* watchStatusUpdateRequest() {
  yield takeEvery(STATUS_UPDATE_REQUEST, statusUpdateRequestSaga);
}

// ================== ROOT SAGA ==================
export function* requestsSaga() {
  yield all([
    fork(watchGetRequests),
    fork(watchAddRequest),
    fork(watchUpdateRequest),
    fork(watchDeleteRequest),
    fork(watchStatusUpdateRequest),
  ]);
}
