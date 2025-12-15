import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ============= ACTION TYPES =============
export const GET_CART = "GET_CART";
export const ADD_TO_CART = "ADD_TO_CART";
export const UPDATE_CART = "UPDATE_CART";
export const DELETE_CART = "DELETE_CART";

export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ============= ACTIONS =============
export const cartApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const cartApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const getCart = () => ({ type: GET_CART });

export const addToCart = (item) => ({
  type: ADD_TO_CART,
  payload: { item },
});

export const updateCart = (item) => ({
  type: UPDATE_CART,
  payload: { item },
});

export const deleteCart = (id) => ({
  type: DELETE_CART,
  payload: id,
});

// ============= REDUCER =============
const INIT_STATE = {
  cart: [],
  loading: true,
  error: false,
};

export const CartReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_CART:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_CART:
          return {
            ...state,
            cart: action.payload.data,
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true };

    default:
      return state;
  }
};

// ============= API CALLS =============
const api = new APIClient();

const getCartApi = () => api.get("/add-to-cart/list");
const addToCartApi = (data) => api.create("/add-to-cart/store", data);
const updateCartApi = (data) => api.put("/add-to-cart/update", data);
const deleteCartApi = (id) => api.delete(`/add-to-cart/delete/${id}`);

// ============= SAGAS =============
function* getCartSaga() {
  try {
    const response = yield call(getCartApi);
    yield put(cartApiResponseSuccess(GET_CART, response));
  } catch (error) {
    yield put(cartApiResponseError(GET_CART, error));
    toast.error("Failed to fetch cart!");
  }
}

function* addToCartSaga({ payload }) {
  try {
    const { item } = payload;
    yield call(addToCartApi, item);
    yield call(getCartSaga);
    toast.success("Added to cart!");
  } catch (error) {
    yield put(cartApiResponseError(ADD_TO_CART, error));
    toast.error("Failed to add!");
  }
}

function* updateCartSaga({ payload }) {
  try {
    const { item } = payload;
    yield call(updateCartApi, item);
    yield call(getCartSaga);
    toast.success("Cart updated!");
  } catch (error) {
    yield put(cartApiResponseError(UPDATE_CART, error));
    toast.error("Failed to update!");
  }
}

function* deleteCartSaga({ payload }) {
  try {
    yield call(deleteCartApi, payload);
    yield call(getCartSaga);
    toast.success("Removed from cart!");
  } catch (error) {
    yield put(cartApiResponseError(DELETE_CART, error));
    toast.error("Failed to delete!");
  }
}

// ============= WATCHERS =============
function* watchGetCart() {
  yield takeEvery(GET_CART, getCartSaga);
}

function* watchAddToCart() {
  yield takeEvery(ADD_TO_CART, addToCartSaga);
}

function* watchUpdateCart() {
  yield takeEvery(UPDATE_CART, updateCartSaga);
}

function* watchDeleteCart() {
  yield takeEvery(DELETE_CART, deleteCartSaga);
}

// ============= ROOT SAGA =============
export function* cartSaga() {
  yield all([
    fork(watchGetCart),
    fork(watchAddToCart),
    fork(watchUpdateCart),
    fork(watchDeleteCart),
  ]);
}
