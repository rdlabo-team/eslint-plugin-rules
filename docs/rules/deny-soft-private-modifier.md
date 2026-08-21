# @rdlabo/rules/deny-soft-private-modifier

> This plugin disallows the use of soft private modifier.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

TypeScript's `private` modifier is only enforced at compile time. It can still be accessed at runtime through bracket notation or by casting to `any`. JavaScript hard-private fields (`#`) are runtime-enforced and cannot be bypassed from outside the class. This rule replaces `private` properties and methods with `#` fields and updates `this.x` references to `this.#x`.

## Rule Details

This rule checks classes for the following patterns:

- A `private` property definition (`private field = ...`)
- A `private` method definition (`private method() { ... }`)
- A `this.field` reference where `field` was declared as `private`

It does **not** report constructors, because `private constructor()` has a different meaning (preventing external instantiation). A `private readonly` property is reported; the fix removes `private`, adds `#`, and preserves `readonly`.

The rule auto-fixes by:

1. Removing the `private` keyword.
2. Inserting `#` before the property or method name.
3. Updating all `this.field` or `this.method()` references in the class to `this.#field` or `this.#method()`.

## Examples

### Incorrect

```ts
class TokenStore {
  private token = '';

  private refresh() {
    this.token = 'new-token';
  }
}
```

### Correct

```ts
class TokenStore {
  #token = '';

  #refresh() {
    this.#token = 'new-token';
  }
}
```

## Options

This rule has no options.

## When to enable

Enable this rule when a project wants runtime-enforced encapsulation for class internals. It is safe to run with `--fix` on existing code, but it changes public API surface: any code that was relying on compile-time `private` access at runtime will break.

## See also

- [`@rdlabo/rules/restrict-try-block`](./restrict-try-block.md)

## Implementation

- [Rule source](../../src/rules/deny-soft-private-modifier.ts)
- [Test source](../../tests/rules/deny-soft-private-modifier.ts)
