/** 파일명에 사용할 수 없는 문자 제거 */
export function sanitize(s: string): string {
  return (s || "제목없음")
    .replace(/[/\\:*?"<>|]/g, "_")
    .trim()
    .slice(0, 80);
}
