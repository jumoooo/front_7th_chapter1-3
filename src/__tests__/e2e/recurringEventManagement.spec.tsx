/**
 * @name 반복 일정 관리 워크플로우 E2E 테스트
 * @description 반복 일정의 생성(Create), 조회(Read), 수정(Update), 삭제(Delete) 전반을 검증하는 E2E 테스트. 단일/전체 수정 및 삭제 옵션 포함
 */

import { screen, within, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import {
  setupMockHandlerListCreation,
  setupMockHandlerRecurringListDelete,
  setupMockHandlerRecurringListUpdate,
} from '../../__mocks__/handlersUtils';
import App from '../../App';
import { server } from '../../setupTests';
import { setup, saveSchedule } from '../testUtils';

describe('반복 일정 관리 워크플로우 E2E 테스트', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('반복 일정을 생성하고 여러 날짜에 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    // 반복 일정 생성을 위한 mock 설정
    setupMockHandlerListCreation();
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 반복 일정 생성 (매일, 2025-10-15부터 2025-10-17까지)
    await saveSchedule(user, {
      title: '매일 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '매일 진행되는 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
    });

    // 일정이 생성되었다는 메시지 확인
    await screen.findByText('일정이 추가되었습니다');

    // 일정 로딩 완료 대기 (반복 일정이 리스트에 표시될 때까지)
    await screen.findByText('일정 로딩 완료!');

    // 이벤트 리스트에 여러 인스턴스가 표시되는지 확인
    const eventList = within(screen.getByTestId('event-list'));
    const meetingInstances = eventList.getAllByText('매일 회의');
    expect(meetingInstances.length).toBeGreaterThanOrEqual(2);

    // 각 날짜별 일정이 표시되는지 확인
    expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-16')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-17')).toBeInTheDocument();

    // 반복 아이콘이 표시되는지 확인
    const repeatIcons = screen.getAllByTestId('RepeatIcon');
    expect(repeatIcons.length).toBeGreaterThan(0);

    // 달력(월별 뷰)에 여러 날짜에 표시되는지 확인
    const monthView = within(screen.getByTestId('month-view'));
    const calendarMeetings = monthView.getAllByText('매일 회의');
    expect(calendarMeetings.length).toBeGreaterThanOrEqual(2);
  });

  it('생성된 반복 일정이 이벤트 리스트와 달력에서 정확히 조회되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    setupMockHandlerListCreation();
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 반복 일정 생성
    await saveSchedule(user, {
      title: '조회 테스트 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '조회 테스트용 반복 회의',
      location: '회의실 B',
      category: '개인',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
    });

    await screen.findByText('일정이 추가되었습니다');
    await screen.findByText('일정 로딩 완료!');

    // 이벤트 리스트에서 모든 필드가 정확히 표시되는지 확인
    const eventList = within(screen.getByTestId('event-list'));
    const meetingInstances = eventList.getAllByText('조회 테스트 회의');
    expect(meetingInstances.length).toBeGreaterThanOrEqual(2);

    // 각 인스턴스의 정보가 정확한지 확인
    expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-16')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-17')).toBeInTheDocument();

    // 시간이 여러 개 있을 수 있으므로 getAllByText 사용
    const timeTexts = eventList.getAllByText('14:00 - 15:00');
    expect(timeTexts.length).toBeGreaterThan(0);

    // 설명, 위치, 카테고리도 여러 개 있을 수 있으므로 getAllByText 사용
    const descriptionTexts = eventList.getAllByText('조회 테스트용 반복 회의');
    expect(descriptionTexts.length).toBeGreaterThan(0);
    const locationTexts = eventList.getAllByText('회의실 B');
    expect(locationTexts.length).toBeGreaterThan(0);
    const categoryTexts = eventList.getAllByText('카테고리: 개인');
    expect(categoryTexts.length).toBeGreaterThan(0);

    // 달력(월별 뷰)에서 일정이 표시되는지 확인
    const monthView = within(screen.getByTestId('month-view'));
    const calendarMeetings = monthView.getAllByText('조회 테스트 회의');
    expect(calendarMeetings.length).toBeGreaterThanOrEqual(2);

    // 주별 뷰 전환 후에도 표시되는지 확인
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = within(screen.getByTestId('week-view'));
    const weekMeetings = weekView.getAllByText('조회 테스트 회의');
    expect(weekMeetings.length).toBeGreaterThanOrEqual(2);
  }, 10000);

  it('반복 일정 수정 시 "예" 선택하면 해당 일정만 수정된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    // 기존 반복 일정이 있는 상태로 설정
    setupMockHandlerRecurringListUpdate([
      {
        id: '1',
        title: '매일 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '매일 회의',
        date: '2025-10-16',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '매일 회의',
        date: '2025-10-17',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 반복 일정이 생성되었는지 확인
    const eventList = within(screen.getByTestId('event-list'));
    const initialMeetings = eventList.getAllByText('매일 회의');
    expect(initialMeetings.length).toBeGreaterThanOrEqual(2);

    // 첫 번째 반복 일정 편집 버튼 클릭
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 반복 일정 편집 다이얼로그가 나타나는지 확인
    await waitFor(() => {
      expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
      expect(screen.getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
    });

    // "예" 버튼 선택 (단일 수정)
    const yesButton = await screen.findByText('예');
    await user.click(yesButton);

    // 일정 편집 폼에서 필드 채우기
    const titleInput = screen.getByLabelText('제목');
    await user.click(titleInput);
    await user.keyboard('{Control>}a{/Control}');
    await user.keyboard('{delete}');
    await user.type(titleInput, '수정된 회의');

    // 날짜, 시간 등 필수 필드 확인 및 채우기
    const dateInput = screen.getByLabelText('날짜');
    if (!dateInput.getAttribute('value')) {
      await user.type(dateInput, '2025-10-15');
    }

    const startTimeInput = screen.getByLabelText('시작 시간');
    if (!startTimeInput.getAttribute('value')) {
      await user.type(startTimeInput, '14:00');
    }

    const endTimeInput = screen.getByLabelText('종료 시간');
    if (!endTimeInput.getAttribute('value')) {
      await user.type(endTimeInput, '15:00');
    }

    // 수정 완료
    await user.click(screen.getByTestId('event-submit-button'));

    // 일정이 수정되었다는 메시지 확인 (일정 로딩 완료 대기)
    await screen.findByText('일정 로딩 완료!');

    // 결과 확인: 한 개는 수정되고 나머지는 그대로
    const updatedEventList = within(screen.getByTestId('event-list'));
    expect(updatedEventList.getByText('수정된 회의')).toBeInTheDocument();

    // 나머지 일정은 그대로 유지되는지 확인
    const remainingMeetings = updatedEventList.getAllByText('매일 회의');
    expect(remainingMeetings.length).toBeGreaterThanOrEqual(1);

    // 달력에서도 확인
    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('수정된 회의')).toBeInTheDocument();

    // 나머지 일정은 그대로 유지되는지 확인 (여러 개 있을 수 있으므로 getAllByText 사용)
    const remainingCalendarMeetings = monthView.getAllByText('매일 회의');
    expect(remainingCalendarMeetings.length).toBeGreaterThan(0);
  });

  it('반복 일정 수정 시 "아니오" 선택하면 모든 일정이 수정된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    // 기존 반복 일정이 있는 상태로 설정
    setupMockHandlerRecurringListUpdate([
      {
        id: '1',
        title: '매일 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '매일 회의',
        date: '2025-10-16',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '매일 회의',
        date: '2025-10-17',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 첫 번째 반복 일정 편집 버튼 클릭
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 다이얼로그가 나타나는지 확인
    await waitFor(() => {
      expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
      expect(screen.getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
    });

    // "아니오" 버튼 선택 (전체 수정)
    const noButton = await screen.findByText('아니오');
    await user.click(noButton);

    // 일정 편집 폼에서 필드 채우기
    const titleInput = screen.getByLabelText('제목');
    await user.click(titleInput);
    await user.keyboard('{Control>}a{/Control}');
    await user.keyboard('{delete}');
    await user.type(titleInput, '전체 변경된 회의');

    // 날짜, 시간 등 필수 필드 확인 및 채우기
    const dateInput = screen.getByLabelText('날짜');
    if (!dateInput.getAttribute('value')) {
      await user.type(dateInput, '2025-10-15');
    }

    const startTimeInput = screen.getByLabelText('시작 시간');
    if (!startTimeInput.getAttribute('value')) {
      await user.type(startTimeInput, '14:00');
    }

    const endTimeInput = screen.getByLabelText('종료 시간');
    if (!endTimeInput.getAttribute('value')) {
      await user.type(endTimeInput, '15:00');
    }

    // 수정 완료
    await user.click(screen.getByTestId('event-submit-button'));

    // 일정이 수정되었다는 메시지 확인 (일정 로딩 완료 대기)
    await screen.findByText('일정 로딩 완료!');

    // 결과 확인: 모든 일정이 변경되었는지 확인
    const updatedEventList = within(screen.getByTestId('event-list'));
    const updatedMeetings = updatedEventList.getAllByText('전체 변경된 회의');
    expect(updatedMeetings.length).toBeGreaterThanOrEqual(2);

    // 기존 일정이 더 이상 없는지 확인
    expect(updatedEventList.queryByText('매일 회의')).not.toBeInTheDocument();

    // 달력에서도 확인
    const monthView = within(screen.getByTestId('month-view'));
    const calendarMeetings = monthView.getAllByText('전체 변경된 회의');
    expect(calendarMeetings.length).toBeGreaterThanOrEqual(2);
  });

  it('반복 일정 삭제 시 "예" 선택하면 해당 일정만 삭제된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    // 기존 반복 일정이 있는 상태로 설정
    setupMockHandlerRecurringListDelete([
      {
        id: '1',
        title: '매일 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '매일 회의',
        date: '2025-10-16',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '매일 회의',
        date: '2025-10-17',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 반복 일정이 생성되었는지 확인
    const eventList = within(screen.getByTestId('event-list'));
    const initialMeetings = eventList.getAllByText('매일 회의');
    expect(initialMeetings.length).toBeGreaterThanOrEqual(2);

    // 달력에 일정이 표시되는지 확인
    const monthView = within(screen.getByTestId('month-view'));
    const initialCalendarMeetings = monthView.getAllByText('매일 회의');
    expect(initialCalendarMeetings.length).toBeGreaterThanOrEqual(2);

    // 첫 번째 반복 일정 삭제 버튼 클릭
    const deleteButtons = await screen.findAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);

    // 반복 일정 삭제 다이얼로그가 나타나는지 확인
    await waitFor(() => {
      expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
      expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
    });

    // "예" 버튼 선택 (단일 삭제)
    const yesButton = await screen.findByText('예');
    await user.click(yesButton);

    // 삭제 완료 메시지 확인
    await screen.findByText('일정이 삭제되었습니다');

    // 결과 확인: 한 개는 삭제되고 나머지는 유지
    const updatedEventList = within(screen.getByTestId('event-list'));
    const remainingMeetings = updatedEventList.getAllByText('매일 회의');
    expect(remainingMeetings.length).toBeGreaterThanOrEqual(1);
    expect(remainingMeetings.length).toBeLessThan(initialMeetings.length);

    // 달력에서도 확인
    const updatedMonthView = within(screen.getByTestId('month-view'));
    const remainingCalendarMeetings = updatedMonthView.getAllByText('매일 회의');
    expect(remainingCalendarMeetings.length).toBeGreaterThanOrEqual(1);
    expect(remainingCalendarMeetings.length).toBeLessThan(initialCalendarMeetings.length);
  });

  it('반복 일정 삭제 시 "아니오" 선택하면 모든 일정이 삭제된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    // 기존 반복 일정이 있는 상태로 설정
    setupMockHandlerRecurringListDelete([
      {
        id: '1',
        title: '매일 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '매일 회의',
        date: '2025-10-16',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '매일 회의',
        date: '2025-10-17',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 반복 일정이 생성되었는지 확인
    const eventList = within(screen.getByTestId('event-list'));
    const initialMeetings = eventList.getAllByText('매일 회의');
    expect(initialMeetings.length).toBeGreaterThanOrEqual(2);

    // 달력에 일정이 표시되는지 확인
    const monthView = within(screen.getByTestId('month-view'));
    const initialCalendarMeetings = monthView.getAllByText('매일 회의');
    expect(initialCalendarMeetings.length).toBeGreaterThanOrEqual(2);

    // 첫 번째 반복 일정 삭제 버튼 클릭
    const deleteButtons = await screen.findAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);

    // 다이얼로그가 나타나는지 확인
    await waitFor(() => {
      expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
      expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
    });

    // "아니오" 버튼 선택 (전체 삭제)
    const noButton = await screen.findByText('아니오');
    await user.click(noButton);

    // 삭제 완료 메시지 확인
    await screen.findByText('일정이 삭제되었습니다');

    // 결과 확인: 모든 일정이 삭제되었는지 확인
    const updatedEventList = within(screen.getByTestId('event-list'));
    const remainingMeetings = updatedEventList.queryAllByText('매일 회의');
    expect(remainingMeetings).toHaveLength(0);

    // 달력에서도 확인
    const updatedMonthView = within(screen.getByTestId('month-view'));
    const remainingCalendarMeetings = updatedMonthView.queryAllByText('매일 회의');
    expect(remainingCalendarMeetings).toHaveLength(0);
  });
});
