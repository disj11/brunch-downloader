import { Article } from "../entities/Article";

/** Article 엔티티를 Markdown 파일 내용(프론트매터 + 본문)으로 변환 */
export function buildMarkdown(article: Article): string {
  const lines = [
    "---",
    `title: "${article.title.replace(/"/g, '\\"')}"`,
  ];
  if (article.subtitle) lines.push(`subtitle: "${article.subtitle.replace(/"/g, '\\"')}"`);
  if (article.workName) lines.push(`category: "${article.workName.replace(/"/g, '\\"')}"`);
  if (article.tags && article.tags.length > 0) {
    lines.push(`tags: [${article.tags.map((t) => `"${t.replace(/"/g, '\\"')}"`).join(", ")}]`);
  }
  if (article.dateText) lines.push(`date: "${article.dateText}"`);
  lines.push(`url: "${article.url}"`);
  lines.push(`author: "${article.author}"`);
  lines.push("---", "");

  let body = "";
  if (article.workName) body += `> 작품: ${article.workName}\n\n`;
  body += `# ${article.title}\n\n`;
  if (article.subtitle) body += `*${article.subtitle}*\n\n`;
  body += article.content;

  return lines.join("\n") + body.trim();
}
