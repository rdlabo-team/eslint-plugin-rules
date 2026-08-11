import { ParserServices, ParserServicesWithTypeInformation, TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { Type } from 'typescript';
import { isIntrinsicAnyType, isIntrinsicUnknownType, isThenableType } from 'ts-api-utils';

type MessageIds = 'promiseNotAllowed' | 'rxjsNotAllowed' | 'signalContextNotAllowed' | 'tooManyLines';

interface RuleOptions {
  allowPromise?: boolean;
  allowRxjs?: boolean;
  allowInSignal?: boolean;
  maxLines?: number | false;
}

type Options = [RuleOptions?];

const DEFAULT_OPTIONS: Required<RuleOptions> = {
  allowPromise: false,
  allowRxjs: false,
  allowInSignal: false,
  maxLines: 3,
};

function isTraversalBoundary(node: TSESTree.Node): boolean {
  return (
    node.type === 'TryStatement' ||
    node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'ClassDeclaration' ||
    node.type === 'ClassExpression'
  );
}

function isRelevantExpression(
  node: TSESTree.Node,
): node is
  | TSESTree.Identifier
  | TSESTree.MemberExpression
  | TSESTree.CallExpression
  | TSESTree.NewExpression
  | TSESTree.ImportExpression
  | TSESTree.TaggedTemplateExpression {
  return (
    node.type === 'Identifier' ||
    node.type === 'MemberExpression' ||
    node.type === 'CallExpression' ||
    node.type === 'NewExpression' ||
    node.type === 'ImportExpression' ||
    node.type === 'TaggedTemplateExpression'
  );
}

function isUnsafeTopType(type: Type): boolean {
  return isIntrinsicAnyType(type) || isIntrinsicUnknownType(type);
}

function typeParts(type: Type): readonly Type[] {
  return type.isUnionOrIntersection() ? type.types : [type];
}

function declarationComesFromRxjs(type: Type): boolean {
  const symbols = [type.aliasSymbol, type.getSymbol()].filter((symbol) => symbol !== undefined);
  return symbols.some((symbol) =>
    symbol.declarations?.some((declaration) => {
      const fileName = declaration.getSourceFile().fileName.replace(/\\/g, '/');
      return fileName.includes('/node_modules/rxjs/');
    }),
  );
}

function hasTypeInformation(services: Partial<ParserServices> | null | undefined): services is ParserServicesWithTypeInformation {
  return Boolean(services?.program && services.esTreeNodeToTSNodeMap && services.tsNodeToESTreeNodeMap && services.getTypeAtLocation);
}

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [DEFAULT_OPTIONS],
  meta: {
    docs: {
      description: 'Restrict Promise, RxJS, Angular Signal contexts, and physical code lines inside try blocks.',
      url: '',
    },
    messages: {
      promiseNotAllowed:
        'Promise/thenable processing is not allowed inside a try block. Use a Promise error boundary such as `.catch()`; wrap the producer in `Promise.resolve().then()` when it may throw synchronously.',
      rxjsNotAllowed:
        'RxJS processing is not allowed inside a try block. Handle its error channel with `catchError()` or an explicit subscriber error handler.',
      signalContextNotAllowed:
        'A try block is not allowed inside an Angular `computed()` or `effect()` callback. Extract fallible synchronous work into a safe function outside the reactive context.',
      tooManyLines: 'This try block contains {{actual}} physical code lines; the configured maximum is {{max}}.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowPromise: { type: 'boolean' },
          allowRxjs: { type: 'boolean' },
          allowInSignal: { type: 'boolean' },
          maxLines: {
            anyOf: [
              { type: 'integer', minimum: 1 },
              { type: 'boolean', enum: [false] },
            ],
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'problem',
  },
  create(context) {
    const options = { ...DEFAULT_OPTIONS, ...context.options[0] };
    const sourceCode = context.sourceCode;
    const needsTypeInformation = !options.allowPromise || !options.allowRxjs;
    const parserServices = sourceCode.parserServices;
    const services = needsTypeInformation && hasTypeInformation(parserServices) ? parserServices : null;
    const checker = services?.program.getTypeChecker();
    const angularSignalCallbacks = new Set(['computed', 'effect']);
    const angularSignalNames = new Set<string>();
    const angularCoreNamespaces = new Set<string>();

    for (const statement of sourceCode.ast.body) {
      if (statement.type !== 'ImportDeclaration' || statement.source.value !== '@angular/core') {
        continue;
      }
      for (const specifier of statement.specifiers) {
        if (specifier.type === 'ImportNamespaceSpecifier') {
          angularCoreNamespaces.add(specifier.local.name);
        } else if (specifier.type === 'ImportSpecifier') {
          const importedName = specifier.imported.type === 'Identifier' ? specifier.imported.name : specifier.imported.value;
          if (angularSignalCallbacks.has(importedName)) {
            angularSignalNames.add(specifier.local.name);
          }
        }
      }
    }

    function isPromiseLike(node: TSESTree.Node, type: Type): boolean {
      if (!checker || !services || isUnsafeTopType(type)) {
        return false;
      }
      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      return isThenableType(checker, tsNode, type);
    }

    function isRxjsType(type: Type, seen = new Set<Type>()): boolean {
      if (isUnsafeTopType(type) || seen.has(type)) {
        return false;
      }
      seen.add(type);
      return typeParts(type).some((part) => {
        if (part !== type && isRxjsType(part, seen)) {
          return true;
        }
        if (declarationComesFromRxjs(part)) {
          return true;
        }
        return (part.getBaseTypes() ?? []).some((baseType) => isRxjsType(baseType, seen));
      });
    }

    function codeLineCount(block: TSESTree.BlockStatement): number {
      const tokens = sourceCode.getTokens(block, { includeComments: false });
      const codeLines = new Set<number>();

      // The first and last tokens are the try block's own braces. Braces inside
      // the block remain code and therefore count toward the physical line limit.
      for (const token of tokens.slice(1, -1)) {
        for (let line = token.loc.start.line; line <= token.loc.end.line; line += 1) {
          codeLines.add(line);
        }
      }
      return codeLines.size;
    }

    function isAngularSignalCall(node: TSESTree.Node | undefined): boolean {
      if (!node || node.type !== 'CallExpression') {
        return false;
      }
      if (node.callee.type === 'Identifier') {
        return angularSignalNames.has(node.callee.name);
      }
      return (
        node.callee.type === 'MemberExpression' &&
        !node.callee.computed &&
        node.callee.object.type === 'Identifier' &&
        angularCoreNamespaces.has(node.callee.object.name) &&
        node.callee.property.type === 'Identifier' &&
        angularSignalCallbacks.has(node.callee.property.name)
      );
    }

    function isInsideAngularSignalCallback(node: TSESTree.TryStatement): boolean {
      let current: TSESTree.Node | undefined = node.parent;
      while (current) {
        if (current.type === 'FunctionDeclaration' || current.type === 'FunctionExpression' || current.type === 'ArrowFunctionExpression') {
          const parent = current.parent;
          return parent?.type === 'CallExpression' && isAngularSignalCall(parent) && parent.arguments[0] === current;
        }
        if (current.type === 'ClassDeclaration' || current.type === 'ClassExpression') {
          return false;
        }
        current = current.parent;
      }
      return false;
    }

    function inspectTryBlock(block: TSESTree.BlockStatement): { promiseNode?: TSESTree.Node; rxjsNode?: TSESTree.Node } {
      let promiseNode: TSESTree.Node | undefined;
      let rxjsNode: TSESTree.Node | undefined;

      function visit(node: TSESTree.Node, isRoot = false): void {
        if (!isRoot && isTraversalBoundary(node)) {
          return;
        }

        if (!options.allowPromise && !promiseNode && node.type === 'AwaitExpression') {
          promiseNode = node;
        }

        if (services && checker && isRelevantExpression(node) && ((!options.allowPromise && !promiseNode) || (!options.allowRxjs && !rxjsNode))) {
          const type = services.getTypeAtLocation(node);
          if (!options.allowPromise && !promiseNode && isPromiseLike(node, type)) {
            promiseNode = node;
          }
          if (!options.allowRxjs && !rxjsNode && isRxjsType(type)) {
            rxjsNode = node;
          }
        }

        if ((!options.allowPromise && !promiseNode) || (!options.allowRxjs && !rxjsNode)) {
          const keys = sourceCode.visitorKeys[node.type] ?? [];
          const record = node as unknown as Record<string, unknown>;
          for (const key of keys) {
            const value = record[key];
            if (Array.isArray(value)) {
              for (const child of value) {
                if (child && typeof child === 'object' && 'type' in child) {
                  visit(child as TSESTree.Node);
                }
              }
            } else if (value && typeof value === 'object' && 'type' in value) {
              visit(value as TSESTree.Node);
            }
          }
        }
      }

      visit(block, true);
      return { promiseNode, rxjsNode };
    }

    return {
      TryStatement(node) {
        const { promiseNode, rxjsNode } = inspectTryBlock(node.block);

        if (!options.allowInSignal && isInsideAngularSignalCallback(node)) {
          context.report({ node, messageId: 'signalContextNotAllowed' });
        }

        if (promiseNode) {
          context.report({ node: promiseNode, messageId: 'promiseNotAllowed' });
        }
        if (rxjsNode) {
          context.report({ node: rxjsNode, messageId: 'rxjsNotAllowed' });
        }

        if (options.maxLines !== false) {
          const actual = codeLineCount(node.block);
          if (actual > options.maxLines) {
            context.report({
              node: node.block,
              messageId: 'tooManyLines',
              data: { actual, max: options.maxLines },
            });
          }
        }
      },
    };
  },
};

export = rule;
