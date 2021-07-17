import { Intersection } from 'composite-types';

export interface IFreezable {
    readonly frozen: boolean;

    freeze(): Readonly<this>;
    copy(): this;
    clone(): this;
    with<TKeys extends PropertyKey>(selection: Readonly<Intersection<this, TKeys>>): this;
    with<TKeys extends PropertyKey>(selector: (original: Readonly<this>) => Readonly<Intersection<this, TKeys>>): this;
}
export default class Freezable implements IFreezable {
    get frozen(): boolean {
        return Object.isFrozen(this);
    }

    freeze(): Readonly<this> {
        return Object.freeze(this);
    }
    copy(): this {
        return copyObject<this>(this);
    }
    clone(): this {
        return cloneObject<this>(this);
    }
    with<TKeys extends PropertyKey>(selection: Readonly<Intersection<this, TKeys>>): this;
    with<TKeys extends PropertyKey>(selector: (original: Readonly<this>) => Readonly<Intersection<this, TKeys>>): this;
    with(arg: any): this {
        return changeObject<this, PropertyKey>(this, arg);
    }
}
function getObjectKeys<T extends {}>(object: T): (keyof T)[] {
    return (Object.getOwnPropertyNames(object) as PropertyKey[])
        .concat(Object.getOwnPropertySymbols(object)) as (keyof T)[];
}
export function copyObject<T extends{}>(original: Readonly<T>): T {
    const copy: any = {};
    Object.setPrototypeOf(copy, Object.getPrototypeOf(original));
    getObjectKeys(original)
        .map(key => ({key: key, descriptor: Object.getOwnPropertyDescriptor(original, key)!}))
        .forEach(({key, descriptor}) => Object.defineProperty(copy, key,
            typeof descriptor.get === 'undefined' &&
            typeof descriptor.set === 'undefined'
            ? {
                value: descriptor.value,
                writable: true,
                enumerable: descriptor.enumerable,
                configurable: true
            } : {
                get: descriptor.get,
                set: descriptor.set,
                enumerable: descriptor.enumerable,
                configurable: true
            }));

    return copy;
}
export function cloneObject<T extends {}>(original: Readonly<T>): T {
    if (typeof original !== 'object' || original === null) return original;

    const clone = Object.create(Object.getPrototypeOf(original));
    const originalPropertyKeys = getObjectKeys(original);

    for (const originalPropertyKey of originalPropertyKeys) {
        const originalPropertyDescriptor = Object.getOwnPropertyDescriptor(original, originalPropertyKey)!;
        const copyPropertyDescriptor: PropertyDescriptor =
            typeof originalPropertyDescriptor.get !== 'undefined' ||
            typeof originalPropertyDescriptor.set !== 'undefined'
            ? {
                get: originalPropertyDescriptor.get,
                set: originalPropertyDescriptor.set,
                enumerable: originalPropertyDescriptor.enumerable,
                configurable: true
            } : {
                value: cloneObject((original as any)[originalPropertyKey]),
                writable: true,
                enumerable: originalPropertyDescriptor.enumerable,
                configurable: true
            };
        
        Object.defineProperty(clone, originalPropertyKey, copyPropertyDescriptor);
    }

    return clone;
}
export function changeObject<T extends {}, TKeys extends PropertyKey>(original: Readonly<T>, selection: Readonly<Intersection<T, TKeys>>): T;
export function changeObject<T extends {}, TKeys extends PropertyKey>(original: Readonly<T>, selector: (original: Readonly<T>) => Readonly<Intersection<T, TKeys>>): T;
export function changeObject<T extends {}>(original: T, arg: any): T {
    const selection = typeof arg === 'function'
        ? (arg as Function).call(undefined, original)
        : arg;
    const copy = copyObject<T>(original);
    let previous: any = null;

    for (let current: any = copy; current !== previous; previous = current, current = Object.getPrototypeOf(copy))
        getObjectKeys(current)
            .filter(key => selection.hasOwnProperty(key))
            .filter(key => {
                const descriptor = Object.getOwnPropertyDescriptor(current, key)!;

                return (descriptor.hasOwnProperty('set') &&
                    typeof descriptor.set !== 'undefined') ||
                    descriptor.writable;
            })
            .forEach(key => current[key] = selection[key]);

    return copy;
}