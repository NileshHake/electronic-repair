// src/store/Beading/index.js

import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";
import { logger } from "sequelize/lib/utils/logger";

// ================== ACTION TYPES ==================
export const GET_BEADING_LIST = "GET_BEADING_LIST";
export const UPDATE_BEADING = "UPDATE_BEADING";
export const RESET_UPDATE_BEADING_RESPONSE = "RESET_UPDATE_BEADING_RESPONSE";
export const API_RESPONSE_SUCCESS = "BEADING_API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "BEADING_API_RESPONSE_ERROR";

// ✅ NEW: SINGLE (master + acceptedVendor + vendorOffers)
export const GET_BEADING_SINGLE = "GET_BEADING_SINGLE";

// ✅ NEW: CHILD (Vendor Offers)
export const UPSERT_VENDOR_OFFER = "UPSERT_VENDOR_OFFER";
export const GET_VENDOR_OFFERS_BY_REQUEST = "GET_VENDOR_OFFERS_BY_REQUEST";
export const GET_VENDOR_OFFER_SINGLE = "GET_VENDOR_OFFER_SINGLE";
export const UPDATE_VENDOR_OFFER = "UPDATE_VENDOR_OFFER";
export const DELETE_VENDOR_OFFER = "DELETE_VENDOR_OFFER";

// ✅ NEW: ACCEPT VENDOR (customer)
export const ACCEPT_VENDOR_OFFER = "ACCEPT_VENDOR_OFFER";

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

// ✅ NEW: fetch single request
export const getBeadingSingle = (id) => ({
  type: GET_BEADING_SINGLE,
  payload: { id },
});

// ✅ NEW: child actions
// Body expected by API: { beading_request_id, vendor_beading_amount, vendor_note }
export const upsertVendorOffer = (offer) => {
    return {
    type: UPSERT_VENDOR_OFFER,
    payload: { offer },
  };
};
// List all offers for request id
export const getVendorOffersByRequest = (beading_request_id) => ({
  type: GET_VENDOR_OFFERS_BY_REQUEST,
  payload: { beading_request_id },
});

// Single offer by br_vendor_id
export const getVendorOfferSingle = (br_vendor_id) => ({
  type: GET_VENDOR_OFFER_SINGLE,
  payload: { br_vendor_id },
});

// Update offer (if you use separate update endpoint)
export const updateVendorOffer = (offer) => ({
  type: UPDATE_VENDOR_OFFER,
  payload: { offer },
});

// Delete offer
export const deleteVendorOffer = (br_vendor_id) => ({
  type: DELETE_VENDOR_OFFER,
  payload: { br_vendor_id },
});

