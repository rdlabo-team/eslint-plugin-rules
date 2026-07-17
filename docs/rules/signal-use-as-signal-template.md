# @rdlabo/rules/signal-use-as-signal-template

> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

This rule ensures that Signals are properly accessed in templates by requiring the use of the function call syntax `()`. This is necessary because Signals in Angular are functions that need to be called to access their current value.

## Rule Details

❌ Incorrect: Using Signals without function call syntax

```ts
@Component({
  template: `
    <div>{{ count }}</div>
    <div>{{ count.signal }}</div>
    <div>{{ count + 1 }}</div>
    @if (count) {
      <div>{{ count }}</div>
    }
    @switch (count) {
      @case (0) {
        <div>Zero</div>
      }
    }
    @defer (on viewport) {
      <div>{{ count }}</div>
    }
  `,
})
export class TestComponent {
  count = signal(0);
}
```

✅ Correct: Using Signals with function call syntax

```ts
@Component({
  template: `
    <div>{{ count() }}</div>
    <div>{{ count() + 1 }}</div>
    <div>{{ count() > 0 ? 'Positive' : 'Zero' }}</div>
    @if (count()) {
      <div>{{ count() | async }}</div>
    }
    @switch (count()) {
      @case (0) {
        <div>Zero</div>
      }
      @case (1) {
        <div>One</div>
      }
      @default {
        <div>Other</div>
      }
    }
    @defer (on viewport) {
      <div>{{ count() }}</div>
    }
  `,
})
export class TestComponent {
  count = signal(0);
}
```

✅ Correct: Passing a Signal reference as an input binding

BoundAttribute で Signal 名だけを渡す場合は、Signal 参照の props 渡しとして許可されます。

```ts
@Component({
  template: `<child [inventorySignal]="inventorySignal"></child>`,
})
export class TestComponent {
  inventorySignal = signal(0);
}
```

値として演算する場合は `()` が必要です。

```ts
// ❌
<child [disabled]="count > 0"></child>
// ✅
<child [disabled]="count() > 0"></child>
```

## Options

No Options.

## Unsupport Pattern

This rule does not support nested Signals patterns. For example:

```ts
@Component({
  template: `
    <div>{{ nestedSignal().child() }}</div>
    // Correct usage
    <div>{{ nestedSignal().child }}</div>
    // Incorrect: missing function call
  `,
})
export class TestComponent {
  nestedSignal = signal({
    child: signal<number>(0),
  });
}
```

The rule cannot detect when nested signals are not properly accessed with function calls.

## Implementation

- [Rule source](../../src/rules/signal-use-as-signal-template.ts)
- [Test source](../../tests/rules/signal-use-as-signal-template.ts)
