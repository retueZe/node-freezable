**Example**

```javascript
import Freezable from './freezable';
```
```javascript
class Box extends Freezable {
    value

    constructor(value) {
        this.value = value;
    }

    compare(other) {
        console.log(`Frozen: ${this.frozen === other.frozen}`);
        console.log(`Reference: ${this === other}`);
        console.log(`Value: ${this.value === other.value}`);
        console.log(`Num: ${this.value.num === other.value.num}`);
    }
}

const box = new Box({num: 432}).freeze(); // in the `Freezable` implementation executes `Object.freeze`
console.log(box.frozen); // true // in the `Freezable` implementation executes `Object.isFrozen`
const copy = box.copy();
box.compare(copy);
/* Output:
 * Frozen: false
 * Reference: false
 * Value: true
 * Num: true
 */
const clone = box.clone();
box.compare(clone);
/* Output:
 * Frozen: false
 * Reference: false
 * Value: false
 * Num: true
 */

const changed = box
    .with({
        value: {num: 54}
    }) // value === {num: 54}
    .with(original => ({
        value: original.value.num
    })) // value === 54
    .with(original => ({
        value: (original.value - 4) / 5
    })) // value === 10
    .freeze();
console.log(changed.frozen); // true
console.log(changed.value); // 10
```

**Utilities**

This package provides 3 utility functions: `copyObject`, `cloneObject`, and `changeObject` (2 overloads), which are used by the `Freezable` implementation:

- `copyObject(original)` — returns an unfrozen and unsealed copy of the `original` object
- `cloneObject(original)` — returns an unfrozen and unsealed clone of the `original` object
- `changeObject(original, selection)` — returns a copy of the `original` object (using the `copyObject` function) and sets the copied properties to passed in the `selection`
- `changeObject(original, selector)` — same as first overload, but the selection can depend on the `original` object through the `selector` callback

**Object spreading vs `copyObject`**

The `copyObject` function like the object spread operator (or an `Object.assign` call) copies an object. But theese copy methods are different.

Question | `copyObject` | Object Spreading
---|:-:|:-:
Does it unfreeze? | Does | Does
Does it unseal? | Does | Does
Does it copy unenumerable properties? | Does | Doesn't
Does it copy original's prototype? | Does | Doesn't
How does it copy properties defined with a getter/setter? | Copies the getters/setters | Defines a new property whose value is a result of getter's call

As you can see, `copyObject` function is better when we need to copy an instance of a class with its prototype and properties defined with a getter/setter. At the same time, object spreading is better when we need to accumulate original's own properties, like take a snapshot. Because `Freezable` and its dependents are classes, they and the `cloneObject` and `changeObject` functions use `copyObject` rather than object spreading.

**Injection**

- `Injection.injectFreezable(target)` — injects the default `IFreezable` implementation to the `target`
- `Injection.injectUtilities()` — injects the `copyObject`, `cloneObject`, and `changeObject` functions to the `Object` class