import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const GET_TECHNICIANS = "GET_TECHNICIANS";
export const ADD_TECHNICIAN = "ADD_TECHNICIAN";
export const UPDATE_TECHNICIAN = "UPDATE_TECHNICIAN";
export const DELETE_TECHNICIAN = "DELETE_TECHNICIAN";
export const GET_SINGLE_TECHNICIAN = "GET_SINGLE_TECHNICIAN";
export const RESET_ADD_TECHNICIAN_RESPONSE = "RESET_ADD_TECHNICIAN_RESPONSE";
export const RESET_UPDATE_TECHNICIAN_RESPONSE = "RESET_UPDATE_TECHNICIAN_RESPONSE";
export const API_RESPONSE_SUCCESS = "API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const technicianApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const technicianApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddTechnicianResponse = () => ({
  type: RESET_ADD_TECHNICIAN_RESPONSE,
});

export const resetUpdateTechnicianResponse = () => ({
  type: RESET_UPDATE_TECHNICIAN_RESPONSE,
});

export const getTechniciansList = () => ({
  type: GET_TECHNICIANS,
});

export const getSingleTechnician = (id) => ({
  type: GET_SINGLE_TECHNICIAN,
  payload: id,
});

export const addTechnician = (technician) => ({
  type: ADD_TECHNICIAN,
  payload: technician,
});

export const updateTechnician = (technician) => ({
  type: UPDATE_TECHNICIAN,
  payload: technician,
});

export const deleteTechnician = (id) => ({
  type: DELETE_TECHNICIAN,
  payload: id,
});

// ================== REDUCER ==================
const INIT_STATE = {
  technicians: [],
  singleTechnician: null,
  loading: true,
  error: false,
  addTechnicianResponse: false,
  updateTechnicianResponse: false,
};

export const TechnicianReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_TECHNICIANS:
    case GET_SINGLE_TECHNICIAN:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_TECHNICIANS:
          return { ...state, technicians: action.payload.data, loading: false };
        case GET_SINGLE_TECHNICIAN:
          return { ...state, singleTechnician: action.payload.data, loading: false };
        case ADD_TECHNICIAN:
          return {
            ...state,
            addTechnicianResponse: true,
            technicians: [...state.technicians, action.payload.data],
          };
        case UPDATE_TECHNICIAN:
          return {
            ...state,
            updateTechnicianResponse: true,
            technicians: state.technicians.map((t) =>
              t.user_id === action.payload.data.user_id ? action.payload.data : t
            ),
          };
        case DELETE_TECHNICIAN:
          return {
            ...state,
            technicians: state.technicians.filter((t) => t.user_id !== action.payload.data),
          };
        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true, loading: false };
    case RESET_ADD_TECHNICIAN_RESPONSE:
      return { ...state, addTechnicianResponse: false };
    case RESET_UPDATE_TECHNICIAN_RESPONSE:
      return { ...state, updateTechnicianResponse: false };
    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

const getTechniciansApi = () => api.get("/technicians/list");
const getSingleTechnicianApi = (id) => api.get(`/user/single/${id}`);
const addTechnicianApi = (formData) => api.create(`/user/store`, formData);
const updateTechnicianApi = (data) => api.put(`/user/update`, data);
const deleteTechnicianApi = (id) => api.delete(`/user/delete/${id}`);

// ================== SAGAS ==================
function* getTechniciansListSaga() {
  try {
    const response = yield call(getTechniciansApi);
     
    yield put(technicianApiResponseSuccess(GET_TECHNICIANS, response));
  } catch (error) {
    yield put(technicianApiResponseError(GET_TECHNICIANS, error));
    toast.error("Failed to fetch technicians!");
  }
}

function* getSingleTechnicianSaga({ payload }) {
  try {
    const response = yield call(getSingleTechnicianApi, payload);
    yield put(technicianApiResponseSuccess(GET_SINGLE_TECHNICIAN, response));
  } catch (error) {
    yield put(technicianApiResponseError(GET_SINGLE_TECHNICIAN, error));
    toast.error("Failed to fetch technician details!");
  }
}

function* addTechnicianSaga({ payload }) {
  try {
    let response;
    payload.user_type = 4; // ✅ Always technician

    if (payload.user_profile && payload.user_profile instanceof File) {
      const formData = new FormData();
      for (const key in payload) {
        formData.append(key, payload[key]);
      }
      response = yield call(addTechnicianApi, formData);
    } else {
      response = yield call(api.create, `/user/store`, payload);
    }

    yield put(technicianApiResponseSuccess(ADD_TECHNICIAN, response));
    yield call(getTechniciansListSaga);
    toast.success(" Technician added successfully!");
  } catch (error) {
    console.error("❌ Error in addTechnicianSaga:", error);
    yield put(technicianApiResponseError(ADD_TECHNICIAN, error));
    toast.error("❌ Failed to add technician!");
  }
}

function* updateTechnicianSaga({ payload }) {
  try {
    let response;
    payload.user_type = 4; // ✅ Always technician

    if (payload.user_profile && payload.user_profile instanceof File) {
      const formData = new FormData();
      for (const key in payload) {
        formData.append(key, payload[key]);
      }
      response = yield call(api.putFormData, `/user/update`, formData);
    } else {
      response = yield call(api.put, `/user/update`, payload);
    }

    yield put(technicianApiResponseSuccess(UPDATE_TECHNICIAN, response));
    yield call(getTechniciansListSaga);
    toast.success(" Technician updated successfully!");
  } catch (error) {
    console.error("❌ Error in updateTechnicianSaga:", error);
    yield put(technicianApiResponseError(UPDATE_TECHNICIAN, error));
    toast.error("❌ Failed to update technician!");
  }
}

function* deleteTechnicianSaga({ payload }) {
  try {
    yield call(deleteTechnicianApi, payload);
    yield put(technicianApiResponseSuccess(DELETE_TECHNICIAN, { data: payload }));
    yield call(getTechniciansListSaga);
    toast.success("🗑️ Technician deleted successfully!");
  } catch (error) {
    yield put(technicianApiResponseError(DELETE_TECHNICIAN, error));
    toast.error("❌ Failed to delete technician!");
  }
}

// ================== WATCHERS ==================
function* watchGetTechnicians() {
  yield takeEvery(GET_TECHNICIANS, getTechniciansListSaga);
}
function* watchGetSingleTechnician() {
  yield takeEvery(GET_SINGLE_TECHNICIAN, getSingleTechnicianSaga);
}
function* watchAddTechnician() {
  yield takeEvery(ADD_TECHNICIAN, addTechnicianSaga);
}
function* watchUpdateTechnician() {
  yield takeEvery(UPDATE_TECHNICIAN, updateTechnicianSaga);
}
function* watchDeleteTechnician() {
  yield takeEvery(DELETE_TECHNICIAN, deleteTechnicianSaga);
}

export function* technicianSaga() {
  yield all([
    fork(watchGetTechnicians),
    fork(watchGetSingleTechnician),
    fork(watchAddTechnician),
    fork(watchUpdateTechnician),
    fork(watchDeleteTechnician),
  ]);
}
