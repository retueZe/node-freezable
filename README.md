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
    }) // box.value === {num: 54}
    .with(original => ({
        value: original.value.num
    })) // box.value === 54
    .with(original => ({
        value: (original.value - 4) / 5
    })) // box.value === 10
    .freeze();
console.log(changed.frozen); // true
console.log(changed.value); // 10
```

**Injection**

- `Injection.injectFreezable(target)` — injects the default `IFreezable` implementation to the `target`
- `Injection.injectUtilities()` — injects `copyObject`, `cloneObject`, and `changeObject` utility functions to the `Object` class