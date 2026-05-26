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

export interface NotifyApi {
  alert(options: NotifyAlertOptions): void;
  confirm(options: NotifyConfirmOptions): void;
  toast(options: NotifyOptions): unknown;
}

export function useNotify(): NotifyApi {
  const $modal = useModal();

  function toast(options: NotifyOptions): unknown {
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

  function alert(options: NotifyAlertOptions): void {

    const instance = $modal.create({
      body: options.message,
      centered: true,
      okOnly: true,
      okTitle: options.okText || 'OK',
      title: options.title || 'Alert',
    });

    instance.show();
  }

  function confirm(options: NotifyConfirmOptions): void {
    const instance = $modal.create({
      body: options.message,
      cancelTitle: options.cancelText || 'Cancel',
      cancelVariant: 'secondary',
      okTitle: options.confirmText || 'OK',
      okVariant: options.variant || 'primary',
      onOk: options.onConfirm,
      title: options.title || 'Confirm',
    });

    instance.show();
  }

  return { toast, alert, confirm };
}
