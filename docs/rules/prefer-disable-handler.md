# @rdlabo/rules/prefer-disable-handler

> Require a wrapper method (default: disableHandler($event, work)) on configured element/event bindings to prevent double taps while async work runs
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

`disableHandler` (from `@rdlabo/ionic-angular-kit`) disables the triggering control while an async operation runs and restores it when the Promise settles. Using it on sync work is harmless: the control is briefly disabled and re-enabled, and if no disableable target is found it is a no-op.

Element names, event names, and the wrapper method name are all configurable so the same rule can cover fleet defaults and repo-specific bindings (e.g. `(ionComplete)`).

Enabling this rule in `recommended` will flag existing templates that call async work without the wrapper — expect a migration pass when bumping the plugin.

## Rule Details

❌ Incorrect (defaults)

```html
<ion-button (click)="vm.save()">Save</ion-button>
<form (submit)="vm.save()"></form>
```

Also incorrect — wrapper must receive `$event` and a second `work` argument:

```html
<ion-button (click)="vm.disableHandler($event)">Save</ion-button> <ion-button (click)="vm.disableHandler(vm.save())">Save</ion-button>
```

✅ Correct (defaults)

```html
<ion-button (click)="vm.disableHandler($event, vm.save())">Save</ion-button>
<form (submit)="vm.disableHandler($event, vm.save())"></form>
```

Allowed without the wrapper (event-only, defaults):

```html
<ion-button (click)="$event.stopPropagation()"></ion-button>
```

```html
<ion-button (click)="$event.preventDefault()"></ion-button>
```

Out of scope by default (not listed in `targets.elements`):

```html
<ion-chip (click)="vm.toggle()"></ion-chip>
```

```html
<ion-item [button]="true" (click)="vm.open()"></ion-item>
```

## Options

```ts
{
  method?: string; // default: 'disableHandler'
  eventParam?: string; // default: '$event'
  targets?: Array<{
    events: string[]; // e.g. ['click'], ['submit'], ['ionComplete']
    elements?: string[]; // omit / [] = any element for those events
  }>;
  allowEventMethods?: string[]; // default: ['stopPropagation', 'preventDefault']
}
```

**`targets` fully replaces the default list** (it is not merged). To keep click/submit and add more bindings, re-list the defaults plus your extras.

### Defaults

```ts
{
  method: 'disableHandler',
  eventParam: '$event',
  targets: [
    { events: ['click'], elements: ['ion-button', 'button'] },
    { events: ['submit'] }, // any element
  ],
  allowEventMethods: ['stopPropagation', 'preventDefault'],
}
```

### Examples

Require a custom wrapper name:

```js
'@rdlabo/rules/prefer-disable-handler': ['error', { method: 'guardClick' }]
```

Also enforce `(ionComplete)` on `ion-input` (**re-list** default targets):

```js
'@rdlabo/rules/prefer-disable-handler': [
  'error',
  {
    targets: [
      { events: ['click'], elements: ['ion-button', 'button'] },
      { events: ['submit'] },
      { events: ['ionComplete'], elements: ['ion-input'] },
    ],
  },
]
```

## Implementation

- [Rule source](../../src/rules/prefer-disable-handler.ts)
- [Test source](../../tests/rules/prefer-disable-handler.ts)
