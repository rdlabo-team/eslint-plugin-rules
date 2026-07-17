import { TSESLint, TSESTree } from '@typescript-eslint/utils';

interface RuleOptions {
  deny?: string[];
}

const DEFAULT_DENY = ['ModalController', 'PopoverController'];

const rule: TSESLint.RuleModule<'denyOverlayCreate', [RuleOptions?]> = {
  defaultOptions: [{ deny: DEFAULT_DENY }],
  meta: {
    docs: {
      description: 'Disallow `.create()` on ModalController / PopoverController; open overlays via launchers instead.',
      url: '',
    },
    messages: {
      denyOverlayCreate: 'Do not call `{{controller}}.create()`. Open this overlay through a launcher (`launch*`) and shared `presentModal` / helper instead.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          deny: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'problem',
  },
  create(context: TSESLint.RuleContext<'denyOverlayCreate', [RuleOptions?]>) {
    const denySet = new Set(context.options[0]?.deny ?? DEFAULT_DENY);
    function isDeniedControllerType(node: TSESTree.Node | undefined): string | null {
      if (!node) {
        return null;
      }
      if (node.type === 'TSTypeReference' && node.typeName.type === 'Identifier') {
        return denySet.has(node.typeName.name) ? node.typeName.name : null;
      }
      return null;
    }

    function controllerFromInjectCall(node: TSESTree.CallExpression): string | null {
      if (node.callee.type !== 'Identifier' || node.callee.name !== 'inject') {
        return null;
      }
      const [firstArg] = node.arguments;
      if (firstArg?.type === 'Identifier' && denySet.has(firstArg.name)) {
        return firstArg.name;
      }
      return null;
    }

    function bindingNameFromPattern(node: TSESTree.Node): string | null {
      if (node.type === 'Identifier') {
        return node.name;
      }
      if (node.type === 'AssignmentPattern' && node.left.type === 'Identifier') {
        return node.left.name;
      }
      return null;
    }

    function controllerFromBindingNode(node: TSESTree.Node | undefined, init?: TSESTree.Expression | null): string | null {
      if (init?.type === 'CallExpression') {
        const controller = controllerFromInjectCall(init);
        if (controller) {
          return controller;
        }
      }
      if (node?.type === 'Identifier') {
        return isDeniedControllerType(node.typeAnnotation?.typeAnnotation);
      }
      if (node?.type === 'AssignmentPattern' && node.left.type === 'Identifier') {
        return isDeniedControllerType(node.left.typeAnnotation?.typeAnnotation);
      }
      if (node?.type === 'PropertyDefinition') {
        return isDeniedControllerType(node.typeAnnotation?.typeAnnotation);
      }
      return null;
    }

    function controllerFromIdentifier(node: TSESTree.Identifier): string | null {
      let scope: TSESLint.Scope.Scope | null = context.sourceCode.getScope(node);
      while (scope) {
        const variable = scope.set.get(node.name);
        if (variable) {
          for (const definition of variable.defs) {
            if (definition.type === 'Variable') {
              const controller = controllerFromBindingNode(definition.node.id, definition.node.init);
              if (controller) {
                return controller;
              }
            }
            if (definition.type === 'Parameter') {
              const controller = controllerFromBindingNode(definition.name);
              if (controller) {
                return controller;
              }
            }
          }
          return null;
        }
        scope = scope.upper;
      }
      return null;
    }

    function controllerFromThisProperty(node: TSESTree.MemberExpression): string | null {
      const property = node.property;
      if (node.computed || (property.type !== 'Identifier' && property.type !== 'PrivateIdentifier')) {
        return null;
      }

      let current: TSESTree.Node | undefined = node.parent;
      while (current && current.type !== 'ClassDeclaration' && current.type !== 'ClassExpression') {
        current = current.parent;
      }
      if (!current) {
        return null;
      }

      for (const member of current.body.body) {
        if (
          member.type === 'PropertyDefinition' &&
          (member.key.type === 'Identifier' || member.key.type === 'PrivateIdentifier') &&
          member.key.name === property.name
        ) {
          return controllerFromBindingNode(member, member.value);
        }

        if (member.type === 'MethodDefinition' && member.kind === 'constructor') {
          for (const param of member.value.params) {
            if (param.type !== 'TSParameterProperty') {
              continue;
            }
            const name = bindingNameFromPattern(param.parameter);
            if (name === property.name) {
              return controllerFromBindingNode(param.parameter);
            }
          }
        }
      }
      return null;
    }

    function resolveCreateReceiver(node: TSESTree.MemberExpression): string | null {
      // inject(ModalController).create()
      if (node.object.type === 'CallExpression') {
        const controller = controllerFromInjectCall(node.object);
        if (controller) {
          return controller;
        }
        return null;
      }

      // modalCtrl.create()
      if (node.object.type === 'Identifier') {
        return controllerFromIdentifier(node.object);
      }

      // this.modalCtrl.create() / this.#modalCtrl.create()
      if (node.object.type === 'MemberExpression' && !node.object.computed && node.object.object.type === 'ThisExpression') {
        const property = node.object.property;
        if (property.type === 'Identifier' || property.type === 'PrivateIdentifier') {
          return controllerFromThisProperty(node.object);
        }
      }

      return null;
    }

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type !== 'MemberExpression' || node.callee.computed) {
          return;
        }
        if (node.callee.property.type !== 'Identifier' || node.callee.property.name !== 'create') {
          return;
        }

        const receiver = resolveCreateReceiver(node.callee);
        if (!receiver) {
          return;
        }

        context.report({
          node,
          messageId: 'denyOverlayCreate',
          data: { controller: receiver },
        });
      },
    };
  },
};

export = rule;
