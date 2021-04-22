import hash from './utils/hash';
import {
  key_type,
  AnyFunction,
} from './@types';

const GUARD = Symbol('DefaultRecord');
const VALUES = Symbol('CustomValues');
const DEFAULTS = Symbol('DefaultValues');
const NOOP = () => void 0;

export class DataClass<T> {
  constructor(data: Partial<T> | symbol = {}) {
    // Captures default values on initialization
    if (data === GUARD) return this;

    const _this = Object.getPrototypeOf(this);
    
    // Initialize object with default values
    if (!this._has_own_property(_this.constructor, DEFAULTS)) {
      const default_record = new _this.constructor(GUARD);
      Object.defineProperty(this.constructor, DEFAULTS, {
        value: default_record,
      });
    }

    const _default = this.constructor[DEFAULTS];

    // Initialize empty Map to add values to
    Object.defineProperty(this, VALUES, {
      value: new Map(),
    });

    for (const key in _default) {
      if (!this._has_own_property(_default, key)) continue;

      const value = this._key_exists(data, key)
        ? data[key]
        : _default[key];

      this[VALUES].set(key, value);

      Object.defineProperty(this, key, {
        enumerable: true,
        get: () => this[VALUES].get(key),
        set: NOOP,
      });
    }
  }

  public update(patch: Partial<T>): T {
    const data = Object.assign(new Object(), this['to_json'](), patch);
    const _this = Object.getPrototypeOf(this);

    return new _this.constructor(data);
  }

  public equals(comparator: T): boolean {
    const _this = this[VALUES];
    const _comparator = comparator[VALUES];
    const _defaults = this.constructor[DEFAULTS];

    for (const key in _defaults) {
      const A = _this.get(key);
      const B = _comparator.get(key);

      if (A && this._is_data_class(A, 'equals')) { 
        if (!A.equals(B)) return false;
      } else if (A && typeof A === 'function') {
        if (!this._compare_functions(A, B)) return false;
      } else if (A !== B) return false;
    }

    return true;
  }

  public to_json(): Record<string, unknown> {
    const _this: Map<key_type, unknown> = this[VALUES]; 
    const result = {};
    
    _this.forEach((value: any, key: key_type) => {
      result[key] = this._is_data_class(value, 'to_json')
        ? value['to_json']()
        : value;
    });

    return result;
  }

  private _compare_functions(
    a: AnyFunction,
    b: AnyFunction
  ): boolean {
    const a_hash = hash(a.toString());
    const b_hash = hash(b.toString());

    return a_hash === b_hash;
  }

  private _key_exists(
    record: Record<string, unknown> | symbol,
    key: key_type
  ): boolean {
    if (typeof record !== 'object') return false;
    return key in record;
  }

  private _is_data_class(
    value: any,
    property_to_check: string
  ): boolean {
    if (typeof value !== 'object') return false;
    return (
      property_to_check in value
      && typeof value[property_to_check] === 'function'
    );
  }

  private _has_own_property(
    record: Record<string, unknown>,
    property: key_type
  ): boolean {
    return Object.prototype.hasOwnProperty.call(record, property);
  }
}
