import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

/* ================== ACTION TYPES ================== */

export const GET_RENTAL_REQUEST_LIST = "GET_RENTAL_REQUEST_LIST";
export const ADD_RENTAL_REQUEST = "ADD_RENTAL_REQUEST";
export const UPDATE_RENTAL_REQUEST = "UPDATE_RENTAL_REQUEST";
export const DELETE_RENTAL_REQUEST = "DELETE_RENTAL_REQUEST";
export const UPDATE_RENTAL_REQUEST_STATUS = "UPDATE_RENTAL_REQUEST_STATUS";

export const RESET_ADD_RENTAL_REQUEST_RESPONSE = "RESET_ADD_RENTAL_REQUEST_RESPONSE";
export const RESET_UPDATE_RENTAL_REQUEST_RESPONSE = "RESET_UPDATE_RENTAL_REQUEST_RESPONSE";

export const API_RESPONSE_SUCCESS = "RENTAL_REQUEST_API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "RENTAL_REQUEST_API_RESPONSE_ERROR";

/* ================== ACTIONS ================== */

export const rentalRequestApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const rentalRequestApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddRentalRequestResponse = () => ({
  type: RESET_ADD_RENTAL_REQUEST_RESPONSE,
});

export const resetUpdateRentalRequestResponse = () => ({
  type: RESET_UPDATE_RENTAL_REQUEST_RESPONSE,
});

export const getRentalRequestList = (data) => ({
  type: GET_RENTAL_REQUEST_LIST,
  payload: data,
});

export const addRentalRequest = (request) => ({
  type: ADD_RENTAL_REQUEST,
  payload: { request },
});

export const updateRentalRequestStatus = (data) => ({
  type: UPDATE_RENTAL_REQUEST_STATUS,
  payload: data,
});

export const updateRentalRequest = (request) => ({
  type: UPDATE_RENTAL_REQUEST,
  payload: { request },
});

export const deleteRentalRequest = (id) => ({
  type: DELETE_RENTAL_REQUEST,
  payload: id,
});

/* ================== REDUCER ================== */

const INIT_STATE = {
  rentalRequests: [],
  loading: false,
  error: false,
  addRentalRequestResponse: false,
  updateRentalRequestResponse: false,
};

export const RentalRequestReducer = (state = INIT_STATE, action) => {

  switch (action.type) {

    case GET_RENTAL_REQUEST_LIST:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:

      switch (action.payload.actionType) {

        case GET_RENTAL_REQUEST_LIST:

          const newData = action.payload.data?.data || [];
          const page = action.payload.data?.page || 1;

          return {
            ...state,
            rentalRequests:
              page === 1
                ? newData
                : [...state.rentalRequests, ...newData],
            loading: false,
            error: false,
          };

        case ADD_RENTAL_REQUEST:

          return {
            ...state,
            addRentalRequestResponse: true,
            loading: false,
            error: false,
          };

        case UPDATE_RENTAL_REQUEST:

          return {
            ...state,
            updateRentalRequestResponse: true,
            loading: false,
            error: false,
          };

        case DELETE_RENTAL_REQUEST:

          return {
            ...state,
            loading: false,
            error: false,
          };

        case UPDATE_RENTAL_REQUEST_STATUS:

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
        loading: false,
        error: true,
      };

    case RESET_ADD_RENTAL_REQUEST_RESPONSE:

      return {
        ...state,
        addRentalRequestResponse: false,
      };

    case RESET_UPDATE_RENTAL_REQUEST_RESPONSE:

      return {
        ...state,
        updateRentalRequestResponse: false,
      };

    default:
      return state;
  }
};

/* ================== API CALLS ================== */

const api = new APIClient();

const getRentalRequestApi = (data) =>
  api.create("/rental-admin/list", data);

const addRentalRequestApi = (data) =>
  api.create("/rental-request/store", data);

const updateRentalRequestStatusApi = (data) =>
  api.put("/rental-request-status/update", data);

const updateRentalRequestApi = (data) =>
  api.put("/rental-request/update", data);

const deleteRentalRequestApi = (id) =>
  api.delete(`/rental-request/delete/${id}`);

