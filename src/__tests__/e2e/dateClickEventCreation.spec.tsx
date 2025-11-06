import { test, expect } from '@playwright/test';

import { clearAllEvents, getCurrentDateString, waitForPageLoad } from './helpers';

/**
 * @name 날짜 클릭 일정 생성 E2E 테스트
 * @description 캘린더의 빈 날짜 셀 클릭 시 일정 생성 폼에 날짜가 자동으로 채워지는 기능을 검증하는 E2E 테스트
 */
test.describe('날짜 클릭 일정 생성 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 데이터 초기화 (모든 이벤트 삭제)
    await clearAllEvents(page);
    await waitForPageLoad(page);
  });

  test('날짜 클릭후 일정 생성 폼에 날짜가 자동으로 채워지는지 확인한다', async ({ page }) => {
    // 현재 날짜를 기준으로 테스트
    const currentDate = new Date();
    const currentDay = currentDate.getDate();

    // 달력의 빈 현재 날짜 셀 찾기
    const monthView = page.getByTestId('month-view');
    const tableBody = monthView.locator('tbody');
    const cells = tableBody.locator('td');

    // 현재 날짜 셀 찾기 (일정이 없는 빈 셀)
    let targetCell;
    for (let i = 0; i < (await cells.count()); i++) {
      const cell = cells.nth(i);
      const dayText = await cell.locator(`text=${currentDay}`).first();
      const hasEventBox = await cell.locator('button').count();

      // 날짜가 현재 날짜이고 일정이 없는 셀
      if ((await dayText.count()) > 0 && hasEventBox === 0) {
        targetCell = cell;
        break;
      }
    }

    expect(targetCell).toBeDefined();

    // 셀 클릭
    await targetCell!.click();

    // 날짜가 자동으로 채워졌는지 확인 (현재 날짜)
    const expectedDate = getCurrentDateString();
    await expect(page.getByLabel('날짜')).toHaveValue(expectedDate);
  });

  test('날짜 클릭후 입력된 날짜를 가진 폼으로 일정을 정상적으로 생성되는지 확인한다', async ({
    page,
  }) => {
    // 현재 날짜를 기준으로 테스트
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const expectedDate = getCurrentDateString();

    // 달력의 빈 현재 날짜 셀 찾기
    const monthView = page.getByTestId('month-view');
    const tableBody = monthView.locator('tbody');
    const cells = tableBody.locator('td');

    // 현재 날짜 셀 찾기
    let targetCell;
    for (let i = 0; i < (await cells.count()); i++) {
      const cell = cells.nth(i);
      const dayText = await cell.locator(`text=${currentDay}`).first();
      const hasEventBox = await cell.locator('button').count();

      if ((await dayText.count()) > 0 && hasEventBox === 0) {
        targetCell = cell;
        break;
      }
    }

    expect(targetCell).toBeDefined();

    // 셀 클릭
    await targetCell!.click();

    // 날짜가 자동으로 채워졌는지 확인
    await expect(page.getByLabel('날짜')).toHaveValue(expectedDate);

    // 일정 정보 입력
    await page.getByLabel('제목').fill('날짜 클릭 회의');
    await page.getByLabel('시작 시간').fill('09:00');
    await page.getByLabel('종료 시간').fill('10:00');
    await page.getByLabel('설명').fill('날짜 클릭으로 생성된 회의');
    await page.getByLabel('위치').fill('회의실 B');

    // 카테고리 선택
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무-option' }).click();

    // 일정 생성
    await page.getByTestId('event-submit-button').click();

    // 일정 저장 후 성공 메시지 대기
    await page.waitForSelector('text=일정이 추가되었습니다', { timeout: 10000 });

    // 이벤트 리스트에 표시되는지 확인 (제목만 찾기)
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('날짜 클릭 회의')).toBeVisible();
    await expect(eventList.getByText(expectedDate)).toBeVisible();
    await expect(eventList.getByText('09:00 - 10:00')).toBeVisible();
    await expect(eventList.getByText('날짜 클릭으로 생성된 회의')).toBeVisible();
    await expect(eventList.getByText('회의실 B')).toBeVisible();
    await expect(eventList.getByText('카테고리: 업무')).toBeVisible();

    // 달력(월별 뷰)에 표시되는지 확인
    const monthView02 = page.getByTestId('month-view');
    await expect(monthView02.getByText('날짜 클릭 회의')).toBeVisible();
  });
});
