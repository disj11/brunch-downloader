interface ArticleListProps {
  current?: string;
  done: number;
  total: number;
}

/** 현재 처리 중인 글과 진행 카운트를 간략히 표시 */
export function ArticleList({ current, done, total }: ArticleListProps) {
  if (!current && total === 0) return null;

  return (
    <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
      {total > 0 && (
        <p className="text-xs text-gray-500 mb-1">
          {done} / {total}개 처리
        </p>
      )}
      {current && (
        <p className="text-xs text-gray-700 truncate" title={current}>
          {current}
        </p>
      )}
    </div>
  );
}
