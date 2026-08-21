import { TSESLint } from '@typescript-eslint/utils';

type MessageIds = 'preferRootEntrypoint' | 'noIonicModule';

const IONIC_ANGULAR_ENTRYPOINT = '@ionic/angular';
const DISALLOWED_ENTRYPOINTS = new Set(['@ionic/angular/standalone', '@ionic/angular/lazy']);

const rule: TSESLint.RuleModule<MessageIds, []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Prefer the Ionic 9 standalone API and disallow IonicModule and obsolete or NgModule-based entry points.',
      url: '',
    },
    fixable: 'code',
    messages: {
      preferRootEntrypoint: 'Import Ionic Angular APIs from @ionic/angular instead of {{ entrypoint }}.',
      noIonicModule: 'IonicModule is not allowed. Import standalone Ionic components and configure Ionic with provideIonicAngular().',
    },
    schema: [],
    type: 'suggestion',
  },
  create(context) {
    const ionicNamespaces = new Map<string, TSESLint.Scope.Variable>();
    const sourceCode = context.sourceCode;
    const replacement = (source: { range: [number, number] }): string => {
      const sourceText = sourceCode.text.slice(source.range[0], source.range[1]);
      const quote = sourceText.startsWith('"') ? '"' : "'";
      return `${quote}${IONIC_ANGULAR_ENTRYPOINT}${quote}`;
    };

    return {
      ImportDeclaration(node) {
        const entrypoint = String(node.source.value);

        if (DISALLOWED_ENTRYPOINTS.has(entrypoint)) {
          const canFix = node.specifiers.length > 0 && node.specifiers.every((specifier) => specifier.type === 'ImportSpecifier');
          context.report({
            node: node.source,
            messageId: 'preferRootEntrypoint',
            data: { entrypoint },
            fix: canFix ? (fixer) => fixer.replaceText(node.source, replacement(node.source)) : undefined,
          });
          return;
        }

        if (entrypoint !== IONIC_ANGULAR_ENTRYPOINT) {
          return;
        }

        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportNamespaceSpecifier') {
            const variable = sourceCode.getDeclaredVariables(node).find((candidate) => candidate.name === specifier.local.name);
            if (variable) {
              ionicNamespaces.set(specifier.local.name, variable);
            }
            continue;
          }
          if (specifier.type === 'ImportSpecifier' && specifier.imported.type === 'Identifier' && specifier.imported.name === 'IonicModule') {
            context.report({
              node: specifier,
              messageId: 'noIonicModule',
            });
          }
        }
      },
      ExportNamedDeclaration(node) {
        if (!node.source) {
          return;
        }

        const entrypoint = String(node.source.value);
        if (DISALLOWED_ENTRYPOINTS.has(entrypoint)) {
          context.report({
            node: node.source,
            messageId: 'preferRootEntrypoint',
            data: { entrypoint },
            fix: node.specifiers.length > 0 ? (fixer) => fixer.replaceText(node.source!, replacement(node.source!)) : undefined,
          });
          return;
        }

        if (entrypoint !== IONIC_ANGULAR_ENTRYPOINT) {
          return;
        }

        for (const specifier of node.specifiers) {
          const exportedName = specifier.local.type === 'Identifier' ? specifier.local.name : specifier.local.value;
          if (exportedName === 'IonicModule') {
            context.report({
              node: specifier,
              messageId: 'noIonicModule',
            });
          }
        }
      },
      ExportAllDeclaration(node) {
        const entrypoint = String(node.source.value);
        if (DISALLOWED_ENTRYPOINTS.has(entrypoint)) {
          context.report({
            node: node.source,
            messageId: 'preferRootEntrypoint',
            data: { entrypoint },
          });
        } else if (entrypoint === IONIC_ANGULAR_ENTRYPOINT) {
          context.report({
            node: node.source,
            messageId: 'noIonicModule',
          });
        }
      },
      MemberExpression(node) {
        if (node.object.type !== 'Identifier') {
          return;
        }

        const ionicNamespace = ionicNamespaces.get(node.object.name);
        if (!ionicNamespace) {
          return;
        }

        let scope: TSESLint.Scope.Scope | null = sourceCode.getScope(node);
        let resolvedVariable: TSESLint.Scope.Variable | undefined;
        while (scope) {
          resolvedVariable = scope.set.get(node.object.name);
          if (resolvedVariable) {
            break;
          }
          scope = scope.upper;
        }
        if (resolvedVariable !== ionicNamespace) {
          return;
        }

        const propertyName =
          node.property.type === 'Identifier' && !node.computed
            ? node.property.name
            : node.property.type === 'Literal' && typeof node.property.value === 'string'
              ? node.property.value
              : undefined;
        if (propertyName === 'IonicModule') {
          context.report({
            node,
            messageId: 'noIonicModule',
          });
        }
      },
    };
  },
};

export = rule;
