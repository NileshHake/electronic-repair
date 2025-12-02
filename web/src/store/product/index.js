import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_PRODUCT = "GET_PRODUCT";
export const ADD_PRODUCT = "ADD_PRODUCT";
export const UPDATE_PRODUCT = "UPDATE_PRODUCT";
export const DELETE_PRODUCT = "DELETE_PRODUCT";
export const GET_SINGLE_PRODUCT = "GET_SINGLE_PRODUCT";
export const RESET_ADD_PRODUCT_RESPONSE = "RESET_ADD_PRODUCT_RESPONSE";
export const RESET_UPDATE_PRODUCT_RESPONSE = "RESET_UPDATE_PRODUCT_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const productApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const productApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddProductResponse = () => ({
  type: RESET_ADD_PRODUCT_RESPONSE,
});

export const resetUpdateProductResponse = () => ({
  type: RESET_UPDATE_PRODUCT_RESPONSE,
});

export const getProductList = () => ({
  type: GET_PRODUCT,
});

export const getSingleProduct = (id) => ({
  type: GET_SINGLE_PRODUCT,
  payload: id,
});

export const addProduct = (product) => ({
  type: ADD_PRODUCT,
  payload: product,
});

export const updateProduct = (product) => ({
  type: UPDATE_PRODUCT,
  payload: product,
});

export const deleteProduct = (id) => ({
  type: DELETE_PRODUCT,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  products: [],
  singleProduct: null,
  loading: true,
  error: false,
  addProductResponse: false,
  updateProductResponse: false,
};

export const ProductReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_PRODUCT:
    case GET_SINGLE_PRODUCT:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_PRODUCT:
          return { ...state, products: action.payload.data, loading: false };

        case GET_SINGLE_PRODUCT:
          return {
            ...state,
            singleProduct: action.payload.data,
            loading: false,
          };

        case ADD_PRODUCT:
          return {
            ...state,
            addProductResponse: true,
            products: [...state.products, action.payload.data],
          };

        case UPDATE_PRODUCT:
          return {
            ...state,
            updateProductResponse: true,
            products: state.products.map((p) =>
              p.product_id === action.payload.data.product_id
                ? action.payload.data
                : p
            ),
          };

        case DELETE_PRODUCT:
          return {
            ...state,
            products: state.products.filter(
              (p) => p.product_id !== action.payload.data
            ),
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true, loading: false };

    case RESET_ADD_PRODUCT_RESPONSE:
      return { ...state, addProductResponse: false };

    case RESET_UPDATE_PRODUCT_RESPONSE:
      return { ...state, updateProductResponse: false };

    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

const getProductApi = () => api.get("/product/list");
const getSingleProductApi = (id) => api.get(`/product/single/${id}`);
const addProductApi = (formData) => api.create(`/product/store`, formData);
const updateProductApi = (data) => api.put(`/product/update`, data);
const deleteProductApi = (id) => api.delete(`/product/delete/${id}`);

// ================== SAGAS ==================
function* getProductListSaga() {
  try {
    const response = yield call(getProductApi);
    yield put(productApiResponseSuccess(GET_PRODUCT, response));
  } catch (error) {
    yield put(productApiResponseError(GET_PRODUCT, error));
    toast.error("Failed to fetch products!");
  }
}

function* getSingleProductSaga({ payload }) {
  try {
    const response = yield call(getSingleProductApi, payload);
    yield put(productApiResponseSuccess(GET_SINGLE_PRODUCT, response));
  } catch (error) {
    yield put(productApiResponseError(GET_SINGLE_PRODUCT, error));
    toast.error("Failed to fetch product details!");
  }
}

function* addProductSaga({ payload }) {
  try {
    let response;

    // If payload contains file(s), send multipart/form-data
    if (payload.product_image && payload.product_image.length > 0) {
      const formData = new FormData();

      const fields = [
        "product_name",
        "product_tax",
        "product_brand",
        "product_created_by",
        "product_category",
        "product_purchase_price",
        "product_sale_price",
        "product_mrp",
        "product_status",
      ];

      fields.forEach((key) => formData.append(key, payload[key] || ""));

      payload.product_image.forEach((file) => {
        formData.append("product_img", file);
      });

       
      response = yield call(addProductApi, formData);
    } else {
      
      response = yield call(api.create, `/product/store`, payload);
    }

    yield put(productApiResponseSuccess(ADD_PRODUCT, response));
    yield call(getProductListSaga);
    toast.success("  Product added successfully!");
  } catch (error) {
    console.error("❌ Error in addProductSaga:", error);
    yield put(productApiResponseError(ADD_PRODUCT, error));
    toast.error("Failed to add product!");
  }
}

function* updateProductSaga({ payload }) {
  try {
    // payload is already FormData from your modal
    const response = yield call(api.putFormData, `/product/update`, payload);

    yield put(productApiResponseSuccess(UPDATE_PRODUCT, response));
    yield call(getProductListSaga);
    toast.success("  Product updated successfully!");
  } catch (error) {
    console.error("❌ Error in updateProductSaga:", error);
    yield put(productApiResponseError(UPDATE_PRODUCT, error));
    toast.error("Failed to update product!");
  }
}


function* deleteProductSaga({ payload }) {
  try {
    yield call(deleteProductApi, payload);
    yield put(productApiResponseSuccess(DELETE_PRODUCT, { data: payload }));
    yield call(getProductListSaga);
    toast.success("  Product deleted successfully!");
  } catch (error) {
    yield put(productApiResponseError(DELETE_PRODUCT, error));
    toast.error("Failed to delete product!");
  }
}

// ================== WATCHERS ==================
function* watchGetProduct() {
  yield takeEvery(GET_PRODUCT, getProductListSaga);
}
function* watchGetSingleProduct() {
  yield takeEvery(GET_SINGLE_PRODUCT, getSingleProductSaga);
}
function* watchAddProduct() {
  yield takeEvery(ADD_PRODUCT, addProductSaga);
}
function* watchUpdateProduct() {
  yield takeEvery(UPDATE_PRODUCT, updateProductSaga);
}
function* watchDeleteProduct() {
  yield takeEvery(DELETE_PRODUCT, deleteProductSaga);
}

// ================== ROOT SAGA ==================
export function* productSaga() {
  yield all([
    fork(watchGetProduct),
    fork(watchGetSingleProduct),
    fork(watchAddProduct),
    fork(watchUpdateProduct),
    fork(watchDeleteProduct),
  ]);
}
