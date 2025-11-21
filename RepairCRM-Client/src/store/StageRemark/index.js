// src/store/Otp/otp.js
import { call, put, takeEvery, all, fork } from "redux-saga/effects";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

// ================== ACTION TYPES ==================
export const SEND_OTP = "SEND_OTP";
export const VERIFY_OTP = "VERIFY_OTP";
export const RESET_OTP_STATE = "RESET_OTP_STATE";

export const OTP_API_RESPONSE_SUCCESS = "OTP_API_RESPONSE_SUCCESS";
export const OTP_API_RESPONSE_ERROR = "OTP_API_RESPONSE_ERROR";

// ================== ACTIONS ==================
export const otpApiResponseSuccess = (actionType, data) => ({
  type: OTP_API_RESPONSE_SUCCESS,
  payload: { actionType, data },
});

export const otpApiResponseError = (actionType, error) => ({
  type: OTP_API_RESPONSE_ERROR,
  payload: { actionType, error },
});

export const resetOtpState = () => ({
  type: RESET_OTP_STATE,
});

// Send OTP
export const sendOtpAction = (phone) => ({
  type: SEND_OTP,
  payload: { phone },
});

// Verify OTP
export const verifyOtpAction = (phone, otp) => ({
  type: VERIFY_OTP,
  payload: { phone, otp },
});

// ================== REDUCER ==================
const INIT_STATE = {
  loading: false,
  sendOtpSuccess: false,
  verifyOtpSuccess: false,
  error: null,
};

export const OtpReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case SEND_OTP:
    case VERIFY_OTP:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case OTP_API_RESPONSE_SUCCESS:
      switch (action.payload.actionType) {
        case SEND_OTP:
          return {
            ...state,
            loading: false,
            sendOtpSuccess: true,
            error: null,
          };

        case VERIFY_OTP:
          return {
            ...state,
            loading: false,
            verifyOtpSuccess: true,
            error: null,
          };

        default:
          return state;
      }

    case OTP_API_RESPONSE_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };

    case RESET_OTP_STATE:
      return {
        ...INIT_STATE,
      };

    default:
      return state;
  }
};

// ================== API CALLS ==================
const api = new APIClient();

// Your backend routes:
// router.post("/send-otp", controller.sendOtp);
// router.post("/verify-otp", controller.verifyOtp);

const sendOtpApi = (data) => api.create("/send-otp", data);
const verifyOtpApi = (data) => api.create("/verify-otp", data);

// ================== SAGAS ==================

// Send OTP Saga
function* sendOtpSaga({ payload }) {
  try {
    const { phone } = payload;
    const response = yield call(sendOtpApi, { phone });
    yield put(otpApiResponseSuccess(SEND_OTP, response));
    toast.success(response?.message || "OTP sent successfully!");
  } catch (error) {
    yield put(otpApiResponseError(SEND_OTP, error));
    toast.error(
      error?.response?.data?.message || "Failed to send OTP, please try again."
    );
  }
}

// Verify OTP Saga
function* verifyOtpSaga({ payload }) {
  try {
    const { phone, otp } = payload;

    const OPTData = {
      phone: phone,
      otp: otp,
    };
    const response = yield call(verifyOtpApi, OPTData);
    yield put(otpApiResponseSuccess(VERIFY_OTP, response));
    toast.success(response?.message || "OTP verified successfully!");
  } catch (error) {
    yield put(otpApiResponseError(VERIFY_OTP, error));
    toast.error(
      error?.response?.data?.message ||
        "Invalid or expired OTP, please try again."
    );
  }
}

// ================== WATCHERS ==================
function* watchSendOtp() {
  yield takeEvery(SEND_OTP, sendOtpSaga);
}

function* watchVerifyOtp() {
  yield takeEvery(VERIFY_OTP, verifyOtpSaga);
}

// ================== ROOT SAGA ==================
export function* otpSaga() {
  yield all([fork(watchSendOtp), fork(watchVerifyOtp)]);
}
