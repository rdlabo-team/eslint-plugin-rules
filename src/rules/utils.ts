import type { TmplAstNode } from '@angular/compiler';
import type { TSESTree } from '@typescript-eslint/utils';

// locのlineを再帰的にずらす関数（BoundTextは3+(元の値-1)に補正）
export function shiftLocLine(node: TmplAstNode, offset: number) {
  if (!node || typeof node !== 'object') return;
  if ('sourceSpan' in node === false) return; // ParseSourceSpanなどは除外
  if ('loc' in node && node.loc) {
    if ('type' in node && node.type === 'BoundText') {
      (node.loc as { start: { line: number }; end: { line: number } }).start.line =
        3 + ((node.loc as { start: { line: number }; end: { line: number } }).start.line - 1);
      (node.loc as { start: { line: number }; end: { line: number } }).end.line =
        3 + ((node.loc as { start: { line: number }; end: { line: number } }).end.line - 1);
    } else {
      (node.loc as { start: { line: number }; end: { line: number } }).start.line += offset;
      (node.loc as { start: { line: number }; end: { line: number } }).end.line += offset;
    }
  }
  [
    'children',
    'branches',
    'cases',
    'block',
    'expression',
    'value',
    'props',
    'handlers',
    'template',
    'loading',
    'error',
    'exp',
    'trueExp',
    'falseExp',
    'left',
    'right',
    'receiver',
    'args',
  ].forEach((key) => {
    const value = node[key as keyof TmplAstNode];
    if (Array.isArray(value)) {
      value.forEach((child) => {
        if (
          typeof child === 'object' &&
          child !== null &&
          'sourceSpan' in child &&
          // ParseSourceSpan型はvisitを持たない
          'visit' in child
        ) {
          shiftLocLine(child as TmplAstNode, offset);
        }
      });
    } else if (value && typeof value === 'object' && 'sourceSpan' in value && 'visit' in value) {
      shiftLocLine(value as TmplAstNode, offset);
    }
  });
}

export const SIGNAL_TYPES = new Set(['signal', 'model', 'computed', 'linkedSignal', 'input', 'toSignal']);

export function isSignalType(name: string): boolean {
  return SIGNAL_TYPES.has(name);
}

// input.requiredのようなメソッドチェーンの検証
export function isSignalCallExpression(node: TSESTree.CallExpression): boolean {
  // signal('value'), input('value') など
  if (node.callee.type === 'Identifier' && isSignalType(node.callee.name)) {
    return true;
  }

  // input.required('value') など
  if (node.callee.type === 'MemberExpression' && node.callee.object.type === 'Identifier' && isSignalType(node.callee.object.name)) {
    return true;
  }

  return false;
}
