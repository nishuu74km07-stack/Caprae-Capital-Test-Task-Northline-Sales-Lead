import { configureStore } from "@reduxjs/toolkit";
import workspaceReducer from "./workspaceSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      workspace: workspaceReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
