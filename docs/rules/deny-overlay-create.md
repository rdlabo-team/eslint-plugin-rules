# @rdlabo/rules/deny-overlay-create

> Disallow `.create()` on ModalController / PopoverController; open overlays via launchers instead.

In Ionic apps, modals and popovers should be opened through a shared helper (`presentModal`) and an exported `launch*` function — not by calling `ModalController.create()` / `PopoverController.create()` directly.

Use together with:

- `@rdlabo/rules/deny-element` — bans inline `<ion-modal>` / `<ion-popover>` in templates
- `@rdlabo/rules/prefer-modal-launcher` — requires `presentModal` to live inside `launch*`

`LoadingController`, `AlertController`, `ToastController`, and `ActionSheetController` stay allowed by default. `dismiss()` on `ModalController` is also allowed.

## Rule Details

❌ Incorrect: create a modal / popover via the controller

```ts
import { inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';

export class ExamplePage {
  readonly #modalCtrl = inject(ModalController);

  async open() {
    await this.#modalCtrl.create({ component: OtherPage }); // error
  }
}
```

The same applies to:

- `this.modalCtrl.create(...)`
- `inject(ModalController).create(...)`
- parameters typed as `ModalController` / `PopoverController`

✅ Correct: open via launcher; keep `ModalController` only for dismiss

```ts
export const launchOtherPage = (helper: HelperService, props: OtherProps) => {
  return helper.presentModal(OtherPage, props, { watchKeyboard: false });
};

export class ExamplePage {
  readonly #modalCtrl = inject(ModalController);
  readonly helper = inject(HelperService);

  async open() {
    await launchOtherPage(this.helper, {});
  }

  dismiss() {
    this.#modalCtrl.dismiss();
  }
}
```

✅ Correct: Loading / Alert / Toast / ActionSheet create

```ts
readonly #loadingCtrl = inject(LoadingController);
await this.#loadingCtrl.create({ message: '...' });
```

## Options

```ts
{
  // Controllers whose `.create()` is denied.
  // default: ['ModalController', 'PopoverController']
  deny?: string[];
}
```

```js
'@rdlabo/rules/deny-overlay-create': [
  'error',
  { deny: ['ModalController', 'PopoverController'] },
],
```

To also ban alert creation:

```js
{
  deny: ['ModalController', 'PopoverController', 'AlertController'];
}
```

## Implementation

- [Rule source](../../src/rules/deny-overlay-create.ts)
- [Test source](../../tests/rules/deny-overlay-create.ts)
