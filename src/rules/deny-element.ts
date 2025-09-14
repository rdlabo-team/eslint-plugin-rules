import { TSESLint } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils/dist/ts-estree';

interface TemplateNode {
  name: string;
  type: string;
  loc: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  children: TemplateNodes;
}
type TemplateNodes = TemplateNode[];
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
      denyElement:
        'HTML Template File has <{{ element }}>. This element is not allowed.',
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
      elements: [
        'ion-modal',
        'ion-popover',
        'ion-toast',
        'ion-alert',
        'ion-loading',
        'ion-picker',
        'ion-action-sheet',
      ],
    },
  ],
  create: (context) => {
    const isHtmlFile = (filename: string) =>
      !filename.includes('.spec') && filename.includes('.html');

    const isElementNode = (node: TemplateNode) => node.type.includes('Element');

    const checkElement = (node: TemplateNode, deniedElements: string[]) => {
      if (deniedElements.includes(node.name)) {
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

    const processNode = (node: TemplateNode, deniedElements: string[]) => {
      checkElement(node, deniedElements);
      node.children
        ?.filter(isElementNode)
        .forEach((child) => processNode(child, deniedElements));
    };

    return {
      Program(node) {
        const filename = context.filename;
        if (!isHtmlFile(filename)) return;

        const scheme = context.options.find(
          (option: Scheme) => option.elements
        );
        if (!scheme) {
          throw new Error(
            'elements is not defined. Please define elements using array.'
          );
        }

        const templateNodes: TemplateNodes = (
          node as unknown as {
            templateNodes: TemplateNodes;
          }
        ).templateNodes;

        templateNodes
          .filter(isElementNode)
          .forEach((node) => processNode(node, scheme.elements));
      },
    };
  },
};

export = rule;
