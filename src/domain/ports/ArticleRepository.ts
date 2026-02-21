import { Article } from "../entities/Article";
import { DrawerSection } from "../../infrastructure/messaging/messages";

export interface ArticleRepository {
  /** 작가 프로필 페이지 DOM에서 스크롤하며 글 URL 목록 수집 */
  collectArticleUrls(authorId: string): Promise<string[]>;
  /** 특정 URL의 글 파싱 */
  parseArticle(url: string): Promise<Article>;
  /** 현재 페이지(document) 파싱 */
  parseCurrent(): Promise<Article>;
  /** 서랍 특정 섹션의 글 URL 목록 수집 (brunch.co.kr/ready 페이지에서 호출) */
  collectDrawerUrls(section: DrawerSection): Promise<string[]>;
}
