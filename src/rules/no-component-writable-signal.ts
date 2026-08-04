import { TSESLint, TSESTree } from '@typescript-eslint/utils';

type MessageIds = 'componentWritableSignal';

function importedName(node: TSESTree.Identifier | TSESTree.StringLiteral): string {
  return node.type === 'Identifier' ? node.name : node.value;
}

function isComponentClass(node: TSESTree.ClassDeclaration): boolean {
  return (
    node.decorators?.some(
      (decorator) =>
        decorator.expression.type === 'CallExpression' && decorator.expression.callee.type === 'Identifier' && decorator.expression.callee.name === 'Component',
    ) ?? false
  );
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

function walk(node: unknown, visit: (candidate: TSESTree.Node) => void): void {
  if (!node || typeof node !== 'object') {
    return;
  }
  const candidate = node as Partial<TSESTree.Node> & Record<string, unknown>;
  if (typeof candidate.type === 'string') {
    visit(candidate as TSESTree.Node);
  }
  for (const [key, value] of Object.entries(candidate)) {
    if (key === 'parent' || key === 'loc' || key === 'range') {
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => walk(item, visit));
    } else if (value && typeof value === 'object') {
      walk(value, visit);
    }
  }
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
    let signalName = 'signal';
    let formName = 'form';

    return {
      ImportDeclaration(node) {
        if (node.source.value === '@angular/core') {
          for (const specifier of node.specifiers) {
            if (specifier.type === 'ImportSpecifier' && importedName(specifier.imported) === 'signal') {
              signalName = specifier.local.name;
            }
          }
        }
        if (node.source.value === '@angular/forms/signals') {
          for (const specifier of node.specifiers) {
            if (specifier.type === 'ImportSpecifier' && importedName(specifier.imported) === 'form') {
              formName = specifier.local.name;
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
          if (name && member.value?.type === 'CallExpression' && member.value.callee.type === 'Identifier' && member.value.callee.name === signalName) {
            writableSignals.set(name, member);
          }
        }

        walk(node.body, (candidate) => {
          if (candidate.type !== 'CallExpression' || candidate.callee.type !== 'Identifier' || candidate.callee.name !== formName) {
            return;
          }
          const name = thisPropertyName(candidate.arguments[0] as TSESTree.Node | undefined);
          if (name) {
            formModels.add(name);
          }
        });

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
