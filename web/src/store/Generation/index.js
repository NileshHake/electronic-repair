import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_GENERATIONS = "GET_GENERATIONS";
export const ADD_GENERATION = "ADD_GENERATION";
export const UPDATE_GENERATION = "UPDATE_GENERATION";
export const DELETE_GENERATION = "DELETE_GENERATION";

export const RESET_ADD_GENERATION_RESPONSE = "RESET_ADD_GENERATION_RESPONSE";
export const RESET_UPDATE_GENERATION_RESPONSE = "RESET_UPDATE_GENERATION_RESPONSE";

export const API_RESPONSE_SUCCESS = "GEN_API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "GEN_API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const generationApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const generationApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddGenerationResponse = () => ({
  type: RESET_ADD_GENERATION_RESPONSE,
});

export const resetUpdateGenerationResponse = () => ({
  type: RESET_UPDATE_GENERATION_RESPONSE,
});

export const getGenerationsList = () => ({ type: GET_GENERATIONS });
export const addGeneration = (generation) => ({
  type: ADD_GENERATION,
  payload: { generation },
});
export const updateGeneration = (generation) => ({
  type: UPDATE_GENERATION,
  payload: { generation },
});
export const deleteGeneration = (id) => ({
  type: DELETE_GENERATION,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  generations: [],
  loading: true,
  error: false,
  addGenerationResponse: false,
  updateGenerationResponse: false,
};

export const GenerationReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_GENERATIONS:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_GENERATIONS:
          return {
            ...state,
            generations: action.payload.data,
            loading: false,
            error: false,
          };

        case ADD_GENERATION:
          return {
            ...state,
            addGenerationResponse: true,
            generations: [...state.generations, action.payload.data],
            loading: false,
            error: false,
          };

        case UPDATE_GENERATION:
          return {
            ...state,
            updateGenerationResponse: true,
            generations: state.generations.map((g) =>
              g.generations_id === action.payload.data.generations_id
                ? action.payload.data
                : g
            ),
            loading: false,
            error: false,
          };

        case DELETE_GENERATION:
          return {
            ...state,
            generations: state.generations.filter(
              (g) => g.generations_id !== action.payload.data
            ),
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true, addGenerationResponse: null };

    case RESET_ADD_GENERATION_RESPONSE:
      return { ...state, addGenerationResponse: false };

    case RESET_UPDATE_GENERATION_RESPONSE:
      return { ...state, updateGenerationResponse: false };

    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();
const getGenerationsApi = () => api.get("/generation/list");
const addGenerationApi = (data) => api.create("/generation/store", data);
const updateGenerationApi = (data) => api.put("/generation/update", data);
const deleteGenerationApi = (id) => api.delete(`/generation/delete/${id}`);

// ================== SAGAS ==================
function* getGenerationsListSaga() {
  try {
    const response = yield call(getGenerationsApi);
    yield put(generationApiResponseSuccess(GET_GENERATIONS, response));
  } catch (error) {
    yield put(generationApiResponseError(GET_GENERATIONS, error));
    toast.error("Failed to fetch generations!");
  }
}

function* addGenerationSaga({ payload }) {
  try {
    const { generation } = payload;
    const response = yield call(addGenerationApi, generation);
    yield put(generationApiResponseSuccess(ADD_GENERATION, response));
    yield call(getGenerationsListSaga);
    toast.success("Generation added successfully!");
  } catch (error) {
    yield put(generationApiResponseError(ADD_GENERATION, error));
    toast.error("Failed to add generation!");
  }
}

function* updateGenerationSaga({ payload }) {
  try {
    const { generation } = payload;
    const response = yield call(updateGenerationApi, generation);
    yield put(generationApiResponseSuccess(UPDATE_GENERATION, response));
    yield call(getGenerationsListSaga);
    toast.success("Generation updated successfully!");
  } catch (error) {
    yield put(generationApiResponseError(UPDATE_GENERATION, error));
    toast.error("Failed to update generation!");
  }
}

function* deleteGenerationSaga({ payload }) {
  try {
    yield call(deleteGenerationApi, payload);
    // keep same style as your service code
    yield put(generationApiResponseSuccess(DELETE_GENERATION, { data: payload }));
    yield call(getGenerationsListSaga);
    toast.success("Generation deleted successfully!");
  } catch (error) {
    yield put(generationApiResponseError(DELETE_GENERATION, error));
    toast.error("Failed to delete generation!");
  }
}

// ================== WATCHERS ==================
function* watchGetGenerations() {
  yield takeEvery(GET_GENERATIONS, getGenerationsListSaga);
}

function* watchAddGeneration() {
  yield takeEvery(ADD_GENERATION, addGenerationSaga);
}

function* watchUpdateGeneration() {
  yield takeEvery(UPDATE_GENERATION, updateGenerationSaga);
}

function* watchDeleteGeneration() {
  yield takeEvery(DELETE_GENERATION, deleteGenerationSaga);
}

// ================== ROOT SAGA ==================
export function* generationSaga() {
  yield all([
    fork(watchGetGenerations),
    fork(watchAddGeneration),
    fork(watchUpdateGeneration),
    fork(watchDeleteGeneration),
  ]);
}
