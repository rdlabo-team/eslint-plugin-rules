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
    `
      import { Component } from '@angular/core';
      const signal = (value: number) => value;
      const form = (value: unknown) => value;
      @Component({ template: '' })
      class Page {
        readonly state = signal(0);
        readonly pageForm = form(this.state);
      }
    `,
    `
      import * as core from '@angular/core';
      import * as signalForms from '@angular/forms/signals';
      @core.Component({ template: '' })
      class Page {
        readonly model = core.signal({ name: '' });
        readonly pageForm = signalForms.form(this.model);
      }
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
    {
      code: `
        import { Component as NgComponent, signal } from '@angular/core';
        @NgComponent({ template: '' })
        class Page { readonly state = signal(0); }
      `,
      errors: [{ messageId: 'componentWritableSignal', data: { name: 'state' } }],
    },
    {
      code: `
        import { Component, linkedSignal } from '@angular/core';
        @Component({ template: '' })
        class Page { readonly state = linkedSignal(() => 0); }
      `,
      errors: [{ messageId: 'componentWritableSignal', data: { name: 'state' } }],
    },
    {
      code: `
        import { Component, signal } from '@angular/core';
        import { form } from '@angular/forms/signals';
        @Component({ template: '' })
        class Page {
          readonly state = signal(0);
          buildForm() { return form(this.state); }
        }
      `,
      errors: [{ messageId: 'componentWritableSignal', data: { name: 'state' } }],
    },
  ],
});
