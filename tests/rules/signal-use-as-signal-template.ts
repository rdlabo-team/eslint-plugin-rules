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
          template: \`<div>
          {{ count() + otherCount() }}
          </div>\`
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
          template: \`<div>
          
          {{ count }}
          </div>\`
        })
        export class TestComponent {
          count = model(0);
        }
      `,
      errors: [
        {
          line: 5,
          message:
            'Angular Signal count must be called count() to access its value in the template',
        },
      ],
    },
    {
      code: `
        @Component({
          standalone: true,
          template: '<div>{{ computedCount }}</div>'
        })
        export class TestComponent {
          count = model(0);
          computedCount = computed(() => this.count() * 2 );
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 4 }],
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
          imports: [],
          standalone: true,
          template: '<div>{{ count | async }}</div>'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 5 }],
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
        import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, OnInit, signal, viewChild } from '@angular/core';
        import { ActivatedRoute } from '@angular/router';
        
        @Component({
          templateUrl: './templates/signal-use-as-signal/simple-invalid.html'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
      filename: path.join(__dirname, 'test.component.ts'),
      errors: [
        {
          message:
            'Angular Signal count must be called count() to access its value in the templateUrl\ntests/rules/templates/signal-use-as-signal/simple-invalid.html:1:5',
          line: 6,
        },
      ],
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
    {
      code: `
        @Component({
          template: '<div>{{ this.count }}</div>'
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
          template: \`<div>
          @if (!this.count) {
              <p>Count is 1</p>
          }
          </div>\`
        })
        export class TestComponent {
          count = model(0);
        }
      `,
      errors: [
        {
          line: 4,
          messageId: 'signalUseAsSignalTemplate',
        },
      ],
    },
    {
      code: `
        @Component({
          template: '<div>{{ count.first }}</div>'
        })
        export class TestComponent {
          count = {
            first: signal<number>(0),
            second: signal<number>(0)
          }
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'signalUseAsSignalTemplate',
        },
      ],
    },
    {
      code: `
        @Component({
          template: '<div>{{ count.first.second }}</div>'
        })
        export class TestComponent {
          count = {
            first: {
              second: signal<number>(0)
            }
          }
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'signalUseAsSignalTemplate',
        },
      ],
    },
    {
      code: `
        @Component({
          template: '<div>{{ count.first.second.third }}</div>'
        })
        export class TestComponent {
          count = {
            first: {
              second: {
                third: signal<number>(0)
              }
            }
          }
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'signalUseAsSignalTemplate',
        },
      ],
    },
  ],
});
