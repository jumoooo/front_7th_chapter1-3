# [기능명] - QA 검증 보고서

- **작성자**: QA
- **작성일**: YYYY-MM-DD
- **버전**: 1.0

---

### 1. 검증 범위 (Verification Scope)

> 🎯 이 문서에서 검증하는 기능의 범위와 주요 사용자 시나리오를 명시합니다.

### 2. 테스트 케이스 실행 결과 (Test Case Execution Result)

> `Analyst`가 작성한 PRD의 수용 기준(AC)에 따라 각 테스트 케이스의 실행 결과를 기록합니다.

| Story ID | Acceptance Criteria | 결과 (Pass/Fail) | 비고 (버그 티켓 등) |
| :------- | :------------------ | :--------------- | :------------------ |
| STORY-001| AC 1.1              | Pass             |                     |
| STORY-001| AC 1.2              | Fail             | BUG-123 링크        |
| STORY-002| AC 2.1              | Pass             |                     |

### 3. 통합 테스트 시나리오 및 결과 (Integration Test Scenario & Result)

> 🔄 여러 기능이 연동되는 실제 사용자 시나리오 기반의 통합 테스트 결과를 기술합니다.

- **시나리오**: 사용자가 로그인 후, 반복 일정을 생성하고, 알림을 받는다.
- **결과**: Pass
- **근거**: `[feature-name].integration.spec.ts` 테스트 통과 확인

---

### 🧠 Sequential Thinking 로그 (요약)

> 💡 테스트 시나리오를 설계하고 잠재적 결함을 예측하는 과정에서 사용된 Sequential Thinking의 핵심 추론 과정을 요약하여 기록합니다.
>
> 1. **(Thought 1)**: 가장 리스크가 높은 사용자 경로 식별 - ...
> 2. **(Thought 2)**: 예상치 못한 사용자 입력(Edge Case) 정의 - ...
> 3. **(Hypothesis)**: ... 상황에서 시스템이 실패할 것이라는 가설 수립
> 4. **(Verification)**: 해당 가설을 검증하기 위한 테스트 케이스 설계 및 실행

### 📚 Context7 인용

> 📖 테스트 전략 수립에 참고한 Context7 문서(테스팅 가이드 등)의 핵심 내용을 인용하고, 어떻게 적용했는지 기술합니다.
>
> - **문서**: `[참고한 문서명]`
> - **인용**: `[핵심 내용]`
> - **적용**: `[테스트 케이스 설계에 어떻게 반영했는지 설명]`

### 📈 점수 현황 (Score Status)

- **획득 점수 (Acquired Score):**
- **누적 점수 (Cumulative Score):**
- **총점 (Total Score):**