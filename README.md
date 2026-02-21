# Brunch Downloader

브런치(brunch.co.kr) 글을 Markdown 파일로 다운로드하는 Chrome 확장 프로그램입니다.

## 기능

- **전체 글 다운로드** — 작가 프로필 페이지에서 모든 글을 한 번에 다운로드
- **단일 글 다운로드** — 현재 보고 있는 글만 다운로드
- **서랍 글 다운로드** — 저장 글 / 예약 글 / 발행 취소 글 섹션별 다운로드
- 작품(브런치북/매거진)별 폴더 자동 분류
- 프론트매터 포함 Markdown 형식 저장 (제목, 부제목, 작품명, 태그, 날짜, URL)

## 지원 페이지

| 페이지 | URL 패턴 | 기능 |
|--------|----------|------|
| 작가 프로필 | `brunch.co.kr/@작가ID` | 전체 글 다운로드 |
| 글 / 매거진 글 | `brunch.co.kr/@작가ID/숫자` | 이 글만 다운로드 |
| 서랍 | `brunch.co.kr/ready` | 저장 · 예약 · 발행취소 글 다운로드 |

## 설치 (개발 빌드)

### 요구 사항

- Node.js 18+
- pnpm

### 빌드

```bash
pnpm install
pnpm build
```

`dist/` 폴더에 빌드 결과물이 생성됩니다.

### 크롬에 설치

1. Chrome에서 `chrome://extensions` 열기
2. 우측 상단 **개발자 모드** 활성화
3. **압축해제된 확장 프로그램을 로드합니다** 클릭
4. `dist/` 폴더 선택

## 출력 형식

```markdown
---
title: "글 제목"
subtitle: "부제목"
category: "작품명"
tags: ["태그1", "태그2"]
date: "2024-03-15T09:00:00+09:00"
url: "https://brunch.co.kr/@author/123"
author: "@author"
---

> 작품: 작품명

# 글 제목

*부제목*

본문 내용...
```

파일은 `작가ID/작품명/날짜-제목.md` 형태로 저장됩니다.

## 기술 스택

- Chrome Manifest V3
- TypeScript + React 18 + Tailwind CSS
- Vite + vite-plugin-web-extension
- 헥사고날 아키텍처 (Ports & Adapters)

## 주의사항

이 확장 프로그램은 **본인이 작성한 글의 개인 백업**을 목적으로 합니다. 브런치 이용약관 및 저작권법을 준수하여 사용하세요.
