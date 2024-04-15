# @rdlabo/rules/deny-soft-private-modifier

> This plugin disallows the use of soft private modifier.
>
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## Rule Details

Deny: Use Soft private modifier.

```ts
@Component({})
export class SigninPage {
  private platform = inject(Platform);
}
```

Allow: Use Hard private modifier.

```ts
@Component({})
export class SigninPage {
  #platform = inject(Platform);
}
```

## Implementation

- [Rule source](../../src/rules/deny-soft-private-modifier.ts)
- [Test source](../../tests/rules/deny-soft-private-modifier.ts)
