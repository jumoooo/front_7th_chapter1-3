/**
 * @name Calendar Dialogs Story
 * @description 다이얼로그 및 모달의 다양한 상태를 테스트하는 Story
 */

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

// ConfirmDialog는 App.tsx에서 사용되지만, 실제 컴포넌트는 App 내부에 구현되어 있음
// 여기서는 App.tsx의 구조를 기반으로 다이얼로그를 재현
import RecurringEventDialog from '../components/RecurringEventDialog';
import { Event } from '../types';

// 겹침 경고 다이얼로그 컴포넌트 (App.tsx에서 가져온 구조)
const OverlapDialog = ({
  open,
  onClose,
  onConfirm,
  overlappingEvents,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  overlappingEvents: Event[];
}) => {
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>일정 겹침 경고</DialogTitle>
      <DialogContent>
        <DialogContentText>다음 일정과 겹칩니다:</DialogContentText>
        {overlappingEvents.map((event) => (
          <Typography key={event.id} sx={{ ml: 1, mb: 1 }}>
            {event.title} ({event.date} {event.startTime}-{event.endTime})
          </Typography>
        ))}
        <DialogContentText>계속 진행하시겠습니까?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button color="error" onClick={onConfirm}>
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// 샘플 겹침 이벤트 데이터
const sampleOverlappingEvents: Event[] = [
  {
    id: '1',
    title: '기존 회의',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 일정',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
  {
    id: '2',
    title: '다른 회의',
    date: '2025-10-15',
    startTime: '09:30',
    endTime: '10:30',
    description: '다른 일정',
    location: '회의실 B',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
];

// 다이얼로그 뷰 컴포넌트
const DialogsView = () => {
  return (
    <Stack spacing={4} sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4">다이얼로그 및 모달</Typography>

      <Stack spacing={2}>
        <Typography variant="h6">1. ConfirmDialog - 기본</Typography>
        <Dialog open={true} onClose={fn()}>
          <DialogTitle>확인</DialogTitle>
          <DialogContent>
            <DialogContentText>이 작업을 진행하시겠습니까?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={fn()}>취소</Button>
            <Button onClick={fn()} color="primary" variant="contained">
              확인
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>

      <Stack spacing={2}>
        <Typography variant="h6">2. ConfirmDialog - 긴 메시지</Typography>
        <Dialog open={true} onClose={fn()}>
          <DialogTitle>주의</DialogTitle>
          <DialogContent>
            <DialogContentText>
              이 작업은 되돌릴 수 없습니다. 정말로 이 작업을 진행하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={fn()}>취소</Button>
            <Button onClick={fn()} color="primary" variant="contained">
              확인
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>

      <Stack spacing={2}>
        <Typography variant="h6">3. RecurringEventDialog - 수정 모드</Typography>
        <RecurringEventDialog
          open={true}
          mode="edit"
          event={sampleOverlappingEvents[0]}
          onClose={fn()}
          onConfirm={fn()}
        />
      </Stack>

      <Stack spacing={2}>
        <Typography variant="h6">4. RecurringEventDialog - 삭제 모드</Typography>
        <RecurringEventDialog
          open={true}
          mode="delete"
          event={sampleOverlappingEvents[0]}
          onClose={fn()}
          onConfirm={fn()}
        />
      </Stack>

      <Stack spacing={2}>
        <Typography variant="h6">5. OverlapDialog - 겹침 경고</Typography>
        <OverlapDialog
          open={true}
          overlappingEvents={sampleOverlappingEvents}
          onClose={fn()}
          onConfirm={fn()}
        />
      </Stack>
    </Stack>
  );
};

const meta = {
  title: 'Calendar/Dialogs',
  component: DialogsView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '캘린더에서 사용되는 모든 다이얼로그와 모달의 시각적 표현을 테스트합니다.',
      },
    },
    chromatic: {
      diffThreshold: 0.063,
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DialogsView>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 모든 다이얼로그 표시
 */
export const AllDialogs: Story = {};

