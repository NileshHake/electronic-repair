import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_USERS = "GET_USERS";
export const ADD_USER = "ADD_USER";
export const UPDATE_USER = "UPDATE_USER";
export const UPDATE_USER_PASS_WORD = "UPDATE_USER_PASS_WORD";
export const DELETE_USER = "DELETE_USER";
export const GET_SINGLE_USER = "GET_SINGLE_USER";
export const RESET_ADD_USER_RESPONSE = "RESET_ADD_USER_RESPONSE";
export const RESET_UPDATE_USER_RESPONSE = "RESET_UPDATE_USER_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";
// ================== ACTION TYPES ==================
export const UPDATE_USER_PASSWORD = "UPDATE_USER_PASSWORD";
export const UPDATE_USER_PASSWORD_SUCCESS = "UPDATE_USER_PASSWORD_SUCCESS";
export const UPDATE_USER_PASSWORD_FAIL = "UPDATE_USER_PASSWORD_FAIL";

// ================== ACTIONS ==================
export const userApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const userApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddUserResponse = () => ({
  type: RESET_ADD_USER_RESPONSE,
});

export const resetUpdateUserResponse = () => ({
  type: RESET_UPDATE_USER_RESPONSE,
});

export const getUsersList = () => ({
  type: GET_USERS,
});

export const getSingleUser = (id) => {
  return {
    type: GET_SINGLE_USER,
    payload: id,
  };
};

export const addUser = (user) => ({
  type: ADD_USER,
  payload: user,
});

export const updateUser = (user) => ({
  type: UPDATE_USER,
  payload: user,
});
// ================== ACTION ==================
export const updatePassword = (payload) => ({
  type: UPDATE_USER_PASSWORD,
  payload,
});


export const deleteUser = (id) => ({
  type: DELETE_USER,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  users: [],
  singleUser: null,
  loading: true,
  error: false,
  addUserResponse: false,
  updateUserResponse: false,
};

export const UserReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_USERS:
    case GET_SINGLE_USER:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_USERS:
          return { ...state, users: action.payload.data, loading: false };
        case GET_SINGLE_USER:
          return { ...state, singleUser: action.payload.data, loading: false };
        case ADD_USER:
          return {
            ...state,
            addUserResponse: true,
            users: [...state.users, action.payload.data],
          };
        case UPDATE_USER:
          return {
            ...state,
            updateUserResponse: true,
            users: state.users.map((u) =>
              u.user_id === action.payload.data.user_id
                ? action.payload.data
                : u
            ),
          };
        case DELETE_USER:
          return {
            ...state,
            users: state.users.filter((u) => u.user_id !== action.payload.data),
          };
        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true, loading: false };
    case RESET_ADD_USER_RESPONSE:
      return { ...state, addUserResponse: false };
    case RESET_UPDATE_USER_RESPONSE:
      return { ...state, updateUserResponse: false };
    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

const getUsersApi = () => api.get("/user/user/list");
const getSingleUserApi = (id) => api.get(`/user/single/${id}`);

const addUserApi = (formData) => {
  return api.create(`/user/store`, formData);
};
const ChangePassword = (formData) => {
  return api.create(`/change-password`, formData);
};

const updateUserApi = (id, data) => api.put(`/user/update`, data);
const deleteUserApi = (id) => api.delete(`/user/delete/${id}`);

// ================== SAGAS ==================
function* getUsersListSaga() {
  try {
    const response = yield call(getUsersApi);
    yield put(userApiResponseSuccess(GET_USERS, response));
  } catch (error) {
    yield put(userApiResponseError(GET_USERS, error));
    toast.error("Failed to fetch users!");
  }
}

function* getSingleUserSaga({ payload }) {
  try {
    const response = yield call(getSingleUserApi, payload);
    yield put(userApiResponseSuccess(GET_SINGLE_USER, response));
  } catch (error) {
    yield put(userApiResponseError(GET_SINGLE_USER, error));
    toast.error("Failed to fetch user details!");
  }
}

function* addUserSaga({ payload }) {
  try {
    let response;

    if (payload.user_profile && payload.user_profile instanceof File) {
      const formData = new FormData();
      for (const key in payload) {
        formData.append(key, payload[key]);
      }

      response = yield call(addUserApi, formData);
    } else {
      response = yield call(api.create, `/user/store`, payload);
    }

    yield put(userApiResponseSuccess(ADD_USER, response));
    yield call(getUsersListSaga);
    toast.success(" User added successfully!");
  } catch (error) {
    console.error("❌ Error in addUserSaga:", error);
    yield put(userApiResponseError(ADD_USER, error));
    toast.error("❌ Failed to add user!");
  }
}

function* updateUserSaga({ payload }) {
  try {
    let response;
    if (payload.user_profile && payload.user_profile instanceof File) {
      const formData = new FormData();
      for (const key in payload) {
        formData.append(key, payload[key]);
      }
      response = yield call(api.putFormData, `/user/update`, formData);
    } else {
      response = yield call(api.put, `/user/update`, payload);
    }

    yield put(userApiResponseSuccess(UPDATE_USER, response));
    yield call(getUsersListSaga);
    toast.success(" User updated successfully!");
  } catch (error) {
    console.error("❌ Error in updateUserSaga:", error);
    yield put(userApiResponseError(UPDATE_USER, error));
    toast.error("❌ Failed to update user!");
  }
}
function* updateUserPasswordSaga({ payload }) {
  try {
    const response = yield call(ChangePassword, payload);

    yield put({
      type: UPDATE_USER_PASSWORD_SUCCESS,
      payload: response.data,
    });

    toast.success(response.data?.message || "Password updated!");

  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to update password");

    yield put({
      type: UPDATE_USER_PASSWORD_FAIL,
      payload: error,
    });
  }
}

function* deleteUserSaga({ payload }) {
  try {
    yield call(deleteUserApi, payload);
    yield put(userApiResponseSuccess(DELETE_USER, { data: payload }));
    yield call(getUsersListSaga);
    toast.success("🗑️ User deleted successfully!");
  } catch (error) {
    yield put(userApiResponseError(DELETE_USER, error));
    toast.error("❌ Failed to delete user!");
  }
}

// ================== WATCHERS ==================
function* watchGetUsers() {
  yield takeEvery(GET_USERS, getUsersListSaga);
}
function* watchGetSingleUser() {
  yield takeEvery(GET_SINGLE_USER, getSingleUserSaga);
}
function* watchAddUser() {
  yield takeEvery(ADD_USER, addUserSaga);
}
function* watchUpdateUser() {
  yield takeEvery(UPDATE_USER, updateUserSaga);
}
function* watchDeleteUser() {
  yield takeEvery(DELETE_USER, deleteUserSaga);
}
function* watchUpdateUserPassword() {
  yield takeEvery(UPDATE_USER_PASSWORD, updateUserPasswordSaga);
}

export function* userSaga() {
  yield all([
    fork(watchGetUsers),
    fork(watchGetSingleUser),
    fork(watchAddUser),
    fork(watchUpdateUser),
    fork(watchDeleteUser),
    fork(watchUpdateUserPassword),
  ]);
}
