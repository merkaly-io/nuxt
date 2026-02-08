import { reactive, computed } from 'vue';
import { validate as classValidate, getMetadataStorage } from 'class-validator';
import type { ValidationError } from 'class-validator';

type FieldConstraints = { maxlength?: number; minlength?: number; required?: boolean };
type FieldAttrs = FieldConstraints & { state?: boolean | null };

const handlers: Record<string, (entry: FieldConstraints, constraints: unknown[]) => void> = {
  isLength(entry, [min, max]) {
    if ((min as number) > 0) entry.minlength = min as number;
    if (max != null) entry.maxlength = max as number;
  },
  isNotEmpty(entry) {
    entry.required = true;
  },
};

function extractConstraints<T extends object>(constructor: Function): { [K in keyof T]?: FieldConstraints } {
  const metadata = getMetadataStorage().getTargetValidationMetadatas(constructor, '', false, false);
  const constraints = {} as { [K in keyof T]?: FieldConstraints };

  for (const meta of metadata) {
    const prop = meta.propertyName as keyof T;
    if (!constraints[prop]) constraints[prop] = {};

    const handler = handlers[meta.name!];
    if (handler) handler(constraints[prop]!, meta.constraints ?? []);
  }

  return constraints;
}

function applyErrors(result: ValidationError[], errors: Record<string, string>, state: Record<string, boolean | null>) {
  for (const key of Object.keys(errors)) {
    errors[key] = '';
    state[key] = true;
  }

  for (const error of result) {
    const messages = error.constraints ? Object.values(error.constraints) : [];
    errors[error.property] = messages[0] || 'Invalid';
    state[error.property] = false;
  }
}

function mergeAttrs<T extends object>(
  constraints: { [K in keyof T]?: FieldConstraints },
  state: Record<string, boolean | null>,
): { [K in keyof T]?: FieldAttrs } {
  const result = {} as { [K in keyof T]?: FieldAttrs };
  const keys = new Set([...Object.keys(constraints), ...Object.keys(state)]);

  for (const key of keys) {
    const prop = key as keyof T;
    result[prop] = { ...constraints[prop], state: state[key] ?? null } as FieldAttrs;
  }

  return result;
}

export function useValidator<T extends object>(instance: T) {
  const form = reactive(instance) as T;
  const constraints = extractConstraints<T>(instance.constructor);
  const errors = reactive({}) as Record<keyof T, string>;
  const state = reactive({}) as Record<string, boolean | null>;
  const dirty = computed(() => Object.values(errors).some((v) => v));
  const attrs = computed(() => mergeAttrs<T>(constraints, state));

  async function validate(): Promise<boolean> {
    const plain = Object.assign(Object.create(Object.getPrototypeOf(instance)), form);
    const result: ValidationError[] = await classValidate(plain);
    applyErrors(result, errors as Record<string, string>, state);
    return result.length === 0;
  }

  return { form, attrs, dirty, errors, validate };
}
