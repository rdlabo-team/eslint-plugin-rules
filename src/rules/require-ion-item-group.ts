import { TSESLint } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

interface TemplateNode {
  name?: string;
  tagName?: string;
  value?: string;
  type: string;
  loc?: TSESTree.SourceLocation;
  sourceSpan?: { start: { offset: number }; end: { offset: number } };
  startSourceSpan?: { end: { offset: number } };
  endSourceSpan?: { start: { offset: number } };
  children?: TemplateNode[];
  inputs?: TemplateNode[];
  templateAttrs?: TemplateNode[];
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
const TRANSPARENT_CONTROL_FLOW_NODES = new Set([
  'DeferredBlock',
  'ForLoopBlock',
  'IfBlock',
  'IfBlockBranch',
  'SwitchBlock',
  'SwitchBlockCase',
  'SwitchBlockCaseGroup',
]);
const DYNAMIC_OUTLETS = new Set(['ngComponentOutlet', 'ngTemplateOutlet']);

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
    const isRenderedElement = (node: TemplateNode) => node.type.includes('Element') && node.name !== 'ng-container';
    const isRenderedText = (node: TemplateNode) => (node.type === 'Text' && Boolean(node.value?.trim())) || node.type.includes('BoundText');
    const hasDynamicOutlet = (node: TemplateNode) =>
      [...(node.inputs ?? []), ...(node.templateAttrs ?? [])].some((binding) => DYNAMIC_OUTLETS.has(binding.name ?? ''));
    const isTransparentStructure = (node: TemplateNode) =>
      (node.type === 'Text' && !node.value?.trim()) ||
      (node.type.includes('Element') && node.name === 'ng-container' && !hasDynamicOutlet(node)) ||
      (node.type === 'Template' && !hasDynamicOutlet(node)) ||
      TRANSPARENT_CONTROL_FLOW_NODES.has(node.type);

    const visitChildren = (node: TemplateNode, visit: (nodes: TemplateNode[] | undefined) => void): void => {
      visit(node.children);
      visit(node.branches);
      visit(node.cases);
      visit(node.groups);
      visit(node.then?.children);
      visit(node.else?.children);
      visit(node.empty?.children);
      visit(node.placeholder?.children);
      visit(node.loading?.children);
      visit(node.error?.children);
    };

    const containsElement = (nodes: TemplateNode[] | undefined, name: string): boolean => {
      for (const node of nodes ?? []) {
        if (isRenderedElement(node) && node.name === name) {
          return true;
        }
        let found = false;
        visitChildren(node, (children) => {
          found ||= containsElement(children, name);
        });
        if (found) {
          return true;
        }
      }
      return false;
    };

    const renderedRoots = (nodes: TemplateNode[] | undefined): TemplateNode[] => {
      const roots: TemplateNode[] = [];
      for (const node of nodes ?? []) {
        if (isRenderedElement(node) || isRenderedText(node) || !isTransparentStructure(node)) {
          roots.push(node);
        } else {
          visitChildren(node, (children) => {
            roots.push(...renderedRoots(children));
          });
        }
      }
      return roots;
    };

    const groupableListRange = (list: TemplateNode): TSESTree.Range | undefined => {
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

    const nearestListIndex = (ancestors: TemplateNode[]): number => {
      for (let index = ancestors.length - 1; index >= 0; index -= 1) {
        if (ancestors[index].name === 'ion-list') {
          return index;
        }
      }
      return -1;
    };

    function visit(nodes: TemplateNode[] | undefined, ancestors: TemplateNode[], templateHasItemGroup: boolean, handledLists: Set<TemplateNode>): void {
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

        visitChildren(node, (children) => {
          visit(children, nextAncestors, templateHasItemGroup, handledLists);
        });
      }
    }

    return {
      Program(node) {
        if (!isHtmlFile(context.filename)) {
          return;
        }

        const templateNodes = (node as unknown as { templateNodes?: TemplateNode[] }).templateNodes;
        visit(templateNodes, [], containsElement(templateNodes, 'ion-item-group'), new Set());
      },
    };
  },
};

export = rule;
