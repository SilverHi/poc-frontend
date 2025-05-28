'use client';

import { ReactNode } from 'react';
import { Modal as AntModal, Button, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  isLoading?: boolean;
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  children: ReactNode;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  canSubmit?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// 基础Modal组件
export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}: ModalProps) {
  const getWidth = (size: string) => {
    switch (size) {
      case 'sm': return 400;
      case 'md': return 520;
      case 'lg': return 800;
      default: return 520;
    }
  };

  return (
    <AntModal
      title={title}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={getWidth(size)}
      closable={showCloseButton}
    >
      {children}
    </AntModal>
  );
}

// 确认弹窗组件
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  confirmButtonClass,
  isLoading = false
}: ConfirmModalProps) {
  const isDanger = confirmButtonClass?.includes('red');

  return (
    <AntModal
      title={title}
      open={isOpen}
      onCancel={onClose}
      closable={false}
      footer={
        <Space>
          <Button onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            type="primary"
            danger={isDanger}
            loading={isLoading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </Space>
      }
    >
      <div className="flex items-start gap-3">
        <ExclamationCircleOutlined className="text-orange-500 text-lg mt-1" />
        <p className="text-gray-600">{message}</p>
      </div>
    </AntModal>
  );
}

// 表单弹窗组件
export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = '提交',
  cancelText = '取消',
  isSubmitting = false,
  canSubmit = true,
  size = 'md'
}: FormModalProps) {
  const getWidth = (size: string) => {
    switch (size) {
      case 'sm': return 400;
      case 'md': return 520;
      case 'lg': return 800;
      default: return 520;
    }
  };

  return (
    <AntModal
      title={title}
      open={isOpen}
      onCancel={onClose}
      width={getWidth(size)}
      footer={
        <Space>
          <Button onClick={onClose} disabled={isSubmitting}>
            {cancelText}
          </Button>
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={!canSubmit}
            onClick={onSubmit}
          >
            {submitText}
          </Button>
        </Space>
      }
    >
      <div className="space-y-4">
        {children}
      </div>
    </AntModal>
  );
} 