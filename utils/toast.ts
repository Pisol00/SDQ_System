// utils/toast.ts
import { toast } from 'sonner';

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, { description });
  },

  error: (message: string, description?: string) => {
    toast.error(message, { description });
  },

  info: (message: string, description?: string) => {
    toast.info(message, { description });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, { description });
  },

  loading: (message: string, id?: string) => {
    return toast.loading(message, { id });
  },

  confirm: (title: string, description: string, onConfirm: () => void, onCancel?: () => void) => {
    toast(title, {
      description,
      action: {
        label: 'ตกลง',
        onClick: onConfirm
      },
      cancel: {
        label: 'ยกเลิก',
        onClick: onCancel || (() => {})
      }
    });
  },

  // For navigation confirmations
  navConfirm: (onConfirm: () => void) => {
    toast('การประเมินยังไม่เสร็จสิ้น', {
      description: 'ต้องการออกจากหน้านี้หรือไม่?',
      action: {
        label: 'ออกจากหน้า',
        onClick: onConfirm
      },
      cancel: {
        label: 'ยกเลิก',
        onClick: () => {}
      }
    });
  },

  // For logout confirmation
  logoutConfirm: (onConfirm: () => void) => {
    toast('ต้องการออกจากระบบหรือไม่?', {
      description: 'คุณจะต้องเข้าสู่ระบบใหม่',
      action: {
        label: 'ออกจากระบบ',
        onClick: onConfirm
      },
      cancel: {
        label: 'ยกเลิก',
        onClick: () => {}
      }
    });
  }
};