import { TSESLint } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

interface TemplateNode {
  name?: string;
  type: string;
  loc?: TSESTree.SourceLocation;
  children?: TemplateNode[];
  branches?: TemplateNode[];
  cases?: TemplateNode[];
  groups?: TemplateNode[];
  then?: { children?: TemplateNode[] };
  else?: { children?: TemplateNode[] };
  empty?: { children?: TemplateNode[] };
  placeholder?: { children?: TemplateNode[] };
  loading?: { children?: TemplateNode[] };
  error?: { children?: TemplateNode[] };
}

const DIRECT_ITEM_GROUPS = new Set(['ion-item-group', 'ion-reorder-group', 'ion-radio-group']);

const rule: TSESLint.RuleModule<'requireIonItemGroup', []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Require ion-item elements in ion-list to be wrapped by a supported Ionic item group.',
      url: '',
    },
    messages: {
      requireIonItemGroup:
        'ion-item inside ion-list must be wrapped by ion-item-group, ion-reorder-group, ion-radio-group, or ion-accordion within ion-accordion-group.',
    },
    schema: [],
    type: 'problem',
  },
  create(context) {
    const isHtmlFile = (filename: string) => filename.includes('.html') && !filename.includes('.spec');
    const isRenderedElement = (node: TemplateNode) => node.type.includes('Element') && node.name !== 'ng-container';

    function visit(nodes: TemplateNode[] | undefined, ancestors: string[]): void {
      for (const node of nodes ?? []) {
        const nextAncestors = isRenderedElement(node) && node.name ? [...ancestors, node.name] : ancestors;

        if (isRenderedElement(node) && node.name === 'ion-item') {
          const nearestListIndex = ancestors.lastIndexOf('ion-list');
          if (nearestListIndex >= 0) {
            const elementsAfterList = ancestors.slice(nearestListIndex + 1);
            const hasDirectItemGroup = elementsAfterList.length === 1 && DIRECT_ITEM_GROUPS.has(elementsAfterList[0]);
            const hasAccordionGroup =
              elementsAfterList.length === 2 && elementsAfterList[0] === 'ion-accordion-group' && elementsAfterList[1] === 'ion-accordion';
            const hasRequiredStructure = hasDirectItemGroup || hasAccordionGroup;

            if (!hasRequiredStructure) {
              context.report({
                node: node as unknown as TSESTree.Node,
                loc: node.loc,
                messageId: 'requireIonItemGroup',
              });
            }
          }
        }

        visit(node.children, nextAncestors);
        visit(node.branches, nextAncestors);
        visit(node.cases, nextAncestors);
        visit(node.groups, nextAncestors);
        visit(node.then?.children, nextAncestors);
        visit(node.else?.children, nextAncestors);
        visit(node.empty?.children, nextAncestors);
        visit(node.placeholder?.children, nextAncestors);
        visit(node.loading?.children, nextAncestors);
        visit(node.error?.children, nextAncestors);
      }
    }

    return {
      Program(node) {
        if (!isHtmlFile(context.filename)) {
          return;
        }

        const templateNodes = (node as unknown as { templateNodes?: TemplateNode[] }).templateNodes;
        visit(templateNodes, []);
      },
    };
  },
};

export = rule;
