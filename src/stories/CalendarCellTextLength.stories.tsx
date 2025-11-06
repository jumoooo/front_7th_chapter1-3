/**
 * @name Calendar Cell Text Length Story
 * @description 각 셀의 텍스트 길이에 따른 처리를 테스트하는 Story
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Box, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Notifications, Repeat } from '@mui/icons-material';

import { Event } from '../types';

// 일정 상태별 스타일
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

// 다양한 텍스트 길이의 샘플 이벤트
const sampleEvents: Event[] = [
  {
    id: '1',
    title: '짧은 제목',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '짧은 제목입니다',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
  {
    id: '2',
    title: '보통 길이의 일정 제목입니다',
    date: '2025-10-15',
    startTime: '11:00',
    endTime: '12:00',
    description: '보통 길이의 제목',
    location: '회의실 B',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
  {
    id: '3',
    title: '매우 긴 일정 제목입니다. 이 제목은 셀의 너비를 초과할 수 있습니다',
    date: '2025-10-15',
    startTime: '14:00',
    endTime: '15:00',
    description: '매우 긴 제목',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
  {
    id: '4',
    title: '초과하는 텍스트는 잘려야 합니다. noWrap 속성으로 처리됩니다',
    date: '2025-10-15',
    startTime: '16:00',
    endTime: '17:00',
    description: '텍스트 오버플로우 처리',
    location: '온라인',
    category: '가족',
    repeat: { type: 'daily', interval: 1 },
    notificationTime: 60,
  },
  {
    id: '5',
    title: '아이콘과 함께 긴 텍스트',
    date: '2025-10-15',
    startTime: '18:00',
    endTime: '19:00',
    description: '아이콘과 긴 텍스트',
    location: '회의실 D',
    category: '기타',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 1,
  },
];

// 일정 셀 컴포넌트
const EventCell = ({ event, isNotified, cellWidth }: { event: Event; isNotified: boolean; cellWidth?: string }) => {
  const isRepeating = event.repeat.type !== 'none';

  return (
    <Box
      sx={{
        ...eventBoxStyles.common,
        ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
        width: cellWidth || '100%',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {isNotified && <Notifications fontSize="small" />}
        {isRepeating && <Repeat fontSize="small" />}
        <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2, flex: 1 }}>
          {event.title}
        </Typography>
      </Stack>
    </Box>
  );
};

// 텍스트 길이별 뷰 컴포넌트
const CellTextLengthView = () => {
  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        셀 텍스트 길이에 따른 처리
      </Typography>

      <Stack spacing={4}>
        {/* Week 뷰 스타일 (넓은 셀) */}
        <Stack spacing={2}>
          <Typography variant="h6">Week 뷰 - 넓은 셀 (14.28% 너비)</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                      {day}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {[1, 2, 3, 4, 5].map((day) => (
                    <TableCell
                      key={day}
                      sx={{
                        height: '120px',
                        verticalAlign: 'top',
                        width: '14.28%',
                        padding: 1,
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden',
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {day}
                      </Typography>
                      {sampleEvents[day - 1] && (
                        <EventCell
                          event={sampleEvents[day - 1]}
                          isNotified={day === 5}
                          cellWidth="100%"
                        />
                      )}
                    </TableCell>
                  ))}
                  {[null, null].map((_, idx) => (
                    <TableCell
                      key={`empty-${idx}`}
                      sx={{
                        height: '120px',
                        verticalAlign: 'top',
                        width: '14.28%',
                        padding: 1,
                        border: '1px solid #e0e0e0',
                      }}
                    />
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>

        {/* Month 뷰 스타일 (동일한 너비) */}
        <Stack spacing={2}>
          <Typography variant="h6">Month 뷰 - 동일한 너비 셀</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                      {day}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {[1, 2, 3, 4, 5].map((day) => (
                    <TableCell
                      key={day}
                      sx={{
                        height: '120px',
                        verticalAlign: 'top',
                        width: '14.28%',
                        padding: 1,
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden',
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {day}
                      </Typography>
                      {sampleEvents[day - 1] && (
                        <EventCell
                          event={sampleEvents[day - 1]}
                          isNotified={day === 5}
                          cellWidth="100%"
                        />
                      )}
                    </TableCell>
                  ))}
                  {[null, null].map((_, idx) => (
                    <TableCell
                      key={`empty-${idx}`}
                      sx={{
                        height: '120px',
                        verticalAlign: 'top',
                        width: '14.28%',
                        padding: 1,
                        border: '1px solid #e0e0e0',
                      }}
                    />
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>

        {/* 개별 셀 비교 */}
        <Stack spacing={2}>
          <Typography variant="h6">텍스트 길이별 개별 셀 비교</Typography>
          <Stack spacing={2}>
            <Box sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                1. 짧은 텍스트
              </Typography>
              <EventCell event={sampleEvents[0]} isNotified={false} cellWidth="200px" />
            </Box>
            <Box sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                2. 보통 길이 텍스트
              </Typography>
              <EventCell event={sampleEvents[1]} isNotified={false} cellWidth="200px" />
            </Box>
            <Box sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                3. 긴 텍스트 (noWrap 처리)
              </Typography>
              <EventCell event={sampleEvents[2]} isNotified={false} cellWidth="200px" />
            </Box>
            <Box sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                4. 매우 긴 텍스트 (오버플로우 처리)
              </Typography>
              <EventCell event={sampleEvents[3]} isNotified={false} cellWidth="200px" />
            </Box>
            <Box sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                5. 아이콘과 함께 긴 텍스트
              </Typography>
              <EventCell event={sampleEvents[4]} isNotified={true} cellWidth="200px" />
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

const meta = {
  title: 'Calendar/CellTextLength',
  component: CellTextLengthView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '각 셀의 텍스트 길이에 따른 처리 방식을 테스트합니다 (짧은 텍스트, 긴 텍스트, 오버플로우 처리).',
      },
    },
    chromatic: {
      diffThreshold: 0.063,
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CellTextLengthView>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 모든 텍스트 길이 케이스 표시
 */
export const AllTextLengths: Story = {};

