/**
 * @name 날짜 클릭 일정 생성 E2E 테스트 (필수 스펙)
 * @description 캘린더의 빈 날짜 셀 클릭 시 일정 생성 폼에 날짜가 자동으로 채워지는 기능을 검증하는 E2E 테스트
 */

import { screen, within } from '@testing-library/react';
import { vi } from 'vitest';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { server } from '../../setupTests';
import { setup } from '../testUtils';

describe('날짜 클릭 일정 생성 E2E 테스트', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  // 날짜 클릭후 일정 생성 폼에 날짜가 자동으로 채워지는지 확인한다
  it('날짜 클릭후 일정 생성 폼에 날짜가 자동으로 채워지는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-11-04'));
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 달력의 빈 2025-11-04 셀 클릭
    const monthView = screen.getByTestId('month-view');
    const tableBody = within(monthView).getAllByRole('rowgroup')[1];
    const allBodyCells = within(tableBody).getAllByRole('cell');
    const emptyCell = allBodyCells.find((cell) => {
      const dayText = within(cell).queryByText('4');
      // 일정이 없는 빈 셀인지 확인
      const hasEventBox = within(cell).queryByRole('button', { name: /.*/ });
      return dayText !== null && !hasEventBox;
    });

    expect(emptyCell).toBeDefined();
    await user.click(emptyCell!);

    // 날짜가 자동으로 채워졌는지 확인
    expect(screen.getByLabelText('날짜')).toHaveValue('2025-11-04');
  });

  it('날짜 클릭후 입력된 날짜를 가진 폼으로 일정을 정상적으로 생성되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-11-04'));
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 달력의 빈 2025-11-04 셀 클릭
    const monthView = screen.getByTestId('month-view');
    const tableBody = within(monthView).getAllByRole('rowgroup')[1];
    const allBodyCells = within(tableBody).getAllByRole('cell');
    const emptyCell = allBodyCells.find((cell) => {
      const dayText = within(cell).queryByText('4');
      // 일정이 없는 빈 셀인지 확인
      const hasEventBox = within(cell).queryByRole('button', { name: /.*/ });
      return dayText !== null && !hasEventBox;
    });

    expect(emptyCell).toBeDefined();
    await user.click(emptyCell!);

    // 날짜가 자동으로 채워졌는지 확인
    expect(screen.getByLabelText('날짜')).toHaveValue('2025-11-04');

    // 일정 정보 입력
    await user.type(screen.getByLabelText('제목'), '날짜 클릭 회의');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.type(screen.getByLabelText('설명'), '날짜 클릭으로 생성된 회의');
    await user.type(screen.getByLabelText('위치'), '회의실 B');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 일정 생성
    await user.click(screen.getByTestId('event-submit-button'));

    // 일정이 생성되었다는 메시지 확인
    await screen.findByText('일정이 추가되었습니다');

    // 이벤트 리스트에 표시되는지 확인
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('날짜 클릭 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-11-04')).toBeInTheDocument();
    expect(eventList.getByText('09:00 - 10:00')).toBeInTheDocument();
    expect(eventList.getByText('날짜 클릭으로 생성된 회의')).toBeInTheDocument();
    expect(eventList.getByText('회의실 B')).toBeInTheDocument();
    expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();

    // 달력(월별 뷰)에 표시되는지 확인
    const monthView02 = within(screen.getByTestId('month-view'));
    expect(monthView02.getByText('날짜 클릭 회의')).toBeInTheDocument();
  });
});
