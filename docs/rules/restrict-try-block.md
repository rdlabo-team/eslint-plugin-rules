# @rdlabo/rules/restrict-try-block

> Restrict Promise, RxJS, Angular Signal contexts, `Promise.resolve()` escape hatches, and physical code lines inside try blocks.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

`try/catch` should protect a small, synchronous operation that can actually throw. Putting async work, long blocks, or reactive callbacks inside `try` obscures error boundaries and can swallow or misroute errors. This rule enforces those constraints.

## Rule Details

The rule checks every `try` block and reports the following by default:

- `await` or other Promise/thenable usage inside `try`
- `Promise.resolve()` anywhere (even outside a `try`) as an escape hatch
- RxJS types or operations inside `try`
- A `try` block inside a `computed()` or `effect()` callback
- A `try` block longer than 3 physical code lines

For checks scoped to a `try`, only the `try` body is inspected. `catch` and `finally` clauses are excluded. Nested functions, classes, and nested `try` statements are separate execution boundaries and are not attributed to the outer block. The `Promise.resolve()` check applies throughout the file.

Promise-like and RxJS detection uses TypeScript type information when available. Without typed linting, those checks are skipped instead of stopping ESLint; syntax-based `await`, `Promise.resolve()`, Angular Signal context, and line-count checks still run. Configure `parserOptions.projectService` for full enforcement.

## Options

```json
{
  "rules": {
    "@rdlabo/rules/restrict-try-block": [
      "error",
      {
        "allowPromise": false,
        "allowPromiseResolve": false,
        "allowRxjs": false,
        "allowInSignal": false,
        "maxLines": 3
      }
    ]
  }
}
```

### `allowPromise`

- Type: `boolean`
- Default: `false`

Allow Promise/thenable usage inside `try`.

### `allowPromiseResolve`

- Type: `boolean`
- Default: `false`

Disable the file-wide `Promise.resolve()` check. Inside a `try` body, `allowPromise: true` is also required because the call is independently Promise-like processing.

### `allowRxjs`

- Type: `boolean`
- Default: `false`

Allow RxJS usage inside `try`.

### `allowInSignal`

- Type: `boolean`
- Default: `false`

Allow `try` blocks inside `computed()` or `effect()` callbacks.

### `maxLines`

- Type: `number | false`
- Default: `3`

Maximum physical code lines inside a `try` block. Set to `false` to disable the size check. Outer braces, comments, and blank lines are excluded; a unique line containing any other token counts once.

## Examples

### Incorrect

```ts
async function run() {
  try {
    await work();
  } catch {}
}
```

```ts
try {
  Promise.resolve(1).catch(() => 0);
} catch {}
```

```ts
import { of } from 'rxjs';

try {
  of(1).pipe().subscribe();
} catch {}
```

```ts
import { computed } from '@angular/core';

const value = computed(() => {
  try {
    return JSON.parse('1');
  } catch {
    return 0;
  }
});
```

```ts
try {
  first();
  second();
  third();
  fourth();
} catch {}
```

### Correct

```ts
function parse(source: string) {
  try {
    return JSON.parse(source);
  } catch {
    return null;
  }
}
```

```ts
async function run() {
  try {
    doWork();
  } catch {
    await recover();
  } finally {
    cleanup();
  }
}
```

```ts
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

of(1)
  .pipe(catchError(() => of(0)))
  .subscribe();
```

### Relaxing a check

```json
{
  "rules": {
    "@rdlabo/rules/restrict-try-block": [
      "error",
      {
        "allowPromise": true,
        "allowPromiseResolve": true,
        "allowRxjs": true,
        "allowInSignal": true,
        "maxLines": false
      }
    ]
  }
}
```

## When to enable

Enable this rule in any project where you want `try/catch` to be a small, explicit error boundary. It is especially useful in Angular Signal code and when migrating away from Promise/RxJS-heavy error handling.

The `Promise.resolve()` check recognizes the unshadowed global `Promise` and explicit `globalThis.Promise`, including static bracket notation. It intentionally does not follow aliases. A locally declared or imported `Promise`, or a shadowed `globalThis`, is not treated as the built-in API.

## Implementation

- [Rule source](../../src/rules/restrict-try-block.ts)
- [Test source](../../tests/rules/restrict-try-block.ts)
