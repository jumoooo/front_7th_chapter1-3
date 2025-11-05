/**
 * @name 알림 시스템 노출 조건 E2E 테스트
 * @description 알림 설정, 알림 노출 조건, 알림이 표시된 일정의 시각적 표현을 검증하는 E2E 테스트
 */

import { screen, within, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { server } from '../../setupTests';
import type { Event } from '../../types';
import { setup, saveSchedule } from '../testUtils';

describe('알림 시스템 노출 조건 E2E 테스트', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('일정 생성 시 알림 설정을 저장하고 알림이 표시된다', async () => {
    // 알림 시간 10분 전으로 설정 (현재 시간: 08:49:59, 일정 시작: 09:00)
    vi.setSystemTime(new Date('2025-10-15T08:49:59'));

    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 알림 설정이 포함된 일정 생성
    await saveSchedule(user, {
      title: '중요 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    // 일정이 생성되었다는 메시지 확인
    await screen.findByText('일정이 추가되었습니다');

    // 알림이 표시될 때까지 대기 (1초 후)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // 알림 메시지가 표시되는지 확인
    await waitFor(
      () => {
        expect(screen.getByText('10분 후 중요 회의 일정이 시작됩니다.')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // 이벤트 리스트에서 알림 아이콘이 표시되는지 확인
    const eventList = within(screen.getByTestId('event-list'));
    const importantMeeting = eventList.getByText('중요 회의');
    const eventContainer =
      importantMeeting.closest('[class*="MuiBox-root"]') ||
      importantMeeting.closest('div[style*="border"]') ||
      importantMeeting.parentElement?.parentElement;

    expect(eventContainer).toBeDefined();
    const eventBox = within(eventContainer as HTMLElement);
    expect(eventBox.getByTestId('NotificationsIcon')).toBeInTheDocument();
  });

  it('알림 시간이 되면 일정에 알림 아이콘과 시각적 강조가 표시된다', async () => {
    // 알림 시간 10분 전으로 설정 (현재 시간: 08:49:59, 일정 시작: 09:00)
    vi.setSystemTime(new Date('2025-10-15T08:49:59'));

    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 알림 설정이 포함된 일정 생성
    await saveSchedule(user, {
      title: '중요 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    // 일정이 생성되었다는 메시지 확인
    await screen.findByText('일정이 추가되었습니다');

    // 알림이 표시될 때까지 대기 (1초 후)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // 알림 메시지가 표시되는지 확인
    await waitFor(
      () => {
        expect(screen.getByText('10분 후 중요 회의 일정이 시작됩니다.')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // 달력 뷰에서 알림 아이콘이 표시되는지 확인
    const monthView = screen.getByTestId('month-view');
    const eventBox = await within(monthView).findByText('중요 회의');
    const notificationIcon = eventBox
      .closest('[draggable="true"]')
      ?.querySelector('[data-testid="NotificationsIcon"]');
    expect(notificationIcon).toBeInTheDocument();

    // 이벤트 리스트에서도 알림 아이콘이 표시되는지 확인
    const eventList = within(screen.getByTestId('event-list'));
    const importantMeeting = eventList.getByText('중요 회의');
    const eventContainer =
      importantMeeting.closest('[class*="MuiBox-root"]') ||
      importantMeeting.closest('div[style*="border"]') ||
      importantMeeting.parentElement?.parentElement;

    expect(eventContainer).toBeDefined();
    const eventBoxInList = within(eventContainer as HTMLElement);
    expect(eventBoxInList.getByTestId('NotificationsIcon')).toBeInTheDocument();
  });

  it('알림 메시지를 닫을 수 있다', async () => {
    // 알림 시간 10분 전으로 설정
    vi.setSystemTime(new Date('2025-10-15T08:49:59'));

    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 일정 생성
    await saveSchedule(user, {
      title: '중요 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    // 일정이 생성되었다는 메시지 확인
    await screen.findByText('일정이 추가되었습니다');

    // 알림이 표시될 때까지 대기
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // 알림 메시지가 표시되는지 확인
    const notificationMessage = await waitFor(
      () => screen.getByText('10분 후 중요 회의 일정이 시작됩니다.'),
      { timeout: 3000 }
    );
    expect(notificationMessage).toBeInTheDocument();

    // 알림 메시지의 닫기 버튼 찾기 (Close 아이콘)
    const notificationContainer = notificationMessage.closest('[class*="MuiAlert-root"]');
    expect(notificationContainer).toBeDefined();

    const closeButton = within(notificationContainer as HTMLElement).getByRole('button');
    await user.click(closeButton);

    // 알림 메시지가 닫혔는지 확인
    await waitFor(() => {
      expect(screen.queryByText('10분 후 중요 회의 일정이 시작됩니다.')).not.toBeInTheDocument();
    });
  });

  it('여러 일정의 알림이 동시에 표시될 수 있다', async () => {
    // 알림 시간 10분 전으로 설정
    vi.setSystemTime(new Date('2025-10-15T08:49:59'));

    // 기존 일정이 포함된 mock 설정
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '첫 번째 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '첫 번째 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.post('/api/events', async ({ request }) => {
        const newEvent = (await request.json()) as Event;
        newEvent.id = String(mockEvents.length + 1);
        mockEvents.push(newEvent);
        return HttpResponse.json(newEvent, { status: 201 });
      })
    );

    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 두 번째 일정 생성 (같은 시간에 알림이 표시되어야 함)
    await saveSchedule(user, {
      title: '두 번째 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '두 번째 회의',
      location: '회의실 B',
      category: '업무',
    });

    // 겹침 경고 다이얼로그가 나타나면 확인 버튼 클릭
    const overlapDialog = screen.queryByText('일정 겹침 경고');
    if (overlapDialog) {
      await waitFor(() => {
        expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      });
      await user.click(screen.getByText('계속 진행'));
    }

    // 일정이 생성되었다는 메시지 확인
    await screen.findByText('일정이 추가되었습니다');

    // 알림이 표시될 때까지 대기
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // 두 개의 알림 메시지가 모두 표시되는지 확인
    await waitFor(
      () => {
        expect(screen.getByText('10분 후 첫 번째 회의 일정이 시작됩니다.')).toBeInTheDocument();
        expect(screen.getByText('10분 후 두 번째 회의 일정이 시작됩니다.')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // 두 일정 모두에 알림 아이콘이 표시되는지 확인
    const eventList = within(screen.getByTestId('event-list'));
    const firstMeetingTexts = eventList.getAllByText('첫 번째 회의');
    expect(firstMeetingTexts.length).toBeGreaterThan(0);
    const secondMeetingTexts = eventList.getAllByText('두 번째 회의');
    expect(secondMeetingTexts.length).toBeGreaterThan(0);
  });

  it('알림 시간이 지나면 알림이 표시되지 않는다', async () => {
    // 일정 시작 시간이 이미 지난 경우 (현재 시간: 09:05, 일정 시작: 09:00, 알림: 10분 전)
    vi.setSystemTime(new Date('2025-10-15T09:05:00'));

    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 일정 생성 (알림 시간이 이미 지남)
    await saveSchedule(user, {
      title: '지난 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '이미 시작된 회의',
      location: '회의실 A',
      category: '업무',
    });

    // 일정이 생성되었다는 메시지 확인
    await screen.findByText('일정이 추가되었습니다');

    // 알림 체크 (1초 후)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // 알림이 표시되지 않아야 함
    expect(screen.queryByText('10분 후 지난 회의 일정이 시작됩니다.')).not.toBeInTheDocument();

    // 이벤트 리스트에 알림 아이콘이 없어야 함
    const eventList = within(screen.getByTestId('event-list'));
    const pastMeeting = eventList.getByText('지난 회의');
    const eventContainer =
      pastMeeting.closest('[class*="MuiBox-root"]') ||
      pastMeeting.closest('div[style*="border"]') ||
      pastMeeting.parentElement?.parentElement;

    expect(eventContainer).toBeDefined();
    const eventBox = within(eventContainer as HTMLElement);
    expect(eventBox.queryByTestId('NotificationsIcon')).not.toBeInTheDocument();
  });
});
