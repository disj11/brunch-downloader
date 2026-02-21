import { Article } from "../../domain/entities/Article";
import { ArticleRepository } from "../../domain/ports/ArticleRepository";
import { toKSTDateText } from "../../domain/utils/dateUtils";
import { BrunchDomParser } from "../../infrastructure/content/BrunchDomParser";
import { DrawerSection } from "../../infrastructure/messaging/messages";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Content Script 컨텍스트에서 동작하는 브런치 기사 리포지토리 */
export class BrunchArticleRepository implements ArticleRepository {
  /** 작가 프로필 페이지에서 DOM 스크롤하며 글 URL 목록 수집 */
  async collectArticleUrls(authorId: string): Promise<string[]> {
    const urls = new Set<string>();
    const cleanId = authorId.replace(/^@/, "");
    const urlRe = new RegExp(`/@${cleanId}/\\d+`);
    const aaUrlRe = /\/@@[\w]+\/\d+/;

    function pickLinks() {
      document.querySelectorAll("a[href]").forEach((a) => {
        const href = a.getAttribute("href");
        if (!href) return;
        if (urlRe.test(href) || aaUrlRe.test(href)) {
          const full = href.startsWith("http") ? href : location.origin + href;
          urls.add(full);
        }
      });
    }

    let prevSize = -1;
    let staleCount = 0;

    while (staleCount < 5) {
      pickLinks();
      if (urls.size === prevSize) {
        staleCount++;
      } else {
        staleCount = 0;
      }
      prevSize = urls.size;
      window.scrollTo(0, document.body.scrollHeight);
      await sleep(1500);
    }

    window.scrollTo(0, 0);

    // 현재 작가 글만 필터
    const authorRe = new RegExp(`/@${cleanId}/\\d+|/@@[\\w]+/\\d+`);
    return [...urls].filter((u) => authorRe.test(u));
  }

  /** URL의 글 페이지 fetch 후 파싱 */
  async parseArticle(url: string): Promise<Article> {
    const res = await fetch(url, { credentials: "include" });
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return this.parseDocument(doc, url);
  }

  /** 현재 페이지(document) 직접 파싱 */
  async parseCurrent(): Promise<Article> {
    return this.parseDocument(document, location.href);
  }

  /**
   * 서랍 섹션별 글 URL 수집 (brunch.co.kr/ready 페이지에서 호출).
   *
   * - draft:          .wrap_draft_article 내 첫 번째 .wrap_article_list  (저장 글)
   *                   → 현재 페이지 스크롤하며 수집 (무한 스크롤 대응)
   * - draft_reserved: .wrap_draft_article 내 두 번째 .wrap_article_list  (예약 글)
   *                   → DOM에 이미 로드된 항목 직접 조회
   * - private:        .wrap_private_article .wrap_article_list            (발행 취소 글)
   *                   → DOM에 이미 로드된 항목 직접 조회
   */
  async collectDrawerUrls(section: DrawerSection): Promise<string[]> {
    const urlRe = /\/@[\w]+\/\d+|\/@@[\w]+\/\d+/;

    const toAbsolute = (href: string) =>
      href.startsWith("http") ? href : location.origin + href;

    const collectFrom = (container: Element | null): string[] => {
      if (!container) return [];
      const urls: string[] = [];
      container.querySelectorAll("a.link_post[href]").forEach((a) => {
        const href = a.getAttribute("href");
        if (href && urlRe.test(href)) urls.push(toAbsolute(href));
      });
      return urls;
    };

    if (section === "draft") {
      // 저장 글: 첫 번째 wrap_article_list, 스크롤하며 수집
      const urls = new Set<string>();
      const draftList = document.querySelectorAll(
        ".wrap_draft_article .wrap_article_list"
      )[0] ?? null;

      let prevSize = -1;
      let staleCount = 0;
      while (staleCount < 3) {
        collectFrom(draftList).forEach((u) => urls.add(u));
        if (urls.size === prevSize) staleCount++;
        else staleCount = 0;
        prevSize = urls.size;
        window.scrollTo(0, document.body.scrollHeight);
        await sleep(1500);
      }
      window.scrollTo(0, 0);
      return [...urls];
    }

    if (section === "draft_reserved") {
      // 예약 글: 두 번째 wrap_article_list (hidden이지만 DOM에 존재)
      const container =
        document.querySelectorAll(".wrap_draft_article .wrap_article_list")[1] ?? null;
      return collectFrom(container);
    }

    // private: 발행 취소 글
    const container =
      document.querySelector(".wrap_private_article .wrap_article_list") ?? null;
    return collectFrom(container);
  }

