import { Intersection } from 'composite-types';

/**
 * The type of the freezable interface.
 */
export interface IFreezable {
    /**
     * When this object is frozen, returns true; otherwise false.
     */
    readonly frozen: boolean;

    /**
     * Freezes this object and returns it.
     */
    freeze(): Readonly<this>;
    /**
     * Returns an unfrozen and unsealed copy of this object.
     */
    copy(): this;
    /**
     * Returns an unfrozen and unsealed clone of this object. Each cloneable property shall have cloned value in the clone.
     */
    clone(): this;
    /**
     * Returns a copy of this object (using the {@link IFreezable.copy} method) and sets the copied properties to passed in the `selection`.
     */
    with(selection: Readonly<Intersection<this, PropertyKey>>): this;
    /**
     * Returns a copy of this object (using the {@link IFreezable.copy} method) and sets the copied properties to passed in a result of the `selector`.
     */
    with(selector: (original: Readonly<this>) => Readonly<Intersection<this, PropertyKey>>): this;
}
/**
 * The default {@link IFreezable} implementation.
 */
export default class Freezable implements IFreezable {
    /**
     * Calls `Object.isFrozen` for this freezable.
     */
    get frozen(): boolean {
        return Object.isFrozen(this);
    }

    /**
     * Calls `Object.freeze` for this freezable.
     */
    freeze(): Readonly<this> {
        return Object.freeze(this);
    }
    /**
     * Calls `copyObject` for this freezable.
     */
    copy(): this {
        return copyObject<this>(this);
    }
    /**
     * Calls `cloneObject` for this freezable.
     */
    clone(): this {
        return cloneObject<this>(this);
    }
    /**
     * Calls `changeObject` for this freezable.
     */
    with(selection: Readonly<Intersection<this, PropertyKey>>): this;
    /**
     * Calls `changeObject` for this freezable.
     */
    with(selector: (original: Readonly<this>) => Readonly<Intersection<this, PropertyKey>>): this;
    with(arg: any): this {
        return changeObject<this>(this, arg);
    }
}
function getObjectKeys<T extends {}>(object: T): (keyof T)[] {
    return (Object.getOwnPropertyNames(object) as PropertyKey[])
        .concat(Object.getOwnPropertySymbols(object)) as (keyof T)[];
}
/**
 * Returns an unfrozen and unsealed copy of the `original` object. All properties shall get writable and configurable after this. The copy shall set its prototype to `original`'s.
 */
export function copyObject<T>(original: Readonly<T>): T {
    if (typeof original !== 'object' || original === null) return original;

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
/**
 * Returns an unfrozen and unsealed clone of the `original` object. All properties shall get writable and configurable after this. Each cloneable property shall have cloned value in the clone. The clone shall set its prototype to `original`'s.
 */
export function cloneObject<T>(original: Readonly<T>): T {
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
/**
 * Returns a copy of the `original` object (using the {@link copyObject} function) and sets the copied properties to passed in the `selection`.
 */
export function changeObject<T>(original: Readonly<T>, selection: Readonly<Intersection<T, PropertyKey>>): T;
/**
 * Returns a copy of the `original` object (using the {@link copyObject} function) and sets the copied properties to passed in a result of the `selector`.
 */
export function changeObject<T>(original: Readonly<T>, selector: (original: Readonly<T>) => Readonly<Intersection<T, PropertyKey>>): T;
export function changeObject<T>(original: T, arg: any): T {
    if (typeof arg !== 'object' && typeof arg !== 'function')
        throw new TypeError('Selection/selector have to be an object/a function.');
    if (typeof original !== 'object' || original === null) return original;

    const selection = typeof arg === 'function'
        ? (arg as Function).call(undefined, original)
        : arg;

    if (typeof selection !== 'object')
        throw new TypeError('Selector result have to be an object.');

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