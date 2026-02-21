export type DrawerSection = "draft" | "draft_reserved" | "private";

export type MessageType =
  | "GET_PAGE_CONTEXT"   // Popup → Content: 현재 페이지 컨텍스트 요청
  | "DOWNLOAD_ALL"       // Popup → Content: 전체 글 다운로드 시작
  | "DOWNLOAD_SINGLE"    // Popup → Content: 현재 글 다운로드
  | "DOWNLOAD_DRAWER"    // Popup → Content: 서랍 글 다운로드
  | "DOWNLOAD_FILE"      // Content → Background: 파일 저장 요청
  | "PROGRESS_UPDATE"    // Content → Popup: 진행 상황 업데이트
  | "DOWNLOAD_COMPLETE"  // Content → Popup: 다운로드 완료
  | "DOWNLOAD_ERROR";    // Content → Popup: 오류 발생

export interface PageContext {
  pageType: "profile" | "article" | "magazine" | "drawer" | "manage" | "other";
  authorId: string | null;
  articleTitle?: string;
}

export interface DownloadFilePayload {
  markdownContent: string;
  filename: string;
}

export interface ProgressPayload {
  total: number;
  done: number;
  failed: number;
  current?: string;
}

export interface Message {
  type: MessageType;
  payload?: unknown;
}
