# @rdlabo/rules/signal-use-as-signal-template

> This plugin enforces the correct usage of Angular Signals in templates by requiring the use of () to access signal values.

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

## Options

No Options.

## Implementation

- [Rule source](../../src/rules/signal-use-as-signal-template.ts)
- [Test source](../../tests/rules/signal-use-as-signal-template.ts)
