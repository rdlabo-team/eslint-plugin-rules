import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/prefer-disable-handler';

const ruleTester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    parser: require('@angular-eslint/template-parser'),
  },
});

const error = (event: string, method = 'disableHandler', eventParam = '$event') => ({
  messageId: 'preferDisableHandler' as const,
  data: { event, method, eventParam },
});

ruleTester.run('prefer-disable-handler', rule, {
  valid: [
    {
      code: `<ion-button (click)="vm.disableHandler($event, vm.save())">Save</ion-button>`,
      filename: 'template.html',
    },
    {
      code: `<button type="button" (click)="helper.disableHandler($event, save())">Save</button>`,
      filename: 'template.html',
    },
    {
      code: `<ion-button (click)="disableHandler($event, save())">Save</ion-button>`,
      filename: 'template.html',
    },
    {
      code: `<form novalidate (submit)="vm.disableHandler($event, vm.save())"></form>`,
      filename: 'template.html',
    },
    {
      code: `<form #formRef novalidate (submit)="vm.disableHandler($event, vm.save())">
        <ion-button type="submit">Save</ion-button>
      </form>`,
      filename: 'template.html',
    },
    {
      code: `<ion-button type="submit" (click)="vm.disableHandler($event, vm.save())">Save</ion-button>`,
      filename: 'template.html',
    },
    {
      code: `<ion-button (click)="$event.stopPropagation()"></ion-button>`,
      filename: 'template.html',
    },
    {
      code: `<ion-button (click)="$event.preventDefault()"></ion-button>`,
      filename: 'template.html',
    },
    {
      code: `<ion-chip (click)="vm.toggle()">out of scope</ion-chip>`,
      filename: 'template.html',
    },
    {
      code: `<ion-item [button]="true" (click)="vm.open()">out of scope</ion-item>`,
      filename: 'template.html',
    },
    {
      code: `<ion-fab (click)="vm.create()">out of scope</ion-fab>`,
      filename: 'template.html',
    },
    {
      code: `<ion-button (click)="vm.save()">ignored in specs</ion-button>`,
      filename: 'template.spec.html',
    },
    {
      code: `@if (ready) {
        <ion-button (click)="vm.disableHandler($event, vm.save())">Save</ion-button>
      } @else {
        <button (click)="vm.disableHandler($event, vm.cancel())">Cancel</button>
      }`,
      filename: 'template.html',
    },
    {
      code: `@for (item of items; track item.id) {
        <ion-button (click)="vm.disableHandler($event, vm.open(item))">Open</ion-button>
      }`,
      filename: 'template.html',
    },
    {
      code: `<ion-button
        (click)="vm.disableHandler($event, vm.saveWithOptions({ force: true }))"
      >Save</ion-button>`,
      filename: 'template.html',
    },
    // custom method / eventParam
    {
      code: `<ion-button (click)="vm.guardClick($event, vm.save())">Save</ion-button>`,
      filename: 'template.html',
      options: [{ method: 'guardClick' }],
    },
    {
      code: `<ion-button (click)="vm.disableHandler(ev, vm.save())">Save</ion-button>`,
      filename: 'template.html',
      options: [{ eventParam: 'ev' }],
    },
    // custom targets: only button click
    {
      code: `<ion-button (click)="vm.save()">not listed</ion-button>`,
      filename: 'template.html',
      options: [{ targets: [{ events: ['click'], elements: ['button'] }] }],
    },
    // custom targets: only submit
    {
      code: `<ion-button (click)="vm.save()">click not targeted</ion-button>`,
      filename: 'template.html',
      options: [{ targets: [{ events: ['submit'] }] }],
    },
    // custom targets: ionComplete on ion-input
    {
      code: `<ion-input (ionComplete)="vm.disableHandler($event, vm.join())"></ion-input>`,
      filename: 'template.html',
      options: [{ targets: [{ events: ['ionComplete'], elements: ['ion-input'] }] }],
    },
    {
      code: `<ion-button (click)="$event.blur()"></ion-button>`,
      filename: 'template.html',
      options: [{ allowEventMethods: ['blur'] }],
    },
  ],
  invalid: [
    {
      code: `<ion-button (click)="vm.save()">Save</ion-button>`,
      filename: 'template.html',
      errors: [{ ...error('click'), line: 1, column: 13 }],
    },
    {
      code: `<div>
  <ion-button (click)="vm.save()">Save</ion-button>
  <form
    (submit)="vm.save()"
  ></form>
</div>`,
      filename: 'template.html',
      errors: [
        { ...error('click'), line: 2, column: 15 },
        { ...error('submit'), line: 4, column: 5 },
      ],
    },
    {
      code: `<button (click)="save()">Save</button>`,
      filename: 'template.html',
      errors: [{ ...error('click'), line: 1, column: 9 }],
    },
    {
      code: `<form (submit)="vm.save()"></form>`,
      filename: 'template.html',
      errors: [{ ...error('submit'), line: 1, column: 7 }],
    },
    {
      code: `<ion-button (click)="vm.disableHandler(vm.save())">missing $event</ion-button>`,
      filename: 'template.html',
      errors: [error('click')],
    },
    {
      code: `<ion-button (click)="vm.disableHandler($event)">missing work</ion-button>`,
      filename: 'template.html',
      errors: [error('click')],
    },
    {
      code: `<ion-button (click)="vm.disableHandler(event, vm.save())">wrong event ident</ion-button>`,
      filename: 'template.html',
      errors: [error('click')],
    },
    {
      code: `<ion-button (click)="vm.otherHandler($event, vm.save())">wrong handler name</ion-button>`,
      filename: 'template.html',
      errors: [error('click')],
    },
    {
      code: `<ion-button (click)="modalCtrl.dismiss()"></ion-button>`,
      filename: 'template.html',
      errors: [error('click')],
    },
    {
      code: `<ion-button (click)="visiblyPassword.set(!visiblyPassword())"></ion-button>`,
      filename: 'template.html',
      errors: [error('click')],
    },
    {
      code: `@if (ready) {
  <ion-button (click)="vm.save()">Save</ion-button>
}`,
      filename: 'template.html',
      errors: [{ ...error('click'), line: 2, column: 15 }],
    },
    {
      code: `@for (item of items; track item.id) {
  <button (click)="vm.open(item)">Open</button>
}`,
      filename: 'template.html',
      errors: [{ ...error('click'), line: 2, column: 11 }],
    },
    {
      code: `<div>
  <form (submit)="vm.save()">
    <ion-button (click)="vm.save()">Save</ion-button>
  </form>
</div>`,
      filename: 'template.html',
      errors: [
        { ...error('submit'), line: 2, column: 9 },
        { ...error('click'), line: 3, column: 17 },
      ],
    },
    {
      code: `<button (click)="vm.save()">listed</button>`,
      filename: 'template.html',
      options: [{ targets: [{ events: ['click'], elements: ['button'] }] }],
      errors: [error('click')],
    },
    {
      code: `<form (submit)="vm.save()"></form>`,
      filename: 'template.html',
      options: [{ targets: [{ events: ['submit'] }] }],
      errors: [error('submit')],
    },
    {
      code: `<ion-button (click)="$event.stopPropagation()"></ion-button>`,
      filename: 'template.html',
      options: [{ allowEventMethods: [] }],
      errors: [error('click')],
    },
    {
      code: `<ion-chip (click)="vm.toggle()"></ion-chip>`,
      filename: 'template.html',
      options: [{ targets: [{ events: ['click'], elements: ['ion-chip'] }] }],
      errors: [error('click')],
    },
    {
      code: `<ion-button (click)="vm.disableHandler($event, vm.save())">wrong method</ion-button>`,
      filename: 'template.html',
      options: [{ method: 'guardClick' }],
      errors: [error('click', 'guardClick')],
    },
    {
      code: `<ion-button (click)="vm.disableHandler($event, vm.save())">wrong eventParam</ion-button>`,
      filename: 'template.html',
      options: [{ eventParam: 'ev' }],
      errors: [error('click', 'disableHandler', 'ev')],
    },
    {
      code: `<ion-input (ionComplete)="vm.join()"></ion-input>`,
      filename: 'template.html',
      options: [{ targets: [{ events: ['ionComplete'], elements: ['ion-input'] }] }],
      errors: [error('ionComplete')],
    },
  ],
});
