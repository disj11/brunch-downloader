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

## 설치

### 릴리즈에서 다운로드 (권장)

1. [Releases](../../releases) 페이지에서 최신 버전의 `brunch-downloader-vX.X.X.zip` 다운로드
2. 다운로드한 zip 파일의 압축 해제
3. Chrome에서 `chrome://extensions` 열기
4. 우측 상단 **개발자 모드** 활성화
5. **압축해제된 확장 프로그램을 로드합니다** 클릭
6. 압축 해제된 폴더 선택

> **개발자 모드 안내**
> Chrome 웹 스토어를 통하지 않은 확장 프로그램은 개발자 모드를 활성화해야 설치할 수 있습니다.
> 설치 후 개발자 모드를 다시 꺼도 확장 프로그램은 계속 동작합니다.

### 직접 빌드

```bash
pnpm install
pnpm build
```

`dist/` 폴더가 생성되면 위 3~6단계를 동일하게 진행합니다.

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
