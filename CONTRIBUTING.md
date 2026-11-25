# 기여 가이드

AI-PaaS Web에 관심을 가져 주셔서 감사합니다. 이 문서는 이슈를 올리고 코드를 기여하는 방법을 안내합니다. 프로젝트에 참여하는 모든 분은 [행동 강령](CODE_OF_CONDUCT.md)을 따릅니다.

## 참여하는 방법

- **버그 제보 · 기능 제안** — [이슈](https://github.com/ai-paas/ai-paas-web/issues/new/choose)를 열어 주세요. 같은 내용의 이슈가 이미 있는지 먼저 검색해 주세요.
- **문서 개선** — 오타 수정이나 설명 보완처럼 작은 변경도 환영합니다.
- **코드 기여** — 아래 [작업 절차](#작업-절차)를 따라 PR을 올려 주세요.
- **보안 취약점** — 공개 이슈로 올리지 말고 [보안 정책](SECURITY.md)에 따라 비공개로 제보해 주세요.

> **Note.** 디자인 시스템 `@innogrid/ui`가 사내 npm 레지스트리로만 배포되고 있어, 레지스트리 접근 권한이 없으면 의존성 설치와 빌드를 할 수 없습니다. 권한이 없는 분은 이슈 제보와 문서 수정으로 참여해 주세요.

## 개발 환경

- **Node.js** 20.19 이상(22 계열은 22.12 이상), **pnpm** 10 이상
- 설치와 실행 방법은 [README의 Quick Start](README.md#quick-start)를 참고해 주세요.

## 작업 절차

1. **브랜치 만들기** — `develop`에서 `<종류>/<짧은-설명>` 형식으로 브랜치를 만듭니다. 예: `feat/provisioning-progress`, `fix/accelerator-empty-table`, `docs/readme-update`
2. **변경하기** — 변경 범위는 좁게 유지합니다. 큰 PR 하나보다 작은 PR 여러 개가 리뷰하기 좋습니다. 관련 없는 리팩터링이나 재포맷은 섞지 말고 별도 PR로 나눠 주세요.
3. **검사하기** — PR을 올리기 전에 로컬에서 아래 명령을 모두 통과시킵니다. 워크플로우 캔버스처럼 E2E 흐름에 닿는 변경이면 `pnpm test:e2e`도 실행합니다.

   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test:coverage
   ```

4. **PR 올리기** — 대상 브랜치는 `develop`입니다. PR 템플릿에 맞춰 무엇을 왜 바꿨는지, 어떻게 확인했는지 적어 주세요. 화면이 바뀌면 스크린샷을 첨부합니다.
5. **머지** — 관리자가 확인한 뒤 머지합니다. `main`에는 관리자가 `develop`의 변경을 모아 반영하며, `main`에 반영되면 운영 환경에 자동 배포됩니다.

영향 범위가 큰 변경(새 도메인 추가, 캔버스 내부 구조, 데이터 페칭 패턴 개편 등)은 먼저 이슈를 열어 방향을 맞춘 뒤 진행해 주세요.

## 커밋 메시지

[Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/) 형식을 쓰고, 제목은 한국어로 적습니다.

```
<종류>(<범위>): <제목>
```

- **종류** — `feat`(기능 추가), `fix`(버그 수정), `refactor`, `test`, `docs`, `chore`, `perf`, `ci`
- **범위** — 선택 사항입니다. 바꾼 도메인을 적습니다. 예: `workflow`, `vm`, `cluster`, `monitoring`
- **본문** — 무엇을 바꿨는지보다 왜 바꿨는지를 적습니다.

실제 커밋 예시입니다.

```
feat(provisioning): 프로비저닝 진행률 SSE 실시간 표시
fix(workflow): 삭제 완료 폴링으로 목록 미반영 해소
docs: README를 v0.2.0 기준으로 갱신
```

## 코드와 테스트 규칙

자주 어긋나는 규칙만 추렸습니다. 전체 규칙은 [`CLAUDE.md`](CLAUDE.md)에, 테스트 작성법은 [`src/test/README.md`](src/test/README.md)에 있습니다.

- API 호출은 `src/hooks/service`의 `use*` 훅으로만 합니다. 쿼리 키는 `src/lib/query-keys.ts`의 팩토리로 만듭니다.
- UI는 `@innogrid/ui` 컴포넌트를 먼저 씁니다.
- 파일명은 kebab-case로 짓고, 컴포넌트는 named export로 내보냅니다. 페이지만 `export default`를 씁니다.
- 새 훅, CRUD 버튼 · 폼 컴포넌트, 순수 함수에는 테스트를 함께 추가합니다. 버그 수정에는 회귀 테스트를 추가합니다.
- 커버리지 임계값(`vitest.config.ts`)은 올리기만 하고 내리지 않습니다.

## 라이선스

이 저장소에 기여한 내용은 [Apache License 2.0](LICENSE)에 따라 배포됩니다.
