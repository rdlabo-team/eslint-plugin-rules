import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/signal-use-as-signal-template';
import * as path from 'path';

const componentClass = () => `
  export class TestComponent {
    count = signal<number>(0);
    message = signal<string>('');
    user = signal<{ name: string } | null>(null);
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);
    items = signal<Array<{ id: number; name: string }>>([]);
    status = signal<'active' | 'inactive' | 'unknown'>('unknown');
    isAuthenticated = signal<boolean>(false);
    notifications = signal<Array<{ id: number; isRead: () => boolean; message: () => string }>>([]);
    isAdmin = signal<boolean>(false);
    hasPermission = signal<boolean>(false);
    fullName = signal<string>('');
    totalPrice = signal<number>(0);
    data = signal<{ title: string } | null>(null);
    isPremium = signal<boolean>(false);
    subscription = signal<{ isActive: () => boolean } | null>(null);
    isTrial = signal<boolean>(false);
    trialExpired = signal<boolean>(false);
    categories = signal<Array<{
      id: number;
      name: () => string;
      products: () => Array<{
        id: number;
        name: () => string;
        price: number;
        isAvailable: () => boolean;
      }>;
    }>>([]);
  }
`;

new RuleTester().run('signal-use-as-signal-template', rule, {
  valid: [
    {
      code:
        `
        @Component({
          templateUrl: './templates/signal-use-as-signal/control-flow-valid.html'
        })
      ` + componentClass(),
      filename: path.join(__dirname, 'test.component.ts'),
    },
  ],
  invalid: [
    {
      code:
        `
        @Component({
          templateUrl: './templates/signal-use-as-signal/control-flow-invalid.html'
        })
      ` + componentClass(),
      filename: path.join(__dirname, 'test.component.ts'),
      errors: [
        {
          messageId: 'signalUseAsSignalTemplate',
        },
        {
          messageId: 'signalUseAsSignalTemplate',
        },
        {
          messageId: 'signalUseAsSignalTemplate',
        },
        {
          messageId: 'signalUseAsSignalTemplate',
        },
        {
          messageId: 'signalUseAsSignalTemplate',
        },
        {
          messageId: 'signalUseAsSignalTemplate',
        },
        {
          messageId: 'signalUseAsSignalTemplate',
        },
        {
          messageId: 'signalUseAsSignalTemplate',
        },
        {
          messageId: 'signalUseAsSignalTemplate',
        },
        {
          messageId: 'signalUseAsSignalTemplate',
        },
        {
          messageId: 'signalUseAsSignalTemplate',
        },
        {
          messageId: 'signalUseAsSignalTemplate',
        },
        {
          messageId: 'signalUseAsSignalTemplate',
        },
        {
          messageId: 'signalUseAsSignalTemplate',
        },
      ],
    },
  ],
});
