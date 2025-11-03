# AI 코딩 지침서

## 🎯 기본 원칙

### 📝 코드 품질 기준

- **명확성**: 누구나 이해할 수 있는 코드 작성
- **일관성**: 프로젝트 전체에서 동일한 스타일 유지
- **안정성**: 에러 상황을 미리 고려한 방어적 프로그래밍
- **확장성**: 미래 변경사항에 유연하게 대응 가능한 구조

### 🧠 사고 과정

- 문제를 단계별로 분해하여 접근
- 각 단계의 근거를 명확히 제시
- 예외 상황과 에러 처리를 고려
- 사용자 경험을 최우선으로 고려

## 📋 코딩 스타일 가이드

### 🏷️ 변수명 및 함수명

```typescript
// ✅ 좋은 예시 - 명확하고 직관적
const calculateEventDuration = (startTime: string, endTime: string): number => {
  const eventStartTime = new Date(startTime);
  const eventEndTime = new Date(endTime);
  return (eventEndTime.getTime() - eventStartTime.getTime()) / (1000 * 60);
};

// ❌ 나쁜 예시 - 모호하고 불명확
const calc = (s: string, e: string) => new Date(e).getTime() - new Date(s).getTime();
```

### 💬 주석 작성 규칙

```typescript
// ✅ 좋은 예시 - 이모티콘과 함께 명확한 설명
const validateEventData = (eventData: EventForm): ValidationResult => {
  // 🔍 필수 필드 검증
  if (!eventData.title?.trim()) {
    return { isValid: false, error: '제목은 필수입니다' };
  }

  // ⏰ 시간 유효성 검증
  if (new Date(eventData.startTime) >= new Date(eventData.endTime)) {
    return { isValid: false, error: '시작 시간은 종료 시간보다 이전이어야 합니다' };
  }

  // ✅ 모든 검증 통과
  return { isValid: true };
};

// ❌ 나쁜 예시 - 주석이 없거나 불명확
const validate = (data) => {
  if (!data.title) return false;
  if (data.start >= data.end) return false;
  return true;
};
```

### 🛡️ 에러 처리 패턴

```typescript
// ✅ 좋은 예시 - 방어적 프로그래밍
const fetchEventList = async (): Promise<Event[]> => {
  try {
    // 🌐 API 요청
    const response = await fetch('/api/events');

    // ⚠️ 응답 상태 확인
    if (!response.ok) {
      throw new Error(`이벤트 로딩 실패: ${response.status}`);
    }

    // 📋 데이터 파싱
    const { events } = await response.json();

    // 🔍 데이터 유효성 검증
    if (!Array.isArray(events)) {
      throw new Error('서버에서 잘못된 데이터 형식을 반환했습니다');
    }

    return events;
  } catch (error) {
    // 🚨 에러 로깅 및 사용자 알림
    console.error('이벤트 로딩 중 오류 발생:', error);

    // 사용자에게 친화적인 에러 메시지
    throw new Error('일정을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
};

// ❌ 나쁜 예시 - 에러 처리 부족
const fetchEvents = async () => {
  const response = await fetch('/api/events');
  const data = await response.json();
  return data.events;
};
```

## 🏗️ 컴포넌트 설계 원칙

### 📦 컴포넌트 분리 기준

```typescript
// ✅ 좋은 예시 - 단일 책임 원칙
const EventForm = ({ onSubmit, initialData }: EventFormProps) => {
  // 🎯 폼 상태 관리만 담당
  const [formData, setFormData] = useState(initialData);

  // 📝 폼 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return <form onSubmit={handleSubmit}>{/* 폼 UI */}</form>;
};

const EventValidation = ({ eventData }: EventValidationProps) => {
  // 🔍 유효성 검사만 담당
  const validationResult = validateEventData(eventData);

  return (
    <div>
      {validationResult.isValid ? (
        <span>✅ 유효한 데이터입니다</span>
      ) : (
        <span>❌ {validationResult.error}</span>
      )}
    </div>
  );
};

// ❌ 나쁜 예시 - 여러 책임을 가진 컴포넌트
const EventManager = () => {
  // 폼 관리, 유효성 검사, API 호출, UI 렌더링을 모두 담당
  const [data, setData] = useState();
  const [errors, setErrors] = useState();
  const [loading, setLoading] = useState();

  // 너무 많은 로직이 한 곳에 집중됨
};
```

### 🔄 상태 관리 패턴

```typescript
// ✅ 좋은 예시 - 명확한 상태 구조
interface EventFormState {
  // 📝 기본 정보
  title: string;
  date: string;
  startTime: string;
  endTime: string;

  // 🔄 반복 설정
  repeat: {
    type: RepeatType;
    interval: number;
    endDate?: string;
  };

  // ⚠️ 에러 상태
  errors: {
    title?: string;
    time?: string;
    repeat?: string;
  };

  // 🔄 로딩 상태
  isSubmitting: boolean;
}

// ❌ 나쁜 예시 - 불명확한 상태 구조
const [form, setForm] = useState({});
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
```

