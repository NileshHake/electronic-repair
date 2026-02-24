import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_RECOVERY = "GET_RECOVERY";
export const ADD_RECOVERY = "ADD_RECOVERY";
export const UPDATE_RECOVERY = "UPDATE_RECOVERY";
export const DELETE_RECOVERY = "DELETE_RECOVERY";
export const GET_SINGLE_RECOVERY = "GET_SINGLE_RECOVERY";

export const RESET_ADD_RECOVERY_RESPONSE = "RESET_ADD_RECOVERY_RESPONSE";
export const RESET_UPDATE_RECOVERY_RESPONSE = "RESET_UPDATE_RECOVERY_RESPONSE";
export const RESET_DELETE_RECOVERY_RESPONSE = "RESET_DELETE_RECOVERY_RESPONSE";

export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================

export const recoveryApiResponseSuccess = (actionType, data) => ({
    type: API_RESPONSE_SUCCESS,
    payload: { actionType, data },
});

export const recoveryApiResponseError = (actionType, error) => ({
    type: API_RESPONSE_ERROR,
    payload: { actionType, error },
});

export const getRecoveryList = (data) => ({
    type: GET_RECOVERY,
    payload: data,
});

export const getSingleRecovery = (id) => ({
    type: GET_SINGLE_RECOVERY,
    payload: id,
});

export const addRecovery = (data) => ({
    type: ADD_RECOVERY,
    payload: data,
});

export const updateRecovery = (data) => ({
    type: UPDATE_RECOVERY,
    payload: data,
});

export const deleteRecovery = (id) => ({
    type: DELETE_RECOVERY,
    payload: id,
});
export const resetAddRecoveryResponse = () => ({
    type: RESET_ADD_RECOVERY_RESPONSE,
});

export const resetUpdateRecoveryResponse = () => ({
    type: RESET_UPDATE_RECOVERY_RESPONSE,
});

export const resetDeleteRecoveryResponse = () => ({
    type: RESET_DELETE_RECOVERY_RESPONSE,
});
// ================== INITIAL STATE ==================

const INIT_STATE = {
    recoveries: [],
    singleRecovery: null,
    loading: false,
    error: false,
    addRecoveryResponse: false,
    updateRecoveryResponse: false,
    deleteRecoveryResponse: false,
};

// ================== REDUCER ==================

/**
 * RecoveryReducer
 * 
 * Reducer for the recovery slice of the store.
 * Handles the following actions:
 * - GET_RECOVERY
 * - GET_SINGLE_RECOVERY
 * - ADD_RECOVERY
 * - UPDATE_RECOVERY
 * - DELETE_RECOVERY
 * - API_RESPONSE_SUCCESS
 * - API_RESPONSE_ERROR
 * - RESET_ADD_RECOVERY_RESPONSE
 * - RESET_UPDATE_RECOVERY_RESPONSE
 * - RESET_DELETE_RECOVERY_RESPONSE
 * 
 * @param {Object} state - The current state of the recovery slice of the store.
 * @param {Object} action - The action to be handled by the reducer.
 * @returns {Object} - The new state of the recovery slice of the store.
 */
export const RecoveryReducer = (state = INIT_STATE, action) => {
    switch (action.type) {
        case GET_RECOVERY:
        case GET_SINGLE_RECOVERY:
            return { ...state, loading: true };

        case API_RESPONSE_SUCCESS:
            switch (action.payload.actionType) {
                case GET_RECOVERY:
                    return {
                        ...state,
                        recoveries: action.payload.data,
                        loading: false,
                    };

                case GET_SINGLE_RECOVERY:
                    return {
                        ...state,
                        singleRecovery: action.payload.data,
                        loading: false,
                    };

                case ADD_RECOVERY:
                    return {
                        ...state,
                        addRecoveryResponse: true,
                        recoveries: [...state.recoveries, action.payload.data],
                    };

                case UPDATE_RECOVERY:
                    return {
                        ...state,
                        updateRecoveryResponse: true,
                        recoveries: state.recoveries.map((r) =>
                            r.recovery_id === action.payload.data.recovery_id
                                ? action.payload.data
                                : r
                        ),
                    };

                case DELETE_RECOVERY:
                    return {
                        ...state,
                        deleteRecoveryResponse: true,
                        recoveries: state.recoveries.filter(
                            (r) => r.recovery_id !== action.payload.data
                        ),
                    };

                default:
                    return state;
            }

        case API_RESPONSE_ERROR:
            return { ...state, error: true, loading: false };

        case RESET_ADD_RECOVERY_RESPONSE:
            return { ...state, addRecoveryResponse: false };

        case RESET_UPDATE_RECOVERY_RESPONSE:
            return { ...state, updateRecoveryResponse: false };

        case RESET_DELETE_RECOVERY_RESPONSE:
            return { ...state, deleteRecoveryResponse: false };

        default:
            return state;
    }
};

