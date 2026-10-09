import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Workspace } from "@/lib/types";

export type WorkspaceState = {
  workspace: Workspace | null;
  loading: boolean;
  pending: boolean;
  error: string | null;
  notice: string | null;
  selectedId: string | null;
};

const initialState: WorkspaceState = {
  workspace: null,
  loading: true,
  pending: false,
  error: null,
  notice: null,
  selectedId: null,
};

function describeError(caught: unknown, fallback: string) {
  if (caught instanceof Error && caught.name === "TimeoutError") {
    return "The desk timed out. Refresh the page.";
  }
  return caught instanceof Error ? caught.message : fallback;
}

function pruneSelected(state: WorkspaceState) {
  if (
    state.selectedId &&
    state.workspace &&
    !state.workspace.leads.some((lead) => lead.id === state.selectedId)
  ) {
    state.selectedId = null;
  }
}

export const loadWorkspace = createAsyncThunk(
  "workspace/load",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/workspace", { signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not load the desk.");
      return data as Workspace;
    } catch (caught) {
      return rejectWithValue(describeError(caught, "Could not load the desk."));
    }
  },
);

export const mutateWorkspace = createAsyncThunk(
  "workspace/mutate",
  async ({ url, body }: { url: string; body?: unknown }, { rejectWithValue }) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Request failed.");
      return {
        workspace: data.workspace as Workspace,
        message: (data.message as string | null | undefined) ?? null,
      };
    } catch (caught) {
      return rejectWithValue(describeError(caught, "Request failed."));
    }
  },
);

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    openLead(state, action: PayloadAction<string>) {
      state.selectedId = action.payload;
    },
    closeLead(state) {
      state.selectedId = null;
    },
    dismissNotice(state) {
      state.notice = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWorkspace.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.workspace = action.payload;
        state.error = null;
        pruneSelected(state);
      })
      .addCase(loadWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string | undefined) ?? "Could not load the desk.";
      })
      .addCase(mutateWorkspace.pending, (state) => {
        state.pending = true;
        state.error = null;
      })
      .addCase(mutateWorkspace.fulfilled, (state, action) => {
        state.pending = false;
        state.workspace = action.payload.workspace;
        state.notice = action.payload.message;
        pruneSelected(state);
      })
      .addCase(mutateWorkspace.rejected, (state, action) => {
        state.pending = false;
        state.error = (action.payload as string | undefined) ?? "Request failed.";
      });
  },
});

export const { openLead, closeLead, dismissNotice } = workspaceSlice.actions;
export default workspaceSlice.reducer;