## 🧪 테스트 작성 가이드 (Kent C. Dodds 방식)

### 📋 테스트 우선 개발 (TDD)

```typescript
// 1️⃣ 테스트 먼저 작성 (Kent C. Dodds 방식)
describe('이벤트 생성 기능', () => {
  it('유효한 데이터로 이벤트를 생성할 수 있어야 함', async () => {
    // 🔍 Given: 유효한 이벤트 데이터
    const eventData = createValidEventData();

    // 🎯 When: 이벤트 생성 함수 호출
    const result = await createEvent(eventData);

    // ✅ Then: 성공적으로 생성되었는지 검증
    expect(result.success).toBe(true);
    expect(result.data.id).toBeDefined();
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
});

// 2️⃣ 구현 작성
const createEvent = async (eventData: EventForm): Promise<CreateEventResult> => {
  // 🔍 데이터 유효성 검사
  const validation = validateEventData(eventData);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  // 🌐 API 호출
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    return { success: false, error: '서버 오류가 발생했습니다' };
  }

  const createdEvent = await response.json();
  return { success: true, data: createdEvent };
};
```

### 🎯 **React Testing Library 모범 사례**

#### ✅ **올바른 쿼리 사용 순서**

1. `getByRole` - 접근성 기반 (가장 권장)
2. `getByLabelText` - 라벨과 연결된 요소
3. `getByPlaceholderText` - 플레이스홀더 텍스트
4. `getByText` - 텍스트 내용
5. `getByDisplayValue` - 폼 요소의 값
6. `getByTestId` - 마지막 수단 (가능한 피하기)

#### ✅ **올바른 assertion 사용**

```typescript
// ❌ Before: 기본 assertion 사용
expect(button.disabled).toBe(true);

// ✅ After: jest-dom assertion 사용
expect(button).toBeDisabled();
```

#### ✅ **userEvent 사용**

```typescript
// ❌ Before: fireEvent 사용
fireEvent.change(input, { target: { value: 'hello' } });

// ✅ After: userEvent 사용
await user.type(input, 'hello');
```

#### ✅ **query\* 변수 올바른 사용**

```typescript
// ❌ Before: 존재 확인에 query* 사용
expect(screen.queryByRole('alert')).toBeInTheDocument();

// ✅ After: 존재 확인은 get*, 부재 확인은 query*
expect(screen.getByRole('alert')).toBeInTheDocument();
expect(screen.queryByRole('alert')).not.toBeInTheDocument();
```

## 🚀 성능 최적화 가이드

### ⚡ React 최적화

```typescript
// ✅ 좋은 예시 - 메모이제이션 활용
const EventList = React.memo(({ events, onEdit, onDelete }: EventListProps) => {
  // 🔄 이벤트 핸들러 메모이제이션
  const handleEdit = useCallback(
    (eventId: string) => {
      onEdit(eventId);
    },
    [onEdit]
  );

  const handleDelete = useCallback(
    (eventId: string) => {
      onDelete(eventId);
    },
    [onDelete]
  );

  return (
    <div>
      {events.map((event) => (
        <EventItem key={event.id} event={event} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
    </div>
  );
});

// ❌ 나쁜 예시 - 불필요한 리렌더링 발생
const EventList = ({ events, onEdit, onDelete }) => {
  return (
    <div>
      {events.map((event) => (
        <EventItem
          key={event.id}
          event={event}
          onEdit={() => onEdit(event.id)} // 매번 새로운 함수 생성
          onDelete={() => onDelete(event.id)} // 매번 새로운 함수 생성
        />
      ))}
    </div>
  );
};
```

## 📊 코드 품질 체크리스트

### ✅ 필수 확인 사항

- [ ] 변수명이 명확하고 직관적인가?
- [ ] 함수가 단일 책임을 가지는가?
- [ ] 에러 처리가 적절히 구현되었는가?
- [ ] 주석이 코드의 의도를 명확히 설명하는가?
- [ ] 테스트가 모든 주요 기능을 커버하는가?
- [ ] 타입 안정성이 보장되는가?
- [ ] 성능상 문제가 없는가?

### 🎯 코드 리뷰 기준

- **가독성**: 다른 개발자가 쉽게 이해할 수 있는가?
- **유지보수성**: 변경사항을 쉽게 적용할 수 있는가?
- **확장성**: 새로운 기능을 쉽게 추가할 수 있는가?
- **안정성**: 예외 상황에서도 안전하게 동작하는가?
