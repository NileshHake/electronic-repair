import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../../helpers/api_helper";

// ================== ACTION TYPES ==================

export const GET_AMC_REQUESTS = "GET_AMC_REQUESTS";
export const GET_SINGLE_AMC_REQUEST = "GET_SINGLE_AMC_REQUEST";
export const GET_CHILD_AMC_REQUEST = "GET_CHILD_AMC_REQUEST";

export const ADD_AMC_REQUEST = "ADD_AMC_REQUEST";
export const UPDATE_AMC_REQUEST = "UPDATE_AMC_REQUEST";
export const DELETE_AMC_REQUEST = "DELETE_AMC_REQUEST";

export const API_RESPONSE_SUCCESS = "AMC_API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "AMC_API_RESPONSE_ERROR";

export const UPDATE_AMC_REQUEST_STATUS = "UPDATE_AMC_REQUEST_STATUS";
// ================== ACTIONS ==================

export const amcApiResponseSuccess = (actionType, data) => ({
    type: API_RESPONSE_SUCCESS,
    payload: { actionType, data },
});

export const amcApiResponseError = (actionType, error) => ({
    type: API_RESPONSE_ERROR,
    payload: { actionType, error },
});


export const updateAmcRequestStatus = (data) => ({
    type: UPDATE_AMC_REQUEST_STATUS,
    payload: { data },
});
export const getAmcRequests = () => ({
    type: GET_AMC_REQUESTS,
});

export const getSingleAmcRequest = (id) => ({
    type: GET_SINGLE_AMC_REQUEST,
    payload: id,
});

export const getChildAmcRequest = (id) => ({
    type: GET_CHILD_AMC_REQUEST,
    payload: id,
});

export const addAmcRequest = (data) => ({
    type: ADD_AMC_REQUEST,
    payload: { data },
});

export const updateAmcRequest = (data) => ({
    type: UPDATE_AMC_REQUEST,
    payload: { data },
});

export const deleteAmcRequest = (id) => ({
    type: DELETE_AMC_REQUEST,
    payload: id,
});


// ================== REDUCER ==================

const INIT_STATE = {
    amcRequests: [],
    singleAmcRequest: null,
    childRequests: [],
    loading: false,
    error: null,
};

export const AmcRequestReducer = (state = INIT_STATE, action) => {
    switch (action.type) {

        case GET_AMC_REQUESTS:
        case GET_SINGLE_AMC_REQUEST:
        case GET_CHILD_AMC_REQUEST:
            return { ...state, loading: true };

        case API_RESPONSE_SUCCESS:
            switch (action.payload.actionType) {

                case GET_AMC_REQUESTS:
                    return {
                        ...state,
                        amcRequests: action.payload.data,
                        loading: false,
                    };

                case GET_SINGLE_AMC_REQUEST:
                    return {
                        ...state,
                        singleAmcRequest: action.payload.data,
                        loading: false,
                    };

                case GET_CHILD_AMC_REQUEST:
                    return {
                        ...state,
                        childRequests: action.payload.data,
                        loading: false,
                    };

                case ADD_AMC_REQUEST:
                    return {
                        ...state,
                        amcRequests: [...state.amcRequests, action.payload.data],
                        loading: false,
                    };

                case UPDATE_AMC_REQUEST:
                    return {
                        ...state,
                        amcRequests: state.amcRequests.map((item) =>
                            item.amc_request_id === action.payload.data.amc_request_id
                                ? action.payload.data
                                : item
                        ),
                        loading: false,
                    };

                case DELETE_AMC_REQUEST:
                    return {
                        ...state,
                        amcRequests: state.amcRequests.filter(
                            (item) => item.amc_request_id !== action.payload.data
                        ),
                        loading: false,
                    };

                default:
                    return state;
            }

        case API_RESPONSE_ERROR:
            return {
                ...state,
                error: action.payload.error,
                loading: false,
            };

        default:
            return state;
    }
};


// ================== API CALLS ==================

const api = new APIClient();

const getAmcRequestsApi = () =>
    api.get("/amc-request/list");

const getSingleAmcRequestApi = (id) =>
    api.get(`/amc-request/single/${id}`);

const getChildAmcRequestApi = (id) =>
    api.get(`/amc-request/child-list/${id}`);

const addAmcRequestApi = (data) =>
    api.create("/amc-request/store", data);

const updateAmcRequestApi = (data) =>
    api.put("/amc-request/update", data);


const updateAmcRequestStatusApi = (data) =>
    api.put("/amc-request-status/update", data);
const deleteAmcRequestApi = (id) =>
    api.delete(`/amc-request/delete/${id}`);