// ================== API CALLS ==================

const api = new APIClient();

const getRecoveryApi = (data) => api.create("/recovery/list", data);
const getSingleRecoveryApi = (id) => api.get(`/recovery/single/${id}`);
const addRecoveryApi = (data) => api.create("/recovery/store", data);
const updateRecoveryApi = (data) => api.put("/recovery/update", data);
const deleteRecoveryApi = (id) => api.delete(`/recovery/delete/${id}`);

// ================== SAGAS ==================

function* getRecoveryListSaga({ payload = {} }) {
    try {
        const response = yield call(getRecoveryApi, payload);
        yield put(recoveryApiResponseSuccess(GET_RECOVERY, response));
    } catch (error) {
        yield put(recoveryApiResponseError(GET_RECOVERY, error));
        toast.error("Failed to fetch recoveries!");
    }
}

function* getSingleRecoverySaga({ payload }) {
    try {
        const response = yield call(getSingleRecoveryApi, payload);
        yield put(recoveryApiResponseSuccess(GET_SINGLE_RECOVERY, response));
    } catch (error) {
        yield put(recoveryApiResponseError(GET_SINGLE_RECOVERY, error));
        toast.error("Failed to fetch recovery details!");
    }
}

function* addRecoverySaga({ payload }) {
    try {
        const response = yield call(addRecoveryApi, payload);
        yield put(recoveryApiResponseSuccess(ADD_RECOVERY, response));
        toast.success("Recovery added successfully!");
    } catch (error) {
        yield put(recoveryApiResponseError(ADD_RECOVERY, error));
        toast.error("Failed to add recovery!");
    }
}

function* updateRecoverySaga({ payload }) {
    try {
        const response = yield call(updateRecoveryApi, payload);
        yield put(recoveryApiResponseSuccess(UPDATE_RECOVERY, response));
        toast.success("Recovery updated successfully!");
    } catch (error) {
        yield put(recoveryApiResponseError(UPDATE_RECOVERY, error));
        toast.error("Failed to update recovery!");
    }
}

function* deleteRecoverySaga({ payload }) {
    try {
        yield call(deleteRecoveryApi, payload);
        yield put(recoveryApiResponseSuccess(DELETE_RECOVERY, payload));
        toast.success("Recovery deleted successfully!");
    } catch (error) {
        yield put(recoveryApiResponseError(DELETE_RECOVERY, error));
        toast.error("Failed to delete recovery!");
    }
}

// ================== WATCHERS ==================

function* watchGetRecovery() {
    yield takeEvery(GET_RECOVERY, getRecoveryListSaga);
}
function* watchGetSingleRecovery() {
    yield takeEvery(GET_SINGLE_RECOVERY, getSingleRecoverySaga);
}
function* watchAddRecovery() {
    yield takeEvery(ADD_RECOVERY, addRecoverySaga);
}
function* watchUpdateRecovery() {
    yield takeEvery(UPDATE_RECOVERY, updateRecoverySaga);
}
function* watchDeleteRecovery() {
    yield takeEvery(DELETE_RECOVERY, deleteRecoverySaga);
}



export function* recoverySaga() {
    yield all([
        fork(watchGetRecovery),
        fork(watchGetSingleRecovery),
        fork(watchAddRecovery),
        fork(watchUpdateRecovery),
        fork(watchDeleteRecovery),
    ]);
}