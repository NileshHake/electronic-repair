import { call, put, takeEvery, takeLatest } from "redux-saga/effects";

// Action Types
import { LOGIN_USER, LOGOUT_USER, SOCIAL_LOGIN } from "./actionTypes";
import { apiError, loginSuccess, logoutUserSuccess } from "./actions";

// API Helper
import { APIClient } from "../../../helpers/api_helper";
import AuthUser from "../../../helpers/AuthType/AuthUser";
import { toast } from "react-toastify";
import { getOldRolePermissions } from "../../Role";
import { useDispatch } from "react-redux";
const api = new APIClient();

/**
 * LOGIN USER (Custom API)
 */
function* loginUser({ payload: { user, history } }) {
  try {
    const response = yield call(api.create, "/user/login", {
      user_email: user.user_email,
      user_password: user.user_password,
    });

    if (response && response.success) {
      sessionStorage.setItem("authUser", JSON.stringify(response));

      toast.success(response?.message || "Login successful  ");

      yield put(loginSuccess(response));
      history("/dashboard");
    } else {
      toast.error(response?.message || "Invalid email or password ❌");
      yield put(apiError(response?.message || "Invalid login response"));
    }
  } catch (error) {
    // ⚠️ Catch server/network errors
    toast.error(error?.response?.data?.message || "Login failed ❌");
    yield put(apiError(error));
  }
}

/**
 * LOGOUT USER
 */
function* logoutUser({ payload: { history } }) {
  try {

    sessionStorage.removeItem("authUser");
    yield put(logoutUserSuccess());
    history("/login"); // Redirect to login
  } catch (error) {
    yield put(apiError(error));
  }
}

/**
 * SOCIAL LOGIN (optional – can disable if not needed)
 */

function* socialLogin({ payload }) {
  try {
    const { data, navigate } = payload;
     
    const apiResponse = yield call(api.create, "/customer/google-login", {
      email: data.email,
      name: data.name,
      picture: data.picture,
      sub: data.sub,
      // anything else you want to send
    });

    const res = apiResponse; // rename for clarity
     console.log(res);
     
    if (res.userNotFound && !res.success) {
      // if backend responds with 404 + body { userNotFound: true, email, name, picture }
      navigate("/register", {
        state: {
          email: res.email,
          name: res.name,
          picture: res.picture,
          fromGoogle: true,
        },
      });
      return;
    }

    // ✅ If login success
    // Example response: { success, token, user }
    if (res.success) {
      // Save user in storage if you already do it for normal login
      sessionStorage.setItem("authUser", JSON.stringify(res));
      yield put(loginSuccess(res));
      navigate("/dashboard");
      return;
    }

    // If something weird, treat as error
    yield put(apiError("Unexpected social login response"));
  } catch (error) {
    console.error("socialLogin saga error:", error);
    yield put(apiError(error));
  }
}


/**
 * ROOT SAGA
 */
function* authSaga() {
  yield takeEvery(LOGIN_USER, loginUser);
  yield takeEvery(LOGOUT_USER, logoutUser);
  yield takeLatest(SOCIAL_LOGIN, socialLogin);
}

export default authSaga; // ✅ IMPORTANT: This fixes your “export not found” error
