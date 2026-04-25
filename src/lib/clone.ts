export function cloneStructured<T>(value: T): T {
  return structuredClone(value);
}
