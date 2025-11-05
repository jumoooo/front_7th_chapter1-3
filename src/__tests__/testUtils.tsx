import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, RenderResult, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import type { Event, RepeatInfo } from '../types';

const theme = createTheme();

export const setup = (element: ReactElement): RenderResult & { user: UserEvent } => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

// 일정 생성 헬퍼 함수
export const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'> & { repeat?: RepeatInfo }
) => {
  const { title, date, startTime, endTime, location, description, category, repeat } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  if (repeat) {
    await user.click(screen.getByLabelText('반복 일정'));
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: `${repeat.type}-option` }));
    await user.clear(screen.getByLabelText('반복 간격'));
    await user.type(screen.getByLabelText('반복 간격'), String(repeat.interval));
    if (repeat.endDate) {
      await user.type(screen.getByLabelText('반복 종료일'), repeat.endDate!);
    }
  }

  await user.click(screen.getByTestId('event-submit-button'));
};
