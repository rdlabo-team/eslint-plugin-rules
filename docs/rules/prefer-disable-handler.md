# @rdlabo/rules/prefer-disable-handler

> Require a wrapper method (default: disableHandler($event, work)) on configured element/event bindings to prevent double taps while async work runs
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

When a user taps a button that triggers async work, the control should be disabled until the work settles. Otherwise, a second tap can fire the action again. This rule enforces the wrapper-call syntax for configured `(event)` bindings. The wrapper implementation is responsible for disabling the UI and handling the work value correctly.

## Rule Details

The rule runs on Angular templates. For each `BoundEvent` that matches a configured target, the handler expression must be a call to a wrapper method with at least two arguments:

1. The event parameter (default `$event`).
2. A work expression passed to the wrapper.

For example, `(click)="vm.disableHandler($event, vm.save())"` is valid. `(click)="vm.save()"` is reported. The rule does not inspect the second argument's type or verify that it returns a Promise.

The rule also allows bare event method calls such as `$event.stopPropagation()` and `$event.preventDefault()` (configurable with `allowEventMethods`).

By default, the rule targets:

- `click` on `<ion-button>` and `<button>`
- `submit` on any element

It ignores `.spec.html` files.

## Options

```json
{
  "rules": {
    "@rdlabo/rules/prefer-disable-handler": [
      "error",
      {
        "method": "disableHandler",
        "eventParam": "$event",
        "targets": [{ "events": ["click"], "elements": ["ion-button", "button"] }, { "events": ["submit"] }],
        "allowEventMethods": ["stopPropagation", "preventDefault"]
      }
    ]
  }
}
```

### `method`

- Type: `string`
- Default: `"disableHandler"`

The wrapper method name expected in the handler expression.

### `eventParam`

- Type: `string`
- Default: `"$event"`

The first argument that must be passed to the wrapper method.

### `targets`

- Type: `Target[]`
- Default: `[{ events: ['click'], elements: ['ion-button', 'button'] }, { events: ['submit'] }]`

Each target specifies which events and elements require the wrapper. `elements` is optional; when omitted, the rule applies to any element for those events.

### `allowEventMethods`

- Type: `string[]`
- Default: `["stopPropagation", "preventDefault"]`

Event methods that are allowed without the wrapper. For example, `(click)="$event.stopPropagation()"` is valid.

## Examples

### Incorrect

```html
<ion-button (click)="vm.save()">Save</ion-button>
```

```html
<form (submit)="vm.save()"></form>
```

```html
<ion-button (click)="vm.disableHandler(vm.save())">missing $event</ion-button>
```

### Correct

```html
<ion-button (click)="vm.disableHandler($event, vm.save())">Save</ion-button>
```

```html
<form (submit)="vm.disableHandler($event, vm.save())">
  <ion-button type="submit">Save</ion-button>
</form>
```

```html
<ion-button (click)="$event.stopPropagation()"></ion-button>
```

### Custom configuration

```html
<ion-input (ionComplete)="vm.disableHandler($event, vm.join())"></ion-input>
```

```json
{
  "rules": {
    "@rdlabo/rules/prefer-disable-handler": [
      "error",
      {
        "targets": [{ "events": ["ionComplete"], "elements": ["ion-input"] }]
      }
    ]
  }
}
```

## When to enable

Enable this rule in Ionic/Angular projects where user actions trigger async operations such as API calls, navigation, or modal presentation. It pairs with [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md) and [`@rdlabo/rules/deny-element`](./deny-element.md) to keep overlay logic centralized.

## See also

- [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md)
- [`@rdlabo/rules/deny-element`](./deny-element.md)

## Implementation

- [Rule source](../../src/rules/prefer-disable-handler.ts)
- [Test source](../../tests/rules/prefer-disable-handler.ts)