// ✅ Accept vendor offer (customer)
// Body expected by API: { beading_request_id, vendor_id }
export const acceptVendorOffer = (data) => ({
  type: ACCEPT_VENDOR_OFFER,
  payload: { data },
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

  // ✅ NEW: single request state
  single: null,
  singleLoading: false,

  // ✅ NEW: child offers state
  vendorOffers: [],
  vendorOffersLoading: false,
  vendorOfferSingle: null,
  vendorOfferSingleLoading: false,

  // ✅ NEW: action success flags (optional)
  upsertVendorOfferResponse: false,
  updateVendorOfferResponse: false,
  deleteVendorOfferResponse: false,
  acceptVendorOfferResponse: false,
};

export const BeadingReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_BEADING_LIST:
      return { ...state, loading: true };

    case GET_BEADING_SINGLE:
      return { ...state, singleLoading: true };

    case GET_VENDOR_OFFERS_BY_REQUEST:
      return { ...state, vendorOffersLoading: true };

    case GET_VENDOR_OFFER_SINGLE:
      return { ...state, vendorOfferSingleLoading: true };

    case UPSERT_VENDOR_OFFER:
    case UPDATE_VENDOR_OFFER:
    case DELETE_VENDOR_OFFER:
    case ACCEPT_VENDOR_OFFER:
    case UPDATE_BEADING:
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

        case GET_BEADING_SINGLE: {
          // ✅ response = master + acceptedVendor + vendorOffers (native query format)
          return {
            ...state,
            single: action.payload.data || null,
            singleLoading: false,
            error: false,
          };
        }

        case GET_VENDOR_OFFERS_BY_REQUEST: {
          return {
            ...state,
            vendorOffers: action.payload.data || [],
            vendorOffersLoading: false,
            error: false,
          };
        }

        case GET_VENDOR_OFFER_SINGLE: {
          return {
            ...state,
            vendorOfferSingle: action.payload.data || null,
            vendorOfferSingleLoading: false,
            error: false,
          };
        }

        case UPSERT_VENDOR_OFFER: {
          return {
            ...state,
            upsertVendorOfferResponse: true,
            loading: false,
            error: false,
          };
        }

        case UPDATE_VENDOR_OFFER: {
          return {
            ...state,
            updateVendorOfferResponse: true,
            loading: false,
            error: false,
          };
        }

        case DELETE_VENDOR_OFFER: {
          return {
            ...state,
            deleteVendorOfferResponse: true,
            loading: false,
            error: false,
          };
        }

        case ACCEPT_VENDOR_OFFER: {
          return {
            ...state,
            acceptVendorOfferResponse: true,
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
      // If you want different loading flags to stop, stop all commonly used ones
      return {
        ...state,
        updateBeadingResponse: null,
        upsertVendorOfferResponse: null,
        updateVendorOfferResponse: null,
        deleteVendorOfferResponse: null,
        acceptVendorOfferResponse: null,
        error: true,
        loading: false,
        singleLoading: false,
        vendorOffersLoading: false,
        vendorOfferSingleLoading: false,
      };

    case RESET_UPDATE_BEADING_RESPONSE:
      return {
        ...state,
        updateBeadingResponse: false,

        // ✅ reset new flags too
        upsertVendorOfferResponse: false,
        updateVendorOfferResponse: false,
        deleteVendorOfferResponse: false,
        acceptVendorOfferResponse: false,
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

// ✅ master single (your route: /beading/single/:id)
const getBeadingSingleApi = (id) => api.get(`/beading/single/${id}`);

// ✅ OLD (JSON) - REMOVE/STOP USING
// const updateBeadingApi = (data) => api.put("/beading/vendor-beadding", data);

// ✅ CHILD endpoints (new routes you created)
const upsertVendorOfferApi = (data) => api.create("/beading/vendor-offer", data);
const getVendorOffersByRequestApi = (beading_request_id) =>
  api.get(`/beading/${beading_request_id}/vendor-offers`);
const getVendorOfferSingleApi = (br_vendor_id) =>
  api.get(`/beading/vendor-offer/${br_vendor_id}`);
const updateVendorOfferApi = (data) => api.put("/beading/vendor-offer/update", data);
const deleteVendorOfferApi = (br_vendor_id) =>
  api.delete(`/beading/vendor-offer/delete/${br_vendor_id}`);

// ✅ accept vendor offer
const acceptVendorOfferApi = (data) => api.put("/beading/vendor-accept", data);

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

// ✅ Single request
function* getBeadingSingleSaga({ payload }) {
  try {
    const { id } = payload;
    const response = yield call(getBeadingSingleApi, id);
    yield put(beadingApiResponseSuccess(GET_BEADING_SINGLE, response, payload));
  } catch (error) {
    yield put(beadingApiResponseError(GET_BEADING_SINGLE, error));
    toast.error("Failed to fetch beading details!");
  }
}

// ✅ Upsert vendor offer
function* upsertVendorOfferSaga({ payload }) {
  try {
    const { offer } = payload; 
    const response = yield call(upsertVendorOfferApi, offer);
    yield put(beadingApiResponseSuccess(UPSERT_VENDOR_OFFER, response));

    toast.success("Offer saved successfully!");
  } catch (error) {
    console.log(error);
    
    yield put(beadingApiResponseError(UPSERT_VENDOR_OFFER, error));
    toast.error("Failed to save offer!");
  }
}

// ✅ Vendor offers list by request
function* getVendorOffersByRequestSaga({ payload }) {
  try {
    const { beading_request_id } = payload;
    const response = yield call(getVendorOffersByRequestApi, beading_request_id);
    yield put(
      beadingApiResponseSuccess(GET_VENDOR_OFFERS_BY_REQUEST, response, payload)
    );
  } catch (error) {
    yield put(beadingApiResponseError(GET_VENDOR_OFFERS_BY_REQUEST, error));
    toast.error("Failed to fetch vendor offers!");
  }
}

// ✅ Vendor offer single
function* getVendorOfferSingleSaga({ payload }) {
  try {
    const { br_vendor_id } = payload;
    const response = yield call(getVendorOfferSingleApi, br_vendor_id);
    yield put(beadingApiResponseSuccess(GET_VENDOR_OFFER_SINGLE, response, payload));
  } catch (error) {
    yield put(beadingApiResponseError(GET_VENDOR_OFFER_SINGLE, error));
    toast.error("Failed to fetch vendor offer!");
  }
}

// ✅ Vendor offer update
function* updateVendorOfferSaga({ payload }) {
  try {
    const { offer } = payload;
    const response = yield call(updateVendorOfferApi, offer);
    yield put(beadingApiResponseSuccess(UPDATE_VENDOR_OFFER, response));

    toast.success("Offer updated successfully!");
  } catch (error) {
    yield put(beadingApiResponseError(UPDATE_VENDOR_OFFER, error));
    toast.error("Failed to update offer!");
  }
}

// ✅ Vendor offer delete
function* deleteVendorOfferSaga({ payload }) {
  try {
    const { br_vendor_id } = payload;
    const response = yield call(deleteVendorOfferApi, br_vendor_id);
    yield put(beadingApiResponseSuccess(DELETE_VENDOR_OFFER, response));

    toast.success("Offer deleted successfully!");
  } catch (error) {
    yield put(beadingApiResponseError(DELETE_VENDOR_OFFER, error));
    toast.error("Failed to delete offer!");
  }
}

// ✅ Accept vendor offer
function* acceptVendorOfferSaga({ payload }) {
  try {
    const { data } = payload; // { beading_request_id, vendor_id }
    const response = yield call(acceptVendorOfferApi, data);
    yield put(beadingApiResponseSuccess(ACCEPT_VENDOR_OFFER, response));

    toast.success("Vendor accepted successfully!");
  } catch (error) {
    yield put(beadingApiResponseError(ACCEPT_VENDOR_OFFER, error));
    toast.error("Failed to accept vendor!");
  }
}

// ✅ Keep your existing update (if you still use it somewhere)
// NOTE: This was calling old /beading/vendor-beadding route.
// If you are no longer using this, remove UPDATE_BEADING everywhere.
function* updateBeadingSaga({ payload }) {
  try {
    const { beading } = payload;

    // ❌ Old route removed (JSON field)
    // const response = yield call(updateBeadingApi, beading);

    // ✅ If you still want UPDATE_BEADING for master update, then call master update API here.
    // Example: api.put("/beading/update", beading)
    const response = yield call((data) => api.put("/beading/update", data), beading);

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

function* watchGetBeadingSingle() {
  yield takeEvery(GET_BEADING_SINGLE, getBeadingSingleSaga);
}

function* watchUpsertVendorOffer() {
  yield takeEvery(UPSERT_VENDOR_OFFER, upsertVendorOfferSaga);
}

function* watchGetVendorOffersByRequest() {
  yield takeEvery(GET_VENDOR_OFFERS_BY_REQUEST, getVendorOffersByRequestSaga);
}

function* watchGetVendorOfferSingle() {
  yield takeEvery(GET_VENDOR_OFFER_SINGLE, getVendorOfferSingleSaga);
}

function* watchUpdateVendorOffer() {
  yield takeEvery(UPDATE_VENDOR_OFFER, updateVendorOfferSaga);
}

function* watchDeleteVendorOffer() {
  yield takeEvery(DELETE_VENDOR_OFFER, deleteVendorOfferSaga);
}

function* watchAcceptVendorOffer() {
  yield takeEvery(ACCEPT_VENDOR_OFFER, acceptVendorOfferSaga);
}

function* watchUpdateBeading() {
  yield takeEvery(UPDATE_BEADING, updateBeadingSaga);
}

// ================== ROOT SAGA ==================
export function* beadingSaga() {
  yield all([
    fork(watchGetBeadingList),
    fork(watchGetBeadingSingle),

    // ✅ child
    fork(watchUpsertVendorOffer),
    fork(watchGetVendorOffersByRequest),
    fork(watchGetVendorOfferSingle),
    fork(watchUpdateVendorOffer),
    fork(watchDeleteVendorOffer),
    
    // ✅ accept
    fork(watchAcceptVendorOffer),

    // ✅ existing master update (optional)
    fork(watchUpdateBeading),
  ]);
}