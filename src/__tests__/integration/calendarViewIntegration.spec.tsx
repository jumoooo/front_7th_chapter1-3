import { fireEvent, screen, within, act, waitFor } from '@testing-library/react';

import {
  setupMockHandlerCreation,
  setupMockHandlerListCreation,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils';
import App from '../../App';
import { server } from '../../setupTests';
import { RepeatInfo } from '../../types';
import { setup, saveSchedule } from '../testUtils';

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // ! 현재 시스템 시간 2025-10-01
    const { user } = setup(<App />);

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번주 팀 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번주 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = within(screen.getByTestId('week-view'));
    expect(weekView.getByText('이번주 팀 회의')).toBeInTheDocument();
  });

  it('주간 뷰에서 다음 달로 넘어가는 주의 일정이 달력에 올바르게 표시된다', async () => {
    // 10월 말 근처 날짜로 설정 (2025-10-29, 수요일)
    // 이 날짜의 주는 10월 27일(일) ~ 11월 2일(토)가 됨
    vi.setSystemTime(new Date('2025-10-29'));
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // 다음 달(11월 1일)에 일정 생성
    await saveSchedule(user, {
      title: '다음 달 회의',
      date: '2025-11-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '다음 달 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 주별 뷰 선택
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // 주간 뷰에서 다음 달 일정이 표시되는지 확인
    const weekView = within(screen.getByTestId('week-view'));
    expect(weekView.getByText('다음 달 회의')).toBeInTheDocument();

    // 검색 목록에서도 다음 달 일정이 표시되는지 확인
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('다음 달 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2025-01-01'));

    setup(<App />);

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번달 팀 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번달 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('이번달 팀 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));
    setup(<App />);

    const monthView = screen.getByTestId('month-view');

    // 1월 1일 셀 확인
    const januaryFirstCell = within(monthView).getByText('1').closest('td')!;
    expect(within(januaryFirstCell).getByText('신정')).toBeInTheDocument();
  });
});

it('주별 뷰 선택 후 해당 주에 반복 일정이 존재한다면 해당 일정이 반복 일정 표시와 함께 정확히 표시된다', async () => {
  setupMockHandlerListCreation();

  const { user } = setup(<App />);

  await saveSchedule(user, {
    title: '새 회의',
    date: '2025-10-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '프로젝트 진행 상황 논의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'daily', interval: 2, endDate: '2025-10-03' },
  });

  await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: 'week-option' }));

  const weekView = within(screen.getByTestId('week-view'));
  expect(weekView.getAllByText('새 회의')).toHaveLength(2);
});

it('월간 뷰 선택 후 해당 주에 반복 일정이 존재한다면 해당 일정이 반복 일정 표시와 함께 정확히 표시된다', async () => {
  setupMockHandlerListCreation();

  const { user } = setup(<App />);

  await saveSchedule(user, {
    title: '새 회의',
    date: '2025-10-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '프로젝트 진행 상황 논의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'daily', interval: 2, endDate: '2025-10-03' },
  });

  const eventList = within(screen.getByTestId('event-list'));
  expect(eventList.getAllByText('새 회의')).toHaveLength(2);
});

