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
          template: '@defer { <div>{{ count() }}</div> } @loading { <div>Loading...</div> }'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
    },
    {
      code: `
        @Component({
          template: '<div>{{ count() }}</div>'
        })
        export class TestComponent {
          count = model(0);
        }
      `,
    },
    {
      code: `
        @Component({
          template: '<div>{{ count() }}</div>'
        })
        export class TestComponent {
          count = computed(() => 1);
        }
      `,
    },
    {
      code: `
        @Component({
          template: '<div>{{ count() }}</div>'
        })
        export class TestComponent {
          source = signal(0);
          count = linkedSignal(this.source);
        }
      `,
    },
    {
      code: `
        @Component({
          template: '<div>{{ name() }}</div>'
        })
        export class TestComponent {
          name = input('Mike');
        }
      `,
    },
    {
      code: `
        @Component({
          template: '<div>{{ count() }}</div>'
        })
        export class TestComponent {
          obs = new BehaviorSubject(0);
          count = toSignal(this.obs);
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
          count = model(0);
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
    },
    {
      code: `
        @Component({
          template: '<div>{{ count }}</div>'
        })
        export class TestComponent {
          count = computed(() => 1);
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
    },
    {
      code: `
        @Component({
          template: '<div>{{ count }}</div>'
        })
        export class TestComponent {
          source = signal(0);
          count = linkedSignal(this.source);
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
    },
    {
      code: `
        @Component({
          template: '<div>{{ name }}</div>'
        })
        export class TestComponent {
          name = input('Mike');
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
    },
    {
      code: `
        @Component({
          template: '<div>{{ name }}</div>'
        })
        export class TestComponent {
          name = input.required('Mike');
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
    },
    {
      code: `
        @Component({
          template: '<div>{{ count }}</div>'
        })
        export class TestComponent {
          obs = new BehaviorSubject(0);
          count = toSignal(this.obs);
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
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
          messageId: 'signalUseAsSignalTemplate',
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
          template: '@defer { <div>{{ count }}</div> } @loading { <div>Loading...</div> }'
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
          messageId: 'signalUseAsSignalTemplate',
          line: 4,
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
          messageId: 'signalUseAsSignalTemplate',
          line: 3,
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
          messageId: 'signalUseAsSignalTemplate',
          line: 3,
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
          messageId: 'signalUseAsSignalTemplate',
          line: 3,
        },
      ],
    },
  ],
});
