# @rdlabo/rules/no-string-boolean-ionic-attr

> Disallows string values for boolean attributes in Ionic components

Ionicコンポーネントでboolean属性に文字列値を設定することを禁止するルールです。これにより、TypeScriptのビルドエラー（TS2322: Type string is not assignable to type boolean）を事前に防ぐことができます。

## Rule Details

このルールは、Ionicコンポーネントのテンプレート内でboolean属性に文字列値を設定している箇所を検出します。

### 検出される問題のあるコード例:

```html
<!-- ❌ 問題のあるコード -->
<ion-item button="true"></ion-item>
<ion-list inset="true"></ion-list>
<input disabled="false"></input>
<button readonly="1"></button>
```

### 推奨される修正方法:

```html
<!-- ✅ 正しいコード -->
<ion-item [button]="true"></ion-item>
<ion-list [inset]="true"></ion-list>
<input [disabled]="false"></input>
<button [readonly]="true"></button>

<!-- または、単純に属性名のみを記述 -->
<ion-item button></ion-item>
<ion-list inset></ion-list>
```

## Options

このルールにはオプションはありません。

## サポートされるboolean属性

このルールは、Ionicコンポーネントの型定義から自動的にboolean属性を特定し、以下のような属性を検出します：

### Ionicコンポーネントのboolean属性例

- `ion-item`: `button`, `disabled`, `detail`
- `ion-list`: `inset`, `lines`
- `ion-button`: `disabled`, `expand`, `fill`, `strong`
- `ion-checkbox`: `checked`, `disabled`, `indeterminate`
- `ion-toggle`: `checked`, `disabled`
- `ion-radio`: `checked`, `disabled`
- `ion-input`: `disabled`, `readonly`, `required`
- `ion-textarea`: `disabled`, `readonly`, `required`
- `ion-select`: `disabled`, `multiple`, `required`
- `ion-datetime`: `disabled`, `readonly`
- `ion-range`: `disabled`, `pin`, `snaps`
- `ion-segment`: `disabled`
- `ion-slides`: `pager`, `scrollbar`
- `ion-tab`: `selected`
- `ion-menu`: `disabled`, `swipeGesture`
- `ion-modal`: `animated`, `backdropDismiss`, `showBackdrop`
- `ion-popover`: `animated`, `backdropDismiss`, `showBackdrop`
- `ion-alert`: `animated`, `backdropDismiss`
- `ion-loading`: `animated`, `backdropDismiss`
- `ion-toast`: `animated`
- `ion-action-sheet`: `animated`, `backdropDismiss`

## エラーメッセージ

このルールは以下のメッセージを表示します：

```
Boolean attribute 'button' should not have a string value 'true'. Use property binding [button]="true" instead.
```
