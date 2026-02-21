import { Article, DownloadProgress } from "../domain/entities/Article";
import { ArticleRepository } from "../domain/ports/ArticleRepository";
import { DownloadGateway } from "../domain/ports/DownloadGateway";

const CONCURRENCY = 5;

export class DownloadAllArticlesUseCase {
  constructor(
    private readonly articleRepo: ArticleRepository,
    private readonly downloadGateway: DownloadGateway,
    private readonly onProgress: (progress: DownloadProgress) => void
  ) {}

  async execute(authorId: string): Promise<void> {
    // 1. URL 수집 (DOM 스크롤)
    const urls = await this.articleRepo.collectArticleUrls(authorId);
    const total = urls.length;
    let failed = 0;

    this.onProgress({ total, done: 0, failed });

    // 2. 병렬 파싱 (세마포어 방식, 동시 5개)
    const articles = await this.parseWithConcurrency(urls, (done, title, success) => {
      if (!success) failed++;
      this.onProgress({ total, done, failed, current: title });
    });

    // 3. 작품별 그룹화 후 다운로드
    const workGroups = new Map<string, Article[]>();
    for (const article of articles) {
      const key = article.workName ?? "";
      if (!workGroups.has(key)) workGroups.set(key, []);
      workGroups.get(key)!.push(article);
    }

    const downloadTotal = articles.length;
    let downloadDone = 0;
    for (const [workName, groupArticles] of workGroups) {
      for (const article of groupArticles) {
        await this.downloadGateway.downloadArticle(article, workName || undefined);
        downloadDone++;
        this.onProgress({
          total: downloadTotal,
          done: downloadDone,
          failed,
          current: article.title,
        });
      }
    }
  }

  private async parseWithConcurrency(
    urls: string[],
    onOne: (done: number, title: string, success: boolean) => void
  ): Promise<Article[]> {
    const results: Article[] = [];
    let idx = 0;
    let done = 0;

    const worker = async () => {
      while (idx < urls.length) {
        const i = idx++;
        const url = urls[i];
        try {
          const article = await this.articleRepo.parseArticle(url);
          results.push(article);
          onOne(++done, article.title, true);
        } catch {
          onOne(++done, url, false);
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker)
    );
    return results;
  }
}
