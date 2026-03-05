import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  deviceItem: null,
  isDeviceModalOpen: false,
};

const rentalDeviceModalSlice = createSlice({
  name: "rentalDeviceModal",
  initialState,
  reducers: {
    openRentalDeviceModal: (state, action) => {
      state.deviceItem = action.payload;
      state.isDeviceModalOpen = true;
    },
    closeRentalDeviceModal: (state) => {
      state.deviceItem = null;
      state.isDeviceModalOpen = false;
    },
  },
});

export const { openRentalDeviceModal, closeRentalDeviceModal } =
  rentalDeviceModalSlice.actions;

export default rentalDeviceModalSlice.reducer;