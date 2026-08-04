import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/no-component-writable-signal';

const ruleTester = new RuleTester();

ruleTester.run('no-component-writable-signal', rule, {
  valid: [
    `
      import { Component, computed, signal } from '@angular/core';
      import { form } from '@angular/forms/signals';
      @Component({ template: '' })
      class Page {
        readonly model = signal({ name: '' });
        readonly pageForm = form(this.model);
        readonly title = computed(() => this.model().name);
      }
    `,
    `
      import { Component, signal as writable } from '@angular/core';
      import { form as signalForm } from '@angular/forms/signals';
      @Component({ template: '' })
      class Page {
        readonly data = writable({ name: '' });
        readonly pageForm = signalForm(this.data);
      }
    `,
    `
      import { signal } from '@angular/core';
      class Store { readonly loading = signal(false); }
    `,
  ],
  invalid: [
    {
      code: `
        import { Component, signal } from '@angular/core';
        @Component({ template: '' })
        class Page { readonly isLoading = signal(false); }
      `,
      errors: [{ messageId: 'componentWritableSignal', data: { name: 'isLoading' } }],
    },
    {
      code: `
        import { Component, signal } from '@angular/core';
        import { form } from '@angular/forms/signals';
        @Component({ template: '' })
        class Page {
          readonly model = signal({ name: '' });
          readonly loading = signal(false);
          readonly pageForm = form(this.model);
        }
      `,
      errors: [{ messageId: 'componentWritableSignal', data: { name: 'loading' } }],
    },
  ],
});
