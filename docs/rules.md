The package exposes 18 rules. Rules marked “recommended” are enabled by `rdlabo.configs.recommended`; the remaining rules are opt-in.

| Rule                                                                                      | Purpose                                                                            | Fix | Preset |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | :-: | :----: |
| [`component-property-use-readonly`](./rules/component-property-use-readonly.md)           | Require `readonly` on immutable Angular component properties.                      | Yes |  Yes   |
| [`deny-constructor-di`](./rules/deny-constructor-di.md)                                   | Disallow constructor dependency injection. Deprecated in favor of `inject()`.      | No  |   No   |
| [`deny-element`](./rules/deny-element.md)                                                 | Reject configured HTML elements, such as inline Ionic overlays.                    | No  |  Yes   |
| [`deny-overlay-create`](./rules/deny-overlay-create.md)                                   | Disallow direct `.create()` calls on modal and popover controllers.                | No  |  Yes   |
| [`deny-soft-private-modifier`](./rules/deny-soft-private-modifier.md)                     | Replace TypeScript `private` with hard-private `#` fields.                         | Yes |  Yes   |
| [`implements-ionic-lifecycle`](./rules/implements-ionic-lifecycle.md)                     | Require the matching interface for Angular and Ionic lifecycle methods.            | Yes |  Yes   |
| [`ionic-attr-type-check`](./rules/ionic-attr-type-check.md)                               | Require property binding for non-string Ionic attributes.                          | Yes |  Yes   |
| [`no-component-method-except-lifecycle`](./rules/no-component-method-except-lifecycle.md) | Keep arbitrary methods out of Angular components.                                  | No  |  Yes   |
| [`no-component-writable-signal`](./rules/no-component-writable-signal.md)                 | Keep writable component state in a ViewModel, with a Signal Forms model exception. | No  |   No   |
| [`no-reactive-forms`](./rules/no-reactive-forms.md)                                       | Disallow Reactive Forms in favor of Angular Signal Forms.                          | No  |   No   |
| [`no-template-driven-forms`](./rules/no-template-driven-forms.md)                         | Disallow template-driven forms except configured interoperability elements.        | No  |   No   |
| [`prefer-disable-handler`](./rules/prefer-disable-handler.md)                             | Wrap configured event handlers to prevent duplicate async actions.                 | No  |  Yes   |
| [`prefer-ionic-standalone`](./rules/prefer-ionic-standalone.md)                           | Prefer Ionic 9 standalone imports and disallow `IonicModule`.                      | Yes |  Yes   |
| [`prefer-modal-launcher`](./rules/prefer-modal-launcher.md)                               | Restrict `presentModal` calls to `launch*` functions.                              | No  |  Yes   |
| [`require-viewmodel`](./rules/require-viewmodel.md)                                       | Enforce component ownership and the `ViewModelStore` boundary.                     | No  |  Yes   |
| [`restrict-try-block`](./rules/restrict-try-block.md)                                     | Keep `try` blocks small and exclude Promise, RxJS, and Signal contexts by policy.  | No  |  Yes   |
| [`signal-use-as-signal-template`](./rules/signal-use-as-signal-template.md)               | Require `()` when reading Angular Signals in templates.                            | No  |  Yes   |
| [`signal-use-as-signal`](./rules/signal-use-as-signal.md)                                 | Require correct Signal reads and writes in TypeScript.                             | Yes |  Yes   |

## Rule documentation

Each rule page in this documentation contains options and correct/incorrect examples.

## Typed rules

Enable `parserOptions.projectService` for rules that inspect TypeScript types. Without typed linting, `restrict-try-block` still performs syntax-based checks but skips type-dependent Promise and RxJS detection.
