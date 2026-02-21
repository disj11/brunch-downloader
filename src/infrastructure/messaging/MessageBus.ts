import { Message } from "./messages";

/** Background service worker로 메시지 전송 */
export async function sendToBackground(message: Message): Promise<unknown> {
  return chrome.runtime.sendMessage(message);
}

/** 활성 탭의 content script로 메시지 전송 */
export async function sendToContentScript(message: Message): Promise<unknown> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab");
  return chrome.tabs.sendMessage(tab.id, message);
}

/** 메시지 수신 리스너 등록, cleanup 함수 반환 */
export function onMessage(
  callback: (message: Message, sendResponse: (response: unknown) => void) => boolean | void
): () => void {
  const listener = (
    message: Message,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ) => callback(message, sendResponse);
  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
}
