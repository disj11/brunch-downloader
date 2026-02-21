import { DownloadProgress } from "../domain/entities/Article";
import { ArticleRepository } from "../domain/ports/ArticleRepository";
import { DownloadGateway } from "../domain/ports/DownloadGateway";
import { DrawerSection } from "../infrastructure/messaging/messages";

export class DownloadDrawerArticlesUseCase {
  constructor(
    private readonly articleRepo: ArticleRepository,
    private readonly downloadGateway: DownloadGateway,
    private readonly onProgress: (progress: DownloadProgress) => void
  ) {}

  async execute(section: DrawerSection): Promise<void> {
    const urls = await this.articleRepo.collectDrawerUrls(section);
    const total = urls.length;
    let done = 0;
    let failed = 0;

    this.onProgress({ total, done, failed });

    for (const url of urls) {
      try {
        const article = await this.articleRepo.parseArticle(url);
        // 서랍 글 표시: workName이 있으면 해당 폴더, 없으면 "서랍" 폴더
        const drawerArticle = { ...article, isDrawer: true };
        await this.downloadGateway.downloadArticle(drawerArticle, article.workName ?? "서랍");
        done++;
        this.onProgress({ total, done, failed, current: article.title });
      } catch {
        failed++;
        this.onProgress({ total, done, failed });
      }
    }
  }
}
