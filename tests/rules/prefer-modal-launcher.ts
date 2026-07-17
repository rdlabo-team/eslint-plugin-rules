import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/prefer-modal-launcher';

new RuleTester().run('prefer-modal-launcher', rule, {
  valid: [
    {
      code: `
        export const launchExamplePage = (overlay: Helper, props: Props) => {
          return overlay.presentModal(ExamplePage, props, { watchKeyboard: false });
        };
      `,
    },
    {
      code: `
        export function launchExamplePage(overlay: Helper, props: Props) {
          return overlay.presentModal(ExamplePage, props);
        }
      `,
    },
    {
      code: `
        export const launchExamplePage = async (helper: Helper, props: Props) => {
          const data = await helper.presentModal(ExamplePage, props);
          return data;
        };
      `,
    },
    {
      code: `
        export const launchExamplePage = (overlay: Helper, props: Props) => {
          const run = () => overlay.presentModal(ExamplePage, props);
          return run();
        };
      `,
    },
    {
      code: `
        const helpers = {
          launchExamplePage: (overlay: Helper) => overlay.presentModal(ExamplePage, {}),
        };
      `,
    },
    {
      code: `
        export class ExamplePage {
          launchExamplePage = (overlay: Helper) => overlay.presentModal(ExamplePage, {});
        }
      `,
    },
    {
      code: `
        export class ExamplePage {
          async openOther() {
            await launchOtherPage(this.helper, {});
          }
        }
      `,
    },
    {
      code: `
        export const openSheet = (overlay: Helper) => {
          return overlay.presentModal(SheetPage, {});
        };
      `,
      options: [{ launcherNamePattern: '^(launch|open)' }],
    },
    {
      code: `
        export const launchSheet = (overlay: Helper) => {
          return overlay.presentSheet(SheetPage, {});
        };
      `,
      options: [{ presentMethodNames: ['presentSheet'] }],
    },
    {
      code: `
        export class ExamplePage {
          async open() {
            await this.helper.presentModal(OtherPage, {});
          }
        }
      `,
      options: [{ presentMethodNames: ['presentSheet'] }],
    },
  ],
  invalid: [
    {
      code: `
        export class ExamplePage {
          readonly helper = inject(HelperService);

          async open() {
            await this.helper.presentModal(OtherPage, {});
          }
        }
      `,
      errors: [{ messageId: 'preferModalLauncher', data: { method: 'presentModal', pattern: '^launch' } }],
    },
    {
      code: `
        export class ExamplePage {
          readonly launchOtherPage = this.helper.presentModal(OtherPage, {});
        }
      `,
      errors: [{ messageId: 'preferModalLauncher', data: { method: 'presentModal', pattern: '^launch' } }],
    },
    {
      code: `
        export async function openModal(overlay: Helper) {
          await overlay.presentModal(ExamplePage, {});
        }
      `,
      errors: [{ messageId: 'preferModalLauncher', data: { method: 'presentModal', pattern: '^launch' } }],
    },
    {
      code: `
        const show = () => overlay.presentModal(ExamplePage, {});
      `,
      errors: [{ messageId: 'preferModalLauncher', data: { method: 'presentModal', pattern: '^launch' } }],
    },
    {
      code: `
        export const launchExamplePage = (overlay: Helper) => {
          return overlay.presentModal(ExamplePage, {});
        };

        export class CallerPage {
          async open() {
            await this.overlay.presentModal(ExamplePage, {});
          }
        }
      `,
      errors: [{ messageId: 'preferModalLauncher', data: { method: 'presentModal', pattern: '^launch' } }],
    },
    {
      code: `
        export class ExamplePage {
          async open() {
            await presentModal(OtherPage, {});
          }
        }
      `,
      errors: [{ messageId: 'preferModalLauncher', data: { method: 'presentModal', pattern: '^launch' } }],
    },
    {
      code: `
        export class ExamplePage {
          openSheet = () => this.overlay.presentModal(SheetPage, {});
        }
      `,
      errors: [{ messageId: 'preferModalLauncher', data: { method: 'presentModal', pattern: '^launch' } }],
    },
    {
      code: `
        export const createExamplePage = (overlay: Helper) => {
          return overlay.presentModal(ExamplePage, {});
        };
      `,
      errors: [{ messageId: 'preferModalLauncher', data: { method: 'presentModal', pattern: '^launch' } }],
    },
    {
      code: `
        export class ExamplePage {
          async open() {
            await this.helper.presentModal(A, {});
            await this.helper.presentModal(B, {});
          }
        }
      `,
      errors: [
        { messageId: 'preferModalLauncher', data: { method: 'presentModal', pattern: '^launch' } },
        { messageId: 'preferModalLauncher', data: { method: 'presentModal', pattern: '^launch' } },
      ],
    },
    {
      code: `
        export const showSheet = (overlay: Helper) => overlay.presentSheet(SheetPage, {});
      `,
      options: [{ presentMethodNames: ['presentSheet'], launcherNamePattern: '^launch' }],
      errors: [{ messageId: 'preferModalLauncher', data: { method: 'presentSheet', pattern: '^launch' } }],
    },
  ],
});