// ================== SAGAS ==================

function* getAmcRequestsSaga() {
    try {
        const response = yield call(getAmcRequestsApi);
        yield put(amcApiResponseSuccess(GET_AMC_REQUESTS, response));
    } catch (error) {
        yield put(amcApiResponseError(GET_AMC_REQUESTS, error));
        toast.error("Failed to load AMC requests!");
    }
}

function* getSingleAmcRequestSaga({ payload }) {
    try {
        const response = yield call(getSingleAmcRequestApi, payload);
        yield put(amcApiResponseSuccess(GET_SINGLE_AMC_REQUEST, response));
    } catch (error) {
        yield put(amcApiResponseError(GET_SINGLE_AMC_REQUEST, error));
    }
}

function* getChildAmcRequestSaga({ payload }) {
    try {
        console.log(payload);

        const response = yield call(getChildAmcRequestApi, payload);
        yield put(amcApiResponseSuccess(GET_CHILD_AMC_REQUEST, response));
    } catch (error) {
        yield put(amcApiResponseError(GET_CHILD_AMC_REQUEST, error));
    }
}

function* addAmcRequestSaga({ payload }) {
    try {
        const { data } = payload;

        const response = yield call(addAmcRequestApi, data);

        yield put(amcApiResponseSuccess(ADD_AMC_REQUEST, response));

        yield call(getAmcRequestsSaga);

        toast.success("AMC Request created successfully!");

    } catch (error) {
        yield put(amcApiResponseError(ADD_AMC_REQUEST, error));
        toast.error("Failed to create AMC request!");
    }
}

function* updateAmcRequestStatusSaga({ payload }) {
    try {

        const { data } = payload;

        const response = yield call(updateAmcRequestStatusApi, data);

        yield put(amcApiResponseSuccess(UPDATE_AMC_REQUEST_STATUS, response));

        yield call(getAmcRequestsSaga);

        toast.success("AMC Request status updated!");

    } catch (error) {

        yield put(amcApiResponseError(UPDATE_AMC_REQUEST_STATUS, error));

        toast.error("Failed to update status!");

    }
}
function* updateAmcRequestSaga({ payload }) {
    try {
        const { data } = payload;

        const response = yield call(updateAmcRequestApi, data);

        yield put(amcApiResponseSuccess(UPDATE_AMC_REQUEST, response));

        yield call(getAmcRequestsSaga);

        toast.success("AMC Request updated successfully!");

    } catch (error) {
        yield put(amcApiResponseError(UPDATE_AMC_REQUEST, error));
        toast.error("Failed to update AMC request!");
    }
}

function* deleteAmcRequestSaga({ payload }) {
    try {

        yield call(deleteAmcRequestApi, payload);

        yield put(amcApiResponseSuccess(DELETE_AMC_REQUEST, payload));

        yield call(getAmcRequestsSaga);

        toast.success("AMC Request deleted successfully!");

    } catch (error) {
        yield put(amcApiResponseError(DELETE_AMC_REQUEST, error));
        toast.error("Failed to delete AMC request!");
    }
}


// ================== WATCHERS ==================

function* watchGetAmcRequests() {
    yield takeEvery(GET_AMC_REQUESTS, getAmcRequestsSaga);
}
function* watchUpdateAmcRequestStatus() {
    yield takeEvery(UPDATE_AMC_REQUEST_STATUS, updateAmcRequestStatusSaga);
}
function* watchGetSingleAmcRequest() {
    yield takeEvery(GET_SINGLE_AMC_REQUEST, getSingleAmcRequestSaga);
}

function* watchGetChildAmcRequest() {
    yield takeEvery(GET_CHILD_AMC_REQUEST, getChildAmcRequestSaga);
}

function* watchAddAmcRequest() {
    yield takeEvery(ADD_AMC_REQUEST, addAmcRequestSaga);
}

function* watchUpdateAmcRequest() {
    yield takeEvery(UPDATE_AMC_REQUEST, updateAmcRequestSaga);
}

function* watchDeleteAmcRequest() {
    yield takeEvery(DELETE_AMC_REQUEST, deleteAmcRequestSaga);
}


// ================== ROOT SAGA ==================


export function* amcRequestSaga() {
    yield all([
        fork(watchGetAmcRequests),
        fork(watchGetSingleAmcRequest),
        fork(watchGetChildAmcRequest),
        fork(watchAddAmcRequest),
        fork(watchUpdateAmcRequestStatus), // ✅ added,
        fork(watchUpdateAmcRequest),
        fork(watchDeleteAmcRequest),
    ]);
}