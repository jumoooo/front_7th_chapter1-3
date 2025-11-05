import { fireEvent, screen, within, act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { setup, saveSchedule } from './testUtils'; // 추가
import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
  setupMockHandlerListCreation,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import type { Event } from '../types';

// testUtils 로 해당 로직 이동
// const theme = createTheme();

// // ! Hard 여기 제공 안함
// const setup = (element: ReactElement) => {
//   const user = userEvent.setup();

//   return {
//     ...render(
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         <SnackbarProvider>{element}</SnackbarProvider>
//       </ThemeProvider>
//     ),
//     user,
//   };
// };

// // ! Hard 여기 제공 안함
// const saveSchedule = async (
//   user: UserEvent,
//   form: Omit<Event, 'id' | 'notificationTime' | 'repeat'> & { repeat?: RepeatInfo }
// ) => {
//   const { title, date, startTime, endTime, location, description, category, repeat } = form;

//   await user.click(screen.getAllByText('일정 추가')[0]);

//   await user.type(screen.getByLabelText('제목'), title);
//   await user.type(screen.getByLabelText('날짜'), date);
//   await user.type(screen.getByLabelText('시작 시간'), startTime);
//   await user.type(screen.getByLabelText('종료 시간'), endTime);
//   await user.type(screen.getByLabelText('설명'), description);
//   await user.type(screen.getByLabelText('위치'), location);
//   await user.click(screen.getByLabelText('카테고리'));
//   await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
//   await user.click(screen.getByRole('option', { name: `${category}-option` }));

//   if (repeat) {
//     await user.click(screen.getByLabelText('반복 일정'));
//     await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
//     await user.click(screen.getByRole('option', { name: `${repeat.type}-option` }));
//     await user.clear(screen.getByLabelText('반복 간격'));
//     await user.type(screen.getByLabelText('반복 간격'), String(repeat.interval));
//     if (repeat.endDate) {
//       await user.type(screen.getByLabelText('반복 종료일'), repeat.endDate!);
//     }
//   }

//   await user.click(screen.getByTestId('event-submit-button'));
// };

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('새 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
    expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 진행 상황 논의')).toBeInTheDocument();
    expect(eventList.getByText('회의실 A')).toBeInTheDocument();
    expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const { user } = setup(<App />);

    setupMockHandlerUpdating();

    await user.click(await screen.findByLabelText('Edit event'));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '회의 내용 변경');

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('수정된 회의')).toBeInTheDocument();
    expect(eventList.getByText('회의 내용 변경')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('삭제할 이벤트')).toBeInTheDocument();

    // 삭제 버튼 클릭
    const allDeleteButton = await screen.findAllByLabelText('Delete event');
    await user.click(allDeleteButton[0]);

    expect(eventList.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
  });
});

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

describe('검색 기능', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: '1',
              title: '팀 회의',
              date: '2025-10-15',
              startTime: '09:00',
              endTime: '10:00',
              description: '주간 팀 미팅',
              location: '회의실 A',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
            {
              id: '2',
              title: '프로젝트 계획',
              date: '2025-10-16',
              startTime: '14:00',
              endTime: '15:00',
              description: '새 프로젝트 계획 수립',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
          ],
        });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지 않는 일정');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');
    await user.clear(searchInput);

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 계획')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
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

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '설명',
      location: '회의실 A',
      category: '업무',
    });

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const editButton = (await screen.findAllByLabelText('Edit event'))[1];
    await user.click(editButton);

    // 시간 수정하여 다른 일정과 충돌 발생
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '08:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-10-15 08:49:59'));

  setup(<App />);

  // ! 일정 로딩 완료 후 테스트
  await screen.findByText('일정 로딩 완료!');

  expect(screen.queryByText('10분 후 기존 회의 일정이 시작됩니다.')).not.toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(screen.getByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});

// ! 새로 추가된 테스트

it('입력한 새로운 반복 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
  setupMockHandlerListCreation();

  const { user } = setup(<App />);

  await saveSchedule(user, {
    title: '새 회의',
    date: '2025-10-15',
    startTime: '14:00',
    endTime: '15:00',
    description: '프로젝트 진행 상황 논의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'daily', interval: 2, endDate: '2025-10-17' },
  });

  const eventList = within(screen.getByTestId('event-list'));
  expect(eventList.getAllByText('반복: 2일마다 (종료: 2025-10-17)')).toHaveLength(2);
  expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
  expect(eventList.getByText('2025-10-17')).toBeInTheDocument();
});

it('새로 추가한 반복 일정을 수정하는 경우 반복 일정에 관한 표시가 사라진다', async () => {
  setupMockHandlerUpdating([
    {
      id: '1',
      title: '새 회의',
      date: '2025-10-17',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'daily', interval: 2, endDate: '2025-10-17' },
      notificationTime: 10,
    },
  ]);

  const { user } = setup(<App />);

  const eventList = within(screen.getByTestId('event-list'));
  expect(await eventList.findByText('반복: 2일마다 (종료: 2025-10-17)')).toBeInTheDocument();

  await user.click(await screen.findByLabelText('Edit event'));

  // 반복 일정 편집 다이얼로그가 나타나면 '예'를 선택 (단일 수정)
  const recurringDialog = await screen.findByText('반복 일정 수정');
  expect(recurringDialog).toBeInTheDocument();

  await user.click(screen.getByText('예'));

  const titleInput = screen.getByLabelText('제목');
  await user.click(titleInput);
  await user.keyboard('{Control>}a{/Control}');
  await user.keyboard('{delete}');
  await user.type(titleInput, '수정된 회의');

  const descInput = screen.getByLabelText('설명');
  await user.click(descInput);
  await user.keyboard('{Control>}a{/Control}');
  await user.keyboard('{delete}');
  await user.type(descInput, '회의 내용 변경');

  await user.click(screen.getByTestId('event-submit-button'));

  expect(eventList.queryByText('반복: 2일마다 (종료: 2025-10-17)')).not.toBeInTheDocument();
});

it('반복 일정을 수정하는 경우 반복 유형 관련 입력 폼이 사라진다', async () => {
  setupMockHandlerUpdating([
    {
      id: '1',
      title: '새 회의',
      date: '2025-10-17',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'daily', interval: 2, endDate: '2025-10-17' },
      notificationTime: 10,
    },
  ]);

  const { user } = setup(<App />);

  await user.click(await screen.findByLabelText('Edit event'));

  // 반복 일정 편집 다이얼로그가 나타나면 '예'를 선택 (단일 수정)
  const recurringDialog = await screen.findByText('반복 일정 수정');
  expect(recurringDialog).toBeInTheDocument();

  await user.click(screen.getByText('예'));

  // 반복 일정 편집 모드에서는 반복 관련 폼이 숨겨져야 함
  expect(screen.queryByText('반복 일정')).not.toBeInTheDocument();
  expect(screen.queryByText('반복 유형')).not.toBeInTheDocument();
  expect(screen.queryByText('반복 간격')).not.toBeInTheDocument();
  expect(screen.queryByText('반복 종료일')).not.toBeInTheDocument();
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
  });
});
