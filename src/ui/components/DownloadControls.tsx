import { DrawerSection, PageContext } from "../../infrastructure/messaging/messages";

interface DownloadControlsProps {
  pageContext: PageContext;
  onDownloadAll: () => void;
  onDownloadSingle: () => void;
  onDownloadDrawer: (section: DrawerSection) => void;
  disabled: boolean;
}

export function DownloadControls({
  pageContext,
  onDownloadAll,
  onDownloadSingle,
  onDownloadDrawer,
  disabled,
}: DownloadControlsProps) {
  const { pageType } = pageContext;

  const btnBase =
    "w-full py-2 px-4 text-white text-sm font-medium rounded-lg transition-colors disabled:bg-gray-300";

  return (
    <div className="flex flex-col gap-2">
      {/* 작가 프로필 페이지 */}
      {pageType === "profile" && (
        <button
          onClick={onDownloadAll}
          disabled={disabled}
          className={`${btnBase} bg-green-600 hover:bg-green-700`}
        >
          전체 글 다운로드
        </button>
      )}

      {/* 서랍 페이지 (brunch.co.kr/ready) — 섹션별 3개 버튼 */}
      {pageType === "drawer" && (
        <>
          <button
            onClick={() => onDownloadDrawer("draft")}
            disabled={disabled}
            className={`${btnBase} bg-orange-500 hover:bg-orange-600`}
          >
            저장 글 다운로드
          </button>
          <button
            onClick={() => onDownloadDrawer("draft_reserved")}
            disabled={disabled}
            className={`${btnBase} bg-orange-400 hover:bg-orange-500`}
          >
            예약 글 다운로드
          </button>
          <button
            onClick={() => onDownloadDrawer("private")}
            disabled={disabled}
            className={`${btnBase} bg-gray-500 hover:bg-gray-600`}
          >
            발행 취소 글 다운로드
          </button>
        </>
      )}

      {/* 글 페이지 / 매거진 글 */}
      {(pageType === "article" || pageType === "magazine") && (
        <button
          onClick={onDownloadSingle}
          disabled={disabled}
          className={`${btnBase} bg-blue-600 hover:bg-blue-700`}
        >
          이 글만 다운로드
        </button>
      )}

      <p className="text-xs text-gray-400 text-center">
        다운로드 시 팝업이 뜨면 &ldquo;항상 허용&rdquo; 선택
      </p>
    </div>
  );
}
