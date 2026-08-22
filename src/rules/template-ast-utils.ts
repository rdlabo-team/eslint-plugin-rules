import type { TSESTree } from '@typescript-eslint/utils';

export interface TemplateAstNode {
  type: string;
  name?: string;
  tagName?: string;
  value?: unknown;
  loc?: TSESTree.SourceLocation;
  sourceSpan?: {
    start: { offset?: number; line?: number; col?: number };
    end: { offset?: number; line?: number; col?: number };
  };
  startSourceSpan?: { end: { offset: number } };
  endSourceSpan?: { start: { offset: number } };
  children?: TemplateAstNode[];
  inputs?: TemplateAstNode[];
  attributes?: TemplateAstNode[];
  references?: TemplateAstNode[];
  templateAttrs?: TemplateAstNode[];
  outputs?: TemplateAstNode[];
  branches?: TemplateAstNode[];
  cases?: TemplateAstNode[];
  groups?: TemplateAstNode[];
  then?: { children?: TemplateAstNode[] };
  else?: { children?: TemplateAstNode[] };
  empty?: { children?: TemplateAstNode[] };
  placeholder?: { children?: TemplateAstNode[] };
  loading?: { children?: TemplateAstNode[] };
  error?: { children?: TemplateAstNode[] };
}

export const TRANSPARENT_CONTROL_FLOW_NODES: ReadonlySet<string> = new Set([
  'DeferredBlock',
  'ForLoopBlock',
  'IfBlock',
  'IfBlockBranch',
  'SwitchBlock',
  'SwitchBlockCase',
  'SwitchBlockCaseGroup',
]);

const DYNAMIC_OUTLETS = new Set(['ngComponentOutlet', 'ngTemplateOutlet']);
const CHILD_ARRAY_KEYS = ['children', 'branches', 'cases', 'groups'] as const;
const CHILD_BLOCK_KEYS = ['then', 'else', 'empty', 'placeholder', 'loading', 'error'] as const;

export function visitTemplateChildren(node: TemplateAstNode, visit: (nodes: TemplateAstNode[] | undefined) => void): void {
  for (const key of CHILD_ARRAY_KEYS) {
    visit(node[key]);
  }
  for (const key of CHILD_BLOCK_KEYS) {
    visit(node[key]?.children);
  }
}

export function walkTemplateNodes(
  nodes: TemplateAstNode[] | undefined,
  visit: (node: TemplateAstNode) => void,
  additionalArrayKeys: readonly ('attributes' | 'inputs' | 'outputs' | 'references' | 'templateAttrs')[] = [],
): void {
  const visited = new Set<TemplateAstNode>();

  const walk = (currentNodes: TemplateAstNode[] | undefined): void => {
    for (const node of currentNodes ?? []) {
      if (visited.has(node)) {
        continue;
      }
      visited.add(node);
      visit(node);
      visitTemplateChildren(node, walk);
      for (const key of additionalArrayKeys) {
        walk(node[key]);
      }
    }
  };

  walk(nodes);
}

export function isRenderedElement(node: TemplateAstNode): boolean {
  return node.type.includes('Element') && node.name !== 'ng-container';
}

export function isRenderedText(node: TemplateAstNode): boolean {
  return (node.type === 'Text' && typeof node.value === 'string' && Boolean(node.value.trim())) || node.type.includes('BoundText');
}

export function isTransparentTemplateStructure(node: TemplateAstNode): boolean {
  const bindings = [...(node.inputs ?? []), ...(node.templateAttrs ?? [])];
  const hasDynamicOutlet = bindings.some((binding) => DYNAMIC_OUTLETS.has(binding.name ?? ''));

  return (
    (node.type === 'Text' && (typeof node.value !== 'string' || !node.value.trim())) ||
    (node.type.includes('Element') && node.name === 'ng-container' && !hasDynamicOutlet) ||
    (node.type === 'Template' && !hasDynamicOutlet) ||
    TRANSPARENT_CONTROL_FLOW_NODES.has(node.type)
  );
}
