import { TSESLint } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { type TemplateAstNode, walkTemplateNodes } from './template-ast-utils';
interface Scheme {
  elements: string[];
}

const rule: TSESLint.RuleModule<'denyElement', [Scheme]> = {
  meta: {
    docs: {
      description: 'This plugin disallows the use of certain HTML tags.',
      url: '',
    },
    fixable: undefined,
    messages: {
      denyElement: 'HTML Template File has <{{ element }}>. This element is not allowed.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          elements: {
            type: 'array',
          },
        },
        required: ['elements'],
      },
    ],
    type: 'problem',
  },
  defaultOptions: [
    {
      elements: ['ion-modal', 'ion-popover', 'ion-toast', 'ion-alert', 'ion-loading', 'ion-picker', 'ion-action-sheet'],
    },
  ],
  create: (context) => {
    const isHtmlFile = (filename: string) => !filename.includes('.spec') && filename.includes('.html');

    const checkElement = (node: TemplateAstNode, deniedElements: string[]) => {
      if (node.name && deniedElements.includes(node.name)) {
        context.report({
          node: node as unknown as TSESTree.Node,
          loc: node.loc,
          messageId: 'denyElement',
          data: {
            element: node.name,
          },
        });
      }
    };

    return {
      Program(node) {
        const filename = context.filename;
        if (!isHtmlFile(filename)) return;

        const scheme = context.options.find((option: Scheme) => option.elements);
        if (!scheme) {
          throw new Error('elements is not defined. Please define elements using array.');
        }

        const templateNodes = (
          node as unknown as {
            templateNodes: TemplateAstNode[];
          }
        ).templateNodes;
        walkTemplateNodes(templateNodes, (templateNode) => {
          if (templateNode.type.includes('Element')) {
            checkElement(templateNode, scheme.elements);
          }
        });
      },
    };
  },
};

export = rule;
