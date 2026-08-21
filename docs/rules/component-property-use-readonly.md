# @rdlabo/rules/component-property-use-readonly

> Warns when a property should be readonly
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

This rule requires non-function properties declared by Angular components to use the `readonly` modifier. It reports initialized, uninitialized, static, computed, decorated, soft-private, and hard-private properties, and can add `readonly` automatically.

## Rule Details

Only classes decorated with `@Component()` are checked. Methods, getters, setters, arrow-function properties, function-expression properties, properties that are already `readonly`, and properties of other classes are ignored.

## Options

```json
{
  "rules": {
    "@rdlabo/rules/component-property-use-readonly": [
      "error",
      {
        "ignorePrivateProperties": true
      }
    ]
  }
}
```

### `ignorePrivateProperties`

- Type: `boolean`
- Default: `false`

When `true`, properties declared with the TypeScript `private` modifier and ECMAScript `#` private properties are ignored. Public, protected, and static properties are still checked.

## Examples

### Incorrect

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

### Correct

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

With `ignorePrivateProperties: true`, private properties may remain writable:

```ts
@Component({
  selector: 'app-example',
  template: '<div>example</div>',
})
export class ExampleComponent {
  private privateProp = 1; // no error
  #secretProp = 2; // no error
  public readonly publicProp = 3;
}
```

## When to enable

Enable this rule when component properties should expose stable references and writable state is managed through Signals or a ViewModel.

## Implementation

- [Rule source](../../src/rules/component-property-use-readonly.ts)
- [Test source](../../tests/rules/component-property-use-readonly.ts)
