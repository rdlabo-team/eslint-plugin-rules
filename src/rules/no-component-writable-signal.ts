import { TSESLint, TSESTree } from '@typescript-eslint/utils';

type MessageIds = 'componentWritableSignal';

function importedName(node: TSESTree.Identifier | TSESTree.StringLiteral): string {
  return node.type === 'Identifier' ? node.name : node.value;
}

function propertyName(node: TSESTree.PropertyDefinition): string | null {
  if (node.key.type === 'Identifier' || node.key.type === 'PrivateIdentifier') {
    return node.key.name;
  }
  if (node.key.type === 'Literal' && typeof node.key.value === 'string') {
    return node.key.value;
  }
  return null;
}

function thisPropertyName(node: TSESTree.Node | null | undefined): string | null {
  if (!node || node.type !== 'MemberExpression' || node.object.type !== 'ThisExpression') {
    return null;
  }
  if (!node.computed && (node.property.type === 'Identifier' || node.property.type === 'PrivateIdentifier')) {
    return node.property.name;
  }
  if (node.computed && node.property.type === 'Literal' && typeof node.property.value === 'string') {
    return node.property.value;
  }
  return null;
}

function isImportedCallee(
  callee: TSESTree.Expression,
  importedNames: ReadonlySet<string>,
  namespaces: ReadonlySet<string>,
  exportedNames: ReadonlySet<string>,
): boolean {
  if (callee.type === 'Identifier') {
    return importedNames.has(callee.name);
  }
  return (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.object.type === 'Identifier' &&
    namespaces.has(callee.object.name) &&
    callee.property.type === 'Identifier' &&
    exportedNames.has(callee.property.name)
  );
}

const rule: TSESLint.RuleModule<MessageIds, []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Keep writable component state in ViewModel, except models passed to Angular Signal Forms `form()`.',
      url: '',
    },
    messages: {
      componentWritableSignal:
        'Component writable Signal `{{name}}` must move to ViewModel. Only a Signal passed to Signal Forms `form()` may remain on Component.',
    },
    schema: [],
    type: 'problem',
  },
  create(context) {
    const componentNames = new Set<string>();
    const writableSignalNames = new Set<string>();
    const formNames = new Set<string>();
    const coreNamespaces = new Set<string>();
    const signalFormsNamespaces = new Set<string>();

    function isComponentClass(node: TSESTree.ClassDeclaration): boolean {
      return (
        node.decorators?.some(
          (decorator) =>
            decorator.expression.type === 'CallExpression' &&
            isImportedCallee(decorator.expression.callee, componentNames, coreNamespaces, new Set(['Component'])),
        ) ?? false
      );
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value === '@angular/core') {
          for (const specifier of node.specifiers) {
            if (specifier.type === 'ImportNamespaceSpecifier') {
              coreNamespaces.add(specifier.local.name);
            } else if (specifier.type === 'ImportSpecifier') {
              const name = importedName(specifier.imported);
              if (name === 'Component') {
                componentNames.add(specifier.local.name);
              } else if (name === 'signal' || name === 'linkedSignal') {
                writableSignalNames.add(specifier.local.name);
              }
            }
          }
        }
        if (node.source.value === '@angular/forms/signals') {
          for (const specifier of node.specifiers) {
            if (specifier.type === 'ImportNamespaceSpecifier') {
              signalFormsNamespaces.add(specifier.local.name);
            } else if (specifier.type === 'ImportSpecifier' && importedName(specifier.imported) === 'form') {
              formNames.add(specifier.local.name);
            }
          }
        }
      },
      'ClassDeclaration:exit'(node) {
        if (!isComponentClass(node)) {
          return;
        }

        const writableSignals = new Map<string, TSESTree.PropertyDefinition>();
        const formModels = new Set<string>();

        for (const member of node.body.body) {
          if (member.type !== 'PropertyDefinition') {
            continue;
          }
          const name = propertyName(member);
          if (
            name &&
            member.value?.type === 'CallExpression' &&
            isImportedCallee(member.value.callee, writableSignalNames, coreNamespaces, new Set(['signal', 'linkedSignal']))
          ) {
            writableSignals.set(name, member);
          }
          if (member.value?.type === 'CallExpression' && isImportedCallee(member.value.callee, formNames, signalFormsNamespaces, new Set(['form']))) {
            const modelName = thisPropertyName(member.value.arguments[0] as TSESTree.Node | undefined);
            if (modelName) {
              formModels.add(modelName);
            }
          }
        }

        for (const [name, member] of writableSignals) {
          if (!formModels.has(name)) {
            context.report({ node: member.key, messageId: 'componentWritableSignal', data: { name } });
          }
        }
      },
    };
  },
};

export = rule;
