import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_ROLE = "GET_ROLE";
export const ADD_ROLE = "ADD_ROLE";
export const UPDATE_ROLE = "UPDATE_ROLE";
export const DELETE_ROLE = "DELETE_ROLE";
export const GET_SINGLE_ROLE = "GET_SINGLE_ROLE";
export const GET_OLD_PERMISSIONS = "GET_OLD_PERMISSIONS";
export const GET_ROLE_PERMISSIONS = "GET_ROLE_PERMISSIONS";
export const GET_ASSIGNED_PERMISSIONS = "GET_ASSIGNED_PERMISSIONS"; // ✅ NEW
export const RESET_ROLE = "RESET_ROLE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";
export const RESET_ADD_ROLE_RESPONSE = "RESET_ADD_ROLE_RESPONSE";
export const RESET_UPDATE_ROLE_RESPONSE = "RESET_UPDATE_ROLE_RESPONSE";
export const LOADING_START = "LOADING_START";
export const LOADING_STOP = "LOADING_STOP";

// ================== ACTION CREATORS ==================
export const getRole = () => ({ type: GET_ROLE });
export const getSingleRole = (id) => ({ type: GET_SINGLE_ROLE, payload: id });
export const getOldRolePermissions = (id) => ({
  type: GET_OLD_PERMISSIONS,
  payload: id,
});
export const getRolePermissions = () => ({ type: GET_ROLE_PERMISSIONS });
export const getAssignedPermissions = (id) => ({
   
  type: GET_ASSIGNED_PERMISSIONS,
  payload: id,
});
export const addRole = (data) => ({ type: ADD_ROLE, payload: data });
export const updateRole = (data) => ({ type: UPDATE_ROLE, payload: data });
export const deleteRole = (id) => ({ type: DELETE_ROLE, payload: id });
export const resetRole = () => ({ type: RESET_ROLE });
export const resetAddRoleResponse = () => ({ type: RESET_ADD_ROLE_RESPONSE });
export const resetUpdateRoleResponse = () => ({
  type: RESET_UPDATE_ROLE_RESPONSE,
});

// ================== INITIAL STATE ==================
const INIT_STATE = {
  roles: [],
  role: null,
  rolePermissions: [],
  oldrolePermissions: [],
  assignedPermissions: [], // ✅ NEW STATE
  loading: false,
  error: null,
  addRoleResponse: false,
  updateRoleResponse: false,
};

// ================== REDUCER ==================
export const roleReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case LOADING_START:
      return { ...state, loading: true };
    case LOADING_STOP:
      return { ...state, loading: false };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_ROLE:
          return { ...state, roles: action.payload.data, loading: false };
        case GET_SINGLE_ROLE:
          return { ...state, role: action.payload.data, loading: false };
        case GET_OLD_PERMISSIONS:
          return {
            ...state,
            oldrolePermissions: action.payload.data,
            loading: false,
          };
        case GET_ROLE_PERMISSIONS:
          return {
            ...state,
            rolePermissions: action.payload.data,
            loading: false,
          };
        case GET_ASSIGNED_PERMISSIONS: // ✅ NEW
          return {
            ...state,
            assignedPermissions: action.payload.data,
            loading: false,
          };
        case ADD_ROLE:
          return { ...state, addRoleResponse: true, loading: false };
        case UPDATE_ROLE:
          return { ...state, updateRoleResponse: true, loading: false };
        case DELETE_ROLE:
          return { ...state, loading: false };
        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: action.payload, loading: false };

    case RESET_ADD_ROLE_RESPONSE:
      return { ...state, addRoleResponse: false };
    case RESET_UPDATE_ROLE_RESPONSE:
      return { ...state, updateRoleResponse: false };
    case RESET_ROLE:
      return { ...INIT_STATE };

    default:
      return state;
  }
};

// ================== SAGAS ==================
const api = new APIClient();

// ✅ 1. Get All Roles
function* getRoles() {
  try {
    yield put({ type: LOADING_START });
    const response = yield call(api.get, "/role/list");
    yield put({
      type: API_RESPONSE_SUCCESS,
      payload: { actionType: GET_ROLE, data: response },
    });
  } catch (error) {
    yield put({ type: API_RESPONSE_ERROR, payload: error });
  } finally {
    yield put({ type: LOADING_STOP });
  }
}