/* ================== SAGAS ================== */

function* getRentalRequestListSaga({ payload }) {

  try {

    const response = yield call(getRentalRequestApi, payload);
     
    const result = {
      data: response  || [],
      page: payload?.page || 1,
    };

    yield put(
      rentalRequestApiResponseSuccess(
        GET_RENTAL_REQUEST_LIST,
        result
      )
    );

  } catch (error) {

    yield put(
      rentalRequestApiResponseError(
        GET_RENTAL_REQUEST_LIST,
        error
      )
    );

    toast.error("Failed to fetch rental requests!");

  }

}

function* addRentalRequestSaga({ payload }) {

  try {

    const { request } = payload;

    const response = yield call(addRentalRequestApi, request);

    yield put(
      rentalRequestApiResponseSuccess(
        ADD_RENTAL_REQUEST,
        response
      )
    );

    yield put(getRentalRequestList({ page: 1 }));

    toast.success("Rental request created successfully!");

  } catch (error) {

    yield put(
      rentalRequestApiResponseError(
        ADD_RENTAL_REQUEST,
        error
      )
    );

    toast.error("Failed to create rental request!");

  }

}

function* updateRentalRequestSaga({ payload }) {

  try {

    const { request } = payload;

    const response = yield call(updateRentalRequestApi, request);

    yield put(
      rentalRequestApiResponseSuccess(
        UPDATE_RENTAL_REQUEST,
        response
      )
    );

    yield put(getRentalRequestList({ page: 1 }));

    toast.success("Rental request updated successfully!");

  } catch (error) {

    yield put(
      rentalRequestApiResponseError(
        UPDATE_RENTAL_REQUEST,
        error
      )
    );

    toast.error("Failed to update rental request!");

  }

}

function* updateRentalRequestStatusSaga({ payload }) {

  try {

    const response = yield call(
      updateRentalRequestStatusApi,
      payload
    );

    yield put(
      rentalRequestApiResponseSuccess(
        UPDATE_RENTAL_REQUEST_STATUS,
        response
      )
    );

    yield put(getRentalRequestList({ page: 1 }));

    toast.success("Status updated successfully!");

  } catch (error) {

    yield put(
      rentalRequestApiResponseError(
        UPDATE_RENTAL_REQUEST_STATUS,
        error
      )
    );

    toast.error("Failed to update status!");

  }

}

function* deleteRentalRequestSaga({ payload }) {

  try {

    yield call(deleteRentalRequestApi, payload);

    yield put(
      rentalRequestApiResponseSuccess(
        DELETE_RENTAL_REQUEST,
        payload
      )
    );

    yield put(getRentalRequestList({ page: 1 }));

    toast.success("Rental request deleted successfully!");

  } catch (error) {

    yield put(
      rentalRequestApiResponseError(
        DELETE_RENTAL_REQUEST,
        error
      )
    );

    toast.error("Failed to delete rental request!");

  }

}

/* ================== WATCHERS ================== */

function* watchGetRentalRequest() {
  yield takeEvery(GET_RENTAL_REQUEST_LIST, getRentalRequestListSaga);
}

function* watchAddRentalRequest() {
  yield takeEvery(ADD_RENTAL_REQUEST, addRentalRequestSaga);
}

function* watchUpdateRentalRequest() {
  yield takeEvery(UPDATE_RENTAL_REQUEST, updateRentalRequestSaga);
}

function* watchUpdateRentalRequestStatus() {
  yield takeEvery(
    UPDATE_RENTAL_REQUEST_STATUS,
    updateRentalRequestStatusSaga
  );
}

function* watchDeleteRentalRequest() {
  yield takeEvery(DELETE_RENTAL_REQUEST, deleteRentalRequestSaga);
}

/* ================== ROOT SAGA ================== */

export function* rentalRequestSaga() {

  yield all([
    fork(watchGetRentalRequest),
    fork(watchAddRentalRequest),
    fork(watchUpdateRentalRequest),
    fork(watchUpdateRentalRequestStatus),
    fork(watchDeleteRentalRequest),
  ]);

}