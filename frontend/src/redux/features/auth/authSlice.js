import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  accessToken: undefined,
  user: undefined,

  // ✅ new
  singleUser: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, { payload }) => {
      state.accessToken = payload.accessToken;
      state.user = payload.user;
    },
    userLoggedOut: (state) => {
      state.accessToken = undefined;
      state.user = undefined;

      // ✅ new
      state.singleUser = undefined;

      Cookies.remove("userInfo");
    },

    // ✅ new reducer
    setSingleUser: (state, { payload }) => {
      state.singleUser = payload;
    },
  },
});

export const { userLoggedIn, userLoggedOut, setSingleUser } = authSlice.actions;
export default authSlice.reducer;