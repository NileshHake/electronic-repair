import { call, put, takeEvery, all, fork } from "redux-saga/effects";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Ecoomerce Redux States
import {
  GET_PRODUCTS,
  DELETE_PRODUCT,
  GET_ORDERS,
  GET_SELLERS,
  GET_CUSTOMERS,

  DELETE_ORDER,
  UPDATE_ORDER,
  ADD_NEW_ORDER,

  ADD_NEW_CUSTOMER,
  DELETE_CUSTOMER,
  UPDATE_CUSTOMER,

  ADD_NEW_PRODUCT,
  UPDATE_PRODUCT
} from "./actionType";

import {
  ecommerceApiResponseSuccess,
  ecommerceApiResponseError,
  deleteOrderSuccess,
  deleteOrderFail,
  updateOrderSuccess,
  updateOrderFail,
  addOrderSuccess,
  addOrderFail,
  addCustomerFail,
  addCustomerSuccess,
  updateCustomerSuccess,
  updateCustomerFail,
  deleteCustomerSuccess,
  deleteCustomerFail,
  deleteProductSuccess,
  deleteProductFail,
  addProductSuccess,
  addProductFail,
  updateProductSuccess,
  updateProductFail
} from "./action";

//Include Both Helper File with needed methods
import {
  getProducts as getProductsApi,
  deleteProducts as deleteProductsApi,
  getOrders as getOrdersApi,
  getSellers as getSellersApi,
   
  updateOrder,
  deleteOrder,
  addNewOrder,
  addNewCustomer,
  updateCustomer,
  deleteCustomer,
  addNewProduct,
  updateProduct
} from "../../helpers/fakebackend_helper";

function* getProducts() {
  try {
    const response = yield call(getProductsApi);
    yield put(ecommerceApiResponseSuccess(GET_PRODUCTS, response.data));
  } catch (error) {
    yield put(ecommerceApiResponseError(GET_PRODUCTS, error));
  }
}

function* getOrders() {
  try {
    const response = yield call(getOrdersApi);
    yield put(ecommerceApiResponseSuccess(GET_ORDERS, response.data));
  } catch (error) {
    yield put(ecommerceApiResponseError(GET_ORDERS, error));
  }
}

function* getSellers() {
  try {
    const response = yield call(getSellersApi);
    yield put(ecommerceApiResponseSuccess(GET_SELLERS, response));
  } catch (error) {
    yield put(ecommerceApiResponseError(GET_SELLERS, error));
  }
}

 
 

function* onAddNewProduct({ payload: product }) {
  try {
    const response = yield call(addNewProduct, product);
    yield put(addProductSuccess(response));
    toast.success("Product Added Successfully", { autoClose: 3000 });
  } catch (error) {
    yield put(addProductFail(error));
    toast.error("Product Added Failed", { autoClose: 3000 });
  }
}

 

function* onUpdateOrder({ payload: order }) {
  try {
    const response = yield call(updateOrder, order);
    yield put(updateOrderSuccess(response));
    toast.success("Order Updateded Successfully", { autoClose: 3000 });
  } catch (error) {
    yield put(updateOrderFail(error));
    toast.error("Order Updateded Failed", { autoClose: 3000 });
  }
}

function* onDeleteOrder({ payload: order }) {
  try {
    const response = yield call(deleteOrder, order);
    yield put(deleteOrderSuccess({ order, ...response }));
    toast.success("Order Deleted Successfully", { autoClose: 3000 });
  } catch (error) {
    yield put(deleteOrderFail(error));
    toast.error("Order Deleted Failed", { autoClose: 3000 });
  }
}

function* onAddNewOrder({ payload: order }) {
  try {
    const response = yield call(addNewOrder, order);
    yield put(addOrderSuccess(response));
    toast.success("Order Added Successfully", { autoClose: 3000 });
  } catch (error) {
    yield put(addOrderFail(error));
    toast.error("Order Added Failed", { autoClose: 3000 });
  }
}

 

 

export function* watchGetProducts() {
  yield takeEvery(GET_PRODUCTS, getProducts);
}

 
export function* watchGetOrders() {
  yield takeEvery(GET_ORDERS, getOrders);
}

export function* watchGetSellers() {
  yield takeEvery(GET_SELLERS, getSellers);
}

 

export function* watchUpdateOrder() {
  yield takeEvery(UPDATE_ORDER, onUpdateOrder);
}

export function* watchDeleteOrder() {
  yield takeEvery(DELETE_ORDER, onDeleteOrder);
}

export function* watchAddNewOrder() {
  yield takeEvery(ADD_NEW_ORDER, onAddNewOrder);
}

 

 

 

export function* watchAddNewProduct() {
  yield takeEvery(ADD_NEW_PRODUCT, onAddNewProduct);
}

function* ecommerceSaga() {
  yield all([
    fork(watchGetProducts), 
    fork(watchGetOrders),
    fork(watchGetSellers),
    
    fork(watchDeleteOrder),
    fork(watchUpdateOrder),
    fork(watchAddNewOrder),
   
     
 
    fork(watchAddNewProduct),
  ]);
}

export default ecommerceSaga;
