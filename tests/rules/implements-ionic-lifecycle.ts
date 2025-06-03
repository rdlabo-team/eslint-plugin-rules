import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/implements-ionic-lifecycle';

new RuleTester().run('implements-ionic-lifecycle', rule, {
  valid: [
    {
      code: `
      @Component({
        selector: 'app-scanner',
        standalone: true,
      })
      export class ScannerPage implements OnInit, ViewWillEnter, ViewWillLeave {
        public vm = new ViewModel();
      
        constructor() {}
        ngOnInit() {}
        ionViewWillEnter() {}
        ionViewWillLeave() {}
      }
      
      class ViewModel extends StoreModel {
        public threadId: string;
        public inventoryItems: IThread[] = [];
        public dummyInventoryItems: IThread[] = dummyInventoryItems();
      
        public segmentSelected = signal<'reader' | 'inventory'>('reader');
      
        private readonly navCtrl = inject(NavController);
        public readonly platform = inject(Platform);
        public readonly helper = inject(HelperService);
        private readonly alertCtrl = inject(AlertController);
        private readonly threadService = inject(ThreadService);
        public readonly barcodeScannerModel = new BarcodeScannerModel();
      
      }
      
      export class BarcodeScannerModel {
        public readonly isSupported = signal<boolean>(false);
        public readonly isLaunch = signal<boolean>(false);
        private getSquareElement: () => ElementRef<HTMLDivElement> | undefined;
        private readonly helper = inject(HelperService);
        private readonly platform = inject(Platform);
      }
      `,
    },
    {
      code: `
        export { keypadOutline } from 'ionicons/icons';
      `,
    },
    {
      code: `
        @Component({
          selector: 'app-scanner',
          standalone: true,
        })
        export class ExamplePage {
        }
      `,
    },
    {
      code: `
        @Component({
          selector: 'app-scanner',
          standalone: true,
        })
        export class ExamplePage implements ViewWillEnter, ViewWillLeave {
          ionViewWillEnter() {}
          ionViewWillLeave() {}
        }
      `,
    },
    {
      code: `
        @Component({
          selector: 'app-scanner',
          standalone: true,
        })
        export class ExamplePage implements ViewDidEnter, ViewDidLeave {
          ionViewDidEnter() {}
          ionViewDidLeave() {}
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        @Component({
          selector: 'app-scanner',
          standalone: true,
        })
        export class ExamplePage {
          ionViewWillEnter() {}
          ionViewWillLeave() {}
        }
      `,
      output: `
        @Component({
          selector: 'app-scanner',
          standalone: true,
        })
        export class ExamplePage implements ViewWillEnter, ViewWillLeave {
          ionViewWillEnter() {}
          ionViewWillLeave() {}
        }
      `,
      errors: [
        { messageId: 'implementsIonicLifecycle', line: 7 },
        { messageId: 'implementsIonicLifecycle', line: 8 },
      ],
    },
    {
      code: `
        @Component({
          selector: 'app-scanner',
          standalone: true,
        })
        export class ExamplePage implements ViewDidEnter, ViewDidLeave {
          ionViewWillEnter() {}
          ionViewWillLeave() {}
        }
      `,
      output: `
        @Component({
          selector: 'app-scanner',
          standalone: true,
        })
        export class ExamplePage implements ViewWillEnter, ViewWillLeave {
          ionViewWillEnter() {}
          ionViewWillLeave() {}
        }
      `,
      errors: [
        { messageId: 'implementsIonicLifecycle', line: 7 },
        { messageId: 'implementsIonicLifecycle', line: 8 },
      ],
    },
    {
      code: `
        @Component({selector: 'a', standalone: true})
        export class A {
          ionViewDidEnter() {}
          ionViewWillEnter() {}
          ionViewDidLeave() {}
          ionViewWillLeave() {}
        }
      `,
      output: `
        @Component({selector: 'a', standalone: true})
        export class A implements ViewDidEnter, ViewWillEnter, ViewDidLeave, ViewWillLeave {
          ionViewDidEnter() {}
          ionViewWillEnter() {}
          ionViewDidLeave() {}
          ionViewWillLeave() {}
        }
      `,
      errors: [
        { messageId: 'implementsIonicLifecycle', line: 4 },
        { messageId: 'implementsIonicLifecycle', line: 5 },
        { messageId: 'implementsIonicLifecycle', line: 6 },
        { messageId: 'implementsIonicLifecycle', line: 7 },
      ],
    },
    {
      code: `
        @Component({selector: 'a', standalone: true})
        export class A implements ViewWillEnter, ViewWillLeave {}
      `,
      output: `
        @Component({selector: 'a', standalone: true})
        export class A  {}
      `,
      errors: [{ messageId: 'implementsIonicLifecycle', line: 3 }],
    },
    {
      code: `
        @Component({selector: 'a', standalone: true})
        export class A implements ViewWillEnter {
          ionViewWillEnter() {}
          ionViewWillLeave() {}
        }
      `,
      output: `
        @Component({selector: 'a', standalone: true})
        export class A implements ViewWillEnter, ViewWillLeave {
          ionViewWillEnter() {}
          ionViewWillLeave() {}
        }
      `,
      errors: [{ messageId: 'implementsIonicLifecycle', line: 5 }],
    },
  ],
});
