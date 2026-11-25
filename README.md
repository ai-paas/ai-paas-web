<p align="center">
  <img width="152" alt="AI-PaaS" src="https://github.com/user-attachments/assets/82c19d1b-9b03-4ee0-afa0-358bef19dec1" />
</p>

<div align="center">

# AI-PaaS Web

**AI 파이프라인과 이를 실행하는 인프라를 시각적으로 구축, 운영, 관측하는 웹 콘솔**

노드 기반 워크플로우 빌더 · 데이터셋/모델/학습 관리 · VM·Kubernetes·GPU 인프라 관리 · 실시간 모니터링

[Features](#key-features) · [Screenshots](#screenshots) · [Quick Start](#quick-start) · [Development](#development) · [Releases](#releases)

[![Build and Deploy](https://github.com/ai-paas/ai-paas-web/actions/workflows/deploy.yml/badge.svg)](https://github.com/ai-paas/ai-paas-web/actions/workflows/deploy.yml)
[![License](https://img.shields.io/badge/license-Apache%20License%202.0-blue.svg)](LICENSE)

</div>

<img width="1848" height="807" alt="AI-PaaS Web 화면" src="https://github.com/user-attachments/assets/67206d62-453f-4ad1-ae50-0f06aed86c8f" />

**AI-PaaS Web**은 AI Platform-as-a-Service의 웹 콘솔입니다. 하나의 콘솔에서 AI 파이프라인을 설계하고, 데이터셋 · 모델 · 프롬프트 · 지식 베이스를 관리하며, 이를 실행하는 VM · Kubernetes 클러스터 · GPU 자원까지 운영하고 관측합니다.

- **설계(Author)** — YAML 대신 캔버스 위에서 노드를 연결해 파이프라인을 조립합니다.
- **운영(Operate)** — AI 자산과 이를 실행할 인프라를 하나의 UI에서 관리합니다.
- **관측(Observe)** — 서비스 지표, 클러스터 상태, GPU 사용량을 같은 콘솔에서 추적합니다.

> **Note.** 이 저장소는 **프론트엔드 전용**입니다. 백엔드 API는 [ai-paas-gateway](https://github.com/ai-paas/ai-paas-gateway)를, 그 밖의 구성 요소는 [ai-paas 조직](https://github.com/ai-paas)의 저장소를 참고해 주세요.

## Key Features

- **Workflow Builder** — 시작 · 모델 · 지식베이스 · 끝 노드를 캔버스에 배치하고 연결해 파이프라인을 만듭니다. 복사 · 붙여넣기, 실행 취소, 미니맵, 체크리스트 검증을 제공하고, 템플릿 · 배포 · 유형별 테스트(텍스트 생성, 객체 탐지, RAG 채팅 등)를 지원합니다.
- **Service** — 서비스에 속한 워크플로우 · 모델 · 지식 베이스 · 프롬프트를 한 화면에서 보고, 메시지 수 · 토큰 사용량 · 응답 시간 · 성공률을 기간별로 확인합니다.
- **Model & Prompt** — 모델 카탈로그와 커스텀 모델(Hugging Face · Kaggle 연동)을 등록 · 조회하고, 프롬프트를 작성 · 관리합니다.
- **Dataset & Knowledge Base** — 드래그 앤 드롭으로 데이터셋을 올리고(최대 1GB), 지식 베이스의 문서와 검색 설정을 관리하며 Retrieval Test로 검색 결과를 확인합니다.
- **Learning** — 데이터 유형과 모델에 맞는 데이터셋을 골라 학습을 실행하고 결과 지표를 확인합니다.
- **Infrastructure** — VM과 Kubernetes 클러스터를 생성 · 관리합니다. CSP별 자격증명, 생성 전 사전 검증, 여러 CSP 일괄 생성, SSH 접속과 웹 터미널을 지원하고, 프로비저닝 진행률과 리소스 변경을 실시간(SSE)으로 화면에 반영합니다.
- **GPU & Accelerators** — GPU(MIG 포함) · NPU · TPU 장치 현황과 실사용량, GPU 워크로드, 사용량 히트맵을 제공합니다.
- **Application (Helm)** — 차트 카탈로그에서 앱을 설치하고, 리비전 이력과 되돌리기(Rollback), 차트 저장소를 관리합니다.
- **Monitoring** — 클러스터의 CPU · 메모리 · 파일 시스템 · 네트워크 · 가속기 지표를 구간과 갱신 주기를 골라 조회합니다.
- **Member & Audit** — 멤버 계정을 관리하고, 작업 이력과 감사 로그(Audit Log)를 조회합니다.

## Screenshots

<table>
  <tr>
    <td colspan="2">
      <img alt="Workflow Builder" src="https://github.com/user-attachments/assets/d891ede4-d03a-415a-8a7b-a865df061d5e" />
      <p align="center"><b>Workflow Builder</b> — 노드를 캔버스에 배치하고 연결해 AI 파이프라인을 조립합니다.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img alt="Infrastructure Monitoring" src="https://github.com/user-attachments/assets/5198d356-407a-4b1f-93cb-4be853d238f3" />
      <p align="center"><b>Monitoring</b> — 클러스터 자원 현황과 성능 지표</p>
    </td>
    <td width="50%">
      <img alt="Dataset Management" src="https://github.com/user-attachments/assets/90aa4df4-de54-4c8b-b995-dec2df9656d8" />
      <p align="center"><b>Dataset</b> — 데이터셋 등록 · 검색 · 관리</p>
    </td>
  </tr>
</table>

> 화면의 워크플로우 · 지식 베이스 · 데이터셋 이름 등 일부 데이터는 가려져 있습니다.

## Quick Start

> **사전 준비**
>
> - **Node.js** 20.19 이상(22 계열은 22.12 이상), **pnpm** 10 이상
> - 실행 중인 백엔드 — [ai-paas-gateway](https://github.com/ai-paas/ai-paas-gateway)
> - 사내 npm 레지스트리 접근 권한 — 디자인 시스템 `@innogrid/ui`를 사내 레지스트리에서 설치합니다.

```bash
git clone https://github.com/ai-paas/ai-paas-web.git
cd ai-paas-web
pnpm install

# 백엔드(게이트웨이) 주소를 지정합니다. 개발 서버가 /api 요청을 이 주소로 프록시합니다.
echo "VITE_SERVER_URL=http://<backend-host>:<port>" > .env

pnpm dev
```

브라우저에서 `http://localhost:5173`을 엽니다.

### Docker로 실행

빌드된 정적 자산(`dist/`)을 nginx 이미지에 담아 실행합니다. nginx가 `/api` 요청을 `VITE_SERVER_URL`로 프록시합니다.

```bash
pnpm build
docker build -t ai-paas-web .
docker run -d -p 8080:80 -e VITE_SERVER_URL=http://<backend-host>:<port> ai-paas-web
```

`http://localhost:8080`으로 접속합니다. 대용량 데이터셋 · 지식 베이스 업로드를 위해 `/api` 요청 본문은 최대 1GB, 타임아웃은 900초로 설정되어 있습니다.

## Menu Structure

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
| 멤버 관리 (관리자 전용) | — | `/member-management` |

## Development

### Tech Stack

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

### Project Structure

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

### Scripts

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

### CI/CD

| 시점 | 워크플로우 | 내용 |
| --- | --- | --- |
| `main` 대상 PR | `ci.yml` | lint → 테스트 · 커버리지 임계값 검사 → 빌드, Playwright E2E 스모크 |
| `main` 푸시 | `deploy.yml` | 테스트 · 빌드 → Docker 이미지 빌드 후 GHCR 푸시 → 서버 배포 |

## Releases

버전별 변경 내역은 [GitHub Releases](https://github.com/ai-paas/ai-paas-web/releases)에서 확인할 수 있습니다.

## Contributing

기여는 언제나 환영합니다. 크고 작은 PR 모두 좋습니다. 브랜치 전략, 커밋 메시지 규칙, PR 절차는 [기여 가이드](CONTRIBUTING.md)에 정리되어 있습니다. 프로젝트에 참여하는 모든 분은 [행동 강령](CODE_OF_CONDUCT.md)을 따릅니다.

## Support

버그 제보와 기능 제안은 [GitHub Issues](https://github.com/ai-paas/ai-paas-web/issues)에 남겨 주세요. 보안 취약점은 공개 이슈로 올리지 말고 [보안 정책](SECURITY.md)에 따라 비공개로 제보해 주세요.

## License

[Apache License 2.0](LICENSE) 하에 배포됩니다.

---

<div align="center">

**Built with React, TypeScript, and @xyflow/react.**

</div>
