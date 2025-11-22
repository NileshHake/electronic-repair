import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_BRANDS = "GET_BRANDS";
export const ADD_BRAND = "ADD_BRAND";
export const UPDATE_BRAND = "UPDATE_BRAND";
export const DELETE_BRAND = "DELETE_BRAND";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const brandApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const brandApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const getBrandsList = () => ({ type: GET_BRANDS });
export const addBrand = (brand) => ({ type: ADD_BRAND, payload: { brand } });
export const updateBrand = (brand) => ({ type: UPDATE_BRAND, payload: { brand } });
export const deleteBrand = (id) => ({ type: DELETE_BRAND, payload: id });

// ================== REDUCER ==================
const INIT_STATE = {
  brands: [],
  loading: true,
  error: false,
};

export const BrandReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_BRANDS:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_BRANDS:
          return { ...state, brands: action.payload.data, loading: false };

        case ADD_BRAND:
          return {
            ...state,
            brands: [...state.brands, action.payload.data],
            loading: false,
          };

        case UPDATE_BRAND:
          return {
            ...state,
            brands: state.brands.map((b) =>
              b.brand_id === action.payload.data.brand_id
                ? action.payload.data
                : b
            ),
            loading: false,
          };

        case DELETE_BRAND:
          return {
            ...state,
            brands: state.brands.filter(
              (b) => b.brand_id !== action.payload.data
            ),
            loading: false,
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

// ================== API CALLS ==================
const api = new APIClient();

const getBrandsApi = () => api.get("/brand/list");
const addBrandApi = (data) => api.create("/brand/store", data);
const updateBrandApi = (data) => api.put("/brand/update", data);
const deleteBrandApi = (id) => api.delete(`/brand/delete/${id}`);

// ================== SAGAS ==================
function* getBrandsListSaga() {
  try {
    const response = yield call(getBrandsApi);
    yield put(brandApiResponseSuccess(GET_BRANDS, response));
  } catch (error) {
    yield put(brandApiResponseError(GET_BRANDS, error));
    toast.error("Failed to load brand list!");
  }
}

function* addBrandSaga({ payload }) {
  try {
    const { brand } = payload;
    const response = yield call(addBrandApi, brand);
    yield put(brandApiResponseSuccess(ADD_BRAND, response));
    yield call(getBrandsListSaga);
    toast.success("Brand added successfully!");
  } catch (error) {
    yield put(brandApiResponseError(ADD_BRAND, error));
    toast.error("Failed to add brand!");
  }
}

function* updateBrandSaga({ payload }) {
  try {
    const { brand } = payload;
    const response = yield call(updateBrandApi, brand);
    yield put(brandApiResponseSuccess(UPDATE_BRAND, response));
    yield call(getBrandsListSaga);
    toast.success("Brand updated successfully!");
  } catch (error) {
    yield put(brandApiResponseError(UPDATE_BRAND, error));
    toast.error("Failed to update brand!");
  }
}

function* deleteBrandSaga({ payload }) {
  try {
    yield call(deleteBrandApi, payload);
    yield put(brandApiResponseSuccess(DELETE_BRAND, { data: payload }));
    yield call(getBrandsListSaga);
    toast.success("Brand deleted successfully!");
  } catch (error) {
    yield put(brandApiResponseError(DELETE_BRAND, error));
    toast.error("Failed to delete brand!");
  }
}

// ================== WATCHERS ==================
function* watchGetBrands() {
  yield takeEvery(GET_BRANDS, getBrandsListSaga);
}
function* watchAddBrand() {
  yield takeEvery(ADD_BRAND, addBrandSaga);
}
function* watchUpdateBrand() {
  yield takeEvery(UPDATE_BRAND, updateBrandSaga);
}
function* watchDeleteBrand() {
  yield takeEvery(DELETE_BRAND, deleteBrandSaga);
}

// ================== ROOT SAGA ==================
export function* brandSaga() {
  yield all([
    fork(watchGetBrands),
    fork(watchAddBrand),
    fork(watchUpdateBrand),
    fork(watchDeleteBrand),
  ]);
}
