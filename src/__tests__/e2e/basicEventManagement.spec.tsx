/**
 * @name 기본 일정 관리 워크플로우 E2E 테스트
 * @description 기본 일정의 생성(Create), 조회(Read), 수정(Update), 삭제(Delete) 전반을 검증하는 E2E 테스트
 */

import { screen, within } from '@testing-library/react';
import { vi } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils';
import App from '../../App';
import { server } from '../../setupTests';
import { setup, saveSchedule } from '../testUtils';

describe('기본 일정 관리 워크플로우 E2E 테스트', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('일정을 생성하고 이벤트 리스트와 달력에 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 일정 생성
    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    // 일정이 생성되었다는 메시지 확인
    await screen.findByText('일정이 추가되었습니다');

    // 이벤트 리스트에 표시되는지 확인 (일정이 리스트에 나타날 때까지 대기)
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('새 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
    expect(eventList.getByText('09:30 - 10:30')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 진행 상황 논의')).toBeInTheDocument();
    expect(eventList.getByText('회의실 A')).toBeInTheDocument();
    expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();

    // 달력(월별 뷰)에 표시되는지 확인
    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('새 회의')).toBeInTheDocument();
  });

  it('생성된 일정이 이벤트 리스트와 달력에서 정확히 조회되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 일정 생성
    await saveSchedule(user, {
      title: '조회 테스트 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '조회 테스트용 회의',
      location: '회의실 B',
      category: '개인',
    });

    await screen.findByText('일정이 추가되었습니다');

    // 이벤트 리스트에서 모든 필드가 정확히 표시되는지 확인
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('조회 테스트 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
    expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(eventList.getByText('조회 테스트용 회의')).toBeInTheDocument();
    expect(eventList.getByText('회의실 B')).toBeInTheDocument();
    expect(eventList.getByText('카테고리: 개인')).toBeInTheDocument();

    // 달력(월별 뷰)에서 일정이 표시되는지 확인
    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('조회 테스트 회의')).toBeInTheDocument();

    // 주별 뷰 전환 후에도 표시되는지 확인
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = within(screen.getByTestId('week-view'));
    expect(weekView.getByText('조회 테스트 회의')).toBeInTheDocument();
  });

  it('일정을 수정하고 변경사항이 이벤트 리스트와 달력에 반영되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 기존 일정 편집 버튼 클릭
    const editButtons = await screen.findAllByLabelText('Edit event');
    expect(editButtons.length).toBeGreaterThan(0);
    await user.click(editButtons[0]);

    // 일정 정보 수정
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '회의 내용 변경');
    await user.clear(screen.getByLabelText('날짜'));
    await user.type(screen.getByLabelText('날짜'), '2025-10-16');

    // 수정 완료
    await user.click(screen.getByTestId('event-submit-button'));
    await screen.findByText('일정이 수정되었습니다');

    // 이벤트 리스트에 변경사항 반영 확인
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('수정된 회의')).toBeInTheDocument();
    expect(eventList.getByText('회의 내용 변경')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-16')).toBeInTheDocument();

    // 달력에 변경사항 반영 확인
    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('수정된 회의')).toBeInTheDocument();
  });

  it('일정을 삭제하고 이벤트 리스트와 달력에서 제거되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 삭제할 일정이 이벤트 리스트에 있는지 확인
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('삭제할 이벤트')).toBeInTheDocument();

    // 달력에 일정이 표시되는지 확인
    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('삭제할 이벤트')).toBeInTheDocument();

    // 삭제 버튼 클릭
    const deleteButton = await screen.findByLabelText('Delete event');
    await user.click(deleteButton);

    // 삭제 완료 메시지 확인
    await screen.findByText('일정이 삭제되었습니다');

    // 이벤트 리스트에서 제거 확인
    expect(eventList.queryByText('삭제할 이벤트')).not.toBeInTheDocument();

    // 달력에서 제거 확인
    expect(monthView.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
  });

  it('생성된 일정이 검색 결과에 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 일정 생성
    await saveSchedule(user, {
      title: '검색 테스트 회의',
      date: '2025-10-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '검색 테스트용 회의',
      location: '회의실 C',
      category: '가족',
    });

    await screen.findByText('일정이 추가되었습니다');

    // 일정이 리스트에 나타날 때까지 대기
    const eventList = within(screen.getByTestId('event-list'));
    await eventList.findByText('검색 테스트 회의');

    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '검색 테스트');

    // 검색 결과에 일정이 표시되는지 확인
    expect(eventList.getByText('검색 테스트 회의')).toBeInTheDocument();
    expect(eventList.getByText('검색 테스트용 회의')).toBeInTheDocument();

    // 검색어를 지우면 모든 일정이 다시 표시되는지 확인
    await user.clear(searchInput);
    expect(eventList.getByText('검색 테스트 회의')).toBeInTheDocument();
  });
});
