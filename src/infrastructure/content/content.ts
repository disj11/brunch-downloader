import { BrunchArticleRepository } from "../../adapters/secondary/BrunchArticleRepository";
import { ChromeDownloadGateway } from "../../adapters/secondary/ChromeDownloadGateway";
import { DownloadAllArticlesUseCase } from "../../application/DownloadAllArticlesUseCase";
import { DownloadSingleArticleUseCase } from "../../application/DownloadSingleArticleUseCase";
import { DownloadDrawerArticlesUseCase } from "../../application/DownloadDrawerArticlesUseCase";
import { DownloadProgress } from "../../domain/entities/Article";
import { DrawerSection, Message, PageContext } from "../messaging/messages";

/** 현재 브런치 페이지 컨텍스트 감지 */
function getPageContext(): PageContext {
  const pathname = location.pathname;

  const profileMatch = pathname.match(/^\/@([\w]+)$/);
  if (profileMatch) {
    return { pageType: "profile", authorId: `@${profileMatch[1]}` };
  }

  const articleMatch = pathname.match(/^\/@([\w]+)\/(\d+)$/);
  if (articleMatch) {
    const titleEl = document.querySelector(
      "h1.cover_title, .artikel_tit, .article_tit, h1"
    );
    return {
      pageType: "article",
      authorId: `@${articleMatch[1]}`,
      articleTitle: titleEl?.textContent?.trim() ?? "",
    };
  }

  const magazineMatch = pathname.match(/^\/@@([\w]+)\/\d+$/);
  if (magazineMatch) {
    // JSON-LD에서 작가 ID 추출 시도
    let authorId: string | null = null;
    document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
      try {
        const p = JSON.parse(s.textContent ?? "") as Record<string, unknown>;
        const authorObj = p["author"] as { url?: string } | undefined;
        if (p["@type"] === "BlogPosting" && authorObj?.url) {
          const m = String(authorObj.url).match(/@([\w]+)/);
          if (m) authorId = `@${m[1]}`;
        }
      } catch {
        // 파싱 실패 무시
      }
    });
    return { pageType: "magazine", authorId };
  }

  if (pathname === "/ready") {
    return { pageType: "drawer", authorId: null };
  }

  if (pathname.startsWith("/manage")) {
    return { pageType: "manage", authorId: null };
  }

  return { pageType: "other", authorId: null };
}

/** Popup으로 진행 상황 전송 */
function sendProgress(progress: DownloadProgress): void {
  chrome.runtime
    .sendMessage({ type: "PROGRESS_UPDATE", payload: progress } as Message)
    .catch(() => {
      // Popup이 닫혀있으면 무시
    });
}

chrome.runtime.onMessage.addListener(
  (message: Message, _sender: chrome.runtime.MessageSender, sendResponse) => {
    if (message.type === "GET_PAGE_CONTEXT") {
      sendResponse(getPageContext());
      return false;
    }

    if (message.type === "DOWNLOAD_ALL") {
      const { authorId } = message.payload as { authorId: string };
      sendResponse({ ok: true });

      const repo = new BrunchArticleRepository();
      const gateway = new ChromeDownloadGateway();
      const useCase = new DownloadAllArticlesUseCase(repo, gateway, sendProgress);

      useCase
        .execute(authorId)
        .then(() => {
          chrome.runtime
            .sendMessage({ type: "DOWNLOAD_COMPLETE" } as Message)
            .catch(() => {});
        })
        .catch((err: Error) => {
          chrome.runtime
            .sendMessage({
              type: "DOWNLOAD_ERROR",
              payload: { error: err.message },
            } as Message)
            .catch(() => {});
        });
      return true;
    }

    if (message.type === "DOWNLOAD_SINGLE") {
      sendResponse({ ok: true });

      const repo = new BrunchArticleRepository();
      const gateway = new ChromeDownloadGateway();
      const useCase = new DownloadSingleArticleUseCase(repo, gateway);

      useCase
        .execute()
        .then(() => {
          chrome.runtime
            .sendMessage({ type: "DOWNLOAD_COMPLETE" } as Message)
            .catch(() => {});
        })
        .catch((err: Error) => {
          chrome.runtime
            .sendMessage({
              type: "DOWNLOAD_ERROR",
              payload: { error: err.message },
            } as Message)
            .catch(() => {});
        });
      return true;
    }

    if (message.type === "DOWNLOAD_DRAWER") {
      const { section } = message.payload as { section: DrawerSection };
      sendResponse({ ok: true });

      const repo = new BrunchArticleRepository();
      const gateway = new ChromeDownloadGateway();
      const useCase = new DownloadDrawerArticlesUseCase(repo, gateway, sendProgress);

      useCase
        .execute(section)
        .then(() => {
          chrome.runtime
            .sendMessage({ type: "DOWNLOAD_COMPLETE" } as Message)
            .catch(() => {});
        })
        .catch((err: Error) => {
          chrome.runtime
            .sendMessage({
              type: "DOWNLOAD_ERROR",
              payload: { error: err.message },
            } as Message)
            .catch(() => {});
        });
      return true;
    }

    return false;
  }
);
