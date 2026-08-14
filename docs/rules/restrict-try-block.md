# @rdlabo/rules/restrict-try-block

> Restrict Promise, RxJS, Angular Signal contexts, `Promise.resolve()` escape hatches, and physical code lines inside try blocks.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

Restricts asynchronous/reactive processing and physical code lines inside `try` blocks.

## Rule Details

This rule keeps `try` as a small boundary for synchronous exceptions. By default it reports:

- `await` and expressions whose TypeScript type is Promise-like
- `Promise.resolve()` calls anywhere, including chains used to convert synchronous exceptions into Promise rejections
- expressions whose type or base type is declared by the `rxjs` package, including `Observable` and `Subject` variants
- `try` statements inside Angular `computed()` and `effect()` callbacks
- `try` bodies containing more than three physical code lines

For the `try`-specific checks, only the `try` body is inspected. Its `catch` and `finally` clauses are not. Nested functions, classes, and nested `try` statements are separate execution boundaries and are not attributed to the outer `try`. The `Promise.resolve()` check applies throughout the file.

Promise rejections should normally be handled by a Promise error boundary such as `.catch()`. Do not manufacture that boundary with `Promise.resolve()` to move synchronous failures into the rejection channel:

```ts
// incorrect
Promise.resolve()
  .then(() => fallibleSynchronousWork())
  .catch(handleError);
```

Keep a synchronous `try` boundary small and place it in the layer responsible for handling that failure. Return a value or an existing Promise directly instead of normalizing it with `Promise.resolve(value)`.

RxJS errors should be handled through the Observable error channel, such as `catchError()` or an explicit subscriber error handler.

Promise-like and RxJS type detection uses TypeScript type information when available. Without typed linting, those type-dependent checks are skipped instead of stopping ESLint; syntax-based `await`, `Promise.resolve()`, Angular Signal context, and `maxLines` checks still run. Configure typed linting for full enforcement, for example:

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
  allowPromiseResolve: false,
  allowRxjs: false,
  allowInSignal: false,
  maxLines: 3,
}
```

- `allowPromise`: Allow Promise-like processing and `await` inside `try`.
- `allowPromiseResolve`: Disable the dedicated file-wide `Promise.resolve()` check. Inside a `try` body, `allowPromise: true` is also required because the call is independently Promise-like processing.
- `allowRxjs`: Allow values and operations backed by types declared by `rxjs`. This includes `Observable`, `Subject`, and their subclasses.
- `allowInSignal`: Allow `try` inside inline Angular `computed()` and `effect()` callbacks. Aliased and namespace imports from `@angular/core` are recognized. Nested function and class bodies are separate execution boundaries.
- `maxLines`: Maximum physical code lines in the `try` body, or `false` to disable the size check.

`allowPromise: false` and `allowRxjs: false` are fully enforced when typed linting is configured. Without type information, only syntax-based checks such as `await` remain available for those categories.

The `Promise.resolve()` check recognizes the unshadowed global `Promise` and explicit `globalThis.Promise`, including static bracket notation. It intentionally does not follow aliases. A locally declared or imported value named `Promise`, or a locally shadowed `globalThis`, is not treated as the built-in API.

For `maxLines`, the outer braces, comments, and blank lines are excluded. A unique physical line containing any other token counts once. Internal braces and multiline tokens count, so formatting can affect the result intentionally: the rule keeps the boundary visually small as well as logically narrow.

## Implementation

- [Rule source](../../src/rules/restrict-try-block.ts)
- [Test source](../../tests/rules/restrict-try-block.ts)
