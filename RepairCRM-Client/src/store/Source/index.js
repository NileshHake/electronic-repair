import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_SOURCES = "GET_SOURCES";
export const ADD_SOURCE = "ADD_SOURCE";
export const UPDATE_SOURCE = "UPDATE_SOURCE";
export const DELETE_SOURCE = "DELETE_SOURCE";
export const RESET_ADD_SOURCE_RESPONSE = "RESET_ADD_SOURCE_RESPONSE";
export const RESET_UPDATE_SOURCE_RESPONSE = "RESET_UPDATE_SOURCE_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const sourceApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const sourceApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddSourceResponse = () => ({
  type: RESET_ADD_SOURCE_RESPONSE,
});
export const resetUpdateSourceResponse = () => ({
  type: RESET_UPDATE_SOURCE_RESPONSE,
});

export const getSourcesList = () => ({ type: GET_SOURCES });
export const addSource = (source) => ({
  type: ADD_SOURCE,
  payload: { source },
});
export const updateSource = (source) => ({
  type: UPDATE_SOURCE,
  payload: { source },
});
export const deleteSource = (id) => ({ type: DELETE_SOURCE, payload: id });

// ================== REDUCER ==================
const INIT_STATE = {
  sources: [],
  loading: true,
  error: false,
  addSourceResponse: false,
  updateSourceResponse: false,
};

export const SourceReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_SOURCES:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_SOURCES:
          return {
            ...state,
            sources: action.payload.data,
            loading: false,
            error: false,
          };
        case ADD_SOURCE:
          return {
            ...state,
            addSourceResponse: true,
            sources: [...state.sources, action.payload.data],
            loading: false,
            error: false,
          };
        case UPDATE_SOURCE:
          return {
            ...state,
            updateSourceResponse: true,
            sources: state.sources.map((s) =>
              s.source_id === action.payload.data.source_id
                ? action.payload.data
                : s
            ),
            loading: false,
            error: false,
          };
        case DELETE_SOURCE:
          return {
            ...state,
            sources: state.sources.filter(
              (s) => s.source_id !== action.payload.data
            ),
            loading: false,
            error: false,
          };
        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, addSourceResponse: null, error: true };
    case RESET_ADD_SOURCE_RESPONSE:
      return { ...state, addSourceResponse: false };
    case RESET_UPDATE_SOURCE_RESPONSE:
      return { ...state, updateSourceResponse: false };
    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();
const getSourcesApi = () => api.get("/source/list");
const addSourceApi = (data) => api.create("/source/store", data);
const updateSourceApi = (data) => api.put("/source/update", data);
const deleteSourceApi = (id) => api.delete(`/source/delete/${id}`);

// ================== SAGAS ==================
function* getSourcesListSaga() {
  try {
    const response = yield call(getSourcesApi);
    yield put(sourceApiResponseSuccess(GET_SOURCES, response));
  } catch (error) {
    yield put(sourceApiResponseError(GET_SOURCES, error));
    toast.error("Failed to fetch sources!");
  }
}

function* addSourceSaga({ payload }) {
  try {
    const { source } = payload;
    const response = yield call(addSourceApi, source);
    yield put(sourceApiResponseSuccess(ADD_SOURCE, response));
    yield call(getSourcesListSaga);
    toast.success("Source added successfully!");
  } catch (error) {
    yield put(sourceApiResponseError(ADD_SOURCE, error));
    toast.error("Failed to add source!");
  }
}

function* updateSourceSaga({ payload }) {
  try {
    const { source } = payload;
    const response = yield call(updateSourceApi, source);
    yield put(sourceApiResponseSuccess(UPDATE_SOURCE, response));
    yield call(getSourcesListSaga);
    toast.success("Source updated successfully!");
  } catch (error) {
    yield put(sourceApiResponseError(UPDATE_SOURCE, error));
    toast.error("Failed to update source!");
  }
}

function* deleteSourceSaga({ payload }) {
  try {
    yield call(deleteSourceApi, payload);
    yield put(sourceApiResponseSuccess(DELETE_SOURCE, { data: payload }));
    yield call(getSourcesListSaga);
    toast.success("Source deleted successfully!");
  } catch (error) {
    yield put(sourceApiResponseError(DELETE_SOURCE, error));
    toast.error("Failed to delete source!");
  }
}

// ================== WATCHERS ==================
function* watchGetSources() {
  yield takeEvery(GET_SOURCES, getSourcesListSaga);
}
function* watchAddSource() {
  yield takeEvery(ADD_SOURCE, addSourceSaga);
}
function* watchUpdateSource() {
  yield takeEvery(UPDATE_SOURCE, updateSourceSaga);
}
function* watchDeleteSource() {
  yield takeEvery(DELETE_SOURCE, deleteSourceSaga);
}

// ================== ROOT SAGA ==================
export function* sourceSaga() {
  yield all([
    fork(watchGetSources),
    fork(watchAddSource),
    fork(watchUpdateSource),
    fork(watchDeleteSource),
  ]);
}
