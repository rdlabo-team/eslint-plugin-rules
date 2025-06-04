import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/signal-use-as-signal-template';
import * as path from 'path';

new RuleTester().run('signal-use-as-signal-template', rule, {
  valid: [
    {
      code: `
        @Component({
          template: '<div>{{ count() }}</div>'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
    },
    {
      code: `
        @Component({
          templateUrl: './templates/signal-use-as-signal/simple-valid.html'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
      filename: path.join(__dirname, 'test.component.ts'),
    },
    {
      code: `
        @Component({
          template: '<div>{{ count() + 1 }}</div>'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
    },
    {
      code: `
        @Component({
          template: '<div>{{ count() > 0 ? "Positive" : "Zero" }}</div>'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
    },
    {
      code: `
        @Component({
          template: '<div>{{ count() | async }}</div>'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
    },
    {
      code:
        `
        @Component({
          template: 
            ` +
        '`' +
        `
            @if (count()) {
              <div>{{ count() | async }}</div>
            }
            ` +
        '`' +
        `
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
    },
    {
      code: `
        @Component({
          template: '<div>{{ count() + otherCount() }}</div>'
        })
        export class TestComponent {
          count = signal(0);
          otherCount = signal(0);
        }
      `,
    },
    {
      code: `
        @Component({
          template: '@if (count()) { <div>{{ count() | async }}</div> }'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
    },
    {
      code: `
        @Component({
          template: '@switch (count()) { @case (0) { <div>Zero</div> } @case (1) { <div>One</div> } @default { <div>Other</div> } }'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
    },
    {
      code: `
        @Component({
          template: '@defer (on viewport) { <div>{{ count() }}</div> } @loading { <div>Loading...</div> }'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        @Component({
          template: '<div>{{ count }}</div>'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
    },
    {
      code: `
        @Component({
          template: '<div>{{ count.signal }}</div>'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
    },
    {
      code: `
        @Component({
          template: '<div>{{ count | async }}</div>'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
    },
    {
      code: `
        @Component({
          template: '<div>{{ count?.signal }}</div>'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
    },
    {
      code: `
        @Component({
          templateUrl: './templates/signal-use-as-signal/simple-invalid.html'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
      filename: path.join(__dirname, 'test.component.ts'),
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 1 }],
    },
    {
      code: `
        @Component({
          template: '<div>{{ count + 1 }}</div>'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
    },
    {
      code: `
        @Component({
          template: '<div>{{ count > 0 ? "Positive" : "Zero" }}</div>'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
    },
    {
      code: `
        @Component({
          template: '<div>{{ count + otherCount() }}</div>'
        })
        export class TestComponent {
          count = signal(0);
          otherCount = signal(0);
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
    },
    {
      code: `
        @Component({
          template: '@switch (count) { @case (0) { <div>Zero</div> } @case (1) { <div>One</div> } @default { <div>Other</div> } }'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
    },
    {
      code: `
        @Component({
          template: '@defer (on viewport) { <div>{{ count }}</div> } @loading { <div>Loading...</div> }'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
    },
  ],
});
