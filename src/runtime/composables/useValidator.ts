import { reactive, computed } from 'vue';
import { validate as classValidate, getMetadataStorage } from 'class-validator';
import type { ValidationError } from 'class-validator';

type FieldConstraints = { maxlength?: number; minlength?: number; required?: boolean };

export function useValidator<T extends object>(instance: T) {
  const form = reactive(instance) as T;

  const metadata = getMetadataStorage().getTargetValidationMetadatas(
    instance.constructor,
    '',
    false,
    false,
  );

  const constraints = {} as { [K in keyof T]?: FieldConstraints };

  for (const meta of metadata) {
    const prop = meta.propertyName as keyof T;
    if (!constraints[prop]) constraints[prop] = {};

    if (meta.name === 'isLength') {
      const [min, max] = meta.constraints as [number, number];
      if (min > 0) constraints[prop]!.minlength = min;
      if (max != null) constraints[prop]!.maxlength = max;
    }

    if (meta.name === 'isNotEmpty') {
      constraints[prop]!.required = true;
    }
  }

  const errors = reactive({}) as Record<keyof T, string>;

  const state = reactive({}) as Record<string, boolean | null>;

  const pending = computed(() => Object.values(errors).some((v) => v));

  type FieldAttrs = FieldConstraints & { state?: boolean | null };

  const attrs = computed(() => {
    const result = {} as { [K in keyof T]?: FieldAttrs };
    const keys = new Set([...Object.keys(constraints), ...Object.keys(state)]);

    for (const key of keys) {
      const prop = key as keyof T;
      result[prop] = { ...constraints[prop], state: state[key] ?? null } as FieldAttrs;
    }

    return result;
  });

  async function validate(): Promise<boolean> {
    const plain = Object.assign(Object.create(Object.getPrototypeOf(instance)), form);
    const result: ValidationError[] = await classValidate(plain);

    for (const key of Object.keys(errors)) {
      (errors as Record<string, string>)[key] = '';
      state[key] = true;
    }

    for (const error of result) {
      const messages = error.constraints ? Object.values(error.constraints) : [];
      (errors as Record<string, string>)[error.property] = messages[0] || 'Invalid';
      state[error.property] = false;
    }

    return result.length === 0;
  }

  return { form, attrs, errors, pending, validate };
}
