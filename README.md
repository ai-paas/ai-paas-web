<p align="center">
  <img width="152" alt="image" src="https://github.com/user-attachments/assets/82c19d1b-9b03-4ee0-afa0-358bef19dec1" />
</p>

<div align="center">

# AI-PaaS Web

**AI 파이프라인과 이를 실행하는 인프라를 시각적으로 구축, 운영, 관측하는 프론트엔드**

노드 기반 워크플로우 빌더 · 데이터셋/모델/학습 관리 · VM·Kubernetes·GPU 인프라 관리 · 실시간 모니터링

[Features](#key-features) · [메뉴 구성](#메뉴-구성) · [Demo](#demo) · [Architecture](#architecture) · [Getting Started](#getting-started) · [Releases](#releases) · [Contributing](#contributing)

![release](https://img.shields.io/github/v/release/ai-paas/ai-paas-web?include_prereleases&label=release)
![license](https://img.shields.io/badge/license-Apache%20License%202.0-blue.svg)
![react](https://img.shields.io/badge/React-18-61dafb.svg?logo=react&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?logo=typescript&logoColor=white)
![vite](https://img.shields.io/badge/Vite-7-646cff.svg?logo=vite&logoColor=white)
![tailwind](https://img.shields.io/badge/TailwindCSS-4-06b6d4.svg?logo=tailwindcss&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10-f69220.svg?logo=pnpm&logoColor=white)

</div>

<img width="1848" height="807" alt="image" src="https://github.com/user-attachments/assets/67206d62-453f-4ad1-ae50-0f06aed86c8f" />


---

> **Note.** 이 저장소는 **프론트엔드 전용**입니다. 백엔드 API 및 인프라는 별도 저장소에서 관리됩니다. 게이트웨이는 [ai-paas-gateway](https://github.com/ai-paas/ai-paas-gateway)를 참고해 주세요.

## 목차

- [개요](#개요)
- [이 프로젝트가 필요한 이유](#이-프로젝트가-필요한-이유)
- [Key Features](#key-features)
- [메뉴 구성](#메뉴-구성)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [CI/CD](#cicd)
- [Releases](#releases)
- [Contributing](#contributing)
- [License](#license)

## 개요

**AI-PaaS Web**은 AI Platform-as-a-Service를 위한 웹 클라이언트입니다. 하나의 SPA 안에서 AI 파이프라인을 설계하고, 데이터셋과 모델을 관리하며, 이를 실행하는 VM · Kubernetes 클러스터 · GPU 자원까지 관리하고 실시간으로 관측할 수 있도록 설계되었습니다.

엔지니어에게는 코드를 쓰듯 자유로운 노드 기반 캔버스를, 운영자에게는 지금 무엇이 돌아가는지를 한눈에 보여주는 대시보드를 제공하는 것이 목표입니다. 엔드-투-엔드 타입 안정성, 도메인 중심 구조, 그리고 대규모 그래프 렌더링을 고려한 성능 설계가 이 프로젝트의 기반입니다.

## 이 프로젝트가 필요한 이유

AI 플랫폼을 둘러싼 사내 도구는 종종 스크립트, 노트북, 반쯤 방치된 관리자 페이지의 조합으로 끝납니다. 사용자는 툴을 옮겨 다녀야 하고, 운영자는 파편화된 상태를 짜깁기로 파악해야 합니다.

**AI-PaaS Web**은 이 경험을 하나의 제품 수준 프론트엔드로 묶어냅니다.

- **설계(Author)** — YAML 대신 캔버스 위에서 파이프라인을 조립합니다.
- **운영(Operate)** — 데이터셋, 모델, 프롬프트, 지식 베이스와 이를 실행할 인프라를 단일 UI에서 관리합니다.
- **관측(Observe)** — 실행, 이벤트, 로그, GPU 사용량을 같은 화면에서 추적합니다.

노드 수가 늘어나도, 이벤트가 쏟아져도, 테이블이 길어져도 — UI가 제품만큼 안정적으로 반응하도록 만드는 것이 이 저장소의 목표입니다.

## Key Features

### 🧩 Visual Workflow Builder
노드 기반 파이프라인 편집기. 커스텀 노드 타입, 타입 안정적인 엣지, 실시간 유효성 검증을 제공합니다. 수백 개 규모의 노드에서도 부드러운 상호작용을 유지하도록 렌더링이 최적화되어 있습니다. 워크플로우 템플릿과 배포, 텍스트 생성 · 객체 탐지 · RAG 채팅 등 유형별 테스트를 지원합니다.

### 📚 Dataset & Knowledge Base
업로드, 큐레이션, 검색까지 한 화면에서. 드래그 앤 드롭 업로드(최대 1GB)와 RAG 소스 관리, Retrieval Test를 기본 지원합니다.

### 🧠 Model & Prompt Registry
모델 카탈로그와 커스텀 모델(Hugging Face · Kaggle 연동), 프롬프트를 한곳에서 관리합니다.

### 🧪 Learning & Experiments
학습 생성 시 데이터 유형과 모델에 맞는 데이터셋을 골라 학습을 실행하고, 학습 결과와 지표를 상세 화면에서 확인합니다.

### 🖥 Infrastructure Management
VM과 Kubernetes 클러스터를 생성 · 관리합니다. CSP별 자격증명 등록, 생성 전 사전 검증(preflight), 여러 CSP 일괄 생성, 프로비저닝 진행률 실시간 표시를 지원하며, 상세 화면에서 SSH 접속과 웹 터미널을 바로 사용할 수 있습니다.

### 🎮 GPU & Accelerators
GPU(MIG 포함) · NPU · TPU 장치별 현황과 실사용량, 하드웨어 오류 신호를 보여줍니다. GPU 워크로드와 사용량 히트맵으로 자원이 어디에 얼마나 쓰이는지 추적합니다.

### 📦 Application (Helm)
Helm 차트 카탈로그에서 앱을 설치하고, 설치된 앱의 리비전 이력과 되돌리기(Rollback), 차트 저장소를 관리합니다.

### 📈 Realtime Monitoring
클러스터 · 노드 · 가속기 지표를 구간과 갱신 주기를 골라 조회합니다. 변경 스트림(SSE)으로 화면이 자동 갱신되며, Recharts 기반의 재사용 가능한 차트 프리미티브로 대시보드를 조립합니다.

### 🔐 Member & Audit
멤버 관리와 인증, 작업 이력, 감사 로그(Audit Log)를 제공합니다.

### 🎛 Consistent Design System
사내 디자인 시스템 `@innogrid/ui`를 바탕으로 폼, 테이블, 모달, 다이얼로그 같은 공용 패턴을 모든 도메인 화면에 걸쳐 일관되게 사용합니다. 반복 작업을 줄이고, 새로운 도메인 추가 속도를 높입니다.

## 메뉴 구성

| 메뉴 | 하위 메뉴 | 경로 |
| --- | --- | --- |
| 서비스 | — | `/service` |
| 워크플로우 | 워크플로우 · 워크플로우 템플릿 | `/workflow` |
| 모델 | 모델 카탈로그 · 커스텀 모델 | `/model` |
| 데이터셋 | — | `/dataset` |
| 지식 베이스 | — | `/knowledge-base` |
| 프롬프트 | — | `/prompt` |
| 학습 | — | `/learning` |
| 대시보드 | — | `/dashboard` |
| 인프라 관리 | VM · 클러스터 · 모니터링 | `/infra-management` |
| | GPU — GPU 워크로드 · 가속기 · 사용량 | |
| | 애플리케이션 — 차트 · 설치된 앱 · 저장소 | |
| | 설정 — 자격증명 · 에이전트 | |
| | 기록 — 작업 이력 · 감사 로그 | |
| 멤버 관리 | — | `/member-management` |

## Demo

> 화면의 워크플로우 · 지식 베이스 · 데이터셋 이름 등 일부 데이터는 가려져 있습니다.

### Workflow Builder

노드를 캔버스에 배치하고 연결해 AI 파이프라인을 조립합니다.

<img width="1457" alt="Workflow Builder" src="https://github.com/user-attachments/assets/d891ede4-d03a-415a-8a7b-a865df061d5e" />

### Infrastructure Monitoring

클러스터의 CPU · 메모리 · 파일 시스템 · 네트워크 · GPU/NPU/TPU 현황과 성능 지표를 구간과 갱신 주기를 골라 조회합니다.

<img width="1440" alt="Infrastructure Monitoring" src="https://github.com/user-attachments/assets/5198d356-407a-4b1f-93cb-4be853d238f3" />

### Dataset Management

데이터셋을 분류별로 등록하고 목록에서 검색 · 편집 · 삭제합니다.

<img width="1457" alt="Dataset Management" src="https://github.com/user-attachments/assets/90aa4df4-de54-4c8b-b995-dec2df9656d8" />

## Tech Stack

| 영역 | 선택 |
| --- | --- |
| Framework | **React 18** + **TypeScript 5.8** |
| Build | **Vite 7** (SWC) |
| Routing | **React Router v7** (전 라우트 lazy loading) |
| Server State | **TanStack Query v5** + **ky** |
| Realtime | **Server-Sent Events (SSE)** |
| Client State | **Zustand 5** |
| Forms & Validation | **React Hook Form** + **Zod 4** |
| Graph Canvas | **@xyflow/react 12** |
| Charts | **Recharts 3** |
| Editor · Terminal | **Monaco Editor** (YAML) · **xterm.js** |
| Markdown | **react-markdown** + **remark-gfm** |
| Styling | **Tailwind CSS v4** + **Sass** |
| UI Primitives | **@innogrid/ui** (사내 디자인 시스템) + **Radix UI** |
| Testing | **Vitest 4** + **Testing Library** + **MSW** · **Playwright** (E2E) |
| Package Manager | **pnpm 10** |

## Architecture

프로젝트는 기술 계층이 아닌 **도메인** 단위로 구성됩니다. 각 도메인은 자신의 페이지, 컴포넌트, 훅을 독립적으로 소유합니다.

```
src/
├── pages/          ─ 라우트 단위 화면 (service, workflow, model, dataset,
│                     knowledge-base, prompt, learning, dashboard,
│                     infra-management, member-management, …)
├── components/
│   ├── features/   ─ 도메인 전용 복합 컴포넌트
│   ├── layout/     ─ 앱 셸, 사이드바, 메뉴, 브레드크럼
│   ├── provider/   ─ 전역 프로바이더 (Query · Theme · Router)
│   └── ui/         ─ 도메인 무관 UI 컴포넌트
├── hooks/          ─ 공용 및 React Query 훅 (hooks/service/<domain>.ts)
├── lib/            ─ HTTP 클라이언트(ky), 쿼리 키 팩토리, SSE 클라이언트
├── router/         ─ 라우트 정의
├── store/          ─ Zustand 스토어
├── types/          ─ 공용 타입 계약
├── util/           ─ 순수 유틸리티
└── test/           ─ MSW 서버 · 핸들러, 렌더 헬퍼
e2e/                ─ Playwright E2E 테스트
```

## Getting Started

### 요구 사항

- **Node.js** 20 이상 (CI는 Node.js 24 사용)
- **pnpm** 10 이상
- 사내 npm 레지스트리 접근 권한 — 디자인 시스템 `@innogrid/ui`를 사내 레지스트리에서 설치합니다.

### 설치

```bash
pnpm install
```

### 환경 변수

프로젝트 루트에 `.env` 파일을 만들고 백엔드(게이트웨이) 주소를 지정합니다. 개발 서버는 `/api` 요청을 이 주소로 프록시합니다.

```bash
VITE_SERVER_URL=http://<backend-host>:<port>
```

### 개발 서버 실행

```bash
pnpm dev
```

개발 서버는 Vite 기본 포트(5173)에서 동작합니다.

### 주요 스크립트

| 명령 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 타입 체크 + 프로덕션 빌드 |
| `pnpm preview` | 프로덕션 빌드 미리보기 |
| `pnpm typecheck` | 타입 체크 (`tsc -b`) |
| `pnpm lint` | ESLint 실행 |
| `pnpm test` | 단위/컴포넌트 테스트 |
| `pnpm test:ui` | Vitest UI로 테스트 실행 |
| `pnpm test:coverage` | 커버리지 리포트 (임계값 미달 시 실패) |
| `pnpm test:e2e` | Playwright E2E 테스트 (API 목킹, 백엔드 불필요) |
| `pnpm test:e2e:ui` | Playwright UI 모드로 E2E 실행 |

### Docker

빌드된 정적 자산(`dist/`)을 nginx 위에 올리는 구조입니다. nginx는 `default.conf.template`의 `/api` 요청을 `VITE_SERVER_URL`로 프록시합니다.

```bash
pnpm build
docker build -t ai-paas-web .
docker run -d -p 8080:80 -e VITE_SERVER_URL=http://<backend-host>:<port> ai-paas-web
```

대용량 데이터셋 · 지식 베이스 업로드를 위해 `/api` 요청 본문은 최대 1GB, 타임아웃은 900초로 설정되어 있습니다.

## CI/CD

GitHub Actions로 다음을 자동 실행합니다.

| 시점 | 워크플로우 | 내용 |
| --- | --- | --- |
| `main` 대상 PR | `ci.yml` | lint → 테스트 · 커버리지 임계값 검사 → 빌드, Playwright E2E 스모크 |
| `main` 푸시 | `deploy.yml` | 테스트 · 빌드 → Docker 이미지 빌드 후 GHCR 푸시 → 서버 배포 |

## Releases

릴리즈 노트는 [GitHub Releases](https://github.com/ai-paas/ai-paas-web/releases)에서 확인할 수 있습니다.

| 버전 | 주요 내용 |
| --- | --- |
| [v0.2.0](https://github.com/ai-paas/ai-paas-web/releases/tag/v0.2.0) | 인프라 관리(VM · 클러스터 · 자격증명) 재설계, 프로비저닝 · 모니터링 · Helm 애플리케이션 정비, 의존성 보안 취약점 해소 |
| [v0.1.0](https://github.com/ai-paas/ai-paas-web/releases/tag/v0.1.0) | 첫 릴리즈 — 워크플로우, 모델, 데이터셋, 지식 베이스, 프롬프트, 학습, 서비스, 대시보드 |

## Contributing

기여는 언제나 환영합니다. 크고 작은 PR 모두 좋습니다.

1. `develop` 브랜치에서 피처 브랜치를 만들고, PR은 `develop`으로 올립니다. `main`에는 `develop`을 PR로 반영합니다.
2. 로컬에서 `pnpm typecheck`, `pnpm lint`, `pnpm test:coverage`를 통과시킵니다.
3. 변경 범위는 좁게 유지합니다. 큰 PR 하나보다 작은 PR 여러 개가 리뷰에 유리합니다.
4. PR 설명에는 _무엇_보다 _왜_에 초점을 맞춰 주세요.

영향 범위가 큰 변경(새 도메인 추가, 캔버스 내부 구조, 데이터 페칭 패턴 개편 등)은 먼저 이슈를 열어 방향을 맞춘 뒤 진행해 주시면 좋습니다.

코드 컨벤션과 테스트 규칙은 [`CLAUDE.md`](CLAUDE.md)와 [`src/test/README.md`](src/test/README.md)를 참고해 주세요.

## License

[Apache License 2.0](LICENSE) 하에 배포됩니다.

---

<div align="center">

**Built with React, TypeScript, and @xyflow/react.**

</div>
