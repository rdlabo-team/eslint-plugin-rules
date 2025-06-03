# @rdlabo/rules/deny-soft-private-modifier

> This plugin enforces the use of hard private fields (using #) instead of the `private` modifier.
>
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## Rule Details

❌ Incorrect: Using the `private` modifier for class fields

```ts
@Component({})
export class SigninPage {
  private platform = inject(Platform);
}
```

✅ Correct: Using the hard private field syntax (#)

```ts
@Component({})
export class SigninPage {
  #platform = inject(Platform);
}
```

## Implementation

- [Rule source](../../src/rules/deny-soft-private-modifier.ts)
- [Test source](../../tests/rules/deny-soft-private-modifier.ts)
