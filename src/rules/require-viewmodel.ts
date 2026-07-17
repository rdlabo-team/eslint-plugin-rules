import { TSESLint, TSESTree } from '@typescript-eslint/utils';

interface RuleOptions {
  viewModelClassName?: string;
  bannedApis?: string[];
  requireExtends?: boolean;
}

const DEFAULT_VIEW_MODEL_CLASS = 'ViewModel';
const DEFAULT_BANNED_APIS = ['viewChild', 'viewChildren', 'contentChild', 'contentChildren', 'effect', 'computed'];

type MessageIds =
  'missingViewModel' | 'viewModelMissingThis' | 'viewModelMissingSuper' | 'viewModelMissingExtends' | 'viewModelMissingReactiveHost' | 'bannedApiInViewModel';

const rule: TSESLint.RuleModule<MessageIds, [RuleOptions?]> = {
  defaultOptions: [
    {
      viewModelClassName: DEFAULT_VIEW_MODEL_CLASS,
      bannedApis: DEFAULT_BANNED_APIS,
      requireExtends: true,
    },
  ],
  meta: {
    docs: {
      description: 'Enforce Component `new ViewModel(this)`, ViewModel `ReactiveHost` / `super()`, and keep View APIs off ViewModel.',
      url: '',
    },
    messages: {
      missingViewModel: 'Component must own a ViewModel instance via `new {{viewModelClassName}}(this)`.',
      viewModelMissingThis: 'ViewModel must be constructed with the component instance: `new {{viewModelClassName}}(this)`.',
      viewModelMissingSuper: 'ViewModel constructor must call `super()`.',
      viewModelMissingExtends: 'ViewModel must extend a base class so `super()` is valid.',
      viewModelMissingReactiveHost: 'ViewModel must declare `readonly host: ReactiveHost<{{hostType}}>`.',
      bannedApiInViewModel: '`{{api}}` belongs on the Component, not on ViewModel. Keep viewChild / effect / computed (and other View APIs) out of ViewModel.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          viewModelClassName: { type: 'string' },
          bannedApis: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
          requireExtends: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    type: 'suggestion',
  },
  create(context: TSESLint.RuleContext<MessageIds, [RuleOptions?]>) {
    const options = context.options[0] ?? {};
    const viewModelClassName = options.viewModelClassName ?? DEFAULT_VIEW_MODEL_CLASS;
    const bannedApis = new Set(options.bannedApis ?? DEFAULT_BANNED_APIS);
    const requireExtends = options.requireExtends ?? true;

    function isComponentClass(node: TSESTree.ClassDeclaration): boolean {
      return (
        node.decorators?.some(
          (decorator) =>
            decorator.expression.type === 'CallExpression' &&
            decorator.expression.callee.type === 'Identifier' &&
            decorator.expression.callee.name === 'Component',
        ) ?? false
      );
    }

    function isViewModelClass(node: TSESTree.ClassDeclaration): boolean {
      return node.id?.name === viewModelClassName;
    }

    function isNewViewModel(node: TSESTree.Expression | null | undefined): node is TSESTree.NewExpression {
      return !!node && node.type === 'NewExpression' && node.callee.type === 'Identifier' && node.callee.name === viewModelClassName;
    }

    function hasThisAsFirstArgument(node: TSESTree.NewExpression): boolean {
      const [first] = node.arguments;
      return first?.type === 'ThisExpression';
    }

    function constructorHasSuper(ctor: TSESTree.MethodDefinition): boolean {
      const body = ctor.value.body;
      if (!body) {
        return false;
      }
      return body.body.some(
        (statement) =>
          statement.type === 'ExpressionStatement' && statement.expression.type === 'CallExpression' && statement.expression.callee.type === 'Super',
      );
    }

    function getConstructor(node: TSESTree.ClassDeclaration): TSESTree.MethodDefinition | undefined {
      return node.body.body.find((member): member is TSESTree.MethodDefinition => member.type === 'MethodDefinition' && member.kind === 'constructor');
    }

    function getHostTypeName(ctor: TSESTree.MethodDefinition | undefined): string {
      const parameter = ctor?.value.params[0];
      const firstParameter = parameter?.type === 'TSParameterProperty' ? parameter.parameter : parameter;
      if (!firstParameter || firstParameter.type !== 'Identifier') {
        return 'Component';
      }
      const typeAnnotation = firstParameter.typeAnnotation?.typeAnnotation;
      return typeAnnotation?.type === 'TSTypeReference' && typeAnnotation.typeName.type === 'Identifier' ? typeAnnotation.typeName.name : 'Component';
    }

    function hasReactiveHost(node: TSESTree.ClassDeclaration, hostType: string): boolean {
      return node.body.body.some((member) => {
        if (member.type !== 'PropertyDefinition' || member.key.type !== 'Identifier' || member.key.name !== 'host' || !member.readonly) {
          return false;
        }
        const annotation = member.typeAnnotation?.typeAnnotation;
        if (annotation?.type !== 'TSTypeReference' || annotation.typeName.type !== 'Identifier' || annotation.typeName.name !== 'ReactiveHost') {
          return false;
        }
        const [argument] = annotation.typeArguments?.params ?? [];
        return argument?.type === 'TSTypeReference' && argument.typeName.type === 'Identifier' && argument.typeName.name === hostType;
      });
    }

    function getBannedApiName(node: TSESTree.CallExpression): string | null {
      // viewChild('x'), computed(() => ...), effect(() => ...)
      if (node.callee.type === 'Identifier' && bannedApis.has(node.callee.name)) {
        return node.callee.name;
      }
      // viewChild.required('x')
      if (
        node.callee.type === 'MemberExpression' &&
        !node.callee.computed &&
        node.callee.object.type === 'Identifier' &&
        bannedApis.has(node.callee.object.name)
      ) {
        return node.callee.object.name;
      }
      return null;
    }

    function checkComponentOwnsViewModel(node: TSESTree.ClassDeclaration) {
      let foundValid = false;
      let foundInvalidThis: TSESTree.Node | null = null;

      for (const member of node.body.body) {
        if (member.type !== 'PropertyDefinition' || !member.value) {
          continue;
        }
        if (!isNewViewModel(member.value)) {
          continue;
        }
        if (hasThisAsFirstArgument(member.value)) {
          foundValid = true;
        } else {
          foundInvalidThis = member.value;
        }
      }

      if (foundValid) {
        return;
      }

      if (foundInvalidThis) {
        context.report({
          node: foundInvalidThis,
          messageId: 'viewModelMissingThis',
          data: { viewModelClassName },
        });
        return;
      }

      context.report({
        node: node.id ?? node,
        messageId: 'missingViewModel',
        data: { viewModelClassName },
      });
    }

    function checkViewModelConstructor(node: TSESTree.ClassDeclaration) {
      const ctor = getConstructor(node);
      const hostType = getHostTypeName(ctor);

      if (!hasReactiveHost(node, hostType)) {
        context.report({
          node: node.id ?? node,
          messageId: 'viewModelMissingReactiveHost',
          data: { hostType },
        });
      }

      if (requireExtends && !node.superClass) {
        context.report({
          node: node.id ?? node,
          messageId: 'viewModelMissingExtends',
        });
      }

      // `super()` is only meaningful when the class extends something.
      if (!node.superClass) {
        return;
      }

      if (!ctor) {
        context.report({
          node: node.id ?? node,
          messageId: 'viewModelMissingSuper',
        });
        return;
      }

      if (!constructorHasSuper(ctor)) {
        context.report({
          node: ctor.key,
          messageId: 'viewModelMissingSuper',
        });
      }
    }

    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration) {
        if (isComponentClass(node)) {
          checkComponentOwnsViewModel(node);
        }
        if (isViewModelClass(node)) {
          checkViewModelConstructor(node);
        }
      },

      CallExpression(node: TSESTree.CallExpression) {
        const api = getBannedApiName(node);
        if (!api) {
          return;
        }

        let current: TSESTree.Node | undefined = node.parent;
        while (current) {
          if (current.type === 'ClassDeclaration') {
            if (isViewModelClass(current)) {
              context.report({
                node,
                messageId: 'bannedApiInViewModel',
                data: { api },
              });
            }
            return;
          }
          current = current.parent;
        }
      },
    };
  },
};

export = rule;
