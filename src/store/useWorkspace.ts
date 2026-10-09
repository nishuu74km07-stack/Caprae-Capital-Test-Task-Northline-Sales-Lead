"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { BuyBox, LeadStatus } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  closeLead as closeLeadAction,
  dismissNotice as dismissNoticeAction,
  loadWorkspace,
  mutateWorkspace,
  openLead as openLeadAction,
} from "./workspaceSlice";

export function useWorkspace() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { workspace, loading, pending, error, notice, selectedId } = useAppSelector(
    (state) => state.workspace,
  );

  const openLead = useCallback(
    (id: string) => {
      dispatch(openLeadAction(id));
      router.push("/leads");
    },
    [dispatch, router],
  );

  const closeLead = useCallback(() => {
    dispatch(closeLeadAction());
  }, [dispatch]);

  const post = useCallback(
    async (url: string, body?: unknown) => {
      await dispatch(mutateWorkspace({ url, body })).unwrap();
    },
    [dispatch],
  );

  return {
    workspace,
    loading,
    pending,
    error,
    notice,
    selectedId,
    openLead,
    closeLead,
    saveBuyBox: (buyBox: BuyBox) => post("/api/buybox", buyBox),
    setStatus: (id: string, status: LeadStatus) =>
      post(`/api/leads/${id}`, { action: "status", status }),
    enrich: (id: string) => post(`/api/leads/${id}`, { action: "enrich" }),
    draft: (id: string) => post(`/api/leads/${id}`, { action: "draft" }),
    importCsv: (csv: string) => post("/api/import", { csv }),
    resetDemo: () => post("/api/reset"),
    shortlistInBox: () => post("/api/leads/bulk", { action: "shortlist-inbox" }),
    dismissNotice: () => {
      dispatch(dismissNoticeAction());
    },
    reload: async () => {
      await dispatch(loadWorkspace()).unwrap();
    },
  };
}
