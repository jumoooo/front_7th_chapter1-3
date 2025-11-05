/**
 * @name 드래그 앤 드롭 일정 이동 E2E 테스트 (필수 스펙)
 * @description 캘린더의 일정을 드래그하여 다른 날짜나 시간으로 이동하는 기능을 검증하는 E2E 테스트
 */
import { fireEvent, screen, within, act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { server } from '../../setupTests';
import type { Event } from '../../types';
import { setup, saveSchedule } from '../testUtils';

describe('드래그 앤 드롭 일정 이동 E2E 테스트', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('달력의 일정을 드래그 후 일정이 없는 곳 위로 이동하면 해당 일정이 해당 날짜로 변경 되어야 한다.', async () => {
    vi.setSystemTime(new Date('2025-11-04'));
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 11월 4일에 일정 생성
    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-11-04',
      startTime: '09:30',
      endTime: '10:30',
      description: '설명',
      location: '회의실 A',
      category: '업무',
    });

    // 일정이 생성되었다는 메시지 확인
    await screen.findByText('일정이 추가되었습니다');

    // 일정 업데이트용 mock 설정 (드래그 앤 드롭 후 업데이트를 위해)
    setupMockHandlerUpdating();

    // 월별 뷰에서 드래그할 일정 Box 찾기 (11월 4일의 일정)
    const monthView = screen.getByTestId('month-view');

    // 일정이 달력에 표시될 때까지 대기
    const eventBox = await within(monthView).findByText('새 회의');
    const draggableBox = eventBox.closest('[draggable="true"]');
    expect(draggableBox).toBeDefined();

    // 드롭할 대상 날짜 셀 찾기 (11월 3일 빈 란)
    const tableBody = within(monthView).getAllByRole('rowgroup')[1];
    const allBodyCells = within(tableBody).getAllByRole('cell');

    // 11월 3일 셀 찾기 (날짜 숫자가 3이고 일정이 없는 셀)
    const targetDay = 3;
    const targetCell = allBodyCells.find((cell) => {
      const dayText = within(cell).queryByText(String(targetDay));
      // 일정이 없는 셀인지 확인 (일정 Box가 없어야 함)
      const hasEventBox = within(cell).queryByText('새 회의');
      return dayText && !hasEventBox;
    });

    expect(targetCell).toBeDefined();

    // 유저처럼 드래그 앤 드롭 수행
    // 1. 마우스를 일정 위로 이동하고 누름 (mousedown)
    await user.pointer({ target: draggableBox!, keys: '[MouseLeft>]' });

    // 2. 드래그 시작 (dragstart 이벤트 발생)
    fireEvent.dragStart(draggableBox!);
    await act(async () => {});

    // 3. 드롭 대상 위로 마우스 이동 (dragover 이벤트 발생)
    const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
    // spy 함수 로 만드려면 이렇게 새로 설정 해줘야 한다.
    Object.defineProperty(dragOverEvent, 'preventDefault', {
      value: vi.fn(),
      writable: true,
    });
    fireEvent(targetCell!, dragOverEvent);
    await act(async () => {});

    // 4. 드롭 대상 위에서 마우스 버튼 놓기 (drop 이벤트 발생)
    await user.pointer({ target: targetCell!, keys: '[/MouseLeft]' });
    fireEvent.drop(targetCell!);
    await act(async () => {});

    // 일정이 새 날짜(11월 3일)로 변경되었는지 확인
    await screen.findByText('일정이 수정되었습니다');

    // 11월 3일 셀에 일정이 있는지 확인
    expect(within(targetCell!).getByText('새 회의')).toBeInTheDocument();

    // 11월 4일 셀에는 일정이 없어야 함 (원래 위치에서 제거됨)
    const originalCell = allBodyCells.find((cell) => {
      const dayText = within(cell).queryByText('4');
      return dayText && within(cell).queryByText('새 회의');
    });
    expect(originalCell).toBeUndefined();
  });

  it('달력의 일정을 드래그 후 일정이 겹치는 곳 위로 이동하면 겹침 알람 팝업이 발생해야 한다.', async () => {
    vi.setSystemTime(new Date('2025-11-04'));

    // POST와 PUT을 모두 지원하는 mock 설정
    // 초기에는 기존 일정이 있고, 생성 후 업데이트를 위해 PUT 핸들러도 포함
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-11-03',
        startTime: '09:00',
        endTime: '15:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
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
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params;
        const updatedEvent = (await request.json()) as Event;
        const index = mockEvents.findIndex((event) => event.id === id);
        if (index !== -1) {
          mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
          return HttpResponse.json(mockEvents[index]);
        }
        return new HttpResponse(null, { status: 404 });
      })
    );

    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 새 일정 생성
    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-11-04',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    // 일정이 생성되었다는 메시지 확인
    await screen.findByText('일정이 추가되었습니다');

    // 월별 뷰에서 드래그할 일정 Box 찾기 (11월 4일의 일정)
    const monthView = screen.getByTestId('month-view');

    // 일정이 달력에 표시될 때까지 대기
    const eventBox = await within(monthView).findByText('새 회의');
    const draggableBox = eventBox.closest('[draggable="true"]');
    expect(draggableBox).toBeDefined();

    // 드롭할 대상 날짜 셀 찾기 (11월 3일 빈 란)
    const tableBody = within(monthView).getAllByRole('rowgroup')[1];
    const allBodyCells = within(tableBody).getAllByRole('cell');

    // 11월 3일 셀 찾기 (날짜 숫자가 3이고 일정이 있는 셀)
    const targetDay = 3;
    const targetCell = allBodyCells.find((cell) => {
      const dayText = within(cell).queryByText(String(targetDay));
      // 일정이 있는 셀인지 확인 (일정 Box가 없어야 함)
      const hasEventBox = within(cell).queryByText('기존 회의');
      return dayText !== null && hasEventBox !== null;
    });

    expect(targetCell).toBeDefined();

    // 1. 마우스를 일정 위로 이동하고 누름 (mousedown)
    await user.pointer({ target: draggableBox!, keys: '[MouseLeft>]' });

    // 2. 드래그 시작 (dragstart 이벤트 발생)
    fireEvent.dragStart(draggableBox!);
    await act(async () => {});

    // 3. 드롭 대상 위로 마우스 이동 (dragover 이벤트 발생)
    const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
    // spy 함수 로 만드려면 이렇게 새로 설정 해줘야 한다.
    Object.defineProperty(dragOverEvent, 'preventDefault', {
      value: vi.fn(),
      writable: true,
    });
    fireEvent(targetCell!, dragOverEvent);
    await act(async () => {});

    // 4. 드롭 대상 위에서 마우스 버튼 놓기 (drop 이벤트 발생)
    await user.pointer({ target: targetCell!, keys: '[/MouseLeft]' });
    fireEvent.drop(targetCell!);
    await act(async () => {});

    // 겹침 경고 팝업이 나타날 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });

  it('드래그 앤 드롭으로 일정의 날짜만 변경할 수 있다', async () => {
    // 시스템 시간 설정
    vi.setSystemTime(new Date('2025-11-04'));
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 테스트용 일정 생성
    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-11-04',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    // 일정이 달력에 표시될 때까지 대기
    await screen.findByText('일정이 추가되었습니다');

    // 드래그할 일정 Box 찾기
    const monthView = screen.getByTestId('month-view');
    const eventBox = await within(monthView).findByText('새 회의');
    const draggableBox = eventBox.closest('[draggable="true"]');
    expect(draggableBox).toBeDefined();

    // 드롭할 대상 날짜 셀 찾기 (같은 날짜의 다른 시간대)
    const tableBody = within(monthView).getAllByRole('rowgroup')[1];
    const allBodyCells = within(tableBody).getAllByRole('cell');
    // 드래그 앤 드롭 수행
    // 일정이 수정되었다는 메시지 확인
    // 일정의 날짜는 동일하고 시간만 변경되었는지 확인
  });

  it('드래그 앤 드롭으로 일정을 주별 뷰에서 이동할 수 있다', async () => {
    // 시스템 시간 설정
    // Mock handler 설정 (일정 생성 및 업데이트 지원)
    // App 렌더링
    // 일정 로딩 완료 대기
    // 테스트용 일정 생성
    // 주별 뷰로 전환
    // 일정이 주별 뷰에 표시될 때까지 대기
    // 드래그할 일정 Box 찾기
    // 드롭할 대상 날짜/시간 셀 찾기
    // 드래그 앤 드롭 수행
    // 일정이 수정되었다는 메시지 확인
    // 주별 뷰에서 일정이 새 위치로 이동되었는지 확인
  });

  it('드래그 앤 드롭 중 취소하면 일정이 원래 위치에 유지된다', async () => {
    // 시스템 시간 설정
    // Mock handler 설정 (일정 생성 지원)
    // App 렌더링
    // 일정 로딩 완료 대기
    // 테스트용 일정 생성
    // 일정이 달력에 표시될 때까지 대기
    // 드래그할 일정 Box 찾기
    // 드롭할 대상 날짜 셀 찾기
    // 드래그 시작
    // 드래그 중 취소 (ESC 키 또는 다른 방법)
    // 일정이 원래 위치에 그대로 있는지 확인
    // 일정이 수정되지 않았다는 것을 확인 (수정 메시지가 없음)
  });

  it('드래그 앤 드롭으로 반복 일정을 이동하면 반복 일정 수정 다이얼로그가 나타난다', async () => {
    // 시스템 시간 설정
    // Mock handler 설정 (반복 일정 생성 및 업데이트 지원)
    // App 렌더링
    // 일정 로딩 완료 대기
    // 반복 일정 생성
    // 일정이 달력에 표시될 때까지 대기
    // 드래그할 반복 일정 Box 찾기
    // 드롭할 대상 날짜 셀 찾기
    // 드래그 앤 드롭 수행
    // 반복 일정 수정 다이얼로그가 나타나는지 확인
    // "해당 일정만 수정" 또는 "모든 일정 수정" 옵션이 있는지 확인
  });

  it('드래그 앤 드롭으로 일정을 다른 달로 이동할 수 있다', async () => {
    // 시스템 시간 설정
    // Mock handler 설정 (일정 생성 및 업데이트 지원)
    // App 렌더링
    // 일정 로딩 완료 대기
    // 테스트용 일정 생성
    // 일정이 달력에 표시될 때까지 대기
    // 다음 달로 이동
    // 드래그할 일정 Box 찾기 (다음 달에서)
    // 드롭할 대상 날짜 셀 찾기 (다른 날짜)
    // 드래그 앤 드롭 수행
    // 일정이 수정되었다는 메시지 확인
    // 일정이 새 날짜로 이동되었는지 확인
  });

  it('드래그 앤 드롭으로 일정을 이동할 때 유효하지 않은 날짜로 이동하면 에러가 발생한다', async () => {
    // 시스템 시간 설정
    // Mock handler 설정 (일정 생성 지원)
    // App 렌더링
    // 일정 로딩 완료 대기
    // 테스트용 일정 생성
    // 일정이 달력에 표시될 때까지 대기
    // 드래그할 일정 Box 찾기
    // 유효하지 않은 날짜 셀 찾기 (예: 빈 셀, 다른 달의 빈 영역)
    // 드래그 앤 드롭 수행 시도
    // 에러 메시지가 표시되거나 드롭이 무시되는지 확인
    // 일정이 원래 위치에 유지되는지 확인
  });
});
