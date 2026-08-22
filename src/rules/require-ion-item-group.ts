import { TSESLint } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { isRenderedElement, isRenderedText, isTransparentTemplateStructure, type TemplateAstNode, visitTemplateChildren } from './template-ast-utils';

const DIRECT_ITEM_GROUPS = new Set(['ion-item-group', 'ion-reorder-group', 'ion-radio-group']);

type MessageIds = 'requireIonItemGroup' | 'wrapIonItemGroup';

const rule: TSESLint.RuleModule<MessageIds, []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Require ion-item elements in ion-list to be wrapped by a supported Ionic item group.',
      url: '',
    },
    messages: {
      requireIonItemGroup:
        'ion-item inside ion-list must be wrapped by ion-item-group, ion-reorder-group, ion-radio-group, or ion-accordion within ion-accordion-group.',
      wrapIonItemGroup: 'Wrap the list items in ion-item-group. Add IonItemGroup to the component imports if needed.',
    },
    schema: [],
    type: 'problem',
    fixable: 'code',
    hasSuggestions: true,
  },
  create(context) {
    const isHtmlFile = (filename: string) => filename.includes('.html') && !filename.includes('.spec');

    const containsElement = (nodes: TemplateAstNode[] | undefined, name: string): boolean => {
      for (const node of nodes ?? []) {
        if (isRenderedElement(node) && node.name === name) {
          return true;
        }
        let found = false;
        visitTemplateChildren(node, (children) => {
          found ||= containsElement(children, name);
        });
        if (found) {
          return true;
        }
      }
      return false;
    };

    const renderedRoots = (nodes: TemplateAstNode[] | undefined): TemplateAstNode[] => {
      const roots: TemplateAstNode[] = [];
      for (const node of nodes ?? []) {
        if (isRenderedElement(node) || isRenderedText(node) || !isTransparentTemplateStructure(node)) {
          roots.push(node);
        } else {
          visitTemplateChildren(node, (children) => {
            roots.push(...renderedRoots(children));
          });
        }
      }
      return roots;
    };

    const groupableListRange = (list: TemplateAstNode): TSESTree.Range | undefined => {
      const roots = renderedRoots(list.children);
      if (
        roots.length === 0 ||
        roots.some((node) => !isRenderedElement(node) || node.name !== 'ion-item') ||
        roots.some((node) => containsElement(node.children, 'ion-item')) ||
        containsElement(list.children, 'ion-list') ||
        !list.startSourceSpan ||
        !list.endSourceSpan
      ) {
        return undefined;
      }
      return [list.startSourceSpan.end.offset, list.endSourceSpan.start.offset];
    };

    const wrapListContents = (range: TSESTree.Range): string => `<ion-item-group>${context.sourceCode.text.slice(...range)}</ion-item-group>`;

    const nearestListIndex = (ancestors: TemplateAstNode[]): number => {
      for (let index = ancestors.length - 1; index >= 0; index -= 1) {
        if (ancestors[index].name === 'ion-list') {
          return index;
        }
      }
      return -1;
    };

    function visit(
      nodes: TemplateAstNode[] | undefined,
      ancestors: TemplateAstNode[],
      templateHasItemGroup: boolean,
      handledLists: Set<TemplateAstNode>,
    ): void {
      for (const node of nodes ?? []) {
        const nextAncestors = isRenderedElement(node) && node.name ? [...ancestors, node] : ancestors;

        if (isRenderedElement(node) && node.name === 'ion-item') {
          const listIndex = nearestListIndex(ancestors);
          if (listIndex >= 0) {
            const nearestList = ancestors[listIndex];
            const elementsAfterList = ancestors.slice(listIndex + 1).map((ancestor) => ancestor.name);
            const hasDirectItemGroup = elementsAfterList.length === 1 && DIRECT_ITEM_GROUPS.has(elementsAfterList[0] ?? '');
            const hasAccordionGroup =
              elementsAfterList.length === 2 && elementsAfterList[0] === 'ion-accordion-group' && elementsAfterList[1] === 'ion-accordion';
            const hasRequiredStructure = hasDirectItemGroup || hasAccordionGroup;

            if (!hasRequiredStructure) {
              const reportNode = node as unknown as TSESTree.Node;
              const groupRange = elementsAfterList.length === 0 ? groupableListRange(nearestList) : undefined;
              const canOfferGroup = groupRange && !handledLists.has(nearestList);
              if (canOfferGroup) {
                handledLists.add(nearestList);
              }
              context.report({
                node: reportNode,
                loc: node.loc,
                messageId: 'requireIonItemGroup',
                fix: canOfferGroup && templateHasItemGroup ? (fixer) => fixer.replaceTextRange(groupRange, wrapListContents(groupRange)) : undefined,
                suggest:
                  canOfferGroup && !templateHasItemGroup
                    ? [
                        {
                          messageId: 'wrapIonItemGroup',
                          fix: (fixer) => fixer.replaceTextRange(groupRange, wrapListContents(groupRange)),
                        },
                      ]
                    : undefined,
              });
            }
          }
        }

        visitTemplateChildren(node, (children) => {
          visit(children, nextAncestors, templateHasItemGroup, handledLists);
        });
      }
    }

    return {
      Program(node) {
        if (!isHtmlFile(context.filename)) {
          return;
        }

        const templateNodes = (node as unknown as { templateNodes?: TemplateAstNode[] }).templateNodes;
        visit(templateNodes, [], containsElement(templateNodes, 'ion-item-group'), new Set());
      },
    };
  },
};

export = rule;
