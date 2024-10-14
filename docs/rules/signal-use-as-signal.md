# @rdlabo/rules/signal-use-as-signal

> This plugin check to valid signal use as signal.

This rule prevents Signal from being mistakenly used as a normal property.

## Rule Details

```ts
@Component()
export class SigninPage {
  readonly #id = signal<number>(undefined);

  useMethod() {
    if (this.#id) {
      // error
      this.#id().hoge = 1; // error
    }
  }
}
```

## Options

No Options.

## Implementation

- [Rule source](../../src/rules/signal-use-as-signal.ts)
- [Test source](../../tests/rules/signal-use-as-signal.ts)
