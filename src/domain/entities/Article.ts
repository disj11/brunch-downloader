export interface Article {
  title: string;
  subtitle?: string;
  workName?: string;       // 작품(매거진/브런치북) 이름 — 폴더 분류에 사용
  tags?: string[];         // 발행 키워드
  dateText: string;        // KST datetime string: yyyy-MM-ddTHH:mm:ss+09:00
  dateRaw: string;         // 원본 datePublished 값
  url: string;
  author: string;          // "@authorId"
  content: string;         // Markdown 본문
  isDrawer?: boolean;      // 서랍 글 여부
}

export interface DownloadProgress {
  total: number;
  done: number;
  failed: number;
  current?: string;        // 현재 처리 중인 글 제목
}
