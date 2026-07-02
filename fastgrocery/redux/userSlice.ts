import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IUserState {
  userData: {
    id: string;
    name: string;
    email: string;
    role: "user" | "deliveryBoy" | "admin" | "";
    mobile?: string;
    image?: string;
    location?: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
    };
    socketId?: string | null;
    isOnline?: boolean;
  } | null;
}

const initialState: IUserState = {
  userData: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<IUserState["userData"]>) => {
      state.userData = action.payload;
    },
    clearUserData: (state) => {
      state.userData = null;
    },
    updateUserLocation: (
      state,
      action: PayloadAction<[number, number]> // [longitude, latitude]
    ) => {
      if (state.userData) {
        state.userData.location = {
          type: "Point",
          coordinates: action.payload,
        };
      }
    },
  },
});

export const { setUserData, clearUserData, updateUserLocation } =
  userSlice.actions;

export default userSlice.reducer;
