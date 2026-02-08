import { reactive, computed } from 'vue';
import { validate, getMetadataStorage } from 'class-validator';
import type { ValidationError } from 'class-validator';

type Constraints = Record<string, { maxlength?: number; minlength?: number; required?: boolean }>;
type Errors = Record<string, string | null>;

export function useValidator<T extends object>(form: T) {
  const metadata = getMetadataStorage().getTargetValidationMetadatas(
    form.constructor,
    '',
    false,
    false,
  );

  const constraints = {} as Constraints;

  for (const meta of metadata) {
    const prop = meta.propertyName;
    if (!constraints[prop]) constraints[prop] = {};

    if (meta.name === 'isLength') {
      const [min, max] = meta.constraints as [number, number];
      if (min > 0) constraints[prop].minlength = min;
      if (max != null) constraints[prop].maxlength = max;
    }

    if (meta.name === 'isNotEmpty') {
      constraints[prop].required = true;
    }
  }

  const errors = reactive<Errors>({});

  const pending = computed(() => {
    return Object.values(errors).some((v) => v !== null);
  });

  async function check(): Promise<boolean> {
    const result: ValidationError[] = await validate(Object.assign(Object.create(Object.getPrototypeOf(form)), form));

    for (const key of Object.keys(errors)) {
      errors[key] = null;
    }

    for (const error of result) {
      const messages = error.constraints ? Object.values(error.constraints) : [];
      errors[error.property] = messages[0] || 'Invalid';
    }

    return result.length === 0;
  }

  function state(prop: string): boolean | null {
    if (!(prop in errors)) return null;
    return errors[prop] === null;
  }

  return { constraints, errors, pending, check, state };
}
