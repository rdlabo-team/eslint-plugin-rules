# @rdlabo/eslint-plugin-rules

This is a public version of the eslint rules I use in the app I created with Ionic Angular.

## Installation

```sh
npm install @rdlabo/eslint-plugin-rules --save-dev
```

If your project does not install `@angular-eslint` packages, please do so: https://github.com/angular-eslint/angular-eslint

## Configuration (legacy: `.eslintrc*`)

Recommend settings is here:

```diff
  {
    ...
+   "plugins": ["@rdlabo/rules"],
    "overrides": [
      {
        "files": [
          "*.ts"
        ],
      ...
        "rules": {
+         "@rdlabo/rules/deny-constructor-di": "error",
+         "@rdlabo/rules/import-inject-object": "error",
+         "@rdlabo/rules/deny-import-from-ionic-module": "error",
+         "@rdlabo/rules/implements-ionic-lifecycle": "error",
+         "@rdlabo/rules/deny-soft-private-modifier": "error",
        }
      },
      {
        "files": [
          "*.html"
        ],
        "rules": {
+         "@rdlabo/rules/deny-element": [
+           "error",
+           {
+             "elements": [
+               "ion-modal",
+               "ion-popover",
+               "ion-toast",
+               "ion-alert",
+               "ion-loading",
+               "ion-picker",
+               "ion-action-sheet"
+             ]
+           }
+         ]
          ]
        }
      }
    ]
  }
```

## List of supported rules

| rule                                                                                       | description                                                               | auto fix |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | :------: |
| [@rdlabo/rules/deny-constructor-di](docs/rules/deny-constructor-di.md)                     | This plugin disallows Dependency Injection within the constructor.        |    ○     |
| [@rdlabo/rules/import-inject-object](docs/rules/import-inject-object.md)                   | This plugin automatically imports when `inject` is used but not imported. |    ○     |
| [@rdlabo/rules/deny-element](docs/rules/deny-element.md)                                   | This plugin disallows the use of certain HTML tags.                       |    ☓     |
| [@rdlabo/rules/deny-import-from-ionic-module](docs/rules/deny-import-from-ionic-module.md) | This plugin disallows import from `@ionic/angular`                        |    ○     |
| [@rdlabo/rules/implements-ionic-lifecycle](docs/rules/implements-ionic-lifecycle.md)       | This plugin checks the implementation of the Ionic lifecycle.             |    ☓     |
| [@rdlabo/rules/deny-soft-private-modifier](docs/rules/deny-soft-private-modifier)          | This plugin disallows the use of soft private modifier.                   |    ◯     |

## Recommend rules with this plugin

### @typescript-eslint/explicit-member-accessibility

Control to allow / disallow placing explicit public, protected, and private accessibility modifiers in front of class members.

```diff
  "rules": {
+   "@typescript-eslint/explicit-member-accessibility": ["error", { "accessibility": "no-public" }],
```
