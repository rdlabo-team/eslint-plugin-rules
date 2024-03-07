import { TSESLint } from '@typescript-eslint/utils';
import rule from '../../src/rules/implements-ionic-lifecycle';

new TSESLint.RuleTester().run('implements-ionic-lifecycle', rule, {
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
      parser: require.resolve('@typescript-eslint/parser'),
    },
    {
      code: `
        export { keypadOutline } from 'ionicons/icons';
      `,
      parser: require.resolve('@typescript-eslint/parser'),
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
      parser: require.resolve('@typescript-eslint/parser'),
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
      parser: require.resolve('@typescript-eslint/parser'),
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
      parser: require.resolve('@typescript-eslint/parser'),
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
      parser: require.resolve('@typescript-eslint/parser'),
      errors: [
        { messageId: 'implementsIonicLifecycle' },
        { messageId: 'implementsIonicLifecycle' },
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
      parser: require.resolve('@typescript-eslint/parser'),
      errors: [
        { messageId: 'implementsIonicLifecycle' },
        { messageId: 'implementsIonicLifecycle' },
      ],
    },
  ],
});
