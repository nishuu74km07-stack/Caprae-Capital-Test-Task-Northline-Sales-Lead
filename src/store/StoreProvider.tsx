"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { useAppDispatch, useAppSelector } from "./hooks";
import { makeStore, type AppStore } from "./store";
import { dismissNotice, loadWorkspace } from "./workspaceSlice";

function WorkspaceBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const notice = useAppSelector((state) => state.workspace.notice);

  useEffect(() => {
    void dispatch(loadWorkspace());
  }, [dispatch]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => dispatch(dismissNotice()), 6000);
    return () => window.clearTimeout(timer);
  }, [notice, dispatch]);

  return children;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <WorkspaceBootstrap>{children}</WorkspaceBootstrap>
    </Provider>
  );
}
