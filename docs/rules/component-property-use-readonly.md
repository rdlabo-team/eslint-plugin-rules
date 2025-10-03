# @rdlabo/rules/component-property-use-readonly

> Warns when a property should be readonly
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

## Rule Settings

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

## Options

```ts
const options: {
  ignorePrivateProperties?: boolean; // Whether to ignore private properties (default: false)
};
```

### ignorePrivateProperties

When set to `true`, this option ignores both hard private properties (using the `private` modifier) and soft private properties (using the `#` prefix). This is useful because private properties are typically not accessed from outside the component, making the `readonly` modifier less critical.

❌ Incorrect: Private properties without `ignorePrivateProperties: true`

```ts
@Component({
  selector: 'app-example',
  template: '<div>example</div>',
})
export class ExampleComponent {
  private privateProp = 1; // error
  #secretProp = 2; // error
}
```

✅ Correct: Private properties with `ignorePrivateProperties: true`

```ts
// .eslintrc.json
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

// Component code
@Component({
  selector: 'app-example',
  template: '<div>example</div>',
})
export class ExampleComponent {
  private privateProp = 1; // no error
  #secretProp = 2; // no error
  public publicProp = 3; // still requires readonly
}
```

## Implementation

- [Rule source](../../src/rules/component-property-use-readonly.ts)
- [Test source](../../tests/rules/component-property-use-readonly.ts)
