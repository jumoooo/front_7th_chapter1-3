/**
 * @name ConfirmDialog 컴포넌트 Story
 * @description 확인 다이얼로그 컴포넌트의 다양한 상태를 보여주는 Story
 */

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import ConfirmDialog from './ConfirmDialog';

const meta = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '사용자 확인을 받기 위한 다이얼로그 컴포넌트입니다.',
      },
    },
    // Chromatic 시각적 회귀 테스트 설정
    chromatic: {
      diffThreshold: 0.063,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: '다이얼로그 열림/닫힘 상태',
    },
    title: {
      control: 'text',
      description: '다이얼로그 제목',
    },
    message: {
      control: 'text',
      description: '다이얼로그 메시지 내용',
    },
    onClose: {
      action: 'closed',
      description: '다이얼로그 닫기 콜백',
    },
    onConfirm: {
      action: 'confirmed',
      description: '확인 버튼 클릭 콜백',
    },
  },
  args: {
    onClose: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 확인 다이얼로그
 */
export const Default: Story = {
  args: {
    open: true,
    title: '확인',
    message: '이 작업을 진행하시겠습니까?',
  },
};

/**
 * 긴 메시지를 포함한 확인 다이얼로그
 */
export const LongMessage: Story = {
  args: {
    open: true,
    title: '주의',
    message:
      '이 작업은 되돌릴 수 없습니다. 정말로 이 작업을 진행하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.',
  },
};

/**
 * 닫힌 상태의 다이얼로그
 */
export const Closed: Story = {
  args: {
    open: false,
    title: '확인',
    message: '이 작업을 진행하시겠습니까?',
  },
};

/**
 * 반복 일정 관련 확인 다이얼로그
 */
export const RecurringEventConfirmation: Story = {
  args: {
    open: true,
    title: '반복 일정 수정',
    message: '반복 일정은 날짜 변경시 반복 일정이 취소 됩니다.',
  },
};

