import { PageContext } from "../../infrastructure/messaging/messages";

const PAGE_LABEL: Record<string, string> = {
  profile: "작가 프로필",
  article: "글 페이지",
  magazine: "매거진 글",
  manage: "관리 페이지",
  other: "기타",
};

interface AuthorHeaderProps {
  pageContext: PageContext;
}

export function AuthorHeader({ pageContext }: AuthorHeaderProps) {
  return (
    <div className="mb-3">
      {pageContext.authorId && (
        <p className="text-base font-semibold text-gray-800 truncate">
          {pageContext.authorId}
        </p>
      )}
      <p className="text-xs text-gray-500">{PAGE_LABEL[pageContext.pageType] ?? "브런치"}</p>
      {pageContext.articleTitle && (
        <p className="mt-1 text-xs text-gray-600 line-clamp-2 leading-snug">
          &ldquo;{pageContext.articleTitle}&rdquo;
        </p>
      )}
    </div>
  );
}
