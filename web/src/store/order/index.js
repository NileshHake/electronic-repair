import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

/* ================== ACTION TYPES ================== */
const GET_ORDERS = "GET_ORDERS";
const UPDATE_ORDER_STATUS_ADMIN = "UPDATE_ORDER_STATUS_ADMIN";
const GET_ORDER_CHILD_LIST = "GET_ORDER_CHILD_LIST";
const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

/* ================== ACTIONS ================== */
export const orderApiResponseSuccess = (actionType, data, meta = {}) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data, meta },
});

export const orderApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

// Get Orders List
export const getOrdersList = (filterData) => ({
  type: GET_ORDERS,
  payload: filterData, // { status, page, limit }
});

// Update Order Status
export const updateOrderStatusAdmin = (order) => ({
  type: UPDATE_ORDER_STATUS_ADMIN,
  payload: order,
});

// Get Order Child List
export const getOrderChildList = (data) => ({
  type: GET_ORDER_CHILD_LIST,
  payload: data,
});

/* ================== REDUCER ================== */
const INIT_STATE = {
  orders: [],
  orderItems: [],
  loading: false,
  error: false,
  updateResponse: false,

  currentStatus: null, // 🔥 store status
  currentPage: 1,      // 🔥 store page
};

export const OrderReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_ORDERS:
    case GET_ORDER_CHILD_LIST:
    case UPDATE_ORDER_STATUS_ADMIN:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {

        /* ========== GET ORDERS (STATUS + PAGINATION LOGIC) ========== */
        case GET_ORDERS: {
          const { status, page } = action.payload.meta;
          const newOrders = action.payload.data;

          // 🔴 STATUS CHANGED → RESET DATA
          if (state.currentStatus !== status) {
            return {
              ...state,
              orders: newOrders,
              currentStatus: status,
              currentPage: page,
              loading: false,
              error: false,
            };
          }

          // 🟡 SAME STATUS
          // Page 1 → replace
          if (page === 1) {
            return {
              ...state,
              orders: newOrders,
              currentPage: page,
              loading: false,
              error: false,
            };
          }

          // Page > 1 → merge
          return {
            ...state,
            orders: [...state.orders, ...newOrders],
            currentPage: page,
            loading: false,
            error: false,
          };
        }

        case UPDATE_ORDER_STATUS_ADMIN:
          return {
            ...state,
            updateResponse: true,
            loading: false,
            error: false,
          };

        case GET_ORDER_CHILD_LIST:
          return {
            ...state,
            orderItems: action.payload.data,
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, loading: false, error: true };

    default:
      return state;
  }
};

/* ================== API CLIENT ================== */
const api = new APIClient();

const getOrdersApi = (data) => api.create("/order/list", data);
const updateOrderApi = (data) => api.put("/order/master-update", data);
const getOrderChildApi = (data) => api.create("/order/child-list", data);

/* ================== SAGAS ================== */

// Get Orders
function* getOrdersSaga({ payload }) {
  try {
    const response = yield call(getOrdersApi, payload);

    yield put(
      orderApiResponseSuccess(
        GET_ORDERS,
        response,
        {
          status: payload.status,
          page: payload.page || 1,
        }
      )
    );
  } catch (error) {
    yield put(orderApiResponseError(GET_ORDERS, error));
    toast.error("Failed to fetch orders");
  }
}

// Update Order Status
function* updateOrderStatusAdminSaga({ payload }) {
  try {
    yield call(updateOrderApi, payload);
    yield put(orderApiResponseSuccess(UPDATE_ORDER_STATUS_ADMIN, true));
    toast.success("Order status updated successfully");
  } catch (error) {
    yield put(orderApiResponseError(UPDATE_ORDER_STATUS_ADMIN, error));
    toast.error("Failed to update order");
  }
}

// Get Order Child List
function* getOrderChildSaga({ payload }) {
  try {
    const response = yield call(getOrderChildApi, payload);
    yield put(orderApiResponseSuccess(GET_ORDER_CHILD_LIST, response));
  } catch (error) {
    yield put(orderApiResponseError(GET_ORDER_CHILD_LIST, error));
    toast.error("Failed to fetch order items");
  }
}

/* ================== WATCHERS ================== */
function* watchGetOrders() {
  yield takeEvery(GET_ORDERS, getOrdersSaga);
}

function* watchUpdateOrderStatusAdmin() {
  yield takeEvery(UPDATE_ORDER_STATUS_ADMIN, updateOrderStatusAdminSaga);
}

function* watchGetOrderChild() {
  yield takeEvery(GET_ORDER_CHILD_LIST, getOrderChildSaga);
}

/* ================== ROOT SAGA ================== */
export function* orderSaga() {
  yield all([
    fork(watchGetOrders),
    fork(watchUpdateOrderStatusAdmin),
    fork(watchGetOrderChild),
  ]);
}
