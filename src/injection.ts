import { Union, Intersection } from 'composite-types';
import { copyObject, cloneObject, changeObject } from './freezable';

namespace Injection {
    export type InjectedFreezable<T extends {}> = Union<T, {
        readonly frozen: boolean;
        freeze(): Readonly<InjectedFreezable<T>>;
        copy(): InjectedFreezable<T>;
        clone(): InjectedFreezable<T>;
        with<TKeys extends PropertyKey>(selection: Readonly<Intersection<InjectedFreezable<T>, TKeys>>): InjectedFreezable<T>;
        with<TKeys extends PropertyKey>(selector: (original: Readonly<InjectedFreezable<T>>) => Readonly<Intersection<InjectedFreezable<T>, TKeys>>): InjectedFreezable<T>;
    }>;
    export type InjectedUtilities = Union<Object, {
        copy<T extends {}>(original: Readonly<T>): T;
        clone<T extends {}>(original: Readonly<T>): T;
        change<T extends {}, TKeys extends PropertyKey>(original: Readonly<T>, selection: Readonly<Intersection<T, TKeys>>): T;
        change<T extends {}, TKeys extends PropertyKey>(original: Readonly<T>, selector: (original: Readonly<T>) => Readonly<Intersection<T, TKeys>>): T;
    }>;

    /**
     * Injects `IFreezable` implementation to the `target`.
     */
    export function injectFreezable<T extends {}>(target: T): InjectedFreezable<T> {
        const targetAsAny: any = target;
        Object.defineProperty(targetAsAny, 'frozen', {
            get: function() {
                return Object.isFrozen(this);
            },
            enumerable: false,
            configurable: true
        });
        targetAsAny.freeze = function() { return Object.freeze(this); };
        targetAsAny.copy = function() { return copyObject(this); };
        targetAsAny.clone = function() { return cloneObject(this); };
        targetAsAny.with = function(arg: any) { return changeObject(this, arg); };

        return targetAsAny;
    }
    /**
     * Injects `copyObject`, `cloneObject`, and `changeObject` utility functions to the `Object` class.
     */
    export function injectUtilities(): InjectedUtilities {
        const targetAsAny: any = Object.prototype;
        targetAsAny.copy = copyObject;
        targetAsAny.clone = cloneObject;
        targetAsAny.change = changeObject;

        return targetAsAny;
    }
}
export default Injection;