# @rdlabo/rules/deny-element

> This plugin prevents the use of specific HTML elements in your templates.

This rule is particularly useful for Ionic applications where you want to enforce the use of Controller-based modals and action sheets instead of inline components.

## Rule Details

❌ Incorrect: Using disallowed elements in templates

```html
<ion-modal></ion-modal>
<!-- error -->
```

✅ Correct: Configure the rule in `.eslintrc.json` to specify which elements to disallow

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

## Options

```ts
const options: {
  elements: string[]; // Array of element names to disallow
};
```

## Implementation

- [Rule source](../../src/rules/deny-element.ts)
- [Test source](../../tests/rules/deny-element.ts)
