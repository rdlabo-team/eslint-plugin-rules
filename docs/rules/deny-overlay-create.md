# @rdlabo/rules/deny-overlay-create

> Disallow `.create()` on ModalController / PopoverController; open overlays via launchers instead.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

This rule prevents direct creation of Ionic overlays through controller `.create()` calls. In the rdlabo architecture, overlays should be opened through launcher functions and a shared `presentModal` / `presentPopover` helper. This keeps overlay logic centralized and the call site decoupled from the controller API.

## Rule Details

The rule detects `.create()` calls where the receiver is a `ModalController` or `PopoverController` (or other configured controllers). It resolves the controller through several patterns:

- `this.modalCtrl.create()`
- `modalCtrl.create()` (where `modalCtrl` is `inject(ModalController)`)
- `inject(ModalController).create()`
- Constructor parameter `constructor(private modalCtrl: ModalController)`
- Class property typed as `ModalController`

Other overlay controllers such as `LoadingController`, `AlertController`, `ToastController`, and `ActionSheetController` are not denied by default, because they may be intentionally used directly.

## Options

```json
{
  "rules": {
    "@rdlabo/rules/deny-overlay-create": [
      "error",
      {
        "deny": ["ModalController", "PopoverController"]
      }
    ]
  }
}
```

### `deny`

- Type: `string[]`
- Default: `["ModalController", "PopoverController"]`

Controller class names whose `.create()` calls should be disallowed. Use an empty array to disable the rule.

## Examples

### Incorrect

```ts
export class ExamplePage {
  readonly #modalCtrl = inject(ModalController);

  async open() {
    await this.#modalCtrl.create({ component: OtherPage });
  }
}
```

```ts
export async function open(modalCtrl: ModalController) {
  await modalCtrl.create({ component: OtherPage });
}
```

```ts
export class ExamplePage {
  constructor(private modalCtrl: ModalController) {}

  async open() {
    await this.modalCtrl.create({ component: OtherPage });
  }
}
```

### Correct

```ts
export const launchOtherPage = (overlay: Helper, props: Props) => {
  return overlay.presentModal(OtherPage, props);
};
```

```ts
export class ExamplePage {
  readonly #loadingCtrl = inject(LoadingController);

  async showLoading() {
    await this.#loadingCtrl.create({ message: '...' });
  }
}
```

```ts
export class ExamplePage {
  readonly #modalCtrl = inject(ModalController);

  dismiss(data?: unknown) {
    this.#modalCtrl.dismiss(data);
  }
}
```

## When to enable

Enable this rule in Ionic projects that follow the launcher pattern and use a shared overlay helper. It pairs with [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md) and [`@rdlabo/rules/deny-element`](./deny-element.md).

## See also

- [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md)
- [`@rdlabo/rules/deny-element`](./deny-element.md)

## Implementation

- [Rule source](../../src/rules/deny-overlay-create.ts)
- [Test source](../../tests/rules/deny-overlay-create.ts)
