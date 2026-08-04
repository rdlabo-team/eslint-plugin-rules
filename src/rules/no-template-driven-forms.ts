import { TSESLint, TSESTree } from '@typescript-eslint/utils';

interface RuleOptions {
  allowedElements?: string[];
}

interface TemplateNode {
  type: string;
  name?: string;
  loc: TSESTree.SourceLocation;
  children?: TemplateNode[];
  branches?: TemplateNode[];
  cases?: TemplateNode[];
  inputs?: TemplateNode[];
  attributes?: TemplateNode[];
  references?: TemplateNode[];
  value?: string;
}

type MessageIds = 'templateDrivenForms' | 'templateDrivenFormsDirective';

function visitElements(nodes: TemplateNode[] | undefined, visit: (node: TemplateNode) => void): void {
  for (const node of nodes ?? []) {
    if (node.type === 'Element') {
      visit(node);
    }
    visitElements(node.children, visit);
    visitElements(node.branches, visit);
    visitElements(node.cases, visit);
  }
}

const rule: TSESLint.RuleModule<MessageIds, [RuleOptions?]> = {
  defaultOptions: [{ allowedElements: [] }],
  meta: {
    docs: {
      description: 'Disallow template-driven forms except `ngModel` bindings on explicitly allowed elements.',
      url: '',
    },
    messages: {
      templateDrivenForms: '`ngModel` is not allowed on <{{element}}>. Use Signal Forms, or explicitly allow this element for an Ionic View binding.',
      templateDrivenFormsDirective: '`{{directive}}` is a Template-driven Forms directive. Use Signal Forms instead.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedElements: {
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
  create(context) {
    const allowedElements = new Set(context.options[0]?.allowedElements ?? []);
    return {
      Program(node) {
        const templateNodes = (node as unknown as { templateNodes?: TemplateNode[] }).templateNodes;
        visitElements(templateNodes, (element) => {
          const attributes = [...(element.inputs ?? []), ...(element.attributes ?? [])];
          const hasNgModel = attributes.some((attribute) => attribute.name === 'ngModel');
          if (hasNgModel && element.name && !allowedElements.has(element.name)) {
            context.report({
              node: element as unknown as TSESTree.Node,
              loc: element.loc,
              messageId: 'templateDrivenForms',
              data: { element: element.name },
            });
          }
          for (const attribute of attributes) {
            if (attribute.name === 'ngModelGroup' || attribute.name === 'ngForm') {
              context.report({
                node: attribute as unknown as TSESTree.Node,
                loc: attribute.loc,
                messageId: 'templateDrivenFormsDirective',
                data: { directive: attribute.name },
              });
            }
          }
          for (const reference of element.references ?? []) {
            if (reference.value === 'ngForm') {
              context.report({
                node: element as unknown as TSESTree.Node,
                loc: element.loc,
                messageId: 'templateDrivenFormsDirective',
                data: { directive: 'ngForm' },
              });
            }
          }
        });
      },
    };
  },
};

export = rule;
