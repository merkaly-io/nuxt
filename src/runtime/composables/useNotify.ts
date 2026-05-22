import { push } from 'notivue';
import { useModal } from 'bootstrap-vue-next';

export interface NotifyOptions {
  title?: string;
  message?: string;
  variant: 'success' | 'danger' | 'warning' | 'info';
}

export interface NotifyConfirmOptions extends NotifyOptions {
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
}

export interface NotifyAlertOptions extends NotifyOptions {
  okText?: string;
}

export function useNotify() {
  const $modal = useModal();

  function toast(options: NotifyOptions) {
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

  function alert(options: NotifyAlertOptions) {

    const instance = $modal.create({
      body: options.message,
      centered: true,
      okOnly: true,
      okTitle: options.okText || 'OK',
      title: options.title || 'Alert',
    });

    return instance.show();
  }

  function confirm(options: NotifyConfirmOptions) {
    const instance = $modal.create({
      body: options.message,
      cancelTitle: options.cancelText || 'Cancel',
      cancelVariant: 'secondary',
      okTitle: options.confirmText || 'OK',
      okVariant: options.variant || 'primary',
      onOk: options.onConfirm,
      title: options.title || 'Confirm',
    });

    return instance.show();
  }

  return { toast, alert, confirm };
}
