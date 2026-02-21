import { DrawerSection, Message, PageContext } from "../../infrastructure/messaging/messages";

/** Popup UI → Content Script / Background 메시지 브릿지 */
export class PopupAdapter {
  /** 현재 탭의 페이지 컨텍스트 요청 */
  async getPageContext(): Promise<PageContext> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active tab");
    return chrome.tabs.sendMessage(tab.id, {
      type: "GET_PAGE_CONTEXT",
    } as Message) as Promise<PageContext>;
  }

  /** 전체 글 다운로드 요청 */
  async startDownloadAll(authorId: string): Promise<void> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active tab");
    await chrome.tabs.sendMessage(tab.id, {
      type: "DOWNLOAD_ALL",
      payload: { authorId },
    } as Message);
  }

  /** 현재 글 다운로드 요청 */
  async startDownloadSingle(): Promise<void> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active tab");
    await chrome.tabs.sendMessage(tab.id, { type: "DOWNLOAD_SINGLE" } as Message);
  }

  /** 서랍 섹션 다운로드 요청 */
  async startDownloadDrawer(section: DrawerSection): Promise<void> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active tab");
    await chrome.tabs.sendMessage(tab.id, {
      type: "DOWNLOAD_DRAWER",
      payload: { section },
    } as Message);
  }

  /** 메시지 수신 리스너 등록, cleanup 함수 반환 */
  onMessage(callback: (message: Message) => void): () => void {
    const listener = (message: unknown) => {
      if (message && typeof message === "object" && "type" in message) {
        callback(message as Message);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }
}
