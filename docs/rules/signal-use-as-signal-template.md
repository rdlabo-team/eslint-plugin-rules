# @rdlabo/rules/signal-use-as-signal-template

> Require () when accessing Angular Signals in templates
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

Angular Signals are functions. In a template, a Signal must be called with `()` to read its current value. Forgetting the parentheses is a common mistake when migrating from RxJS `BehaviorSubject` or from `model()` inputs. This rule detects Signal identifiers in Angular templates and reports bare reads such as `{{ count }}` or `[hidden]="count"`.

## Rule Details

The rule parses the Angular template of each `@Component`. It collects Signal identifiers from:

- Class properties initialized by a call whose callee name is `signal`, `model`, `computed`, `linkedSignal`, `input`, or `toSignal`.
- Nested Signal properties inside object literals (for example `count = { first: signal(0) }`).

Detection is name-based and does not resolve import provenance. Aliased factory imports are not recognized, while an unrelated local function with one of these names may be treated as a Signal factory. `toSignal` is commonly imported from `@angular/core/rxjs-interop`; the rule recognizes it by name rather than module.

It then reports any place in the template where the Signal is read without `()`. This includes:

- Interpolation `{{ count }}`
- Property bindings `[hidden]="count"`
- Event bindings `(click)="count > 0 ? ..."
- Control flow expressions `@if (count)`, `@switch (count)`, `@for (...; track count)`
- Optional chaining `count?.signal`
- Pipe usage `count | async`

The rule supports both `template` and `templateUrl` components.

## Examples

### Incorrect

```html
<div>{{ count }}</div>
```

```html
<child [hidden]="count > 0"></child>
```

```html
@if (count) {
<div>Positive</div>
}
```

```html
<ion-input [formField]="count.first"></ion-input>
```

### Correct

```html
<div>{{ count() }}</div>
```

```html
<child [hidden]="count() > 0"></child>
```

```html
@if (count()) {
<div>Positive</div>
}
```

```html
<ion-input [formField]="count.first()"></ion-input>
```

### Passing a Signal reference to a child

If a child component expects a Signal object (not its value), you can pass the reference without `()`:

```html
<child [inventorySignal]="inventorySignal"></child>
```

The rule recognizes this case and does not report a bare Signal passed as a bound attribute.

## Options

This rule has no options.

## When to enable

Enable this rule in any Angular project that uses Signals. It is especially useful during migration from `Observable`-based code or when `model()` and `input()` are introduced, because those APIs return Signal-like objects that must be called in the template.

## See also

- [`@rdlabo/rules/signal-use-as-signal`](./signal-use-as-signal.md)

## Implementation

- [Rule source](../../src/rules/signal-use-as-signal-template.ts)
- [Test source](../../tests/rules/signal-use-as-signal-template.ts)
