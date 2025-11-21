import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";
import { categories } from "../../common/data/jobLanding";

// ================== ACTION TYPES ==================
export const GET_CATEGORIES = "GET_CATEGORIES";
export const ADD_CATEGORY = "ADD_CATEGORY";
export const UPDATE_CATEGORY = "UPDATE_CATEGORY";
export const DELETE_CATEGORY = "DELETE_CATEGORY";
export const RESET_ADD_CATEGORY_RESPONSE = "RESET_ADD_CATEGORY_RESPONSE";
export const RESET_UPDATE_CATEGORY_RESPONSE = "RESET_UPDATE_CATEGORY_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const categoryApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const categoryApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddCategoryResponse = () => ({
  type: RESET_ADD_CATEGORY_RESPONSE,
});

export const resetUpdateCategoryResponse = () => ({
  type: RESET_UPDATE_CATEGORY_RESPONSE,
});

export const getCategoriesList = () => ({
  type: GET_CATEGORIES,
});

export const addCategory = (category) => ({
  type: ADD_CATEGORY,
  payload: { category },
});

export const updateCategory = (category) => ({
  type: UPDATE_CATEGORY,
  payload: { category },
});

export const deleteCategory = (id) => ({
  type: DELETE_CATEGORY,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  categories: [],
  loading: true,
  error: false,
  addCategoryResponse: false,
  updateCategoryResponse: false,
};

export const CategoryReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_CATEGORIES:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_CATEGORIES:
          return {
            ...state,
            categories: action.payload.data,
            loading: false,
            error: false,
          };

        case ADD_CATEGORY:
          return {
            ...state,
            addCategoryResponse: true,
            categories: [...state.categories, action.payload.data],
            loading: false,
            error: false,
          };

        case UPDATE_CATEGORY:
          return {
            ...state,
            updateCategoryResponse: true,
            categories: state.categories.map((c) =>
              c.category_id === action.payload.data.category_id
                ? action.payload.data
                : c
            ),
            loading: false,
            error: false,
          };

       case DELETE_CATEGORY: {
  const categoryId = action.payload;
  return categories.filter(
    (category) => category.category_id !== categoryId
  );
}


        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return {
        ...state,
        addCategoryResponse: null,
        error: true,
      };

    case RESET_ADD_CATEGORY_RESPONSE:
      return {
        ...state,
        addCategoryResponse: false,
      };

    case RESET_UPDATE_CATEGORY_RESPONSE:
      return {
        ...state,
        updateCategoryResponse: false,
      };

    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

const getCategoriesApi = () => api.get("/category/list");
const addCategoryApi = (data) => api.create("/category/store", data);
const updateCategoryApi = (data) => api.put("/category/update", data);
const deleteCategoryApi = (id) => api.delete(`/category/delete/${id}`);

// ================== SAGAS ==================

// Get All Categories
function* getCategoriesListSaga() {
  try {
    const response = yield call(getCategoriesApi);
    yield put(categoryApiResponseSuccess(GET_CATEGORIES, response));
  } catch (error) {
    yield put(categoryApiResponseError(GET_CATEGORIES, error));
    toast.error("Failed to fetch category list!");
  }
}

// Add Category
function* addCategorySaga({ payload }) {
  try {
    const { category } = payload;
    const response = yield call(addCategoryApi, category);   
    yield put(categoryApiResponseSuccess(ADD_CATEGORY, response));
    yield call(getCategoriesListSaga);
    toast.success("Category added successfully!");
  } catch (error) {
    yield put(categoryApiResponseError(ADD_CATEGORY, error));
    toast.error("Failed to add category!");
  }
}

// Update Category
function* updateCategorySaga({ payload }) {
  try {
    const { category } = payload;
    const response = yield call(updateCategoryApi, category);
    yield put(categoryApiResponseSuccess(UPDATE_CATEGORY, response));
    yield call(getCategoriesListSaga);
    toast.success("Category updated successfully!");
  } catch (error) {
    yield put(categoryApiResponseError(UPDATE_CATEGORY, error));
    toast.error("Failed to update category!");
  }
}

// Delete Category
function* deleteCategorySaga({ payload }) {
  try {
    yield call(deleteCategoryApi, payload);
    // put success with deleted id so reducer can remove it quickly
    yield put(categoryApiResponseSuccess(DELETE_CATEGORY, { data: payload }));
    yield call(getCategoriesListSaga);
    toast.success("Category deleted successfully!");
  } catch (error) {
    yield put(categoryApiResponseError(DELETE_CATEGORY, error));
    toast.error("Failed to delete category!");
  }
}

// ================== WATCHERS ==================
function* watchGetCategories() {
  yield takeEvery(GET_CATEGORIES, getCategoriesListSaga);
}

function* watchAddCategory() {
  yield takeEvery(ADD_CATEGORY, addCategorySaga);
}

function* watchUpdateCategory() {
  yield takeEvery(UPDATE_CATEGORY, updateCategorySaga);
}

function* watchDeleteCategory() {
  yield takeEvery(DELETE_CATEGORY, deleteCategorySaga);
}

// ================== ROOT SAGA ==================
export function* categorySaga() {
  yield all([
    fork(watchGetCategories),
    fork(watchAddCategory),
    fork(watchUpdateCategory),
    fork(watchDeleteCategory),
  ]);
}