  private parseDocument(doc: Document, url: string): Article {
    // JSON-LD 파싱 (가장 신뢰할 수 있는 소스)
    let jsonld: Record<string, unknown> = {};
    doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
      try {
        const p = JSON.parse(s.textContent ?? "") as Record<string, unknown>;
        if (p["@type"] === "BlogPosting") jsonld = p;
      } catch {
        // JSON parse 실패 시 무시
      }
    });

    // 제목
    const title =
      (jsonld["headline"] as string | undefined) ||
      doc.querySelector("h1.cover_title, .artikel_tit, .article_tit, h1.tit_article, h1")
        ?.textContent?.trim() ||
      "제목없음";

    // 부제목
    const subtitle =
      doc
        .querySelector(".cover_sub_title, .artikel_sub_tit, .sub_titel, .sub_title")
        ?.textContent?.trim() || "";

    // 날짜 (JSON-LD datePublished는 이미 KST +09:00)
    const dateRaw =
      (jsonld["datePublished"] as string | undefined) ||
      doc
        .querySelector('meta[property="article:published_time"]')
        ?.getAttribute("content") ||
      doc.querySelector(".article_date, .date_info, time")?.textContent?.trim() ||
      "";
    const dateText = toKSTDateText(dateRaw);

    // 작품명 (브런치북/매거진)
    // 1순위: <tiara-page data-tiara-series="..."> — 가장 신뢰할 수 있는 소스
    // 2순위: DOM 링크 (구형 레이아웃 대비)
    const tiaraEl = doc.querySelector("tiara-page");
    const workName =
      tiaraEl?.getAttribute("data-tiara-series")?.trim() ||
      doc.querySelector('a[href^="/magazine/"]')?.textContent?.trim() ||
      doc.querySelector('a[href^="/brunch/"]')?.textContent?.trim() ||
      doc.querySelector(".wrap_cover_book a, .cover_book a, .book_title a")
        ?.textContent?.trim() ||
      "";

    // 발행 키워드 (tags)
    // 1순위: tiara-page[data-tiara-tags] — "에세이, 감정, 계절"
    const tagsRaw = tiaraEl?.getAttribute("data-tiara-tags") || "";
    let tags: string[] = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    // 2순위: #ARTICLE_DATA JSON articleKeywords
    if (tags.length === 0) {
      try {
        const articleDataEl = doc.querySelector("#ARTICLE_DATA");
        if (articleDataEl) {
          const data = JSON.parse(articleDataEl.textContent ?? "") as {
            articleKeywords?: { keyword: string }[];
          };
          tags = data.articleKeywords?.map((k) => k.keyword) ?? [];
        }
      } catch {
        // JSON parse 실패 시 무시
      }
    }
    // 3순위: DOM a.link_keyword
    if (tags.length === 0) {
      doc.querySelectorAll("a.link_keyword[href]").forEach((a) => {
        const t = a.textContent?.trim();
        if (t) tags.push(t);
      });
    }

    // 작가 ID (JSON-LD author.url에서 추출)
    const authorObj = jsonld["author"] as { url?: string } | undefined;
    const authorUrl = authorObj?.url || url;
    const authorMatch = authorUrl.match(/@([\w]+)/);
    const author = authorMatch ? `@${authorMatch[1]}` : "@unknown";

    // 본문 (JSON-LD articleBody 우선, 없으면 DOM에서 추출)
    let content = "";
    const jsonldBody = jsonld["articleBody"] as string | undefined;
    if (jsonldBody && jsonldBody.trim().length > 50) {
      content = jsonldBody.trim();
    } else {
      const bodyEl =
        doc.querySelector(".wrap_body_frame") ||
        doc.querySelector(".wrap_body") ||
        doc.querySelector(".artikel_body") ||
        doc.querySelector(".article_body") ||
        doc.querySelector("#article_body");
      content = bodyEl ? BrunchDomParser.toMarkdown(bodyEl) : "";
    }

    return {
      title,
      subtitle: subtitle || undefined,
      workName: workName || undefined,
      tags: tags.length > 0 ? tags : undefined,
      dateText,
      dateRaw,
      url,
      author,
      content,
    };
  }
}
