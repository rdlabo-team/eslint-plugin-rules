import { TSESLint, TSESTree } from '@typescript-eslint/utils';

interface RuleOptions {
  viewModelClassName?: string;
  viewModelStoreClassName?: string;
  bannedApis?: string[];
}

const DEFAULT_VIEW_MODEL_CLASS = 'ViewModel';
const DEFAULT_VIEW_MODEL_STORE_CLASS = 'ViewModelStore';
const DEFAULT_BANNED_APIS = [
  'viewChild',
  'viewChildren',
  'contentChild',
  'contentChildren',
  'effect',
  'computed',
  'afterNextRender',
  'afterEveryRender',
  'afterRenderEffect',
];

type MessageIds =
  | 'missingViewModel'
  | 'viewModelMissingThis'
  | 'viewModelMissingStore'
  | 'viewModelInvalidStoreTypeArguments'
  | 'viewModelHostTypeMismatch'
  | 'viewModelInvalidConstructor'
  | 'viewModelOwnHost'
  | 'bannedApiInViewModel';

const rule: TSESLint.RuleModule<MessageIds, [RuleOptions?]> = {
  defaultOptions: [
    {
      viewModelClassName: DEFAULT_VIEW_MODEL_CLASS,
      viewModelStoreClassName: DEFAULT_VIEW_MODEL_STORE_CLASS,
      bannedApis: DEFAULT_BANNED_APIS,
    },
  ],
  meta: {
    docs: {
      description: 'Enforce Component `new ViewModel(this)`, `ViewModelStore<ComponentType, Keys>` inheritance, and keep View APIs off ViewModel.',
      url: '',
    },
    messages: {
      missingViewModel: 'Component must own a ViewModel instance via `new {{viewModelClassName}}(this)`.',
      viewModelMissingThis: 'ViewModel must be constructed with the component instance: `new {{viewModelClassName}}(this)`.',
      viewModelMissingStore: 'ViewModel must extend `{{viewModelStoreClassName}}<ComponentType>` or a typed ViewModel base that inherits from it.',
      viewModelInvalidStoreTypeArguments: 'The ViewModel base requires the Component host type as its first type argument.',
      viewModelHostTypeMismatch: 'ViewModelStore host type must match the Component that owns it: `{{expectedHostType}}`.',
      viewModelInvalidConstructor:
        'ViewModel constructor must receive `host: ComponentType` and pass that same value to `super(host)`. Omit the constructor when no setup is needed.',
      viewModelOwnHost: 'ViewModel must inherit `host` from ViewModelStore instead of declaring it again.',
      bannedApiInViewModel: '`{{api}}` belongs on the Component, not on ViewModel. Keep viewChild / effect / computed (and other View APIs) out of ViewModel.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          viewModelClassName: { type: 'string' },
          viewModelStoreClassName: { type: 'string' },
          bannedApis: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'suggestion',
  },
  create(context: TSESLint.RuleContext<MessageIds, [RuleOptions?]>) {
    const options = context.options[0] ?? {};
    const viewModelClassName = options.viewModelClassName ?? DEFAULT_VIEW_MODEL_CLASS;
    const viewModelStoreClassName = options.viewModelStoreClassName ?? DEFAULT_VIEW_MODEL_STORE_CLASS;
    const bannedApis = new Set(options.bannedApis ?? DEFAULT_BANNED_APIS);
    const componentHostTypes = new Set<string>();
    const viewModelClasses: TSESTree.ClassDeclaration[] = [];

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

    function getConstructor(node: TSESTree.ClassDeclaration): TSESTree.MethodDefinition | undefined {
      return node.body.body.find((member): member is TSESTree.MethodDefinition => member.type === 'MethodDefinition' && member.kind === 'constructor');
    }

    function hasValidConstructor(ctor: TSESTree.MethodDefinition, componentType: TSESTree.TypeNode | undefined): boolean {
      if (!componentType) {
        return false;
      }

      const [parameter] = ctor.value.params;
      if (parameter?.type !== 'Identifier' || !parameter.typeAnnotation) {
        return false;
      }

      const parameterType = parameter.typeAnnotation.typeAnnotation;
      if (context.sourceCode.getText(parameterType) !== context.sourceCode.getText(componentType)) {
        return false;
      }

      return (
        ctor.value.body?.body.some(
          (statement) =>
            statement.type === 'ExpressionStatement' &&
            statement.expression.type === 'CallExpression' &&
            statement.expression.callee.type === 'Super' &&
            statement.expression.arguments.length === 1 &&
            statement.expression.arguments[0]?.type === 'Identifier' &&
            statement.expression.arguments[0].name === parameter.name,
        ) ?? false
      );
    }

    function declaresHost(node: TSESTree.ClassDeclaration): TSESTree.PropertyDefinition | undefined {
      return node.body.body.find(
        (member): member is TSESTree.PropertyDefinition =>
          member.type === 'PropertyDefinition' && member.key.type === 'Identifier' && member.key.name === 'host',
      );
    }

    function isIntermediateViewModelBase(name: string): boolean {
      return name !== viewModelClassName && (name.endsWith('ViewModel') || name === 'ModelSearch');
    }

    function resolveDefaultHostType(node: TSESTree.ClassDeclaration, hostType: TSESTree.TypeNode): TSESTree.TypeNode {
      if (hostType.type !== 'TSTypeReference' || hostType.typeName.type !== 'Identifier') {
        return hostType;
      }

      const hostTypeName = hostType.typeName.name;
      const parameter = node.typeParameters?.params.find((candidate) => candidate.name.type === 'Identifier' && candidate.name.name === hostTypeName);
      return parameter?.default ?? hostType;
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
        if (node.id) {
          componentHostTypes.add(node.id.name);
        }
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

    function checkViewModelStore(node: TSESTree.ClassDeclaration) {
      const ctor = getConstructor(node);
      const ownHost = declaresHost(node);
      const superClassName = node.superClass?.type === 'Identifier' ? node.superClass.name : null;
      const extendsViewModelStore = superClassName === viewModelStoreClassName;
      const extendsIntermediateViewModel = superClassName !== null && isIntermediateViewModelBase(superClassName);
      const typeArguments = node.superTypeArguments?.params ?? [];

      if (!extendsViewModelStore && !extendsIntermediateViewModel) {
        context.report({
          node: node.id ?? node,
          messageId: 'viewModelMissingStore',
          data: { viewModelStoreClassName },
        });
      } else {
        const invalidTypeArgumentCount = typeArguments.length < 1 || (extendsViewModelStore && typeArguments.length > 2);
        if (invalidTypeArgumentCount) {
          context.report({
            node: node.superClass ?? node,
            messageId: 'viewModelInvalidStoreTypeArguments',
            data: { viewModelStoreClassName },
          });
        } else if (componentHostTypes.size > 0) {
          const hostType = context.sourceCode.getText(resolveDefaultHostType(node, typeArguments[0]));
          if (!componentHostTypes.has(hostType)) {
            context.report({
              node: typeArguments[0],
              messageId: 'viewModelHostTypeMismatch',
              data: { expectedHostType: [...componentHostTypes].join(' | ') },
            });
          }
        }
      }

      if (ctor && !hasValidConstructor(ctor, typeArguments[0])) {
        context.report({
          node: ctor.key,
          messageId: 'viewModelInvalidConstructor',
        });
      }

      if (ownHost) {
        context.report({
          node: ownHost.key,
          messageId: 'viewModelOwnHost',
        });
      }
    }

    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration) {
        if (isComponentClass(node)) {
          checkComponentOwnsViewModel(node);
        }
        if (isViewModelClass(node)) {
          viewModelClasses.push(node);
        }
      },

      'Program:exit'() {
        for (const viewModelClass of viewModelClasses) {
          checkViewModelStore(viewModelClass);
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
