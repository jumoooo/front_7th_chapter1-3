import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/__tests__/e2e',
  timeout: 30 * 1000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173', // Vite dev server URL
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev', // Vite 실행 명령
    port: 5173,
    reuseExistingServer: !process.env.CI, // CI 환경에서는 새 서버 띄움
    env: {
      TEST_ENV: 'e2e', // E2E 테스트용 환경 변수 설정 (Playwright가 자동으로 전달)
    },
  },
});
