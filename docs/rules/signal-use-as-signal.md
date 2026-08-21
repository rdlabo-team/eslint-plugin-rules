# @rdlabo/rules/signal-use-as-signal

> This plugin check to valid signal use as signal.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Angular Signals are getter functions. Reading them requires `()`, and writing them must go through `.set()` or `.update()`. This rule catches code that uses a Signal variable as if it were a plain value, and it can auto-fix many common mistakes.

## Rule Details

The rule tracks class properties initialized with Signal factories (`signal`, `model`, `input`, `linkedSignal`, `toSignal`, `asReadonly`) and reports misuse such as:

- `this.count` instead of `this.count()` in an expression context
- `this.count() = value` instead of `this.count.set(value)`
- `this.user().name = 'Jane'` instead of `this.user.update(user => ({ ...user, name: 'Jane' }))`
- `this.items().push(x)` instead of `this.items.update(items => { items.push(x); return items; })`
- `this.#user = value` (direct assignment to a Signal property) instead of `this.#user.set(value)`

The rule distinguishes between contexts where a Signal reference is expected and contexts where its value is expected. For example, passing a Signal object as a prop is allowed:

```ts
const props = { food: this.food };
launchModal({ food: this.food });
```

## Examples

### Incorrect

```ts
export class SigninPage {
  readonly #id = signal<number | undefined>(undefined);

  constructor() {
    this.#id = 1;
  }

  useMethod() {
    if (this.#id) {
      this.#id().hoge = 1;
    }
  }
}
```

```ts
export class SigninPage {
  readonly #user = signal<{ name: string }>({ name: 'John' });

  updateUser() {
    this.#user().name = 'Jane';
  }
}
```

```ts
export class SigninPage {
  readonly #numbers = signal<number[]>([1, 2, 3]);

  updateNumbers() {
    this.#numbers().push(4);
  }
}
```

```ts
export class SigninPage {
  readonly #value = signal<number>(0);

  updateValue() {
    this.#value() = 42;
  }
}
```

### Correct

```ts
export class SigninPage {
  readonly #user = signal<{ name: string }>({ name: 'John' });

  updateUser() {
    this.#user.update((user) => ({ ...user, name: 'Jane' }));
  }
}
```

```ts
export class SigninPage {
  readonly #numbers = signal<number[]>([1, 2, 3]);

  updateNumbers() {
    this.#numbers.update((numbers) => {
      numbers.push(4);
      return numbers;
    });
  }
}
```

```ts
export class SigninPage {
  readonly #value = signal<number>(0);

  updateValue() {
    this.#value.set(42);
  }
}
```

```ts
export class SigninPage {
  readonly food = signal<number>(0);

  openPreview() {
    const props = { food: this.food };
    launchModal({ food: this.food });
  }
}
```

## Auto-fix

The rule provides auto-fix for the patterns above:

- `this.count = value` -> `this.count.set(value)`
- `this.count() = value` -> `this.count.set(value)`
- `this.count().x = value` -> `this.count.update(value => ({ ...value, x: value }))`
- `this.count().push(x)` -> `this.count.update(value => { value.push(x); return value; })`

## Options

This rule has no options.

## When to enable

Enable this rule in any Angular project that uses Signals. It is complementary to [`@rdlabo/rules/signal-use-as-signal-template`](./signal-use-as-signal-template.md), which checks Signal usage in templates.

## See also

- [`@rdlabo/rules/signal-use-as-signal-template`](./signal-use-as-signal-template.md)
- [`@rdlabo/rules/no-component-writable-signal`](./no-component-writable-signal.md)

## Implementation

- [Rule source](../../src/rules/signal-use-as-signal.ts)
- [Test source](../../tests/rules/signal-use-as-signal.ts)