describe('달력 부분 마우스 조작 기능 테스트', () => {
  describe('달력 클릭시 기능', () => {
    it('달력의 날짜가 없는 곳을 클릭 시 "일정 추가" 란의 내용이 변동이 없어야 한다.', async () => {
      vi.setSystemTime(new Date('2025-11-04'));
      const { user } = setup(<App />);

      // 일정 로딩 완료 대기
      await screen.findByText('일정 로딩 완료!');

      // 일정 추가 폼에 값을 먼저 채워놓기
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '테스트 일정');
      await user.type(screen.getByLabelText('날짜'), '2025-11-15');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');

      // 월별 뷰에서 날짜가 없는 빈 셀 찾기 (다른 달의 날짜 부분)
      const monthView = screen.getByTestId('month-view');

      // TableBody 내의 모든 TableCell 찾기 (TableHead 제외)
      const tableBody = within(monthView).getAllByRole('rowgroup')[1];
      const allBodyCells = within(tableBody).getAllByRole('cell');

      // 날짜 숫자가 없는 빈 셀 찾기 (day가 null인 셀)
      const emptyCell = allBodyCells.find((cell) => {
        // 공휴일 텍스트도 없는 셀
        const hasDayNumber = within(cell).queryByText(/^\d+$/);
        const hasHoliday = within(cell).queryByText(/[가-힣]+/);
        return !hasDayNumber && !hasHoliday;
      });

      // 빈 셀이 존재하는지 확인
      expect(emptyCell).toBeDefined();

      // 날짜가 없는 빈 셀 클릭
      await user.click(emptyCell!);

      // 폼의 내용이 변하지 않았는지 확인
      expect(screen.getByLabelText('제목')).toHaveValue('테스트 일정');
      expect(screen.getByLabelText('날짜')).toHaveValue('2025-11-15');
      expect(screen.getByLabelText('시작 시간')).toHaveValue('10:00');
      expect(screen.getByLabelText('종료 시간')).toHaveValue('11:00');
    });

    it('달력의 일정이 없는 셀 클릭 시 "일정 추가" 란의 날짜가 해당 날짜로 자동으로 채워져야 한다.', async () => {
      vi.setSystemTime(new Date('2025-11-04'));
      const { user } = setup(<App />);
      // 일정 로딩 완료 대기
      await screen.findByText('일정 로딩 완료!');
      // 달력의 빈 2025-11-04 셀 클릭
      const monthView = screen.getByTestId('month-view');
      const tableBody = within(monthView).getAllByRole('rowgroup')[1];
      const allBodyCells = within(tableBody).getAllByRole('cell');
      const emptyCell = allBodyCells.find((cell) => {
        const hasDayNumber = within(cell).queryByText(4);
        return hasDayNumber;
      });

      await user.click(emptyCell!);

      // 데이터 추가 확인
      expect(screen.getByLabelText('날짜')).toHaveValue('2025-11-04');
    });
  });

  describe('달력 드래그 앤 드롭 기능', () => {
    afterEach(() => {
      server.resetHandlers();
    });

    it('달력의 일정을 드래그 후 일정이 없는 곳 위로 이동하면 해당 일정이 해당 날짜로 변경 되어야 한다.', async () => {
      vi.setSystemTime(new Date('2025-11-04'));
      setupMockHandlerCreation(); // 일정 생성용 mock 설정
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
      setupMockHandlerCreation([
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
      ]);

      // PUT 핸들러 추가 설정
      setupMockHandlerUpdating([
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
      ]);

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
  });
});

describe('네비게이션 후 헤더 표시', () => {
  it('월별 뷰에서 네비게이션 후 올바른 월 정보가 표시된다', async () => {
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 초기 상태 확인 (10월)
    expect(screen.getByText('2025년 10월')).toBeInTheDocument();

    // 다음 버튼 클릭 - 11월
    await user.click(screen.getByLabelText('Next'));
    expect(screen.getByText('2025년 11월')).toBeInTheDocument();

    // 다음 버튼 클릭 - 12월
    await user.click(screen.getByLabelText('Next'));
    expect(screen.getByText('2025년 12월')).toBeInTheDocument();

    // 다음 버튼 클릭 - 다음 연도 1월
    await user.click(screen.getByLabelText('Next'));
    expect(screen.getByText('2026년 1월')).toBeInTheDocument();

    // 이전 버튼으로 돌아가기
    await user.click(screen.getByLabelText('Previous'));
    expect(screen.getByText('2025년 12월')).toBeInTheDocument();
  });

  it('주별 뷰에서 네비게이션 후 올바른 주 정보가 표시된다', async () => {
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 주별 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // 초기 상태 확인
    expect(screen.getByText(/2025년 10월 1주/)).toBeInTheDocument();

    // 다음 버튼 클릭 - 다음 주
    await user.click(screen.getByLabelText('Next'));
    expect(screen.getByText(/2025년 10월 2주/)).toBeInTheDocument();

    // 계속 다음 버튼 클릭하여 월 경계 확인
    await user.click(screen.getByLabelText('Next'));
    await user.click(screen.getByLabelText('Next'));
    await user.click(screen.getByLabelText('Next'));

    // 10월 말에서 11월로 넘어가는지 확인
    const weekHeader = screen.getByTestId('week-view').querySelector('h5');
    expect(weekHeader?.textContent).toMatch(/2025년 (10|11)월 \d주/);

    // 이전 버튼으로 돌아가기
    await user.click(screen.getByLabelText('Previous'));
    await user.click(screen.getByLabelText('Previous'));
    expect(screen.getByText(/2025년 10월/)).toBeInTheDocument();
  });
});

describe('네비게이션 버튼과 일정 필터링', () => {
  const events = [
    {
      id: '1',
      title: '9월 일정',
      date: '2025-09-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '9월 중요 일정',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 } as RepeatInfo,
      notificationTime: 10,
    },
    {
      id: '2',
      title: '10월 일정',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '10월 중요 일정',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 } as RepeatInfo,
      notificationTime: 10,
    },
    {
      id: '3',
      title: '11월 일정',
      date: '2025-11-15',
      startTime: '16:00',
      endTime: '17:00',
      description: '11월 중요 일정',
      location: '회의실 C',
      category: '개인',
      repeat: { type: 'none', interval: 0 } as RepeatInfo,
      notificationTime: 10,
    },
  ];

  it('월별 뷰에서 이전/다음 버튼 클릭 시 캘린더에서 해당 월의 일정만 표시된다', async () => {
    setupMockHandlerCreation(events);
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 10월 뷰에서 시작 - 캘린더와 일정 리스트 모두 10월 일정만 표시
    const monthView = within(screen.getByTestId('month-view'));

    expect(screen.getByText('2025년 10월')).toBeInTheDocument();
    expect(monthView.getByText('10월 일정')).toBeInTheDocument();
    expect(monthView.queryByText('9월 일정')).not.toBeInTheDocument();
    expect(monthView.queryByText('11월 일정')).not.toBeInTheDocument();

    // 이전 버튼 클릭 - 9월로 이동
    await user.click(screen.getByLabelText('Previous'));

    // 캘린더와 일정 리스트 모두 9월 일정만 표시
    expect(screen.getByText('2025년 9월')).toBeInTheDocument();
    expect(monthView.getByText('9월 일정')).toBeInTheDocument();
    expect(monthView.queryByText('10월 일정')).not.toBeInTheDocument();

    // 다음 버튼 두 번 클릭 - 11월로 이동
    await user.click(screen.getByLabelText('Next'));
    await user.click(screen.getByLabelText('Next'));

    // 캘린더와 일정 리스트 모두 11월 일정만 표시
    expect(screen.getByText('2025년 11월')).toBeInTheDocument();
    expect(monthView.getByText('11월 일정')).toBeInTheDocument();
    expect(monthView.queryByText('10월 일정')).not.toBeInTheDocument();
  });

  it('주별 뷰에서 이전/다음 버튼 클릭 시 캘린더에서 해당 주의 일정만 표시된다', async () => {
    setupMockHandlerCreation(events);
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 주별 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = within(screen.getByTestId('week-view'));

    // 10월 첫 주 확인 (10월 1일 포함)
    expect(screen.getByText(/2025년 10월 1주/)).toBeInTheDocument();

    // 다음 버튼 클릭하여 10월 15일이 포함된 주로 이동
    await user.click(screen.getByLabelText('Next'));
    await user.click(screen.getByLabelText('Next'));

    // 캘린더와 일정 리스트 모두 10월 15일 일정만 표시
    expect(weekView.getByText('10월 일정')).toBeInTheDocument();
    expect(weekView.queryByText('9월 일정')).not.toBeInTheDocument();
    expect(weekView.queryByText('11월 일정')).not.toBeInTheDocument();
  });
});
