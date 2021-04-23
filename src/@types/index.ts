export type KeyType = string | number | symbol;
export interface AnyFunction<T = any, R = unknown> {
  (...args: T[]): R;
}

export type RecordOf<T> = Pick<T, keyof T>;
