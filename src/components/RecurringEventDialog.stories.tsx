/**
 * @name RecurringEventDialog 컴포넌트 Story
 * @description 반복 일정 다이얼로그 컴포넌트의 다양한 상태를 보여주는 Story
 */

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import RecurringEventDialog from './RecurringEventDialog';

const meta = {
  title: 'Components/RecurringEventDialog',
  component: RecurringEventDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '반복 일정 수정/삭제 시 단일 인스턴스 또는 전체 시리즈를 선택할 수 있는 다이얼로그 컴포넌트입니다.',
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
      description: '확인 버튼 클릭 콜백 (true: 단일, false: 전체)',
    },
  },
  args: {
    onClose: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof RecurringEventDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 수정 모드 기본 다이얼로그
 */
export const EditMode: Story = {
  args: {
    open: true,
    title: '반복 일정 수정',
    message: '해당 일정만 수정하시겠어요?',
  },
};

/**
 * 삭제 모드 다이얼로그
 */
export const DeleteMode: Story = {
  args: {
    open: true,
    title: '반복 일정 삭제',
    message: '해당 일정만 삭제하시겠어요?',
  },
};

/**
 * 닫힌 상태의 다이얼로그
 */
export const Closed: Story = {
  args: {
    open: false,
    title: '반복 일정 수정',
    message: '해당 일정만 수정하시겠어요?',
  },
};

/**
 * 긴 메시지를 포함한 다이얼로그
 */
export const LongMessage: Story = {
  args: {
    open: true,
    title: '반복 일정 수정',
    message:
      '이 반복 일정을 수정하시겠습니까? 예를 선택하면 해당 일정만 수정되고, 아니오를 선택하면 모든 반복 일정이 수정됩니다.',
  },
};

