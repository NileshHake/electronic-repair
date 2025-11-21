import { APIClient } from "../../helpers/api_helper";
import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";

// ================== ACTION TYPES ==================
export const GET_HARDWARE_CONFIGURATIONS = "GET_HARDWARE_CONFIGURATIONS";
export const ADD_HARDWARE_CONFIGURATION = "ADD_HARDWARE_CONFIGURATION";
export const UPDATE_HARDWARE_CONFIGURATION = "UPDATE_HARDWARE_CONFIGURATION";
export const DELETE_HARDWARE_CONFIGURATION = "DELETE_HARDWARE_CONFIGURATION";
export const RESET_ADD_HARDWARE_CONFIGURATION_RESPONSE =
  "RESET_ADD_HARDWARE_CONFIGURATION_RESPONSE";
export const RESET_UPDATE_HARDWARE_CONFIGURATION_RESPONSE =
  "RESET_UPDATE_HARDWARE_CONFIGURATION_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const hardwareApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const hardwareApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddHardwareConfigurationResponse = () => ({
  type: RESET_ADD_HARDWARE_CONFIGURATION_RESPONSE,
});

export const resetUpdateHardwareConfigurationResponse = () => ({
  type: RESET_UPDATE_HARDWARE_CONFIGURATION_RESPONSE,
});

export const getHardwareConfigurations = () => ({
  type: GET_HARDWARE_CONFIGURATIONS,
});

export const addHardwareConfiguration = (hardware) => ({
  type: ADD_HARDWARE_CONFIGURATION,
  payload: { hardware },
});

export const updateHardwareConfiguration = (hardware) => ({
  type: UPDATE_HARDWARE_CONFIGURATION,
  payload: { hardware },
});

export const deleteHardwareConfiguration = (id) => ({
  type: DELETE_HARDWARE_CONFIGURATION,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  hardwareConfigurations: [],
  loading: true,
  error: false,
  addHardwareConfigurationResponse: false,
  updateHardwareConfigurationResponse: false,
};

export const HardwareConfigurationReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_HARDWARE_CONFIGURATIONS:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_HARDWARE_CONFIGURATIONS:
          return {
            ...state,
            hardwareConfigurations: action.payload.data,
            loading: false,
            error: false,
          };

        case ADD_HARDWARE_CONFIGURATION:
          return {
            ...state,
            addHardwareConfigurationResponse: true,
            hardwareConfigurations: [
              ...state.hardwareConfigurations,
              action.payload.data,
            ],
            loading: false,
            error: false,
          };

        case UPDATE_HARDWARE_CONFIGURATION:
          return {
            ...state,
            updateHardwareConfigurationResponse: true,
            hardwareConfigurations: state.hardwareConfigurations.map((h) =>
              h.hardware_configuration_id ===
              action.payload.data.hardware_configuration_id
                ? action.payload.data
                : h
            ),
            loading: false,
            error: false,
          };

        case DELETE_HARDWARE_CONFIGURATION:
          return {
            ...state,
            hardwareConfigurations: state.hardwareConfigurations.filter(
              (h) =>
                h.hardware_configuration_id !== action.payload.data
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
        addHardwareConfigurationResponse: null,
        error: true,
      };

    case RESET_ADD_HARDWARE_CONFIGURATION_RESPONSE:
      return {
        ...state,
        addHardwareConfigurationResponse: false,
      };

    case RESET_UPDATE_HARDWARE_CONFIGURATION_RESPONSE:
      return {
        ...state,
        updateHardwareConfigurationResponse: false,
      };

    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

const getHardwareConfigurationsApi = () =>
  api.get("/hardware-configuration/list");

const addHardwareConfigurationApi = (data) =>
  api.create("/hardware-configuration/store", data);

const updateHardwareConfigurationApi = (data) =>
  api.put("/hardware-configuration/update", data);

const deleteHardwareConfigurationApi = (id) =>
  api.delete(`/hardware-configuration/delete/${id}`);

// ================== SAGAS ==================
function* getHardwareConfigurationsSaga() {
  try {
    const response = yield call(getHardwareConfigurationsApi);
    yield put(hardwareApiResponseSuccess(GET_HARDWARE_CONFIGURATIONS, response));
  } catch (error) {
    yield put(hardwareApiResponseError(GET_HARDWARE_CONFIGURATIONS, error));
    toast.error("Failed to fetch hardware configurations!");
  }
}

function* addHardwareConfigurationSaga({ payload }) {
  try {
    const { hardware } = payload;
    const response = yield call(addHardwareConfigurationApi, hardware);
    yield put(hardwareApiResponseSuccess(ADD_HARDWARE_CONFIGURATION, response));
    yield call(getHardwareConfigurationsSaga);
    toast.success("Hardware configuration added successfully!");
  } catch (error) {
    yield put(hardwareApiResponseError(ADD_HARDWARE_CONFIGURATION, error));
    toast.error("Failed to add hardware configuration!");
  }
}

function* updateHardwareConfigurationSaga({ payload }) {
  try {
    const { hardware } = payload;
    const response = yield call(updateHardwareConfigurationApi, hardware);
    yield put(
      hardwareApiResponseSuccess(UPDATE_HARDWARE_CONFIGURATION, response)
    );
    yield call(getHardwareConfigurationsSaga);
    toast.success("Hardware configuration updated successfully!");
  } catch (error) {
    yield put(hardwareApiResponseError(UPDATE_HARDWARE_CONFIGURATION, error));
    toast.error("Failed to update hardware configuration!");
  }
}

function* deleteHardwareConfigurationSaga({ payload }) {
  try {
    yield call(deleteHardwareConfigurationApi, payload);
    yield put(
      hardwareApiResponseSuccess(DELETE_HARDWARE_CONFIGURATION, { data: payload })
    );
    yield call(getHardwareConfigurationsSaga);
    toast.success("Hardware configuration deleted successfully!");
  } catch (error) {
    yield put(hardwareApiResponseError(DELETE_HARDWARE_CONFIGURATION, error));
    toast.error("Failed to delete hardware configuration!");
  }
}

// ================== WATCHERS ==================
function* watchGetHardwareConfigurations() {
  yield takeEvery(GET_HARDWARE_CONFIGURATIONS, getHardwareConfigurationsSaga);
}

function* watchAddHardwareConfiguration() {
  yield takeEvery(ADD_HARDWARE_CONFIGURATION, addHardwareConfigurationSaga);
}

function* watchUpdateHardwareConfiguration() {
  yield takeEvery(UPDATE_HARDWARE_CONFIGURATION, updateHardwareConfigurationSaga);
}

function* watchDeleteHardwareConfiguration() {
  yield takeEvery(DELETE_HARDWARE_CONFIGURATION, deleteHardwareConfigurationSaga);
}

// ================== ROOT SAGA ==================
export function* hardwareConfigurationSaga() {
  yield all([
    fork(watchGetHardwareConfigurations),
    fork(watchAddHardwareConfiguration),
    fork(watchUpdateHardwareConfiguration),
    fork(watchDeleteHardwareConfiguration),
  ]);
}
