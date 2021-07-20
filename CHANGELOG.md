**v2.0.0**

- Changed `changeObject` function: changes and returns *original* object (since v1.0.0 changes and returns *copy*).
- Edited the `changeObject` (both overloads) and the `Freezable.with` (both overloads) documentation.
- Fixed a bug: when changing object's prototype has a property with the same key as the object, each property shall be changed (expected: only object's property shall be changed).
- Edited the `changeObject` description in the read-me file.

**v1.3.0**

- Removed `TKeys` generics from the `changeObject` function (both overloads) and the `IFreezable.with` method (both overloads).

**v1.2.0**

- Fixed the `Injection.injectUtilities` description in the read-me file.
- Added type checks.

**v1.1.4**

- Fixed the example in the read-me file.
- Added the "Utilities" and "Object spreading vs `copyObject`" blocks to the read-me file.
- Fixed the documentation of the `IFreezable.copy`, `IFreezable.clone`, `IFreezable.with` (both overloads), `copyObject`, `cloneObject`, `changeObject` (both overloads).

**v1.1.3**

- Fixed the `Injection.injectFreezable` function description in the documentation and in the read-me file.
- Fixed the `Freezable` class documentation.
- Documented everything (since v1.1.2 `Injection.injectFreezable`, `Injection.injectUtilities`, `Freezable`).

**v1.1.2**

- Documented `Injection.injectFreezable`, `Injection.injectUtilities`, `Freezable`
- Fixed the content of the read-me file.
- Added an `Injection` section to the read-me file.

**v1.1.1**

- Fixed the content of the read-me file.

**v1.1.0**

- The `copyObject` and `cloneObject` functions set the `writable` and `configurable` properties of all property descriptors of copies/clones to `true` (since v1.0.0 set to the original value)

**v1.0.0**

Initial version.