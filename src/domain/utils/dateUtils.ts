/**
 * dateRaw를 KST(+09:00) 기준 ISO 문자열로 반환.
 * datePublished가 이미 +09:00인 경우 그대로 사용.
 */
export function toKSTDateText(dateRaw: string): string {
  if (!dateRaw) return "";

  // 이미 +09:00 형식이면 그대로 반환
  if (dateRaw.includes("+09:00")) {
    return dateRaw.slice(0, 25); // "2024-03-15T09:00:00+09:00"
  }

  const d = new Date(dateRaw);
  if (isNaN(d.getTime())) return dateRaw.slice(0, 19);

  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${kst.getUTCFullYear()}-${pad(kst.getUTCMonth() + 1)}-${pad(kst.getUTCDate())}` +
    `T${pad(kst.getUTCHours())}:${pad(kst.getUTCMinutes())}:${pad(kst.getUTCSeconds())}+09:00`
  );
}

/**
 * 파일명 prefix용 KST yyMMdd 문자열 반환.
 */
export function toKSTPrefix(dateRaw: string): string {
  const kstText = toKSTDateText(dateRaw);
  const match = kstText.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "000000";
  return `${match[1].slice(2)}${match[2]}${match[3]}`;
}
