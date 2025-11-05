/**
 * @name 검색 및 필터링 전반 E2E 테스트
 * @description 검색어 입력, 검색 결과 필터링, 검색 결과 없을 때 처리, 검색어 삭제 시 전체 일정 표시를 검증하는 E2E 테스트
 */

import { screen, within, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { server } from '../../setupTests';
import { setup, saveSchedule } from '../testUtils';

describe('검색 및 필터링 전반 E2E 테스트', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('검색어 입력 시 제목에 일치하는 일정만 필터링되어 표시된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    // 여러 일정을 생성하기 위한 mock 설정
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 첫 번째 일정 생성
    await saveSchedule(user, {
      title: '프로젝트 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    await screen.findByText('일정 로딩 완료!');

    // 두 번째 일정 생성
    await saveSchedule(user, {
      title: '점심 약속',
      date: '2025-10-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심 식사',
      location: '레스토랑',
      category: '개인',
    });

    await screen.findByText('일정 로딩 완료!');

    // 검색어 입력 전 모든 일정 확인
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('프로젝트 회의')).toBeInTheDocument();
    expect(eventList.getByText('점심 약속')).toBeInTheDocument();

    // 검색어 입력 (제목으로 검색)
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '프로젝트');

    // 검색 결과 확인: '프로젝트 회의'만 표시되어야 함
    await waitFor(() => {
      expect(eventList.getByText('프로젝트 회의')).toBeInTheDocument();
      expect(eventList.queryByText('점심 약속')).not.toBeInTheDocument();
    });

    // 달력에서도 검색 결과 확인
    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('프로젝트 회의')).toBeInTheDocument();
    expect(monthView.queryByText('점심 약속')).not.toBeInTheDocument();
  }, 10000);

  it('검색어 입력 시 설명에 일치하는 일정만 필터링되어 표시된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 첫 번째 일정 생성
    await saveSchedule(user, {
      title: '팀 미팅',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 B',
      category: '업무',
    });

    await screen.findByText('일정 로딩 완료!');

    // 두 번째 일정 생성
    await saveSchedule(user, {
      title: '개인 일정',
      date: '2025-10-15',
      startTime: '16:00',
      endTime: '17:00',
      description: '친구와 점심 식사',
      location: '카페',
      category: '개인',
    });

    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('팀 미팅')).toBeInTheDocument();
    expect(eventList.getByText('개인 일정')).toBeInTheDocument();

    // 검색어 입력 (설명으로 검색)
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '점심');

    // 검색 결과 확인: '개인 일정'만 표시되어야 함 (설명에 '점심'이 포함됨)
    await waitFor(() => {
      expect(eventList.getByText('개인 일정')).toBeInTheDocument();
      expect(eventList.queryByText('팀 미팅')).not.toBeInTheDocument();
    });

    // 달력에서도 검색 결과 확인
    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('개인 일정')).toBeInTheDocument();
    expect(monthView.queryByText('팀 미팅')).not.toBeInTheDocument();
  }, 10000);

  it('검색어 입력 시 위치에 일치하는 일정만 필터링되어 표시된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 첫 번째 일정 생성
    await saveSchedule(user, {
      title: '회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
    });

    await screen.findByText('일정 로딩 완료!');

    // 두 번째 일정 생성
    await saveSchedule(user, {
      title: '약속',
      date: '2025-10-15',
      startTime: '13:00',
      endTime: '14:00',
      description: '친구 만남',
      location: '카페',
      category: '개인',
    });

    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('회의')).toBeInTheDocument();
    expect(eventList.getByText('약속')).toBeInTheDocument();

    // 검색어 입력 (위치로 검색)
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '회의실');

    // 검색 결과 확인: '회의'만 표시되어야 함 (위치에 '회의실'이 포함됨)
    await waitFor(() => {
      expect(eventList.getByText('회의')).toBeInTheDocument();
      expect(eventList.queryByText('약속')).not.toBeInTheDocument();
    });

    // 달력에서도 검색 결과 확인
    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('회의')).toBeInTheDocument();
    expect(monthView.queryByText('약속')).not.toBeInTheDocument();
  }, 10000);

  it('검색 결과가 없을 때 적절한 메시지나 빈 상태가 표시된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 일정 생성
    await saveSchedule(user, {
      title: '회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
    });

    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('회의')).toBeInTheDocument();

    // 존재하지 않는 검색어 입력
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지않는일정');

    // 검색 결과가 없는 경우: 일정이 리스트에서 사라져야 함
    await waitFor(() => {
      expect(eventList.queryByText('회의')).not.toBeInTheDocument();
    });

    // 달력에서도 검색 결과가 없어야 함
    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.queryByText('회의')).not.toBeInTheDocument();
  });

  it('검색어를 삭제하면 모든 일정이 다시 표시된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 첫 번째 일정 생성
    await saveSchedule(user, {
      title: '프로젝트 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    await screen.findByText('일정 로딩 완료!');

    // 두 번째 일정 생성
    await saveSchedule(user, {
      title: '점심 약속',
      date: '2025-10-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심 식사',
      location: '레스토랑',
      category: '개인',
    });

    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('프로젝트 회의')).toBeInTheDocument();
    expect(eventList.getByText('점심 약속')).toBeInTheDocument();

    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '프로젝트');

    // 검색 결과 확인: '프로젝트 회의'만 표시
    await waitFor(() => {
      expect(eventList.getByText('프로젝트 회의')).toBeInTheDocument();
      expect(eventList.queryByText('점심 약속')).not.toBeInTheDocument();
    });

    // 검색어 삭제
    await user.clear(searchInput);

    // 모든 일정이 다시 표시되는지 확인
    await waitFor(() => {
      expect(eventList.getByText('프로젝트 회의')).toBeInTheDocument();
      expect(eventList.getByText('점심 약속')).toBeInTheDocument();
    });

    // 달력에서도 모든 일정이 다시 표시되는지 확인
    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('프로젝트 회의')).toBeInTheDocument();
    expect(monthView.getByText('점심 약속')).toBeInTheDocument();
  }, 10000);

  it('검색어 입력 시 주간 뷰에서도 검색 결과가 올바르게 필터링된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 주간 뷰에 해당하는 일정 생성
    await saveSchedule(user, {
      title: '주간 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 미팅',
      location: '회의실 A',
      category: '업무',
    });

    await screen.findByText('일정 로딩 완료!');

    // 주간 뷰에 해당하지 않는 일정 생성 (다른 주)
    await saveSchedule(user, {
      title: '다른 주 회의',
      date: '2025-10-25',
      startTime: '10:00',
      endTime: '11:00',
      description: '다른 주 미팅',
      location: '회의실 B',
      category: '업무',
    });

    await screen.findByText('일정 로딩 완료!');

    // 주별 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = within(screen.getByTestId('week-view'));
    const eventList = within(screen.getByTestId('event-list'));

    // 주간 뷰에서는 현재 주의 일정만 표시되어야 함
    expect(await weekView.findByText('주간 회의')).toBeInTheDocument();
    expect(eventList.getByText('주간 회의')).toBeInTheDocument();

    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '주간');

    // 검색 결과 확인: 주간 뷰에 해당하는 일정만 검색 결과에 표시
    await waitFor(() => {
      expect(eventList.getByText('주간 회의')).toBeInTheDocument();
      expect(eventList.queryByText('다른 주 회의')).not.toBeInTheDocument();
    });

    // 주간 뷰 달력에서도 검색 결과 확인
    expect(weekView.getByText('주간 회의')).toBeInTheDocument();
    expect(weekView.queryByText('다른 주 회의')).not.toBeInTheDocument();
  }, 10000);

  it('검색어 입력 시 월간 뷰에서도 검색 결과가 올바르게 필터링된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 현재 월의 일정 생성
    await saveSchedule(user, {
      title: '10월 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '10월 미팅',
      location: '회의실 A',
      category: '업무',
    });

    await screen.findByText('일정 로딩 완료!');

    // 다른 월의 일정 생성
    await saveSchedule(user, {
      title: '11월 회의',
      date: '2025-11-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '11월 미팅',
      location: '회의실 B',
      category: '업무',
    });

    await screen.findByText('일정 로딩 완료!');

    const monthView = within(screen.getByTestId('month-view'));
    const eventList = within(screen.getByTestId('event-list'));

    // 월간 뷰에서는 현재 월의 일정만 표시되어야 함
    expect(await monthView.findByText('10월 회의')).toBeInTheDocument();
    expect(eventList.getByText('10월 회의')).toBeInTheDocument();

    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '10월');

    // 검색 결과 확인: 월간 뷰에 해당하는 일정만 검색 결과에 표시
    await waitFor(() => {
      expect(eventList.getByText('10월 회의')).toBeInTheDocument();
      expect(eventList.queryByText('11월 회의')).not.toBeInTheDocument();
    });

    // 월간 뷰 달력에서도 검색 결과 확인
    expect(monthView.getByText('10월 회의')).toBeInTheDocument();
    expect(monthView.queryByText('11월 회의')).not.toBeInTheDocument();
  }, 10000);

  it('여러 일정 중 일부만 검색어에 일치하는 경우 해당 일정만 표시된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 여러 일정 생성
    await saveSchedule(user, {
      title: '프로젝트 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    await screen.findByText('일정 로딩 완료!');

    await saveSchedule(user, {
      title: '점심 약속',
      date: '2025-10-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심 식사',
      location: '레스토랑',
      category: '개인',
    });

    await screen.findByText('일정 로딩 완료!');

    await saveSchedule(user, {
      title: '팀 미팅',
      date: '2025-10-15',
      startTime: '15:00',
      endTime: '16:00',
      description: '주간 팀 미팅',
      location: '회의실 B',
      category: '업무',
    });

    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));

    // 모든 일정이 표시되는지 확인
    expect(await eventList.findByText('프로젝트 회의')).toBeInTheDocument();
    expect(eventList.getByText('점심 약속')).toBeInTheDocument();
    expect(eventList.getByText('팀 미팅')).toBeInTheDocument();

    // 검색어 입력 (일부 일정만 일치)
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '점심');

    // 검색 결과 확인: '점심 약속'만 표시되어야 함
    await waitFor(() => {
      expect(eventList.getByText('점심 약속')).toBeInTheDocument();
      expect(eventList.queryByText('프로젝트 회의')).not.toBeInTheDocument();
      expect(eventList.queryByText('팀 미팅')).not.toBeInTheDocument();
    });

    // 달력에서도 검색 결과 확인
    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('점심 약속')).toBeInTheDocument();
    expect(monthView.queryByText('프로젝트 회의')).not.toBeInTheDocument();
    expect(monthView.queryByText('팀 미팅')).not.toBeInTheDocument();
  }, 10000);

  it('기존 일정이 있는 상태에서 검색어를 입력하면 검색 결과가 즉시 업데이트된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    // 기존 일정이 있는 상태로 설정
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '기존 약속',
        date: '2025-10-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '기존 개인 약속',
        location: '카페',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));

    // 기존 일정들이 표시되는지 확인
    expect(await eventList.findByText('기존 회의')).toBeInTheDocument();
    expect(eventList.getByText('기존 약속')).toBeInTheDocument();

    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '회의');

    // 검색 결과가 즉시 업데이트되는지 확인
    await waitFor(() => {
      expect(eventList.getByText('기존 회의')).toBeInTheDocument();
      expect(eventList.queryByText('기존 약속')).not.toBeInTheDocument();
    });

    // 검색어 변경
    await user.clear(searchInput);
    await user.type(searchInput, '약속');

    // 검색 결과가 즉시 업데이트되는지 확인
    await waitFor(() => {
      expect(eventList.getByText('기존 약속')).toBeInTheDocument();
      expect(eventList.queryByText('기존 회의')).not.toBeInTheDocument();
    });
  });
});
