import type { Message, DownloadFilePayload } from "../messaging/messages";

// SW 수명 유지: 0.4분(24초)마다 alarms로 keep-alive
chrome.alarms.create("keep-alive", { periodInMinutes: 0.4 });
chrome.alarms.onAlarm.addListener((_alarm) => {
  // SW를 깨워두기 위한 ping
});

chrome.runtime.onMessage.addListener(
  (message: Message, _sender: chrome.runtime.MessageSender, sendResponse) => {
    if (message.type === "DOWNLOAD_FILE") {
      const { markdownContent, filename } = message.payload as DownloadFilePayload;
      handleDownload(markdownContent, filename)
        .then(() => sendResponse({ ok: true }))
        .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
      return true; // async response
    }
    return false;
  }
);

/**
 * Markdown 내용을 Data URL(base64)로 인코딩 후 chrome.downloads.download() 호출.
 * Service Worker에서는 Blob URL 생성 불가 → Data URL 방식 사용.
 */
async function handleDownload(markdownContent: string, filename: string): Promise<void> {
  const bytes = new TextEncoder().encode(markdownContent);
  let binary = "";
  const chunkSize = 65536;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const base64 = btoa(binary);

  await chrome.downloads.download({
    url: `data:text/markdown;charset=utf-8;base64,${base64}`,
    filename,
    saveAs: false,
  });
}
