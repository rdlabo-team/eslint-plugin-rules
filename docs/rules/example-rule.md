# @rdlabo/eslint-rules/example-rule

> An example rule.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/eslint-rules/recommended` preset.

> An example rule.
>
> - ⭐️ This rule is included in `plugin:xxxx/recommended` preset.

This is an example.

## Rule Details

This rule aimed at disallowing `example` identifiers.

Examples of **incorrect** code:

```js
/*eslint template/example-rule: error */

var example = 1;
```

Examples of **correct** code:

```js
/*eslint template/example-rule: error */

var foo = 1;
```

## Options

Nothing.

## Implementation

- [Rule source](../../src/rules/example-rule.ts)
- [Test source](../../tests/rules/example-rule.ts)
