import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/deny-overlay-create';

new RuleTester().run('deny-overlay-create', rule, {
  valid: [
    {
      code: `
        import { inject } from '@angular/core';
        import { LoadingController, AlertController, ModalController, ToastController, ActionSheetController } from '@ionic/angular/standalone';

        export class ExamplePage {
          readonly #loadingCtrl = inject(LoadingController);
          readonly #alertCtrl = inject(AlertController);
          readonly #toastCtrl = inject(ToastController);
          readonly #actionSheetCtrl = inject(ActionSheetController);
          readonly #modalCtrl = inject(ModalController);

          async showLoading() {
            await this.#loadingCtrl.create({ message: '...' });
          }

          async showAlert() {
            await this.#alertCtrl.create({ header: 'Hi' });
          }

          async showToast() {
            await this.#toastCtrl.create({ message: 'ok' });
          }

          async showActionSheet() {
            await this.#actionSheetCtrl.create({ header: 'Actions' });
          }

          dismiss(data?: unknown) {
            this.#modalCtrl.dismiss(data);
          }
        }
      `,
    },
    {
      code: `
        import { inject } from '@angular/core';
        import { ToastController } from '@ionic/angular/standalone';

        export class ExamplePage {
          readonly toastCtrl = inject(ToastController);
          async show() {
            await this.toastCtrl.create({ message: 'ok' });
          }
        }
      `,
    },
    {
      code: `
        export const launchExamplePage = (overlay: { presentModal: Function }) => {
          return overlay.presentModal(ExamplePage, {});
        };
      `,
    },
    {
      code: `
        class Factory {
          create() {
            return {};
          }
        }

        const factory = new Factory();
        factory.create();
      `,
    },
    {
      code: `
        function receivesController(modalCtrl: ModalController) {}

        function usesFactory(modalCtrl: Factory) {
          modalCtrl.create();
        }
      `,
    },
    {
      code: `
        class ControllerOwner {
          readonly modalCtrl = inject(ModalController);
        }

        class FactoryOwner {
          readonly modalCtrl = new Factory();

          create() {
            this.modalCtrl.create();
          }
        }
      `,
    },
    {
      code: `
        const modalCtrl = inject(ModalController);

        {
          const modalCtrl = new Factory();
          modalCtrl.create();
        }
      `,
    },
    {
      code: `
        import { inject } from '@angular/core';
        import { ModalController } from '@ionic/angular/standalone';

        export class ExamplePage {
          readonly modalCtrl = inject(ModalController);
          async open() {
            await this.modalCtrl.create({ component: OtherPage });
          }
        }
      `,
      options: [{ deny: [] }],
    },
    {
      code: `
        import { inject } from '@angular/core';
        import { ModalController, PopoverController } from '@ionic/angular/standalone';

        export class ExamplePage {
          readonly modalCtrl = inject(ModalController);
          readonly popoverCtrl = inject(PopoverController);

          async openModal() {
            await this.modalCtrl.create({ component: OtherPage });
          }

          async openPopover() {
            await this.popoverCtrl.create({ component: MenuPage });
          }
        }
      `,
      options: [{ deny: ['ActionSheetController'] }],
    },
  ],
  invalid: [
    {
      code: `
        import { inject } from '@angular/core';
        import { ModalController } from '@ionic/angular/standalone';

        export class ExamplePage {
          readonly #modalCtrl = inject(ModalController);

          async open() {
            await this.#modalCtrl.create({ component: OtherPage });
          }
        }
      `,
      errors: [{ messageId: 'denyOverlayCreate', data: { controller: 'ModalController' } }],
    },
    {
      code: `
        import { inject } from '@angular/core';
        import { ModalController } from '@ionic/angular/standalone';

        export class ExamplePage {
          readonly modalCtrl = inject(ModalController);

          async open() {
            await this.modalCtrl.create({ component: OtherPage });
          }
        }
      `,
      errors: [{ messageId: 'denyOverlayCreate', data: { controller: 'ModalController' } }],
    },
    {
      code: `
        import { inject } from '@angular/core';
        import { PopoverController } from '@ionic/angular/standalone';

        export class ExamplePage {
          readonly popoverCtrl = inject(PopoverController);

          async open() {
            await this.popoverCtrl.create({ component: MenuPage });
          }
        }
      `,
      errors: [{ messageId: 'denyOverlayCreate', data: { controller: 'PopoverController' } }],
    },
    {
      code: `
        import { inject } from '@angular/core';
        import { ModalController } from '@ionic/angular/standalone';

        export class ExamplePage {
          async open() {
            await inject(ModalController).create({ component: OtherPage });
          }
        }
      `,
      errors: [{ messageId: 'denyOverlayCreate', data: { controller: 'ModalController' } }],
    },
    {
      code: `
        import { ModalController } from '@ionic/angular/standalone';

        export async function open(modalCtrl: ModalController) {
          await modalCtrl.create({ component: OtherPage });
        }
      `,
      errors: [{ messageId: 'denyOverlayCreate', data: { controller: 'ModalController' } }],
    },
    {
      code: `
        function first(modalCtrl: ModalController) {
          modalCtrl.create({ component: FirstPage });
        }

        function second(modalCtrl: PopoverController) {
          modalCtrl.create({ component: SecondPage });
        }
      `,
      errors: [
        { messageId: 'denyOverlayCreate', data: { controller: 'ModalController' } },
        { messageId: 'denyOverlayCreate', data: { controller: 'PopoverController' } },
      ],
    },
    {
      code: `
        import { ModalController } from '@ionic/angular/standalone';

        const open = async (modalCtrl: ModalController) => {
          await modalCtrl.create({ component: OtherPage });
        };
      `,
      errors: [{ messageId: 'denyOverlayCreate', data: { controller: 'ModalController' } }],
    },
    {
      code: `
        import { inject } from '@angular/core';
        import { ModalController } from '@ionic/angular/standalone';

        const modalCtrl = inject(ModalController);
        await modalCtrl.create({ component: OtherPage });
      `,
      errors: [{ messageId: 'denyOverlayCreate', data: { controller: 'ModalController' } }],
    },
    {
      code: `
        import { ModalController } from '@ionic/angular/standalone';

        export class ExamplePage {
          constructor(private modalCtrl: ModalController) {}

          async open() {
            await this.modalCtrl.create({ component: OtherPage });
          }
        }
      `,
      errors: [{ messageId: 'denyOverlayCreate', data: { controller: 'ModalController' } }],
    },
    {
      code: `
        import { ModalController } from '@ionic/angular/standalone';

        export class ExamplePage {
          modalCtrl: ModalController;

          async open() {
            await this.modalCtrl.create({ component: OtherPage });
          }
        }
      `,
      errors: [{ messageId: 'denyOverlayCreate', data: { controller: 'ModalController' } }],
    },
    {
      code: `
        import { inject } from '@angular/core';
        import { ModalController, PopoverController } from '@ionic/angular/standalone';

        export class ExamplePage {
          readonly modalCtrl = inject(ModalController);
          readonly popoverCtrl = inject(PopoverController);

          async openBoth() {
            await this.modalCtrl.create({ component: A });
            await this.popoverCtrl.create({ component: B });
          }
        }
      `,
      errors: [
        { messageId: 'denyOverlayCreate', data: { controller: 'ModalController' } },
        { messageId: 'denyOverlayCreate', data: { controller: 'PopoverController' } },
      ],
    },
    {
      code: `
        import { inject } from '@angular/core';
        import { AlertController } from '@ionic/angular/standalone';

        export class ExamplePage {
          readonly alertCtrl = inject(AlertController);
          async open() {
            await this.alertCtrl.create({ header: 'x' });
          }
        }
      `,
      options: [{ deny: ['AlertController'] }],
      errors: [{ messageId: 'denyOverlayCreate', data: { controller: 'AlertController' } }],
    },
  ],
});