// ✅ 2. Get Role Permissions (All)
function* getRolePermissionsSaga() {
  try {
    yield put({ type: LOADING_START });
    const response = yield call(api.get, "/permissions");
    yield put({
      type: API_RESPONSE_SUCCESS,
      payload: { actionType: GET_ROLE_PERMISSIONS, data: response },
    });
  } catch (error) {
    yield put({ type: API_RESPONSE_ERROR, payload: error });
  } finally {
    yield put({ type: LOADING_STOP });
  }
}

// ✅ 3. Get Old Permissions (For Editing)
function* getOldRolePermissionsSaga({ payload }) {
  try {
    yield put({ type: LOADING_START });
    const response = yield call(api.get, `/get/permissions/${payload}`);
    yield put({
      type: API_RESPONSE_SUCCESS,
      payload: { actionType: GET_OLD_PERMISSIONS, data: response },
    });
  } catch (error) {
    yield put({ type: API_RESPONSE_ERROR, payload: error });
  } finally {
    yield put({ type: LOADING_STOP });
  }
}

// ✅ 4. Get Assigned Permissions (NEW)
function* getAssignedPermissionsSaga({ payload }) {
  try {
    yield put({ type: LOADING_START });
    const response = yield call(
      api.get,
      `/get/assigned/permissions/${payload}`
    );
    yield put({
      type: API_RESPONSE_SUCCESS,
      payload: { actionType: GET_ASSIGNED_PERMISSIONS, data: response },
    });
  } catch (error) {
    yield put({ type: API_RESPONSE_ERROR, payload: error });
  } finally {
    yield put({ type: LOADING_STOP });
  }
}

// ✅ 5. Add Role
function* addRoleSaga({ payload }) {
  try {
    yield put({ type: LOADING_START });
    const response = yield call(api.create, "/role/store", payload);
    toast.success("Role added successfully!");
    yield put({
      type: API_RESPONSE_SUCCESS,
      payload: { actionType: ADD_ROLE, data: response.data },
    });
    yield call(getRoles);
  } catch (error) {
    toast.error("Failed to add role!");
    yield put({ type: API_RESPONSE_ERROR, payload: error });
  } finally {
    yield put({ type: LOADING_STOP });
  }
}

// ✅ 6. Update Role
function* updateRoleSaga({ payload }) {
  try {
    yield put({ type: LOADING_START });
    const response = yield call(api.put, "/role/update", payload);
    toast.success("Role updated successfully!");
    yield put({
      type: API_RESPONSE_SUCCESS,
      payload: { actionType: UPDATE_ROLE, data: response.data },
    });
    yield call(getRoles);
  } catch (error) {
    toast.error("Failed to update role!");
    yield put({ type: API_RESPONSE_ERROR, payload: error });
  } finally {
    yield put({ type: LOADING_STOP });
  }
}

// ✅ 7. Delete Role
function* deleteRoleSaga({ payload }) {
  try {
    yield put({ type: LOADING_START });
    yield call(api.delete, `/role/delete/${payload}`);
    toast.success("Role deleted successfully!");
    yield put({
      type: API_RESPONSE_SUCCESS,
      payload: { actionType: DELETE_ROLE },
    });
    yield call(getRoles);
  } catch (error) {
    toast.error("Failed to delete role!");
    yield put({ type: API_RESPONSE_ERROR, payload: error });
  } finally {
    yield put({ type: LOADING_STOP });
  }
}

// ================== WATCHERS ==================
export function* watchRole() {
  yield takeEvery(GET_ROLE, getRoles);
  yield takeEvery(GET_ROLE_PERMISSIONS, getRolePermissionsSaga);
  yield takeEvery(GET_OLD_PERMISSIONS, getOldRolePermissionsSaga);
  yield takeEvery(GET_ASSIGNED_PERMISSIONS, getAssignedPermissionsSaga); // ✅ NEW
  yield takeEvery(ADD_ROLE, addRoleSaga);
  yield takeEvery(UPDATE_ROLE, updateRoleSaga);
  yield takeEvery(DELETE_ROLE, deleteRoleSaga);
}

// ================== ROOT SAGA ==================
export default function* roleSaga() {
  yield all([fork(watchRole)]);
}
