import { test, expect } from '@playwright/test';

import { clearAllEvents, waitForPageLoad } from './helpers';

/**
 * @name 기본 E2E 테스트 예제
 * @description Playwright MCP를 사용한 기본 테스트 예제
 */
test.describe('기본 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 데이터 초기화 (모든 이벤트 삭제)
    await clearAllEvents(page);
    // 앱이 로딩될 때까지 대기
    await waitForPageLoad(page);
  });

  test('메인 페이지가 렌더링된다', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/일정관리 앱으로 학습하는 테스트 코드/);

    // 주요 UI 요소가 표시되는지 확인
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '일정 보기' })).toBeVisible();
  });

  test('버튼 클릭 시 일정 추가 폼이 표시된다', async ({ page }) => {
    // "일정 추가" 버튼 클릭
    const addButton = page.getByRole('button', { name: '일정 추가' });
    await addButton.click();

    // 폼이 표시되는지 확인
    await expect(page.getByLabel('제목')).toBeVisible();
    await expect(page.getByLabel('날짜')).toBeVisible();
    await expect(page.getByLabel('시작 시간')).toBeVisible();
    await expect(page.getByLabel('종료 시간')).toBeVisible();
  });
});
