# 테스트 작성 규칙 명세

## 📋 기본 원칙

### 🎯 테스트 우선 개발 (TDD)

- 모든 기능 구현 전에 테스트를 먼저 작성
- Red → Green → Refactor 사이클 준수
- 테스트가 실패하는 상태에서 시작

### 📝 테스트 작성 규칙

- 테스트명은 한국어로 작성하고 구체적으로 명시
- Given-When-Then 패턴 사용
- 하나의 테스트는 하나의 기능만 검증
- 테스트는 독립적이고 반복 가능해야 함

## 🗂️ 테스트 구조

```
src/__tests__/
├── hooks/                    # 커스텀 훅 테스트
│   ├── easy.*.spec.ts        # 쉬운 난이도
│   ├── medium.*.spec.ts      # 중간 난이도
│   └── hard.*.spec.ts        # 어려운 난이도
├── unit/                     # 유닛 테스트
│   ├── easy.*.spec.ts        # 유틸 함수 테스트
│   ├── medium.*.spec.ts      # 컴포넌트 테스트
│   └── hard.*.spec.ts        # 복잡한 로직 테스트
└── integration/              # 통합 테스트
    └── *.spec.tsx            # 전체 기능 통합 테스트
```

## 🧪 테스트 작성 예시

### ✅ 좋은 테스트 예시 (Kent C. Dodds 방식)

```typescript
describe('이벤트 생성 기능', () => {
  it('유효한 데이터로 이벤트를 생성할 수 있어야 함', async () => {
    // 🔍 Given: 유효한 이벤트 데이터 준비
    const validEventData = {
      title: '팀 회의',
      date: '2024-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
    };

    // 🎯 When: 이벤트 생성 함수 호출
    const result = await createEvent(validEventData);

    // ✅ Then: 성공적으로 생성되었는지 검증
    expect(result.success).toBe(true);
    expect(result.data.title).toBe('팀 회의');
    expect(result.data.id).toBeDefined();
  });

  it('필수 필드가 누락되면 에러가 발생해야 함', async () => {
    // 🔍 Given: 필수 필드가 누락된 데이터
    const invalidEventData = {
      title: '',
      date: '2024-01-15',
      startTime: '09:00',
      endTime: '10:00',
    };

    // 🎯 When: 이벤트 생성 시도
    const result = await createEvent(invalidEventData);

    // ✅ Then: 에러가 발생했는지 검증
    expect(result.success).toBe(false);
    expect(result.error).toContain('제목은 필수입니다');
  });
});

// 🧪 React Testing Library 모범 사례
describe('이벤트 폼 컴포넌트', () => {
  it('반복 체크박스를 클릭하면 반복 옵션이 표시되어야 함', async () => {
    // 🔍 Given: 이벤트 폼 렌더링
    render(<EventForm />);

    // 🎯 When: 반복 체크박스 클릭 (userEvent 사용)
    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));

    // ✅ Then: 반복 옵션 표시 확인 (접근성 기반 쿼리)
    expect(screen.getByRole('combobox', { name: /반복 유형/i })).toBeInTheDocument();
  });

  it('에러 메시지가 없을 때는 숨겨져야 함', () => {
    // 🔍 Given: 에러가 없는 상태로 폼 렌더링
    render(<EventForm />);

    // ✅ Then: 에러 메시지가 없음을 확인 (query* 사용)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
```

### ❌ 나쁜 테스트 예시

```typescript
// 테스트명이 모호함
it('should work', () => {
  // 테스트 로직이 복잡하고 여러 기능을 검증
  const result = createEvent(data);
  expect(result).toBeTruthy();
  expect(result.title).toBe('test');
  expect(result.date).toBe('2024-01-01');
  // ... 더 많은 검증
});
```

## 🔍 테스트 검증 체크리스트

### 📋 필수 검증 항목

- [ ] 정상 케이스 테스트
- [ ] 에러 케이스 테스트
- [ ] 경계값 테스트
- [ ] 입력 유효성 검사 테스트
- [ ] 비동기 처리 테스트

### 🎯 테스트 품질 기준

- [ ] 테스트명이 명확하고 구체적인가?
- [ ] Given-When-Then 구조를 따르는가?
- [ ] 하나의 기능만 검증하는가?
- [ ] 독립적으로 실행 가능한가?
- [ ] 반복 실행해도 같은 결과인가?

## 🚀 테스트 실행 명령어

```bash
# 전체 테스트 실행
pnpm test

# 특정 파일 테스트 실행
pnpm test useEventOperations.spec.ts

# 커버리지 확인
pnpm run test:coverage

# Watch 모드로 테스트 실행
pnpm run test:watch
```

## 📊 테스트 커버리지 목표

- **라인 커버리지**: 90% 이상
- **브랜치 커버리지**: 85% 이상
- **함수 커버리지**: 95% 이상
- **구문 커버리지**: 90% 이상
