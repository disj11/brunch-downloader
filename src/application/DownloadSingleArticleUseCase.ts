import { ArticleRepository } from "../domain/ports/ArticleRepository";
import { DownloadGateway } from "../domain/ports/DownloadGateway";

export class DownloadSingleArticleUseCase {
  constructor(
    private readonly articleRepo: ArticleRepository,
    private readonly downloadGateway: DownloadGateway
  ) {}

  /** 현재 페이지의 글을 파싱하여 다운로드 */
  async execute(): Promise<void> {
    const article = await this.articleRepo.parseCurrent();
    await this.downloadGateway.downloadArticle(article, article.workName);
  }
}
