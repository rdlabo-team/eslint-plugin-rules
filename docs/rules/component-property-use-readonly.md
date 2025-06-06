# @rdlabo/rules/component-property-use-readonly

> This rule warns when properties in Angular components should be readonly.
>
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

This rule enforces the use of the `readonly` modifier for properties in Angular components that should be immutable. This helps make component state management safer by preventing unexpected changes.

## Rule Details

❌ Incorrect: Properties without the `readonly` modifier

```ts
@Component({
  selector: 'app-example',
  template: '<div>example</div>',
})
export class ExampleComponent {
  x = 1;
  public y = 2;
  private z = 3;
  protected w = 4;
  #secret = 42;
  static a = 1;
  ['foo'] = 1;
  @Input() i = 8;
  h: number;
}
```

✅ Correct: Properties with the `readonly` modifier

```ts
@Component({
  selector: 'app-example',
  template: '<div>example</div>',
})
export class ExampleComponent {
  readonly x = 1;
  public readonly y = 2;
  private readonly z = 3;
  protected readonly w = 4;
  readonly #secret = 42;
  static readonly a = 1;
  readonly ['foo'] = 1;
  @Input() readonly i = 8;
  readonly h: number;
}
```

## Options

No Options.

## Implementation

- [Rule source](../../src/rules/component-property-use-readonly.ts)
- [Test source](../../tests/rules/component-property-use-readonly.ts)
