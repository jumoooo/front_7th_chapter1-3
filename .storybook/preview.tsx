import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { Preview } from '@storybook/react';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';

// Material-UI 테마 생성
const theme = createTheme();

// Storybook 데코레이터: Material-UI ThemeProvider와 SnackbarProvider로 감싸기
const withMuiTheme = (Story: any) => {
  return React.createElement(
    ThemeProvider,
    { theme },
    React.createElement(CssBaseline),
    React.createElement(SnackbarProvider, null, React.createElement(Story))
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Chromatic 설정
    chromatic: {
      // 시각적 회귀 테스트 감도 설정 (0~1, 기본값 0.063)
      diffThreshold: 0.063,
      // 스냅샷 모드 설정
      modes: {
        mobile: {
          viewport: 'mobile1',
        },
        desktop: {
          viewport: 'desktop',
        },
      },
    },
  },
  decorators: [withMuiTheme],
};

export default preview;
