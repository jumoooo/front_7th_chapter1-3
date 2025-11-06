/**
 * @name Calendar Event States Story
 * @description 일정 상태별 시각적 표현을 테스트하는 Story
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Box, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Notifications, Repeat } from '@mui/icons-material';

import { Event } from '../types';

// 일정 상태별 스타일 (App.tsx에서 가져온 스타일)
const eventBoxStyles = {
  notified: {
    backgroundColor: '#ffebee',
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  normal: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'normal',
    color: 'inherit',
  },
  common: {
    p: 0.5,
    my: 0.5,
    borderRadius: 1,
    minHeight: '18px',
    width: '100%',
    overflow: 'hidden',
  },
};

// 샘플 이벤트 데이터
const sampleEvents: Event[] = [
  {
    id: '1',
    title: '일반 일정',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '일반 일정입니다',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
  {
    id: '2',
    title: '알림 일정',
    date: '2025-10-15',
    startTime: '14:00',
    endTime: '15:00',
    description: '알림이 설정된 일정입니다',
    location: '회의실 B',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '반복 일정',
    date: '2025-10-15',
    startTime: '16:00',
    endTime: '17:00',
    description: '반복되는 일정입니다',
    location: '온라인',
    category: '업무',
    repeat: { type: 'daily', interval: 1, endDate: '2025-12-31' },
    notificationTime: 60,
  },
  {
    id: '4',
    title: '알림 + 반복 일정',
    date: '2025-10-15',
    startTime: '18:00',
    endTime: '19:00',
    description: '알림과 반복이 모두 설정된 일정입니다',
    location: '회의실 C',
    category: '가족',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 1,
  },
];

// 일정 셀 컴포넌트
const EventCell = ({ event, isNotified }: { event: Event; isNotified: boolean }) => {
  const isRepeating = event.repeat.type !== 'none';

  return (
    <Box
      sx={{
        ...eventBoxStyles.common,
        ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {isNotified && <Notifications fontSize="small" />}
        {isRepeating && <Repeat fontSize="small" />}
        <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
          {event.title}
        </Typography>
      </Stack>
    </Box>
  );
};

// 일정 상태별 뷰 컴포넌트
const EventStatesView = () => {
  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        일정 상태별 시각적 표현
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>일정 상태</TableCell>
              <TableCell>시각적 표현</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  일반 일정
                </Typography>
              </TableCell>
              <TableCell>
                <EventCell event={sampleEvents[0]} isNotified={false} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  알림 일정
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (빨간색 배경, 굵은 글씨)
                </Typography>
              </TableCell>
              <TableCell>
                <EventCell event={sampleEvents[1]} isNotified={true} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  반복 일정
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (반복 아이콘 표시)
                </Typography>
              </TableCell>
              <TableCell>
                <EventCell event={sampleEvents[2]} isNotified={false} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  알림 + 반복 일정
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (알림 + 반복 아이콘 모두 표시)
                </Typography>
              </TableCell>
              <TableCell>
                <EventCell event={sampleEvents[3]} isNotified={true} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const meta = {
  title: 'Calendar/EventStates',
  component: EventStatesView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '일정의 상태별 시각적 표현을 테스트합니다 (일반, 알림, 반복, 알림+반복).',
      },
    },
    chromatic: {
      diffThreshold: 0.063,
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EventStatesView>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 모든 일정 상태 표시
 */
export const AllStates: Story = {};

