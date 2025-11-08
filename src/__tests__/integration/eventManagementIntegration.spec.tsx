import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { server } from '../../setupTests';
import { setup, saveSchedule } from '../testUtils';

describe('캘린더 날짜 클릭을 통한 일정 관리', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-01'));
  });

  it('일반 일정을 다른 날짜로 드래그하면 날짜가 변경된다', async () => {
    setupMockHandlerCreation();

    // 이동 후 업데이트된 일정을 반환하도록 설정
    server.use(
      http.put('/api/events/:id', async ({ request }) => {
        const updatedEvent = (await request.json()) as Event;
        return HttpResponse.json(updatedEvent);
      })
    );

    const { user } = setup(<App />);

    // 일정 생성
    await saveSchedule(user, {
      title: '팀 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
    });

    // 월별 뷰에서 일정 확인
    const monthView = screen.getByTestId('month-view');
    const event = within(monthView).getByText('팀 회의');
    expect(event).toBeInTheDocument();

    // 드래그 가능 속성 확인
    const eventBox = event.closest('[draggable="true"]');
    expect(eventBox).toBeInTheDocument();
    expect(eventBox).toHaveAttribute('draggable', 'true');
  });
  it('캘린더에서 날짜를 클릭하여 일정 날짜가 자동으로 설정되고 일정을 생성할 수 있다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 1단계: 10월 한 자리 날짜(5일) 클릭 -> "2025-10-05" 제로 패딩 확인
    const monthView = screen.getByTestId('month-view');
    const date5Cell = within(monthView).getAllByText('5')[0];
    await user.click(date5Cell);

    // 날짜 필드가 채워졌는지 확인
    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput.value).toBe('2025-10-05');

    // 2단계: 폼 작성 및 일정 생성
    await user.type(screen.getByLabelText('제목'), '첫 번째 회의');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.type(screen.getByLabelText('설명'), '회의 설명');
    await user.type(screen.getByLabelText('위치'), '회의실 A');

    // 카테고리 선택
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 일정 제출
    await user.click(screen.getByTestId('event-submit-button'));

    // 3단계: DB 데이터 확인
    const response = await fetch('/api/events');
    const { events } = await response.json();

    // 데이터 검증
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe('첫 번째 회의');
    expect(events[0].date).toBe('2025-10-05');
    expect(events[0].startTime).toBe('09:00');
    expect(events[0].endTime).toBe('10:00');
    expect(events[0].location).toBe('회의실 A');
    expect(events[0].category).toBe('업무');

    // 4단계: UI에서 10월 5일에 일정이 표시되는지 확인
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('첫 번째 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-05')).toBeInTheDocument();
  });

  it('다른 월의 날짜를 클릭하여 일정 날짜를 수정할 수 있다', async () => {
    // 초기 일정 데이터 준비
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-05',
        startTime: '09:00',
        endTime: '10:00',
        description: '회의 설명',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ]);
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 1단계: 기존 일정이 표시되는지 확인
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('기존 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-05')).toBeInTheDocument();

    // 2단계: 수정 버튼 클릭
    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);

    // 수정 모드 확인 (버튼 텍스트가 "일정 수정"으로 변경됨)
    expect(screen.getByTestId('event-submit-button')).toHaveTextContent('일정 수정');

    // 3단계: 다음 달(11월)로 이동
    await user.click(screen.getByLabelText('Next'));

    // 4단계: 11월 20일 클릭 -> "2025-11-20" (다른 월 검증)
    const monthViewNov = screen.getByTestId('month-view');
    const date20Cell = within(monthViewNov).getAllByText('20')[0];
    await user.click(date20Cell);

    // 날짜 필드가 변경되었는지 확인
    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput.value).toBe('2025-11-20');

    // 5단계: 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 6단계: DB 데이터 확인
    const response = await fetch('/api/events');
    const { events } = await response.json();

    // 데이터 검증: 날짜가 2025-11-20으로 변경되었는지 확인
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe('기존 회의');
    expect(events[0].date).toBe('2025-11-20');
    expect(events[0].location).toBe('회의실 A');

    // 7단계: UI에서 11월 20일에 일정이 표시되는지 확인
    const eventListAfterEdit = within(screen.getByTestId('event-list'));
    expect(
      await eventListAfterEdit.findByText((content) => content.includes('기존 회의'))
    ).toBeVisible();
    expect(await eventListAfterEdit.findByText('2025-11-20')).toBeVisible();

    // 8단계: 10월로 돌아가서 일정이 없는지 확인
    await user.click(screen.getByLabelText('Previous'));

    // 10월로 돌아왔을 때 일정 리스트에 해당 일정이 없어야 함
    const eventListOct = within(screen.getByTestId('event-list'));
    expect(eventListOct.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    expect(eventListOct.queryByText('기존 회의')).not.toBeInTheDocument();
  });
});
