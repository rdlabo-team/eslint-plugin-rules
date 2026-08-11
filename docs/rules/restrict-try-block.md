# @rdlabo/rules/restrict-try-block

> Restrict Promise, RxJS, Angular Signal contexts, and physical code lines inside try blocks.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

Restricts asynchronous/reactive processing and physical code lines inside `try` blocks.

## Rule Details

This rule keeps `try` as a small boundary for synchronous exceptions. By default it reports:

- `await` and expressions whose TypeScript type is Promise-like
- expressions whose type or base type is declared by the `rxjs` package, including `Observable` and `Subject` variants
- `try` statements inside Angular `computed()` and `effect()` callbacks
- `try` bodies containing more than three physical code lines

Only the `try` body is inspected. Its `catch` and `finally` clauses are not. Nested functions, classes, and nested `try` statements are separate execution boundaries and are not attributed to the outer `try`.

Promise rejections should normally be handled by a Promise error boundary such as `.catch()`. If a Promise producer can also throw synchronously, preserve that boundary explicitly:

```ts
Promise.resolve()
  .then(() => makePromise())
  .catch(handleError);
```

RxJS errors should be handled through the Observable error channel, such as `catchError()` or an explicit subscriber error handler.

This is a type-aware rule. Configure typed linting, for example:

```js
languageOptions: {
  parserOptions: {
    projectService: true,
    tsconfigRootDir: __dirname,
  },
},
```

## Options

```js
{
  allowPromise: false,
  allowRxjs: false,
  allowInSignal: false,
  maxLines: 3,
}
```

- `allowPromise`: Allow Promise-like processing and `await` inside `try`.
- `allowRxjs`: Allow values and operations backed by types declared by `rxjs`. This includes `Observable`, `Subject`, and their subclasses.
- `allowInSignal`: Allow `try` inside inline Angular `computed()` and `effect()` callbacks. Aliased and namespace imports from `@angular/core` are recognized. Nested function and class bodies are separate execution boundaries.
- `maxLines`: Maximum physical code lines in the `try` body, or `false` to disable the size check.

For `maxLines`, the outer braces, comments, and blank lines are excluded. A unique physical line containing any other token counts once. Internal braces and multiline tokens count, so formatting can affect the result intentionally: the rule keeps the boundary visually small as well as logically narrow.

## Implementation

- [Rule source](../../src/rules/restrict-try-block.ts)
- [Test source](../../tests/rules/restrict-try-block.ts)
