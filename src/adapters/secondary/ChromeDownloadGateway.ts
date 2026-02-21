import { Article } from "../../domain/entities/Article";
import { DownloadGateway } from "../../domain/ports/DownloadGateway";
import { buildMarkdown } from "../../domain/utils/buildMarkdown";
import { sanitize } from "../../domain/utils/sanitize";
import { toKSTPrefix } from "../../domain/utils/dateUtils";
import type { DownloadFilePayload } from "../../infrastructure/messaging/messages";

/**
 * Content Script 컨텍스트에서 동작.
 * 실제 파일 저장은 Background Service Worker(chrome.downloads)에 위임.
 */
export class ChromeDownloadGateway implements DownloadGateway {
  async downloadArticle(article: Article, workFolder?: string): Promise<void> {
    const markdownContent = buildMarkdown(article);
    const filename = buildFilename(article, workFolder);

    const payload: DownloadFilePayload = { markdownContent, filename };
    await chrome.runtime.sendMessage({ type: "DOWNLOAD_FILE", payload });
  }
}

function buildFilename(article: Article, workFolder?: string): string {
  const kstPrefix = toKSTPrefix(article.dateRaw);
  const safeName = sanitize(article.title);

  // 서랍 글은 "서랍" 폴더, 작품이 있으면 작품 폴더, 없으면 루트
  const effectiveFolder = article.isDrawer
    ? (workFolder ? sanitize(workFolder) : "서랍")
    : (workFolder ? sanitize(workFolder) : "");

  const folderPart = effectiveFolder ? `${effectiveFolder}/` : "";
  const authorDir = `브런치_${article.author}/`;
  return `${authorDir}${folderPart}${kstPrefix}_${safeName}.md`;
}
