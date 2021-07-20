import { Intersection } from 'composite-types';
import { copyObject, cloneObject, changeObject } from './utilities';

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