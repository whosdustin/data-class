export type key_type = string | number | symbol;
export interface AnyFunction<T = any, R = unknown> {
  (...args: T[]): R;
}
