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
          message:
            'Angular Signal count must be called with () to access its value in the templateUrl: 1:5 error. Example: count() instead of count',
          line: 1,
        }, // <div>{{ count }}</div>
        {
          message:
            'Angular Signal message must be called with () to access its value in the templateUrl: 2:5 error. Example: message() instead of message',
          line: 2,
        }, // <div>{{ message }}</div>
        { messageId: 'signalUseAsSignalTemplate', line: 3 }, // <div>{{ user?.name }}</div>
        { messageId: 'signalUseAsSignalTemplate', line: 5 }, // @if (isLoading) ...
        { messageId: 'signalUseAsSignalTemplate', line: 7 }, // @else if (error) ...
        { messageId: 'signalUseAsSignalTemplate', line: 8 }, // {{ error }}
        { messageId: 'signalUseAsSignalTemplate', line: 19 }, // @switch (status) ...
        { messageId: 'signalUseAsSignalTemplate', line: 31 }, // @if (isAuthenticated) ...
        {
          message:
            'Angular Signal isAdmin must be called with () to access its value in the templateUrl: 45:0 error. Example: isAdmin() instead of isAdmin',
          line: 45,
        }, // @if (isAdmin) ...
        { messageId: 'signalUseAsSignalTemplate', line: 45 }, // hasPermission) ...
        { messageId: 'signalUseAsSignalTemplate', line: 49 }, // <div>{{ fullName }}</div>
        { messageId: 'signalUseAsSignalTemplate', line: 50 }, // <div>{{ totalPrice }}</div>
        { messageId: 'signalUseAsSignalTemplate', line: 52 }, // @if (data) ...
        { messageId: 'signalUseAsSignalTemplate', line: 53 }, // @else ...
      ],
    },
  ],
});
