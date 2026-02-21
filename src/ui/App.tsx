import { useDownload } from "./hooks/useDownload";
import { AuthorHeader } from "./components/AuthorHeader";
import { DownloadControls } from "./components/DownloadControls";
import { ProgressBar } from "./components/ProgressBar";
import { ArticleList } from "./components/ArticleList";

export default function App() {
  const {
    appState,
    pageContext,
    progress,
    errorMessage,
    downloadAll,
    downloadSingle,
    downloadDrawer,
    reset,
  } = useDownload();

  const isWorking = appState === "collecting" || appState === "downloading";

  return (
    <div className="w-80 min-h-24 p-4 font-sans bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
        <h1 className="text-sm font-bold text-gray-700">브런치 다운로더</h1>
        <span className="text-xs text-gray-400">v1.0</span>
      </div>

      {/* 로딩 */}
      {appState === "loading" && (
        <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
          <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          페이지 감지 중...
        </div>
      )}

      {/* 비활성 (브런치 외 페이지) */}
      {appState === "idle" && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">브런치스토리 페이지에서</p>
          <p className="text-sm text-gray-500">사용해주세요</p>
          <p className="mt-2 text-xs text-gray-400">brunch.co.kr</p>
        </div>
      )}

      {/* 메인 UI */}
      {pageContext && appState !== "loading" && appState !== "idle" && (
        <>
          <AuthorHeader pageContext={pageContext} />

          {/* 준비 상태 */}
          {appState === "ready" && (
            <DownloadControls
              pageContext={pageContext}
              onDownloadAll={downloadAll}
              onDownloadSingle={downloadSingle}
              onDownloadDrawer={downloadDrawer}
              disabled={false}
            />
          )}

          {/* 진행 중 */}
          {isWorking && (
            <>
              <DownloadControls
                pageContext={pageContext}
                onDownloadAll={downloadAll}
                onDownloadSingle={downloadSingle}
                onDownloadDrawer={downloadDrawer}
                disabled={true}
              />
              <ProgressBar appState={appState} progress={progress} />
              <ArticleList
                current={progress.current}
                done={progress.done}
                total={progress.total}
              />
            </>
          )}

          {/* 완료 */}
          {appState === "done" && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">다운로드 완료!</p>
                <p className="text-xs text-green-600 mt-1">
                  성공 {progress.done - progress.failed}개 / 실패 {progress.failed}개
                </p>
              </div>
              <button
                onClick={reset}
                className="w-full py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                처음으로
              </button>
            </div>
          )}

          {/* 오류 */}
          {appState === "error" && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-800">오류 발생</p>
                <p className="text-xs text-red-600 mt-1 break-words">{errorMessage}</p>
              </div>
              <button
                onClick={reset}
                className="w-full py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
