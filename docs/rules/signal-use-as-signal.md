# @rdlabo/rules/signal-use-as-signal

> This plugin check to valid signal use as signal.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.
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

✅ Correct: Passing a Signal reference as props

Signal を値として読むのではなく、Signal 自体を渡す場合は `()` は不要です。

```ts
@Component()
export class SigninPage {
  readonly food = signal<number>(0);

  openPreview() {
    // componentProps / modal launcher などへ参照渡し
    launchModal({ food: this.food });
    const food = this.food;
    return this.food;
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
