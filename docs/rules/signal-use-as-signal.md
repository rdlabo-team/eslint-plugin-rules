# @rdlabo/rules/signal-use-as-signal

> This plugin ensures that Signals are used correctly in your code.
>
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

This rule prevents Signals from being used incorrectly as regular properties.

## Rule Details

❌ Incorrect: Using a Signal as a regular property

```ts
@Component()
export class SigninPage {
  readonly #id = signal<number>(undefined);

  useMethod() {
    if (this.#id) {
      // error
      this.#id() = 1; // error
    }
  }
}
```

✅ Correct: Using a Signal properly

```ts
@Component()
export class SigninPage {
  readonly #id = signal<number>(undefined);

  useMethod() {
    if (this.#id()) {
      this.#id.set(1); // error
    }
  }
}
```

## Options

No Options.

## Unsupport Pattern

This rule does not support nested Signals patterns. For example:

```ts
@Component({...})
export class TestComponent {
  nestedSignal = signal({
    child: signal<number>(0)
  });

  ngOnInit() {
    if (this.nestedSignal().child) {  // Incorrect: missing function call
      ...
    }
  }
}
```

The rule cannot detect when nested signals are not properly accessed with function calls.

## Implementation

- [Rule source](../../src/rules/signal-use-as-signal.ts)
- [Test source](../../tests/rules/signal-use-as-signal.ts)
