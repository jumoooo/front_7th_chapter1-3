/**
 * @name Calendar Form States Story
 * @description 폼 컨트롤의 다양한 상태를 테스트하는 Story
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

// 폼 컨트롤 상태 뷰 컴포넌트
const FormStatesView = () => {
  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        폼 컨트롤 상태
      </Typography>

      <Stack spacing={4}>
        {/* 정상 상태 */}
        <Stack spacing={2}>
          <Typography variant="h6">1. 정상 상태</Typography>
          <FormControl fullWidth>
            <FormLabel htmlFor="title-normal">제목</FormLabel>
            <TextField id="title-normal" size="small" value="일반 일정" />
          </FormControl>
          <FormControl fullWidth>
            <FormLabel htmlFor="date-normal">날짜</FormLabel>
            <TextField id="date-normal" size="small" type="date" value="2025-10-15" />
          </FormControl>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <FormLabel htmlFor="start-time-normal">시작 시간</FormLabel>
              <TextField id="start-time-normal" size="small" type="time" value="09:00" />
            </FormControl>
            <FormControl fullWidth>
              <FormLabel htmlFor="end-time-normal">종료 시간</FormLabel>
              <TextField id="end-time-normal" size="small" type="time" value="10:00" />
            </FormControl>
          </Stack>
        </Stack>

        {/* 에러 상태 */}
        <Stack spacing={2}>
          <Typography variant="h6">2. 에러 상태</Typography>
          <FormControl fullWidth>
            <FormLabel htmlFor="title-error">제목 (필수)</FormLabel>
            <TextField id="title-error" size="small" value="" error helperText="제목을 입력해주세요" />
          </FormControl>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <FormLabel htmlFor="start-time-error">시작 시간</FormLabel>
              <Tooltip title="종료 시간보다 늦을 수 없습니다" open={true} placement="top">
                <TextField
                  id="start-time-error"
                  size="small"
                  type="time"
                  value="10:00"
                  error
                />
              </Tooltip>
            </FormControl>
            <FormControl fullWidth>
              <FormLabel htmlFor="end-time-error">종료 시간</FormLabel>
              <Tooltip title="시작 시간보다 이전일 수 없습니다" open={true} placement="top">
                <TextField
                  id="end-time-error"
                  size="small"
                  type="time"
                  value="09:00"
                  error
                />
              </Tooltip>
            </FormControl>
          </Stack>
        </Stack>

        {/* 비활성화 상태 */}
        <Stack spacing={2}>
          <Typography variant="h6">3. 비활성화 상태</Typography>
          <FormControl fullWidth>
            <FormLabel htmlFor="title-disabled">제목</FormLabel>
            <TextField id="title-disabled" size="small" value="비활성화된 필드" disabled />
          </FormControl>
          <FormControl fullWidth>
            <FormLabel htmlFor="category-disabled">카테고리</FormLabel>
            <Select id="category-disabled" size="small" value="업무" disabled>
              <MenuItem value="업무">업무</MenuItem>
              <MenuItem value="개인">개인</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <FormControlLabel control={<Checkbox checked={false} disabled />} label="반복 일정" />
          </FormControl>
        </Stack>

        {/* 선택 상태 */}
        <Stack spacing={2}>
          <Typography variant="h6">4. 선택 상태</Typography>
          <FormControl fullWidth>
            <FormLabel htmlFor="category-selected">카테고리</FormLabel>
            <Select id="category-selected" size="small" value="업무">
              <MenuItem value="업무">업무</MenuItem>
              <MenuItem value="개인">개인</MenuItem>
              <MenuItem value="가족">가족</MenuItem>
              <MenuItem value="기타">기타</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <FormControlLabel control={<Checkbox checked={true} />} label="반복 일정" />
          </FormControl>
        </Stack>

        {/* 버튼 상태 */}
        <Stack spacing={2} direction="row">
          <Button variant="contained" color="primary">
            일정 추가
          </Button>
          <Button variant="contained" color="primary" disabled>
            일정 추가 (비활성화)
          </Button>
          <Button variant="outlined" color="primary">
            취소
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

const meta = {
  title: 'Calendar/FormStates',
  component: FormStatesView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '폼 컨트롤의 다양한 상태를 테스트합니다 (정상, 에러, 비활성화, 선택).',
      },
    },
    chromatic: {
      diffThreshold: 0.063,
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FormStatesView>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 모든 폼 상태 표시
 */
export const AllFormStates: Story = {};

