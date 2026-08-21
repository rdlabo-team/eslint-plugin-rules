# @rdlabo/rules/prefer-modal-launcher

> Require `presentModal` calls to live inside a `launch*` launcher function.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

Modals and sheets should be presented through a dedicated launcher function exported from the target page. This keeps call sites decoupled from modal construction details and makes the modal API consistent across the application. This rule ensures that `presentModal` (or other configured present methods) are only called inside functions whose name matches a launcher pattern.

## Rule Details

The rule checks `CallExpression` nodes for calls such as `presentModal`, `helper.presentModal(...)`, or `overlay.presentSheet(...)`. If the call is not inside a launcher function, it is reported.

A launcher function is one whose name matches the configured regular expression (default `^launch`). The rule looks at:

- `function launchXxx(...)`
- `const launchXxx = (...)`
- `class Foo { launchXxx = (...) }`
- `class Foo { launchXxx() {} }`
  Nested functions are also considered; for example, a `run` arrow inside `launchExamplePage` is allowed.

## Options

```json
{
  "rules": {
    "@rdlabo/rules/prefer-modal-launcher": [
      "error",
      {
        "presentMethodNames": ["presentModal"],
        "launcherNamePattern": "^launch"
      }
    ]
  }
}
```

### `presentMethodNames`

- Type: `string[]`
- Default: `["presentModal"]`

The present method names to restrict.

### `launcherNamePattern`

- Type: `string`
- Default: `"^launch"`

A regular expression string. Present method calls must be inside a function whose name matches this pattern.

## Examples

### Incorrect

```ts
export class ExamplePage {
  readonly helper = inject(HelperService);

  async open() {
    await this.helper.presentModal(OtherPage, {}); // not in a launcher
  }
}
```

```ts
export class ExamplePage {
  readonly launchOtherPage = this.helper.presentModal(OtherPage, {}); // not a function
}
```

```ts
export async function openModal(overlay: Helper) {
  await overlay.presentModal(ExamplePage, {}); // name does not match ^launch
}
```

### Correct

```ts
export const launchExamplePage = (overlay: Helper, props: Props) => {
  return overlay.presentModal(ExamplePage, props);
};
```

```ts
export function launchExamplePage(overlay: Helper, props: Props) {
  return overlay.presentModal(ExamplePage, props);
}
```

```ts
export const launchExamplePage = (overlay: Helper, props: Props) => {
  const run = () => overlay.presentModal(ExamplePage, props);
  return run();
};
```

### Custom configuration

```ts
export const openSheet = (overlay: Helper) => {
  return overlay.presentSheet(SheetPage, {});
};
```

```json
{
  "rules": {
    "@rdlabo/rules/prefer-modal-launcher": [
      "error",
      {
        "presentMethodNames": ["presentSheet"],
        "launcherNamePattern": "^(launch|open)"
      }
    ]
  }
}
```

## When to enable

Enable this rule in Ionic/Angular projects that use a launcher pattern for modals, sheets, and other overlays. It pairs with [`@rdlabo/rules/deny-element`](./deny-element.md) and [`@rdlabo/rules/prefer-disable-handler`](./prefer-disable-handler.md).

## See also

- [`@rdlabo/rules/deny-element`](./deny-element.md)
- [`@rdlabo/rules/prefer-disable-handler`](./prefer-disable-handler.md)

## Implementation

- [Rule source](../../src/rules/prefer-modal-launcher.ts)
- [Test source](../../tests/rules/prefer-modal-launcher.ts)
