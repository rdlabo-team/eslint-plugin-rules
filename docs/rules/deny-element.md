# @rdlabo/rules/deny-element

> This plugin disallows the use of certain HTML tags.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

> This plugin disallows the use of certain HTML tags.

Inline Modal and Inline ActionSheet from Ionic6. However, since my team uses Controller uniformly, I created a rule to prevent accidental Inline.

## Rule Details

Disallow the use of elements configured in `.eslintrc.json`.

example:

```json
{
  "rules": {
    "@rdlabo/rules/deny-element": [
      "error",
      {
        "elements": ["ion-modal"]
      }
    ]
  }
}
```

```html
<ion-modal></ion-modal>
<!-- error -->
```

## Options

```ts
const options: {
  elements: string[];
};
```

## Implementation

- [Rule source](../../src/rules/deny-element.ts)
- [Test source](../../tests/rules/deny-element.ts)
