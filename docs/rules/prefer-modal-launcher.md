# @rdlabo/rules/prefer-modal-launcher

> Require `presentModal` calls to live inside a `launch*` launcher function.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

Call sites must use `await launchXxxPage(helper, props)` instead of inlining `helper.presentModal(...)`.

Each modal page should export:

- `XxxProps` / `XxxDismiss` types
- `launchXxxPage(helper, props)` that wraps `presentModal`

Pair with `@rdlabo/rules/deny-overlay-create` and `@rdlabo/rules/deny-element`.

## Rule Details

❌ Incorrect: inline `presentModal` at the call site

```ts
export class ExamplePage {
  readonly helper = inject(HelperService);

  async open() {
    await this.helper.presentModal(OtherPage, {}); // error
  }
}
```

Also incorrect:

```ts
export async function openModal(overlay: Helper) {
  await overlay.presentModal(ExamplePage, {}); // error — name does not match /^launch/
}

const show = () => overlay.presentModal(ExamplePage, {}); // error
```

✅ Correct: `presentModal` only inside a launcher

```ts
export interface OtherProps {
  id: number;
}
export type OtherDismiss = { saved: boolean } | undefined;

export const launchOtherPage = (helper: HelperService, props: OtherProps): Promise<OtherDismiss> => {
  return helper.presentModal(OtherPage, props, { watchKeyboard: false });
};

export class ExamplePage {
  readonly helper = inject(HelperService);

  async open() {
    const data = await launchOtherPage(this.helper, { id: 1 });
    if (data?.saved) {
      // ...
    }
  }
}
```

Nested calls inside a launcher are fine:

```ts
export const launchExamplePage = (overlay: Helper, props: Props) => {
  const run = () => overlay.presentModal(ExamplePage, props);
  return run();
};
```

## Options

```ts
{
  // Method names treated as overlay presenters.
  // default: ['presentModal']
  presentMethodNames?: string[];

  // RegExp source for allowed enclosing function / method names.
  // default: '^launch'
  launcherNamePattern?: string;
}
```

```js
'@rdlabo/rules/prefer-modal-launcher': [
  'error',
  {
    presentMethodNames: ['presentModal'],
    launcherNamePattern: '^launch',
  },
],
```

If your project uses `open*` launchers:

```js
{
  launcherNamePattern: '^(launch|open)';
}
```

## Implementation

- [Rule source](../../src/rules/prefer-modal-launcher.ts)
- [Test source](../../tests/rules/prefer-modal-launcher.ts)
