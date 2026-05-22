import type { ColorVariant } from 'bootstrap-vue-next';

export interface NotifyOptions {
  title?: string;
  message: string;
  variant?: ColorVariant;
}

export interface NotifyConfirmOptions extends NotifyOptions {
  confirmText?: string;
  cancelText?: string;
}

export async function toast(options: NotifyOptions) {
  window.alert('[toast]');
}

export function alert(options: NotifyOptions) {
  window.alert(options.message);
}

export function confirm(options: NotifyConfirmOptions) {
  window.confirm(options.message);
}

export function useNotify() {
  return { toast, alert, confirm };
}
