import { Article } from "../entities/Article";

export interface DownloadGateway {
  downloadArticle(article: Article, workFolder?: string): Promise<void>;
}
