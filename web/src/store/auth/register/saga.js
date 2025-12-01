import { takeEvery, fork, put, all, call } from "redux-saga/effects";

//Account Redux states
import { REGISTER_USER } from "./actionTypes";
import { registerUserSuccessful, registerUserFailed } from "./actions";

//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import {
  postFakeRegister,
  postJwtRegister,
} from "../../../helpers/fakebackend_helper";
import { APIClient } from "../../../helpers/api_helper";
const api = new APIClient();
// initialize relavant method of both Auth
const fireBaseBackend = getFirebaseBackend();

// Is user register successfull then direct plot user in redux.
function* registerUser({ payload: { data, history } }) {
  try {
    // 1️⃣ Call the API
  

    const apiResponse = yield call(api.create, "/customer/google-register", data);
    if (apiResponse.success) {
      sessionStorage.setItem("authUser", JSON.stringify(apiResponse));

      // 3️⃣ Dispatch success action
      yield put(registerUserSuccessful(apiResponse.apiResponse));


    } else {

      yield put(registerUserFailed(apiResponse.message));
    }
  } catch (error) {
    console.error("Saga error:", error);

    yield put(registerUserFailed(error));
  }
}


export function* watchUserRegister() {
  yield takeEvery(REGISTER_USER, registerUser);
}

function* accountSaga() {
  yield all([fork(watchUserRegister)]);
}

export default accountSaga;
