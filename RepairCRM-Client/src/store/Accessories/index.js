import { APIClient } from "../../helpers/api_helper";
import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";

// ================== ACTION TYPES ==================
export const GET_ACCESSORIES = "GET_ACCESSORIES";
export const ADD_ACCESSORY = "ADD_ACCESSORY";
export const UPDATE_ACCESSORY = "UPDATE_ACCESSORY";
export const DELETE_ACCESSORY = "DELETE_ACCESSORY";
export const RESET_ADD_ACCESSORY_RESPONSE = "RESET_ADD_ACCESSORY_RESPONSE";
export const RESET_UPDATE_ACCESSORY_RESPONSE =
  "RESET_UPDATE_ACCESSORY_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const accessoriesApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const accessoriesApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddAccessoryResponse = () => ({
  type: RESET_ADD_ACCESSORY_RESPONSE,
});

export const resetUpdateAccessoryResponse = () => ({
  type: RESET_UPDATE_ACCESSORY_RESPONSE,
});

export const getAccessoriesList = () => ({
  type: GET_ACCESSORIES,
});

export const addAccessory = (accessory) => ({
  type: ADD_ACCESSORY,
  payload: { accessory },
});

export const updateAccessory = (accessory) => ({
  type: UPDATE_ACCESSORY,
  payload: { accessory },
});

export const deleteAccessory = (id) => ({
  type: DELETE_ACCESSORY,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  accessories: [],
  loading: true,
  error: false,
  addAccessoryResponse: false,
  updateAccessoryResponse: false,
};

export const AccessoriesReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_ACCESSORIES:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_ACCESSORIES:
          return {
            ...state,
            accessories: action.payload.data,
            loading: false,
            error: false,
          };

        case ADD_ACCESSORY:
          return {
            ...state,
            addAccessoryResponse: true,
            accessories: [...state.accessories, action.payload.data],
            loading: false,
            error: false,
          };

        case UPDATE_ACCESSORY:
          return {
            ...state,
            updateAccessoryResponse: true,
            accessories: state.accessories.map((a) =>
              a.accessory_id === action.payload.data.accessory_id
                ? action.payload.data
                : a
            ),
            loading: false,
            error: false,
          };

        case DELETE_ACCESSORY:
          return {
            ...state,
            accessories: state.accessories.filter(
              (a) => a.accessory_id !== action.payload.data
            ),
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return {
        ...state,
        addAccessoryResponse: null,
        error: true,
      };

    case RESET_ADD_ACCESSORY_RESPONSE:
      return {
        ...state,
        addAccessoryResponse: false,
      };

    case RESET_UPDATE_ACCESSORY_RESPONSE:
      return {
        ...state,
        updateAccessoryResponse: false,
      };

    default:
      return state;
  }
};

// ================== API CALLS ==================

const api = new APIClient();

const getAccessoriesApi = () => api.get("/accessories/list");
const addAccessoryApi = (data) => api.create("/accessories/store", data);
const updateAccessoryApi = (data) => api.put("/accessories/update", data);
const deleteAccessoryApi = (id) => api.delete(`/accessories/delete/${id}`);

// ================== SAGAS ==================

function* getAccessoriesListSaga() {
  try {
    const response = yield call(getAccessoriesApi);
    yield put(accessoriesApiResponseSuccess(GET_ACCESSORIES, response));
  } catch (error) {
    yield put(accessoriesApiResponseError(GET_ACCESSORIES, error));
    toast.error("Failed to fetch accessories!");
  }
}

function* addAccessorySaga({ payload }) {
  try {
    const { accessory } = payload;
    const response = yield call(addAccessoryApi, accessory);
    yield put(accessoriesApiResponseSuccess(ADD_ACCESSORY, response));
    yield call(getAccessoriesListSaga);
    toast.success("Accessory added successfully!");
  } catch (error) {
    yield put(accessoriesApiResponseError(ADD_ACCESSORY, error));
    toast.error("Failed to add accessory!");
  }
}

function* updateAccessorySaga({ payload }) {
  try {
    const { accessory } = payload;
    const response = yield call(updateAccessoryApi, accessory);
    yield put(accessoriesApiResponseSuccess(UPDATE_ACCESSORY, response));
    yield call(getAccessoriesListSaga);
    toast.success("Accessory updated successfully!");
  } catch (error) {
    yield put(accessoriesApiResponseError(UPDATE_ACCESSORY, error));
    toast.error("Failed to update accessory!");
  }
}

function* deleteAccessorySaga({ payload }) {
  try {
    yield call(deleteAccessoryApi, payload);
    yield put(
      accessoriesApiResponseSuccess(DELETE_ACCESSORY, { data: payload })
    );
    yield call(getAccessoriesListSaga);
    toast.success("Accessory deleted successfully!");
  } catch (error) {
    yield put(accessoriesApiResponseError(DELETE_ACCESSORY, error));
    toast.error("Failed to delete accessory!");
  }
}

// ================== WATCHERS ==================
function* watchGetAccessories() {
  yield takeEvery(GET_ACCESSORIES, getAccessoriesListSaga);
}

function* watchAddAccessory() {
  yield takeEvery(ADD_ACCESSORY, addAccessorySaga);
}

function* watchUpdateAccessory() {
  yield takeEvery(UPDATE_ACCESSORY, updateAccessorySaga);
}

function* watchDeleteAccessory() {
  yield takeEvery(DELETE_ACCESSORY, deleteAccessorySaga);
}

// ================== ROOT SAGA ==================
export function* accessoriesSaga() {
  yield all([
    fork(watchGetAccessories),
    fork(watchAddAccessory),
    fork(watchUpdateAccessory),
    fork(watchDeleteAccessory),
  ]);
}
