import { push } from 'notivue';

export interface NotifyOptions {
  title?: string;
  message?: string;
  variant: 'success' | 'danger' | 'warning' | 'info';
}

export interface NotifyConfirmOptions extends NotifyOptions {
  confirmText?: string;
  cancelText?: string;
}

export async function toast(options: NotifyOptions) {
  const toastByVariant = {
    success: push.success,
    danger: push.error,
    warning: push.warning,
    info: push.info,
  } satisfies Record<NotifyOptions['variant'], typeof push.success>;

  return toastByVariant[options.variant]({
    title: options.title,
    message: options.message,
  });
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
