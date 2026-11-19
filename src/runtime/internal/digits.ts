export const toDigits = (value: unknown, length: number) => String(value ?? '').replace(/\D/g, '').slice(0, length); // the model of the masked inputs
