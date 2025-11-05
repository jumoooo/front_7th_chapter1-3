/**
 * @name 일정 겹침 처리 방식 E2E 테스트
 * @description 겹치는 시간대의 일정 생성 시 경고 표시 및 처리 방식을 검증하는 E2E 테스트
 */

import { screen, within, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { server } from '../../setupTests';
import { setup, saveSchedule } from '../testUtils';

describe('일정 겹침 처리 방식 E2E 테스트', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('겹치는 시간대에 새로운 일정 생성 시 경고 다이얼로그가 표시된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 겹치는 시간대에 새로운 일정 생성 시도
    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    // 겹침 경고 다이얼로그가 나타나는지 확인
    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    });

    // 겹치는 일정 정보가 다이얼로그에 표시되는지 확인 (다이얼로그 내에서 찾기)
    const dialog = screen.getByRole('dialog');
    const dialogContent = within(dialog);
    expect(dialogContent.getByText(/기존 회의/)).toBeInTheDocument();
    expect(dialogContent.getByText(/2025-10-15.*09:00.*10:00/)).toBeInTheDocument();
  });

  it('경고 다이얼로그에서 취소 버튼 클릭 시 일정 생성이 취소된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    // 기존 일정이 포함된 mock 설정
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 겹치는 시간대에 새로운 일정 생성 시도
    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    // 겹침 경고 다이얼로그가 나타날 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });

    // 취소 버튼 클릭
    await user.click(screen.getByText('취소'));

    // 다이얼로그가 닫혔는지 확인
    await waitFor(() => {
      expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
    });

    // 일정이 생성되지 않았는지 확인 (이벤트 리스트에 새 일정이 없어야 함)
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.queryByText('새 회의')).not.toBeInTheDocument();

    // 기존 일정은 그대로 있는지 확인
    expect(eventList.getByText('기존 회의')).toBeInTheDocument();
  });

  it('경고 다이얼로그에서 확인 버튼 클릭 시 일정이 생성된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    // 기존 일정이 포함된 mock 설정
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 겹치는 시간대에 새로운 일정 생성 시도
    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    // 겹침 경고 다이얼로그가 나타날 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });

    // 확인 버튼 클릭 (계속 진행)
    await user.click(screen.getByText('계속 진행'));

    // 다이얼로그가 닫혔는지 확인
    await waitFor(() => {
      expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
    });

    // 일정이 생성되었다는 메시지 확인
    await screen.findByText('일정이 추가되었습니다');

    // 이벤트 리스트에 새 일정이 표시되는지 확인
    const eventList = within(screen.getByTestId('event-list'));

    // 새 회의가 있는지 확인
    const newMeetingText = eventList.getByText('새 회의');
    expect(newMeetingText).toBeInTheDocument();

    // 새 회의가 포함된 Box 컨테이너 찾기
    const newMeetingContainer =
      newMeetingText.closest('[class*="MuiBox-root"]') ||
      newMeetingText.closest('div[style*="border"]') ||
      newMeetingText.parentElement?.parentElement;

    expect(newMeetingContainer).toBeDefined();

    // 해당 컨테이너 내에서 날짜와 시간 확인
    const newMeetingBox = within(newMeetingContainer as HTMLElement);
    expect(newMeetingBox.getByText('2025-10-15')).toBeInTheDocument();
    expect(newMeetingBox.getByText('09:30 - 10:30')).toBeInTheDocument();

    // 기존 일정도 그대로 있는지 확인
    expect(eventList.getByText('기존 회의')).toBeInTheDocument();

    // 달력에도 새 일정이 표시되는지 확인
    const monthView = screen.getByTestId('month-view');
    expect(within(monthView).getByText('새 회의')).toBeInTheDocument();
    expect(within(monthView).getByText('기존 회의')).toBeInTheDocument();
  });
});
