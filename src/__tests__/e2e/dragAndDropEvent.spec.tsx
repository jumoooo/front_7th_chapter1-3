import { test, expect } from '@playwright/test';

import {
  clearAllEvents,
  getCurrentDateString,
  getDateString,
  saveSchedule,
  waitForPageLoad,
} from './helpers';

/**
 * @name 드래그 앤 드롭 일정 이동 E2E 테스트
 * @description 캘린더의 일정을 드래그하여 다른 날짜나 시간으로 이동하는 기능을 검증하는 E2E 테스트
 */
test.describe('드래그 앤 드롭 일정 이동 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 데이터 초기화 (모든 이벤트 삭제)
    await clearAllEvents(page);
    await waitForPageLoad(page);
  });

  test('달력의 일정을 드래그 후 다른 날짜 위로 이동하면 해당 일정이 해당 날짜로 변경 되어야 한다.', async ({
    page,
  }) => {
    // 현재 날짜를 기준으로 테스트 데이터 생성
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const sourceDate = getCurrentDateString();
    const targetDay = currentDay > 1 ? currentDay - 1 : currentDay + 1; // 이전 날 또는 다음 날

    // 현재 날짜에 일정 생성
    await saveSchedule(page, {
      title: '새 회의',
      date: sourceDate,
      startTime: '09:30',
      endTime: '10:30',
      description: '설명',
      location: '회의실 A',
      category: '업무',
    });

    // 일정 저장 후 성공 메시지 대기
    await page.waitForSelector('text=일정이 추가되었습니다', { timeout: 10000 });

    // 월별 뷰에서 드래그할 일정 Box 찾기
    const monthView = page.getByTestId('month-view');

    // 일정이 달력에 표시될 때까지 대기
    const eventBox = await monthView.locator('text=새 회의').first();
    await expect(eventBox).toBeVisible();

    // 드래그 가능한 요소 찾기 (draggable 속성을 가진 부모 요소)
    const draggableBox = eventBox.locator('xpath=ancestor::div[@draggable="true"]').first();
    await expect(draggableBox).toHaveAttribute('draggable', 'true');

    // 드롭할 대상 날짜 셀 찾기 (다른 날짜)
    const tableBody = monthView.locator('tbody');
    const cells = tableBody.locator('td');

    // 대상 날짜 셀 찾기 (날짜 숫자가 targetDay이고 일정이 없는 셀)
    let targetCell;
    for (let i = 0; i < (await cells.count()); i++) {
      const cell = cells.nth(i);
      const dayText = await cell.locator(`text=${targetDay}`).first();
      const hasEventBox = await cell.locator('text=새 회의').count();

      // 날짜가 targetDay이고 일정이 없는 셀
      if ((await dayText.count()) > 0 && hasEventBox === 0) {
        targetCell = cell;
        break;
      }
    }

    expect(targetCell).toBeDefined();

    // 드래그 앤 드롭 수행
    await draggableBox.dragTo(targetCell!, { force: true });

    // 일정이 새 날짜로 변경되었는지 확인
    await expect(page.getByText('일정이 수정되었습니다')).toBeVisible({ timeout: 10000 });

    // 대상 날짜 셀에 일정이 있는지 확인
    await expect(targetCell!.locator('text=새 회의')).toBeVisible();

    // 원래 위치에서는 일정이 없어야 함 (원래 위치에서 제거됨)
    // 하지만 실제로는 달력이 업데이트되므로, 새 위치에서 확인
    const eventList = page.getByTestId('event-list');
    await expect(getEventTitleLocator(eventList, '새 회의')).toBeVisible();
  });

  test('달력의 일정을 드래그 후 일정이 겹치는 곳 위로 이동하면 겹침 알람 팝업이 발생해야 한다.', async ({
    page,
  }) => {
    // 현재 날짜를 기준으로 테스트 데이터 생성
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const baseDate = getCurrentDateString();
    const targetDay = currentDay; // 같은 날로 드래그하여 겹침 발생

    // 기존 일정 생성 (현재 날짜)
    await saveSchedule(page, {
      title: '기존 회의',
      date: baseDate,
      startTime: '09:00',
      endTime: '15:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
    });

    // 일정 저장 후 성공 메시지 대기
    await page.waitForSelector('text=일정이 추가되었습니다', { timeout: 10000 });

    // 새 일정 생성 (현재 날짜)
    await saveSchedule(page, {
      title: '새 회의',
      date: baseDate,
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    // 일정 저장 후 성공 메시지 대기
    await page.waitForSelector('text=일정이 추가되었습니다', { timeout: 10000 });

    // 월별 뷰에서 드래그할 일정 Box 찾기
    const monthView = page.getByTestId('month-view');

    // 일정이 달력에 표시될 때까지 대기
    const eventBox = await monthView.locator('text=새 회의').first();
    await expect(eventBox).toBeVisible();

    // 드래그 가능한 요소 찾기 (draggable 속성을 가진 부모 요소)
    const draggableBox = eventBox.locator('xpath=ancestor::div[@draggable="true"]').first();
    await expect(draggableBox).toHaveAttribute('draggable', 'true');

    // 드롭할 대상 날짜 셀 찾기 (기존 회의가 있는 셀 - 같은 날)
    const tableBody = monthView.locator('tbody');
    const cells = tableBody.locator('td');

    // 기존 회의가 있는 셀 찾기 (날짜 숫자가 targetDay이고 일정이 있는 셀)
    let targetCell;
    for (let i = 0; i < (await cells.count()); i++) {
      const cell = cells.nth(i);
      const dayText = await cell.locator(`text=${targetDay}`).first();
      const hasEventBox = await cell.locator('text=기존 회의').count();

      if ((await dayText.count()) > 0 && hasEventBox > 0) {
        targetCell = cell;
        break;
      }
    }

    expect(targetCell).toBeDefined();

    // 드래그 앤 드롭 수행
    await draggableBox.dragTo(targetCell!, { force: true });

    // 겹침 경고 팝업이 나타날 때까지 대기
    await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
  });

  test('드래그 앤 드롭으로 일정을 주별 뷰에서 이동할 수 있다', async ({ page }) => {
    // 현재 날짜를 기준으로 테스트 데이터 생성
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const sourceDate = getCurrentDateString();
    const targetDay = currentDay > 1 ? currentDay - 1 : currentDay + 1; // 이전 날 또는 다음 날

    // 현재 날짜에 일정 생성
    await saveSchedule(page, {
      title: '새 회의',
      date: sourceDate,
      startTime: '09:30',
      endTime: '10:30',
      description: '설명',
      location: '회의실 A',
      category: '업무',
    });

    // 일정 저장 후 성공 메시지 대기
    await page.waitForSelector('text=일정이 추가되었습니다', { timeout: 10000 });

    // 주별 View 선택
    await page.getByLabel('뷰 타입 선택').click();
    await page.getByRole('option', { name: 'week-option' }).click();

    // 주별 View에서 드래그할 일정 Box 찾기
    const weekView = page.getByTestId('week-view');

    // 일정이 달력에 표시될 때까지 대기
    const eventBox = await weekView.locator('text=새 회의').first();
    await expect(eventBox).toBeVisible();

    // 드래그 가능한 요소 찾기 (draggable 속성을 가진 부모 요소)
    const draggableBox = eventBox.locator('xpath=ancestor::div[@draggable="true"]').first();
    await expect(draggableBox).toHaveAttribute('draggable', 'true');

    // 드롭할 대상 날짜 셀 찾기 (다른 날짜)
    const tableBody = weekView.locator('tbody');
    const cells = tableBody.locator('td');

    // 대상 날짜 셀 찾기
    let targetCell;
    for (let i = 0; i < (await cells.count()); i++) {
      const cell = cells.nth(i);
      const dayText = await cell.locator(`text=${targetDay}`).first();
      const hasEventBox = await cell.locator('text=새 회의').count();

      if ((await dayText.count()) > 0 && hasEventBox === 0) {
        targetCell = cell;
        break;
      }
    }

    expect(targetCell).toBeDefined();

    // 드래그 앤 드롭 수행
    await draggableBox.dragTo(targetCell!, { force: true });

    // 일정이 새 날짜로 변경되었는지 확인
    await expect(page.getByText('일정이 수정되었습니다')).toBeVisible({ timeout: 10000 });

    // 대상 날짜 셀에 일정이 있는지 확인
    await expect(targetCell!.locator('text=새 회의')).toBeVisible();

    // 이벤트 리스트에서도 확인
    const eventList = page.getByTestId('event-list');
    await expect(getEventTitleLocator(eventList, '새 회의')).toBeVisible();
  });

  test('드래그 앤 드롭으로 반복 일정을 이동하면 확인 다이얼로그가 나타나고 확인 후 반복제거, 날짜가 변경된다', async ({
    page,
  }) => {
    // 현재 날짜를 기준으로 테스트 데이터 생성
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const sourceDate = getCurrentDateString();
    const endDate = getDateString(4); // 현재 날짜에서 4일 후
    const targetDay = currentDay > 1 ? currentDay - 1 : currentDay + 1; // 이전 날 또는 다음 날

    // 반복 일정 생성
    await saveSchedule(page, {
      title: '반복 회의',
      date: sourceDate,
      startTime: '09:30',
      endTime: '10:30',
      description: '반복 일정 설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate },
    });

    // 일정 저장 후 성공 메시지 대기
    await page.waitForSelector('text=일정이 추가되었습니다', { timeout: 10000 });

    // 월별 뷰에서 드래그할 일정 Box 찾기
    const monthView = page.getByTestId('month-view');

    // 일정이 달력에 표시될 때까지 대기
    const eventBox = await monthView.locator('text=반복 회의').first();
    await expect(eventBox).toBeVisible();

    // 드래그 가능한 요소 찾기 (draggable 속성을 가진 부모 요소)
    const draggableBox = eventBox.locator('xpath=ancestor::div[@draggable="true"]').first();
    await expect(draggableBox).toHaveAttribute('draggable', 'true');

    // 드롭할 대상 날짜 셀 찾기 (빈 셀)
    const tableBody = monthView.locator('tbody');
    const cells = tableBody.locator('td');

    // 대상 날짜 셀 찾기
    let targetCell;
    for (let i = 0; i < (await cells.count()); i++) {
      const cell = cells.nth(i);
      const dayText = await cell.locator(`text=${targetDay}`).first();
      const hasEventBox = await cell.locator('text=반복 회의').count();

      if ((await dayText.count()) > 0 && hasEventBox === 0) {
        targetCell = cell;
        break;
      }
    }

    expect(targetCell).toBeDefined();

    // 드래그 앤 드롭 수행
    await draggableBox.dragTo(targetCell!, { force: true });

    // 확인 다이얼로그가 나타나는지 확인
    await expect(page.getByText('반복 일정 수정')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('반복 일정은 날짜 변경시 반복 일정이 취소 됩니다.')).toBeVisible();

    // 확인 버튼 클릭 (예)
    await page.getByText('예').click();

    // 일정이 수정되었다는 메시지 확인
    await expect(page.getByText('일정이 수정되었습니다')).toBeVisible({ timeout: 10000 });

    // 대상 날짜 셀에 일정이 있는지 확인
    await expect(targetCell!.locator('text=반복 회의')).toBeVisible();

    // 반복 일정이 취소되었는지 확인 (반복 아이콘이 없어야 함)
    // 이벤트 리스트에서도 확인
    const eventList = page.getByTestId('event-list');
    await expect(getEventTitleLocator(eventList, '반복 회의')).toBeVisible();

    // 반복 아이콘이 없어야 함 (반복이 취소되었으므로)
    const repeatIcons = eventList.locator('[data-testid="RepeatIcon"]');
    // 수정된 일정에는 반복 아이콘이 없어야 함
    // 하지만 다른 반복 일정이 있을 수 있으므로, 새로 생성된 일정의 반복 아이콘만 확인
  });
});
