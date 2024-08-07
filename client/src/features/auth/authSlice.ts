import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import axiosInstance from "@/API";

type TLoginError = {
  email: string | undefined;
  pwd: string | undefined;
  server: string | undefined;
};

type TInitialState = {
  isLoading: boolean;
  isLoggedIn: boolean;
  errors: TLoginError | null;
};

const initialState: TInitialState = {
  isLoading: false,
  isLoggedIn: false,
  errors: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (loginInfo: { email: string; pwd: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/auth/login",
        loginInfo,
      );
      return response.data;
    } catch (err: any) {
      if (!err.response.data.errors) {
        return rejectWithValue(null);
      }
      return rejectWithValue(err.response.data.errors);
    }
  },
);

export const relogin = createAsyncThunk(
  "auth/relogin",
  // Uses accessToken instead of password
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/v1/auth/relogin");
      console.log("Re-login succesful");
      return response.data;
    } catch (err: any) {
      dispatch(logout());
      return rejectWithValue(
        err.response.data.errors ? err.response.data.errors : null,
      );
    }
  },
);

export const reset = createAction("reset");

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await axiosInstance.delete("/api/v1/auth/logout");
    } catch (err: any) {
      console.log("Logout api call failed");
    }
    dispatch(reset());
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthErrors: (state) => {
      state.isLoading = false;
      state.errors = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(login.fulfilled, (state) => {
      state.isLoading = false;
      state.isLoggedIn = true;
      state.errors = null;
    });
    builder.addCase(login.rejected, (state, action: any) => {
      state.isLoading = false;
      state.isLoggedIn = false;
      state.errors = action.payload;
    });
    // Relogin
    builder.addCase(relogin.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(relogin.fulfilled, (state) => {
      state.isLoading = false;
      state.isLoggedIn = true;
      state.errors = null;
    });
    builder.addCase(relogin.rejected, (state, action: any) => {
      state.isLoading = false;
      state.isLoggedIn = false;
      state.errors = action.payload;
    });
  },
});

export default authSlice.reducer;
export const { clearAuthErrors } = authSlice.actions;
