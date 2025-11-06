/**
 * @name Calendar 컴포넌트 Story
 * @description 캘린더 뷰의 다양한 상태를 보여주는 시각적 회귀 테스트용 Story
 *
 * 주의: App 컴포넌트는 많은 의존성(API 호출, MSW 등)이 필요하므로
 * 실제 캘린더 뷰는 CalendarEventStates, CalendarCellTextLength 스토리에서 확인할 수 있습니다.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography } from '@mui/material';

// App 컴포넌트 대신 간단한 플레이스홀더 컴포넌트 사용
const CalendarPlaceholder = ({ viewType }: { viewType: 'week' | 'month' }) => {
  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {viewType === 'week' ? 'Week 뷰' : 'Month 뷰'}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        실제 캘린더 뷰는 CalendarEventStates와 CalendarCellTextLength 스토리에서 확인할 수 있습니다.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        App 컴포넌트는 API 호출과 MSW 설정이 필요하므로, 시각적 회귀 테스트는 개별 컴포넌트
        스토리에서 수행합니다.
      </Typography>
    </Box>
  );
};

const meta = {
  title: 'Calendar/Views',
  component: CalendarPlaceholder,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '캘린더의 Week/Month 뷰 타입별 렌더링을 테스트합니다. 실제 뷰는 다른 스토리에서 확인하세요.',
      },
    },
    // Chromatic 시각적 회귀 테스트 설정
    // viewports와 modes는 동시에 사용할 수 없으므로 viewports만 사용
    chromatic: {
      diffThreshold: 0.063,
      viewports: [1280, 768],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    viewType: {
      control: 'select',
      options: ['week', 'month'],
      description: '캘린더 뷰 타입',
    },
  },
} satisfies Meta<typeof CalendarPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Week 뷰 기본 렌더링
 * 주별 캘린더 뷰를 표시합니다.
 * 실제 뷰는 CalendarEventStates와 CalendarCellTextLength 스토리에서 확인하세요.
 */
export const WeekView: Story = {
  args: {
    viewType: 'week',
  },
  parameters: {
    chromatic: {
      delay: 500,
    },
  },
};

/**
 * Month 뷰 기본 렌더링
 * 월별 캘린더 뷰를 표시합니다.
 * 실제 뷰는 CalendarEventStates와 CalendarCellTextLength 스토리에서 확인하세요.
 */
export const MonthView: Story = {
  args: {
    viewType: 'month',
  },
  parameters: {
    chromatic: {
      delay: 500,
    },
  },
};
