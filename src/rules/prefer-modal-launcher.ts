import { TSESLint, TSESTree } from '@typescript-eslint/utils';

interface RuleOptions {
  presentMethodNames?: string[];
  launcherNamePattern?: string;
}

const DEFAULT_PRESENT_METHODS = ['presentModal'];
const DEFAULT_LAUNCHER_PATTERN = '^launch';

const rule: TSESLint.RuleModule<'preferModalLauncher', [RuleOptions?]> = {
  defaultOptions: [
    {
      presentMethodNames: DEFAULT_PRESENT_METHODS,
      launcherNamePattern: DEFAULT_LAUNCHER_PATTERN,
    },
  ],
  meta: {
    docs: {
      description: 'Require `presentModal` calls to live inside a `launch*` launcher function.',
      url: '',
    },
    messages: {
      preferModalLauncher:
        'Call `{{method}}` only inside a launcher function matching `/{{pattern}}/`. Export `launchXxxPage(helper, props)` from the modal page and use that at call sites.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          presentMethodNames: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
          launcherNamePattern: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'suggestion',
  },
  create(context: TSESLint.RuleContext<'preferModalLauncher', [RuleOptions?]>) {
    const options = context.options[0] ?? {};
    const presentMethodNames = new Set(options.presentMethodNames ?? DEFAULT_PRESENT_METHODS);
    const launcherPattern = new RegExp(options.launcherNamePattern ?? DEFAULT_LAUNCHER_PATTERN);

    function getPresentMethodName(node: TSESTree.CallExpression): string | null {
      if (node.callee.type === 'Identifier' && presentMethodNames.has(node.callee.name)) {
        return node.callee.name;
      }
      if (
        node.callee.type === 'MemberExpression' &&
        !node.callee.computed &&
        node.callee.property.type === 'Identifier' &&
        presentMethodNames.has(node.callee.property.name)
      ) {
        return node.callee.property.name;
      }
      return null;
    }

    function nameMatchesLauncher(name: string | null | undefined): boolean {
      return typeof name === 'string' && launcherPattern.test(name);
    }

    function isInsideLauncher(node: TSESTree.Node): boolean {
      let current: TSESTree.Node | undefined = node.parent;
      while (current) {
        if (current.type === 'FunctionDeclaration' && nameMatchesLauncher(current.id?.name)) {
          return true;
        }

        if (current.type === 'FunctionExpression' && nameMatchesLauncher(current.id?.name)) {
          return true;
        }

        if (current.type === 'ArrowFunctionExpression' || current.type === 'FunctionExpression') {
          const parent = current.parent;
          if (parent?.type === 'VariableDeclarator' && parent.id.type === 'Identifier' && nameMatchesLauncher(parent.id.name)) {
            return true;
          }
          if (
            (parent?.type === 'Property' || parent?.type === 'PropertyDefinition' || parent?.type === 'MethodDefinition') &&
            parent.key.type === 'Identifier' &&
            nameMatchesLauncher(parent.key.name)
          ) {
            return true;
          }
          if (parent?.type === 'AssignmentExpression' && parent.left.type === 'Identifier' && nameMatchesLauncher(parent.left.name)) {
            return true;
          }
        }

        if (current.type === 'MethodDefinition' && current.key.type === 'Identifier' && nameMatchesLauncher(current.key.name)) {
          return true;
        }

        current = current.parent;
      }
      return false;
    }

    return {
      CallExpression(node: TSESTree.CallExpression) {
        const method = getPresentMethodName(node);
        if (!method) {
          return;
        }
        if (isInsideLauncher(node)) {
          return;
        }

        context.report({
          node,
          messageId: 'preferModalLauncher',
          data: {
            method,
            pattern: options.launcherNamePattern ?? DEFAULT_LAUNCHER_PATTERN,
          },
        });
      },
    };
  },
};

export = rule;
