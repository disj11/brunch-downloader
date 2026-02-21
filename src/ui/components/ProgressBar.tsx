import { DownloadProgress } from "../../domain/entities/Article";
import { AppState } from "../hooks/useDownload";

interface ProgressBarProps {
  appState: AppState;
  progress: DownloadProgress;
}

export function ProgressBar({ appState, progress }: ProgressBarProps) {
  const { total, done, failed, current } = progress;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const label: Record<string, string> = {
    collecting: "글 목록 수집 중...",
    downloading: `${done} / ${total} 완료`,
    done: `완료: 성공 ${done - failed}개 / 실패 ${failed}개`,
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex justify-between text-xs text-gray-600">
        <span>{label[appState] ?? ""}</span>
        {total > 0 && <span>{percent}%</span>}
      </div>

      {total > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {appState === "collecting" && total === 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-2 bg-blue-400 rounded-full animate-pulse w-1/2" />
        </div>
      )}

      {current && (
        <p className="text-xs text-gray-500 truncate" title={current}>
          ↳ {current}
        </p>
      )}
    </div>
  );
}
