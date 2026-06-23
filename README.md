<p align="center">
  <img width="152" alt="image" src="https://github.com/user-attachments/assets/82c19d1b-9b03-4ee0-afa0-358bef19dec1" />
</p>

<div align="center">

# AI-PaaS Web

**AI 파이프라인을 시각적으로 구축, 운영, 관측하는 프론트엔드**

노드 기반 워크플로우 빌더 · 데이터셋/모델/실험 관리 · 실시간 모니터링 대시보드

[Demo](#demo) · [Features](#key-features) · [Architecture](#architecture) · [Getting Started](#getting-started) · [Contributing](#contributing)

![license](https://img.shields.io/badge/license-Apache%20License%202.0-blue.svg)
![react](https://img.shields.io/badge/React-18-61dafb.svg?logo=react&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?logo=typescript&logoColor=white)
![vite](https://img.shields.io/badge/Vite-7-646cff.svg?logo=vite&logoColor=white)
![tailwind](https://img.shields.io/badge/TailwindCSS-4-06b6d4.svg?logo=tailwindcss&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10-f69220.svg?logo=pnpm&logoColor=white)

</div>

<img width="1848" height="807" alt="image" src="https://github.com/user-attachments/assets/67206d62-453f-4ad1-ae50-0f06aed86c8f" />


---

> **Note.** 이 저장소는 **프론트엔드 전용**입니다. 백엔드 API 및 인프라는 별도 저장소에서 관리됩니다.

## 목차

- [개요](#개요)
- [이 프로젝트가 필요한 이유](#이-프로젝트가-필요한-이유)
- [Key Features](#key-features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

## 개요

**AI-PaaS Web**은 AI Platform-as-a-Service를 위한 웹 클라이언트입니다. 하나의 SPA 안에서 AI 파이프라인을 설계하고, 데이터셋과 모델을 관리하며, 실행 중인 서비스를 실시간으로 관측할 수 있도록 설계되었습니다.

엔지니어에게는 코드를 쓰듯 자유로운 노드 기반 캔버스를, 운영자에게는 지금 무엇이 돌아가는지를 한눈에 보여주는 대시보드를 제공하는 것이 목표입니다. 엔드-투-엔드 타입 안정성, 도메인 중심 구조, 그리고 대규모 그래프 렌더링을 고려한 성능 설계가 이 프로젝트의 기반입니다.

## 이 프로젝트가 필요한 이유

AI 플랫폼을 둘러싼 사내 도구는 종종 스크립트, 노트북, 반쯤 방치된 관리자 페이지의 조합으로 끝납니다. 사용자는 툴을 옮겨 다녀야 하고, 운영자는 파편화된 상태를 짜깁기로 파악해야 합니다.

**AI-PaaS Web**은 이 경험을 하나의 제품 수준 프론트엔드로 묶어냅니다.

- **설계(Author)** — YAML 대신 캔버스 위에서 파이프라인을 조립합니다.
- **운영(Operate)** — 데이터셋, 모델, 프롬프트, 지식 베이스를 단일 UI에서 관리합니다.
- **관측(Observe)** — 실행, 이벤트, 로그를 같은 화면에서 추적합니다.

노드 수가 늘어나도, 이벤트가 쏟아져도, 테이블이 길어져도 — UI가 제품만큼 안정적으로 반응하도록 만드는 것이 이 저장소의 목표입니다.

## Key Features

### 🧩 Visual Workflow Builder
노드 기반 파이프라인 편집기. 커스텀 노드 타입, 타입 안정적인 엣지, 실시간 유효성 검증을 제공합니다. 수백 개 규모의 노드에서도 부드러운 상호작용을 유지하도록 렌더링이 최적화되어 있습니다.

### 📚 Dataset & Knowledge Base
업로드, 큐레이션, 검색까지 한 화면에서. 드래그 앤 드롭 업로드와 RAG 소스 관리를 기본 지원합니다.

### 🧠 Model & Prompt Registry
모델과 프롬프트 버전을 한 카탈로그에서 비교·배포합니다. 학습 결과와 추론 결과가 같은 시각적 맥락에서 정렬됩니다.

### 🧪 Learning & Experiments
학습 런과 파라미터, 결과를 나란히 비교할 수 있는 전용 뷰를 제공합니다.

### 📈 Realtime Monitoring
서비스 상태, 이벤트 스트림, 로그 시각화를 구성 가능한 차트 위에서 다룹니다. Recharts 기반의 재사용 가능한 차트 프리미티브로 대시보드를 조립합니다.

### 🎛 Consistent Design System
폼, 테이블, 모달, 다이얼로그 같은 공용 패턴을 모든 도메인 화면에 걸쳐 일관되게 사용합니다. 반복 작업을 줄이고, 새로운 도메인 추가 속도를 높입니다.

## Demo

> 스크린샷과 라이브 데모는 준비 중입니다.

| Workflow Builder | Monitoring Dashboard | Dataset Management |
| :--: | :--: | :--: |
| _coming soon_ | _coming soon_ | _coming soon_ |

## Tech Stack

| 영역 | 선택 |
| --- | --- |
| Framework | **React 18** + **TypeScript 5.8** |
| Build | **Vite 7** (SWC) |
| Routing | **React Router v7** |
| Server State | **TanStack Query v5** + **ky** |
| Client State | **Zustand** |
| Forms & Validation | **React Hook Form** + **Zod** |
| Graph Canvas | **@xyflow/react** |
| Charts | **Recharts** |
| Styling | **Tailwind CSS v4** |
| UI Primitives | **Radix UI** |
| Testing | **Vitest** + **Testing Library** + **MSW** |
| Package Manager | **pnpm 10** |

## Architecture

프로젝트는 기술 계층이 아닌 **도메인** 단위로 구성됩니다. 각 도메인은 자신의 페이지, 컴포넌트, 훅을 독립적으로 소유합니다.

```
src/
├── pages/          ─ 라우트 단위 화면 (workflow, dataset, model, learning,
│                     knowledge-base, prompt, service, dashboard, …)
├── components/
│   ├── features/   ─ 도메인 전용 복합 컴포넌트
│   ├── layout/     ─ 앱 셸, 사이드바, 브레드크럼
│   ├── provider/   ─ 전역 프로바이더 (Query · Theme · Router)
│   └── ui/         ─ 디자인 시스템 프리미티브
├── hooks/          ─ 공용 및 React Query 훅
├── lib/            ─ HTTP 클라이언트, Query 클라이언트
├── router/         ─ 라우트 정의
├── store/          ─ Zustand 스토어
├── types/          ─ 공용 타입 계약
└── util/           ─ 순수 유틸리티
```

## Getting Started

### 요구 사항

- **Node.js** 20 이상
- **pnpm** 10 이상

### 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev
```

개발 서버는 Vite 기본 포트에서 동작합니다. 실행 전 환경 변수에서 백엔드 엔드포인트를 설정해 주세요.

### 주요 스크립트

| 명령 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 타입 체크 + 프로덕션 빌드 |
| `pnpm preview` | 프로덕션 빌드 미리보기 |
| `pnpm lint` | ESLint 실행 |
| `pnpm test` | 단위/컴포넌트 테스트 |
| `pnpm test:ui` | Vitest UI로 테스트 실행 |
| `pnpm test:coverage` | 커버리지 리포트 |

### Docker

컨테이너 기반 배포를 위한 `Dockerfile`과 nginx `default.conf.template`이 포함되어 있습니다. 빌드된 정적 자산을 nginx 위에 올리는 구조입니다.

## Contributing

기여는 언제나 환영합니다. 크고 작은 PR 모두 좋습니다.

1. 저장소를 포크한 뒤 피처 브랜치를 만듭니다.
2. 로컬에서 `pnpm lint`와 `pnpm test`를 통과시킵니다.
3. 변경 범위는 좁게 유지합니다. 큰 PR 하나보다 작은 PR 여러 개가 리뷰에 유리합니다.
4. PR 설명에는 _무엇_보다 _왜_에 초점을 맞춰 주세요.

영향 범위가 큰 변경(새 도메인 추가, 캔버스 내부 구조, 데이터 페칭 패턴 개편 등)은 먼저 이슈를 열어 방향을 맞춘 뒤 진행해 주시면 좋습니다.

자세한 규칙은 `CONTRIBUTING.md`를 참고해 주세요.

## License

[Apache License 2.0](LICENSE) 하에 배포됩니다.

---

<div align="center">

**Built with React, TypeScript, and @xyflow/react.**

</div>
