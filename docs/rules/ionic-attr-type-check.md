# @rdlabo/rules/ionic-attr-type-check

> Require property bindings for supported non-string Ionic attributes and validate string-literal attributes.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Ionic component attributes can be boolean, number, object, or string. Passing a string such as `button="true"` to a boolean property is a common mistake and can cause unexpected behavior. This rule reads the Ionic type definitions from `@ionic/core` and reports mismatches.

## Rule Details

The rule runs on Angular templates. For each Ionic element, it looks at the `@ionic/core` type definitions and classifies each attribute as one of:

- `string` — string literals are allowed
- `string literal` — only a specific set of values is allowed
- `boolean` — use `[attr]="true"` or `[attr]="false"`
- `number` — use `[attr]="50"`
- `object` — use `[attr]="..."`
- `skip` / `unknown` — not checked

For boolean attributes, the rule recognizes the string values `true`, `false`, `1`, `0`, `yes`, `no`, `on`, and `off`; other strings are not reported by the boolean check. Supported boolean, number, and object mismatches are auto-fixed to property bindings:

- `button="true"` -> `[button]="true"`
- `value="50"` -> `[value]="50"`
- `autocorrect="off"` -> `[autocorrect]="false"` on Ionic 9

When a string value is invalid for a string-literal attribute, the rule reports the accepted values.

## Examples

### Incorrect

```html
<ion-item button="true"></ion-item>
```

```html
<ion-progress-bar value="50"></ion-progress-bar>
```

```html
<ion-modal isOpen="true" backdropDismiss="false"></ion-modal>
```

### Correct

```html
<ion-item [button]="true"></ion-item>
```

```html
<ion-progress-bar [value]="50"></ion-progress-bar>
```

```html
<ion-modal [isOpen]="true" [backdropDismiss]="false"></ion-modal>
```

```html
<!-- string-typed attributes are still allowed -->
<ion-item lines="full"></ion-item>
<ion-button color="primary">Click me</ion-button>
```

## Options

This rule has no options.

## When to enable

Enable this rule in any Ionic Angular project. It is especially useful when migrating from older Ionic syntax or when onboarding developers who are used to plain HTML attributes.

## Requirements

The rule requires `@ionic/core` to be installed in the same project so it can read `node_modules/@ionic/core/dist/types/components.d.ts`. If the package is not present, the rule returns an empty result and does not report.

## Implementation

- [Rule source](../../src/rules/ionic-attr-type-check.ts)
- [Test source](../../tests/rules/ionic-attr-type-check.ts)
