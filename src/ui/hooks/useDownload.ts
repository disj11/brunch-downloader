import { useState, useEffect, useCallback } from "react";
import { PopupAdapter } from "../../adapters/primary/PopupAdapter";
import { DrawerSection, PageContext, ProgressPayload } from "../../infrastructure/messaging/messages";
import { DownloadProgress } from "../../domain/entities/Article";

export type AppState =
  | "loading"
  | "idle"
  | "ready"
  | "collecting"
  | "downloading"
  | "done"
  | "error";

export interface DownloadState {
  appState: AppState;
  pageContext: PageContext | null;
  progress: DownloadProgress;
  errorMessage: string;
}

const adapter = new PopupAdapter();

export function useDownload() {
  const [state, setState] = useState<DownloadState>({
    appState: "loading",
    pageContext: null,
    progress: { total: 0, done: 0, failed: 0 },
    errorMessage: "",
  });

  useEffect(() => {
    // 페이지 컨텍스트 조회
    adapter
      .getPageContext()
      .then((ctx) => {
        const isUsable =
          ctx.pageType === "profile" ||
          ctx.pageType === "article" ||
          ctx.pageType === "magazine" ||
          ctx.pageType === "drawer";
        setState((s) => ({
          ...s,
          appState: isUsable ? "ready" : "idle",
          pageContext: ctx,
        }));
      })
      .catch(() => {
        setState((s) => ({ ...s, appState: "idle" }));
      });

    // 메시지 수신 (진행 상황, 완료, 오류)
    const unlisten = adapter.onMessage((message) => {
      switch (message.type) {
        case "PROGRESS_UPDATE": {
          const p = message.payload as ProgressPayload;
          setState((s) => ({
            ...s,
            appState: "downloading",
            progress: {
              total: p.total,
              done: p.done,
              failed: p.failed,
              current: p.current,
            },
          }));
          break;
        }
        case "DOWNLOAD_COMPLETE": {
          setState((s) => ({ ...s, appState: "done" }));
          break;
        }
        case "DOWNLOAD_ERROR": {
          const err = (message.payload as { error: string }).error;
          setState((s) => ({ ...s, appState: "error", errorMessage: err }));
          break;
        }
      }
    });

    return unlisten;
  }, []);

  const downloadAll = useCallback(async () => {
    if (!state.pageContext?.authorId) return;
    setState((s) => ({
      ...s,
      appState: "collecting",
      progress: { total: 0, done: 0, failed: 0 },
    }));
    try {
      await adapter.startDownloadAll(state.pageContext.authorId);
    } catch (err) {
      setState((s) => ({
        ...s,
        appState: "error",
        errorMessage: String(err),
      }));
    }
  }, [state.pageContext]);

  const downloadSingle = useCallback(async () => {
    setState((s) => ({
      ...s,
      appState: "downloading",
      progress: { total: 1, done: 0, failed: 0 },
    }));
    try {
      await adapter.startDownloadSingle();
    } catch (err) {
      setState((s) => ({
        ...s,
        appState: "error",
        errorMessage: String(err),
      }));
    }
  }, []);

  const downloadDrawer = useCallback(async (section: DrawerSection) => {
    setState((s) => ({
      ...s,
      appState: "collecting",
      progress: { total: 0, done: 0, failed: 0 },
    }));
    try {
      await adapter.startDownloadDrawer(section);
    } catch (err) {
      setState((s) => ({
        ...s,
        appState: "error",
        errorMessage: String(err),
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({
      ...s,
      appState: "ready",
      progress: { total: 0, done: 0, failed: 0 },
      errorMessage: "",
    }));
  }, []);

  return {
    ...state,
    downloadAll,
    downloadSingle,
    downloadDrawer,
    reset,
  };
}
