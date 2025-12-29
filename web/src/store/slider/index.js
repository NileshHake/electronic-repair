import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

/* ================= ACTION TYPES ================= */
export const GET_SLIDERS = "GET_SLIDERS";
export const ADD_SLIDER = "ADD_SLIDER";
export const UPDATE_SLIDER = "UPDATE_SLIDER";
export const DELETE_SLIDER = "DELETE_SLIDER";

export const RESET_ADD_SLIDER_RESPONSE = "RESET_ADD_SLIDER_RESPONSE";
export const RESET_UPDATE_SLIDER_RESPONSE = "RESET_UPDATE_SLIDER_RESPONSE";

export const API_RESPONSE_SUCCESS = "SLIDER_API_RESPONSE_SUCCESS";
export const API_RESPONSE_ERROR = "SLIDER_API_RESPONSE_ERROR";

/* ================= ACTIONS ================= */
export const sliderApiResponseSuccess = (actionType, data) => ({
  type: API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const sliderApiResponseError = (actionType, error) => ({
  type: API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetAddSliderResponse = () => ({
  type: RESET_ADD_SLIDER_RESPONSE,
});

export const resetUpdateSliderResponse = () => ({
  type: RESET_UPDATE_SLIDER_RESPONSE,
});

export const getSlidersList = () => ({ type: GET_SLIDERS });
export const addSlider = (slider) => ({ type: ADD_SLIDER, payload: { slider } });
export const updateSlider = (slider) => ({ type: UPDATE_SLIDER, payload: { slider } });
export const deleteSlider = (id) => ({ type: DELETE_SLIDER, payload: id });

/* ================= REDUCER ================= */
const INIT_STATE = {
  sliders: [],
  loading: true,
  error: false,
  addSliderResponse: false,
  updateSliderResponse: false,
};

export const SliderReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_SLIDERS:
      return { ...state, loading: true };

    case API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case GET_SLIDERS:
          return {
            ...state,
            sliders: action.payload.data,
            loading: false,
            error: false,
          };

        case ADD_SLIDER:
          return {
            ...state,
            addSliderResponse: true,
            loading: false,
            error: false,
          };

        case UPDATE_SLIDER:
          return {
            ...state,
            updateSliderResponse: true,
            loading: false,
            error: false,
          };

        case DELETE_SLIDER:
          return {
            ...state,
            sliders: state.sliders.filter(
              (s) => s.id !== action.payload.data
            ),
            loading: false,
            error: false,
          };

        default:
          return state;
      }

    case API_RESPONSE_ERROR:
      return { ...state, error: true, loading: false };

    case RESET_ADD_SLIDER_RESPONSE:
      return { ...state, addSliderResponse: false };

    case RESET_UPDATE_SLIDER_RESPONSE:
      return { ...state, updateSliderResponse: false };

    default:
      return state;
  }
};

/* ================= API ================= */
const api = new APIClient();

const getSlidersApi = () => api.get("/slider/list");
const addSliderApi = (data) => api.create("/slider/store", data);
const updateSliderApi = (data) => api.put("/slider/update", data);
const deleteSliderApi = (id) => api.delete(`/slider/delete/${id}`);

/* ================= SAGAS ================= */

// Get sliders
function* getSlidersSaga() {
  try {
    const response = yield call(getSlidersApi);
    yield put(sliderApiResponseSuccess(GET_SLIDERS, response));
  } catch (error) {
    yield put(sliderApiResponseError(GET_SLIDERS, error));
    toast.error("Failed to load sliders!");
  }
}

// Add slider
function* addSliderSaga({ payload }) {
  try {
    const response = yield call(addSliderApi, payload.slider);
    yield put(sliderApiResponseSuccess(ADD_SLIDER, response));
    yield put(getSlidersList());
    toast.success("Slider added successfully!");
  } catch (error) {
    yield put(sliderApiResponseError(ADD_SLIDER, error));
    toast.error("Failed to add slider!");
  }
}

// Update slider
function* updateSliderSaga({ payload }) {
  try {
    const response = yield call(updateSliderApi, payload.slider);
    yield put(sliderApiResponseSuccess(UPDATE_SLIDER, response));
    yield put(getSlidersList());
    toast.success("Slider updated successfully!");
  } catch (error) {
    yield put(sliderApiResponseError(UPDATE_SLIDER, error));
    toast.error("Failed to update slider!");
  }
}

// Delete slider
function* deleteSliderSaga({ payload }) {
  try {
    yield call(deleteSliderApi, payload); 
    yield put(getSlidersList());
    toast.success("Slider deleted successfully!");
  } catch (error) {
    yield put(sliderApiResponseError(DELETE_SLIDER, error));
    
  }
}

/* ================= WATCHERS ================= */
function* watchGetSliders() {
  yield takeEvery(GET_SLIDERS, getSlidersSaga);
}

function* watchAddSlider() {
  yield takeEvery(ADD_SLIDER, addSliderSaga);
}

function* watchUpdateSlider() {
  yield takeEvery(UPDATE_SLIDER, updateSliderSaga);
}

function* watchDeleteSlider() {
  yield takeEvery(DELETE_SLIDER, deleteSliderSaga);
}

/* ================= ROOT SAGA ================= */
export function* sliderSaga() {
  yield all([
    fork(watchGetSliders),
    fork(watchAddSlider),
    fork(watchUpdateSlider),
    fork(watchDeleteSlider),
  ]);
}
