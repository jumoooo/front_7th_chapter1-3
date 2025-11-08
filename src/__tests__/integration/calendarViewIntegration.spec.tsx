import { screen, within } from '@testing-library/react';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { RepeatInfo } from '../../types';
import { setup } from '../testUtils';

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
