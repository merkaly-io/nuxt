import { push } from 'notivue';
import { computed, ref } from 'vue';
import { type BvTriggerableEvent, useModal } from 'bootstrap-vue-next';

export interface NotifyOptions {
  title?: string;
  message?: string;
  variant: 'success' | 'danger' | 'warning' | 'info';
}

export interface NotifyConfirmOptions extends NotifyOptions {
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => unknown; // a promise keeps the modal open and busy; resolving false keeps it open after
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
    const busy = ref(false);

    const instance = $modal.create(computed(() => ({
      body: options.message,
      busy: busy.value, // disables both buttons
      cancelTitle: options.cancelText || 'Cancel',
      cancelVariant: 'secondary' as const,
      noCloseOnEsc: busy.value,
      okTitle: options.confirmText || 'OK',
      okVariant: options.variant || 'primary',
      onHidden: () => void instance.destroy(), // one modal per call: never pile up hidden ones
      onOk: (event: BvTriggerableEvent) => {
        const result = options.onConfirm?.();

        if (!(result instanceof Promise)) return; // sync: closes right away

        event.preventDefault();
        busy.value = true;

        result
          .then(value => value !== false && instance.hide('ok'))
          .finally(() => void (busy.value = false));
      },
      title: options.title || 'Confirm',
    })));

    instance.show();
  }

  return { toast, alert, confirm };
}
